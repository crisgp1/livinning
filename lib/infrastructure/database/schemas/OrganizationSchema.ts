import mongoose, { Schema, Document } from 'mongoose'
import { OrganizationStatus, OrganizationPlan } from '../../../domain/entities/Organization'

export interface OrganizationDocument extends Document {
  _id: string
  name: string
  slug: string
  description: string
  ownerId: string
  status: OrganizationStatus
  plan: OrganizationPlan
  settings: {
    allowPublicProperties: boolean
    requireApproval: boolean
    customDomain?: string
    branding?: {
      logoUrl?: string
      primaryColor?: string
      secondaryColor?: string
      customCss?: string
    }
    notifications?: {
      emailNotifications: boolean
      newPropertyNotifications: boolean
      inquiryNotifications: boolean
    }
  }
  createdAt: Date
  updatedAt: Date
}

const OrganizationSchema = new Schema<OrganizationDocument>({
  _id: { type: String, required: true },
  name: { type: String, required: true, trim: true },
  slug: { 
    type: String, 
    required: true, 
    unique: true, 
    trim: true,
    lowercase: true,
    match: /^[a-z0-9]+(?:-[a-z0-9]+)*$/
  },
  description: { type: String, required: true, trim: true },
  ownerId: { type: String, required: true, index: true },
  status: { 
    type: String, 
    enum: Object.values(OrganizationStatus), 
    default: OrganizationStatus.ACTIVE 
  },
  plan: { 
    type: String, 
    enum: Object.values(OrganizationPlan), 
    default: OrganizationPlan.FREE 
  },
  settings: {
    allowPublicProperties: { type: Boolean, default: true },
    requireApproval: { type: Boolean, default: false },
    customDomain: { type: String },
    branding: {
      logoUrl: { type: String },
      primaryColor: { type: String },
      secondaryColor: { type: String },
      customCss: { type: String }
    },
    notifications: {
      emailNotifications: { type: Boolean, default: true },
      newPropertyNotifications: { type: Boolean, default: true },
      inquiryNotifications: { type: Boolean, default: true }
    }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

// Indexes for better query performance
OrganizationSchema.index({ slug: 1 })
OrganizationSchema.index({ ownerId: 1 })
OrganizationSchema.index({ status: 1 })
OrganizationSchema.index({ createdAt: -1 })

export const OrganizationModel = mongoose.models.Organization || mongoose.model<OrganizationDocument>('Organization', OrganizationSchema)