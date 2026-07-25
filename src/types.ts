/**
 * NailFinance Shared Type Definitions
 */

export type TransactionType = 'entrada' | 'saída';

export type StudioCategory = 
  | 'atendimento' 
  | 'sinal' 
  | 'pacote' 
  | 'venda de produto' 
  | 'esmaltes'
  | 'brocas'
  | 'lixas'
  | 'cabine'
  | 'materiais descartáveis'
  | 'aluguel'
  | 'transporte'
  | 'energia'
  | 'internet'
  | 'cursos'
  | 'marketing'
  | 'manutenção'
  | 'outro';

export type PersonalCategory = 
  | 'mercado'
  | 'contas'
  | 'transporte'
  | 'saúde'
  | 'lazer'
  | 'retirada do negócio'
  | 'outros';

export type ServiceCategory = 
  | 'Alongamento'
  | 'Banho em gel'
  | 'Manutenção'
  | 'Esmaltação em gel'
  | 'Blindagem'
  | 'Decoração'
  | 'Outros';

export interface Service {
  id: string;
  name: string;
  price: number;
  materialCost: number;
  duration: string;
  category: ServiceCategory;
  notes?: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  description: string;
  category: string;
  amount: number;
  date: string;
  paymentMethod?: string;
  serviceId?: string;
  notes?: string;
  isPersonal: boolean;
}

export interface UserSettings {
  name: string;
  studioName: string;
  revenueGoal: number;
  profitGoal: number;
  currency: string;
  darkMode: boolean;
  notifications: boolean;
}

export interface FinancialSummary {
  studioRevenue: number;
  studioCosts: number;
  realProfit: number;
  profitMargin: number;
  personalBalance: number;
  averageTicket: number;
  studioEntriesCount: number;
  revenueGoalProgress: number;
  previousMonthRevenue: number;
  revenueGrowthPercent: number;
}

export type SubscriptionPlanId = 'free' | 'mensal' | 'anual';
export type SubscriptionStatus = 'active' | 'pending_payment' | 'overdue' | 'canceled' | 'expired';

export interface UserSubscription {
  planId: SubscriptionPlanId;
  planName: string;
  status: SubscriptionStatus;
  purchasedAt?: string;
  expiresAt?: string;
  nextBillingAt?: string;
  paymentMethod?: 'credit_card' | 'pix' | 'boleto' | 'kiwify';
  kiwifyOrderId?: string;
}

export interface AIInsight {
  type: 'success' | 'warning' | 'danger' | 'info';
  title: string;
  text: string;
}

export interface AIConsultationResponse {
  insights: AIInsight[];
  suggestion: string;
}
