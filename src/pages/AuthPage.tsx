import React, { useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { auth } from '../firebase';
import { Card, Button, Input, Badge } from '../components/UI';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Mail, Lock, User as UserIcon, ArrowRight, ChevronLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

type AuthMode = 'login' | 'register' | 'forgot';

export function AuthPage() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'login') {
        await signInWithEmailAndPassword(auth, email, password);
        toast.success('Bem-vinda de volta!');
      } else if (mode === 'register') {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
        toast.success('Conta criada com sucesso!');
      } else if (mode === 'forgot') {
        await sendPasswordResetEmail(auth, email);
        toast.success('E-mail de recuperação enviado!');
        setMode('login');
      }
    } catch (error: any) {
      console.error('Auth Error:', error);
      let message = 'Ocorreu um erro. Tente novamente.';
      if (error.code === 'auth/user-not-found') message = 'Usuário não encontrado.';
      if (error.code === 'auth/wrong-password') message = 'Senha incorreta.';
      if (error.code === 'auth/email-already-in-use') message = 'Este e-mail já está em uso.';
      if (error.code === 'auth/weak-password') message = 'A senha deve ter pelo menos 6 caracteres.';
      if (error.code === 'auth/operation-not-allowed') message = 'O login com e-mail/senha não está habilitado no Firebase Console.';
      if (error.code === 'auth/invalid-email') message = 'E-mail inválido.';
      
      // If none of the above, show the specific error code to help debugging
      if (message === 'Ocorreu um erro. Tente novamente.') {
        message = `Erro (${error.code}): ${error.message}`;
      }
      
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-primary/5 rounded-full -mr-32 -mt-32 blur-3xl animate-pulse" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-primary/5 rounded-full -ml-32 -mb-32 blur-3xl animate-pulse" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-primary rounded-3xl text-white font-bold text-2xl shadow-xl shadow-brand-primary/20 mb-4">
            N
          </div>
          <h1 className="text-3xl font-serif font-bold text-brand-navy">NailFinance</h1>
          <p className="text-gray-500 mt-2 font-medium">Sua gestão financeira na ponta dos dedos</p>
        </div>

        <Card className="shadow-2xl border-none p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="mb-8">
                <Badge variant="primary" className="mb-2">
                  {mode === 'login' ? 'Login' : mode === 'register' ? 'Cadastro' : 'Recuperação'}
                </Badge>
                <h2 className="text-2xl font-bold text-brand-navy">
                  {mode === 'login' ? 'Bem-vinda de volta' : mode === 'register' ? 'Crie sua conta' : 'Esqueceu a senha?'}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {mode === 'login' ? 'Entre para gerenciar seu studio.' : mode === 'register' ? 'Comece a organizar suas finanças hoje.' : 'Enviaremos um link para resetar sua senha.'}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {mode === 'register' && (
                  <Input 
                    label="Nome Completo"
                    placeholder="Como quer ser chamada?"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                  />
                )}
                
                <Input 
                  label="E-mail"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />

                {mode !== 'forgot' && (
                  <div className="space-y-1">
                    <Input 
                      label="Senha"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                    />
                    {mode === 'login' && (
                      <button 
                        type="button"
                        onClick={() => setMode('forgot')}
                        className="text-xs font-bold text-brand-primary hover:underline ml-1"
                      >
                        Esqueceu a senha?
                      </button>
                    )}
                  </div>
                )}

                <Button 
                  type="submit" 
                  fullWidth 
                  size="lg" 
                  disabled={loading}
                  className="shadow-xl shadow-brand-primary/20"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <>
                      {mode === 'login' ? 'Entrar' : mode === 'register' ? 'Criar Conta' : 'Enviar Link'}
                      <ArrowRight size={18} />
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-8 pt-6 border-t border-gray-50 text-center">
                {mode === 'login' ? (
                  <p className="text-sm text-gray-500">
                    Não tem uma conta?{' '}
                    <button 
                      onClick={() => setMode('register')}
                      className="font-bold text-brand-primary hover:underline"
                    >
                      Cadastre-se
                    </button>
                  </p>
                ) : (
                  <button 
                    onClick={() => setMode('login')}
                    className="flex items-center justify-center gap-2 text-sm font-bold text-gray-400 hover:text-brand-primary transition-colors mx-auto"
                  >
                    <ChevronLeft size={16} />
                    Voltar para o login
                  </button>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-gray-50 flex items-center justify-center gap-2 text-[11px] text-gray-400">
                <Sparkles size={12} className="text-brand-primary" />
                <span>Suporte Técnico: <strong>(49) 99961-9123</strong></span>
              </div>
            </motion.div>
          </AnimatePresence>
        </Card>

        <div className="mt-8 text-center">
          <p className="text-[10px] text-gray-300 font-bold uppercase tracking-[0.2em]">
            © 2026 NailFinance • Gestão para Designers
          </p>
        </div>
      </motion.div>
    </div>
  );
}
