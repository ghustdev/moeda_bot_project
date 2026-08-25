---
name: gemini-multimodal-parser
description: >-
  Provides guidelines and implementation patterns for parsing financial expenses from text and audio
  messages using Google Gemini 2.5 Flash and the @google/genai SDK with structured JSON output.
---

# Gemini Multimodal Expense Parser Skill

This skill defines best practices for extracting structured expense data (item, value, category, date) from multimodal inputs (audio recordings and natural language text) using Google Gemini 2.5 Flash.

## Core Rules

1. **SDK Usage**: Always use `@google/genai` (never the deprecated `@google/generative-ai`).
2. **Model Selection**: Use `gemini-2.5-flash` for low latency, multimodal capability (audio + text in a single request), and structured output enforcement.
3. **Structured Outputs**: Always provide `responseMimeType: 'application/json'` and `responseSchema` in the `config` object.

## Multimodal Pipeline Pattern

### Single-Call Audio and Text Processing

```javascript
import { GoogleGenAI } from '@google/genai';
import { SYSTEM_PROMPT, EXPENSE_SCHEMA } from './prompt.js';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function parseExpense({ text, audioBuffer, mimeType = 'audio/ogg' }) {
    const contents = [];

    if (audioBuffer) {
        contents.push({
            inlineData: {
                mimeType,
                data: audioBuffer.toString('base64')
            }
        });
        contents.push({
            text: 'Analise este áudio e extraia os dados de gasto conforme as instruções do sistema.'
        });
    } else if (text) {
        contents.push({
            text: `Analise o seguinte texto e extraia os dados de gasto:\n"${text}"`
        });
    }

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents,
        config: {
            systemInstruction: SYSTEM_PROMPT,
            responseMimeType: 'application/json',
            responseSchema: EXPENSE_SCHEMA,
            temperature: 0.1
        }
    });

    return JSON.parse(response.text.trim());
}
```

## Prompt Normalization & Edge Cases

- **Currency Parsing**: Convert Brazilian real formats (`"R$ 35,90"`, `"35 reais e noventa centavos"`, `"35.9"`) to numeric floats (`35.9`).
- **Date Handling**: Inject current date context (`{{DATA_HOJE}}`) and resolve relative dates (*"ontem"* = $D-1$, *"anteontem"* = $D-2$).
- **Category Enforcement**: Force mapping strictly to the 12 authorized Notion tags.
- **Ambiguity Guard**: When no financial transaction is detected, return an `erro` field describing the clarification needed.

