import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Card, Button, Badge } from '../components/UI';
import { motion } from 'motion/react';
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ArrowRight, 
  RotateCw, 
  MessageCircle, 
  ShieldCheck,
  Sparkles,
  UserCheck
} from 'lucide-react';
import { getWhatsappSupportLink } from '../config/constants';
import { ref, get } from 'firebase/database';
import { database } from '../firebase';

export function CheckoutReturn() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [statusState, setStatusState] = useState<'analyzing' | 'approved_processing' | 'active_released' | 'failed'>('analyzing');
  const [loading, setLoading] = useState(false);
  const [checkCount, setCheckCount] = useState(0);

  const checkSubscriptionStatus = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Check via backend API first
      const res = await fetch(`/api/subscription/check?email=${encodeURIComponent(user.email || '')}`);
      if (res.ok) {
        const data = await res.json();
        if (data.status === 'active' || data.active) {
          setStatusState('active_released');
          setLoading(false);
          return;
        } else if (data.status === 'pending_payment') {
          setStatusState('analyzing');
        } else if (data.status === 'canceled' || data.status === 'expired' || data.status === 'overdue') {
          setStatusState('failed');
          setLoading(false);
          return;
        }
      }

      // Fallback: Check Firebase Realtime Database
      const userSubRef = ref(database, `user_data/${user.uid}/subscription`);
      const snapshot = await get(userSubRef);
      if (snapshot.exists()) {
        const sub = snapshot.val();
        if (sub.status === 'active') {
          setStatusState('active_released');
        } else if (sub.status === 'pending_payment') {
          setStatusState('analyzing');
        } else if (sub.status === 'canceled' || sub.status === 'expired' || sub.status === 'overdue') {
          setStatusState('failed');
        } else {
          setStatusState('analyzing');
        }
      } else {
        if (checkCount < 5) {
          setStatusState('analyzing');
        } else {
          setStatusState('failed');
        }
      }
    } catch (err) {
      console.warn('Erro ao checar status da conta:', err);
      if (checkCount > 4) {
        setStatusState('failed');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      checkSubscriptionStatus();
    }
  }, [user]);

  // Polling mechanism every 4 seconds for up to 6 checks if status is analyzing
  useEffect(() => {
    if (user && statusState === 'analyzing' && checkCount < 6) {
      const timer = setTimeout(() => {
        setCheckCount(prev => prev + 1);
        checkSubscriptionStatus();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [user, statusState, checkCount]);

  // Unauthenticated view
  if (!user) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center p-6 text-brand-navy">
        <div className="max-w-xl w-full space-y-6">
          {/* Header Branding */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-brand-pink text-white font-serif font-bold text-2xl rounded-2xl shadow-lg shadow-pink-200">
              N
            </div>
            <h1 className="text-2xl font-serif font-bold text-brand-navy">NailFinance</h1>
            <p className="text-xs text-gray-500 font-medium">Confirmação de Compra</p>
          </div>

          <Card className="p-8 shadow-2xl border-none bg-white rounded-[2rem] space-y-6 relative overflow-hidden">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-5">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 size={36} />
              </div>

              <div>
                <Badge variant="success" className="mb-2">Compra Confirmada</Badge>
                <h2 className="text-2xl font-serif font-bold text-brand-navy">Obrigada por escolher o NailFinance!</h2>
                <p className="text-xs text-gray-500 mt-2 font-medium leading-relaxed">
                  Sua compra foi realizada com sucesso. Para acessar todas as ferramentas do seu estúdio, crie sua conta ou faça login com seu e-mail.
                </p>
              </div>

              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 font-semibold space-y-1 text-left">
                <div className="flex items-center gap-1.5 text-emerald-900 font-bold mb-1">
                  <ShieldCheck size={16} />
                  <span>Seu plano inclui acesso completo:</span>
                </div>
                <ul className="list-disc list-inside space-y-0.5 text-[11px] text-emerald-700">
                  <li>Catálogo de procedimentos com precificação técnica</li>
                  <li>Controle separado do Caixa Studio e Caixa Pessoal</li>
                  <li>Simulador de hora trabalhada e consultoria com IA</li>
                </ul>
              </div>

              <div className="space-y-3 pt-2">
                <Button 
                  onClick={() => navigate('/login', { replace: true })} 
                  fullWidth 
                  size="lg"
                  className="font-bold bg-brand-pink hover:bg-pink-600 text-white shadow-xl shadow-pink-200"
                >
                  <UserCheck size={18} className="mr-2" />
                  Criar Conta ou Entrar no NailFinance
                  <ArrowRight size={18} className="ml-1" />
                </Button>

                <a
                  href={getWhatsappSupportLink("Olá! Fiz uma compra no NailFinance e preciso de suporte para acessar minha conta.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-200 transition-colors"
                >
                  <MessageCircle size={18} />
                  Dúvidas? Falar com Suporte no WhatsApp
                </a>
              </div>
            </motion.div>
          </Card>
        </div>
      </div>
    );
  }

  // Authenticated view
  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center p-6 text-brand-navy">
      <div className="max-w-xl w-full space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-brand-pink text-white font-serif font-bold text-2xl rounded-2xl shadow-lg shadow-pink-200">
            N
          </div>
          <h1 className="text-2xl font-serif font-bold text-brand-navy">NailFinance</h1>
          <p className="text-xs text-gray-500 font-medium">Confirmação de Acesso da Conta</p>
        </div>

        <Card className="p-8 shadow-2xl border-none bg-white rounded-[2rem] space-y-6 relative overflow-hidden">
          {/* STATE 1: ANALYZING */}
          {statusState === 'analyzing' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-5">
              <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto">
                <Clock className="animate-spin" size={32} />
              </div>

              <div>
                <Badge variant="warning" className="mb-2">Verificando Conta</Badge>
                <h2 className="text-2xl font-serif font-bold text-brand-navy">Ativando seu plano...</h2>
                <p className="text-xs text-gray-500 mt-2 font-medium leading-relaxed">
                  Estamos confirmando os dados da sua conta para liberar o acesso ao NailFinance.
                </p>
              </div>

              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800 font-semibold space-y-1">
                <p>Verificando atualização de acesso...</p>
                <p className="text-[10px] text-amber-600">Checagem automática ({checkCount}/6)</p>
              </div>

              <div className="pt-2 flex flex-col gap-3">
                <Button 
                  onClick={checkSubscriptionStatus} 
                  disabled={loading}
                  variant="outline"
                  fullWidth
                  className="font-bold border-brand-border"
                >
                  <RotateCw size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Verificar Novamente
                </Button>

                <a
                  href={getWhatsappSupportLink("Olá! Preciso de ajuda para confirmar a ativação do meu plano no NailFinance.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs inline-flex items-center justify-center gap-2 transition-colors"
                >
                  <MessageCircle size={16} className="text-emerald-600" />
                  Dúvidas sobre o plano? Falar no WhatsApp
                </a>
              </div>
            </motion.div>
          )}

          {/* STATE 2: APPROVED PROCESSING */}
          {statusState === 'approved_processing' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-5">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto">
                <Sparkles className="animate-bounce" size={32} />
              </div>

              <div>
                <Badge variant="primary" className="mb-2">Plano Confirmado</Badge>
                <h2 className="text-2xl font-serif font-bold text-brand-navy">Seu acesso está sendo liberado!</h2>
                <p className="text-xs text-gray-500 mt-2 font-medium">
                  Sua conta do estúdio foi configurada com sucesso.
                </p>
              </div>

              <Button 
                onClick={() => setStatusState('active_released')} 
                fullWidth 
                size="lg"
                className="font-bold shadow-lg shadow-pink-200"
              >
                Avançar para o NailFinance
                <ArrowRight size={18} />
              </Button>
            </motion.div>
          )}

          {/* STATE 3: RELEASED */}
          {statusState === 'active_released' && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-5">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 size={36} />
              </div>

              <div>
                <Badge variant="success" className="mb-2">Acesso Liberado</Badge>
                <h2 className="text-2xl font-serif font-bold text-brand-navy">Entrar no NailFinance</h2>
                <p className="text-xs text-gray-500 mt-2 font-medium leading-relaxed">
                  Tudo pronto! Seu plano está ativo e sua conta no estúdio já pode ser utilizada normalmente.
                </p>
              </div>

              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 font-semibold space-y-1 text-left">
                <div className="flex items-center gap-1.5 text-emerald-900 font-bold mb-1">
                  <ShieldCheck size={16} />
                  <span>Benefícios Ativos na Sua Conta:</span>
                </div>
                <ul className="list-disc list-inside space-y-0.5 text-[11px] text-emerald-700">
                  <li>Catálogo ilimitado e precificação técnica</li>
                  <li>Controle separado do Caixa do Studio e Pessoal</li>
                  <li>Consultoria inteligente com IA</li>
                </ul>
              </div>

              <Button 
                onClick={() => navigate('/dashboard', { replace: true })} 
                fullWidth 
                size="lg"
                className="font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl shadow-emerald-200"
              >
                Acessar Meu Estúdio Agora
                <ArrowRight size={18} />
              </Button>
            </motion.div>
          )}

          {/* STATE 4: FAILED / NOT CONFIRMED YET */}
          {statusState === 'failed' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-5">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
                <AlertTriangle size={32} />
              </div>

              <div>
                <Badge variant="danger" className="mb-2">Acesso Pendente</Badge>
                <h2 className="text-2xl font-serif font-bold text-brand-navy">Ainda não foi possível confirmar o plano</h2>
                <p className="text-xs text-gray-500 mt-2 font-medium leading-relaxed">
                  Não identificamos a ativação do seu plano neste momento. Fale com nosso suporte para liberar seu acesso.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <a
                  href={getWhatsappSupportLink("Olá! Preciso de ajuda com a liberação do meu plano no NailFinance.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-200 transition-colors"
                >
                  <MessageCircle size={18} />
                  Falar com Suporte no WhatsApp
                </a>

                <Button 
                  onClick={() => navigate('/dashboard')} 
                  variant="ghost" 
                  fullWidth
                  className="text-xs font-bold"
                >
                  Voltar ao Início
                </Button>
              </div>
            </motion.div>
          )}
        </Card>
      </div>
    </div>
  );
}
