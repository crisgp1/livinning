import { UserResource } from '@clerk/types'

export interface ProviderAccess {
  isProvider: boolean
  hasProviderAccess: boolean
  providerType?: string
  permissions?: string[]
}

export function checkProviderAccess(user: UserResource | null | undefined): ProviderAccess {
  if (!user) {
    return {
      isProvider: false,
      hasProviderAccess: false
    }
  }

  const userRole = user.publicMetadata?.role as string
  const providerAccess = user.publicMetadata?.providerAccess as boolean
  const providerType = user.publicMetadata?.providerType as string
  const permissions = user.publicMetadata?.permissions as string[]

  // Check if user is explicitly marked as provider
  const isProvider = userRole === 'provider' || providerAccess === true

  return {
    isProvider,
    hasProviderAccess: isProvider,
    providerType,
    permissions
  }
}

export function getProviderServiceTypes(user: UserResource | null | undefined): string[] {
  if (!user) return []

  const providerType = user.publicMetadata?.providerType as string
  const serviceTypes = user.publicMetadata?.serviceTypes as string[]

  if (serviceTypes?.length) {
    return serviceTypes
  }

  // Default service types based on provider type
  switch (providerType) {
    case 'photographer':
      return ['photography', 'virtual-tour']
    case 'lawyer':
      return ['legal', 'documentation']
    case 'home-staging':
      return ['home-staging']
    case 'market-analyst':
      return ['market-analysis']
    default:
      return []
  }
}

export function canAccessProviderDashboard(user: UserResource | null | undefined): boolean {
  const access = checkProviderAccess(user)
  return access.hasProviderAccess
}

export function getProviderDisplayName(user: UserResource | null | undefined): string {
  if (!user) return 'Proveedor'

  const firstName = user.firstName
  const lastName = user.lastName
  const email = user.emailAddresses?.[0]?.emailAddress

  if (firstName && lastName) {
    return `${firstName} ${lastName}`
  }

  if (firstName) {
    return firstName
  }

  return email || 'Proveedor'
}