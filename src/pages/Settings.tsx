import React from 'react';
import { User, Bell, Shield, Moon, Globe, Save, Crown, HelpCircle, MessageCircle, FileText, Camera, ChevronRight } from 'lucide-react';
import { Card, Button, Input, Badge } from '../components/UI';
import { UserSettings } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

interface SettingsProps {
  settings: UserSettings;
  onUpdate: (s: UserSettings) => void;
}

export function Settings({ settings, onUpdate }: SettingsProps) {
  const [showSuccess, setShowSuccess] = React.useState(false);

  const handleChange = (field: keyof UserSettings, value: any) => {
    onUpdate({ ...settings, [field]: value });
    
    if (field === 'notifications') {
      toast.success(value ? 'Notificações ativadas' : 'Notificações desativadas');
    }
    if (field === 'darkMode') {
      toast.info(value ? 'Modo escuro ativado' : 'Modo claro ativado');
    }
  };

  const handleSave = () => {
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="space-y-8 pb-12">
      <header>
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <Badge variant="primary" className="mb-2">Configurações</Badge>
          <h1 className="text-4xl font-bold text-brand-navy tracking-tight">
            Personalize seu <span className="text-brand-primary italic font-serif">NailFinance</span>
          </h1>
          <p className="text-gray-500 max-w-md">
            Ajuste suas metas, perfil e preferências para que o sistema trabalhe exatamente do seu jeito.
          </p>
        </motion.div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card title="Perfil Profissional" subtitle="Como você e seu studio aparecem no sistema">
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-center gap-8 p-6 bg-brand-bg rounded-[2rem] border border-brand-border">
                  <div className="relative group">
                    <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-brand-primary to-brand-primary/60 flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-brand-primary/20 transition-transform duration-500 group-hover:scale-105">
                      {settings.name.charAt(0).toUpperCase()}
                    </div>
                    <button className="absolute -bottom-2 -right-2 w-10 h-10 bg-white rounded-xl shadow-md flex items-center justify-center text-brand-primary hover:bg-brand-primary hover:text-white transition-all duration-300 border border-gray-100">
                      <Camera size={18} />
                    </button>
                  </div>
                  <div className="text-center sm:text-left space-y-2">
                    <h3 className="text-xl font-bold text-brand-navy">{settings.name || "Sua Foto"}</h3>
                    <p className="text-sm text-gray-500">Recomendamos uma foto profissional ou o logo do seu studio.</p>
                    <div className="flex flex-wrap justify-center sm:justify-start gap-2 pt-2">
                      <Button variant="outline" size="sm" className="h-9 px-4">Alterar foto</Button>
                      <Button variant="ghost" size="sm" className="h-9 px-4 text-gray-400 hover:text-brand-danger">Remover</Button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input 
                    label="Seu Nome Completo"
                    placeholder="Ex: Maria Silva"
                    value={settings.name}
                    onChange={e => handleChange('name', e.target.value)}
                  />
                  <Input 
                    label="Nome do seu Studio"
                    placeholder="Ex: Maria Nails & Beauty"
                    value={settings.studioName}
                    onChange={e => handleChange('studioName', e.target.value)}
                  />
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card title="Metas Financeiras" subtitle="Defina onde você quer chegar este mês">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input 
                  label="Meta de Faturamento Mensal"
                  type="number"
                  placeholder="R$ 0,00"
                  value={settings.revenueGoal}
                  onChange={e => handleChange('revenueGoal', Number(e.target.value))}
                />
                <Input 
                  label="Meta de Lucro Mensal (Líquido)"
                  type="number"
                  placeholder="R$ 0,00"
                  value={settings.profitGoal}
                  onChange={e => handleChange('profitGoal', Number(e.target.value))}
                />
              </div>
              <div className="mt-6 p-4 bg-pink-50 rounded-2xl flex items-start gap-3 border border-pink-100">
                <Shield size={20} className="text-brand-primary shrink-0 mt-0.5" />
                <p className="text-xs text-brand-primary/80 leading-relaxed font-medium">
                  <strong>Dica:</strong> Suas metas ajudam a IA a calcular o quanto você ainda precisa produzir para atingir sua liberdade financeira.
                </p>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card title="Preferências do Sistema" subtitle="Ajustes de interface e notificações">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-5 bg-brand-bg rounded-[1.5rem] border border-brand-border hover:bg-brand-bg/80 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-brand-card rounded-xl flex items-center justify-center text-gray-400 group-hover:text-brand-primary transition-colors shadow-sm">
                      <Moon size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-brand-navy">Modo Escuro</p>
                      <p className="text-xs text-gray-500">Interface com cores escuras para descanso visual</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer"
                      checked={settings.darkMode}
                      onChange={e => handleChange('darkMode', e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-5 bg-brand-bg rounded-[1.5rem] border border-brand-border hover:bg-brand-bg/80 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-brand-card rounded-xl flex items-center justify-center text-gray-400 group-hover:text-brand-primary transition-colors shadow-sm">
                      <Bell size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-brand-navy">Notificações Inteligentes</p>
                      <p className="text-xs text-gray-500">Alertas de custos elevados e metas atingidas</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer"
                      checked={settings.notifications}
                      onChange={e => handleChange('notifications', e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary"></div>
                  </label>
                </div>
              </div>
            </Card>
          </motion.div>

          <div className="flex items-center justify-end gap-4 pt-4">
            <AnimatePresence>
              {showSuccess && (
                <motion.span 
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-sm font-bold text-brand-success"
                >
                  Alterações salvas com sucesso!
                </motion.span>
              )}
            </AnimatePresence>
            <Button 
              size="lg" 
              className="px-10 shadow-xl shadow-brand-primary/20"
              onClick={handleSave}
            >
              <Save size={20} />
              Salvar Todas as Alterações
            </Button>
          </div>
        </div>

        <div className="space-y-8">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card title="Ajuda & Suporte">
              <div className="space-y-2">
                <button 
                  onClick={() => toast.info('Nossa Central de Ajuda está sendo atualizada com novos tutoriais!')}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 rounded-2xl text-sm font-bold text-brand-navy transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <HelpCircle size={18} className="text-gray-400 group-hover:text-brand-primary transition-colors" />
                    Central de Ajuda
                  </div>
                  <ChevronRight size={16} className="text-gray-200 group-hover:text-brand-primary transition-colors" />
                </button>
                <button 
                  onClick={() => {
                    const message = encodeURIComponent('Olá! Preciso de suporte com o NailFinance.');
                    window.open(`https://wa.me/5549999619123?text=${message}`, '_blank');
                  }}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 rounded-2xl text-sm font-bold text-brand-navy transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <MessageCircle size={18} className="text-gray-400 group-hover:text-brand-primary transition-colors" />
                    Falar com Suporte
                  </div>
                  <ChevronRight size={16} className="text-gray-200 group-hover:text-brand-primary transition-colors" />
                </button>
                <button 
                  onClick={() => toast.info('Os Termos de Uso estão disponíveis no contrato de adesão do serviço.')}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 rounded-2xl text-sm font-bold text-brand-navy transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <FileText size={18} className="text-gray-400 group-hover:text-brand-primary transition-colors" />
                    Termos de Uso
                  </div>
                  <ChevronRight size={16} className="text-gray-200 group-hover:text-brand-primary transition-colors" />
                </button>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
