import { Property } from '../../domain/entities/Property'
import { PropertyRepository } from '../../domain/repositories/PropertyRepository'
import { CreatePropertyUseCase } from '../use-cases/CreatePropertyUseCase'
import { GetPropertiesUseCase, GetPropertiesRequest, GetPropertiesResponse } from '../use-cases/GetPropertiesUseCase'
import { PublishPropertyUseCase } from '../use-cases/PublishPropertyUseCase'
import { CreatePropertyDTO } from '../dtos/CreatePropertyDTO'

export class PropertyService {
  private createPropertyUseCase: CreatePropertyUseCase
  private getPropertiesUseCase: GetPropertiesUseCase
  private publishPropertyUseCase: PublishPropertyUseCase

  constructor(private propertyRepository: PropertyRepository) {
    this.createPropertyUseCase = new CreatePropertyUseCase(propertyRepository)
    this.getPropertiesUseCase = new GetPropertiesUseCase(propertyRepository)
    this.publishPropertyUseCase = new PublishPropertyUseCase(propertyRepository)
  }

  async createProperty(dto: CreatePropertyDTO): Promise<Property> {
    return await this.createPropertyUseCase.execute(dto)
  }

  async getProperties(request: GetPropertiesRequest): Promise<GetPropertiesResponse> {
    return await this.getPropertiesUseCase.execute(request)
  }

  async getPropertyById(id: string): Promise<Property | null> {
    return await this.propertyRepository.findById(id)
  }

  async getPropertiesByOwner(ownerId: string): Promise<Property[]> {
    return await this.propertyRepository.findByOwnerId(ownerId)
  }

  async publishProperty(propertyId: string, ownerId: string): Promise<Property> {
    return await this.publishPropertyUseCase.execute(propertyId, ownerId)
  }

  async updateProperty(property: Property): Promise<Property> {
    return await this.propertyRepository.update(property)
  }

  async deleteProperty(id: string, ownerId: string): Promise<void> {
    const property = await this.propertyRepository.findById(id)
    
    if (!property) {
      throw new Error('Property not found')
    }

    if (!property.isOwnedBy(ownerId)) {
      throw new Error('You are not authorized to delete this property')
    }

    await this.propertyRepository.delete(id)
  }

  async highlightProperty(propertyId: string, ownerId: string, durationInDays: number = 30): Promise<Property> {
    const property = await this.propertyRepository.findById(propertyId)
    
    if (!property) {
      throw new Error('Property not found')
    }

    if (!property.isOwnedBy(ownerId)) {
      throw new Error('You are not authorized to highlight this property')
    }

    if (!property.isPublished()) {
      throw new Error('Property must be published before it can be highlighted')
    }

    const highlightedProperty = property.highlight(durationInDays)
    return await this.propertyRepository.update(highlightedProperty)
  }

  async removeHighlight(propertyId: string, ownerId: string): Promise<Property> {
    const property = await this.propertyRepository.findById(propertyId)
    
    if (!property) {
      throw new Error('Property not found')
    }

    if (!property.isOwnedBy(ownerId)) {
      throw new Error('You are not authorized to modify this property')
    }

    const unhighlightedProperty = property.removeHighlight()
    return await this.propertyRepository.update(unhighlightedProperty)
  }

  async extendHighlight(propertyId: string, ownerId: string, additionalDays: number): Promise<Property> {
    const property = await this.propertyRepository.findById(propertyId)
    
    if (!property) {
      throw new Error('Property not found')
    }

    if (!property.isOwnedBy(ownerId)) {
      throw new Error('You are not authorized to modify this property')
    }

    const extendedProperty = property.extendHighlight(additionalDays)
    return await this.propertyRepository.update(extendedProperty)
  }

  async getHighlightedProperties(limit = 20, offset = 0): Promise<Property[]> {
    return await this.propertyRepository.findHighlighted(limit, offset)
  }
}