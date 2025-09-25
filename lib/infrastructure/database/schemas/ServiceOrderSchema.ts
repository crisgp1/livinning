import mongoose, { Schema, Document } from 'mongoose'
import { ServiceOrderStatus, ServiceType } from '../../../domain/entities/ServiceOrder'

export interface ServiceOrderDocument extends Document {
  _id: string
  userId: string
  serviceType: ServiceType
  serviceName: string
  serviceDescription: string
  propertyAddress: string
  contactPhone: string
  preferredDate: string
  specialRequests: string
  amount: number
  currency: string
  status: ServiceOrderStatus
  stripePaymentIntentId?: string
  stripeSessionId?: string
  customerEmail?: string
  estimatedDelivery?: string
  actualDelivery?: Date
  assignedTo?: string
  assignedProviderId?: string
  customerName?: string
  deliverables: string[]
  notes: string[]
  createdAt: Date
  updatedAt: Date
}

const ServiceOrderSchema = new Schema<ServiceOrderDocument>({
  _id: { type: String, required: true },
  userId: { type: String, required: true, index: true },
  serviceType: { 
    type: String, 
    enum: Object.values(ServiceType), 
    required: true,
    index: true
  },
  serviceName: { type: String, required: true, trim: true },
  serviceDescription: { type: String, required: true, trim: true },
  propertyAddress: { type: String, required: true, trim: true },
  contactPhone: { type: String, required: true, trim: true },
  preferredDate: { type: String, required: true },
  specialRequests: { type: String, default: '', trim: true },
  amount: { type: Number, required: true, min: 0 },
  currency: { type: String, required: true, default: 'MXN' },
  status: { 
    type: String, 
    enum: Object.values(ServiceOrderStatus), 
    default: ServiceOrderStatus.PENDING,
    index: true
  },
  stripePaymentIntentId: { type: String },
  stripeSessionId: { type: String },
  customerEmail: { type: String, trim: true },
  estimatedDelivery: { type: String },
  actualDelivery: { type: Date },
  assignedTo: { type: String, trim: true },
  assignedProviderId: { type: String, trim: true, index: true },
  customerName: { type: String, trim: true },
  deliverables: { type: [String], default: [] },
  notes: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now, index: true },
  updatedAt: { type: Date, default: Date.now }
})

// Indexes for better query performance
ServiceOrderSchema.index({ userId: 1, createdAt: -1 })
ServiceOrderSchema.index({ status: 1, createdAt: -1 })
ServiceOrderSchema.index({ serviceType: 1, createdAt: -1 })
ServiceOrderSchema.index({ assignedProviderId: 1, status: 1 })
// Stripe payment indexes - only one index per field needed
ServiceOrderSchema.index({ stripePaymentIntentId: 1 }, { sparse: true })
ServiceOrderSchema.index({ stripeSessionId: 1 }, { sparse: true })

// Update the updatedAt field before saving
ServiceOrderSchema.pre('save', function(next) {
  this.updatedAt = new Date()
  next()
})

export const ServiceOrderModel = mongoose.models.ServiceOrder || mongoose.model<ServiceOrderDocument>('ServiceOrder', ServiceOrderSchema)