import React, { useState } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  MessageCircle, 
  ExternalLink
} from 'lucide-react';
import { Card } from '../components/UI';
import { getWhatsappSupportLink } from '../config/constants';
import { motion, AnimatePresence } from 'motion/react';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const FAQS: FAQItem[] = [
  {
    category: 'Financeiro & Precificação',
    question: 'Como funciona a separação entre Caixa do Studio e Caixa Pessoal?',
    answer: 'O NailFinance possui dois registros isolados. No Caixa do Studio você lança os atendimentos e despesas operacionais (esmaltes, lixas, aluguel). No Caixa Pessoal você lança seu pró-labore e despesas da sua casa. Essa separação impede que você misture o dinheiro do estúdio com contas pessoais.'
  },
  {
    category: 'Financeiro & Precificação',
    question: 'Como o Simulador de Valor de Hora Funciona?',
    answer: 'O simulador soma o seu pró-labore desejado aos custos fixos do estúdio e divide pelas horas totais trabalhadas no mês. Com isso, ele calcula exatamente quanto sua hora de bancada precisa custar para seu negócio dar lucro real.'
  },
  {
    category: 'Conta & Acesso',
    question: 'Como funciona a ativação da minha conta no NailFinance?',
    answer: 'Após o cadastro, o seu acesso ao NailFinance é liberado automaticamente para você utilizar todos os recursos de gestão do estúdio.'
  },
  {
    category: 'Conta & Acesso',
    question: 'Como faço para gerenciar minhas configurações de conta?',
    answer: 'Você pode personalizar o nome do seu estúdio, dados do perfil e metas financeiras acessando a seção "Configurações" ou entrando em contato com nosso suporte exclusivo.'
  },
  {
    category: 'Segurança & Dados',
    question: 'Meus dados financeiros estão seguros?',
    answer: 'Sim! Seus lançamentos são armazenados de forma privada e segura no NailFinance. Somente você tem acesso aos dados e relatórios do seu estúdio.'
  }
];

export function FAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <div className="space-y-10 pb-12">
      {/* Header */}
      <header>
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-brand-navy">Central de Ajuda e Dúvidas (FAQ)</h1>
        <p className="text-slate-500 mt-1 font-medium text-sm md:text-base">Respostas rápidas sobre gestão, precificação e uso da sua conta no NailFinance.</p>
      </header>

      {/* FAQ List */}
      <div className="space-y-4 max-w-4xl">
        {FAQS.map((item, idx) => {
          const isOpen = openIdx === idx;
          return (
            <Card key={idx} className="bg-white border-brand-border/70 overflow-hidden p-6 transition-all">
              <button
                type="button"
                onClick={() => toggle(idx)}
                aria-expanded={isOpen}
                aria-controls={`faq-answer-${idx}`}
                className="w-full text-left flex items-center justify-between gap-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink rounded-xl"
              >
                <div>
                  <span className="text-[10px] font-black uppercase text-brand-pink tracking-wider block mb-1">{item.category}</span>
                  <h3 className="font-serif font-bold text-lg text-brand-navy">{item.question}</h3>
                </div>
                <div className="p-2 rounded-xl bg-gray-50 text-brand-navy shrink-0">
                  {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
              </button>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    id={`faq-answer-${idx}`}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="pt-4 mt-4 border-t border-gray-100 text-sm text-gray-600 font-medium leading-relaxed"
                  >
                    {item.answer}
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          );
        })}
      </div>

      {/* Direct Contact Banner */}
      <Card className="bg-gradient-to-br from-brand-navy to-slate-900 border-none text-white p-8 max-w-4xl rounded-[2rem]">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-serif font-bold text-white">Ainda tem alguma dúvida sobre o NailFinance?</h2>
            <p className="text-blue-100/80 text-sm mt-1 font-medium">
              Nossa equipe de suporte está pronta para te atender no WhatsApp.
            </p>
          </div>

          <a 
            href={getWhatsappSupportLink("Olá! Tenho uma dúvida sobre o NailFinance.")}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm inline-flex items-center gap-2 shadow-lg shadow-emerald-900/20 transition-colors shrink-0"
          >
            <MessageCircle size={18} />
            Falar com Atendimento
            <ExternalLink size={14} />
          </a>
        </div>
      </Card>
    </div>
  );
}
