import mongoose, { Schema, Document } from 'mongoose'

export interface VendorDashboardServiceDocument extends Document {
  _id: string
  vendorId: string // Clerk user ID
  approvedServiceId: string // Reference to ApprovedVendorService
  serviceType: string
  serviceName: string
  serviceDescription: string
  isActive: boolean
  isAvailable: boolean // Vendor can temporarily disable/enable
  customPricing?: {
    basePrice: number
    currency: string
    priceType: 'fixed' | 'hourly' | 'per_sqft' | 'custom'
  }
  serviceArea: {
    cities: string[]
    maxDistance: number // in km
    travelFee?: number
  }
  availability: {
    workingDays: string[]
    workingHours: {
      start: string
      end: string
    }
    blackoutDates: Date[]
    leadTime: number // minimum days needed for booking
  }
  performance: {
    totalOrders: number
    completedOrders: number
    averageRating: number
    totalReviews: number
    onTimeDelivery: number // percentage
  }
  addedAt: Date
  lastModified: Date
}

const VendorDashboardServiceSchema = new Schema<VendorDashboardServiceDocument>({
  _id: { type: String, required: true },
  vendorId: { type: String, required: true, index: true },
  approvedServiceId: { type: String, required: true, index: true },
  serviceType: { type: String, required: true, index: true },
  serviceName: { type: String, required: true, trim: true },
  serviceDescription: { type: String, required: true, trim: true },
  isActive: { type: Boolean, default: true, index: true },
  isAvailable: { type: Boolean, default: true, index: true },
  customPricing: {
    basePrice: { type: Number, min: 0 },
    currency: { type: String, default: 'MXN' },
    priceType: { 
      type: String, 
      enum: ['fixed', 'hourly', 'per_sqft', 'custom']
    }
  },
  serviceArea: {
    cities: { type: [String], default: ['CDMX'] },
    maxDistance: { type: Number, default: 50 }, // 50km default
    travelFee: { type: Number, min: 0, default: 0 }
  },
  availability: {
    workingDays: { 
      type: [String], 
      default: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] 
    },
    workingHours: {
      start: { type: String, default: '09:00' },
      end: { type: String, default: '17:00' }
    },
    blackoutDates: { type: [Date], default: [] },
    leadTime: { type: Number, default: 1 } // 1 day minimum
  },
  performance: {
    totalOrders: { type: Number, default: 0 },
    completedOrders: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0 },
    onTimeDelivery: { type: Number, default: 100, min: 0, max: 100 }
  },
  addedAt: { type: Date, default: Date.now, index: true },
  lastModified: { type: Date, default: Date.now }
})

// Indexes for better query performance
VendorDashboardServiceSchema.index({ vendorId: 1, serviceType: 1 }, { unique: true })
VendorDashboardServiceSchema.index({ vendorId: 1, isActive: 1, isAvailable: 1 })
VendorDashboardServiceSchema.index({ serviceType: 1, isActive: 1, isAvailable: 1 })

// Update the lastModified field before saving
VendorDashboardServiceSchema.pre('save', function(next) {
  this.lastModified = new Date()
  next()
})

export const VendorDashboardServiceModel = mongoose.models.VendorDashboardService || 
  mongoose.model<VendorDashboardServiceDocument>('VendorDashboardService', VendorDashboardServiceSchema)