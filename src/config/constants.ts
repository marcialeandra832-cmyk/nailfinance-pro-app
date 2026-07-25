/**
 * NailFinance Constants & Config
 */

export const APP_CONFIG = {
  name: 'NailFinance',
  version: '1.2.0',
  supportWhatsapp: (import.meta as any).env?.VITE_WHATSAPP_PHONE || '5549999619123',
  supportEmail: 'suporte@nailfinance.com.br',
  kiwify: {
    checkoutMensalUrl: (import.meta as any).env?.VITE_KIWIFY_CHECKOUT_MENSAL_URL || 'https://pay.kiwify.com.br/checkout-mensal',
    checkoutAnualUrl: (import.meta as any).env?.VITE_KIWIFY_CHECKOUT_ANUAL_URL || 'https://pay.kiwify.com.br/checkout-anual',
    portalUrl: (import.meta as any).env?.VITE_KIWIFY_PORTAL_URL || 'https://dashboard.kiwify.com.br/',
  },
  plans: {
    mensal: {
      id: 'mensal',
      name: 'Mensal VIP',
      priceNumber: 29.90,
      priceFormatted: 'R$ 29,90',
      periodLabel: '/ mês',
      description: 'Acesso total mensal com renovação automática no cartão e opção via Pix ou boleto.',
    },
    anual: {
      id: 'anual',
      name: 'Anual Pro',
      priceNumber: 249.00,
      priceFormatted: 'R$ 249,00',
      periodLabel: '/ ano',
      monthlyEquivalent: 'R$ 20,75/mês',
      description: 'O melhor custo-benefício com 2 meses grátis para transformar a gestão do seu estúdio o ano todo.',
      savingsText: 'Economize 30%'
    }
  }
};

export function getWhatsappSupportLink(customText?: string): string {
  const message = customText || 'Olá! Preciso de ajuda ou suporte com o NailFinance.';
  return `https://wa.me/${APP_CONFIG.supportWhatsapp}?text=${encodeURIComponent(message)}`;
}
