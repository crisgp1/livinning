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
    maxProperties?: number
    allowBranding?: boolean
    allowAnalytics?: boolean
    allowAPI?: boolean
    allowMultiUser?: boolean
  }
  credits: {
    properties: {
      total: number
      used: number
      remaining: number
    }
    premiumFeatures: {
      virtualTours: number
      professionalPhotos: number
      marketAnalysis: number
      featuredListings: number
    }
    serviceCredits: {
      photography: number
      legal: number
      virtualTour: number
      homeStaging: number
      marketAnalysis: number
      documentation: number
    }
  }
  metadata?: {
    isPaymentUpgrade?: boolean
    upgradedAt?: Date
    userEmail?: string
    planFeatures?: any
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
  ownerId: { type: String, required: true },
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
      type: {
        logoUrl: { type: String, default: '' },
        primaryColor: { type: String, default: '#ff385c' },
        secondaryColor: { type: String, default: '#ff6b8a' },
        customCss: { type: String, default: '' }
      },
      default: {}
    },
    notifications: {
      type: {
        emailNotifications: { type: Boolean, default: true },
        newPropertyNotifications: { type: Boolean, default: true },
        inquiryNotifications: { type: Boolean, default: true }
      },
      default: {}
    },
    // Extended settings for paid plans
    maxProperties: { type: Number, default: 5 },
    allowBranding: { type: Boolean, default: false },
    allowAnalytics: { type: Boolean, default: false },
    allowAPI: { type: Boolean, default: false },
    allowMultiUser: { type: Boolean, default: false }
  },
  credits: {
    properties: {
      total: { type: Number, default: 5 },
      used: { type: Number, default: 0 },
      remaining: { type: Number, default: 5 }
    },
    premiumFeatures: {
      virtualTours: { type: Number, default: 0 },
      professionalPhotos: { type: Number, default: 0 },
      marketAnalysis: { type: Number, default: 0 },
      featuredListings: { type: Number, default: 0 }
    },
    serviceCredits: {
      photography: { type: Number, default: 0 },
      legal: { type: Number, default: 0 },
      virtualTour: { type: Number, default: 0 },
      homeStaging: { type: Number, default: 0 },
      marketAnalysis: { type: Number, default: 0 },
      documentation: { type: Number, default: 0 }
    }
  },
  metadata: {
    isPaymentUpgrade: { type: Boolean, default: false },
    upgradedAt: { type: Date },
    userEmail: { type: String },
    planFeatures: { type: Schema.Types.Mixed }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

// Indexes for better query performance
// Note: slug index is automatically created by unique: true constraint
OrganizationSchema.index({ ownerId: 1 })
OrganizationSchema.index({ status: 1 })
OrganizationSchema.index({ createdAt: -1 })

export const OrganizationModel = mongoose.models.Organization || mongoose.model<OrganizationDocument>('Organization', OrganizationSchema)