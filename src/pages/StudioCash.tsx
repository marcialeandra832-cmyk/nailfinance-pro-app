import React, { useState } from 'react';
import { 
  Plus, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Search, 
  Trash2, 
  Wallet, 
  X,
  CreditCard,
  Calendar as CalendarIcon,
  Filter
} from 'lucide-react';
import { Card, Button, Badge, Input } from '../components/UI';
import { formatCurrency, cn } from '../lib/utils';
import { Transaction, StudioCategory, TransactionType } from '../types';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

interface StudioCashProps {
  transactions: Transaction[];
  selectedMonth: Date;
  onAdd: (t: Omit<Transaction, 'id'>) => void;
  onDelete: (id: string) => void;
}

const STUDIO_ENTRY_CATEGORIES: StudioCategory[] = ['atendimento', 'sinal', 'pacote', 'venda de produto', 'outro'];
const STUDIO_EXIT_CATEGORIES: StudioCategory[] = [
  'esmaltes', 'brocas', 'lixas', 'cabine', 'materiais descartáveis', 
  'aluguel', 'transporte', 'energia', 'internet', 'cursos', 'marketing', 'manutenção', 'outro'
];

export function StudioCash({ transactions, selectedMonth, onAdd, onDelete }: StudioCashProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'entrada' | 'saída'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Form fields
  const [type, setType] = useState<TransactionType>('entrada');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<StudioCategory>('atendimento');
  const [paymentMethod, setPaymentMethod] = useState('Pix');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const studioTransactions = transactions.filter(t => !t.isPersonal);
  const filteredTransactions = studioTransactions.filter(t => {
    const matchesType = filterType === 'all' || t.type === filterType;
    const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  const totalIn = studioTransactions.filter(t => t.type === 'entrada').reduce((acc, t) => acc + t.amount, 0);
  const totalOut = studioTransactions.filter(t => t.type === 'saída').reduce((acc, t) => acc + t.amount, 0);
  const balance = totalIn - totalOut;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);

    if (!description.trim()) {
      toast.error('Informe a descrição do lançamento.');
      return;
    }
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error('Informe um valor numérico válido maior que zero.');
      return;
    }

    onAdd({
      type,
      description,
      category,
      amount: parsedAmount,
      date: new Date(date).toISOString(),
      paymentMethod,
      isPersonal: false
    });

    setIsModalOpen(false);
    setDescription('');
    setAmount('');
  };

  const confirmDelete = (id: string) => {
    onDelete(id);
    setDeleteConfirmId(null);
  };

  return (
    <div className="space-y-10 pb-12">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-brand-navy">Caixa do Studio</h1>
          <p className="text-slate-500 mt-1 font-medium text-sm md:text-base">
            Movimentações do negócio em <strong className="capitalize text-brand-navy">{format(selectedMonth, 'MMMM yyyy', { locale: ptBR })}</strong>.
          </p>
        </div>
        
        <Button onClick={() => setIsModalOpen(true)} size="lg" className="shadow-lg shadow-pink-200">
          <Plus size={20} className="mr-2" />
          Nova Movimentação
        </Button>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="bg-white border-brand-border">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-gray-400 uppercase">Entradas Studio</span>
            <ArrowUpCircle className="text-emerald-500" size={24} />
          </div>
          <p className="text-3xl font-serif font-bold text-emerald-600">{formatCurrency(totalIn)}</p>
          <p className="text-xs text-gray-400 mt-2">Recebimentos de atendimentos e serviços.</p>
        </Card>

        <Card className="bg-white border-brand-border">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-gray-400 uppercase">Saídas Studio</span>
            <ArrowDownCircle className="text-red-500" size={24} />
          </div>
          <p className="text-3xl font-serif font-bold text-red-600">{formatCurrency(totalOut)}</p>
          <p className="text-xs text-gray-400 mt-2">Pagamentos de insumos e contas do studio.</p>
        </Card>

        <Card className="bg-brand-navy text-white border-none shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-blue-200 uppercase">Saldo do Caixa</span>
            <Wallet className="text-pink-400" size={24} />
          </div>
          <p className="text-3xl font-serif font-bold text-white">{formatCurrency(balance)}</p>
          <p className="text-xs text-blue-100/70 mt-2">Resultado líquido do negócio no mês.</p>
        </Card>
      </div>

      {/* Filter and Table Card */}
      <Card className="overflow-hidden border-brand-border bg-white shadow-sm p-0">
        <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex p-1 bg-white rounded-2xl border border-brand-border w-fit">
            <button 
              type="button"
              onClick={() => setFilterType('all')}
              className={cn(
                "px-5 py-2 rounded-xl text-xs font-bold transition-all", 
                filterType === 'all' ? "bg-brand-navy text-white shadow-sm" : "text-gray-500 hover:text-brand-navy"
              )}
            >
              Todas
            </button>
            <button 
              type="button"
              onClick={() => setFilterType('entrada')}
              className={cn(
                "px-5 py-2 rounded-xl text-xs font-bold transition-all", 
                filterType === 'entrada' ? "bg-emerald-600 text-white shadow-sm" : "text-gray-500 hover:text-emerald-600"
              )}
            >
              Entradas
            </button>
            <button 
              type="button"
              onClick={() => setFilterType('saída')}
              className={cn(
                "px-5 py-2 rounded-xl text-xs font-bold transition-all", 
                filterType === 'saída' ? "bg-red-600 text-white shadow-sm" : "text-gray-500 hover:text-red-600"
              )}
            >
              Saídas
            </button>
          </div>

          <div className="flex-1 max-w-md">
            <Input 
              aria-label="Buscar lançamentos no caixa do studio"
              placeholder="Buscar por descrição..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white"
            />
          </div>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="py-16 text-center text-gray-500">
            <p className="font-bold text-brand-navy mb-1">Nenhuma movimentação registrada</p>
            <p className="text-xs mb-4">Adicione suas entradas de atendimento ou despesas para manter o caixa atualizado.</p>
            <Button size="sm" onClick={() => setIsModalOpen(true)}>
              <Plus size={16} className="mr-1" /> Registrar Lançamento
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[10px] font-black text-gray-400 uppercase tracking-wider border-b border-gray-100 bg-gray-50/30">
                  <th className="px-6 py-4">Descrição</th>
                  <th className="px-6 py-4">Categoria</th>
                  <th className="px-6 py-4">Forma Pagto</th>
                  <th className="px-6 py-4">Data</th>
                  <th className="px-6 py-4">Valor</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm font-semibold text-brand-navy">
                {filteredTransactions.map(t => (
                  <tr key={t.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold">{t.description}</td>
                    <td className="px-6 py-4 capitalize text-xs">
                      <Badge variant="outline">{t.category}</Badge>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500 font-medium">{t.paymentMethod || 'Pix'}</td>
                    <td className="px-6 py-4 text-xs text-gray-500">
                      {t.date ? format(parseISO(t.date), 'dd/MM/yyyy') : '-'}
                    </td>
                    <td className={cn("px-6 py-4 font-bold text-base", t.type === 'entrada' ? "text-emerald-600" : "text-red-600")}>
                      {t.type === 'entrada' ? '+' : '-'} {formatCurrency(t.amount)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        type="button"
                        onClick={() => setDeleteConfirmId(t.id)}
                        aria-label={`Excluir lançamento ${t.description}`}
                        className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Delete Modal */}
      <AnimatePresence>
        {deleteConfirmId && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-tx-title"
            onKeyDown={e => e.key === 'Escape' && setDeleteConfirmId(null)}
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl text-center"
            >
              <h3 id="delete-tx-title" className="text-lg font-bold text-brand-navy">Remover Lançamento?</h3>
              <p className="text-xs text-gray-500 font-medium">Esta movimentação será excluída dos seus totais do mês.</p>
              <div className="flex items-center gap-3 pt-2">
                <Button variant="ghost" fullWidth onClick={() => setDeleteConfirmId(null)}>
                  Cancelar
                </Button>
                <Button variant="danger" fullWidth onClick={() => confirmDelete(deleteConfirmId)}>
                  Remover
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Transaction Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-tx-title"
            onKeyDown={e => e.key === 'Escape' && setIsModalOpen(false)}
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[2rem] max-w-lg w-full p-8 relative shadow-2xl space-y-6"
            >
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)}
                aria-label="Fechar modal de lançamento"
                className="absolute top-6 right-6 p-2 rounded-xl text-gray-400 hover:bg-gray-100 hover:text-brand-navy transition-colors"
              >
                <X size={20} />
              </button>

              <h2 id="add-tx-title" className="text-2xl font-serif font-bold text-brand-navy">
                Nova Movimentação (Studio)
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex gap-2 p-1 bg-gray-100 rounded-2xl">
                  <button 
                    type="button"
                    onClick={() => {
                      setType('entrada');
                      setCategory('atendimento');
                    }}
                    className={cn(
                      "flex-1 py-3 rounded-xl font-bold text-xs transition-all",
                      type === 'entrada' ? "bg-emerald-600 text-white shadow-sm" : "text-gray-500 hover:text-emerald-600"
                    )}
                  >
                    + Entrada (Recebimento)
                  </button>
                  <button 
                    type="button"
                    onClick={() => {
                      setType('saída');
                      setCategory('lixas');
                    }}
                    className={cn(
                      "flex-1 py-3 rounded-xl font-bold text-xs transition-all",
                      type === 'saída' ? "bg-red-600 text-white shadow-sm" : "text-gray-500 hover:text-red-600"
                    )}
                  >
                    - Saída (Despesa)
                  </button>
                </div>

                <div>
                  <label htmlFor="tx-desc" className="block text-xs font-bold text-gray-600 mb-1">Descrição *</label>
                  <input 
                    id="tx-desc"
                    required
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder={type === 'entrada' ? 'Ex: Atendimento cliente Flávia' : 'Ex: Compra de brocas e esmaltes'}
                    className="w-full px-4 py-3 rounded-xl border border-brand-border bg-gray-50 text-brand-navy font-bold text-sm outline-none focus:ring-2 focus:ring-brand-primary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="tx-amount" className="block text-xs font-bold text-gray-600 mb-1">Valor (R$) *</label>
                    <input 
                      id="tx-amount"
                      type="number"
                      step="0.01"
                      required
                      value={amount}
                      onChange={e => setAmount(e.target.value)}
                      placeholder="120.00"
                      className="w-full px-4 py-3 rounded-xl border border-brand-border bg-gray-50 text-brand-navy font-bold text-sm outline-none focus:ring-2 focus:ring-brand-primary"
                    />
                  </div>

                  <div>
                    <label htmlFor="tx-category" className="block text-xs font-bold text-gray-600 mb-1">Categoria</label>
                    <select 
                      id="tx-category"
                      value={category}
                      onChange={e => setCategory(e.target.value as StudioCategory)}
                      className="w-full px-4 py-3 rounded-xl border border-brand-border bg-gray-50 text-brand-navy font-bold text-sm outline-none focus:ring-2 focus:ring-brand-primary cursor-pointer capitalize"
                    >
                      {(type === 'entrada' ? STUDIO_ENTRY_CATEGORIES : STUDIO_EXIT_CATEGORIES).map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="tx-paymethod" className="block text-xs font-bold text-gray-600 mb-1">Forma de Pagamento</label>
                    <select 
                      id="tx-paymethod"
                      value={paymentMethod}
                      onChange={e => setPaymentMethod(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-brand-border bg-gray-50 text-brand-navy font-bold text-sm outline-none focus:ring-2 focus:ring-brand-primary cursor-pointer"
                    >
                      <option value="Pix">Pix</option>
                      <option value="Cartão de Crédito">Cartão de Crédito</option>
                      <option value="Cartão de Débito">Cartão de Débito</option>
                      <option value="Dinheiro">Dinheiro</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="tx-date" className="block text-xs font-bold text-gray-600 mb-1">Data</label>
                    <input 
                      id="tx-date"
                      type="date"
                      value={date}
                      onChange={e => setDate(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-brand-border bg-gray-50 text-brand-navy font-bold text-sm outline-none focus:ring-2 focus:ring-brand-primary"
                    />
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-end gap-3">
                  <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    Registrar Lançamento
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
