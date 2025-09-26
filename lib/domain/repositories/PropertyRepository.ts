import { Property } from '../entities/Property'

export interface PropertyFilters {
  priceMin?: number
  priceMax?: number
  propertyType?: string
  city?: string
  state?: string
  bedrooms?: number
  bathrooms?: number
  amenities?: string[]
  ownerId?: string
  organizationId?: string
  status?: string
  isHighlighted?: boolean
}

export interface PropertyRepository {
  save(property: Property): Promise<Property>
  findById(id: string): Promise<Property | null>
  findByOwnerId(ownerId: string): Promise<Property[]>
  findAll(filters?: PropertyFilters, limit?: number, offset?: number): Promise<Property[]>
  findHighlighted(limit?: number, offset?: number): Promise<Property[]>
  update(property: Property): Promise<Property>
  delete(id: string): Promise<void>
  count(filters?: PropertyFilters): Promise<number>
}