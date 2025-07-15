import { Property } from '../../domain/entities/Property'
import { Address, Coordinates } from '../../domain/value-objects/Address'
import { Price } from '../../domain/value-objects/Price'
import { PropertyType } from '../../domain/value-objects/PropertyType'
import { PropertyFeatures } from '../../domain/value-objects/PropertyFeatures'
import { PropertyRepository } from '../../domain/repositories/PropertyRepository'
import { CreatePropertyDTO } from '../dtos/CreatePropertyDTO'

export class CreatePropertyUseCase {
  constructor(private propertyRepository: PropertyRepository) {}

  async execute(dto: CreatePropertyDTO): Promise<Property> {
    try {
      // Create value objects
      const price = new Price(dto.price.amount, dto.price.currency)
      const propertyType = new PropertyType(dto.propertyType)
      
      const coordinates = dto.address.coordinates 
        ? new Coordinates(dto.address.coordinates.latitude, dto.address.coordinates.longitude)
        : undefined
      
      const address = new Address(
        dto.address.street,
        dto.address.city,
        dto.address.state,
        dto.address.country,
        dto.address.postalCode,
        coordinates
      )

      const features = new PropertyFeatures(
        dto.features.bedrooms,
        dto.features.bathrooms,
        dto.features.squareMeters,
        dto.features.lotSize,
        dto.features.yearBuilt,
        dto.features.parking,
        dto.features.amenities
      )

      // Create property entity
      const property = Property.create(
        dto.title,
        dto.description,
        price,
        propertyType,
        address,
        features,
        dto.images,
        dto.ownerId,
        dto.organizationId
      )

      // Save to repository
      return await this.propertyRepository.save(property)
    } catch (error) {
      throw new Error(`Failed to create property: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
}