export class Address {
  constructor(
    public readonly street: string,
    public readonly city: string,
    public readonly state: string,
    public readonly country: string,
    public readonly postalCode: string,
    public readonly coordinates?: Coordinates,
    public readonly displayPrivacy: boolean = false
  ) {
    if (!street.trim()) throw new Error('Street is required')
    if (!city.trim()) throw new Error('City is required')
    if (!state.trim()) throw new Error('State is required')
    if (!country.trim()) throw new Error('Country is required')
    if (!postalCode.trim()) throw new Error('Postal code is required')
  }

  getFullAddress(): string {
    return `${this.street}, ${this.city}, ${this.state}, ${this.country} ${this.postalCode}`
  }

  equals(other: Address): boolean {
    return (
      this.street === other.street &&
      this.city === other.city &&
      this.state === other.state &&
      this.country === other.country &&
      this.postalCode === other.postalCode &&
      this.displayPrivacy === other.displayPrivacy
    )
  }
}

export class Coordinates {
  constructor(
    public readonly latitude: number,
    public readonly longitude: number
  ) {
    if (latitude < -90 || latitude > 90) {
      throw new Error('Latitude must be between -90 and 90')
    }
    if (longitude < -180 || longitude > 180) {
      throw new Error('Longitude must be between -180 and 180')
    }
  }
}