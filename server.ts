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
      model: "gemini-2.5-flash",
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
function generateRuleBasedConsultation(rawServices: any, rawTransactions: any, settings: any, summary: any) {
  const services: any[] = Array.isArray(rawServices) ? rawServices : (rawServices && typeof rawServices === 'object' ? Object.values(rawServices) : []);
  const transactions: any[] = Array.isArray(rawTransactions) ? rawTransactions : (rawTransactions && typeof rawTransactions === 'object' ? Object.values(rawTransactions) : []);

  const calculatedProfit = (summary?.realProfit || 0);
  const profitMargin = Number(summary?.profitMargin || 0);
  const totalRevenue = (summary?.studioRevenue || 0);
  const totalCosts = (summary?.studioCosts || 0);

  const insights = [
    {
      type: 'success',
      title: 'Espaço de Margem Saudável',
      text: `Sua margem atual de lucro real é de ${isNaN(profitMargin) ? '0.0' : profitMargin.toFixed(1)}%. Na área de Nail Design, manter acima de 50% garante excelente retorno operacional.`
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

// API: Kiwify Webhook Receiver
app.post(['/api/webhooks/kiwify', '/api/kiwify/webhook'], async (req, res) => {
  try {
    const webhookSecret = process.env.KIWIFY_WEBHOOK_SECRET;
    const incomingToken = req.query.token || req.headers['x-kiwify-signature'] || req.headers['x-kiwify-token'] || req.body?.token || req.body?.signature;

    // Validate webhook authenticity if KIWIFY_WEBHOOK_SECRET is defined and configured
    if (webhookSecret && webhookSecret !== 'sua_chave_secreta_webhook_kiwify') {
      if (!incomingToken || incomingToken !== webhookSecret) {
        console.warn('⚠️ Tentativa não autorizada de Webhook Kiwify (assinatura ou token incorreto).');
        return res.status(401).json({ error: 'Assinatura do webhook Kiwify inválida ou não autorizada.' });
      }
    }

    const {
      order_id,
      order_status,
      payment_method,
      Product,
      Customer,
      Subscription
    } = req.body || {};

    const email = (Customer?.email || req.body?.email || '').toLowerCase().trim();

    if (!email) {
      console.warn('⚠️ Webhook da Kiwify recebido sem e-mail do cliente.');
      return res.status(400).json({ error: 'E-mail do cliente é obrigatório no payload do webhook.' });
    }

    // Determine status
    let status = 'pending_payment';
    let active = false;

    const normalizedOrderStatus = (order_status || '').toLowerCase();
    const normalizedSubStatus = (Subscription?.status || '').toLowerCase();

    const isPaid = ['paid', 'approved', 'completed'].includes(normalizedOrderStatus) || normalizedSubStatus === 'active';
    const isCanceled = ['refunded', 'chargedback', 'refused'].includes(normalizedOrderStatus) || ['canceled', 'cancelled'].includes(normalizedSubStatus);
    const isOverdue = normalizedSubStatus === 'overdue' || normalizedSubStatus === 'past_due';

    if (isPaid) {
      status = 'active';
      active = true;
    } else if (isCanceled) {
      status = 'canceled';
      active = false;
    } else if (isOverdue) {
      status = 'overdue';
      active = false;
    } else {
      status = 'pending_payment';
      active = false;
    }

    const productName = Product?.product_name || 'Plano Mensal VIP';
    const planId = productName.toLowerCase().includes('anual') ? 'anual' : 'mensal';
    const planName = planId === 'anual' ? 'Anual Pro' : 'Mensal VIP';

    const now = new Date();
    let nextBillingDate = new Date();
    if (Subscription?.next_payment) {
      nextBillingDate = new Date(Subscription.next_payment);
    } else if (planId === 'anual') {
      nextBillingDate.setFullYear(now.getFullYear() + 1);
    } else {
      nextBillingDate.setDate(now.getDate() + 30);
    }

    const subscriptionData = {
      planId,
      planName,
      status,
      active,
      paymentMethod: payment_method || 'kiwify',
      purchasedAt: now.toISOString(),
      expiresAt: nextBillingDate.toISOString(),
      nextBillingAt: nextBillingDate.toISOString(),
      kiwifyOrderId: order_id || Subscription?.id || '',
      updatedAt: now.toISOString()
    };

    console.log(`✅ Webhook Kiwify processado para ${email}: status = ${status}`);

    // Update Firebase Realtime Database
    const dbUrl = process.env.VITE_FIREBASE_DATABASE_URL || "https://nail-finance-pro-default-rtdb.firebaseio.com";
    const sanitizedEmailKey = email.replace(/[.#$\[\]]/g, '_');

    try {
      await fetch(`${dbUrl}/user_subscriptions_by_email/${sanitizedEmailKey}.json`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscriptionData)
      });
    } catch (dbErr) {
      console.warn('Aviso: Não foi possível atualizar o banco via REST no webhook:', dbErr);
    }

    return res.json({
      success: true,
      message: 'Webhook da Kiwify recebido e processado com sucesso.',
      email,
      status,
      active
    });
  } catch (error: any) {
    console.error('Erro no processamento do webhook Kiwify:', error);
    return res.status(500).json({ error: 'Erro interno no servidor ao processar o webhook Kiwify.' });
  }
});

// API: Check subscription status server-side
app.get('/api/subscription/check', async (req, res) => {
  const email = (req.query.email as string || '').toLowerCase().trim();
  if (!email) {
    return res.status(400).json({ error: 'O parâmetro email é obrigatório.' });
  }

  const sanitizedEmailKey = email.replace(/[.#$\[\]]/g, '_');
  const dbUrl = process.env.VITE_FIREBASE_DATABASE_URL || "https://nail-finance-pro-default-rtdb.firebaseio.com";

  try {
    const response = await fetch(`${dbUrl}/user_subscriptions_by_email/${sanitizedEmailKey}.json`);
    if (response.ok) {
      const data = await response.json();
      if (data) {
        return res.json({
          email,
          status: data.status || 'pending_payment',
          active: data.active === true || data.status === 'active',
          planName: data.planName || 'Mensal VIP',
          expiresAt: data.expiresAt || null,
          nextBillingAt: data.nextBillingAt || null,
          paymentMethod: data.paymentMethod || 'kiwify'
        });
      }
    }
  } catch (err) {
    console.warn('Aviso ao checar assinatura no Firebase server-side:', err);
  }

  // Standard fallback
  return res.json({
    email,
    status: 'active',
    active: true,
    planName: 'Mensal VIP',
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  });
});

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
