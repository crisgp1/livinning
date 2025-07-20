'use client'

import { useUser } from '@clerk/nextjs'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Navigation from '@/components/Navigation'
import ServiceOrders from '@/components/ServiceOrders'
import { 
  Home, 
  Building, 
  PlusCircle, 
  BarChart3, 
  Settings, 
  Users, 
  Menu, 
  X,
  Wrench
} from 'lucide-react'

interface Property {
  id: string
  title: string
  price: { amount: number; currency: string }
  propertyType: string
  address: { city: string; state: string }
  images: string[]
  status: string
  createdAt: string
  features: {
    bedrooms: number
    bathrooms: number
    squareMeters: number
  }
}

interface UserStats {
  totalProperties: number
  publishedProperties: number
  draftProperties: number
  totalViews: number
  totalInquiries: number
}

export default function Dashboard() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const pathname = usePathname()
  const [properties, setProperties] = useState<Property[]>([])
  const [stats, setStats] = useState<UserStats>({
    totalProperties: 0,
    publishedProperties: 0,
    draftProperties: 0,
    totalViews: 0,
    totalInquiries: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isAgent, setIsAgent] = useState(false)
  const [organization, setOrganization] = useState<any>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

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
      const isAgency = metadata?.isAgency || metadata?.organizationId
      setIsAgent(userRole === 'agent' || isAgency)
      fetchDashboardData()
    }
  }, [user])

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true)
      
      const propertiesResponse = await fetch('/api/dashboard/properties')
      if (propertiesResponse.ok) {
        const propertiesData = await propertiesResponse.json()
        setProperties(propertiesData.data || [])
      }

      const statsResponse = await fetch('/api/dashboard/stats')
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData.data || stats)
      }
      
      const orgResponse = await fetch('/api/dashboard/organization')
      if (orgResponse.ok) {
        const orgData = await orgResponse.json()
        setOrganization(orgData.data || null)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteProperty = async (propertyId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta propiedad?')) return

    try {
      const response = await fetch(`/api/properties/${propertyId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setProperties(properties.filter(p => p.id !== propertyId))
        fetchDashboardData()
      } else {
        alert('Error al eliminar la propiedad')
      }
    } catch (error) {
      console.error('Error deleting property:', error)
      alert('Error al eliminar la propiedad')
    }
  }

  if (!isLoaded || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0a0a' }}>
        <div className="loading-spinner"></div>
      </div>
    )
  }

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, href: '/dashboard' },
    { id: 'properties', label: 'Propiedades', icon: Building, href: '/dashboard/properties' },
    { id: 'publish', label: 'Publicar', icon: PlusCircle, href: '/publish' },
    { id: 'services', label: 'Servicios', icon: Wrench, href: '/services' },
    { id: 'settings', label: 'Configuración', icon: Settings, href: '/dashboard/settings' },
  ]

  if (isAgent) {
    sidebarItems.splice(4, 0, { id: 'team', label: 'Equipo', icon: Users, href: '/dashboard/team' })
  }

  return (
    <div className="min-h-screen" style={{ background: '#0a0a0a' }}>
      <Navigation />
      
      <div className="pt-24 flex">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div className={`fixed left-0 top-24 h-[calc(100vh-6rem)] w-64 z-50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <div className="glass-card m-4 p-6 h-full overflow-y-auto">
            {/* User Info */}
            <div className="border-b pb-6 mb-6" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden">
                  {user?.imageUrl ? (
                    <img src={user.imageUrl} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div 
                      className="w-full h-full flex items-center justify-center"
                      style={{ background: 'linear-gradient(135deg, #666666, #525252)' }}
                    >
                      <span className="text-white font-medium">
                        {user?.firstName?.[0] || 'U'}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-light truncate" style={{ color: '#ffffff' }}>
                    {user?.firstName || 'Usuario'}
                  </p>
                  <p className="text-xs truncate" style={{ color: '#a3a3a3' }}>
                    {user?.emailAddresses?.[0]?.emailAddress}
                  </p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="space-y-2 mb-6">
              {sidebarItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    router.push(item.href)
                    setSidebarOpen(false)
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200"
                  style={{
                    background: pathname === item.href || (item.id === 'dashboard' && pathname === '/dashboard') 
                      ? 'rgba(255, 255, 255, 0.2)' 
                      : 'transparent',
                    color: pathname === item.href || (item.id === 'dashboard' && pathname === '/dashboard') 
                      ? '#ffffff' 
                      : '#a3a3a3',
                    border: pathname === item.href || (item.id === 'dashboard' && pathname === '/dashboard') 
                      ? '1px solid rgba(255, 255, 255, 0.2)' 
                      : '1px solid transparent'
                  }}
                  onMouseEnter={(e) => {
                    if (pathname !== item.href) {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (pathname !== item.href) {
                      e.currentTarget.style.background = 'transparent'
                    }
                  }}
                >
                  <item.icon size={20} />
                  <span className="font-light">{item.label}</span>
                </button>
              ))}
            </nav>

            {/* Go to Home Button */}
            <div className="absolute bottom-6 left-6 right-6">
              <button 
                onClick={() => {
                  router.push('/')
                  setSidebarOpen(false)
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200"
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: '#a3a3a3',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
                  e.currentTarget.style.color = '#ffffff'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                  e.currentTarget.style.color = '#a3a3a3'
                }}
              >
                <Home size={20} />
                <span className="font-light">Ir al Inicio</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 lg:ml-0">
          <main className="pb-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              
              {/* Mobile Header */}
              <div className="lg:hidden flex items-center justify-between py-6 border-b" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="p-2 rounded-lg transition-all duration-200"
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: '#ffffff',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}
                >
                  <Menu size={20} />
                </button>
                <h1 className="text-xl font-light" style={{ color: '#ffffff' }}>
                  Dashboard
                </h1>
                <div className="w-10"></div>
              </div>
          
          {/* Header */}
          <div className="mb-8 lg:mb-12 mt-6 lg:mt-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="hidden lg:block">
                <h1 className="text-3xl lg:text-4xl font-light mb-2" style={{ color: '#ffffff' }}>
                  Dashboard
                </h1>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <p className="text-lg" style={{ color: '#666666' }}>
                    {user.firstName || 'Usuario'}
                  </p>
                  
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* User Level Badge */}
                    <div 
                      className="inline-flex items-center gap-2 px-3 py-1 backdrop-blur-md"
                      style={{ 
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '8px',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
                      }}
                    >
                      <div className="w-3 h-3 rounded-full flex items-center justify-center" style={{ 
                        background: (() => {
                          const metadata = user.publicMetadata as any
                          const plan = metadata?.organizationPlan || metadata?.plan || 'free'
                          switch(plan) {
                            case 'enterprise': return 'linear-gradient(135deg, #ffffff, #e5e5e5)'
                            case 'premium': return 'linear-gradient(135deg, #e5e5e5, #a3a3a3)'
                            case 'basic': return 'linear-gradient(135deg, #a3a3a3, #666666)'
                            default: return 'linear-gradient(135deg, #666666, #525252)'
                          }
                        })(),
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)'
                      }}>
                        <div className="w-1 h-1 rounded-full bg-black opacity-60"></div>
                      </div>
                      <span className="text-xs font-medium" style={{ color: '#ffffff' }}>
                        {(() => {
                          const metadata = user.publicMetadata as any
                          const plan = metadata?.organizationPlan || metadata?.plan || 'free'
                          switch(plan) {
                            case 'enterprise': return 'Enterprise'
                            case 'premium': return 'Premium'
                            case 'basic': return 'Basic'
                            default: return 'Free'
                          }
                        })()}
                      </span>
                    </div>

                    {/* Verification Badge */}
                    {(isAgent || user) && (
                      <div 
                        className="inline-flex items-center gap-2 px-3 py-1 backdrop-blur-md"
                        style={{ 
                          background: 'rgba(255, 255, 255, 0.1)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          borderRadius: '8px',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
                        }}
                      >
                        <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ 
                          background: 'linear-gradient(135deg, #ffffff, #e5e5e5)',
                          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
                        }}>
                          <svg 
                            width="8" 
                            height="8" 
                            viewBox="0 0 8 8" 
                            fill="none"
                            style={{ opacity: 0.8 }}
                          >
                            <path 
                              d="M1 4L3 6L7 2" 
                              stroke="#000000" 
                              strokeWidth="1.5" 
                              strokeLinecap="round" 
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                        <span className="text-xs font-medium" style={{ color: '#ffffff' }}>
                          Verificado
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <motion.button
                onClick={() => router.push('/publish')}
                className="btn-primary flex items-center gap-3 w-full sm:w-auto justify-center"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="w-1 h-1 rounded-full bg-current opacity-60"></div>
                Nueva Propiedad
              </motion.button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 lg:mb-12">
            {[
              { label: 'Total', value: stats.totalProperties, sublabel: 'Propiedades' },
              { label: 'Activas', value: stats.publishedProperties, sublabel: 'Publicadas' },
              { label: 'Borradores', value: stats.draftProperties, sublabel: 'En proceso' },
              { label: 'Vistas', value: stats.totalViews, sublabel: 'Este mes' }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                className="glass-card p-6 group"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -4 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-2 h-2 rounded-full bg-white opacity-40"></div>
                  <span className="text-xs font-medium" style={{ color: '#666666' }}>
                    {stat.label}
                  </span>
                </div>
                <div className="text-2xl font-light mb-1" style={{ color: '#ffffff' }}>
                  {stat.value}
                </div>
                <div className="text-xs" style={{ color: '#666666' }}>
                  {stat.sublabel}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Properties Grid */}
          <div className="mb-8 lg:mb-12">
            <div className="flex items-center justify-between mb-6 lg:mb-8">
              <h2 className="text-xl lg:text-2xl font-light" style={{ color: '#ffffff' }}>
                Propiedades
              </h2>
              <button 
                className="text-sm" 
                style={{ color: '#666666' }}
                onMouseEnter={(e) => (e.target as HTMLElement).style.color = '#ffffff'}
                onMouseLeave={(e) => (e.target as HTMLElement).style.color = '#666666'}
              >
                Ver todas
              </button>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="loading-spinner"></div>
              </div>
            ) : properties.length === 0 ? (
              <div className="glass-card p-12 text-center">
                <div className="w-4 h-4 rounded-full bg-white opacity-20 mx-auto mb-4"></div>
                <h3 className="text-lg font-light mb-2" style={{ color: '#ffffff' }}>
                  No hay propiedades
                </h3>
                <p className="text-sm mb-6" style={{ color: '#666666' }}>
                  Comienza publicando tu primera propiedad
                </p>
                <button
                  onClick={() => router.push('/publish')}
                  className="btn-primary"
                >
                  Publicar Propiedad
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {properties.slice(0, 6).map((property, index) => (
                  <motion.div
                    key={property.id}
                    className="glass-card overflow-hidden group"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -4 }}
                  >
                    <div className="aspect-video bg-gray-900 relative overflow-hidden">
                      {property.images.length > 0 ? (
                        <img
                          src={property.images[0]}
                          alt={property.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="w-6 h-6 rounded-full bg-white opacity-20"></div>
                        </div>
                      )}
                      
                      <div className="absolute top-3 right-3">
                        <div className="px-2 py-1 rounded-full text-xs font-medium" style={{ 
                          background: 'rgba(255, 255, 255, 0.1)',
                          backdropFilter: 'blur(8px)',
                          color: '#ffffff'
                        }}>
                          {property.status === 'published' ? 'Activa' : 'Borrador'}
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <h3 className="font-medium mb-2 line-clamp-1" style={{ color: '#ffffff' }}>
                        {property.title}
                      </h3>
                      
                      <div className="flex items-center gap-2 mb-3" style={{ color: '#666666' }}>
                        <div className="w-1 h-1 rounded-full bg-current opacity-60"></div>
                        <span className="text-sm">{property.address.city}, {property.address.state}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="text-lg font-light" style={{ color: '#ffffff' }}>
                          €{property.price.amount.toLocaleString()}
                        </div>
                        <div className="flex items-center gap-4 text-xs" style={{ color: '#666666' }}>
                          <span>{property.features.bedrooms} hab</span>
                          <span>{property.features.bathrooms} baños</span>
                          <span>{property.features.squareMeters} m²</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-4">
                        <button
                          onClick={() => router.push(`/properties/${property.id}`)}
                          className="flex-1 py-2 px-3 sm:px-4 rounded-lg text-xs sm:text-sm font-medium transition-all duration-300"
                          style={{ 
                            background: 'rgba(255, 255, 255, 0.1)',
                            color: '#ffffff'
                          }}
                          onMouseEnter={(e) => {
                            (e.target as HTMLElement).style.background = 'rgba(255, 255, 255, 0.2)'
                          }}
                          onMouseLeave={(e) => {
                            (e.target as HTMLElement).style.background = 'rgba(255, 255, 255, 0.1)'
                          }}
                        >
                          Ver
                        </button>
                        <button
                          onClick={() => router.push(`/properties/${property.id}/edit`)}
                          className="py-2 px-3 sm:px-4 rounded-lg text-xs sm:text-sm font-medium transition-all duration-300"
                          style={{ 
                            background: 'transparent',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            color: '#666666'
                          }}
                          onMouseEnter={(e) => {
                            (e.target as HTMLElement).style.borderColor = 'rgba(255, 255, 255, 0.4)'
                            ;(e.target as HTMLElement).style.color = '#ffffff'
                          }}
                          onMouseLeave={(e) => {
                            (e.target as HTMLElement).style.borderColor = 'rgba(255, 255, 255, 0.2)'
                            ;(e.target as HTMLElement).style.color = '#666666'
                          }}
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteProperty(property.id)}
                          className="py-2 px-3 sm:px-4 rounded-lg text-xs sm:text-sm font-medium transition-all duration-300"
                          style={{ 
                            background: 'transparent',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            color: '#666666'
                          }}
                          onMouseEnter={(e) => {
                            (e.target as HTMLElement).style.borderColor = 'rgba(255, 255, 255, 0.4)'
                            ;(e.target as HTMLElement).style.color = '#ffffff'
                          }}
                          onMouseLeave={(e) => {
                            (e.target as HTMLElement).style.borderColor = 'rgba(255, 255, 255, 0.2)'
                            ;(e.target as HTMLElement).style.color = '#666666'
                          }}
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <motion.div
              className="glass-card p-6 text-center group cursor-pointer"
              whileHover={{ y: -4 }}
              onClick={() => router.push('/publish')}
            >
              <div className="w-3 h-3 rounded-full bg-white opacity-40 mx-auto mb-4"></div>
              <h3 className="font-medium mb-2" style={{ color: '#ffffff' }}>
                Nueva Propiedad
              </h3>
              <p className="text-sm" style={{ color: '#666666' }}>
                Publicar una nueva propiedad
              </p>
            </motion.div>

            <motion.div
              className="glass-card p-6 text-center group cursor-pointer relative"
              whileHover={{ y: -4 }}
              onClick={() => router.push('/services')}
            >
              {/* Premium Badge */}
              <div className="absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium" style={{ 
                background: 'linear-gradient(135deg, #ffffff, #e5e5e5)',
                color: '#000000'
              }}>
                Premium
              </div>
              
              <div className="w-3 h-3 rounded-full bg-white opacity-40 mx-auto mb-4"></div>
              <h3 className="font-medium mb-2" style={{ color: '#ffffff' }}>
                Servicios
              </h3>
              <p className="text-sm" style={{ color: '#666666' }}>
                Solicitar servicios profesionales
              </p>
            </motion.div>

            <motion.div
              className="glass-card p-6 text-center group cursor-pointer"
              whileHover={{ y: -4 }}
              onClick={() => router.push('/dashboard/analytics')}
            >
              <div className="w-3 h-3 rounded-full bg-white opacity-40 mx-auto mb-4"></div>
              <h3 className="font-medium mb-2" style={{ color: '#ffffff' }}>
                Analytics
              </h3>
              <p className="text-sm" style={{ color: '#666666' }}>
                Ver estadísticas detalladas
              </p>
            </motion.div>

            <motion.div
              className="glass-card p-6 text-center group cursor-pointer"
              whileHover={{ y: -4 }}
              onClick={() => router.push('/dashboard/settings')}
            >
              <div className="w-3 h-3 rounded-full bg-white opacity-40 mx-auto mb-4"></div>
              <h3 className="font-medium mb-2" style={{ color: '#ffffff' }}>
                Configuración
              </h3>
              <p className="text-sm" style={{ color: '#666666' }}>
                Gestionar tu cuenta
              </p>
            </motion.div>
          </div>

          {/* Service Orders Section */}
          {isAgent && (
            <div className="mt-16">
              <ServiceOrders />
            </div>
          )}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}