import mongoose, { Schema, Document } from 'mongoose'

export interface ApprovedVendorServiceDocument extends Document {
  _id: string
  vendorId: string // Clerk user ID of the vendor
  serviceType: string
  serviceName: string
  serviceDescription: string
  approvedBy: string // Super admin who approved this
  approvedAt: Date
  isActive: boolean
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
  }
  createdAt: Date
  updatedAt: Date
}

const ApprovedVendorServiceSchema = new Schema<ApprovedVendorServiceDocument>({
  _id: { type: String, required: true },
  vendorId: { type: String, required: true, index: true },
  serviceType: { type: String, required: true, index: true },
  serviceName: { type: String, required: true, trim: true },
  serviceDescription: { type: String, required: true, trim: true },
  approvedBy: { type: String, required: true },
  approvedAt: { type: Date, required: true },
  isActive: { type: Boolean, default: true, index: true },
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
    portfolio: { type: [String], default: [] }
  },
  createdAt: { type: Date, default: Date.now, index: true },
  updatedAt: { type: Date, default: Date.now }
})

// Indexes for better query performance
ApprovedVendorServiceSchema.index({ vendorId: 1, serviceType: 1 }, { unique: true })
ApprovedVendorServiceSchema.index({ vendorId: 1, isActive: 1 })
ApprovedVendorServiceSchema.index({ serviceType: 1, isActive: 1 })

// Update the updatedAt field before saving
ApprovedVendorServiceSchema.pre('save', function(next) {
  this.updatedAt = new Date()
  next()
})

export const ApprovedVendorServiceModel = mongoose.models.ApprovedVendorService || 
  mongoose.model<ApprovedVendorServiceDocument>('ApprovedVendorService', ApprovedVendorServiceSchema)