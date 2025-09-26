'use client'

import DashboardLayout from '@/components/layouts/DashboardLayout'
import {
  Home,
  BarChart3,
  Package,
  Users,
  Settings,
  TrendingUp,
  History,
  Store,
  FileText,
  PlusCircle
} from 'lucide-react'

export default function ProviderDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, href: '/provider-dashboard' },
    { id: 'orders', label: 'Órdenes', icon: Package, href: '/provider-dashboard/orders' },
    { id: 'assigned', label: 'Asignadas', icon: FileText, href: '/provider-dashboard/assigned' },
    { id: 'completed', label: 'Completadas', icon: History, href: '/provider-dashboard/completed' },
    { id: 'clients', label: 'Clientes', icon: Users, href: '/provider-dashboard/clients' },
    { id: 'earnings', label: 'Ingresos', icon: TrendingUp, href: '/provider-dashboard/earnings' },
    { id: 'vendor-services', label: 'Mis Servicios', icon: Store, href: '/provider-dashboard/vendor-services' },
    { id: 'historial', label: 'Historial', icon: History, href: '/provider-dashboard/historial' },
    { id: 'settings', label: 'Configuración', icon: Settings, href: '/provider-dashboard/settings' },
    { id: 'home', label: 'Ir al Inicio', icon: Home, href: '/' },
  ]

  return (
    <DashboardLayout
      sidebarItems={sidebarItems}
      title="Provider Dashboard"
      requiresAuth={true}
      onboardingCheck={false}
    >
      {children}
    </DashboardLayout>
  )
}