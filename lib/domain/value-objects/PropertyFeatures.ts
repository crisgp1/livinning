export class PropertyFeatures {
  constructor(
    public readonly bedrooms: number,
    public readonly bathrooms: number,
    public readonly squareMeters: number,
    public readonly lotSize?: number,
    public readonly yearBuilt?: number,
    public readonly parking?: number,
    public readonly amenities: string[] = []
  ) {
    if (bedrooms < 0) throw new Error('Bedrooms cannot be negative')
    if (bathrooms < 0) throw new Error('Bathrooms cannot be negative')
    if (squareMeters <= 0) throw new Error('Square meters must be positive')
    if (lotSize && lotSize <= 0) throw new Error('Lot size must be positive')
    if (yearBuilt && (yearBuilt < 1800 || yearBuilt > new Date().getFullYear())) {
      throw new Error('Year built must be between 1800 and current year')
    }
    if (parking && parking < 0) throw new Error('Parking cannot be negative')
  }

  hasAmenity(amenity: string): boolean {
    return this.amenities.includes(amenity)
  }

  addAmenity(amenity: string): PropertyFeatures {
    if (this.hasAmenity(amenity)) return this
    
    return new PropertyFeatures(
      this.bedrooms,
      this.bathrooms,
      this.squareMeters,
      this.lotSize,
      this.yearBuilt,
      this.parking,
      [...this.amenities, amenity]
    )
  }

  removeAmenity(amenity: string): PropertyFeatures {
    return new PropertyFeatures(
      this.bedrooms,
      this.bathrooms,
      this.squareMeters,
      this.lotSize,
      this.yearBuilt,
      this.parking,
      this.amenities.filter(a => a !== amenity)
    )
  }

  equals(other: PropertyFeatures): boolean {
    return (
      this.bedrooms === other.bedrooms &&
      this.bathrooms === other.bathrooms &&
      this.squareMeters === other.squareMeters &&
      this.lotSize === other.lotSize &&
      this.yearBuilt === other.yearBuilt &&
      this.parking === other.parking &&
      JSON.stringify(this.amenities.sort()) === JSON.stringify(other.amenities.sort())
    )
  }
}