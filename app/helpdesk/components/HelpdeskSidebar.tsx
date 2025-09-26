'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  MessageSquare,
  Building2,
  Users,
  Package,
  AlertCircle,
  Settings,
  FileText,
  Shield
} from 'lucide-react'

const menuItems = [
  {
    label: 'Dashboard',
    href: '/helpdesk',
    icon: LayoutDashboard
  },
  {
    label: 'Moderación de Propiedades',
    href: '/helpdesk/moderation',
    icon: Building2
  },
  {
    label: 'Tickets de Soporte',
    href: '/helpdesk/tickets',
    icon: MessageSquare
  },
  {
    label: 'Órdenes de Servicios',
    href: '/helpdesk/orders',
    icon: Package
  },
  {
    label: 'Usuarios',
    href: '/helpdesk/users',
    icon: Users
  },
  {
    label: 'Reportes',
    href: '/helpdesk/reports',
    icon: AlertCircle
  },
  {
    label: 'Logs del Sistema',
    href: '/helpdesk/logs',
    icon: FileText
  },
  {
    label: 'Configuración',
    href: '/helpdesk/settings',
    icon: Settings
  }
]

export default function HelpdeskSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-white shadow-md h-screen sticky top-0 pt-20">
      <div className="p-6">
        <div className="flex items-center space-x-2 mb-8">
          <Shield className="h-8 w-8 text-primary" />
          <h2 className="text-xl font-bold text-gray-900">Helpdesk</h2>
        </div>

        <nav className="space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== '/helpdesk' && pathname.startsWith(item.href))

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200
                  ${isActive
                    ? 'bg-primary text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                  }
                `}
              >
                <item.icon size={20} />
                <span className="font-medium">{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}