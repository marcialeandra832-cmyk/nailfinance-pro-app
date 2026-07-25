import React, { useState, useEffect, useCallback } from 'react';
import { 
  Sparkles, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  RefreshCw, 
  Lightbulb, 
  DollarSign, 
  Clock, 
  Zap,
  Target
} from 'lucide-react';
import { Card, Button, Badge } from '../components/UI';
import { Service, Transaction, UserSettings, FinancialSummary, AIInsight } from '../types';
import { motion } from 'motion/react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { formatCurrency } from '../lib/utils';
import { toast } from 'sonner';

interface AIAnalysisProps {
  services: Service[];
  transactions: Transaction[];
  settings: UserSettings;
  summary: FinancialSummary;
  selectedMonth: Date;
}

const getClientFallbackConsultation = (
  servicesList: Service[], 
  transList: Transaction[], 
  userSettings: UserSettings, 
  finSummary: FinancialSummary
) => {
  const margin = finSummary?.profitMargin || 0;
  const studioRev = finSummary?.studioRevenue || 0;
  const studioCost = finSummary?.studioCosts || 0;

  const fallbackInsights: AIInsight[] = [
    {
      type: margin >= 40 ? 'success' : 'warning',
      title: margin >= 40 ? 'Margem Operacional Saudável' : 'Atenção à Margem de Lucro',
      text: `Sua margem atual de lucro real é de ${margin.toFixed(1)}%. O ideal para nail designers de alta performance é manter a margem acima de 50%.`
    }
  ];

  if (studioCost > studioRev * 0.35) {
    fallbackInsights.push({
      type: 'warning',
      title: 'Custos Elevados com Materiais',
      text: 'Seus custos operacionais ultrapassaram 35% do faturamento. Tente renegociar géis e descartáveis em pacotes maiores.'
    });
  } else {
    fallbackInsights.push({
      type: 'info',
      title: 'Controle de Custos em Dia',
      text: 'Seus gastos com insumos e despesas operacionais estão bem equilibrados em relação ao faturamento.'
    });
  }

  const lowMargin = (servicesList || []).find(s => (s.price - s.materialCost) / (s.price || 1) < 0.5);
  if (lowMargin) {
    fallbackInsights.push({
      type: 'danger',
      title: 'Procedimento com Custo Alto',
      text: `O serviço "${lowMargin.name}" possui custo elevado de insumos em relação ao preço cobrado. Considere reajustar o valor.`
    });
  } else {
    fallbackInsights.push({
      type: 'success',
      title: 'Catálogo Bem Precificado',
      text: 'Seus procedimentos cadastrados apresentam uma ótima margem de retorno por atendimento.'
    });
  }

  const suggestionText = `Recomendação para o ${userSettings?.studioName || 'Studio'}: Para bater sua meta de R$ ${userSettings?.revenueGoal || 5000} no mês, acompanhe a Ficha Técnica de Custos de cada procedimento. Serviços rápidos de alta margem como "Banho em Gel" e "Blindagem" ajudam a elevar seu faturamento diário com menor tempo de bancada.`;

  return { insights: fallbackInsights, suggestion: suggestionText };
};

export function AIAnalysis({ services, transactions, settings, summary, selectedMonth }: AIAnalysisProps) {
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [suggestion, setSuggestion] = useState<string>('');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchAIConsultation = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/ai-consult', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          services: services || [],
          transactions: transactions || [],
          settings: settings || {},
          summary: summary || {}
        })
      });

      if (!response.ok) {
        throw new Error(`Falha na resposta do servidor (${response.status})`);
      }

      const data = await response.json();
      if (data.insights && Array.isArray(data.insights) && data.insights.length > 0) {
        setInsights(data.insights);
      } else {
        const fallback = getClientFallbackConsultation(services, transactions, settings, summary);
        setInsights(fallback.insights);
      }

      if (data.suggestion) {
        setSuggestion(data.suggestion);
      } else {
        const fallback = getClientFallbackConsultation(services, transactions, settings, summary);
        setSuggestion(fallback.suggestion);
      }
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Erro na consultoria IA:', error);
      const fallback = getClientFallbackConsultation(services, transactions, settings, summary);
      setInsights(fallback.insights);
      setSuggestion(fallback.suggestion);
      setLastUpdated(new Date());
    } finally {
      setLoading(false);
    }
  }, [services, transactions, settings, summary]);

  useEffect(() => {
    fetchAIConsultation();
  }, [fetchAIConsultation]);

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle2 className="text-emerald-500" size={20} />;
      case 'warning': return <AlertTriangle className="text-amber-500" size={20} />;
      case 'danger': return <AlertTriangle className="text-red-500" size={20} />;
      default: return <Info className="text-blue-500" size={20} />;
    }
  };

  const getInsightBg = (type: string) => {
    switch (type) {
      case 'success': return 'bg-emerald-50/80 border-emerald-100 text-emerald-950';
      case 'warning': return 'bg-amber-50/80 border-amber-100 text-amber-950';
      case 'danger': return 'bg-red-50/80 border-red-100 text-red-950';
      default: return 'bg-blue-50/80 border-blue-100 text-blue-950';
    }
  };

  return (
    <div className="space-y-10 pb-12">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <Badge variant="primary" className="mb-2 inline-flex items-center gap-1.5 px-3 py-1">
            <Sparkles size={12} className="text-brand-primary" />
            IA Financeira para Nail Designers
          </Badge>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-brand-navy">Análise & Consultoria Virtual</h1>
          <p className="text-slate-500 mt-1 font-medium text-sm md:text-base">
            Diagnóstico baseado no seu catálogo real ({services.length} serviços) e nas movimentações de <strong className="capitalize text-brand-navy">{format(selectedMonth, 'MMMM yyyy', { locale: ptBR })}</strong>.
          </p>
        </div>
        
        <Button 
          onClick={fetchAIConsultation} 
          disabled={loading}
          variant="secondary"
          size="md"
          className="shadow-md"
        >
          <RefreshCw size={18} className={loading ? "animate-spin mr-2" : "mr-2"} />
          {loading ? "Analisando dados..." : "Atualizar Análise"}
        </Button>
      </header>

      {/* Snapshot Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="bg-white border-brand-border">
          <p className="text-xs font-bold uppercase text-gray-400">Faturamento Mês</p>
          <p className="text-2xl font-serif font-bold text-brand-navy mt-1">{formatCurrency(summary.studioRevenue)}</p>
          <p className="text-xs text-gray-400 mt-1">Meta: {formatCurrency(settings.revenueGoal)}</p>
        </Card>

        <Card className="bg-white border-brand-border">
          <p className="text-xs font-bold uppercase text-gray-400">Lucro Real Líquido</p>
          <p className="text-2xl font-serif font-bold text-emerald-600 mt-1">{formatCurrency(summary.realProfit)}</p>
          <p className="text-xs text-gray-400 mt-1">Margem: {summary.profitMargin.toFixed(1)}%</p>
        </Card>

        <Card className="bg-white border-brand-border">
          <p className="text-xs font-bold uppercase text-gray-400">Procedimentos Cadastrados</p>
          <p className="text-2xl font-serif font-bold text-brand-navy mt-1">{services.length} <span className="text-xs font-normal text-gray-400">serviços</span></p>
          <p className="text-xs text-gray-400 mt-1">Preço médio: {formatCurrency(services.length > 0 ? services.reduce((a, b) => a + b.price, 0) / services.length : 0)}</p>
        </Card>
      </div>

      {/* Main Advisory Box */}
      <Card className="bg-gradient-to-br from-brand-navy via-slate-900 to-brand-navy border-none text-white p-8 md:p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-primary/10 rounded-full blur-3xl" />
        
        <div className="relative z-10 space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-brand-primary/20 flex items-center justify-center text-pink-400">
                <Lightbulb size={22} />
              </div>
              <div>
                <h2 className="text-xl font-serif font-bold text-white">Recomendação Estratégica</h2>
                {lastUpdated && (
                  <p className="text-[11px] text-blue-200/60 font-medium">
                    Gerado em {format(lastUpdated, "HH:mm:ss 'de' dd/MM/yyyy")}
                  </p>
                )}
              </div>
            </div>
          </div>

          {loading ? (
            <div className="py-12 text-center text-blue-100/70 space-y-3">
              <RefreshCw size={32} className="animate-spin mx-auto text-pink-400" />
              <p className="font-bold text-sm">Nossa IA está cruzando o custo dos seus esmaltes e tempo de atendimento...</p>
            </div>
          ) : (
            <div className="text-blue-50 text-sm md:text-base leading-relaxed font-medium space-y-4">
              <p className="whitespace-pre-line">{suggestion}</p>
            </div>
          )}
        </div>
      </Card>

      {/* Insights Section */}
      <div className="space-y-4">
        <h3 className="text-xl font-serif font-bold text-brand-navy">Insights de Desempenho</h3>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-28 bg-gray-100 animate-pulse rounded-2xl" />
            <div className="h-28 bg-gray-100 animate-pulse rounded-2xl" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.map((insight, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.1 }}
                className={`p-6 rounded-3xl border ${getInsightBg(insight.type)} space-y-2 shadow-sm`}
              >
                <div className="flex items-center gap-3">
                  {getInsightIcon(insight.type)}
                  <h4 className="font-bold text-base font-serif">{insight.title}</h4>
                </div>
                <p className="text-xs md:text-sm font-medium leading-relaxed opacity-90 pl-8">
                  {insight.text}
                </p>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
