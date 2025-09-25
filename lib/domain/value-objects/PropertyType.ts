export enum PropertyTypeEnum {
  VILLA = 'villa',
  PENTHOUSE = 'penthouse',
  APARTMENT = 'apartment',
  HOUSE = 'house',
  LOFT = 'loft',
  TOWNHOUSE = 'townhouse',
  STUDIO = 'studio',
  DUPLEX = 'duplex'
}

export class PropertyType {
  constructor(public readonly value: PropertyTypeEnum) {
    if (!Object.values(PropertyTypeEnum).includes(value)) {
      throw new Error(`Invalid property type: ${value}`)
    }
  }

  getDisplayName(): string {
    const displayNames = {
      [PropertyTypeEnum.VILLA]: 'Villa',
      [PropertyTypeEnum.PENTHOUSE]: 'Penthouse',
      [PropertyTypeEnum.APARTMENT]: 'Apartamento',
      [PropertyTypeEnum.HOUSE]: 'Casa',
      [PropertyTypeEnum.LOFT]: 'Loft',
      [PropertyTypeEnum.TOWNHOUSE]: 'Casa Adosada',
      [PropertyTypeEnum.STUDIO]: 'Estudio',
      [PropertyTypeEnum.DUPLEX]: 'Dúplex'
    }
    return displayNames[this.value]
  }

  equals(other: PropertyType): boolean {
    return this.value === other.value
  }
}