import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  BookOpen, 
  Wallet, 
  User, 
  DollarSign, 
  Settings as SettingsIcon, 
  CreditCard,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Heart,
  LogOut
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userName: string;
  plan: string;
}

const MENU_ITEMS = [
  { id: 'dashboard', label: 'Visão Geral', icon: LayoutDashboard },
  { id: 'catalog', label: 'Meu Catálogo', icon: BookOpen },
  { id: 'studio', label: 'Caixa Studio', icon: Wallet },
  { id: 'personal', label: 'Caixa Pessoal', icon: User },
  { id: 'ai', label: 'Análise IA', icon: DollarSign },
  { id: 'settings', label: 'Configurações', icon: SettingsIcon },
  { id: 'subscription', label: 'Assinatura', icon: CreditCard },
  { id: 'faq', label: 'Ajuda (FAQ)', icon: HelpCircle },
];

export function Sidebar({ activeTab, setActiveTab, userName, plan }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { logout } = useAuth();

  const toggleSidebar = () => setIsOpen(!isOpen);
  const toggleMobile = () => setIsMobileOpen(!isMobileOpen);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Erro ao sair:', error);
    }
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full py-8">
      <div className="px-6 mb-12 flex items-center justify-between">
        <div className={cn("flex items-center gap-3 overflow-hidden transition-all duration-500", isOpen ? "w-auto opacity-100" : "w-0 opacity-0")}>
          <div className="w-10 h-10 bg-gradient-to-br from-brand-pink to-pink-400 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-pink-200">
            <Heart size={20} fill="currentColor" />
          </div>
          <div className="flex flex-col">
            <span className="font-serif font-bold text-xl text-brand-navy leading-none">NailFinance</span>
          </div>
        </div>
        <button 
          onClick={toggleSidebar} 
          className="hidden md:flex p-2 hover:bg-pink-50 rounded-xl text-brand-pink transition-colors"
        >
          {isOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </button>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {MENU_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setIsMobileOpen(false);
              }}
              className={cn(
                "w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group relative",
                isActive 
                  ? "bg-brand-navy text-white shadow-xl shadow-navy-900/10" 
                  : "text-slate-400 hover:bg-pink-50 hover:text-brand-pink"
              )}
            >
              <Icon size={20} className={cn("shrink-0 transition-transform duration-300", isActive ? "scale-110" : "group-hover:scale-110")} />
              <span className={cn("font-semibold text-sm transition-all duration-500 overflow-hidden whitespace-nowrap", isOpen ? "w-auto opacity-100" : "w-0 opacity-0")}>
                {item.label}
              </span>
              {isActive && (
                <motion.div 
                  layoutId="active-pill"
                  className="absolute left-0 w-1 h-6 bg-brand-pink rounded-r-full"
                />
              )}
            </button>
          );
        })}
      </nav>

      <div className="px-4 mt-auto space-y-2">
        <button 
          onClick={handleLogout}
          className={cn(
            "w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-slate-400 hover:bg-red-50 hover:text-brand-danger transition-all duration-300 group",
            !isOpen && "justify-center px-0"
          )}
        >
          <LogOut size={20} className="shrink-0 transition-transform group-hover:scale-110" />
          <span className={cn("font-semibold text-sm transition-all duration-500 overflow-hidden whitespace-nowrap", isOpen ? "w-auto opacity-100" : "w-0 opacity-0")}>
            Sair do Sistema
          </span>
        </button>

        <div className={cn(
          "p-4 rounded-3xl bg-gradient-to-br from-brand-pink/5 to-brand-card border border-brand-border overflow-hidden transition-all duration-500 shadow-sm",
          isOpen ? "w-full" : "w-12 p-2"
        )}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-navy flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-lg shadow-navy-900/20">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className={cn("transition-all duration-500 overflow-hidden whitespace-nowrap", isOpen ? "opacity-100" : "opacity-0")}>
              <p className="text-sm font-bold text-brand-navy">{userName}</p>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-success animate-pulse" />
                <p className="text-[10px] text-brand-pink font-bold uppercase tracking-wider">{plan}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Toggle */}
      <div className="md:hidden fixed top-6 left-6 z-50">
        <button onClick={toggleMobile} className="p-3 bg-brand-card rounded-2xl shadow-brand text-brand-navy border border-brand-border">
          {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="md:hidden fixed inset-0 bg-brand-navy/40 z-40 backdrop-blur-md" 
            onClick={toggleMobile} 
          />
        )}
      </AnimatePresence>

      {/* Mobile Sidebar */}
      <div className={cn(
        "md:hidden fixed inset-y-0 left-0 w-72 bg-brand-card z-50 transition-transform duration-500 transform shadow-2xl",
        isMobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <SidebarContent />
      </div>

      {/* Desktop Sidebar */}
      <aside className={cn(
        "hidden md:block bg-brand-card border-r border-brand-border transition-all duration-500 shrink-0 h-screen sticky top-0 z-30",
        isOpen ? "w-72" : "w-24"
      )}>
        <SidebarContent />
      </aside>
    </>
  );
}
