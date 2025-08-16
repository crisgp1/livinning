import mongoose, { Schema, Document } from 'mongoose'

export interface ServiceRequestDocument extends Document {
  _id: string
  vendorId: string // Clerk user ID of the vendor requesting
  serviceType: string
  serviceName: string
  serviceDescription: string
  requestedAt: Date
  status: 'pending' | 'under_review' | 'approved' | 'rejected'
  reviewedBy?: string // Super admin who reviewed this
  reviewedAt?: Date
  rejectionReason?: string
  pricing: {
    basePrice: number
    currency: string
    priceType: 'fixed' | 'hourly' | 'per_sqft' | 'custom'
  }
  serviceDetails: {
    estimatedDuration?: string
    deliverables: string[]
    requirements: string[]
    specialNotes?: string
  }
  vendorInfo: {
    experience: string
    certifications: string[]
    portfolio: string[]
    whyThisService: string // Why vendor wants to offer this service
  }
  createdAt: Date
  updatedAt: Date
}

const ServiceRequestSchema = new Schema<ServiceRequestDocument>({
  _id: { type: String, required: true },
  vendorId: { type: String, required: true, index: true },
  serviceType: { type: String, required: true, index: true },
  serviceName: { type: String, required: true, trim: true },
  serviceDescription: { type: String, required: true, trim: true },
  requestedAt: { type: Date, default: Date.now },
  status: { 
    type: String, 
    enum: ['pending', 'under_review', 'approved', 'rejected'], 
    default: 'pending',
    index: true
  },
  reviewedBy: { type: String },
  reviewedAt: { type: Date },
  rejectionReason: { type: String },
  pricing: {
    basePrice: { type: Number, required: true, min: 0 },
    currency: { type: String, required: true, default: 'MXN' },
    priceType: { 
      type: String, 
      enum: ['fixed', 'hourly', 'per_sqft', 'custom'], 
      required: true 
    }
  },
  serviceDetails: {
    estimatedDuration: { type: String },
    deliverables: { type: [String], default: [] },
    requirements: { type: [String], default: [] },
    specialNotes: { type: String }
  },
  vendorInfo: {
    experience: { type: String, required: true },
    certifications: { type: [String], default: [] },
    portfolio: { type: [String], default: [] },
    whyThisService: { type: String, required: true }
  },
  createdAt: { type: Date, default: Date.now, index: true },
  updatedAt: { type: Date, default: Date.now }
})

// Indexes for better query performance
ServiceRequestSchema.index({ vendorId: 1, status: 1 })
ServiceRequestSchema.index({ status: 1, createdAt: -1 })
ServiceRequestSchema.index({ vendorId: 1, serviceType: 1 })

// Update the updatedAt field before saving
ServiceRequestSchema.pre('save', function(next) {
  this.updatedAt = new Date()
  next()
})

export const ServiceRequestModel = mongoose.models.ServiceRequest || 
  mongoose.model<ServiceRequestDocument>('ServiceRequest', ServiceRequestSchema)