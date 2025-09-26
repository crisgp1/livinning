import mongoose, { Schema, Document } from 'mongoose'

export interface NavigationItem {
  id: string
  label: string
  href: string
  icon?: string // Lucide icon name
  order: number
  isEnabled: boolean
  visibility: {
    public: boolean
    authenticated: boolean
    roles: string[] // specific roles that can see this item
  }
  subItems?: NavigationSubItem[]
}

export interface NavigationSubItem {
  id: string
  label: string
  href: string
  icon?: string
  order: number
  isEnabled: boolean
}

export interface NavigationSettingsDocument extends Document {
  _id: string
  primaryNavigation: NavigationItem[]
  authNavigation: {
    signInLabel: string
    signUpLabel: string
    signOutLabel: string
    profileLabel: string
  }
  dashboardNavigation: {
    userDashboardLabel: string
    adminDashboardLabel: string
    helpdeskLabel: string
    providerLabel: string
  }
  mobileMenuSettings: {
    showUserInfo: boolean
    showNotifications: boolean
    collapseSubmenus: boolean
  }
  breadcrumbSettings: {
    showBreadcrumbs: boolean
    homeLabel: string
    separator: string
  }
  publishButton?: {
    label: string
    isEnabled: boolean
    visibility: {
      public: boolean
      authenticated: boolean
      roles: string[]
    }
  }
  createdAt: Date
  updatedAt: Date
}

const NavigationSubItemSchema = new Schema({
  id: { type: String, required: true },
  label: { type: String, required: true, trim: true },
  href: { type: String, required: true, trim: true },
  icon: { type: String, trim: true },
  order: { type: Number, required: true, default: 0 },
  isEnabled: { type: Boolean, default: true }
}, { _id: false })

const NavigationItemSchema = new Schema({
  id: { type: String, required: true },
  label: { type: String, required: true, trim: true },
  href: { type: String, required: true, trim: true },
  icon: { type: String, trim: true },
  order: { type: Number, required: true, default: 0 },
  isEnabled: { type: Boolean, default: true },
  visibility: {
    public: { type: Boolean, default: true },
    authenticated: { type: Boolean, default: true },
    roles: [{ type: String, trim: true }]
  },
  subItems: [NavigationSubItemSchema]
}, { _id: false })

const NavigationSettingsSchema = new Schema<NavigationSettingsDocument>({
  _id: { type: String, required: true },
  primaryNavigation: [NavigationItemSchema],
  authNavigation: {
    signInLabel: { type: String, default: 'Iniciar Sesión', trim: true },
    signUpLabel: { type: String, default: 'Registrarse', trim: true },
    signOutLabel: { type: String, default: 'Cerrar Sesión', trim: true },
    profileLabel: { type: String, default: 'Perfil', trim: true }
  },
  dashboardNavigation: {
    userDashboardLabel: { type: String, default: 'Dashboard', trim: true },
    adminDashboardLabel: { type: String, default: 'Admin', trim: true },
    helpdeskLabel: { type: String, default: 'Helpdesk', trim: true },
    providerLabel: { type: String, default: 'Proveedor', trim: true }
  },
  mobileMenuSettings: {
    showUserInfo: { type: Boolean, default: true },
    showNotifications: { type: Boolean, default: true },
    collapseSubmenus: { type: Boolean, default: true }
  },
  breadcrumbSettings: {
    showBreadcrumbs: { type: Boolean, default: true },
    homeLabel: { type: String, default: 'Inicio', trim: true },
    separator: { type: String, default: '/', trim: true }
  },
  publishButton: {
    label: { type: String, default: 'Publicar Propiedad', trim: true },
    isEnabled: { type: Boolean, default: true },
    visibility: {
      public: { type: Boolean, default: false },
      authenticated: { type: Boolean, default: true },
      roles: [{ type: String, trim: true }]
    }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

// Ensure only one navigation settings document exists
NavigationSettingsSchema.index({ _id: 1 }, { unique: true })

export const NavigationSettingsModel = mongoose.models.NavigationSettings || mongoose.model<NavigationSettingsDocument>('NavigationSettings', NavigationSettingsSchema)