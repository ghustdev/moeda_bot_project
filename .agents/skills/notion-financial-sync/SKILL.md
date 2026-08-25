---
name: notion-financial-sync
description: >-
  Provides procedures and patterns for synchronizing financial transactions with Notion databases
  using the @notionhq/client SDK, managing relations, rollups, and property schemas.
---

# Notion Financial Sync Skill

This skill guides the design, insertion, and querying of financial transaction databases in Notion using `@notionhq/client`.

## Database Schema: "Despesas"

The database must conform to the following properties:

| Column | Notion Type | API Schema Mapping |
| :--- | :--- | :--- |
| **`Item`** | `Title` | `{ title: [{ text: { content: data.item } }] }` |
| **`Valor`** | `Number` | `{ number: Number(data.valor) }` |
| **`Gategoria`** | `Select` | `{ select: { name: data.categoria } }` |
| **`Data exata`** | `Date` | `{ date: { start: data.data } }` |
| **`Mês`** | `Select` / `RichText` | `{ select: { name: monthName } }` |

## Authorized Categories (12 Fixed Tags)

1. `Aluguel`
2. `Feira / Alimentação`
3. `Contas da Casa`
4. `Academia`
5. `Internet / Dados`
6. `Transporte`
7. `Saúde / Farmácia`
8. `Corte de Cabelo`
9. `Assinatura`
10. `Lazer`
11. `Compras / Cartão`
12. `Investimento`

## Safe Insertion Pattern

```javascript
import { Client } from '@notionhq/client';

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const DESPESAS_DB = process.env.NOTION_DESPESAS_DB_ID;

export async function addExpenseToNotion(data) {
    const baseProperties = {
        'Item': { title: [{ text: { content: data.item } }] },
        'Valor': { number: Number(data.valor) },
        'Gategoria': { select: { name: data.categoria } },
        'Data exata': { date: { start: data.data } }
    };

    try {
        return await notion.pages.create({
            parent: { database_id: DESPESAS_DB },
            properties: {
                ...baseProperties,
                'Mês': { select: { name: data.mes } }
            }
        });
    } catch (error) {
        if (error.code === 'validation_error' && error.message?.includes('Mês')) {
            return await notion.pages.create({
                parent: { database_id: DESPESAS_DB },
                properties: {
                    ...baseProperties,
                    'Mês': { rich_text: [{ text: { content: data.mes } }] }
                }
            });
        }
        throw error;
    }
}
```

## Integration Checklist
- [ ] Ensure the Notion integration has been invited to the database (Page $\to$ `...` $\to$ *Connections* $\to$ Add integration).
- [ ] Confirm database ID is extracted from the URL prior to query parameters (`?v=`).

