'use client'

import DashboardLayout from '@/components/layouts/DashboardLayout'
import {
  Home,
  Building,
  PlusCircle,
  BarChart3,
  Settings,
  Users,
  Wrench,
  FileText,
  Heart
} from 'lucide-react'
import { useAuthContext } from '@/components/providers/AuthProvider'

export default function UserDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAgent } = useAuthContext()

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, href: '/dashboard' },
    { id: 'publish', label: 'Publicar', icon: PlusCircle, href: '/publish' },
    { id: 'properties', label: 'Propiedades', icon: Building, href: '/dashboard/properties' },
    { id: 'favorites', label: 'Favoritos', icon: Heart, href: '/dashboard/favorites' },
    { id: 'services', label: 'Servicios', icon: Wrench, href: '/services' },
    { id: 'my-services', label: 'Servicios Contratados', icon: FileText, href: '/dashboard/services' },
    { id: 'settings', label: 'Configuración', icon: Settings, href: '/dashboard/settings' },
    { id: 'home', label: 'Ir al Inicio', icon: Home, href: '/' },
  ]

  // Add team item for agents
  if (isAgent) {
    const teamItem = { id: 'team', label: 'Equipo', icon: Users, href: '/dashboard/team' }
    sidebarItems.splice(5, 0, teamItem)
  }

  return (
    <DashboardLayout
      sidebarItems={sidebarItems}
      title="Dashboard"
      roleRedirects={{
        provider: '/provider-dashboard'
      }}
    >
      {children}
    </DashboardLayout>
  )
}