'use client'

import DashboardLayout from '@/components/layouts/DashboardLayout'
import {
  Building,
  PlusCircle,
  BarChart3,
  Settings,
  Star,
  Globe,
  TrendingUp,
  Eye,
  Home,
  Wrench,
  FileText
} from 'lucide-react'
import { useAuthContext } from '@/components/providers/AuthProvider'

export default function PropertyManagementLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAgent } = useAuthContext()

  const sidebarItems = [
    {
      id: 'property-management',
      label: 'Panel de Anunciante',
      icon: Building,
      href: '/dashboard/property-management'
    },
    {
      id: 'publish',
      label: 'Publicar',
      icon: PlusCircle,
      href: '/publish'
    },
    {
      id: 'featured',
      label: 'Destacados',
      icon: Star,
      href: '/dashboard/property-management/featured'
    },
    {
      id: 'microsites',
      label: 'Micrositios',
      icon: Globe,
      href: '/dashboard/property-management/microsites'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      href: '/dashboard/property-management/analytics'
    },
    {
      id: 'services',
      label: 'Servicios',
      icon: Wrench,
      href: '/services'
    },
    {
      id: 'my-services',
      label: 'Servicios Contratados',
      icon: FileText,
      href: '/dashboard/services'
    },
    {
      id: 'settings',
      label: 'Configuración',
      icon: Settings,
      href: '/dashboard/settings'
    },
    {
      id: 'home',
      label: 'Ir al Inicio',
      icon: Home,
      href: '/'
    }
  ]

  return (
    <DashboardLayout
      sidebarItems={sidebarItems}
      title="Gestión de Propiedades"
      requiredRole="agent"
      allowSuperadminOverride={true}
    >
      {children}
    </DashboardLayout>
  )
}