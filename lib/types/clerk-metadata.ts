import { ServiceType } from '@/lib/domain/entities/ServiceOrder'

// Metadatos públicos que se almacenan en Clerk
export interface ClerkPublicMetadata {
  role: 'user' | 'agent' | 'agency' | 'provider' | 'supplier' | 'superadmin'
  isVerified: boolean
  isAgency: boolean
  isSuperAdmin: boolean
  
  // Provider specific metadata
  isProvider?: boolean
  providerAccess?: boolean
  providerId?: string // Reference to Provider entity in our DB
  providerStatus?: 'available' | 'busy' | 'offline' | 'suspended'
  
  // Quick access provider info (denormalized for performance)
  providerServices?: ServiceType[]
  providerTier?: 'basic' | 'premium' | 'elite'
  providerRating?: number
  providerLocation?: {
    city: string
    state: string
    country: string
    lat: number
    lng: number
  }
  
  // Organization/Agency metadata
  organizationId?: string
  organizationRole?: 'owner' | 'admin' | 'member'
}

// Metadatos privados que se almacenan en Clerk
export interface ClerkPrivateMetadata {
  // Provider private information
  providerVerificationStatus?: 'pending' | 'verified' | 'rejected'
  providerDocuments?: string[] // URLs to verification documents
  providerBankInfo?: {
    accountHolderName: string
    bankName: string
    accountNumber: string // encrypted
    routingNumber: string
  }
  
  // User preferences
  notificationSettings?: {
    emailNotifications: boolean
    smsNotifications: boolean
    pushNotifications: boolean
    serviceUpdates: boolean
    marketingEmails: boolean
  }
  
  // Internal tracking
  lastLoginAt?: string
  loginCount?: number
  failedLoginAttempts?: number
  accountFlags?: string[]
}

// Helper functions for working with Clerk metadata
export class ClerkMetadataHelper {
  static isProvider(publicMetadata: any): boolean {
    return publicMetadata?.isProvider === true || 
           publicMetadata?.role === 'provider' || 
           publicMetadata?.providerAccess === true
  }

  static canProvideService(publicMetadata: any, serviceType: ServiceType): boolean {
    return this.isProvider(publicMetadata) && 
           publicMetadata?.providerServices?.includes(serviceType) === true &&
           publicMetadata?.providerStatus === 'available'
  }

  static getProviderServices(publicMetadata: any): ServiceType[] {
    return publicMetadata?.providerServices || []
  }

  static isProviderAvailable(publicMetadata: any): boolean {
    return this.isProvider(publicMetadata) && 
           publicMetadata?.providerStatus === 'available'
  }

  static getProviderLocation(publicMetadata: any): { city: string; state: string; country: string; lat: number; lng: number } | null {
    return publicMetadata?.providerLocation || null
  }

  static createProviderMetadata(
    services: ServiceType[],
    tier: 'basic' | 'premium' | 'elite' = 'basic',
    location: { city: string; state: string; country: string; lat: number; lng: number }
  ): Partial<ClerkPublicMetadata> {
    return {
      isProvider: true,
      providerAccess: true,
      providerStatus: 'available',
      providerServices: services,
      providerTier: tier,
      providerRating: 0,
      providerLocation: location,
      role: 'provider'
    }
  }

  static updateProviderStatus(
    currentMetadata: any, 
    status: 'available' | 'busy' | 'offline' | 'suspended'
  ): Partial<ClerkPublicMetadata> {
    return {
      ...currentMetadata,
      providerStatus: status
    }
  }

  static updateProviderServices(
    currentMetadata: any, 
    services: ServiceType[]
  ): Partial<ClerkPublicMetadata> {
    return {
      ...currentMetadata,
      providerServices: services
    }
  }

  static updateProviderRating(
    currentMetadata: any, 
    newRating: number
  ): Partial<ClerkPublicMetadata> {
    return {
      ...currentMetadata,
      providerRating: newRating
    }
  }
}

// Type guards for runtime type checking
export const isClerkPublicMetadata = (obj: any): obj is ClerkPublicMetadata => {
  return typeof obj === 'object' && obj !== null && 'role' in obj
}

export const isClerkPrivateMetadata = (obj: any): obj is ClerkPrivateMetadata => {
  return typeof obj === 'object' && obj !== null
}