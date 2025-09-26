import mongoose, { Schema, Document } from 'mongoose'

export interface SiteSettingsDocument extends Document {
  _id: string
  companyName: string
  tagline?: string
  description?: string
  logo?: {
    url?: string
    alt?: string
  }
  favicon?: string
  primaryColor?: string
  secondaryColor?: string
  customCss?: string
  contact: {
    email: string
    phone?: string
    address?: string
    supportEmail?: string
    salesEmail?: string
  }
  social: {
    facebook?: string
    twitter?: string
    instagram?: string
    youtube?: string
    linkedin?: string
  }
  seo: {
    metaTitle?: string
    metaDescription?: string
    keywords?: string[]
    ogImage?: string
  }
  features: {
    enableRegistration: boolean
    enablePropertyPublishing: boolean
    enableServices: boolean
    enableBlog: boolean
    enableNewsletter: boolean
  }
  legal: {
    companyAddress?: string
    taxId?: string
    businessLicense?: string
    copyrightNotice?: string
  }
  integrations?: {
    googleAnalytics?: string
    facebookPixel?: string
    googleMaps?: string
    intercom?: string
  }
  createdAt: Date
  updatedAt: Date
}

const SiteSettingsSchema = new Schema<SiteSettingsDocument>({
  _id: { type: String, required: true },
  companyName: { type: String, required: true, trim: true },
  tagline: { type: String, trim: true },
  description: { type: String, trim: true },
  logo: {
    url: { type: String, trim: true },
    alt: { type: String, trim: true }
  },
  favicon: { type: String, trim: true },
  primaryColor: { type: String, default: '#ff385c' },
  secondaryColor: { type: String, default: '#ff6b8a' },
  customCss: { type: String },
  contact: {
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    address: { type: String, trim: true },
    supportEmail: { type: String, trim: true, lowercase: true },
    salesEmail: { type: String, trim: true, lowercase: true }
  },
  social: {
    facebook: { type: String, trim: true },
    twitter: { type: String, trim: true },
    instagram: { type: String, trim: true },
    youtube: { type: String, trim: true },
    linkedin: { type: String, trim: true }
  },
  seo: {
    metaTitle: { type: String, trim: true },
    metaDescription: { type: String, trim: true },
    keywords: [{ type: String, trim: true }],
    ogImage: { type: String, trim: true }
  },
  features: {
    enableRegistration: { type: Boolean, default: true },
    enablePropertyPublishing: { type: Boolean, default: true },
    enableServices: { type: Boolean, default: true },
    enableBlog: { type: Boolean, default: false },
    enableNewsletter: { type: Boolean, default: false }
  },
  legal: {
    companyAddress: { type: String, trim: true },
    taxId: { type: String, trim: true },
    businessLicense: { type: String, trim: true },
    copyrightNotice: { type: String, trim: true }
  },
  integrations: {
    googleAnalytics: { type: String, trim: true },
    facebookPixel: { type: String, trim: true },
    googleMaps: { type: String, trim: true },
    intercom: { type: String, trim: true }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

// Ensure only one site settings document exists
SiteSettingsSchema.index({ _id: 1 }, { unique: true })

export const SiteSettingsModel = mongoose.models.SiteSettings || mongoose.model<SiteSettingsDocument>('SiteSettings', SiteSettingsSchema)