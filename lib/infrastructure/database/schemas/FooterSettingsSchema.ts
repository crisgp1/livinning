import mongoose, { Schema, Document } from 'mongoose'

export interface FooterLink {
  id: string
  label: string
  href: string
  order: number
  isEnabled: boolean
  openInNewTab: boolean
}

export interface FooterSection {
  id: string
  title: string
  order: number
  isEnabled: boolean
  links: FooterLink[]
}

export interface FooterSettingsDocument extends Document {
  _id: string
  companyInfo: {
    name: string
    description?: string
    logo?: string
    showLogo: boolean
  }
  sections: FooterSection[]
  contactInfo: {
    showEmail: boolean
    showPhone: boolean
    showAddress: boolean
    email?: string
    phone?: string
    address?: string
  }
  socialMedia: {
    showSocialLinks: boolean
    facebook?: string
    twitter?: string
    instagram?: string
    youtube?: string
    linkedin?: string
    tiktok?: string
  }
  legalLinks: {
    privacyPolicyLabel: string
    privacyPolicyUrl: string
    termsLabel: string
    termsUrl: string
    cookiePolicyLabel?: string
    cookiePolicyUrl?: string
    sitemapLabel?: string
    sitemapUrl?: string
  }
  bottomBar: {
    showCopyright: boolean
    copyrightText?: string
    showLegalLinks: boolean
    showSocialLinks: boolean
  }
  layout: {
    backgroundColor?: string
    textColor?: string
    linkColor?: string
    maxColumns: number
    showDividers: boolean
  }
  newsletter?: {
    isEnabled: boolean
    title?: string
    description?: string
    placeholder?: string
    buttonText?: string
    privacyText?: string
  }
  createdAt: Date
  updatedAt: Date
}

const FooterLinkSchema = new Schema({
  id: { type: String, required: true },
  label: { type: String, required: true, trim: true },
  href: { type: String, required: true, trim: true },
  order: { type: Number, required: true, default: 0 },
  isEnabled: { type: Boolean, default: true },
  openInNewTab: { type: Boolean, default: false }
}, { _id: false })

const FooterSectionSchema = new Schema({
  id: { type: String, required: true },
  title: { type: String, required: true, trim: true },
  order: { type: Number, required: true, default: 0 },
  isEnabled: { type: Boolean, default: true },
  links: [FooterLinkSchema]
}, { _id: false })

const FooterSettingsSchema = new Schema<FooterSettingsDocument>({
  _id: { type: String, required: true },
  companyInfo: {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    logo: { type: String, trim: true },
    showLogo: { type: Boolean, default: true }
  },
  sections: [FooterSectionSchema],
  contactInfo: {
    showEmail: { type: Boolean, default: true },
    showPhone: { type: Boolean, default: true },
    showAddress: { type: Boolean, default: false },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    address: { type: String, trim: true }
  },
  socialMedia: {
    showSocialLinks: { type: Boolean, default: true },
    facebook: { type: String, trim: true },
    twitter: { type: String, trim: true },
    instagram: { type: String, trim: true },
    youtube: { type: String, trim: true },
    linkedin: { type: String, trim: true },
    tiktok: { type: String, trim: true }
  },
  legalLinks: {
    privacyPolicyLabel: { type: String, default: 'Privacidad', trim: true },
    privacyPolicyUrl: { type: String, default: '/privacy', trim: true },
    termsLabel: { type: String, default: 'Términos', trim: true },
    termsUrl: { type: String, default: '/terms', trim: true },
    cookiePolicyLabel: { type: String, default: 'Cookies', trim: true },
    cookiePolicyUrl: { type: String, default: '/cookies', trim: true },
    sitemapLabel: { type: String, default: 'Mapa del Sitio', trim: true },
    sitemapUrl: { type: String, default: '/sitemap', trim: true }
  },
  bottomBar: {
    showCopyright: { type: Boolean, default: true },
    copyrightText: { type: String, trim: true },
    showLegalLinks: { type: Boolean, default: true },
    showSocialLinks: { type: Boolean, default: true }
  },
  layout: {
    backgroundColor: { type: String, default: '#f3f4f6' },
    textColor: { type: String, default: '#374151' },
    linkColor: { type: String, default: '#ff385c' },
    maxColumns: { type: Number, default: 5, min: 2, max: 6 },
    showDividers: { type: Boolean, default: true }
  },
  newsletter: {
    isEnabled: { type: Boolean, default: false },
    title: { type: String, trim: true },
    description: { type: String, trim: true },
    placeholder: { type: String, default: 'Tu email', trim: true },
    buttonText: { type: String, default: 'Suscribirse', trim: true },
    privacyText: { type: String, trim: true }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

// Ensure only one footer settings document exists
FooterSettingsSchema.index({ _id: 1 }, { unique: true })

export const FooterSettingsModel = mongoose.models.FooterSettings || mongoose.model<FooterSettingsDocument>('FooterSettings', FooterSettingsSchema)