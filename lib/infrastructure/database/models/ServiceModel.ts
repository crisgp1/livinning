import mongoose, { Document, Schema } from 'mongoose'

export interface ServiceFeature {
  id: string
  title: string
  description: string
  included: boolean
}

export interface ServiceDocument extends Document {
  _id: string
  title: string
  description: string
  category: string
  basePrice: number
  currency: string
  duration: string
  features: ServiceFeature[]
  isActive: boolean
  requiresApproval: boolean
  maxProviders: number
  currentProviders: number
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

const ServiceFeatureSchema = new Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  included: { type: Boolean, default: true }
})

const ServiceSchema = new Schema({
  _id: { type: String, required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  category: {
    type: String,
    required: true,
    enum: ['visual', 'legal', 'consulting', 'staging', 'documentation', 'marketing']
  },
  basePrice: { type: Number, required: true, min: 0 },
  currency: { type: String, required: true, default: 'MXN' },
  duration: { type: String, required: true },
  features: [ServiceFeatureSchema],
  isActive: { type: Boolean, default: true },
  requiresApproval: { type: Boolean, default: true },
  maxProviders: { type: Number, default: 10 },
  currentProviders: { type: Number, default: 0 },
  createdBy: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  _id: false,
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
})

ServiceSchema.index({ category: 1, isActive: 1 })
ServiceSchema.index({ createdBy: 1 })
ServiceSchema.index({ isActive: 1, requiresApproval: 1 })

const ServiceModel = mongoose.models.Service || mongoose.model<ServiceDocument>('Service', ServiceSchema)

export default ServiceModel