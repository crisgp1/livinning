export enum TransactionTypeEnum {
  SALE = 'sale',
  RENT = 'rent',
  BOTH = 'both'
}

export class TransactionType {
  constructor(public readonly value: TransactionTypeEnum) {
    if (!Object.values(TransactionTypeEnum).includes(value)) {
      throw new Error(`Invalid transaction type: ${value}`)
    }
  }

  getDisplayName(): string {
    const displayNames = {
      [TransactionTypeEnum.SALE]: 'Venta',
      [TransactionTypeEnum.RENT]: 'Renta',
      [TransactionTypeEnum.BOTH]: 'Venta/Renta'
    }
    return displayNames[this.value]
  }

  isSale(): boolean {
    return this.value === TransactionTypeEnum.SALE || this.value === TransactionTypeEnum.BOTH
  }

  isRent(): boolean {
    return this.value === TransactionTypeEnum.RENT || this.value === TransactionTypeEnum.BOTH
  }

  equals(other: TransactionType): boolean {
    return this.value === other.value
  }
}