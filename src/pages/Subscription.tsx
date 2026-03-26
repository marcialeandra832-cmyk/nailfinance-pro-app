import React from 'react';
import { ShieldCheck, CreditCard, MessageCircle, Crown, Zap, Smartphone, BarChart3, Users, HelpCircle } from 'lucide-react';
import { Card, Button, Badge } from '../components/UI';
import { motion } from 'motion/react';

interface SubscriptionProps {
  onNavigate?: (tab: string) => void;
}

export function Subscription({ onNavigate }: SubscriptionProps) {
  const benefits = [
    { text: "Sem planilhas complicadas", icon: Zap },
    { text: "Controle do studio e pessoal", icon: ShieldCheck },
    { text: "Relatórios simples e visuais", icon: BarChart3 },
    { text: "Análise inteligente com IA", icon: Crown },
    { text: "Acesso no celular e computador", icon: Smartphone },
    { text: "Feito para nail designers", icon: Users },
    { text: "Suporte prioritário", icon: MessageCircle }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-12">
      <header>
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <Badge variant="primary" className="mb-2">Assinatura</Badge>
          <h1 className="text-4xl font-bold text-brand-navy tracking-tight">
            Seu <span className="text-brand-primary italic font-serif">plano</span>
          </h1>
          <p className="text-gray-500 max-w-md">
            Gerencie sua assinatura e veja seus benefícios ativos no NailFinance.
          </p>
        </motion.div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Main Plan Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="relative overflow-hidden border-none shadow-2xl bg-gradient-to-br from-white to-pink-50/30">
              <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/5 rounded-full -mr-32 -mt-32 blur-3xl" />
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-brand-primary/10 rounded-3xl flex items-center justify-center text-brand-primary shadow-inner">
                    <ShieldCheck size={32} />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h2 className="text-2xl font-bold text-brand-navy">Plano ativo</h2>
                      <Badge variant="success" className="bg-emerald-50 text-brand-success border border-emerald-100">Ativo</Badge>
                    </div>
                    <p className="text-gray-500 font-medium">Você já tem acesso completo a todas as funcionalidades.</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t border-gray-100">
                <Button 
                  variant="secondary" 
                  className="h-14"
                  onClick={() => {
                    const message = encodeURIComponent('Olá! Gostaria de gerenciar minha assinatura do NailFinance.');
                    window.open(`https://wa.me/5549999619123?text=${message}`, '_blank');
                  }}
                >
                  <CreditCard size={20} />
                  Gerenciar assinatura
                </Button>
                <Button 
                  variant="outline" 
                  className="h-14"
                  onClick={() => {
                    const message = encodeURIComponent('Olá! Preciso de suporte com o NailFinance.');
                    window.open(`https://wa.me/5549999619123?text=${message}`, '_blank');
                  }}
                >
                  <MessageCircle size={20} />
                  Falar com suporte
                </Button>
              </div>
            </Card>
          </motion.div>

          {/* Secondary Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-8 rounded-[2.5rem] bg-brand-navy text-white relative overflow-hidden shadow-xl"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl" />
            <div className="relative z-10 space-y-4">
              <h3 className="text-xl font-bold">Seu acesso está ativo</h3>
              <p className="text-blue-100/70 max-w-lg leading-relaxed">
                Aproveite todas as ferramentas exclusivas para escalar seu studio. Continue registrando seus ganhos e acompanhando seu lucro real para tomar as melhores decisões.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Benefits Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
            <Card title="Benefícios Ativos" subtitle="Recursos inclusos no seu plano">
              <div className="space-y-5">
                {benefits.map((benefit, idx) => (
                  <div key={idx} className="flex items-start gap-4 group">
                    <div className="w-8 h-8 rounded-xl bg-pink-50 flex items-center justify-center text-brand-primary shrink-0 transition-transform group-hover:scale-110">
                      <benefit.icon size={16} />
                    </div>
                    <span className="text-sm font-bold text-brand-navy/80 leading-tight pt-1.5">{benefit.text}</span>
                  </div>
                ))}
              </div>
              <div className="mt-8 pt-6 border-t border-gray-100">
                <button 
                  onClick={() => onNavigate?.('faq')}
                  className="w-full flex items-center justify-center gap-2 text-sm font-bold text-brand-primary hover:underline"
                >
                  <HelpCircle size={18} />
                  Ver perguntas frequentes (FAQ)
                </button>
              </div>
            </Card>
        </motion.div>
      </div>
    </div>
  );
}
