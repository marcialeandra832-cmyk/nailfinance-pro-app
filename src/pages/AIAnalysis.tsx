import React, { useState } from 'react';
import { Sparkles, TrendingUp, TrendingDown, AlertTriangle, Lightbulb, CheckCircle2, Loader2 } from 'lucide-react';
import { Card, Button } from '../components/UI';
import { formatCurrency, cn } from '../lib/utils';
import { FinancialSummary, Transaction, Service } from '../types';

interface AIAnalysisProps {
  summary: FinancialSummary;
  transactions: Transaction[];
  services: Service[];
}

export function AIAnalysis({ summary, transactions, services }: AIAnalysisProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);

  const generateAnalysis = () => {
    setIsAnalyzing(true);
    // Simulate AI processing
    setTimeout(() => {
      const insights = [
        {
          type: 'success',
          title: 'Lucro Real Saudável',
          text: `Seu lucro real no mês foi de ${formatCurrency(summary.realProfit)}. Isso representa uma margem de ${summary.profitMargin.toFixed(1)}%.`,
          icon: <CheckCircle2 className="text-brand-success" />
        },
        {
          type: 'warning',
          title: 'Custo Operacional Alto',
          text: `Você gastou ${(summary.studioCosts / summary.studioRevenue * 100).toFixed(1)}% do faturamento com operação. Tente reduzir gastos com materiais descartáveis.`,
          icon: <AlertTriangle className="text-amber-500" />
        },
        {
          type: 'info',
          title: 'Serviço Estrela',
          text: 'Seu serviço mais lucrativo foi Banho em Gel. Considere fazer uma promoção para atrair mais clientes para este serviço.',
          icon: <Lightbulb className="text-blue-500" />
        },
        {
          type: 'danger',
          title: 'Mistura de Caixas',
          text: 'Detectamos que você está retirando dinheiro sem controle do caixa do studio para uso pessoal. Isso prejudica sua visão de lucro real.',
          icon: <TrendingDown className="text-brand-danger" />
        }
      ];
      setAnalysis(insights);
      setIsAnalyzing(false);
    }, 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header>
        <h1 className="text-3xl font-bold text-brand-navy flex items-center gap-3">
          Análise IA 
        </h1>
        <p className="text-gray-500">Inteligência artificial traduzindo seus números em decisões</p>
      </header>

      {!analysis && !isAnalyzing ? (
        <Card className="py-20 flex flex-col items-center text-center max-w-2xl mx-auto">
          <div className="w-24 h-24 bg-pink-50 rounded-full flex items-center justify-center text-brand-pink mb-6 animate-pulse">
            <Sparkles size={48} />
          </div>
          <h2 className="text-2xl font-bold text-brand-navy mb-4">Pronta para entender seu lucro real?</h2>
          <p className="text-gray-500 mb-8 px-10">
            Nossa IA vai analisar todas as suas movimentações, custos de materiais e serviços para te dar um diagnóstico completo da sua saúde financeira.
          </p>
          <Button size="lg" onClick={generateAnalysis}>
            <Sparkles size={20} />
            Gerar consultoria
          </Button>
        </Card>
      ) : isAnalyzing ? (
        <Card className="py-20 flex flex-col items-center text-center">
          <Loader2 size={48} className="text-brand-pink animate-spin mb-6" />
          <h2 className="text-2xl font-bold text-brand-navy mb-2">Analisando seus dados...</h2>
          <p className="text-gray-500">Estamos calculando margens, custos e identificando padrões.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in zoom-in-95 duration-500">
          {analysis.map((item: any, idx: number) => (
            <Card key={idx} className="hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="mt-1">{item.icon}</div>
                <div>
                  <h3 className="text-lg font-bold text-brand-navy mb-1">{item.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{item.text}</p>
                </div>
              </div>
            </Card>
          ))}
          
          <Card className="md:col-span-2 bg-brand-navy text-white border-none">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="text-xl font-bold mb-2">Sugestão de Reajuste</h3>
                <p className="text-blue-100">Seu preço de "Alongamento Fibra" pode não estar cobrindo bem material + tempo. Sugerimos um reajuste de 10%.</p>
              </div>
              <Button className="bg-brand-pink border-none whitespace-nowrap">Ver detalhes do cálculo</Button>
            </div>
          </Card>

          <div className="md:col-span-2 flex justify-center pt-8">
            <Button variant="outline" onClick={() => setAnalysis(null)}>
              Nova Análise
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
