import { Client } from '@notionhq/client';
import dotenv from 'dotenv';

dotenv.config();

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const DESPESAS_DB = process.env.NOTION_DESPESAS_DB_ID;

const MESES = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

/**
 * Converte data YYYY-MM-DD para o nome do mês em português (ex: "Agosto").
 * @param {string} dateString
 * @returns {string}
 */
export function getMonthName(dateString) {
    if (!dateString) return MESES[new Date().getMonth()];
    const parts = dateString.split('-');
    if (parts.length >= 2) {
        const monthIndex = parseInt(parts[1], 10) - 1;
        if (monthIndex >= 0 && monthIndex < 12) {
            return MESES[monthIndex];
        }
    }
    return MESES[new Date().getMonth()];
}

/**
 * Adiciona uma despesa na base de dados "Despesas" do Notion.
 * @param {Object} data
 * @param {string} data.item
 * @param {number} data.valor
 * @param {string} data.categoria
 * @param {string} data.data
 */
export async function addExpenseToNotion(data) {
    if (!DESPESAS_DB) {
        throw new Error('NOTION_DESPESAS_DB_ID não configurado no .env');
    }

    const monthName = getMonthName(data.data);

    const baseProperties = {
        'Item': {
            title: [{ text: { content: data.item } }]
        },
        'Valor': {
            number: Number(data.valor)
        },
        'Gategoria': {
            select: { name: data.categoria }
        },
        'Data exata': {
            date: { start: data.data }
        }
    };

    try {
        // Tenta com Mês como Select (padrão)
        return await notion.pages.create({
            parent: { database_id: DESPESAS_DB },
            properties: {
                ...baseProperties,
                'Mês': {
                    select: { name: monthName }
                }
            }
        });
    } catch (error) {
        // Fallback: se 'Mês' for rich_text / text na tabela do Notion
        if (error.code === 'validation_error' && error.message?.includes('Mês')) {
            return await notion.pages.create({
                parent: { database_id: DESPESAS_DB },
                properties: {
                    ...baseProperties,
                    'Mês': {
                        rich_text: [{ text: { content: monthName } }]
                    }
                }
            });
        }
        throw error;
    }
}

/**
 * Estrutura base para consultar saldo residual da categoria via Notion Rollup/Relation
 * @param {string} categoryName
 * @returns {Promise<number>}
 */
export async function getCategoryBalance(categoryName) {
    // Pode ser expandido para buscar da base "Controle Monetário Mensal"
    return 0;
}
