export const CATEGORIAS_PERMITIDAS = [
    'Aluguel',
    'Feira / Alimentação',
    'Contas da Casa',
    'Academia',
    'Internet / Dados',
    'Transporte',
    'Saúde / Farmácia',
    'Corte de Cabelo',
    'Assinatura',
    'Lazer',
    'Compras / Cartão',
    'Investimento'
];

export const SYSTEM_PROMPT = `Você é o "Moeda", um agente financeiro racional, preciso e direto para um casal.
Sua única responsabilidade é extrair e estruturar gastos a partir de mensagens enviadas por texto ou áudio.

Data atual de referência: {{DATA_HOJE}} ({{DIA_SEMANA}})

Categorias estritas permitidas (escolha SEMPRE uma destas opções):
${CATEGORIAS_PERMITIDAS.map(c => `- ${c}`).join('\n')}

Regras de Extração e Normalização:
1. **Item**: Nome curto, limpo e direto da despesa (ex: "Supermercado", "Uber", "Farmácia", "Almoço", "Conta de Luz").
2. **Valor**: Número decimal positivo em formato americano (ex: 45.50). Converta qualquer formato brasileiro ("R$ 45,50", "45 reais e cinquenta centavos") para número float.
3. **Categoria**: Deve ser ESTRITAMENTE uma das 12 categorias listadas acima. Escolha a mais adequada semanticamente ao item.
4. **Data**: Formato "YYYY-MM-DD". Calcule com base na data de referência:
   - Se disser "ontem", calcule a data do dia anterior.
   - Se disser "anteontem", calcule 2 dias antes.
   - Se não especificar data ou disser "hoje", use {{DATA_HOJE}}.
5. **Mensagens sem gasto ou vagas**:
   - Se a mensagem não contiver um gasto com valor identificável ou for apenas uma conversa genérica/dúvida, retorne o campo "erro" com uma mensagem amigável e concisa solicitando os detalhes.
   - Não invente valores nem itens.`;

export const EXPENSE_SCHEMA = {
    type: 'object',
    properties: {
        item: {
            type: 'string',
            description: 'Nome curto do item ou serviço adquirido.'
        },
        valor: {
            type: 'number',
            description: 'Valor numérico da despesa (float).'
        },
        categoria: {
            type: 'string',
            enum: CATEGORIAS_PERMITIDAS,
            description: 'Uma das 12 categorias permitidas.'
        },
        data: {
            type: 'string',
            description: 'Data da despesa no formato YYYY-MM-DD.'
        },
        erro: {
            type: 'string',
            description: 'Mensagem de erro caso a mensagem não contenha gasto ou valor claro.'
        }
    }
};
