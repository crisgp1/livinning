import { Property } from '../../domain/entities/Property'
import { PropertyRepository } from '../../domain/repositories/PropertyRepository'

export class PublishPropertyUseCase {
  constructor(private propertyRepository: PropertyRepository) {}

  async execute(propertyId: string, ownerId: string): Promise<Property> {
    try {
      const property = await this.propertyRepository.findById(propertyId)
      
      if (!property) {
        throw new Error('Property not found')
      }

      if (!property.isOwnedBy(ownerId)) {
        throw new Error('You are not authorized to publish this property')
      }

      const publishedProperty = property.publish()
      
      return await this.propertyRepository.update(publishedProperty)
    } catch (error) {
      throw new Error(`Failed to publish property: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
}