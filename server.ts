import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialize Gemini client to prevent crash on startup if API key is not set
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      aiClient = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
    }
  }
  return aiClient;
}

// API: Actual Gemini client advisor for nail designers
app.post('/api/ai-consult', async (req, res) => {
  const { services, transactions, settings, summary } = req.body;

  const client = getGeminiClient();

  if (!client) {
    // If no API Key is available, return an intelligent rules-based fallback
    console.warn("GEMINI_API_KEY not found. Falling back to analytical rule engine.");
    return res.json(generateRuleBasedConsultation(services, transactions, settings, summary));
  }

  try {
    const prompt = `
      Você é um especialista em finanças para salões de beleza e Nail Designers autônomas brasileiras.
      Analise os dados reais do studio abaixo e retorne um relatório consultivo extremamente útil e prático.

      DADOS DO DESIGNER:
      - Nome do Studio: "${settings?.studioName || 'Studio'}"
      - Meta de Faturamento Mensal: R$ ${settings?.revenueGoal || 5000}
      - Meta de Lucro Mensal: R$ ${settings?.profitGoal || 3000}

      CATÁLOGO DE SERVIÇOS:
      ${JSON.stringify(services || [])}

      RESUMO FINANCEIRO ATUAL DO MÊS:
      - Faturamento Studio: R$ ${summary?.studioRevenue || 0}
      - Custos do Studio: R$ ${summary?.studioCosts || 0}
      - Lucro Líquido Real: R$ ${summary?.realProfit || 0}
      - Margem de Lucro: ${summary?.profitMargin?.toFixed(1) || 0}%
      - Saldo Financeiro Pessoal: R$ ${summary?.personalBalance || 0}

      TRANSAÇÕES DO MÊS (Amostra):
      ${JSON.stringify((transactions || []).slice(0, 15))}

      Por favor, formule de 3 a 4 insights claros e acionáveis sobre os dados, além de uma sugestão de precificação baseada em tempo e custo de material de cada serviço.
      Você precisa retornar o resultado estritamente em formato JSON válido seguindo exatamente essa estrutura:
      {
        "insights": [
          {
            "type": "success" | "warning" | "danger" | "info",
            "title": "título curto do insight",
            "text": "explicação breve, direta no ponto para uma profissional de unhas"
          }
        ],
        "suggestion": "Uma recomendação estratégica inteligente de 1-2 parágrafos especificamente voltada aos preços, gerenciamento de caixa pessoal x profissional, ou otimização de tempo de procedimento."
      }
    `;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["insights", "suggestion"],
          properties: {
            insights: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["type", "title", "text"],
                properties: {
                  type: { type: Type.STRING, description: "success, warning, danger or info" },
                  title: { type: Type.STRING },
                  text: { type: Type.STRING }
                }
              }
            },
            suggestion: { type: Type.STRING }
          }
        }
      }
    });

    const text = response.text || '';
    const result = JSON.parse(text);
    return res.json(result);

  } catch (error) {
    console.error("Erro ao chamar o Gemini:", error);
    // Return graceful analytic fallback if API call fails
    return res.json(generateRuleBasedConsultation(services, transactions, settings, summary));
  }
});

// Intelligent, rules-based analytical fallback in case Gemini is offline or not configured yet
function generateRuleBasedConsultation(services: any[], transactions: any[], settings: any, summary: any) {
  const calculatedProfit = (summary?.realProfit || 0);
  const profitMargin = (summary?.profitMargin || 0);
  const totalRevenue = (summary?.studioRevenue || 0);
  const totalCosts = (summary?.studioCosts || 0);

  const insights = [
    {
      type: 'success',
      title: 'Espaço de Margem Saudável',
      text: `Sua margem atual de lucro real é de ${profitMargin.toFixed(1)}%. Na área de Nail Design, manter acima de 50% garante excelente retorno operacional.`
    }
  ];

  if (totalCosts > totalRevenue * 0.4) {
    insights.push({
      type: 'warning',
      title: 'Custos Acima de 40%',
      text: 'Seus custos operacionais pesaram mais de 40% do faturamento. Avalie repor produtos em potes maiores ou otimizar o uso descartável.'
    });
  } else {
    insights.push({
      type: 'info',
      title: 'Controle de Insumos',
      text: 'Parabéns pelos custos operacionais moderados! Continue acompanhando as perdas de géis e brocas.'
    });
  }

  // Look for services with very low margin
  const lowMarginService = services.find(s => (s.price - s.materialCost) / s.price < 0.6);
  if (lowMarginService) {
    insights.push({
      type: 'danger',
      title: 'Alerta de Margem Baixa',
      text: `O serviço "${lowMarginService.name}" tem custo de material muito alto em relação ao preço cobrado. Considere reajustar.`
    });
  } else {
    insights.push({
      type: 'success',
      title: 'Precificação Inteligente',
      text: 'Seus procedimentos do catálogo apresentam ótimo índice de valor agregado.'
    });
  }

  // Personal account separation check
  const hasPersonalMix = transactions.some(t => t.isPersonal && t.category === 'retirada do negócio');
  if (hasPersonalMix) {
    insights.push({
      type: 'info',
      title: 'Organização Ativa',
      text: 'Registros de retiradas para finanças pessoais encontrados. Ótima disciplina de separação!'
    });
  } else {
    insights.push({
      type: 'warning',
      title: 'Mistura de Caixas',
      text: 'Se você faz compras de casa direto com dinheiro do studio sem registrar como retirada, seu faturamento real será distorcido.'
    });
  }

  return {
    insights,
    suggestion: `Dica de Ouro estratégica para o ${settings?.studioName || 'Studio'}: Para bater sua meta de R$ ${settings?.revenueGoal || '5000'} por mês, certifique-se de preencher a Ficha Técnica de Custos do materiais de cada alongamento. Services rápidos de alta margem como "Banho em Gel" e "Blindagem" ajudam a maximizar seu faturamento por hora trabalhada, permitindo atender mais clientes por dia do que alongamentos que levam mais de 2.5 horas.`
  };
}

// Vite and static asset configuration
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
