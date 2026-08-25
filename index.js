import { makeWASocket, useMultiFileAuthState, downloadContentFromMessage, DisconnectReason } from '@whiskeysockets/baileys';
import pino from 'pino';
import dotenv from 'dotenv';
import { parseExpense } from './src/gemini.js';
import { addExpenseToNotion } from './src/notion.js';

dotenv.config();

const ALLOWED_GROUP_ID = process.env.ALLOWED_GROUP_ID;

/**
 * Conecta ao WhatsApp e inicializa o loop de eventos do bot.
 */
async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');

    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true,
        logger: pino({ level: 'silent' })
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === 'close') {
            const statusCode = lastDisconnect?.error?.output?.statusCode;
            const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
            console.log(`[WhatsApp] Conexão encerrada (Status: ${statusCode}). Reconectando: ${shouldReconnect}`);
            if (shouldReconnect) {
                setTimeout(connectToWhatsApp, 3000);
            }
        } else if (connection === 'open') {
            console.log('🚀 [Moeda Bot] Conectado ao WhatsApp e pronto para registrar gastos!');
            if (ALLOWED_GROUP_ID) {
                console.log(`🔒 [Filtro] Monitorando grupo: ${ALLOWED_GROUP_ID}`);
            } else {
                console.log('⚠️ [Aviso] ALLOWED_GROUP_ID não definido. O bot responderá a qualquer chat onde for chamado.');
            }
        }
    });

    sock.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const remoteJid = msg.key.remoteJid;

        // Se o grupo específico estiver configurado, ignora mensagens de outros chats
        if (ALLOWED_GROUP_ID && remoteJid !== ALLOWED_GROUP_ID) {
            return;
        }

        const messageType = Object.keys(msg.message)[0];
        let parsedData = null;

        try {
            // 1. Mensagens de Texto
            if (messageType === 'conversation' || messageType === 'extendedTextMessage') {
                const text = msg.message.conversation || msg.message.extendedTextMessage?.text || '';
                
                // Se não estiver em grupo restrito, só responde se chamado por "moeda"
                if (!ALLOWED_GROUP_ID && !text.toLowerCase().includes('moeda')) {
                    return;
                }

                console.log(`[Texto recebido] "${text}" de ${remoteJid}`);
                await sock.sendPresenceUpdate('composing', remoteJid);
                parsedData = await parseExpense({ text });
            } 
            // 2. Mensagens de Áudio (Processamento Multimodal Direto no Gemini)
            else if (messageType === 'audioMessage') {
                console.log(`[Áudio recebido] Processando fluxo de mídia de ${remoteJid}...`);
                await sock.sendPresenceUpdate('recording', remoteJid);

                const stream = await downloadContentFromMessage(msg.message.audioMessage, 'audio');
                const chunks = [];
                for await (const chunk of stream) {
                    chunks.push(chunk);
                }
                const audioBuffer = Buffer.concat(chunks);
                const mimeType = msg.message.audioMessage.mimetype?.split(';')[0] || 'audio/ogg';

                parsedData = await parseExpense({ audioBuffer, mimeType });
            } else {
                // Outro tipo de mensagem ignorado
                return;
            }

            // Tratamento de mensagens vagas ou sem valor identificado
            if (parsedData?.erro) {
                console.log('[Moeda Bot] Validação:', parsedData.erro);
                await sock.sendMessage(remoteJid, { text: `⚠️ ${parsedData.erro}` }, { quoted: msg });
                return;
            }

            if (!parsedData || !parsedData.item || typeof parsedData.valor !== 'number') {
                return;
            }

            console.log('[Moeda Bot] Despesa identificada:', parsedData);
            console.log('[Notion] Gravando em Despesas...');
            
            await addExpenseToNotion(parsedData);
            console.log('[Notion] Registro concluído com sucesso!');

            // Resposta formatada de confirmação
            const confirmationText = 
`💸 *Gasto Registrado!*

📝 *Item:* ${parsedData.item}
💵 *Valor:* R$ ${parsedData.valor.toFixed(2).replace('.', ',')}
🏷️ *Categoria:* ${parsedData.categoria}
📅 *Data:* ${parsedData.data}`;

            await sock.sendMessage(remoteJid, { text: confirmationText }, { quoted: msg });

        } catch (error) {
            console.error('❌ [Erro ao processar mensagem]:', error);
            await sock.sendMessage(
                remoteJid, 
                { text: '❌ Ocorreu um erro ao processar e registrar o seu gasto no Notion. Tente novamente.' }, 
                { quoted: msg }
            );
        }
    });
}

connectToWhatsApp();
