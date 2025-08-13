'use client'

import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import ServiceOrders from '@/components/ServiceOrders'
import OrderStatus from '@/components/OrderStatus'
import {
  Home,
  Building,
  PlusCircle,
  BarChart3,
  Settings,
  Wrench,
  TrendingUp,
  Eye,
  Sparkles
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

interface ServiceOrder {
  id: string
  serviceType: string
  serviceName: string
  serviceDescription: string
  propertyAddress: string
  contactPhone: string
  preferredDate: string
  specialRequests: string
  amount: number
  currency: string
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'
  estimatedDelivery?: string
  actualDelivery?: string
  assignedTo?: string
  deliverables: string[]
  notes: string[]
  createdAt: string
  updatedAt: string
}

export default function Dashboard() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [properties, setProperties] = useState<Property[]>([])
  const [stats, setStats] = useState<UserStats>({
    totalProperties: 0,
    publishedProperties: 0,
    draftProperties: 0,
    totalViews: 0,
    totalInquiries: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [organization, setOrganization] = useState<any>(null)
  const [recentOrder, setRecentOrder] = useState<ServiceOrder | null>(null)

  useEffect(() => {
    if (isLoaded && user) {
      fetchDashboardData()
    }
  }, [user, isLoaded])

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
      
      // Fetch recent service order
      const ordersResponse = await fetch('/api/services/orders?limit=1')
      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json()
        if (ordersData.data && ordersData.data.length > 0) {
          setRecentOrder(ordersData.data[0])
        }
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
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-primary rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <main className="pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="mb-8 lg:mb-12 mt-6 lg:mt-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="hidden lg:block">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="inline-flex items-center gap-2 mb-4"
                >
                  <div className="p-2 rounded-lg glass">
                    <Sparkles className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-primary">Panel de Control</span>
                </motion.div>
                <h1 className="text-3xl lg:text-4xl font-light mb-2 text-gray-900">
                  Bienvenido, {user.firstName || 'Usuario'}
                </h1>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <p className="text-lg text-gray-600">
                    Gestiona tus propiedades y servicios
                  </p>
                  
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* User Level Badge */}
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-icon-container">
                      <div className="w-3 h-3 rounded-full" style={{ 
                        background: (() => {
                          const metadata = user.publicMetadata as any
                          const plan = metadata?.organizationPlan || metadata?.plan || 'free'
                          switch(plan) {
                            case 'enterprise': return 'linear-gradient(135deg, #FFD700, #FFA500)'
                            case 'premium': return 'linear-gradient(135deg, #C0C0C0, #808080)'
                            case 'basic': return 'linear-gradient(135deg, #CD7F32, #8B4513)'
                            default: return 'linear-gradient(135deg, #718096, #4A5568)'
                          }
                        })()
                      }}>
                      </div>
                      <span className="text-xs font-medium text-gray-700">
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
                    {user && (
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-50 border border-green-200">
                        <div className="w-4 h-4 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                          <svg 
                            width="8" 
                            height="8" 
                            viewBox="0 0 8 8" 
                            fill="none"
                          >
                            <path 
                              d="M1 4L3 6L7 2" 
                              stroke="white" 
                              strokeWidth="1.5" 
                              strokeLinecap="round" 
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                        <span className="text-xs font-medium text-green-700">
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
                <PlusCircle size={20} />
                Nueva Propiedad
              </motion.button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 lg:mb-12">
            {[
              { label: 'Total', value: stats.totalProperties, sublabel: 'Propiedades', icon: Building, color: 'from-blue-500 to-cyan-500' },
              { label: 'Activas', value: stats.publishedProperties, sublabel: 'Publicadas', icon: Home, color: 'from-green-500 to-emerald-500' },
              { label: 'Borradores', value: stats.draftProperties, sublabel: 'En proceso', icon: PlusCircle, color: 'from-orange-500 to-red-500' },
              { label: 'Vistas', value: stats.totalViews, sublabel: 'Este mes', icon: Eye, color: 'from-purple-500 to-pink-500' }
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
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color}`}>
                    <stat.icon size={20} className="text-white" />
                  </div>
                  <span className="text-xs font-medium text-gray-500">
                    {stat.label}
                  </span>
                </div>
                <div className="text-3xl font-light mb-1 text-gray-900">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600">
                  {stat.sublabel}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Service Order Status */}
          {recentOrder && (
            <div className="mb-8 lg:mb-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl lg:text-2xl font-medium text-gray-900">
                  Estado de tu Servicio Más Reciente
                </h2>
                <button 
                  onClick={() => router.push('/dashboard/services')}
                  className="text-sm text-primary hover:text-primary-hover font-medium"
                >
                  Ver todos los servicios
                </button>
              </div>
              <OrderStatus
                status={recentOrder.status}
                serviceName={recentOrder.serviceName}
                orderDate={recentOrder.createdAt}
                estimatedDelivery={recentOrder.estimatedDelivery}
                actualDelivery={recentOrder.actualDelivery}
              />
            </div>
          )}

          {/* Properties Grid */}
          <div className="mb-8 lg:mb-12">
            <div className="flex items-center justify-between mb-6 lg:mb-8">
              <h2 className="text-xl lg:text-2xl font-medium text-gray-900">
                Mis Propiedades
              </h2>
              <button className="text-sm text-primary hover:text-primary-hover font-medium">
                Ver todas
              </button>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-2 border-gray-200 border-t-primary rounded-full animate-spin"></div>
              </div>
            ) : properties.length === 0 ? (
              <div className="glass-icon-container rounded-2xl p-12 text-center">
                <div className="w-16 h-16 mx-auto mb-6 glass rounded-2xl flex items-center justify-center">
                  <Building className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium mb-2 text-gray-900">
                  No hay propiedades
                </h3>
                <p className="text-sm mb-6 text-gray-600">
                  Comienza publicando tu primera propiedad
                </p>
                <button
                  onClick={() => router.push('/publish')}
                  className="btn-primary shadow-lg shadow-primary/20"
                >
                  Publicar Propiedad
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {properties.slice(0, 6).map((property, index) => (
                  <motion.div
                    key={property.id}
                    className="glass-icon-container rounded-2xl overflow-hidden group hover:shadow-xl transition-all duration-300"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -4 }}
                  >
                    <div className="aspect-video bg-gray-100 relative overflow-hidden rounded-t-xl">
                      {property.images.length > 0 ? (
                        <img
                          src={property.images[0]}
                          alt={property.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Building className="w-8 h-8 text-gray-300" />
                        </div>
                      )}
                      
                      <div className="absolute top-3 right-3">
                        <div className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                          property.status === 'published' 
                            ? 'bg-green-100 text-green-700 border border-green-200' 
                            : 'bg-orange-100 text-orange-700 border border-orange-200'
                        }`}>
                          {property.status === 'published' ? 'Activa' : 'Borrador'}
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-6 bg-white/50 backdrop-blur-sm">
                      <h3 className="font-medium mb-2 line-clamp-1 text-gray-900">
                        {property.title}
                      </h3>
                      
                      <div className="flex items-center gap-2 mb-3 text-gray-500">
                        <TrendingUp size={14} />
                        <span className="text-sm">{property.address.city}, {property.address.state}</span>
                      </div>
                      
                      <div className="flex items-center justify-between mb-4">
                        <div className="text-xl font-light text-gray-900">
                          ${property.price.amount.toLocaleString()}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-600">
                          <span>{property.features.bedrooms} hab</span>
                          <span>{property.features.bathrooms} baños</span>
                          <span>{property.features.squareMeters} m²</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => router.push(`/properties/${property.id}`)}
                          className="flex-1 py-2.5 px-4 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-all duration-200 shadow-sm"
                        >
                          Ver
                        </button>
                        <button
                          onClick={() => router.push(`/properties/${property.id}/edit`)}
                          className="py-2.5 px-4 rounded-xl bg-white/50 backdrop-blur-sm border border-gray-200 text-gray-700 text-sm font-medium hover:bg-white hover:shadow-sm transition-all duration-200"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteProperty(property.id)}
                          className="py-2.5 px-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-medium hover:bg-red-100 transition-all duration-200"
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            <motion.div
              className="glass-icon-container rounded-2xl p-6 text-center group cursor-pointer hover:shadow-xl transition-all duration-300"
              whileHover={{ y: -4 }}
              onClick={() => router.push('/publish')}
            >
              <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <PlusCircle className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-medium mb-2 text-gray-900">
                Nueva Propiedad
              </h3>
              <p className="text-sm text-gray-600">
                Publicar una nueva propiedad
              </p>
            </motion.div>

            <motion.div
              className="glass-icon-container rounded-2xl p-6 text-center group cursor-pointer hover:shadow-xl transition-all duration-300 relative"
              whileHover={{ y: -4 }}
              onClick={() => router.push('/services')}
            >
              {/* Premium Badge */}
              <div className="absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                Premium
              </div>
              
              <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Wrench className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-medium mb-2 text-gray-900">
                Servicios
              </h3>
              <p className="text-sm text-gray-600">
                Solicitar servicios profesionales
              </p>
            </motion.div>

            <motion.div
              className="glass-icon-container rounded-2xl p-6 text-center group cursor-pointer hover:shadow-xl transition-all duration-300"
              whileHover={{ y: -4 }}
              onClick={() => router.push('/dashboard/analytics')}
            >
              <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-medium mb-2 text-gray-900">
                Analytics
              </h3>
              <p className="text-sm text-gray-600">
                Ver estadísticas detalladas
              </p>
            </motion.div>

            <motion.div
              className="glass-icon-container rounded-2xl p-6 text-center group cursor-pointer hover:shadow-xl transition-all duration-300"
              whileHover={{ y: -4 }}
              onClick={() => router.push('/dashboard/settings')}
            >
              <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br from-gray-500 to-gray-700 flex items-center justify-center">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-medium mb-2 text-gray-900">
                Configuración
              </h3>
              <p className="text-sm text-gray-600">
                Gestionar tu cuenta
              </p>
            </motion.div>
          </div>

          {/* Mis Servicios Contratados Section */}
          <div className="mb-8 lg:mb-12">
            <ServiceOrders />
          </div>
      </div>
    </main>
  )
}