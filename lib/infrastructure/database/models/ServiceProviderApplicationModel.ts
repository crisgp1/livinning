import mongoose, { Document, Schema } from 'mongoose'

export interface PortfolioItem {
  id: string
  title: string
  description: string
  imageUrl: string
  projectDate: string
  clientTestimonial?: string
}

export interface ServiceProviderApplicationDocument extends Document {
  _id: string
  serviceId: string
  providerId: string
  providerName: string
  providerEmail: string
  businessName?: string
  experience: string
  certifications: string[]
  portfolio: PortfolioItem[]
  proposedPrice: number
  currency: string
  availability: string
  coverLetter: string
  status: 'pending' | 'under_review' | 'approved' | 'rejected'
  reviewedBy?: string
  reviewNotes?: string
  approvedAt?: Date
  rejectedAt?: Date
  createdAt: Date
  updatedAt: Date
}

const PortfolioItemSchema = new Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  imageUrl: { type: String, required: true },
  projectDate: { type: String, required: true },
  clientTestimonial: { type: String }
})

const ServiceProviderApplicationSchema = new Schema({
  _id: { type: String, required: true },
  serviceId: { type: String, required: true },
  providerId: { type: String, required: true },
  providerName: { type: String, required: true },
  providerEmail: { type: String, required: true },
  businessName: { type: String },
  experience: { type: String, required: true },
  certifications: [{ type: String }],
  portfolio: [PortfolioItemSchema],
  proposedPrice: { type: Number, required: true, min: 0 },
  currency: { type: String, required: true, default: 'MXN' },
  availability: { type: String, required: true },
  coverLetter: { type: String, required: true },
  status: {
    type: String,
    enum: ['pending', 'under_review', 'approved', 'rejected'],
    default: 'pending'
  },
  reviewedBy: { type: String },
  reviewNotes: { type: String },
  approvedAt: { type: Date },
  rejectedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  _id: false,
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
})

ServiceProviderApplicationSchema.index({ serviceId: 1, status: 1 })
ServiceProviderApplicationSchema.index({ providerId: 1 })
ServiceProviderApplicationSchema.index({ status: 1, createdAt: -1 })
ServiceProviderApplicationSchema.index({ reviewedBy: 1 })

const ServiceProviderApplicationModel = mongoose.models.ServiceProviderApplication ||
  mongoose.model<ServiceProviderApplicationDocument>('ServiceProviderApplication', ServiceProviderApplicationSchema)

export default ServiceProviderApplicationModel