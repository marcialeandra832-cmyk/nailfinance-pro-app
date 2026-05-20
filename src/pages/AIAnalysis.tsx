import React, { useState } from 'react';
import { DollarSign, TrendingUp, TrendingDown, AlertTriangle, Lightbulb, CheckCircle2, Loader2, RefreshCw } from 'lucide-react';
import { Card, Button } from '../components/UI';
import { formatCurrency, cn } from '../lib/utils';
import { FinancialSummary, Transaction, Service, UserSettings } from '../types';

interface AIAnalysisProps {
  summary: FinancialSummary;
  transactions: Transaction[];
  services: Service[];
  settings?: UserSettings;
}

export function AIAnalysis({ summary, transactions, services, settings }: AIAnalysisProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const generateAnalysis = async () => {
    setIsAnalyzing(true);
    setErrorMsg(null);
    try {
      const activeSettings = settings || JSON.parse(localStorage.getItem('nailfinance_settings') || '{}');
      const response = await fetch('/api/ai-consult', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          services,
          transactions,
          settings: activeSettings,
          summary
        })
      });

      if (!response.ok) {
        throw new Error('Falha ao processar análise inteligente.');
      }

      const data = await response.json();
      setAnalysis(data);
    } catch (e: any) {
      console.error(e);
      setErrorMsg('Ocorreu um erro ao gerar sua consultoria de IA. Por favor, tente novamente.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="text-brand-success" size={24} />;
      case 'warning':
        return <AlertTriangle className="text-amber-500" size={24} />;
      case 'danger':
        return <TrendingDown className="text-brand-danger" size={24} />;
      default:
        return <Lightbulb className="text-blue-500" size={24} />;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header>
        <h1 className="text-3xl font-bold text-brand-navy flex items-center gap-3">
          Análise IA 
        </h1>
        <p className="text-gray-500">Inteligência artificial traduzindo seus números em decisões</p>
      </header>

      {errorMsg && (
        <Card className="border-red-100 bg-red-50 text-red-700 p-6 text-center max-w-2xl mx-auto">
          <p className="font-bold">{errorMsg}</p>
          <Button variant="outline" size="sm" className="mt-4 border-red-200 text-red-800 hover:bg-red-100" onClick={generateAnalysis}>
            <RefreshCw size={14} className="mr-1.5 animate-spin" /> Tentar Novamente
          </Button>
        </Card>
      )}

      {!analysis && !isAnalyzing ? (
        <Card className="py-20 flex flex-col items-center text-center max-w-2xl mx-auto">
          <div className="w-24 h-24 bg-pink-50 rounded-full flex items-center justify-center text-brand-pink mb-6 animate-pulse">
            <DollarSign size={48} />
          </div>
          <h2 className="text-2xl font-bold text-brand-navy mb-4">Pronta para entender seu lucro real?</h2>
          <p className="text-gray-500 mb-8 px-10">
            Nossa IA vai analisar todas as suas movimentações, custos de materiais e serviços para te dar um diagnóstico completo da sua saúde financeira.
          </p>
          <Button size="lg" onClick={generateAnalysis}>
            <DollarSign size={20} />
            Gerar consultoria de IA
          </Button>
        </Card>
      ) : isAnalyzing ? (
        <Card className="py-20 flex flex-col items-center text-center">
          <Loader2 size={48} className="text-brand-pink animate-spin mb-6" />
          <h2 className="text-2xl font-bold text-brand-navy mb-2">Analisando seus dados...</h2>
          <p className="text-gray-500">Nossa Inteligência Artificial está calculando suas margens reais, taxas de labor por hora e identificando gargalos.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in zoom-in-95 duration-500">
          {(analysis.insights || []).map((item: any, idx: number) => (
            <Card key={idx} className="hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="mt-1">{getIcon(item.type)}</div>
                <div>
                  <h3 className="text-lg font-bold text-brand-navy mb-1">{item.title}</h3>
                  <p className="text-gray-600 leading-relaxed font-semibold text-sm">{item.text}</p>
                </div>
              </div>
            </Card>
          ))}
          
          <Card className="md:col-span-2 bg-gradient-to-br from-brand-navy to-slate-950 text-white border-none p-8">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3 text-brand-pink">
                <DollarSign size={24} />
                <h3 className="text-xl font-bold">Recomendação Estratégica Adicional</h3>
              </div>
              <p className="text-blue-100 text-sm leading-relaxed whitespace-pre-line font-medium">{analysis.suggestion}</p>
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
