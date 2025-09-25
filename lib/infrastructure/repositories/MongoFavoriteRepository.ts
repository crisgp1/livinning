import { FavoriteRepository } from '../../domain/repositories/FavoriteRepository'
import { Favorite } from '../../domain/entities/Favorite'
import { Property, PropertyStatus } from '../../domain/entities/Property'
import { Address, Coordinates } from '../../domain/value-objects/Address'
import { Price } from '../../domain/value-objects/Price'
import { PropertyType } from '../../domain/value-objects/PropertyType'
import { PropertyFeatures } from '../../domain/value-objects/PropertyFeatures'
import { FavoriteModel, FavoriteDocument } from '../database/schemas/FavoriteSchema'
import { PropertyModel, PropertyDocument } from '../database/schemas/PropertySchema'
import connectDB from '../database/connection'

export class MongoFavoriteRepository implements FavoriteRepository {
  private async ensureConnection(): Promise<void> {
    await connectDB()
  }

  private toDomain(doc: FavoriteDocument): Favorite {
    return new Favorite(
      doc._id,
      doc.userId,
      doc.propertyId,
      doc.createdAt
    )
  }

  private propertyToDomain(doc: PropertyDocument): Property {
    const coordinates = doc.address.coordinates 
      ? new Coordinates(doc.address.coordinates.latitude, doc.address.coordinates.longitude)
      : undefined

    const address = new Address(
      doc.address.street,
      doc.address.city,
      doc.address.state,
      doc.address.country,
      doc.address.postalCode,
      coordinates
    )

    const price = new Price(doc.price.amount, doc.price.currency)
    const propertyType = new PropertyType(doc.propertyType)
    const features = new PropertyFeatures(
      doc.features.bedrooms,
      doc.features.bathrooms,
      doc.features.squareMeters,
      doc.features.lotSize,
      doc.features.yearBuilt,
      doc.features.parking,
      doc.features.amenities
    )

    return new Property(
      doc._id,
      doc.title,
      doc.description,
      price,
      propertyType,
      address,
      features,
      doc.images,
      doc.ownerId,
      doc.organizationId,
      doc.status as PropertyStatus,
      doc.isHighlighted || false,
      doc.highlightExpiresAt,
      doc.createdAt,
      doc.updatedAt
    )
  }

  private toDocument(favorite: Favorite): Partial<FavoriteDocument> {
    return {
      _id: favorite.id,
      userId: favorite.userId,
      propertyId: favorite.propertyId
    }
  }

  async save(favorite: Favorite): Promise<Favorite> {
    await this.ensureConnection()
    
    const doc = new FavoriteModel(this.toDocument(favorite))
    const savedDoc = await doc.save()
    
    return this.toDomain(savedDoc)
  }

  async findById(id: string): Promise<Favorite | null> {
    await this.ensureConnection()
    
    const doc = await FavoriteModel.findById(id)
    return doc ? this.toDomain(doc) : null
  }

  async findByUserId(userId: string): Promise<Favorite[]> {
    await this.ensureConnection()
    
    const docs = await FavoriteModel.find({ userId }).sort({ createdAt: -1 })
    return docs.map(doc => this.toDomain(doc))
  }

  async findByUserAndProperty(userId: string, propertyId: string): Promise<Favorite | null> {
    await this.ensureConnection()
    
    const doc = await FavoriteModel.findOne({ userId, propertyId })
    return doc ? this.toDomain(doc) : null
  }

  async getFavoritePropertiesByUser(userId: string): Promise<Property[]> {
    await this.ensureConnection()
    
    // Find all favorites for the user and populate the property details
    const favorites = await FavoriteModel.find({ userId }).sort({ createdAt: -1 })
    const propertyIds = favorites.map(fav => fav.propertyId)
    
    // Get the actual property documents
    const propertyDocs = await PropertyModel.find({ 
      _id: { $in: propertyIds },
      status: PropertyStatus.PUBLISHED // Only show published properties
    })
    
    // Sort properties by the order they were favorited (most recent first)
    const sortedProperties = propertyIds.map(propertyId => 
      propertyDocs.find(prop => prop._id === propertyId)
    ).filter(Boolean) as PropertyDocument[]
    
    return sortedProperties.map(doc => this.propertyToDomain(doc))
  }

  async delete(id: string): Promise<void> {
    await this.ensureConnection()
    
    const result = await FavoriteModel.findByIdAndDelete(id)
    
    if (!result) {
      throw new Error('Favorite not found')
    }
  }

  async deleteByUserAndProperty(userId: string, propertyId: string): Promise<void> {
    await this.ensureConnection()
    
    const result = await FavoriteModel.findOneAndDelete({ userId, propertyId })
    
    if (!result) {
      throw new Error('Favorite not found')
    }
  }

  async count(userId: string): Promise<number> {
    await this.ensureConnection()
    
    return await FavoriteModel.countDocuments({ userId })
  }
}