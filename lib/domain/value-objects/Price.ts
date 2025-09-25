export class Price {
  constructor(
    public readonly amount: number,
    public readonly currency: string = 'MXN'
  ) {
    // VALIDACIONES SÚPER FLEXIBLES - PERMITE CUALQUIER PRECIO
    if (amount < 0) throw new Error('Price amount cannot be negative')
    if (!currency || !currency.trim()) throw new Error('Currency is required')
  }

  getFormattedPrice(): string {
    const locale = this.currency === 'MXN' ? 'es-MX' : 'es-ES';

    // Formateo inteligente para números grandes
    if (this.amount >= 1e15) {
      return `${this.getCurrencySymbol()} ${(this.amount / 1e12).toFixed(1)}T`;
    }
    if (this.amount >= 1e12) {
      return `${this.getCurrencySymbol()} ${(this.amount / 1e12).toFixed(1)}T`;
    }
    if (this.amount >= 1e9) {
      return `${this.getCurrencySymbol()} ${(this.amount / 1e9).toFixed(1)}B`;
    }
    if (this.amount >= 1e6) {
      return `${this.getCurrencySymbol()} ${(this.amount / 1e6).toFixed(1)}M`;
    }
    if (this.amount >= 1e3) {
      return `${this.getCurrencySymbol()} ${(this.amount / 1e3).toFixed(1)}K`;
    }

    const formatter = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: this.currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
    return formatter.format(this.amount)
  }

  getFormattedAmount(): string {
    const locale = this.currency === 'MXN' ? 'es-MX' : 'es-ES';

    // Formateo inteligente para números grandes
    if (this.amount >= 1e15) {
      return `${(this.amount / 1e12).toFixed(1)}T`;
    }
    if (this.amount >= 1e12) {
      return `${(this.amount / 1e12).toFixed(1)}T`;
    }
    if (this.amount >= 1e9) {
      return `${(this.amount / 1e9).toFixed(1)}B`;
    }
    if (this.amount >= 1e6) {
      return `${(this.amount / 1e6).toFixed(1)}M`;
    }
    if (this.amount >= 1e3) {
      return `${(this.amount / 1e3).toFixed(1)}K`;
    }

    return new Intl.NumberFormat(locale).format(this.amount);
  }

  getCurrencySymbol(): string {
    switch (this.currency) {
      case 'MXN': return '$';
      case 'EUR': return '€';
      case 'USD': return '$';
      default: return this.currency;
    }
  }

  getDisplayPrice(): { amount: string; currency: string; symbol: string } {
    return {
      amount: this.getFormattedAmount(),
      currency: this.currency,
      symbol: this.getCurrencySymbol()
    };
  }

  equals(other: Price): boolean {
    return this.amount === other.amount && this.currency === other.currency
  }

  isGreaterThan(other: Price): boolean {
    if (this.currency !== other.currency) {
      throw new Error('Cannot compare prices with different currencies')
    }
    return this.amount > other.amount
  }
}