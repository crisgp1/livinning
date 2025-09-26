'use client'

import DashboardLayout from '@/components/layouts/DashboardLayout'
import {
  Home,
  Users,
  Building2,
  Settings,
  Shield,
  Package,
  Headphones,
  LayoutDashboard,
  UserCheck,
  Compass
} from 'lucide-react'

export default function SuperadminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/superadmin', requiresAccess: 'superadmin' as const },
    { id: 'users', label: 'Usuarios', icon: Users, href: '/superadmin/users', requiresAccess: 'superadmin' as const },
    { id: 'services', label: 'Servicios', icon: Package, href: '/superadmin/services', requiresAccess: 'superadmin' as const },
    { id: 'helpdesk-supervision', label: 'Supervisión Helpdesk', icon: Shield, href: '/superadmin/helpdesk', requiresAccess: 'superadmin' as const },
    { id: 'settings', label: 'Configuración', icon: Settings, href: '/superadmin/settings', requiresAccess: 'superadmin' as const },
    { id: 'dashboard-user', label: 'Dashboard Usuario', icon: UserCheck, href: '/dashboard' },
    { id: 'provider-dashboard', label: 'Dashboard Proveedor', icon: Building2, href: '/provider-dashboard' },
    { id: 'helpdesk-panel', label: 'Trabajar como Helpdesk', icon: Headphones, href: '/helpdesk' },
    { id: 'home', label: 'Ir al Inicio', icon: Home, href: '/' },
  ]

  return (
    <DashboardLayout
      sidebarItems={sidebarItems}
      title="Superadmin"
      requiresAuth={true}
      onboardingCheck={false}
      requiredRole="superadmin"
      allowSuperadminOverride={false}
    >
      {children}
    </DashboardLayout>
  )
}