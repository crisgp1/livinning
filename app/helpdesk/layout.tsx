'use client'

import DashboardLayout from '@/components/layouts/DashboardLayout'
import {
  Home,
  Headphones,
  Users,
  Package,
  FileText,
  BarChart3,
  Settings,
  Shield,
  Activity,
  MessageSquare
} from 'lucide-react'

export default function HelpdeskLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, href: '/helpdesk', requiresAccess: 'helpdesk' as const },
    { id: 'tickets', label: 'Tickets', icon: MessageSquare, href: '/helpdesk/tickets', requiresAccess: 'helpdesk' as const },
    { id: 'users', label: 'Usuarios', icon: Users, href: '/helpdesk/users', requiresAccess: 'helpdesk' as const },
    { id: 'orders', label: 'Órdenes', icon: Package, href: '/helpdesk/orders', requiresAccess: 'helpdesk' as const },
    { id: 'moderation', label: 'Moderación', icon: Shield, href: '/helpdesk/moderation', requiresAccess: 'helpdesk' as const },
    { id: 'reports', label: 'Reportes', icon: FileText, href: '/helpdesk/reports', requiresAccess: 'helpdesk' as const },
    { id: 'logs', label: 'Logs', icon: Activity, href: '/helpdesk/logs', requiresAccess: 'helpdesk' as const },
    { id: 'settings', label: 'Configuración', icon: Settings, href: '/helpdesk/settings', requiresAccess: 'helpdesk' as const },
    { id: 'home', label: 'Ir al Inicio', icon: Home, href: '/' },
  ]

  return (
    <DashboardLayout
      sidebarItems={sidebarItems}
      title="Helpdesk"
      requiresAuth={true}
      onboardingCheck={false}
      requiredRole="helpdesk"
      allowSuperadminOverride={true}
    >
      {children}
    </DashboardLayout>
  )
}