'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Menu } from 'lucide-react'
import { LucideIcon } from 'lucide-react'
import Navigation from '@/components/Navigation'
import UnifiedSidebar from '@/components/ui/UnifiedSidebar'
import GlassmorphismBg from '@/components/ui/GlassmorphismBg'
import { useAuthContext, UserRole } from '@/components/providers/AuthProvider'

interface SidebarItem {
  id: string
  label: string
  icon: LucideIcon
  href: string
  roles?: UserRole[]
  requiresAccess?: 'provider' | 'helpdesk' | 'superadmin'
}

interface DashboardLayoutProps {
  children: React.ReactNode
  sidebarItems: SidebarItem[]
  title?: string
  requiresAuth?: boolean
  redirectTo?: string
  onboardingCheck?: boolean
  roleRedirects?: {
    provider?: string
    helpdesk?: string
    superadmin?: string
  }
  requiredRole?: UserRole
  allowSuperadminOverride?: boolean
}

export default function DashboardLayout({
  children,
  sidebarItems,
  title = "Dashboard",
  requiresAuth = true,
  redirectTo = '/sign-in',
  onboardingCheck = true,
  roleRedirects,
  requiredRole,
  allowSuperadminOverride = true
}: DashboardLayoutProps) {
  const { user, isLoaded, isSuperAdmin, isProvider, isHelpdesk, userRole } = useAuthContext()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (!requiresAuth) return

    if (isLoaded && !user) {
      router.push(redirectTo)
      return
    }

    if (isLoaded && user && onboardingCheck) {
      const metadata = user.publicMetadata as any
      const hasOrganization = metadata?.organizationId || metadata?.isAgency

      if (!metadata?.onboardingCompleted && !hasOrganization) {
        router.push('/onboarding')
        return
      }
    }

    // Handle role access validation
    if (isLoaded && user && requiredRole) {
      const hasRequiredRole = userRole === requiredRole
      const canOverride = allowSuperadminOverride && isSuperAdmin

      if (!hasRequiredRole && !canOverride) {
        router.push('/dashboard')
        return
      }
    }

    // Handle role-based redirects (only if not superadmin and no required role set)
    if (isLoaded && user && roleRedirects && !isSuperAdmin && !requiredRole) {
      if (isProvider && roleRedirects.provider) {
        router.push(roleRedirects.provider)
        return
      }

      if (userRole === 'helpdesk' && roleRedirects.helpdesk) {
        router.push(roleRedirects.helpdesk)
        return
      }
    }
  }, [user, isLoaded, router, requiresAuth, redirectTo, onboardingCheck, roleRedirects, requiredRole, allowSuperadminOverride, isSuperAdmin, isProvider, isHelpdesk, userRole])

  if (requiresAuth && (!isLoaded || !user)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-primary rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      <div className="pt-20 flex relative">
        <GlassmorphismBg />

        <UnifiedSidebar
          items={sidebarItems}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main Content */}
        <div className="flex-1 lg:ml-72 relative z-10">
          {/* Mobile Header */}
          <div className="lg:hidden flex items-center justify-between py-3 px-4 sm:px-6 border-b border-gray-100">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-1.5 rounded-lg glass-icon-container"
            >
              <Menu size={18} className="text-gray-700" />
            </button>
            <h1 className="text-lg font-medium text-gray-900">
              {title}
            </h1>
            <div className="w-8"></div>
          </div>

          {/* Children Content */}
          {children}
        </div>
      </div>
    </div>
  )
}