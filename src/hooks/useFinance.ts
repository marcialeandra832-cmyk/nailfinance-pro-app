import { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Service, 
  Transaction, 
  UserSettings, 
  FinancialSummary, 
  UserSubscription 
} from '../types';
import { 
  startOfMonth, 
  endOfMonth, 
  isWithinInterval, 
  parseISO, 
  subMonths 
} from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import { ref, get, set } from 'firebase/database';
import { database } from '../firebase';
import { toast } from 'sonner';

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

const INITIAL_SUBSCRIPTION: UserSubscription = {
  planId: 'mensal',
  planName: 'Mensal VIP',
  status: 'active',
  purchasedAt: new Date().toISOString(),
  paymentMethod: 'kiwify'
};

export function useFinance() {
  const { user } = useAuth();
  const userId = user?.uid || 'guest';

  const [services, setServices] = useState<Service[]>(() => {
    const saved = localStorage.getItem(`nailfinance_${userId}_services`);
    return saved ? JSON.parse(saved) : INITIAL_SERVICES;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem(`nailfinance_${userId}_transactions`);
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [settings, setSettings] = useState<UserSettings>(() => {
    const saved = localStorage.getItem(`nailfinance_${userId}_settings`);
    return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
  });

  const [subscription, setSubscription] = useState<UserSubscription>(() => {
    const saved = localStorage.getItem(`nailfinance_${userId}_subscription`);
    return saved ? JSON.parse(saved) : INITIAL_SUBSCRIPTION;
  });

  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [isLoadingDb, setIsLoadingDb] = useState(false);

  // Sync from Firebase Realtime Database on login / user change
  useEffect(() => {
    if (!user) return;

    let isMounted = true;
    setIsLoadingDb(true);

    const loadUserData = async () => {
      try {
        const userRef = ref(database, `user_data/${user.uid}`);
        const snapshot = await get(userRef);

        if (snapshot.exists() && isMounted) {
          const data = snapshot.val();
          if (data.services && Array.isArray(data.services)) {
            setServices(data.services);
          }
          if (data.transactions && Array.isArray(data.transactions)) {
            setTransactions(data.transactions);
          }
          if (data.settings && typeof data.settings === 'object') {
            setSettings(prev => ({ ...prev, ...data.settings }));
          }
          if (data.subscription && typeof data.subscription === 'object') {
            setSubscription(prev => ({ ...prev, ...data.subscription }));
          }
        }

        // Sync verified subscription status from Kiwify backend endpoint
        if (user.email) {
          try {
            const res = await fetch(`/api/subscription/check?email=${encodeURIComponent(user.email)}`);
            if (res.ok && isMounted) {
              const serverSub = await res.json();
              if (serverSub && serverSub.status) {
                setSubscription(prev => ({
                  ...prev,
                  status: serverSub.status,
                  planName: serverSub.planName || prev.planName,
                  expiresAt: serverSub.expiresAt || prev.expiresAt,
                  nextBillingAt: serverSub.nextBillingAt || prev.nextBillingAt,
                  paymentMethod: serverSub.paymentMethod || prev.paymentMethod
                }));
              }
            }
          } catch (apiErr) {
            console.warn('Verificação de assinatura Kiwify offline:', apiErr);
          }
        }
      } catch (err) {
        console.warn('Uso de dados do armazenamento local (offline/db):', err);
      } finally {
        if (isMounted) setIsLoadingDb(false);
      }
    };

    loadUserData();

    return () => {
      isMounted = false;
    };
  }, [user]);

  // Persistence handler
  const syncToStorage = useCallback((
    updatedServices?: Service[],
    updatedTransactions?: Transaction[],
    updatedSettings?: UserSettings,
    updatedSub?: UserSubscription
  ) => {
    const currentServices = updatedServices ?? services;
    const currentTransactions = updatedTransactions ?? transactions;
    const currentSettings = updatedSettings ?? settings;
    const currentSub = updatedSub ?? subscription;

    localStorage.setItem(`nailfinance_${userId}_services`, JSON.stringify(currentServices));
    localStorage.setItem(`nailfinance_${userId}_transactions`, JSON.stringify(currentTransactions));
    localStorage.setItem(`nailfinance_${userId}_settings`, JSON.stringify(currentSettings));
    localStorage.setItem(`nailfinance_${userId}_subscription`, JSON.stringify(currentSub));

    if (user) {
      const userRef = ref(database, `user_data/${user.uid}`);
      set(userRef, {
        services: currentServices,
        transactions: currentTransactions,
        settings: currentSettings,
        subscription: currentSub,
        updatedAt: new Date().toISOString()
      }).catch(err => {
        console.warn('Erro ao atualizar banco em nuvem:', err);
      });
    }
  }, [userId, user, services, transactions, settings, subscription]);

  // Service CRUD
  const addService = (serviceData: Omit<Service, 'id'>) => {
    if (!serviceData.name.trim()) {
      toast.error('O nome do serviço é obrigatório.');
      return;
    }
    if (isNaN(serviceData.price) || serviceData.price <= 0) {
      toast.error('Insira um preço válido maior que zero.');
      return;
    }

    const newService: Service = {
      ...serviceData,
      id: `srv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
    };
    const nextServices = [newService, ...services];
    setServices(nextServices);
    syncToStorage(nextServices);
    toast.success('Serviço adicionado com sucesso!');
  };

  const updateService = (updated: Service) => {
    const nextServices = services.map(s => s.id === updated.id ? updated : s);
    setServices(nextServices);
    syncToStorage(nextServices);
    toast.success('Serviço atualizado com sucesso!');
  };

  const deleteService = (id: string) => {
    const nextServices = services.filter(s => s.id !== id);
    setServices(nextServices);
    syncToStorage(nextServices);
    toast.success('Serviço removido.');
  };

  // Transaction CRUD
  const addTransaction = (transactionData: Omit<Transaction, 'id'>) => {
    if (!transactionData.description.trim()) {
      toast.error('A descrição do lançamento é obrigatória.');
      return;
    }
    if (isNaN(transactionData.amount) || transactionData.amount <= 0) {
      toast.error('O valor deve ser positivo e válido.');
      return;
    }

    const newTransaction: Transaction = {
      ...transactionData,
      id: `tr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
    };
    const nextTransactions = [newTransaction, ...transactions];
    setTransactions(nextTransactions);
    syncToStorage(undefined, nextTransactions);
    toast.success('Lançamento registrado com sucesso!');
  };

  const updateTransaction = (updated: Transaction) => {
    const nextTransactions = transactions.map(t => t.id === updated.id ? updated : t);
    setTransactions(nextTransactions);
    syncToStorage(undefined, nextTransactions);
    toast.success('Lançamento alterado com sucesso!');
  };

  const deleteTransaction = (id: string) => {
    const nextTransactions = transactions.filter(t => t.id !== id);
    setTransactions(nextTransactions);
    syncToStorage(undefined, nextTransactions);
    toast.success('Lançamento excluído com sucesso.');
  };

  // Settings & Subscription Updates
  const updateSettings = (newSettings: Partial<UserSettings>) => {
    const next = { ...settings, ...newSettings };
    setSettings(next);
    syncToStorage(undefined, undefined, next);
    toast.success('Configurações salvas!');
  };

  const updateSubscription = (newSub: Partial<UserSubscription>) => {
    const next = { ...subscription, ...newSub };
    setSubscription(next);
    syncToStorage(undefined, undefined, undefined, next);
    toast.success('Status da assinatura atualizado.');
  };

  // Filtered lists for selected month
  const monthTransactions = useMemo(() => {
    const start = startOfMonth(selectedMonth);
    const end = endOfMonth(selectedMonth);

    return transactions.filter(t => {
      if (!t.date) return false;
      try {
        const dateObj = parseISO(t.date);
        return isWithinInterval(dateObj, { start, end });
      } catch {
        return false;
      }
    });
  }, [transactions, selectedMonth]);

  const monthStudioTransactions = useMemo(() => {
    return monthTransactions.filter(t => !t.isPersonal);
  }, [monthTransactions]);

  const monthPersonalTransactions = useMemo(() => {
    return monthTransactions.filter(t => t.isPersonal);
  }, [monthTransactions]);

  // Financial Summary Calculation
  const summary = useMemo((): FinancialSummary => {
    const studioEntries = monthStudioTransactions.filter(t => t.type === 'entrada');
    const studioExits = monthStudioTransactions.filter(t => t.type === 'saída');

    const studioRevenue = studioEntries.reduce((acc, t) => acc + t.amount, 0);
    const studioCosts = studioExits.reduce((acc, t) => acc + t.amount, 0);

    const personalEntries = monthPersonalTransactions.filter(t => t.type === 'entrada');
    const personalExits = monthPersonalTransactions.filter(t => t.type === 'saída');

    const personalIncome = personalEntries.reduce((acc, t) => acc + t.amount, 0);
    const personalExpenses = personalExits.reduce((acc, t) => acc + t.amount, 0);

    const realProfit = studioRevenue - studioCosts;
    const profitMargin = studioRevenue > 0 ? (realProfit / studioRevenue) * 100 : 0;
    const personalBalance = personalIncome - personalExpenses;

    const studioEntriesCount = studioEntries.length;
    const averageTicket = studioEntriesCount > 0 ? studioRevenue / studioEntriesCount : 0;
    const revenueGoalProgress = settings.revenueGoal > 0 
      ? Math.min((studioRevenue / settings.revenueGoal) * 100, 100)
      : 0;

    // Previous month comparison
    const prevMonthDate = subMonths(selectedMonth, 1);
    const prevStart = startOfMonth(prevMonthDate);
    const prevEnd = endOfMonth(prevMonthDate);

    const previousMonthRevenue = transactions
      .filter(t => !t.isPersonal && t.type === 'entrada' && t.date && isWithinInterval(parseISO(t.date), { start: prevStart, end: prevEnd }))
      .reduce((acc, t) => acc + t.amount, 0);

    const revenueGrowthPercent = previousMonthRevenue > 0
      ? ((studioRevenue - previousMonthRevenue) / previousMonthRevenue) * 100
      : 0;

    return {
      studioRevenue,
      studioCosts,
      realProfit,
      profitMargin,
      personalBalance,
      averageTicket,
      studioEntriesCount,
      revenueGoalProgress,
      previousMonthRevenue,
      revenueGrowthPercent,
    };
  }, [monthStudioTransactions, monthPersonalTransactions, settings.revenueGoal, selectedMonth, transactions]);

  return {
    services,
    transactions,
    monthTransactions,
    monthStudioTransactions,
    monthPersonalTransactions,
    settings,
    subscription,
    selectedMonth,
    setSelectedMonth,
    summary,
    isLoadingDb,
    addService,
    updateService,
    deleteService,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    updateSettings,
    updateSubscription,
  };
}
