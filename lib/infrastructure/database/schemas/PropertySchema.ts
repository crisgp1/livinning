import mongoose, { Schema, Document } from 'mongoose'
import { PropertyStatus } from '../../../domain/entities/Property'
import { PropertyTypeEnum } from '../../../domain/value-objects/PropertyType'

export interface PropertyDocument extends Document {
  _id: string
  title: string
  description: string
  price: {
    amount: number
    currency: string
  }
  propertyType: PropertyTypeEnum
  address: {
    street: string
    city: string
    state: string
    country: string
    postalCode: string
    coordinates?: {
      latitude: number
      longitude: number
    }
    displayPrivacy: boolean
  }
  features: {
    bedrooms: number
    bathrooms: number
    squareMeters: number
    lotSize?: number
    yearBuilt?: number
    parking?: number
    amenities: string[]
  }
  images: string[]
  ownerId: string
  organizationId: string
  status: PropertyStatus
  isHighlighted: boolean
  highlightExpiresAt?: Date
  createdAt: Date
  updatedAt: Date
}

const CoordinatesSchema = new Schema({
  latitude: { type: Number, required: true, min: -90, max: 90 },
  longitude: { type: Number, required: true, min: -180, max: 180 }
}, { _id: false })

const AddressSchema = new Schema({
  street: { type: String, required: true, trim: true },
  city: { type: String, required: true, trim: true },
  state: { type: String, required: true, trim: true },
  country: { type: String, required: true, trim: true },
  postalCode: { type: String, required: true, trim: true },
  coordinates: { type: CoordinatesSchema, required: false },
  displayPrivacy: { type: Boolean, default: false }
}, { _id: false })

const PriceSchema = new Schema({
  amount: { type: Number, required: true, min: 0 },
  currency: { type: String, required: true, length: 3, default: 'EUR' }
}, { _id: false })

const FeaturesSchema = new Schema({
  bedrooms: { type: Number, required: true, min: 0 },
  bathrooms: { type: Number, required: true, min: 0 },
  squareMeters: { type: Number, required: true, min: 1 },
  lotSize: { type: Number, required: false, min: 1 },
  yearBuilt: { type: Number, required: false, min: 1800, max: new Date().getFullYear() },
  parking: { type: Number, required: false, min: 0 },
  amenities: [{ type: String, trim: true }]
}, { _id: false })

const PropertySchema = new Schema({
  _id: { type: String, required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  price: { type: PriceSchema, required: true },
  propertyType: { 
    type: String, 
    required: true, 
    enum: Object.values(PropertyTypeEnum) 
  },
  address: { type: AddressSchema, required: true },
  features: { type: FeaturesSchema, required: true },
  images: [{ type: String, required: true }],
  ownerId: { type: String, required: true },
  organizationId: { type: String, required: true },
  status: { 
    type: String, 
    required: true, 
    enum: Object.values(PropertyStatus),
    default: PropertyStatus.DRAFT 
  },
  isHighlighted: { type: Boolean, default: false },
  highlightExpiresAt: { type: Date, required: false }
}, {
  timestamps: true,
  versionKey: false
})

// Indexes for better query performance
PropertySchema.index({ ownerId: 1 })
PropertySchema.index({ organizationId: 1 })
PropertySchema.index({ organizationId: 1, status: 1 })
PropertySchema.index({ organizationId: 1, ownerId: 1 })
PropertySchema.index({ status: 1 })
PropertySchema.index({ 'address.city': 1 })
PropertySchema.index({ 'address.state': 1 })
PropertySchema.index({ propertyType: 1 })
PropertySchema.index({ 'price.amount': 1 })
PropertySchema.index({ 'features.bedrooms': 1 })
PropertySchema.index({ 'features.bathrooms': 1 })
PropertySchema.index({ createdAt: -1 })
PropertySchema.index({ isHighlighted: 1, highlightExpiresAt: 1 })
PropertySchema.index({ isHighlighted: 1, status: 1 })

export const PropertyModel = mongoose.models.Property || mongoose.model<PropertyDocument>('Property', PropertySchema)