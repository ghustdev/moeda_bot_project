import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { SYSTEM_PROMPT, EXPENSE_SCHEMA } from "./prompt.js";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
const ai = new GoogleGenAI({ apiKey });

/**
 * Retorna a data e o dia da semana formatados para o contexto do prompt.
 */
function getDateContext() {
  const now = new Date();
  const today = now.toISOString().split("T")[0];
  const diasSemana = [
    "Domingo",
    "Segunda-feira",
    "Terça-feira",
    "Quarta-feira",
    "Quinta-feira",
    "Sexta-feira",
    "Sábado",
  ];
  const diaSemana = diasSemana[now.getDay()];
  return { today, diaSemana };
}

/**
 * Processa uma mensagem de texto ou áudio através do Gemini 2.5 Flash.
 * @param {Object} params
 * @param {string} [params.text] - Texto da mensagem (se for mensagem de texto)
 * @param {Buffer} [params.audioBuffer] - Buffer do áudio (se for áudio)
 * @param {string} [params.mimeType='audio/ogg'] - MimeType do áudio
 * @returns {Promise<{item?: string, valor?: number, categoria?: string, data?: string, erro?: string}>}
 */
export async function parseExpense({
  text,
  audioBuffer,
  mimeType = "audio/ogg",
}) {
  const { today, diaSemana } = getDateContext();
  const systemInstruction = SYSTEM_PROMPT.replace(
    "{{DATA_HOJE}}",
    today,
  ).replace("{{DIA_SEMANA}}", diaSemana);

  const contents = [];

  if (audioBuffer) {
    contents.push({
      inlineData: {
        mimeType,
        data: audioBuffer.toString("base64"),
      },
    });
    contents.push({
      text: "Analise este áudio e extraia os dados de gasto conforme as instruções do sistema.",
    });
  } else if (text) {
    contents.push({
      text: `Analise o seguinte texto e extraia os dados de gasto:\n"${text}"`,
    });
  } else {
    return { erro: "Nenhum conteúdo (texto ou áudio) foi fornecido." };
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: EXPENSE_SCHEMA,
        temperature: 0.1,
      },
    });

    const rawText = response.text?.trim();
    if (!rawText) {
      return { erro: "O modelo não retornou uma resposta válida." };
    }

    const parsed = JSON.parse(rawText);

    // Se o modelo retornou item e valor, garante que a data seja preenchida caso ausente
    if (parsed.valor && !parsed.data) {
      parsed.data = today;
    }

    return parsed;
  } catch (error) {
    console.error("Erro ao processar com Gemini 2.5 Flash:", error);
    return {
      erro: "Não foi possível processar a mensagem devido a um erro interno da IA.",
    };
  }
}
