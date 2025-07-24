export class Price {
  constructor(
    public readonly amount: number,
    public readonly currency: string = 'EUR'
  ) {
    if (amount < 0) throw new Error('Price amount cannot be negative')
    if (!currency.trim()) throw new Error('Currency is required')
    if (currency.length !== 3) throw new Error('Currency must be 3 characters')
  }

  getFormattedPrice(): string {
    const locale = this.currency === 'MXN' ? 'es-MX' : 'es-ES';
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