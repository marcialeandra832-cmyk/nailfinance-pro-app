import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { useFinance } from './hooks/useFinance';
import { Dashboard } from './pages/Dashboard';
import { Catalog } from './pages/Catalog';
import { StudioCash } from './pages/StudioCash';
import { PersonalCash } from './pages/PersonalCash';
import { AIAnalysis } from './pages/AIAnalysis';
import { Settings } from './pages/Settings';
import { Subscription } from './pages/Subscription';
import { Calendar, ChevronLeft, ChevronRight, Bell, Search, User as UserIcon } from 'lucide-react';
import { format, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion, AnimatePresence } from 'motion/react';
import { Badge } from './components/UI';
import { Toaster, toast } from 'sonner';
import { useAuth } from './contexts/AuthContext';
import { AuthPage } from './pages/AuthPage';
import { Loader2 } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { user, loading } = useAuth();
  const { 
    services, 
    transactions, 
    settings, 
    summary, 
    selectedMonth, 
    setSelectedMonth,
    addService,
    deleteService,
    addTransaction,
    deleteTransaction,
    updateSettings 
  } = useFinance();

  // Apply dark mode
  React.useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.darkMode]);

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center">
        <Loader2 className="animate-spin text-brand-primary" size={48} />
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <Toaster position="top-right" richColors />
        <AuthPage />
      </>
    );
  }

  const renderPage = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard summary={summary} onGenerateAI={() => setActiveTab('ai')} />;
      case 'catalog':
        return <Catalog services={services} onAdd={addService} onDelete={deleteService} />;
      case 'studio':
        return <StudioCash transactions={transactions} onAdd={addTransaction} onDelete={deleteTransaction} />;
      case 'personal':
        return <PersonalCash transactions={transactions} onAdd={addTransaction} onDelete={deleteTransaction} />;
      case 'ai':
        return <AIAnalysis summary={summary} transactions={transactions} services={services} />;
      case 'settings':
        return <Settings settings={settings} onUpdate={updateSettings} />;
      case 'subscription':
        return <Subscription />;
      default:
        return <Dashboard summary={summary} onGenerateAI={() => setActiveTab('ai')} />;
    }
  };

  const nextMonth = () => setSelectedMonth(addMonths(selectedMonth, 1));
  const prevMonth = () => setSelectedMonth(subMonths(selectedMonth, 1));

  return (
    <div className="flex min-h-screen bg-brand-bg font-sans selection:bg-brand-primary/20 selection:text-brand-primary">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        userName={user.displayName || settings.name}
        plan="Plano Ativo"
      />
      
      <main className="flex-1 h-screen overflow-y-auto relative scroll-smooth bg-brand-bg text-brand-navy">
        <Toaster position="top-right" richColors />
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 bg-brand-bg/80 backdrop-blur-md border-b border-brand-border px-6 py-4 md:px-12">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="hidden md:flex items-center gap-3 bg-brand-card/50 dark:bg-brand-card/20 border border-brand-border px-4 py-2 rounded-2xl w-full max-w-md group focus-within:bg-brand-card focus-within:shadow-sm transition-all">
              <Search size={18} className="text-gray-400 group-focus-within:text-brand-primary transition-colors" />
              <input 
                type="text" 
                placeholder="Buscar no NailFinance..." 
                className="bg-transparent border-none outline-none text-sm w-full text-brand-navy placeholder:text-gray-400 dark:placeholder:text-gray-500"
              />
            </div>

            <div className="flex items-center gap-4 ml-auto">
              {/* Month Selector */}
              <div className="flex items-center gap-1 bg-brand-card px-2 py-1.5 rounded-2xl shadow-sm border border-brand-border">
                <button 
                  onClick={prevMonth}
                  className="p-1.5 hover:bg-brand-bg rounded-xl text-gray-400 hover:text-brand-primary transition-all active:scale-90"
                  title="Mês anterior"
                >
                  <ChevronLeft size={18} />
                </button>
                <div className="flex items-center gap-2 px-3 min-w-[140px] justify-center">
                  <Calendar size={16} className="text-brand-primary" />
                  <span className="text-sm font-bold text-brand-navy capitalize whitespace-nowrap">
                    {format(selectedMonth, 'MMMM yyyy', { locale: ptBR })}
                  </span>
                </div>
                <button 
                  onClick={nextMonth}
                  className="p-1.5 hover:bg-brand-bg rounded-xl text-gray-400 hover:text-brand-primary transition-all active:scale-90"
                  title="Próximo mês"
                >
                  <ChevronRight size={18} />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={() => {
                    if (settings.notifications) {
                      toast.info("Você não tem novas notificações no momento.");
                    } else {
                      toast.warning("As notificações estão desativadas nas configurações.");
                    }
                  }}
                  className="relative p-2.5 bg-brand-card border border-brand-border rounded-2xl text-gray-400 hover:text-brand-primary hover:shadow-sm transition-all active:scale-95"
                >
                  <Bell size={20} />
                  {settings.notifications && (
                    <span className="absolute top-2 right-2 w-2 h-2 bg-brand-primary rounded-full border-2 border-brand-card" />
                  )}
                </button>
                <button 
                  onClick={() => setActiveTab('settings')}
                  className="p-1 bg-brand-card border border-brand-border rounded-2xl hover:shadow-sm transition-all active:scale-95 overflow-hidden"
                >
                  <div className="w-9 h-9 bg-brand-primary/10 flex items-center justify-center text-brand-primary rounded-xl font-bold">
                    {settings.name?.charAt(0).toUpperCase() || <UserIcon size={18} />}
                  </div>
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="p-6 md:p-12">
          <div className="max-w-7xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                {renderPage()}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer Quote */}
          <footer className="mt-24 py-12 border-t border-gray-100/50">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-brand-primary rounded-xl flex items-center justify-center text-white font-bold text-xs">N</div>
                <span className="font-bold text-brand-navy tracking-tight">NailFinance</span>
              </div>
              <p className="text-gray-400 italic font-medium text-sm text-center md:text-left">
                "Lucro real importa mais que faturamento. Seu sucesso é nossa meta."
              </p>
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="text-[10px] opacity-50">v1.2.0</Badge>
                <span className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">© 2026</span>
              </div>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}
