'use client'

import { useUser } from '@clerk/nextjs'
import { createContext, useContext, ReactNode, useEffect, useState } from 'react'

export type UserRole = 'user' | 'agent' | 'provider' | 'supplier' | 'superadmin' | 'helpdesk'

interface AuthContextType {
  user: any
  isLoaded: boolean
  userRole: UserRole | null
  isSuperAdmin: boolean
  isAgent: boolean
  isProvider: boolean
  isHelpdesk: boolean
  hasProviderAccess: boolean
  hasHelpdeskAccess: boolean
  displayName: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user, isLoaded } = useUser()
  const [authData, setAuthData] = useState<Omit<AuthContextType, 'user' | 'isLoaded'>>({
    userRole: null,
    isSuperAdmin: false,
    isAgent: false,
    isProvider: false,
    isHelpdesk: false,
    hasProviderAccess: false,
    hasHelpdeskAccess: false,
    displayName: ''
  })

  useEffect(() => {
    if (!user || !isLoaded) {
      setAuthData({
        userRole: null,
        isSuperAdmin: false,
        isAgent: false,
        isProvider: false,
        isHelpdesk: false,
        hasProviderAccess: false,
        hasHelpdeskAccess: false,
        displayName: ''
      })
      return
    }

    const metadata = user.publicMetadata as any
    const privateMetadata = user.privateMetadata as any

    // Determine user role from multiple sources
    const userRole: UserRole =
      metadata?.role ||
      (user as any).privateMetadata?.role ||
      'user'

    // Check if user is superadmin (multiple ways to verify)
    const isSuperAdmin =
      metadata?.isSuperAdmin === true ||
      userRole === 'superadmin' ||
      user.emailAddresses?.some(email =>
        email.emailAddress === 'cristiangp2001@gmail.com'
      ) || false

    // Check if user is agent
    const isAgent =
      userRole === 'agent' ||
      metadata?.isAgency ||
      metadata?.organizationId ||
      false

    // Check if user is provider/supplier
    const isProvider =
      userRole === 'supplier' ||
      userRole === 'provider' ||
      metadata?.providerAccess === true ||
      false

    // Check if user is helpdesk
    const isHelpdesk =
      userRole === 'helpdesk' ||
      metadata?.helpdeskAccess === true ||
      false

    // Provider access (including superadmin override)
    const hasProviderAccess = isSuperAdmin || isProvider

    // Helpdesk access (including superadmin override)
    const hasHelpdeskAccess = isSuperAdmin || isHelpdesk

    // Display name logic
    const displayName =
      user.firstName ||
      user.emailAddresses?.[0]?.emailAddress?.split('@')[0] ||
      'Usuario'

    setAuthData({
      userRole,
      isSuperAdmin,
      isAgent,
      isProvider,
      isHelpdesk,
      hasProviderAccess,
      hasHelpdeskAccess,
      displayName
    })
  }, [user, isLoaded])

  return (
    <AuthContext.Provider value={{
      user,
      isLoaded,
      ...authData
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}

// Helper functions for backward compatibility
export function canAccessProviderDashboard(user: any): boolean {
  if (!user) return false

  const metadata = user.publicMetadata as any
  const userRole = metadata?.role || user.privateMetadata?.role

  // Superadmin can access everything
  const isSuperAdmin =
    metadata?.isSuperAdmin === true ||
    userRole === 'superadmin' ||
    user.emailAddresses?.some((email: any) =>
      email.emailAddress === 'cristiangp2001@gmail.com'
    )

  if (isSuperAdmin) return true

  // Regular provider/supplier access
  return userRole === 'supplier' ||
         userRole === 'provider' ||
         metadata?.providerAccess === true
}

export function getProviderDisplayName(user: any): string {
  return user?.firstName ||
         user?.emailAddresses?.[0]?.emailAddress?.split('@')[0] ||
         'Usuario'
}