'use client'

import { useRouter, usePathname } from 'next/navigation'
import { LucideIcon } from 'lucide-react'
import { useAuthContext } from '@/components/providers/AuthProvider'

interface SidebarItem {
  id: string
  label: string
  icon: LucideIcon
  href: string
  roles?: ('user' | 'agent' | 'provider' | 'supplier' | 'superadmin' | 'helpdesk')[]
  requiresAccess?: 'provider' | 'helpdesk' | 'superadmin'
}

interface UnifiedSidebarProps {
  items: SidebarItem[]
  isOpen: boolean
  onClose: () => void
  userProfileSection?: React.ReactNode
  className?: string
}

export default function UnifiedSidebar({
  items,
  isOpen,
  onClose,
  userProfileSection,
  className = ""
}: UnifiedSidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, userRole, isSuperAdmin, hasProviderAccess, hasHelpdeskAccess } = useAuthContext()

  const filteredItems = items.filter(item => {
    // If no roles specified, show to all
    if (!item.roles && !item.requiresAccess) return true

    // Check role-based access
    if (item.roles && userRole && !item.roles.includes(userRole)) {
      // Superadmin can access everything unless explicitly restricted
      if (!isSuperAdmin) return false
    }

    // Check specific access requirements
    if (item.requiresAccess) {
      switch (item.requiresAccess) {
        case 'provider':
          return hasProviderAccess
        case 'helpdesk':
          return hasHelpdeskAccess
        case 'superadmin':
          return isSuperAdmin
        default:
          return true
      }
    }

    return true
  })

  const handleItemClick = (href: string) => {
    router.push(href)
    onClose()
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-white bg-opacity-50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed left-0 top-20 h-[calc(100vh-5rem)] w-64 z-50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } ${className}`}>
        <div className="m-4 p-6 h-full overflow-y-auto glass-sidebar rounded-2xl">
          {/* User Profile Section */}
          {userProfileSection || (
            <div className="border-b border-gray-100 pb-6 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-white shadow-lg">
                  {user?.imageUrl ? (
                    <img src={user.imageUrl} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary to-blue-600">
                      <span className="text-white font-medium text-lg">
                        {user?.firstName?.[0] || 'U'}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate text-gray-900">
                    {user?.firstName || 'Usuario'}
                  </p>
                  <p className="text-xs truncate text-gray-500">
                    {user?.emailAddresses?.[0]?.emailAddress}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="space-y-2">
            {filteredItems.map((item) => {
              const isActive = pathname === item.href ||
                             (item.id === 'dashboard' && pathname === '/dashboard')

              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item.href)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                    isActive
                      ? 'bg-primary text-white shadow-lg shadow-primary/20'
                      : 'text-gray-600 hover:bg-white/50 hover:text-gray-900'
                  }`}
                >
                  <div className={`p-2 rounded-lg transition-colors ${
                    isActive ? 'bg-white/20' : 'bg-gray-50'
                  }`}>
                    <item.icon size={18} className={isActive ? 'text-white' : ''} />
                  </div>
                  <span className="font-medium text-sm leading-tight">{item.label}</span>
                </button>
              )
            })}
          </nav>
        </div>
      </div>
    </>
  )
}