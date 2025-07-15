import { v4 as uuidv4 } from 'uuid'
import { Address } from '../value-objects/Address'
import { Price } from '../value-objects/Price'
import { PropertyType } from '../value-objects/PropertyType'
import { PropertyFeatures } from '../value-objects/PropertyFeatures'

export enum PropertyStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  SOLD = 'sold',
  RENTED = 'rented',
  SUSPENDED = 'suspended'
}

export class Property {
  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly description: string,
    public readonly price: Price,
    public readonly propertyType: PropertyType,
    public readonly address: Address,
    public readonly features: PropertyFeatures,
    public readonly images: string[],
    public readonly ownerId: string,
    public readonly organizationId: string,
    public readonly status: PropertyStatus = PropertyStatus.DRAFT,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date()
  ) {
    if (!title.trim()) throw new Error('Title is required')
    if (!description.trim()) throw new Error('Description is required')
    if (!ownerId.trim()) throw new Error('Owner ID is required')
    if (!organizationId.trim()) throw new Error('Organization ID is required')
    if (images.length === 0) throw new Error('At least one image is required')
  }

  static create(
    title: string,
    description: string,
    price: Price,
    propertyType: PropertyType,
    address: Address,
    features: PropertyFeatures,
    images: string[],
    ownerId: string,
    organizationId: string
  ): Property {
    return new Property(
      uuidv4(),
      title,
      description,
      price,
      propertyType,
      address,
      features,
      images,
      ownerId,
      organizationId
    )
  }

  publish(): Property {
    if (this.status === PropertyStatus.PUBLISHED) {
      throw new Error('Property is already published')
    }
    
    return new Property(
      this.id,
      this.title,
      this.description,
      this.price,
      this.propertyType,
      this.address,
      this.features,
      this.images,
      this.ownerId,
      this.organizationId,
      PropertyStatus.PUBLISHED,
      this.createdAt,
      new Date()
    )
  }

  updateDetails(
    title?: string,
    description?: string,
    price?: Price
  ): Property {
    return new Property(
      this.id,
      title ?? this.title,
      description ?? this.description,
      price ?? this.price,
      this.propertyType,
      this.address,
      this.features,
      this.images,
      this.ownerId,
      this.organizationId,
      this.status,
      this.createdAt,
      new Date()
    )
  }

  addImage(imageUrl: string): Property {
    if (this.images.includes(imageUrl)) {
      throw new Error('Image already exists')
    }

    return new Property(
      this.id,
      this.title,
      this.description,
      this.price,
      this.propertyType,
      this.address,
      this.features,
      [...this.images, imageUrl],
      this.ownerId,
      this.organizationId,
      this.status,
      this.createdAt,
      new Date()
    )
  }

  removeImage(imageUrl: string): Property {
    const newImages = this.images.filter(img => img !== imageUrl)
    
    if (newImages.length === 0) {
      throw new Error('Cannot remove all images')
    }

    return new Property(
      this.id,
      this.title,
      this.description,
      this.price,
      this.propertyType,
      this.address,
      this.features,
      newImages,
      this.ownerId,
      this.organizationId,
      this.status,
      this.createdAt,
      new Date()
    )
  }

  suspend(): Property {
    return new Property(
      this.id,
      this.title,
      this.description,
      this.price,
      this.propertyType,
      this.address,
      this.features,
      this.images,
      this.ownerId,
      this.organizationId,
      PropertyStatus.SUSPENDED,
      this.createdAt,
      new Date()
    )
  }

  markAsSold(): Property {
    return new Property(
      this.id,
      this.title,
      this.description,
      this.price,
      this.propertyType,
      this.address,
      this.features,
      this.images,
      this.ownerId,
      this.organizationId,
      PropertyStatus.SOLD,
      this.createdAt,
      new Date()
    )
  }

  isOwnedBy(userId: string): boolean {
    return this.ownerId === userId
  }

  belongsToOrganization(organizationId: string): boolean {
    return this.organizationId === organizationId
  }

  isPublished(): boolean {
    return this.status === PropertyStatus.PUBLISHED
  }
}