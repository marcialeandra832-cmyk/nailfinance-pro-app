import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BookOpen, 
  Wallet, 
  User, 
  Sparkles, 
  Settings as SettingsIcon, 
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
  userName: string;
  plan: string;
}

const MENU_ITEMS = [
  { id: 'dashboard', path: '/dashboard', label: 'Visão Geral', icon: LayoutDashboard },
  { id: 'catalog', path: '/catalog', label: 'Meu Catálogo', icon: BookOpen },
  { id: 'studio', path: '/studio', label: 'Caixa Studio', icon: Wallet },
  { id: 'personal', path: '/personal', label: 'Caixa Pessoal', icon: User },
  { id: 'ai', path: '/ai', label: 'Análise IA', icon: Sparkles },
  { id: 'settings', path: '/settings', label: 'Configurações', icon: SettingsIcon },
  { id: 'faq', path: '/faq', label: 'Ajuda (FAQ)', icon: HelpCircle },
];

export function Sidebar({ userName, plan }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const toggleSidebar = () => setIsOpen(!isOpen);
  const toggleMobile = () => setIsMobileOpen(!isMobileOpen);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Erro ao sair:', error);
    }
  };

  const currentPath = location.pathname;

  const SidebarContent = () => (
    <div className="flex flex-col h-full py-8">
      <div className="px-6 mb-8 flex items-center justify-between">
        <div className={cn("flex items-center gap-3 overflow-hidden transition-all duration-500", isOpen ? "w-auto opacity-100" : "w-0 opacity-0")}>
          <div className="w-10 h-10 bg-gradient-to-br from-brand-pink to-pink-400 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-pink-200 shrink-0">
            <Heart size={20} fill="currentColor" />
          </div>
          <div className="flex flex-col">
            <span className="font-serif font-bold text-xl text-brand-navy leading-none">NailFinance</span>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">Gestão de Unhas</span>
          </div>
        </div>
        <button 
          type="button"
          onClick={toggleSidebar} 
          aria-label={isOpen ? "Recolher menu lateral" : "Expandir menu lateral"}
          className="hidden md:flex p-2 hover:bg-pink-50 rounded-xl text-brand-pink transition-colors focus-visible:ring-2 focus-visible:ring-brand-pink focus-visible:outline-none"
        >
          {isOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </button>
      </div>

      <nav aria-label="Menu principal" className="flex-1 px-4 space-y-2 overflow-y-auto">
        {MENU_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.path || (item.path === '/dashboard' && currentPath === '/');
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                navigate(item.path);
                setIsMobileOpen(false);
              }}
              aria-label={item.label}
              className={cn(
                "w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group relative focus-visible:ring-2 focus-visible:ring-brand-pink focus-visible:outline-none",
                isActive 
                  ? "bg-brand-navy text-white shadow-xl shadow-navy-900/10 font-bold" 
                  : "text-slate-500 hover:bg-pink-50 hover:text-brand-pink font-medium"
              )}
            >
              <Icon size={20} className={cn("shrink-0 transition-transform duration-300", isActive ? "scale-110 text-brand-pink" : "group-hover:scale-110")} />
              <span className={cn("text-sm transition-all duration-300 overflow-hidden whitespace-nowrap text-left", isOpen ? "w-auto opacity-100" : "w-0 opacity-0")}>
                {item.label}
              </span>
              {isActive && (
                <motion.div 
                  layoutId="active-pill"
                  className="absolute left-0 w-1.5 h-7 bg-brand-pink rounded-r-full"
                />
              )}
            </button>
          );
        })}
      </nav>

      <div className="px-4 mt-auto pt-4 space-y-2 border-t border-gray-100">
        <button 
          type="button"
          onClick={handleLogout}
          aria-label="Sair da conta"
          className={cn(
            "w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-slate-500 hover:bg-red-50 hover:text-brand-danger transition-all duration-300 group focus-visible:ring-2 focus-visible:ring-brand-danger focus-visible:outline-none",
            !isOpen && "justify-center px-0"
          )}
        >
          <LogOut size={20} className="shrink-0 transition-transform group-hover:scale-110" />
          <span className={cn("font-semibold text-sm transition-all duration-300 overflow-hidden whitespace-nowrap", isOpen ? "w-auto opacity-100" : "w-0 opacity-0")}>
            Sair do Sistema
          </span>
        </button>

        <div className={cn(
          "p-3.5 rounded-2xl bg-gradient-to-br from-pink-50/60 to-white border border-brand-border/60 overflow-hidden transition-all duration-300 shadow-sm",
          isOpen ? "w-full" : "w-12 p-2"
        )}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-navy flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-sm">
              {userName ? userName.charAt(0).toUpperCase() : 'N'}
            </div>
            <div className={cn("transition-all duration-300 overflow-hidden whitespace-nowrap", isOpen ? "opacity-100" : "opacity-0")}>
              <p className="text-xs font-bold text-brand-navy truncate max-w-[140px]">{userName || 'Nail Designer'}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-[10px] text-brand-primary font-bold uppercase tracking-wider">{plan}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button 
          type="button"
          onClick={toggleMobile} 
          aria-label={isMobileOpen ? "Fechar menu" : "Abrir menu"}
          className="p-3 bg-white rounded-2xl shadow-lg text-brand-navy border border-brand-border focus-visible:ring-2 focus-visible:ring-brand-pink focus-visible:outline-none"
        >
          {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="md:hidden fixed inset-0 bg-brand-navy/50 z-40 backdrop-blur-sm" 
            onClick={toggleMobile} 
          />
        )}
      </AnimatePresence>

      {/* Mobile Drawer */}
      <div className={cn(
        "md:hidden fixed inset-y-0 left-0 w-72 bg-white z-50 transition-transform duration-300 transform shadow-2xl",
        isMobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <SidebarContent />
      </div>

      {/* Desktop Sidebar */}
      <aside className={cn(
        "hidden md:block bg-white border-r border-brand-border/60 transition-all duration-300 shrink-0 h-screen sticky top-0 z-30 shadow-sm",
        isOpen ? "w-72" : "w-24"
      )}>
        <SidebarContent />
      </aside>
    </>
  );
}
