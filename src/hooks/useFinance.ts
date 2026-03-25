import { useState, useEffect, useMemo } from 'react';
import { Service, Transaction, UserSettings, FinancialSummary } from '../types';
import { startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';

const INITIAL_SERVICES: Service[] = [
  { id: '1', name: 'Alongamento Fibra de Vidro', price: 180, materialCost: 45, duration: '2h 30min', category: 'Alongamento' },
  { id: '2', name: 'Manutenção Fibra', price: 120, materialCost: 25, duration: '1h 45min', category: 'Manutenção' },
  { id: '3', name: 'Banho em Gel', price: 90, materialCost: 15, duration: '1h', category: 'Banho em gel' },
];

const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: 't1', type: 'entrada', description: 'Atendimento Maria', category: 'atendimento', amount: 180, date: new Date().toISOString(), isPersonal: false },
  { id: 't2', type: 'saída', description: 'Compra de Lixas', category: 'lixas', amount: 35, date: new Date().toISOString(), isPersonal: false },
  { id: 't3', type: 'saída', description: 'Mercado Semanal', category: 'mercado', amount: 250, date: new Date().toISOString(), isPersonal: true },
  { id: 't4', type: 'entrada', description: 'Retirada para Pessoal', category: 'retirada do negócio', amount: 500, date: new Date().toISOString(), isPersonal: true },
  { id: 't5', type: 'saída', description: 'Retirada do Studio', category: 'retirada do negócio', amount: 500, date: new Date().toISOString(), isPersonal: false },
];

const INITIAL_SETTINGS: UserSettings = {
  name: 'Nail Designer',
  studioName: 'Meu Studio',
  revenueGoal: 5000,
  profitGoal: 3000,
  currency: 'BRL',
  darkMode: false,
  notifications: true,
};

export function useFinance() {
  const [services, setServices] = useState<Service[]>(() => {
    const saved = localStorage.getItem('nailfinance_services');
    return saved ? JSON.parse(saved) : INITIAL_SERVICES;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('nailfinance_transactions');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [settings, setSettings] = useState<UserSettings>(() => {
    const saved = localStorage.getItem('nailfinance_settings');
    return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
  });

  const [selectedMonth, setSelectedMonth] = useState(new Date());

  useEffect(() => {
    localStorage.setItem('nailfinance_services', JSON.stringify(services));
  }, [services]);

  useEffect(() => {
    localStorage.setItem('nailfinance_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('nailfinance_settings', JSON.stringify(settings));
  }, [settings]);

  const addService = (service: Omit<Service, 'id'>) => {
    const newService = { ...service, id: Math.random().toString(36).substr(2, 9) };
    setServices([...services, newService]);
  };

  const deleteService = (id: string) => {
    setServices(services.filter(s => s.id !== id));
  };

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction = { ...transaction, id: Math.random().toString(36).substr(2, 9) };
    setTransactions([...transactions, newTransaction]);
  };

  const deleteTransaction = (id: string) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  const currentMonthSummary = useMemo((): FinancialSummary => {
    const start = startOfMonth(selectedMonth);
    const end = endOfMonth(selectedMonth);

    const monthTransactions = transactions.filter(t => 
      isWithinInterval(parseISO(t.date), { start, end })
    );

    const studioRevenue = monthTransactions
      .filter(t => !t.isPersonal && t.type === 'entrada')
      .reduce((acc, t) => acc + t.amount, 0);

    const studioCosts = monthTransactions
      .filter(t => !t.isPersonal && t.type === 'saída')
      .reduce((acc, t) => acc + t.amount, 0);

    const personalIncome = monthTransactions
      .filter(t => t.isPersonal && t.type === 'entrada')
      .reduce((acc, t) => acc + t.amount, 0);

    const personalExpenses = monthTransactions
      .filter(t => t.isPersonal && t.type === 'saída')
      .reduce((acc, t) => acc + t.amount, 0);

    const realProfit = studioRevenue - studioCosts;
    const profitMargin = studioRevenue > 0 ? (realProfit / studioRevenue) * 100 : 0;
    const personalBalance = personalIncome - personalExpenses;

    return {
      studioRevenue,
      studioCosts,
      realProfit,
      profitMargin,
      personalBalance,
    };
  }, [transactions, selectedMonth]);

  return {
    services,
    transactions,
    settings,
    selectedMonth,
    setSelectedMonth,
    summary: currentMonthSummary,
    addService,
    deleteService,
    addTransaction,
    deleteTransaction,
    updateSettings: setSettings,
  };
}
