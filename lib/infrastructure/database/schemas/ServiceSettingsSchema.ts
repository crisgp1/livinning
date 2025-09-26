import mongoose, { Schema, Document } from 'mongoose'

export interface ServiceFeature {
  id: string
  title: string
  description?: string
  isIncluded: boolean
  order: number
}

export interface ServiceTier {
  id: string
  name: string
  description: string
  price: {
    amount: number
    currency: string
    period?: string // e.g., 'month', 'year', 'one-time'
    isVisible: boolean
  }
  features: ServiceFeature[]
  icon?: string // Lucide icon name
  color?: string
  isPopular: boolean
  isEnabled: boolean
  order: number
  callToAction: {
    text: string
    href?: string
    action?: string // e.g., 'modal', 'redirect', 'contact'
  }
}

export interface ServiceCategory {
  id: string
  title: string
  description: string
  icon?: string // Lucide icon name
  isEnabled: boolean
  order: number
  tiers: ServiceTier[]
  features: string[] // General features for this category
}

export interface ContractingService {
  id: string
  name: string
  description?: string
  estimatedTime: string
  isAvailable: boolean
  price?: {
    amount: number
    currency: string
    isVisible: boolean
  }
  category: string
  icon?: string
  order: number
}

export interface ServiceSettingsDocument extends Document {
  _id: string
  pageSettings: {
    title: string
    subtitle?: string
    description?: string
    heroImage?: string
  }
  categories: ServiceCategory[]
  contractingServices: ContractingService[]
  pricingDisplay: {
    showPrices: boolean
    currency: string
    priceFormat: 'before' | 'after' // currency position
    showPeriod: boolean
    showDiscount: boolean
  }
  contactSettings: {
    showContactForm: boolean
    showConsultationBooking: boolean
    consultationLabel: string
    contactButtonText: string
    expertConsultationText: string
  }
  trackingSettings: {
    enableRealTimeTracking: boolean
    showProjectStats: boolean
    stats: {
      monitoringLabel: string
      completionRateLabel: string
      avgRatingLabel: string
      monitoringValue: string
      completionRateValue: string
      avgRatingValue: string
    }
  }
  accountTypes: {
    owner: {
      name: string
      description: string
      features: string[]
      buttonText: string
      isEnabled: boolean
    }
    realEstate: {
      name: string
      description: string
      features: string[]
      buttonText: string
      isEnabled: boolean
    }
    provider: {
      name: string
      description: string
      features: string[]
      buttonText: string
      isEnabled: boolean
    }
    premium: {
      name: string
      description: string
      features: string[]
      buttonText: string
      isEnabled: boolean
      badge?: string
    }
  }
  createdAt: Date
  updatedAt: Date
}

const ServiceFeatureSchema = new Schema({
  id: { type: String, required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  isIncluded: { type: Boolean, default: true },
  order: { type: Number, default: 0 }
}, { _id: false })

const ServiceTierSchema = new Schema({
  id: { type: String, required: true },
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  price: {
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'MXN', trim: true },
    period: { type: String, trim: true },
    isVisible: { type: Boolean, default: true }
  },
  features: [ServiceFeatureSchema],
  icon: { type: String, trim: true },
  color: { type: String, default: '#ff385c', trim: true },
  isPopular: { type: Boolean, default: false },
  isEnabled: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
  callToAction: {
    text: { type: String, required: true, trim: true },
    href: { type: String, trim: true },
    action: { type: String, trim: true, enum: ['modal', 'redirect', 'contact'] }
  }
}, { _id: false })

const ServiceCategorySchema = new Schema({
  id: { type: String, required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  icon: { type: String, trim: true },
  isEnabled: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
  tiers: [ServiceTierSchema],
  features: [{ type: String, trim: true }]
}, { _id: false })

const ContractingServiceSchema = new Schema({
  id: { type: String, required: true },
  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  estimatedTime: { type: String, required: true, trim: true },
  isAvailable: { type: Boolean, default: true },
  price: {
    amount: { type: Number, min: 0 },
    currency: { type: String, default: 'MXN', trim: true },
    isVisible: { type: Boolean, default: true }
  },
  category: { type: String, required: true, trim: true },
  icon: { type: String, trim: true },
  order: { type: Number, default: 0 }
}, { _id: false })

const ServiceSettingsSchema = new Schema<ServiceSettingsDocument>({
  _id: { type: String, required: true },
  pageSettings: {
    title: { type: String, required: true, trim: true },
    subtitle: { type: String, trim: true },
    description: { type: String, trim: true },
    heroImage: { type: String, trim: true }
  },
  categories: [ServiceCategorySchema],
  contractingServices: [ContractingServiceSchema],
  pricingDisplay: {
    showPrices: { type: Boolean, default: true },
    currency: { type: String, default: 'MXN', trim: true },
    priceFormat: { type: String, enum: ['before', 'after'], default: 'before' },
    showPeriod: { type: Boolean, default: true },
    showDiscount: { type: Boolean, default: false }
  },
  contactSettings: {
    showContactForm: { type: Boolean, default: true },
    showConsultationBooking: { type: Boolean, default: true },
    consultationLabel: { type: String, default: 'Hablar con un Experto', trim: true },
    contactButtonText: { type: String, default: 'Contactarnos', trim: true },
    expertConsultationText: { type: String, default: '¿No estás seguro qué tipo de cuenta necesitas?', trim: true }
  },
  trackingSettings: {
    enableRealTimeTracking: { type: Boolean, default: true },
    showProjectStats: { type: Boolean, default: true },
    stats: {
      monitoringLabel: { type: String, default: 'Monitoreo de Proyectos', trim: true },
      completionRateLabel: { type: String, default: 'Finalización a Tiempo', trim: true },
      avgRatingLabel: { type: String, default: 'Calificación Promedio', trim: true },
      monitoringValue: { type: String, default: '24/7', trim: true },
      completionRateValue: { type: String, default: '95%', trim: true },
      avgRatingValue: { type: String, default: '4.9★', trim: true }
    }
  },
  accountTypes: {
    owner: {
      name: { type: String, default: 'Propietario', trim: true },
      description: { type: String, default: 'Para personas que buscan vender o rentar sus propiedades', trim: true },
      features: [{ type: String, trim: true }],
      buttonText: { type: String, default: 'Crear Cuenta Propietario', trim: true },
      isEnabled: { type: Boolean, default: true }
    },
    realEstate: {
      name: { type: String, default: 'Inmobiliaria', trim: true },
      description: { type: String, default: 'Para agencias y corredores inmobiliarios profesionales', trim: true },
      features: [{ type: String, trim: true }],
      buttonText: { type: String, default: 'Crear Cuenta Inmobiliaria', trim: true },
      isEnabled: { type: Boolean, default: true }
    },
    provider: {
      name: { type: String, default: 'Proveedor de Servicios', trim: true },
      description: { type: String, default: 'Para profesionales que ofrecen servicios inmobiliarios', trim: true },
      features: [{ type: String, trim: true }],
      buttonText: { type: String, default: 'Crear Cuenta Proveedor', trim: true },
      isEnabled: { type: Boolean, default: true }
    },
    premium: {
      name: { type: String, default: 'Agencia Premium', trim: true },
      description: { type: String, default: 'Para agencias de alto volumen con necesidades avanzadas', trim: true },
      features: [{ type: String, trim: true }],
      buttonText: { type: String, default: 'Crear Cuenta Premium', trim: true },
      isEnabled: { type: Boolean, default: true },
      badge: { type: String, default: 'Premium', trim: true }
    }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

// Ensure only one service settings document exists
ServiceSettingsSchema.index({ _id: 1 }, { unique: true })

export const ServiceSettingsModel = mongoose.models.ServiceSettings || mongoose.model<ServiceSettingsDocument>('ServiceSettings', ServiceSettingsSchema)