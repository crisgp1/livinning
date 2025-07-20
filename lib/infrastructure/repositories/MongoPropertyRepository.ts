import { PropertyRepository, PropertyFilters } from '../../domain/repositories/PropertyRepository'
import { Property, PropertyStatus } from '../../domain/entities/Property'
import { Address, Coordinates } from '../../domain/value-objects/Address'
import { Price } from '../../domain/value-objects/Price'
import { PropertyType, PropertyTypeEnum } from '../../domain/value-objects/PropertyType'
import { PropertyFeatures } from '../../domain/value-objects/PropertyFeatures'
import { PropertyModel, PropertyDocument } from '../database/schemas/PropertySchema'
import connectDB from '../database/connection'

export class MongoPropertyRepository implements PropertyRepository {
  private async ensureConnection(): Promise<void> {
    await connectDB()
  }

  private toDomain(doc: PropertyDocument): Property {
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
      doc.createdAt,
      doc.updatedAt
    )
  }

  private toDocument(property: Property): Partial<PropertyDocument> {
    return {
      _id: property.id,
      title: property.title,
      description: property.description,
      price: {
        amount: property.price.amount,
        currency: property.price.currency
      },
      propertyType: property.propertyType.value,
      address: {
        street: property.address.street,
        city: property.address.city,
        state: property.address.state,
        country: property.address.country,
        postalCode: property.address.postalCode,
        coordinates: property.address.coordinates ? {
          latitude: property.address.coordinates.latitude,
          longitude: property.address.coordinates.longitude
        } : undefined,
        displayPrivacy: property.address.displayPrivacy || false
      },
      features: {
        bedrooms: property.features.bedrooms,
        bathrooms: property.features.bathrooms,
        squareMeters: property.features.squareMeters,
        lotSize: property.features.lotSize,
        yearBuilt: property.features.yearBuilt,
        parking: property.features.parking,
        amenities: property.features.amenities
      },
      images: property.images,
      ownerId: property.ownerId,
      organizationId: property.organizationId,
      status: property.status
    }
  }

  async save(property: Property): Promise<Property> {
    await this.ensureConnection()
    
    const doc = new PropertyModel(this.toDocument(property))
    const savedDoc = await doc.save()
    
    return this.toDomain(savedDoc)
  }

  async findById(id: string): Promise<Property | null> {
    await this.ensureConnection()
    
    const doc = await PropertyModel.findById(id)
    return doc ? this.toDomain(doc) : null
  }

  async findByOwnerId(ownerId: string): Promise<Property[]> {
    await this.ensureConnection()
    
    const docs = await PropertyModel.find({ ownerId }).sort({ createdAt: -1 })
    return docs.map(doc => this.toDomain(doc))
  }

  async findAll(filters?: PropertyFilters, limit = 20, offset = 0): Promise<Property[]> {
    await this.ensureConnection()
    
    const query: any = {}

    if (filters) {
      if (filters.priceMin || filters.priceMax) {
        query['price.amount'] = {}
        if (filters.priceMin) query['price.amount'].$gte = filters.priceMin
        if (filters.priceMax) query['price.amount'].$lte = filters.priceMax
      }

      if (filters.propertyType) {
        query.propertyType = filters.propertyType
      }

      if (filters.city) {
        query['address.city'] = new RegExp(filters.city, 'i')
      }

      if (filters.state) {
        query['address.state'] = new RegExp(filters.state, 'i')
      }

      if (filters.bedrooms) {
        query['features.bedrooms'] = { $gte: filters.bedrooms }
      }

      if (filters.bathrooms) {
        query['features.bathrooms'] = { $gte: filters.bathrooms }
      }

      if (filters.amenities && filters.amenities.length > 0) {
        query['features.amenities'] = { $in: filters.amenities }
      }

      if (filters.ownerId) {
        query.ownerId = filters.ownerId
      }

      if (filters.organizationId) {
        query.organizationId = filters.organizationId
      }

      if (filters.status) {
        query.status = filters.status
      }
    }

    // Only show published properties for public queries (unless owner or organization is specified)
    if (!filters?.ownerId && !filters?.organizationId) {
      query.status = PropertyStatus.PUBLISHED
    }

    const docs = await PropertyModel
      .find(query)
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)

    return docs.map(doc => this.toDomain(doc))
  }

  async update(property: Property): Promise<Property> {
    await this.ensureConnection()
    
    const updateData = this.toDocument(property)
    delete updateData._id // Remove _id from update data
    
    const doc = await PropertyModel.findByIdAndUpdate(
      property.id,
      { ...updateData, updatedAt: new Date() },
      { new: true }
    )

    if (!doc) {
      throw new Error('Property not found')
    }

    return this.toDomain(doc)
  }

  async delete(id: string): Promise<void> {
    await this.ensureConnection()
    
    const result = await PropertyModel.findByIdAndDelete(id)
    
    if (!result) {
      throw new Error('Property not found')
    }
  }

  async count(filters?: PropertyFilters): Promise<number> {
    await this.ensureConnection()
    
    const query: any = {}

    if (filters) {
      if (filters.priceMin || filters.priceMax) {
        query['price.amount'] = {}
        if (filters.priceMin) query['price.amount'].$gte = filters.priceMin
        if (filters.priceMax) query['price.amount'].$lte = filters.priceMax
      }

      if (filters.propertyType) {
        query.propertyType = filters.propertyType
      }

      if (filters.city) {
        query['address.city'] = new RegExp(filters.city, 'i')
      }

      if (filters.state) {
        query['address.state'] = new RegExp(filters.state, 'i')
      }

      if (filters.bedrooms) {
        query['features.bedrooms'] = { $gte: filters.bedrooms }
      }

      if (filters.bathrooms) {
        query['features.bathrooms'] = { $gte: filters.bathrooms }
      }

      if (filters.amenities && filters.amenities.length > 0) {
        query['features.amenities'] = { $in: filters.amenities }
      }

      if (filters.ownerId) {
        query.ownerId = filters.ownerId
      }

      if (filters.organizationId) {
        query.organizationId = filters.organizationId
      }

      if (filters.status) {
        query.status = filters.status
      }
    }

    // Only show published properties for public queries (unless owner or organization is specified)
    if (!filters?.ownerId && !filters?.organizationId) {
      query.status = PropertyStatus.PUBLISHED
    }

    return await PropertyModel.countDocuments(query)
  }
}