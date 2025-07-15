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
    const formatter = new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: this.currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
    return formatter.format(this.amount)
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