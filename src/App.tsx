import React, { useState, useRef, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { useFinance } from './hooks/useFinance';
import { Dashboard } from './pages/Dashboard';
import { Catalog } from './pages/Catalog';
import { StudioCash } from './pages/StudioCash';
import { PersonalCash } from './pages/PersonalCash';
import { AIAnalysis } from './pages/AIAnalysis';
import { Settings } from './pages/Settings';
import { FAQ } from './pages/FAQ';
import { CheckoutReturn } from './pages/CheckoutReturn';
import { Calendar, ChevronLeft, ChevronRight, Bell, Search, User as UserIcon, X, Loader2 } from 'lucide-react';
import { format, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion, AnimatePresence } from 'motion/react';
import { Badge } from './components/UI';
import { Toaster, toast } from 'sonner';
import { useAuth } from './contexts/AuthContext';
import { AuthPage } from './pages/AuthPage';
import { ErrorBoundary } from './components/ErrorBoundary';
import { formatCurrency } from './lib/utils';

const nailBg = '/nail_bg.png';

function MainLayout({ children, user, settings, selectedMonth, prevMonth, nextMonth, services, monthTransactions }: any) {
  const navigate = useNavigate();
  const [globalSearch, setGlobalSearch] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Search results
  const matchedServices = (services || []).filter((s: any) => 
    globalSearch.trim() && (s?.name || '').toLowerCase().includes(globalSearch.toLowerCase())
  );
  const matchedTransactions = (monthTransactions || []).filter((t: any) => 
    globalSearch.trim() && (t?.description || '').toLowerCase().includes(globalSearch.toLowerCase())
  );

  const hasSearchMatches = matchedServices.length > 0 || matchedTransactions.length > 0;

  return (
    <div className="flex min-h-screen bg-brand-bg font-sans selection:bg-brand-primary/20 selection:text-brand-primary">
      <Sidebar 
        userName={user.displayName || settings.name}
        plan="NailFinance Pro"
      />
      
      <main className="flex-1 h-screen overflow-y-auto relative scroll-smooth bg-brand-bg text-brand-navy">
        {/* Subtle background watermark pattern */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-[0.12] dark:opacity-[0.05]"
          style={{ 
            backgroundImage: `url(${nailBg})`,
            backgroundSize: '280px',
            backgroundRepeat: 'repeat',
          }}
        />

        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 bg-brand-bg/85 backdrop-blur-md border-b border-brand-border/60 px-6 py-4 md:px-12">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            
            {/* Global Search Input */}
            <div ref={searchContainerRef} className="relative hidden md:block w-full max-w-md">
              <div className="flex items-center gap-3 bg-white border border-brand-border/80 px-4 py-2.5 rounded-2xl w-full group focus-within:shadow-md focus-within:border-brand-pink transition-all">
                <Search size={18} className="text-gray-400 group-focus-within:text-brand-pink transition-colors shrink-0" />
                <input 
                  type="text" 
                  aria-label="Buscar serviços e lançamentos no NailFinance"
                  placeholder="Buscar serviços, despesas e atendimentos..." 
                  value={globalSearch}
                  onChange={e => setGlobalSearch(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  className="bg-transparent border-none outline-none text-sm w-full text-brand-navy placeholder:text-gray-400 font-medium"
                />
                {globalSearch && (
                  <button 
                    type="button"
                    onClick={() => setGlobalSearch('')}
                    aria-label="Limpar campo de busca"
                    className="p-1 rounded-full text-gray-400 hover:text-brand-navy"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Global Search Results Dropdown */}
              <AnimatePresence>
                {isSearchFocused && globalSearch.trim().length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-brand-border p-4 z-50 max-h-96 overflow-y-auto space-y-4"
                  >
                    {!hasSearchMatches ? (
                      <p className="text-xs text-gray-400 text-center py-4 font-semibold">Nenhum resultado para "{globalSearch}"</p>
                    ) : (
                      <>
                        {matchedServices.length > 0 && (
                          <div>
                            <span className="text-[10px] font-black uppercase text-brand-pink tracking-wider block mb-2">Procedimentos ({matchedServices.length})</span>
                            <div className="space-y-1">
                              {matchedServices.map((s: any) => (
                                <button
                                  key={s.id}
                                  type="button"
                                  onClick={() => {
                                    setIsSearchFocused(false);
                                    setGlobalSearch('');
                                    navigate('/catalog');
                                  }}
                                  className="w-full text-left p-2.5 rounded-xl hover:bg-pink-50 flex items-center justify-between text-xs font-bold text-brand-navy transition-colors"
                                >
                                  <span>{s.name}</span>
                                  <span className="text-brand-primary">{formatCurrency(s.price)}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {matchedTransactions.length > 0 && (
                          <div>
                            <span className="text-[10px] font-black uppercase text-brand-pink tracking-wider block mb-2">Lançamentos do Mês ({matchedTransactions.length})</span>
                            <div className="space-y-1">
                              {matchedTransactions.map((t: any) => (
                                <button
                                  key={t.id}
                                  type="button"
                                  onClick={() => {
                                    setIsSearchFocused(false);
                                    setGlobalSearch('');
                                    navigate(t.isPersonal ? '/personal' : '/studio');
                                  }}
                                  className="w-full text-left p-2.5 rounded-xl hover:bg-gray-50 flex items-center justify-between text-xs font-bold text-brand-navy transition-colors"
                                >
                                  <div>
                                    <p>{t.description}</p>
                                    <span className="text-[10px] font-normal text-gray-400">{t.isPersonal ? 'Caixa Pessoal' : 'Caixa Studio'}</span>
                                  </div>
                                  <span className={t.type === 'entrada' ? 'text-emerald-600 font-bold' : 'text-red-600 font-bold'}>
                                    {t.type === 'entrada' ? '+' : '-'} {formatCurrency(t.amount)}
                                  </span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-3 ml-auto">
              {/* Month Selector */}
              <div className="flex items-center gap-1 bg-white px-2 py-1.5 rounded-2xl shadow-sm border border-brand-border/80">
                <button 
                  type="button"
                  onClick={prevMonth}
                  aria-label="Mês anterior"
                  className="p-1.5 hover:bg-pink-50 rounded-xl text-gray-400 hover:text-brand-pink transition-all focus-visible:ring-2 focus-visible:ring-brand-pink focus-visible:outline-none"
                >
                  <ChevronLeft size={18} />
                </button>
                <div className="flex items-center gap-2 px-3 min-w-[140px] justify-center">
                  <Calendar size={16} className="text-brand-pink shrink-0" />
                  <span className="text-xs md:text-sm font-bold text-brand-navy capitalize whitespace-nowrap">
                    {format(selectedMonth, 'MMMM yyyy', { locale: ptBR })}
                  </span>
                </div>
                <button 
                  type="button"
                  onClick={nextMonth}
                  aria-label="Próximo mês"
                  className="p-1.5 hover:bg-pink-50 rounded-xl text-gray-400 hover:text-brand-pink transition-all focus-visible:ring-2 focus-visible:ring-brand-pink focus-visible:outline-none"
                >
                  <ChevronRight size={18} />
                </button>
              </div>

              {/* Notifications */}
              <button 
                type="button"
                onClick={() => {
                  if (settings.notifications) {
                    toast.info("Tudo em dia! Nenhuma pendência no seu estúdio.");
                  } else {
                    toast.warning("Lembretes desativados nas configurações.");
                  }
                }}
                aria-label="Ver notificações"
                className="relative p-2.5 bg-white border border-brand-border/80 rounded-2xl text-gray-400 hover:text-brand-pink hover:shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-brand-pink focus-visible:outline-none"
              >
                <Bell size={18} />
                {settings.notifications && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-brand-pink rounded-full border-2 border-white animate-pulse" />
                )}
              </button>

              {/* Profile Shortcut */}
              <button 
                type="button"
                onClick={() => navigate('/settings')}
                aria-label="Configurações de perfil"
                className="p-1 bg-white border border-brand-border/80 rounded-2xl hover:shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-brand-pink focus-visible:outline-none"
              >
                <div className="w-8 h-8 bg-brand-navy text-white flex items-center justify-center rounded-xl font-bold text-xs">
                  {settings.name?.charAt(0).toUpperCase() || <UserIcon size={16} />}
                </div>
              </button>
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <div className="p-6 md:p-12">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>

          {/* Footer Quote */}
          <footer className="mt-20 py-10 border-t border-brand-border/40 text-xs">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-gray-400">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-brand-pink rounded-xl flex items-center justify-center text-white font-serif font-bold text-xs">N</div>
                <span className="font-bold text-brand-navy text-sm font-serif">NailFinance</span>
              </div>
              <p className="italic font-medium text-center md:text-left">
                "Lucro real e controle na bancada: o segredo de um studio de sucesso."
              </p>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="text-[10px]">v1.2.0 • NailFinance Pro</Badge>
                <span className="text-[10px] text-gray-400 font-bold uppercase">© 2026</span>
              </div>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}

function AuthenticatedRoutes() {
  const { user, authorized } = useAuth();
  const finance = useFinance();

  if (!user || !authorized) {
    return <Navigate to="/login" replace />;
  }

  const nextMonth = () => finance.setSelectedMonth(addMonths(finance.selectedMonth, 1));
  const prevMonth = () => finance.setSelectedMonth(subMonths(finance.selectedMonth, 1));

  return (
    <MainLayout 
      user={user} 
      settings={finance.settings}
      selectedMonth={finance.selectedMonth}
      prevMonth={prevMonth}
      nextMonth={nextMonth}
      services={finance.services}
      monthTransactions={finance.monthTransactions}
    >
      <Routes>
        <Route 
          path="/dashboard" 
          element={
            <Dashboard 
              summary={finance.summary} 
              selectedMonth={finance.selectedMonth} 
              transactions={finance.transactions}
            />
          } 
        />
        <Route 
          path="/catalog" 
          element={
            <Catalog 
              services={finance.services} 
              onAdd={finance.addService} 
              onUpdate={finance.updateService}
              onDelete={finance.deleteService} 
              settings={finance.settings}
            />
          } 
        />
        <Route 
          path="/studio" 
          element={
            <StudioCash 
              transactions={finance.monthTransactions} 
              selectedMonth={finance.selectedMonth}
              onAdd={finance.addTransaction} 
              onDelete={finance.deleteTransaction}
            />
          } 
        />
        <Route 
          path="/personal" 
          element={
            <PersonalCash 
              transactions={finance.monthTransactions} 
              selectedMonth={finance.selectedMonth}
              onAdd={finance.addTransaction} 
              onDelete={finance.deleteTransaction}
            />
          } 
        />
        <Route 
          path="/ai" 
          element={
            <AIAnalysis 
              services={finance.services} 
              transactions={finance.monthTransactions} 
              settings={finance.settings} 
              summary={finance.summary}
              selectedMonth={finance.selectedMonth}
            />
          } 
        />
        <Route 
          path="/settings" 
          element={
            <Settings 
              settings={finance.settings} 
              onUpdate={finance.updateSettings} 
            />
          } 
        />
        <Route path="/subscription" element={<Navigate to="/dashboard" replace />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </MainLayout>
  );
}

export default function App() {
  const { user, loading, authorized } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center">
        <Loader2 className="animate-spin text-brand-pink" size={44} />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Toaster position="top-right" richColors />
        <Routes>
          <Route 
            path="/login" 
            element={user && authorized ? <Navigate to="/dashboard" replace /> : <AuthPage />} 
          />
          <Route path="/post-purchase" element={<CheckoutReturn />} />
          <Route path="/checkout/return" element={<CheckoutReturn />} />
          <Route path="/*" element={<AuthenticatedRoutes />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
