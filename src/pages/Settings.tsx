import React, { useState } from 'react';
import { 
  User, 
  Building, 
  Target, 
  DollarSign, 
  Bell, 
  ShieldCheck, 
  Save, 
  MessageCircle,
  ExternalLink,
  Lock
} from 'lucide-react';
import { Card, Button, Input } from '../components/UI';
import { UserSettings } from '../types';
import { getWhatsappSupportLink } from '../config/constants';
import { motion } from 'motion/react';
import { toast } from 'sonner';

interface SettingsProps {
  settings: UserSettings;
  onUpdate: (settings: Partial<UserSettings>) => void;
}

export function Settings({ settings, onUpdate }: SettingsProps) {
  const [name, setName] = useState(settings.name || '');
  const [studioName, setStudioName] = useState(settings.studioName || '');
  const [revenueGoal, setRevenueGoal] = useState(String(settings.revenueGoal || 5000));
  const [profitGoal, setProfitGoal] = useState(String(settings.profitGoal || 3000));
  const [notifications, setNotifications] = useState(settings.notifications ?? true);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedRev = parseFloat(revenueGoal);
    const parsedProf = parseFloat(profitGoal);

    if (!name.trim()) {
      toast.error('Informe seu nome.');
      return;
    }
    if (isNaN(parsedRev) || parsedRev <= 0) {
      toast.error('Informe uma meta de faturamento válida.');
      return;
    }

    onUpdate({
      name,
      studioName,
      revenueGoal: parsedRev,
      profitGoal: isNaN(parsedProf) ? 0 : parsedProf,
      notifications
    });
  };

  return (
    <div className="space-y-10 pb-12">
      {/* Header */}
      <header>
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-brand-navy">Configurações do Studio</h1>
        <p className="text-slate-500 mt-1 font-medium text-sm md:text-base">Ajuste seu perfil, metas financeiras e preferências.</p>
      </header>

      <form onSubmit={handleSave} className="space-y-8 max-w-4xl">
        {/* Profile Card */}
        <Card title="Perfil da Designer" subtitle="Dados do seu estúdio de unhas">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
            <div>
              <label htmlFor="set-name" className="block text-xs font-bold text-gray-600 mb-1">Seu Nome *</label>
              <input 
                id="set-name"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ex: Amanda Silva"
                className="w-full px-4 py-3 rounded-xl border border-brand-border bg-gray-50 text-brand-navy font-bold text-sm outline-none focus:ring-2 focus:ring-brand-primary"
              />
            </div>

            <div>
              <label htmlFor="set-studio" className="block text-xs font-bold text-gray-600 mb-1">Nome do Studio / Marca</label>
              <input 
                id="set-studio"
                value={studioName}
                onChange={e => setStudioName(e.target.value)}
                placeholder="Ex: Amanda Nails Studio"
                className="w-full px-4 py-3 rounded-xl border border-brand-border bg-gray-50 text-brand-navy font-bold text-sm outline-none focus:ring-2 focus:ring-brand-primary"
              />
            </div>
          </div>
        </Card>

        {/* Goals Card */}
        <Card title="Metas Financeiras Mensais" subtitle="Defina onde seu studio quer chegar">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
            <div>
              <label htmlFor="set-revgoal" className="block text-xs font-bold text-gray-600 mb-1">Meta de Faturamento (R$) *</label>
              <input 
                id="set-revgoal"
                type="number"
                step="100"
                required
                value={revenueGoal}
                onChange={e => setRevenueGoal(e.target.value)}
                placeholder="5000"
                className="w-full px-4 py-3 rounded-xl border border-brand-border bg-gray-50 text-brand-navy font-bold text-sm outline-none focus:ring-2 focus:ring-brand-primary"
              />
            </div>

            <div>
              <label htmlFor="set-profgoal" className="block text-xs font-bold text-gray-600 mb-1">Meta de Lucro Líquido (R$)</label>
              <input 
                id="set-profgoal"
                type="number"
                step="100"
                value={profitGoal}
                onChange={e => setProfitGoal(e.target.value)}
                placeholder="3000"
                className="w-full px-4 py-3 rounded-xl border border-brand-border bg-gray-50 text-brand-navy font-bold text-sm outline-none focus:ring-2 focus:ring-brand-primary"
              />
            </div>
          </div>
        </Card>

        {/* Preferences */}
        <Card title="Notificações e Suporte">
          <div className="space-y-6 mt-4">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-100">
              <div className="space-y-0.5">
                <span className="font-bold text-sm text-brand-navy block">Lembretes Financeiros</span>
                <span className="text-xs text-gray-500 font-medium">Alertas de fechamento de caixa e atingimento de metas.</span>
              </div>
              <input 
                type="checkbox"
                aria-label="Ativar lembretes financeiros"
                checked={notifications}
                onChange={e => setNotifications(e.target.checked)}
                className="w-5 h-5 accent-brand-pink cursor-pointer"
              />
            </div>

            <div className="p-4 rounded-2xl bg-pink-50/60 border border-pink-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="font-serif font-bold text-base text-brand-navy block">Precisa de Suporte Técnico?</span>
                <span className="text-xs text-gray-600 font-medium">Atendimento direto com nossa equipe via WhatsApp oficial.</span>
              </div>
              <a 
                href={getWhatsappSupportLink("Olá! Preciso de ajuda com minhas configurações no NailFinance.")}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs inline-flex items-center gap-2 shadow-sm transition-colors"
              >
                <MessageCircle size={16} />
                Suporte WhatsApp
                <ExternalLink size={12} />
              </a>
            </div>
          </div>
        </Card>

        <div className="flex justify-end pt-2">
          <Button type="submit" size="lg" className="px-10 font-bold shadow-lg shadow-pink-200">
            <Save size={18} className="mr-2" />
            Salvar Configurações
          </Button>
        </div>
      </form>
    </div>
  );
}
