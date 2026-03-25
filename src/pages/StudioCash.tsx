import React, { useState } from 'react';
import { 
  Plus, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Filter, 
  Calendar,
  Search,
  Trash2,
  Tag,
  CreditCard as CardIcon,
  Wallet,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { Card, Button, Badge, Input, Select } from '../components/UI';
import { formatCurrency, cn } from '../lib/utils';
import { Transaction, StudioCategory, TransactionType } from '../types';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion, AnimatePresence } from 'motion/react';

interface StudioCashProps {
  transactions: Transaction[];
  onAdd: (t: Omit<Transaction, 'id'>) => void;
  onDelete: (id: string) => void;
}

const STUDIO_ENTRY_CATEGORIES: StudioCategory[] = ['atendimento', 'sinal', 'pacote', 'venda de produto', 'outro'];
const STUDIO_EXIT_CATEGORIES: StudioCategory[] = [
  'esmaltes', 'brocas', 'lixas', 'cabine', 'materiais descartáveis', 
  'aluguel', 'transporte', 'energia', 'internet', 'cursos', 'marketing', 'manutenção', 'outro'
];

export function StudioCash({ transactions, onAdd, onDelete }: StudioCashProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'entrada' | 'saída'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const studioTransactions = transactions.filter(t => !t.isPersonal);
  const filteredTransactions = studioTransactions.filter(t => {
    const matchesType = filterType === 'all' || t.type === filterType;
    const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  const totalIn = studioTransactions.filter(t => t.type === 'entrada').reduce((acc, t) => acc + t.amount, 0);
  const totalOut = studioTransactions.filter(t => t.type === 'saída').reduce((acc, t) => acc + t.amount, 0);
  const balance = totalIn - totalOut;

  return (
    <div className="space-y-10 pb-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="text-4xl font-serif font-bold text-brand-navy">Caixa do Studio</h1>
          <p className="text-slate-400 mt-1 font-medium">Onde cada centavo conta para o seu crescimento.</p>
        </motion.div>
        
        <Button onClick={() => setIsModalOpen(true)} size="lg" className="shadow-lg shadow-pink-100">
          <Plus size={20} className="mr-2" />
          Nova Movimentação
        </Button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Entradas" 
          value={totalIn} 
          icon={<ArrowUpCircle className="text-brand-success" />} 
          type="success"
          delay={0.1}
        />
        <StatCard 
          title="Saídas" 
          value={totalOut} 
          icon={<ArrowDownCircle className="text-brand-danger" />} 
          type="danger"
          delay={0.2}
        />
        <StatCard 
          title="Saldo Studio" 
          value={balance} 
          icon={<Wallet className="text-white" />} 
          type="navy"
          delay={0.3}
        />
      </div>

      <Card className="overflow-hidden border-slate-100 shadow-brand">
        <div className="p-6 border-b border-slate-50 bg-slate-50/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex p-1 bg-white rounded-2xl border border-slate-100 w-fit">
            <button 
              onClick={() => setFilterType('all')}
              className={cn(
                "px-6 py-2 rounded-xl text-sm font-bold transition-all", 
                filterType === 'all' ? "bg-brand-navy text-white shadow-md" : "text-slate-400 hover:text-brand-navy"
              )}
            >
              Tudo
            </button>
            <button 
              onClick={() => setFilterType('entrada')}
              className={cn(
                "px-6 py-2 rounded-xl text-sm font-bold transition-all", 
                filterType === 'entrada' ? "bg-brand-success text-white shadow-md" : "text-slate-400 hover:text-brand-success"
              )}
            >
              Entradas
            </button>
            <button 
              onClick={() => setFilterType('saída')}
              className={cn(
                "px-6 py-2 rounded-xl text-sm font-bold transition-all", 
                filterType === 'saída' ? "bg-brand-danger text-white shadow-md" : "text-slate-400 hover:text-brand-danger"
              )}
            >
              Saídas
            </button>
          </div>

          <div className="flex-1 max-w-md">
            <Input 
              placeholder="Buscar por descrição..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<Search size={18} className="text-slate-300" />}
              className="bg-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] border-b border-slate-50">
                <th className="px-8 py-5">Descrição</th>
                <th className="px-8 py-5">Categoria</th>
                <th className="px-8 py-5">Data</th>
                <th className="px-8 py-5">Valor</th>
                <th className="px-8 py-5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              <AnimatePresence mode="popLayout">
                {filteredTransactions.map((t, index) => (
                  <motion.tr 
                    key={t.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2, delay: index * 0.03 }}
                    className="group hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                          t.type === 'entrada' ? "bg-emerald-50 text-brand-success" : "bg-red-50 text-brand-danger"
                        )}>
                          {t.type === 'entrada' ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                        </div>
                        <span className="font-bold text-brand-navy group-hover:text-brand-pink transition-colors">{t.description}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <Badge variant="default" className="bg-slate-100 text-slate-500 border-none">
                        {t.category}
                      </Badge>
                    </td>
                    <td className="px-8 py-5 text-sm text-slate-400 font-medium">
                      {format(parseISO(t.date), "dd 'de' MMM", { locale: ptBR })}
                    </td>
                    <td className={cn(
                      "px-8 py-5 font-serif font-bold text-lg",
                      t.type === 'entrada' ? "text-brand-success" : "text-brand-danger"
                    )}>
                      {t.type === 'entrada' ? '+' : '-'} {formatCurrency(t.amount)}
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => onDelete(t.id)}
                          className="p-2 text-slate-300 hover:text-brand-danger hover:bg-red-50 rounded-xl transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-24 text-center">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Calendar size={32} className="text-slate-200" />
                    </div>
                    <h3 className="text-xl font-serif font-bold text-brand-navy">Nenhuma movimentação</h3>
                    <p className="text-slate-400 mt-2">Seus registros aparecerão aqui.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {isModalOpen && (
        <TransactionModal 
          isPersonal={false}
          onClose={() => setIsModalOpen(false)} 
          onSave={(t) => {
            onAdd(t);
            setIsModalOpen(false);
          }} 
        />
      )}
    </div>
  );
}

function StatCard({ title, value, icon, type, delay }: any) {
  const styles = {
    success: "bg-emerald-50 border-emerald-100 text-brand-success",
    danger: "bg-red-50 border-red-100 text-brand-danger",
    navy: "bg-brand-navy border-brand-navy text-white"
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <Card className={cn("border-none shadow-lg", styles[type as keyof typeof styles])}>
        <div className="flex items-center gap-4 mb-3">
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center",
            type === 'navy' ? "bg-white/10" : "bg-white shadow-sm"
          )}>
            {icon}
          </div>
          <span className={cn(
            "text-[10px] font-black uppercase tracking-[0.2em]",
            type === 'navy' ? "text-white/60" : "opacity-70"
          )}>
            {title}
          </span>
        </div>
        <p className="text-3xl font-serif font-bold">{formatCurrency(value)}</p>
      </Card>
    </motion.div>
  );
}

export function TransactionModal({ isPersonal, onClose, onSave }: { isPersonal: boolean, onClose: () => void, onSave: (t: Omit<Transaction, 'id'>) => void }) {
  const [formData, setFormData] = useState<Omit<Transaction, 'id'>>({
    type: 'entrada',
    description: '',
    category: isPersonal ? 'mercado' : 'atendimento',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    isPersonal,
    paymentMethod: 'Pix',
    notes: ''
  });

  const categories = isPersonal 
    ? ['mercado', 'contas', 'transporte', 'saúde', 'lazer', 'retirada do negócio', 'outros']
    : (formData.type === 'entrada' ? STUDIO_ENTRY_CATEGORIES : STUDIO_EXIT_CATEGORIES);

  return (
    <div className="fixed inset-0 bg-brand-navy/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
      >
        <Card className="w-full max-w-lg shadow-2xl border-none p-8">
          <h2 className="text-3xl font-serif font-bold text-brand-navy mb-8">Registrar Movimentação</h2>
          <div className="space-y-6">
            <div className="flex p-1 bg-slate-100 rounded-2xl">
              <button 
                onClick={() => setFormData({...formData, type: 'entrada', category: categories[0]})}
                className={cn(
                  "flex-1 py-3 rounded-xl text-sm font-bold transition-all", 
                  formData.type === 'entrada' ? "bg-white text-brand-success shadow-sm" : "text-slate-400"
                )}
              >
                Entrada
              </button>
              <button 
                onClick={() => setFormData({...formData, type: 'saída', category: categories[0]})}
                className={cn(
                  "flex-1 py-3 rounded-xl text-sm font-bold transition-all", 
                  formData.type === 'saída' ? "bg-white text-brand-danger shadow-sm" : "text-slate-400"
                )}
              >
                Saída
              </button>
            </div>

            <Input 
              label="Descrição"
              placeholder="Ex: Atendimento cliente Maria"
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />

            <div className="grid grid-cols-2 gap-6">
              <Input 
                label="Valor (R$)"
                type="number"
                value={formData.amount.toString()}
                onChange={e => setFormData({...formData, amount: Number(e.target.value)})}
              />
              <Input 
                label="Data"
                type="date"
                value={formData.date}
                onChange={e => setFormData({...formData, date: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <Select 
                label="Categoria"
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
                options={categories.map(cat => ({ value: cat, label: cat }))}
              />
              {!isPersonal && (
                <Select 
                  label="Forma de Pagto"
                  value={formData.paymentMethod}
                  onChange={e => setFormData({...formData, paymentMethod: e.target.value})}
                  options={[
                    { value: 'Pix', label: 'Pix' },
                    { value: 'Cartão de Crédito', label: 'Cartão de Crédito' },
                    { value: 'Cartão de Débito', label: 'Cartão de Débito' },
                    { value: 'Dinheiro', label: 'Dinheiro' }
                  ]}
                />
              )}
            </div>

            <div className="flex gap-4 pt-6">
              <Button variant="ghost" fullWidth onClick={onClose} className="text-slate-400">Cancelar</Button>
              <Button fullWidth onClick={() => onSave(formData)} className="shadow-lg shadow-pink-100">Registrar</Button>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
