---
name: whatsapp-baileys-automation
description: >-
  Provides best practices for managing WhatsApp connections, authentication, audio streams,
  and message routing with @whiskeysockets/baileys in Node.js.
---

# WhatsApp Baileys Automation Skill

This skill guides the implementation of persistent, reliable WhatsApp client bots using `@whiskeysockets/baileys`.

## Authentication & Persistence

- Always use `useMultiFileAuthState('auth_info_baileys')` to store credentials persistently.
- Listen to `sock.ev.on('creds.update', saveCreds)` to persist token refreshes immediately.

## Connection Lifecycle & Auto-Reconnect

```javascript
import { makeWASocket, useMultiFileAuthState, DisconnectReason } from '@whiskeysockets/baileys';
import pino from 'pino';

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
            if (shouldReconnect) {
                setTimeout(connectToWhatsApp, 3000);
            }
        }
    });

    return sock;
}
```

## In-Memory Audio Stream Handling

Avoid writing temporary files to disk. Instead, stream chunks directly into an in-memory buffer:

```javascript
import { downloadContentFromMessage } from '@whiskeysockets/baileys';

async function extractAudioBuffer(audioMessage) {
    const stream = await downloadContentFromMessage(audioMessage, 'audio');
    const chunks = [];
    for await (const chunk of stream) {
        chunks.push(chunk);
    }
    return Buffer.concat(chunks);
}
```

## Group Routing & Message Filtering

- Match `remoteJid` against `process.env.ALLOWED_GROUP_ID`.
- Ignore status broadcasts (`status@broadcast`) and messages from the bot itself (`msg.key.fromMe`).
- Send presence updates (`composing` or `recording`) to provide immediate feedback to the user while processing.

