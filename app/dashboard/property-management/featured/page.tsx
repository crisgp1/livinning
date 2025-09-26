'use client'

import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Star,
  Clock,
  Calendar,
  DollarSign,
  Eye,
  TrendingUp,
  Sparkles,
  Building,
  Plus,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

interface FeaturedProperty {
  id: string
  title: string
  price: { amount: number; currency: string }
  images: string[]
  isHighlighted: boolean
  highlightExpiresAt?: string
  daysRemaining?: number
  views: number
  inquiries: number
  address: { city: string; state: string }
}

export default function FeaturedPropertiesPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [featuredProperties, setFeaturedProperties] = useState<FeaturedProperty[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (isLoaded && user) {
      fetchFeaturedProperties()
    }
  }, [user, isLoaded])

  const fetchFeaturedProperties = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/properties/featured?user=true')
      if (response.ok) {
        const data = await response.json()
        setFeaturedProperties(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching featured properties:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleHighlightProperty = (propertyId: string) => {
    router.push(`/services/highlight/checkout?propertyId=${propertyId}`)
  }

  const handleExtendHighlight = (propertyId: string) => {
    router.push(`/services/highlight/checkout?propertyId=${propertyId}&extend=true`)
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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 mb-4"
          >
            <div className="p-2 rounded-lg glass">
              <Star className="w-5 h-5 text-yellow-500" />
            </div>
            <span className="text-sm font-medium text-yellow-600">Propiedades Destacadas</span>
          </motion.div>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-3xl lg:text-4xl font-light mb-2 text-gray-900">
                Gestión de Destacados
              </h1>
              <p className="text-lg text-gray-600">
                Administra tus propiedades destacadas y mejora su visibilidad
              </p>
            </div>

            <motion.button
              onClick={() => router.push('/services')}
              className="btn-primary flex items-center gap-3 justify-center"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Sparkles size={20} />
              Destacar Nueva Propiedad
            </motion.button>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-yellow-100">
                <Star className="w-5 h-5 text-yellow-600" />
              </div>
              <h3 className="font-medium text-gray-900">Beneficios del Destacado</h3>
            </div>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <CheckCircle size={16} className="text-green-500" />
                Aparece en primeras posiciones
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle size={16} className="text-green-500" />
                Badge de "Destacada" visible
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle size={16} className="text-green-500" />
                Mayor visibilidad en búsquedas
              </li>
            </ul>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-blue-100">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-medium text-gray-900">Estadísticas</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Propiedades destacadas:</span>
                <span className="font-medium text-gray-900">{featuredProperties.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Vistas totales:</span>
                <span className="font-medium text-gray-900">
                  {featuredProperties.reduce((sum, p) => sum + p.views, 0)}
                </span>
              </div>
            </div>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-green-100">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="font-medium text-gray-900">Precios</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">7 días:</span>
                <span className="font-medium">$15 USD</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">30 días:</span>
                <span className="font-medium">$50 USD</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">90 días:</span>
                <span className="font-medium">$120 USD</span>
              </div>
            </div>
          </div>
        </div>

        {/* Featured Properties */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-gray-200 border-t-primary rounded-full animate-spin"></div>
          </div>
        ) : featuredProperties.length === 0 ? (
          <div className="glass-icon-container rounded-2xl p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-6 glass rounded-2xl flex items-center justify-center">
              <Star className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium mb-2 text-gray-900">
              No tienes propiedades destacadas
            </h3>
            <p className="text-sm mb-6 text-gray-600">
              Destaca tus propiedades para obtener mayor visibilidad y más consultas
            </p>
            <button
              onClick={() => router.push('/services')}
              className="btn-primary shadow-lg shadow-primary/20"
            >
              Destacar Primera Propiedad
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <h2 className="text-xl font-medium text-gray-900">
              Propiedades Destacadas ({featuredProperties.length})
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {featuredProperties.map((property, index) => (
                <motion.div
                  key={property.id}
                  className="glass-icon-container rounded-2xl overflow-hidden"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex gap-4 p-6">
                    {/* Property Image */}
                    <div className="w-24 h-24 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                      {property.images.length > 0 ? (
                        <img
                          src={property.images[0]}
                          alt={property.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Building className="w-6 h-6 text-gray-300" />
                        </div>
                      )}
                    </div>

                    {/* Property Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-medium text-gray-900 line-clamp-1">
                          {property.title}
                        </h3>
                        <div className="flex items-center gap-1 text-yellow-500">
                          <Star className="w-4 h-4 fill-current" />
                          <span className="text-xs font-medium">Destacada</span>
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 mb-3">
                        {property.address.city}, {property.address.state}
                      </p>

                      <div className="flex items-center justify-between mb-4">
                        <div className="text-lg font-medium text-gray-900">
                          ${property.price.amount.toLocaleString()}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-600">
                          <div className="flex items-center gap-1">
                            <Eye size={12} />
                            <span>{property.views}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign size={12} />
                            <span>{property.inquiries}</span>
                          </div>
                        </div>
                      </div>

                      {/* Highlight Status */}
                      {property.isHighlighted && property.highlightExpiresAt && (
                        <div className="mb-4">
                          <div className={`flex items-center gap-2 text-xs ${
                            property.daysRemaining && property.daysRemaining > 7
                              ? 'text-green-600'
                              : property.daysRemaining && property.daysRemaining > 3
                              ? 'text-yellow-600'
                              : 'text-red-600'
                          }`}>
                            <Clock size={12} />
                            <span>
                              {property.daysRemaining && property.daysRemaining > 0
                                ? `${property.daysRemaining} días restantes`
                                : 'Expirado'
                              }
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Expira: {new Date(property.highlightExpiresAt).toLocaleDateString()}
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleExtendHighlight(property.id)}
                          className="flex-1 py-2 px-3 rounded-lg bg-yellow-50 border border-yellow-200 text-yellow-700 text-sm font-medium hover:bg-yellow-100 transition-colors"
                        >
                          Extender
                        </button>
                        <button
                          onClick={() => router.push(`/properties/${property.id}`)}
                          className="flex-1 py-2 px-3 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-colors"
                        >
                          Ver Propiedad
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-12 glass-icon-container rounded-2xl p-8 text-center">
          <div className="max-w-2xl mx-auto">
            <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-medium mb-3 text-gray-900">
              ¿Quieres destacar más propiedades?
            </h3>
            <p className="text-gray-600 mb-6">
              Las propiedades destacadas obtienen hasta 5x más visualizaciones y consultas.
              Mejora la visibilidad de tu inventario y vende más rápido.
            </p>
            <button
              onClick={() => router.push('/services')}
              className="btn-primary shadow-lg shadow-primary/20"
            >
              Explorar Servicios de Destacado
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}