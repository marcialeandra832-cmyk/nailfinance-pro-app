import React from 'react';
import { useNavigate } from 'react-router-dom';
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
  Zap,
  HelpCircle,
  Receipt,
  Users
} from 'lucide-react';
import { Card, Button, Badge } from '../components/UI';
import { formatCurrency, cn } from '../lib/utils';
import { FinancialSummary, Transaction } from '../types';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { motion } from 'motion/react';
import { format, subMonths, parseISO, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DashboardProps {
  summary: FinancialSummary;
  selectedMonth: Date;
  transactions: Transaction[];
}

export function Dashboard({ summary, selectedMonth, transactions }: DashboardProps) {
  const navigate = useNavigate();

  // Generate 6-month historical chart data from real transactions
  const chartData = React.useMemo(() => {
    const data = [];
    for (let i = 5; i >= 0; i--) {
      const monthDate = subMonths(selectedMonth, i);
      const start = startOfMonth(monthDate);
      const end = endOfMonth(monthDate);

      const monthTx = transactions.filter(t => {
        if (!t.date || t.isPersonal) return false;
        try {
          return isWithinInterval(parseISO(t.date), { start, end });
        } catch {
          return false;
        }
      });

      const entradas = monthTx.filter(t => t.type === 'entrada').reduce((sum, t) => sum + t.amount, 0);
      const saídas = monthTx.filter(t => t.type === 'saída').reduce((sum, t) => sum + t.amount, 0);

      data.push({
        name: format(monthDate, 'MMM', { locale: ptBR }),
        entradas,
        saídas,
        lucro: entradas - saídas
      });
    }
    return data;
  }, [transactions, selectedMonth]);

  return (
    <div className="space-y-10 pb-12">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-brand-navy">
            Olá, Designer ✨
          </h1>
          <p className="text-slate-500 mt-1 font-medium text-sm md:text-base">
            Seu studio em <strong className="capitalize text-brand-navy">{format(selectedMonth, 'MMMM yyyy', { locale: ptBR })}</strong>. Acompanhe seus resultados reais.
          </p>
        </motion.div>
        
        <div className="flex items-center gap-3">
          <Badge variant="primary" className="px-4 py-2 text-xs font-bold bg-pink-100/80 text-brand-primary">
            <Target size={14} className="mr-1.5 inline" />
            Meta: {summary.revenueGoalProgress.toFixed(0)}% Atingida
          </Badge>
        </div>
      </header>

      {/* Primary Financial Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Faturamento Studio" 
          value={summary.studioRevenue} 
          icon={<DollarSign className="text-brand-primary" size={22} />}
          trend={summary.revenueGrowthPercent}
          isPositive={summary.revenueGrowthPercent >= 0}
          explanation="Soma total recebida pelos atendimentos e vendas do studio neste mês."
          delay={0.1}
        />
        <StatCard 
          title="Lucro Real Líquido" 
          value={summary.realProfit} 
          icon={<PieChart className="text-emerald-600" size={22} />}
          trend={summary.profitMargin}
          isPositive={summary.realProfit > 0}
          trendSuffix=" margem"
          explanation="O dinheiro que realmente sobra para o seu negócio após pagar todos os custos."
          delay={0.2}
        />
        <StatCard 
          title="Custos Operacionais" 
          value={summary.studioCosts} 
          icon={<TrendingDown className="text-red-500" size={22} />}
          trend={null}
          isPositive={false}
          explanation="Total gasto com materiais, insumos, aluguel, luz e despesas do studio."
          delay={0.3}
        />
        <StatCard 
          title="Saldo Pessoal" 
          value={summary.personalBalance} 
          icon={<Heart className="text-pink-500" size={22} />}
          trend={null}
          isPositive={summary.personalBalance >= 0}
          explanation="Caixa separado para despesas e retiradas pessoais da designer."
          delay={0.4}
        />
      </div>

      {/* Secondary Metrics Row (Ticket Médio & Atendimentos) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white border-brand-border/60">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Ticket Médio por Cliente</span>
            <Receipt size={18} className="text-brand-primary" />
          </div>
          <p className="text-2xl font-serif font-bold text-brand-navy">{formatCurrency(summary.averageTicket)}</p>
          <p className="text-xs text-gray-500 mt-2">Média faturada a cada atendimento realizado no studio.</p>
        </Card>

        <Card className="bg-white border-brand-border/60">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Atendimentos Registrados</span>
            <Users size={18} className="text-brand-navy" />
          </div>
          <p className="text-2xl font-serif font-bold text-brand-navy">{summary.studioEntriesCount} <span className="text-sm font-sans font-normal text-gray-400">procedimentos</span></p>
          <p className="text-xs text-gray-500 mt-2">Quantidade de serviços lançados no mês corrente.</p>
        </Card>

        <Card className="bg-white border-brand-border/60">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Comparação Mês Anterior</span>
            <TrendingUp size={18} className="text-emerald-500" />
          </div>
          <p className="text-2xl font-serif font-bold text-brand-navy">
            {summary.previousMonthRevenue > 0 
              ? formatCurrency(summary.previousMonthRevenue)
              : "Sem dados suficientes"}
          </p>
          <p className="text-xs text-gray-500 mt-2">Faturamento registrado no mês imediatamente anterior.</p>
        </Card>
      </div>

      {/* AI Consult Banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <Card className="bg-gradient-to-br from-brand-navy via-slate-900 to-brand-navy border-none relative overflow-hidden group p-8 md:p-10 text-white">
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-primary/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-[100px]" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-2xl text-center md:text-left">
              <Badge variant="default" className="bg-white/10 text-pink-300 border-none mb-3">
                <Sparkles size={12} className="mr-1.5 inline text-pink-400" />
                Inteligência de Negócios para Unhas
              </Badge>
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-white mb-3 leading-tight">
                Análise com Inteligência Artificial
              </h2>
              <p className="text-blue-100/80 text-sm md:text-base mb-6 font-medium leading-relaxed">
                Nossa IA lê seus custos reais, preços e faturamento para identificar onde você está perdendo lucro e como precificar melhor seu tempo.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  onClick={() => navigate('/ai')} 
                  variant="white" 
                  size="md" 
                  className="px-8 font-bold text-brand-navy hover:bg-slate-100"
                >
                  <Zap size={18} className="text-brand-primary" />
                  Abrir Consultoria IA
                </Button>
                <Button 
                  onClick={() => navigate('/catalog')} 
                  variant="ghost" 
                  className="text-white hover:bg-white/10"
                >
                  Ver Cardápio de Preços
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Chart & Insights Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2" title="Evolução Financeira" subtitle="Entradas e saídas dos últimos 6 meses">
          <div className="h-[320px] w-full mt-6">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorEntradas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF4B8C" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#FF4B8C" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorSaidas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1E293B" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#1E293B" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#64748b', fontSize: 12, fontWeight: 600}} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#64748b', fontSize: 12, fontWeight: 600}} 
                  tickFormatter={(v) => `R$${v}`}
                />
                <Tooltip 
                  formatter={(val: number) => formatCurrency(val)}
                  contentStyle={{borderRadius: '16px', border: '1px solid #f1f5f9', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px'}}
                  itemStyle={{fontWeight: 700}}
                />
                <Area 
                  type="monotone" 
                  name="Entradas"
                  dataKey="entradas" 
                  stroke="#FF4B8C" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorEntradas)" 
                />
                <Area 
                  type="monotone" 
                  name="Saídas"
                  dataKey="saídas" 
                  stroke="#1E293B" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorSaidas)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Dynamic Insights Column */}
        <div className="space-y-6">
          <Card title="Diagnóstico Rápido" subtitle="Resumo das suas métricas">
            <div className="space-y-3.5 mt-2">
              <InsightItem 
                icon={<TrendingUp size={16} />} 
                text={summary.profitMargin >= 40 
                  ? `Sua margem de lucro (${summary.profitMargin.toFixed(1)}%) está excelente!` 
                  : `Sua margem (${summary.profitMargin.toFixed(1)}%) pode ser otimizada reduzindo custos.`} 
                type={summary.profitMargin >= 40 ? 'success' : 'warning'} 
              />
              <InsightItem 
                icon={<AlertCircle size={16} />} 
                text={summary.studioCosts > (summary.studioRevenue * 0.4) && summary.studioRevenue > 0
                  ? "Custos operacionais representam mais de 40% do faturamento."
                  : "Custos operacionais estão sob controle neste mês."} 
                type={summary.studioCosts > (summary.studioRevenue * 0.4) ? 'warning' : 'success'} 
              />
              <InsightItem 
                icon={<Heart size={16} />} 
                text="Caixa pessoal e profissional mantidos com separação clara." 
                type="success" 
              />
            </div>
            <Button 
              onClick={() => navigate('/ai')} 
              variant="ghost" 
              fullWidth 
              className="mt-6 text-brand-primary font-bold hover:bg-pink-50"
            >
              Ver relatório completo na IA
            </Button>
          </Card>

          <Card className="bg-gradient-to-br from-pink-50 to-white border-brand-pink/20 relative overflow-hidden">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-brand-primary flex items-center justify-center text-white shrink-0 shadow-md">
                <DollarSign size={24} />
              </div>
              <div>
                <p className="text-[10px] text-brand-primary font-black uppercase tracking-wider mb-0.5">Lucro do Studio</p>
                <p className="text-2xl font-serif font-bold text-brand-navy">{formatCurrency(summary.realProfit)}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatCard({ 
  title, 
  value, 
  icon, 
  trend, 
  isPositive, 
  trendSuffix,
  explanation, 
  delay 
}: { 
  title: string; 
  value: number | string; 
  icon: React.ReactNode; 
  trend: number | null; 
  isPositive: boolean; 
  trendSuffix?: string;
  explanation: string; 
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <Card className="hover:translate-y-[-2px] transition-all duration-200 bg-white border-brand-border/60">
        <div className="flex items-center justify-between mb-4">
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
            {icon}
          </div>
          {trend !== null && (
            <Badge variant={isPositive ? 'success' : 'danger'} className="px-2 py-0.5 text-[10px]">
              {isPositive ? <ArrowUpRight size={10} className="inline mr-1" /> : <ArrowDownRight size={10} className="inline mr-1" />}
              {Math.abs(trend).toFixed(0)}%{trendSuffix || ''}
            </Badge>
          )}
        </div>
        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">{title}</p>
        <p className="text-2xl font-serif font-bold text-brand-navy">
          {typeof value === 'number' ? formatCurrency(value) : value}
        </p>
        <p className="text-[11px] text-gray-400 mt-2 font-medium leading-tight">
          {explanation}
        </p>
      </Card>
    </motion.div>
  );
}

function InsightItem({ icon, text, type }: { icon: React.ReactNode, text: string, type: 'success' | 'warning' | 'danger' }) {
  const colors = {
    success: "bg-emerald-50 text-emerald-800 border-emerald-100",
    warning: "bg-amber-50 text-amber-800 border-amber-100",
    danger: "bg-red-50 text-red-800 border-red-100",
  };

  return (
    <div className={cn("flex items-start gap-3 p-3.5 rounded-2xl border text-xs font-semibold leading-relaxed", colors[type])}>
      <div className="mt-0.5 shrink-0">{icon}</div>
      <p>{text}</p>
    </div>
  );
}
