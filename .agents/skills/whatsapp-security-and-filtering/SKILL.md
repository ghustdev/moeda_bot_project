---
name: whatsapp-security-and-filtering
description: >-
  Provides security practices for WhatsApp bots, including group access control, input sanitization,
  prompt injection defense, and rate limiting.
---

# WhatsApp Bot Security & Access Control Skill

This skill enforces access controls, input sanitization, and abuse prevention for WhatsApp bots interacting with LLMs and database backends.

## 1. Strict Group Access Control

To prevent unauthorized users or external chats from triggering AI compute or inserting data into your Notion database:

- Always validate the incoming `remoteJid` against `ALLOWED_GROUP_ID`:
  ```javascript
  const remoteJid = msg.key.remoteJid;
  if (ALLOWED_GROUP_ID && remoteJid !== ALLOWED_GROUP_ID) {
    return; // Ignore silently
  }
  ```
- Reject broadcast messages (`status@broadcast`) and messages sent by the bot itself (`msg.key.fromMe`).

## 2. Input Sanitization & Prompt Injection Defense

WhatsApp users may unintentionally or maliciously send text designed to override LLM system rules.

- **System Instruction Isolation**: Pass system rules in the dedicated `systemInstruction` configuration of `@google/genai`, never concatenated directly in the user content string.
- **Structured Output Defense**: Using `responseMimeType: 'application/json'` and `responseSchema` forces the model to adhere to the schema regardless of injection attempts.
- **Length Boundaries**: Limit message text analysis to reasonable lengths ($< 1000$ characters) to prevent token abuse.

## 3. Financial Data Integrity & Validation

- Verify that `parsedData.valor` is a finite positive number before writing to Notion.
- Reject NaN, negative values, or zero amounts.
- Validate that `parsedData.categoria` belongs strictly to the authorized whitelist of 12 categories.
