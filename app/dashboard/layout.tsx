'use client'

import { useUser } from '@clerk/nextjs'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import Navigation from '@/components/Navigation'
import { 
  Home, 
  Building, 
  PlusCircle, 
  BarChart3, 
  Settings, 
  Users, 
  Menu, 
  X,
  Wrench,
  FileText,
  Heart
} from 'lucide-react'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isAgent, setIsAgent] = useState(false)

  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/sign-in')
    } else if (isLoaded && user) {
      const metadata = user.publicMetadata as any
      const hasOrganization = metadata?.organizationId || metadata?.isAgency
      
      if (!metadata?.onboardingCompleted && !hasOrganization) {
        router.push('/onboarding')
      }
    }
  }, [user, isLoaded, router])

  useEffect(() => {
    if (user) {
      const metadata = user.publicMetadata as any
      const userRole = metadata?.role || (user as any).privateMetadata?.role
      const providerAccess = metadata?.providerAccess
      
      // Redirect both suppliers and providers to the unified provider dashboard
      if (userRole === 'supplier' || userRole === 'provider' || providerAccess === true) {
        router.push('/provider-dashboard')
        return
      }
      
      const isAgency = metadata?.isAgency || metadata?.organizationId
      setIsAgent(userRole === 'agent' || isAgency)
    }
  }, [user])

  if (!isLoaded || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-primary rounded-full animate-spin"></div>
      </div>
    )
  }

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

  if (isAgent) {
    sidebarItems.splice(5, 0, { id: 'team', label: 'Equipo', icon: Users, href: '/dashboard/team' })
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      <div className="pt-20 flex relative">
        {/* Enhanced Background decorations for glassmorphism */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-200 to-cyan-200 rounded-full filter blur-3xl opacity-60"></div>
          <div className="absolute top-80 -left-40 w-96 h-96 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full filter blur-3xl opacity-60"></div>
          <div className="absolute bottom-20 right-20 w-72 h-72 bg-gradient-to-br from-green-200 to-emerald-200 rounded-full filter blur-3xl opacity-40"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-indigo-100 to-blue-100 rounded-full filter blur-3xl opacity-30"></div>
        </div>

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-white bg-opacity-50 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div className={`fixed left-0 top-20 h-[calc(100vh-5rem)] w-64 z-50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <div className="m-4 p-6 h-full overflow-y-auto glass-sidebar rounded-2xl">
            {/* User Info */}
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

            {/* Navigation */}
            <nav className="space-y-2">
              {sidebarItems.map((item) => {
                const isActive = pathname === item.href || (item.id === 'dashboard' && pathname === '/dashboard')
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      router.push(item.href)
                      setSidebarOpen(false)
                    }}
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

        {/* Main Content */}
        <div className="flex-1 lg:ml-72 relative z-10">
          {/* Mobile Header */}
          <div className="lg:hidden flex items-center justify-between py-6 px-4 sm:px-6 border-b border-gray-100">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg glass-icon-container"
            >
              <Menu size={20} className="text-gray-700" />
            </button>
            <h1 className="text-xl font-medium text-gray-900">
              Dashboard
            </h1>
            <div className="w-10"></div>
          </div>
          
          {/* Children Content */}
          {children}
        </div>
      </div>
    </div>
  )
}