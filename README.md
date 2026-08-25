# 🪙 Moeda — Agente Financeiro WhatsApp com IA

O **Moeda** é um agente financeiro passivo para casais e grupos no WhatsApp que elimina a fricção do registro manual de despesas. Utilizando inteligência multimodal de ponta (**Google Gemini 2.5 Flash**), ele compreende mensagens em texto e áudios nativos, extrai os detalhes financeiros e sincroniza automaticamente com o **Notion**, permitindo controle orçamentário em tempo real a custo zero.

---

## 🏗️ Arquitetura da Solução

```text
  [ WhatsApp (Texto / Áudio .ogg) ]
                 │
                 ▼
     [ WhatsApp Engine (Baileys) ]
                 │
                 ▼
  [ Gemini 2.5 Flash Multimodal ]
   - Processamento unificado (áudio + texto)
   - Structured JSON Output (responseSchema)
                 │
                 ▼
       [ Notion Database ]
   - Registro instantâneo em "Despesas"
   - Cálculo automático de saldo via Rollups / Relations
                 │
                 ▼
[ Confirmação Instantânea no WhatsApp ]
```

---

## 🛠️ Stack Tecnológica

* **Interface WhatsApp:** [`@whiskeysockets/baileys`](https://github.com/WhiskeySockets/Baileys) (WebSockets / Aparelho Vinculado)
* **Inteligência Artificial:** [Google Gen AI SDK (`@google/genai`)](https://www.npmjs.com/package/@google/genai) — **Gemini 2.5 Flash**
* **Persistência de Dados:** [`@notionhq/client`](https://github.com/makenotion/notion-sdk-js)
* **Gerenciamento de Processos:** PM2
* **Hospedagem Recomendada:** Google Cloud Compute Engine (`e2-micro` — Always Free)

---

## 📊 Especificação da Tabela "Despesas" no Notion

Certifique-se de que a base de dados **Despesas** no seu Notion possua as seguintes colunas:

| Coluna | Tipo no Notion | Descrição |
| :--- | :--- | :--- |
| **`Item`** | `Title` | Nome curto e objetivo do item/serviço |
| **`Valor`** | `Number` | Valor numérico (ponto flutuante) |
| **`Gategoria`** | `Select` | Uma das 12 tags fixas: `Aluguel`, `Feira / Alimentação`, `Contas da Casa`, `Academia`, `Internet / Dados`, `Transporte`, `Saúde / Farmácia`, `Corte de Cabelo`, `Assinatura`, `Lazer`, `Compras / Cartão`, `Investimento` |
| **`Data exata`** | `Date` | Data da compra no formato `YYYY-MM-DD` |
| **`Mês`** | `Select` ou `Text` | Nome do mês preenchido dinamicamente (ex: `Agosto`) |

> [!IMPORTANT]
> Lembre-se de convidar a sua integração do Notion para a base de dados: abra a página da tabela no Notion $\to$ clique nos **três pontos (`...`)** $\to$ **Conexões** $\to$ **Adicionar sua integração**.

---

## 🚀 Como Rodar Localmente

### 1. Pré-requisitos
* Node.js v18 ou superior instalado.
* Chave de API do **Google AI Studio** ([Obter chave](https://aistudio.google.com/app/apikey)).
* Token de Integração do **Notion** ([Criar integração](https://www.notion.so/my-integrations)).

### 2. Instalação
```bash
git clone https://github.com/ghustdev/moeda_bot_project.git
cd moeda_bot_project
npm install
```

### 3. Configuração do Ambiente
Copie o modelo de variáveis de ambiente:
```bash
cp .env.example .env
```
Preencha o arquivo `.env` com suas credenciais:
```env
GEMINI_API_KEY=sua_chave_do_google_ai_studio
NOTION_API_KEY=secret_seu_token_do_notion
NOTION_DESPESAS_DB_ID=seu_database_id_do_notion
ALLOWED_GROUP_ID=
```

### 4. Executando o Bot
```bash
npm start
```
1. Um **QR Code** será exibido no terminal.
2. Abra o WhatsApp no seu smartphone $\to$ **Aparelhos Conectados** $\to$ **Conectar um Aparelho** e escaneie o código.
3. Ao receber uma mensagem no grupo, o terminal exibirá o identificador (`remoteJid`).
4. Para travar o bot exclusivamente nesse grupo, adicione o ID em `ALLOWED_GROUP_ID` no `.env` e reinicie.

---

## ☁️ Deploy 24/7 no Google Cloud (Always Free)

Você pode hospedar o bot gratuitamente em uma VM `e2-micro` no **Google Cloud Compute Engine**:

1. **Criar Instância no GCP:**
   * Tipo de máquina: `e2-micro` (Disponível no nível gratuito nas regiões `us-central1`, `us-east1` ou `us-west1`).
   * Sistema Operacional: Ubuntu 22.04 LTS.
   * Disco: 30 GB Standard Persistent Disk (incluso no Always Free).

2. **Acessar a VM via SSH e instalar o Node.js & PM2:**
   ```bash
   sudo apt update && sudo apt upgrade -y
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt install -y nodejs git
   sudo npm install -g pm2
   ```

3. **Clonar e configurar o projeto:**
   ```bash
   git clone https://github.com/ghustdev/moeda_bot_project.git
   cd moeda_bot_project
   npm install
   nano .env # Cole as suas variáveis de ambiente
   ```

4. **Primeira Conexão (Autenticação QR Code):**
   ```bash
   npm start
   ```
   *Escaneie o QR Code e confirme que a pasta `auth_info_baileys` foi criada.* Pressione `Ctrl + C` para encerrar.

5. **Iniciar com PM2 (Execução Contínua):**
   ```bash
   pm2 start ecosystem.config.cjs
   pm2 save
   pm2 startup # Execute o comando gerado no terminal para persistir em reboots
   ```

6. **Monitorar Logs:**
   ```bash
   pm2 logs moeda-bot
   ```

---

## 📄 Licença
Distribuído sob a licença MIT. Sinta-se livre para usar e customizar!
