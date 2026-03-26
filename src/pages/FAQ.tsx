import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Search, MessageCircle, BookOpen, Wallet, Sparkles, ShieldCheck } from 'lucide-react';
import { Card, Button, Badge, Input } from '../components/UI';
import { motion, AnimatePresence } from 'motion/react';

interface FAQItemProps {
  question: string;
  answer: string;
  category: string;
}

const FAQ_DATA: FAQItemProps[] = [
  {
    category: 'Geral',
    question: 'Como adicionar um novo serviço ao catálogo?',
    answer: 'Vá na aba "Meu Catálogo" no menu lateral, clique no botão "Adicionar Novo Serviço", preencha o nome, preço e tempo estimado. Isso ajudará a IA a calcular sua produtividade.'
  },
  {
    category: 'Financeiro',
    question: 'Qual a diferença entre Caixa Studio e Caixa Pessoal?',
    answer: 'O Caixa Studio é para todas as entradas e saídas relacionadas ao seu trabalho (materiais, aluguel, pagamentos de clientes). O Caixa Pessoal é para suas contas de casa, lazer e retiradas de lucro. Manter os dois separados é o segredo para um negócio saudável!'
  },
  {
    category: 'Inteligência Artificial',
    question: 'Como funciona a análise de IA?',
    answer: 'Nossa IA analisa seus lançamentos de entrada e saída, compara com suas metas e seu catálogo de serviços. Ela identifica onde você está gastando demais e quais serviços trazem mais lucro real para o seu tempo.'
  },
  {
    category: 'Configurações',
    question: 'Como alterar minha meta de faturamento?',
    answer: 'Acesse "Configurações" no menu lateral. Lá você encontrará o campo "Meta de Faturamento Mensal". Altere o valor e clique em "Salvar Todas as Alterações".'
  },
  {
    category: 'Suporte',
    question: 'Como entrar em contato com o suporte?',
    answer: 'Você pode clicar no botão "Falar com Suporte" na aba "Assinatura" ou em "Configurações". Você será direcionada diretamente para o nosso WhatsApp oficial.'
  },
  {
    category: 'Segurança',
    question: 'Meus dados estão seguros?',
    answer: 'Sim! Utilizamos criptografia de ponta e os servidores mais seguros do mercado (Google Cloud). Seus dados financeiros são privados e acessíveis apenas por você.'
  },
  {
    category: 'Assinatura',
    question: 'Como cancelar ou alterar minha assinatura?',
    answer: 'Como nosso processo de pagamento é humanizado, basta clicar em "Gerenciar Assinatura" na aba de Assinatura. Você falará com nossa equipe no WhatsApp e faremos a alteração ou cancelamento na hora para você.'
  }
];

interface FAQItemComponentProps {
  question: string;
  answer: string;
}

const FAQItem: React.FC<FAQItemComponentProps> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-brand-border last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-5 flex items-center justify-between text-left group"
      >
        <span className={cn("font-bold text-brand-navy transition-colors", isOpen ? "text-brand-primary" : "group-hover:text-brand-primary")}>
          {question}
        </span>
        <div className={cn("p-1 rounded-lg transition-colors", isOpen ? "bg-brand-primary/10 text-brand-primary" : "text-gray-300 group-hover:text-brand-primary")}>
          {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-sm text-gray-500 leading-relaxed">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

import { cn } from '../lib/utils';

export function FAQ() {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredFaq = FAQ_DATA.filter(item => 
    item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categories = [
    { name: 'Geral', icon: BookOpen },
    { name: 'Financeiro', icon: Wallet },
    { name: 'Inteligência Artificial', icon: Sparkles },
    { name: 'Segurança', icon: ShieldCheck },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-12">
      <header className="text-center space-y-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Badge variant="primary" className="mb-2">Central de Ajuda</Badge>
          <h1 className="text-4xl font-bold text-brand-navy tracking-tight">
            Como podemos <span className="text-brand-primary italic font-serif">ajudar</span> você?
          </h1>
          <p className="text-gray-500 max-w-md mx-auto mt-4">
            Encontre respostas rápidas para as dúvidas mais comuns das nossas Nail Designers.
          </p>
        </motion.div>

        <div className="max-w-xl mx-auto relative mt-8">
          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400">
            <Search size={20} />
          </div>
          <input
            type="text"
            placeholder="Busque por uma dúvida (ex: catálogo, lucro, senha)..."
            className="w-full pl-14 pr-6 py-4 rounded-[2rem] border border-brand-border bg-white shadow-sm focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary/30 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {categories.map((cat) => (
          <button
            key={cat.name}
            onClick={() => setSearchTerm(cat.name)}
            className="p-6 bg-white rounded-[2.5rem] border border-brand-border hover:border-brand-primary hover:shadow-md transition-all group text-center space-y-3"
          >
            <div className="w-12 h-12 bg-pink-50 rounded-2xl flex items-center justify-center text-brand-primary mx-auto group-hover:scale-110 transition-transform">
              <cat.icon size={24} />
            </div>
            <p className="text-xs font-bold text-brand-navy">{cat.name}</p>
          </button>
        ))}
      </div>

      <Card className="p-2 md:p-4">
        <div className="divide-y divide-brand-border px-4">
          {filteredFaq.length > 0 ? (
            filteredFaq.map((item, index) => (
              <FAQItem key={index} question={item.question} answer={item.answer} />
            ))
          ) : (
            <div className="py-12 text-center space-y-4">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mx-auto">
                <Search size={32} />
              </div>
              <p className="text-gray-500 font-medium">Nenhuma resposta encontrada para "{searchTerm}"</p>
              <Button variant="outline" size="sm" onClick={() => setSearchTerm('')}>Limpar busca</Button>
            </div>
          )}
        </div>
      </Card>

      <div className="bg-brand-navy rounded-[3rem] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 text-center md:text-left">
            <h2 className="text-2xl md:text-3xl font-bold">Ainda precisa de ajuda?</h2>
            <p className="text-blue-100/70 max-w-md">
              Nossa equipe de suporte está pronta para atender você pessoalmente no WhatsApp.
            </p>
          </div>
          <Button 
            variant="white" 
            size="lg" 
            className="h-16 px-8 rounded-3xl"
            onClick={() => {
              const message = encodeURIComponent('Olá! Não encontrei minha dúvida no FAQ e preciso de ajuda.');
              window.open(`https://wa.me/5549999619123?text=${message}`, '_blank');
            }}
          >
            <MessageCircle size={24} />
            Falar com Suporte Agora
          </Button>
        </div>
      </div>
    </div>
  );
}
