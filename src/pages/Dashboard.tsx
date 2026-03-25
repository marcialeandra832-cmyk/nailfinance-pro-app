import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PieChart, 
  ArrowUpRight, 
  ArrowDownRight,
  Sparkles,
  AlertCircle,
  Heart,
  Target,
  Zap
} from 'lucide-react';
import { Card, Button, Badge } from '../components/UI';
import { formatCurrency, cn } from '../lib/utils';
import { FinancialSummary } from '../types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { motion } from 'motion/react';

interface DashboardProps {
  summary: FinancialSummary;
  onGenerateAI: () => void;
}

const MOCK_CHART_DATA = [
  { name: 'Jan', entradas: 4000, saídas: 2400 },
  { name: 'Fev', entradas: 3000, saídas: 1398 },
  { name: 'Mar', entradas: 5000, saídas: 2800 },
  { name: 'Abr', entradas: 2780, saídas: 3908 },
  { name: 'Mai', entradas: 4890, saídas: 2800 },
  { name: 'Jun', entradas: 6390, saídas: 3800 },
];

export function Dashboard({ summary, onGenerateAI }: DashboardProps) {
  return (
    <div className="space-y-10 pb-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-serif font-bold text-brand-navy">Olá, Designer ✨</h1>
          <p className="text-slate-400 dark:text-slate-500 mt-1 font-medium">Seu studio está florescendo hoje. Vamos ver os números?</p>
        </motion.div>
        
        <div className="flex items-center gap-3">
          <Badge variant="info" className="bg-blue-50 text-blue-600 px-4 py-2">
            <Target size={12} className="mr-1.5 inline" />
            Meta: 85% atingida
          </Badge>
        </div>
      </header>

      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Faturamento Studio" 
          value={summary.studioRevenue} 
          icon={<DollarSign className="text-brand-pink" />}
          trend={12}
          isPositive
          delay={0.1}
        />
        <StatCard 
          title="Custo Operacional" 
          value={summary.studioCosts} 
          icon={<TrendingDown className="text-brand-danger" />}
          trend={-5}
          isPositive={false}
          delay={0.2}
        />
        <StatCard 
          title="Margem de Lucro" 
          value={`${summary.profitMargin.toFixed(1)}%`} 
          icon={<PieChart className="text-brand-success" />}
          trend={2}
          isPositive
          delay={0.3}
        />
        <StatCard 
          title="Saldo Pessoal" 
          value={summary.personalBalance} 
          icon={<Heart className="text-brand-pink" />}
          trend={8}
          isPositive
          delay={0.4}
        />
      </div>

      {/* Main Banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <Card className="bg-gradient-to-br from-brand-navy via-slate-900 to-brand-navy border-none relative overflow-hidden group p-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-pink/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-[100px] group-hover:bg-brand-pink/30 transition-all duration-700" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-[80px]" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="max-w-2xl text-center md:text-left">
              <Badge variant="default" className="bg-white/10 text-brand-pink border-none mb-4">
                <Sparkles size={10} className="mr-1.5 inline" />
                Inteligência Artificial
              </Badge>
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-4 leading-tight">
                Suas unhas estão dando o lucro que você merece?
              </h2>
              <p className="text-blue-100/70 text-lg mb-8 font-medium">
                Muitas designers trabalham muito e não veem a cor do dinheiro. 
                Nossa IA analisa seus custos e mostra o que realmente sobra no seu bolso.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button onClick={onGenerateAI} variant="white" size="lg" className="px-10">
                  <Zap size={18} className="text-brand-pink" />
                  Gerar Consultoria
                </Button>
                <Button variant="ghost" className="text-white hover:bg-white/10 dark:hover:bg-white/5">
                  Entenda como funciona
                </Button>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="w-56 h-56 bg-white/5 rounded-[3rem] backdrop-blur-xl border border-white/10 flex items-center justify-center relative group-hover:scale-105 transition-transform duration-500">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-pink/20 to-transparent rounded-[3rem]" />
                <Sparkles size={80} className="text-brand-pink drop-shadow-2xl" />
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart */}
        <Card className="lg:col-span-2" title="Desempenho Financeiro" subtitle="Entradas e saídas dos últimos 6 meses">
          <div className="h-[350px] w-full mt-8">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MOCK_CHART_DATA}>
                <defs>
                  <linearGradient id="colorEntradas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF4D8D" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#FF4D8D" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorSaidas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1A2238" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#1A2238" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 600}} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 600}} 
                />
                <Tooltip 
                  contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '16px'}}
                  itemStyle={{fontWeight: 700}}
                />
                <Area 
                  type="monotone" 
                  dataKey="entradas" 
                  stroke="#FF4D8D" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorEntradas)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="saídas" 
                  stroke="#1A2238" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorSaidas)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Insights */}
        <div className="space-y-6">
          <Card title="Insights do Mês" subtitle="O que seus números dizem">
            <div className="space-y-4 mt-2">
              <InsightItem 
                icon={<TrendingUp size={16} />} 
                text="Seu serviço mais lucrativo foi Banho em Gel." 
                type="success" 
              />
              <InsightItem 
                icon={<AlertCircle size={16} />} 
                text="Materiais pesaram 15% mais este mês." 
                type="warning" 
              />
              <InsightItem 
                icon={<TrendingDown size={16} />} 
                text="O lucro caiu 5% vs mês passado." 
                type="danger" 
              />
              <InsightItem 
                icon={<Heart size={16} />} 
                text="Parabéns! Você separou os caixas este mês." 
                type="success" 
              />
            </div>
            <Button variant="ghost" fullWidth className="mt-6 text-brand-pink font-bold">
              Ver relatório completo
            </Button>
          </Card>

          <Card className="bg-gradient-to-br from-pink-50 to-white dark:from-pink-950/10 dark:to-brand-card border-brand-pink/10 relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-brand-pink/5 rounded-full blur-2xl" />
            <div className="flex items-center gap-5 relative z-10">
              <div className="w-14 h-14 rounded-[1.25rem] bg-brand-pink flex items-center justify-center text-white shrink-0 shadow-lg shadow-pink-200">
                <DollarSign size={28} />
              </div>
              <div>
                <p className="text-[10px] text-brand-pink font-black uppercase tracking-[0.2em] mb-1">Lucro Real</p>
                <p className="text-3xl font-serif font-bold text-brand-navy">{formatCurrency(summary.realProfit)}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, trend, isPositive, delay }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <Card className="hover:translate-y-[-4px] transition-all duration-300 group">
        <div className="flex items-center justify-between mb-6">
          <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center group-hover:bg-pink-50 dark:group-hover:bg-pink-950/20 transition-colors duration-300">
            {icon}
          </div>
          <Badge variant={isPositive ? 'success' : 'danger'} className="px-2 py-1">
            {isPositive ? <ArrowUpRight size={12} className="inline mr-1" /> : <ArrowDownRight size={12} className="inline mr-1" />}
            {Math.abs(trend)}%
          </Badge>
        </div>
        <p className="text-sm text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mb-1">{title}</p>
        <p className="text-2xl font-serif font-bold text-brand-navy">
          {typeof value === 'number' ? formatCurrency(value) : value}
        </p>
      </Card>
    </motion.div>
  );
}

function InsightItem({ icon, text, type }: { icon: React.ReactNode, text: string, type: 'success' | 'warning' | 'danger' }) {
  const colors = {
    success: "bg-emerald-50 text-emerald-700 border-emerald-100/50",
    warning: "bg-amber-50 text-amber-700 border-amber-100/50",
    danger: "bg-red-50 text-red-700 border-red-100/50",
  };

  return (
    <div className={cn("flex items-start gap-3.5 p-4 rounded-2xl border transition-all hover:scale-[1.02]", colors[type])}>
      <div className="mt-0.5 shrink-0">{icon}</div>
      <p className="text-sm font-bold leading-snug">{text}</p>
    </div>
  );
}
