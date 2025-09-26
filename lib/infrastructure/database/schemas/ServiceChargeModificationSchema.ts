import mongoose, { Schema, Document } from 'mongoose'

export interface ServiceChargeModificationDocument extends Document {
  _id: string
  vendorId: string // Clerk user ID
  serviceId: string // Reference to VendorDashboardService
  authorizedBy: string // Admin/SuperAdmin user ID who authorized the change
  originalPrice: number
  newPrice: number
  currency: string
  reason: string
  status: 'pending' | 'approved' | 'rejected' | 'expired'
  requestedAt: Date
  authorizedAt?: Date
  expiresAt?: Date
  appliedAt?: Date
  notes?: string
  modificationHistory: {
    action: 'requested' | 'approved' | 'rejected' | 'applied' | 'expired'
    timestamp: Date
    performedBy: string
    notes?: string
  }[]
}

const ServiceChargeModificationSchema = new Schema<ServiceChargeModificationDocument>({
  _id: { type: String, required: true },
  vendorId: { type: String, required: true, index: true },
  serviceId: { type: String, required: true, index: true },
  authorizedBy: { type: String, required: true },
  originalPrice: { type: Number, required: true, min: 0 },
  newPrice: { type: Number, required: true, min: 0 },
  currency: { type: String, default: 'MXN' },
  reason: { type: String, required: true, trim: true },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected', 'expired'],
    default: 'pending',
    index: true
  },
  requestedAt: { type: Date, default: Date.now, index: true },
  authorizedAt: { type: Date },
  expiresAt: { type: Date },
  appliedAt: { type: Date },
  notes: { type: String, trim: true },
  modificationHistory: [{
    action: { 
      type: String,
      enum: ['requested', 'approved', 'rejected', 'applied', 'expired'],
      required: true
    },
    timestamp: { type: Date, default: Date.now },
    performedBy: { type: String, required: true },
    notes: { type: String, trim: true }
  }]
})

// Indexes for better query performance
ServiceChargeModificationSchema.index({ vendorId: 1, status: 1 })
ServiceChargeModificationSchema.index({ serviceId: 1, status: 1 })
ServiceChargeModificationSchema.index({ authorizedBy: 1, requestedAt: -1 })
ServiceChargeModificationSchema.index({ expiresAt: 1, status: 1 })

// Middleware to add history entry when status changes
ServiceChargeModificationSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    this.modificationHistory.push({
      action: this.status as any,
      timestamp: new Date(),
      performedBy: this.authorizedBy,
      notes: this.notes
    })
  }
  next()
})

export const ServiceChargeModificationModel = mongoose.models.ServiceChargeModification || 
  mongoose.model<ServiceChargeModificationDocument>('ServiceChargeModification', ServiceChargeModificationSchema)