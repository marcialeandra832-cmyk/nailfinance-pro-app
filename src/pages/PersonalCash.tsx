import React, { useState } from 'react';
import { 
  Plus, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Trash2,
  ShieldCheck,
  Search,
  Calendar as CalendarIcon,
  ChevronRight
} from 'lucide-react';
import { Card, Button, Input, Select, Badge } from '../components/UI';
import { formatCurrency, cn } from '../lib/utils';
import { Transaction } from '../types';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { TransactionModal } from './StudioCash';
import { motion, AnimatePresence } from 'motion/react';

interface PersonalCashProps {
  transactions: Transaction[];
  onAdd: (t: Omit<Transaction, 'id'>) => void;
  onDelete: (id: string) => void;
}

export function PersonalCash({ transactions, onAdd, onDelete }: PersonalCashProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'entrada' | 'saída'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const personalTransactions = transactions.filter(t => t.isPersonal);
  
  const filteredTransactions = personalTransactions.filter(t => {
    const matchesType = filterType === 'all' || t.type === filterType;
    const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         t.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  const totalIn = personalTransactions.filter(t => t.type === 'entrada').reduce((acc, t) => acc + t.amount, 0);
  const totalOut = personalTransactions.filter(t => t.type === 'saída').reduce((acc, t) => acc + t.amount, 0);
  const balance = totalIn - totalOut;

  const StatCard = ({ title, value, icon: Icon, color, trend }: any) => (
    <Card className="relative overflow-hidden group">
      <div className={cn(
        "absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-10 transition-transform duration-500 group-hover:scale-110",
        color === 'success' ? "bg-brand-success" : color === 'danger' ? "bg-brand-danger" : "bg-brand-primary"
      )} />
      <div className="flex items-center gap-4">
        <div className={cn(
          "w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm",
          color === 'success' ? "bg-green-50 text-brand-success" : 
          color === 'danger' ? "bg-red-50 text-brand-danger" : 
          "bg-pink-50 text-brand-primary"
        )}>
          <Icon size={24} />
        </div>
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{title}</p>
          <h3 className="text-2xl font-bold text-brand-navy mt-1">{formatCurrency(value)}</h3>
          {trend && (
            <p className={cn("text-[10px] font-bold mt-1 uppercase tracking-tighter", color === 'success' ? "text-brand-success" : "text-brand-danger")}>
              {trend}
            </p>
          )}
        </div>
      </div>
    </Card>
  );

  return (
    <div className="space-y-8 pb-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-2"
        >
          <Badge variant="primary" className="mb-2">Finanças Pessoais</Badge>
          <h1 className="text-4xl font-bold text-brand-navy tracking-tight">
            Seu Dinheiro, <span className="text-brand-primary italic font-serif">Sua Liberdade</span>
          </h1>
          <p className="text-gray-500 max-w-md">
            Organize seus gastos pessoais e garanta que o lucro do seu studio se transforme em qualidade de vida para você.
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Button onClick={() => setIsModalOpen(true)} variant="primary" size="lg" className="shadow-lg shadow-brand-primary/20">
            <Plus size={20} />
            Novo Gasto Pessoal
          </Button>
        </motion.div>
      </header>

      {/* Rule of Gold Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-r from-brand-navy to-brand-navy/90 p-8 rounded-[2rem] text-white relative overflow-hidden shadow-xl"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl" />
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
          <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-brand-primary shrink-0 border border-white/10">
            <ShieldCheck size={32} />
          </div>
          <div className="text-center md:text-left">
            <h3 className="text-xl font-bold mb-1">A Regra de Ouro da Nail Designer de Sucesso</h3>
            <p className="text-white/70 text-lg leading-relaxed">
              "Quem mistura o dinheiro do esmalte com o dinheiro do aluguel de casa, nunca sabe se está lucrando ou apenas pagando boletos."
            </p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Entradas Pessoais" 
          value={totalIn} 
          icon={ArrowUpCircle} 
          color="success"
          trend="Seu Pró-labore e extras"
        />
        <StatCard 
          title="Saídas Pessoais" 
          value={totalOut} 
          icon={ArrowDownCircle} 
          color="danger"
          trend="Custos de vida e lazer"
        />
        <Card className={cn(
          "relative overflow-hidden border-none shadow-xl",
          balance >= 0 ? "bg-brand-success" : "bg-brand-danger"
        )}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
          <div className="relative z-10">
            <p className="text-xs font-bold text-white/60 uppercase tracking-widest">Saldo Pessoal Livre</p>
            <h3 className="text-3xl font-bold text-white mt-2">{formatCurrency(balance)}</h3>
            <div className="mt-4 flex items-center gap-2 text-white/80 text-xs font-medium bg-white/10 w-fit px-3 py-1 rounded-full backdrop-blur-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              {balance >= 0 ? "Saldo positivo" : "Atenção ao saldo"}
            </div>
          </div>
        </Card>
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 bg-gray-50/30">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-brand-navy flex items-center gap-2">
              Extrato Pessoal
              <Badge variant="outline" className="ml-2">{filteredTransactions.length}</Badge>
            </h2>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative min-w-[240px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <Input 
                  placeholder="Buscar por descrição..." 
                  className="pl-10 py-2 h-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select 
                value={filterType} 
                onChange={(e) => setFilterType(e.target.value as any)}
                className="h-10 py-0"
              >
                <option value="all">Todos Tipos</option>
                <option value="entrada">Entradas</option>
                <option value="saída">Saídas</option>
              </Select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] border-b border-gray-50">
                <th className="px-6 py-4">Descrição</th>
                <th className="px-6 py-4">Categoria</th>
                <th className="px-6 py-4">Data</th>
                <th className="px-6 py-4">Valor</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              <AnimatePresence mode="popLayout">
                {filteredTransactions.map((t, index) => (
                  <motion.tr 
                    key={t.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.03 }}
                    className="group hover:bg-gray-50/80 transition-all duration-300"
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center shadow-sm transition-transform group-hover:scale-110",
                          t.type === 'entrada' ? "bg-green-50 text-brand-success" : "bg-red-50 text-brand-danger"
                        )}>
                          {t.type === 'entrada' ? <ArrowUpCircle size={18} /> : <ArrowDownCircle size={18} />}
                        </div>
                        <div>
                          <p className="font-bold text-brand-navy leading-none mb-1">{t.description}</p>
                          <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">ID: {t.id.slice(0, 8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <Badge variant="outline" className="bg-gray-50 border-gray-100 text-gray-500">
                        {t.category}
                      </Badge>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                        <CalendarIcon size={14} className="text-gray-300" />
                        {format(parseISO(t.date), "dd 'de' MMM", { locale: ptBR })}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <p className={cn(
                        "font-bold text-lg tracking-tight",
                        t.type === 'entrada' ? "text-brand-success" : "text-brand-danger"
                      )}>
                        {t.type === 'entrada' ? '+' : '-'} {formatCurrency(t.amount)}
                      </p>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => onDelete(t.id)}
                          className="p-2.5 text-gray-300 hover:text-brand-danger hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                          title="Excluir lançamento"
                        >
                          <Trash2 size={18} />
                        </button>
                        <ChevronRight size={16} className="text-gray-200 group-hover:text-brand-primary transition-colors" />
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
              
              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-24 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300">
                        <Search size={32} />
                      </div>
                      <div>
                        <p className="text-lg font-bold text-brand-navy">Nenhum lançamento encontrado</p>
                        <p className="text-gray-400 text-sm">Tente ajustar seus filtros ou busca.</p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => {setSearchTerm(''); setFilterType('all');}}>
                        Limpar filtros
                      </Button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <AnimatePresence>
        {isModalOpen && (
          <TransactionModal 
            isPersonal={true}
            onClose={() => setIsModalOpen(false)} 
            onSave={(t) => {
              onAdd(t);
              setIsModalOpen(false);
            }} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
