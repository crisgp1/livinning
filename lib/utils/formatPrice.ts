export interface PriceData {
  amount: number;
  currency: string;
}

export function formatPrice(price: PriceData): string {
  const { amount, currency } = price;

  // Símbolo de moneda
  const getCurrencySymbol = (currency: string): string => {
    switch (currency) {
      case 'MXN': return '$';
      case 'EUR': return '€';
      case 'USD': return '$';
      default: return currency;
    }
  };

  // Formateo inteligente para números grandes
  if (amount >= 1e15) {
    return `${getCurrencySymbol(currency)} ${(amount / 1e12).toFixed(1)}T`;
  }
  if (amount >= 1e12) {
    return `${getCurrencySymbol(currency)} ${(amount / 1e12).toFixed(1)}T`;
  }
  if (amount >= 1e9) {
    return `${getCurrencySymbol(currency)} ${(amount / 1e9).toFixed(1)}B`;
  }
  if (amount >= 1e6) {
    return `${getCurrencySymbol(currency)} ${(amount / 1e6).toFixed(1)}M`;
  }
  if (amount >= 1e3) {
    return `${getCurrencySymbol(currency)} ${(amount / 1e3).toFixed(1)}K`;
  }

  // Formateo normal para números pequeños
  const locale = currency === 'MXN' ? 'es-MX' : 'es-ES';
  const formatter = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  return `${getCurrencySymbol(currency)} ${formatter.format(amount)}`;
}