'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Star, 
  MapPin, 
  Clock, 
  Zap, 
  Shield, 
  Phone, 
  MessageCircle,
  ChevronRight,
  Award,
  Eye,
  Calendar,
  DollarSign
} from 'lucide-react'
import { ServiceType } from '@/lib/domain/entities/ServiceOrder'

interface ProviderService {
  basePrice: number
  currency: string
  estimatedDuration: string
  availableSlots: number
  description: string
}

interface ProviderRating {
  averageRating: number
  totalReviews: number
}

interface ProviderLocation {
  city: string
  state: string
  country: string
  distance?: number | null
}

interface AvailableProvider {
  id: string
  userId: string
  businessName: string
  description: string
  profileImageUrl?: string
  tier: 'basic' | 'premium' | 'elite'
  status: string
  isVerified: boolean
  rating: ProviderRating
  location: ProviderLocation
  service: ProviderService | null
  completedJobs: number
  responseTime: number
  portfolioImages: string[]
  isOnline: boolean
  lastActive: Date
}

interface ServiceStats {
  totalProviders: number
  onlineProviders: number
  averagePrice: number
  averageRating: number
  priceRange: {
    min: number
    max: number
  }
}

interface AvailableProvidersListProps {
  serviceType: ServiceType
  userLocation?: { latitude: number; longitude: number }
  maxDistance?: number
  onProviderSelect: (provider: AvailableProvider) => void
  selectedProviderId?: string
}

export default function AvailableProvidersList({
  serviceType,
  userLocation,
  maxDistance = 50,
  onProviderSelect,
  selectedProviderId
}: AvailableProvidersListProps) {
  const [providers, setProviders] = useState<AvailableProvider[]>([])
  const [stats, setStats] = useState<ServiceStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const fetchProviders = async () => {
    try {
      if (!refreshing) setLoading(true)
      
      const params = new URLSearchParams({
        serviceType,
        limit: '20',
        offset: '0'
      })
      
      if (userLocation) {
        params.append('latitude', userLocation.latitude.toString())
        params.append('longitude', userLocation.longitude.toString())
        params.append('maxDistance', maxDistance.toString())
      }

      const response = await fetch(`/api/providers/available?${params}`)
      const data = await response.json()

      if (data.success) {
        setProviders(data.data)
        setStats(data.stats)
        setError(null)
      } else {
        setError(data.error || 'Error al cargar proveedores disponibles')
      }
    } catch (err) {
      setError('Error al conectar con el servidor')
      console.error('Fetch providers error:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // Auto-refresh providers every 30 seconds
  useEffect(() => {
    fetchProviders()
    
    const interval = setInterval(() => {
      setRefreshing(true)
      fetchProviders()
    }, 30000)
    
    return () => clearInterval(interval)
  }, [serviceType, userLocation, maxDistance])

  const getTierBadgeColor = (tier: string) => {
    switch (tier) {
      case 'elite':
        return 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white'
      case 'premium':
        return 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'elite':
        return <Award className="w-3 h-3" />
      case 'premium':
        return <Star className="w-3 h-3" />
      default:
        return <Shield className="w-3 h-3" />
    }
  }

  const getServiceTypeLabel = (type: ServiceType): string => {
    const labels: Record<ServiceType, string> = {
      [ServiceType.PHOTOGRAPHY]: 'Fotografía',
      [ServiceType.LEGAL]: 'Legal',
      [ServiceType.VIRTUAL_TOUR]: 'Tour Virtual',
      [ServiceType.HOME_STAGING]: 'Home Staging',
      [ServiceType.MARKET_ANALYSIS]: 'Análisis de Mercado',
      [ServiceType.DOCUMENTATION]: 'Documentación',
      [ServiceType.HIGHLIGHT]: 'Destacar Propiedad',
      [ServiceType.CLEANING]: 'Limpieza',
      [ServiceType.MAINTENANCE]: 'Mantenimiento',
      [ServiceType.GARDENING]: 'Jardinería',
      [ServiceType.ELECTRICAL]: 'Electricidad',
      [ServiceType.CARPENTRY]: 'Carpintería',
      [ServiceType.PLUMBING]: 'Plomería',
      [ServiceType.PAINTING]: 'Pintura',
      [ServiceType.AIR_CONDITIONING]: 'Aire Acondicionado'
    }
    return labels[type] ?? type
  }

  if (loading && !refreshing) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">
            Proveedores Disponibles
          </h3>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            Buscando...
          </div>
        </div>
        
        {/* Loading skeletons */}
        {[...Array(3)].map((_, i) => (
          <div key={i} className="glass-icon-container rounded-xl p-6 animate-pulse">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with stats */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            Proveedores de {getServiceTypeLabel(serviceType)}
          </h3>
          {stats && (
            <p className="text-sm text-gray-600">
              {stats.onlineProviders} de {stats.totalProviders} disponibles ahora
              {userLocation && ' • Cerca de tu ubicación'}
            </p>
          )}
        </div>
        
        {refreshing && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            Actualizando...
          </div>
        )}
      </div>

      {/* Quick stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="glass-icon-container rounded-lg p-3 text-center">
            <div className="text-lg font-semibold text-gray-900">{stats.onlineProviders}</div>
            <div className="text-xs text-gray-600">En Línea</div>
          </div>
          <div className="glass-icon-container rounded-lg p-3 text-center">
            <div className="text-lg font-semibold text-gray-900">
              {stats.averageRating.toFixed(1)}★
            </div>
            <div className="text-xs text-gray-600">Calificación</div>
          </div>
          <div className="glass-icon-container rounded-lg p-3 text-center">
            <div className="text-lg font-semibold text-gray-900">
              ${Math.round(stats.averagePrice).toLocaleString()}
            </div>
            <div className="text-xs text-gray-600">Precio Prom.</div>
          </div>
          <div className="glass-icon-container rounded-lg p-3 text-center">
            <div className="text-lg font-semibold text-gray-900">
              ${stats.priceRange.min.toLocaleString()}-${stats.priceRange.max.toLocaleString()}
            </div>
            <div className="text-xs text-gray-600">Rango</div>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="glass-icon-container rounded-xl p-6 border-l-4 border-red-500">
          <div className="flex items-center gap-3">
            <div className="text-red-500">⚠️</div>
            <div>
              <h4 className="font-medium text-gray-900">Error</h4>
              <p className="text-sm text-gray-600">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Providers list */}
      {providers.length === 0 && !loading ? (
        <div className="glass-icon-container rounded-xl p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-8 h-8 text-gray-400" />
          </div>
          <h4 className="text-lg font-medium text-gray-900 mb-2">
            No hay proveedores disponibles
          </h4>
          <p className="text-gray-600 mb-4">
            No encontramos proveedores de {getServiceTypeLabel(serviceType)} disponibles en este momento.
          </p>
          <button
            onClick={() => fetchProviders()}
            className="btn-primary"
          >
            Buscar de Nuevo
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {providers.map((provider) => (
              <motion.div
                key={provider.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`glass-icon-container rounded-xl overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-lg ${
                  selectedProviderId === provider.id 
                    ? 'ring-2 ring-primary shadow-lg' 
                    : 'hover:shadow-md'
                }`}
                onClick={() => onProviderSelect(provider)}
              >
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Profile image */}
                    <div className="relative flex-shrink-0">
                      <div className="w-16 h-16 rounded-full overflow-hidden ring-2 ring-white shadow-lg">
                        {provider.profileImageUrl ? (
                          <img 
                            src={provider.profileImageUrl} 
                            alt={provider.businessName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                            <span className="text-primary font-medium text-lg">
                              {provider.businessName[0]}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {/* Online indicator */}
                      {provider.isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                          <Zap className="w-2.5 h-2.5 text-white" />
                        </div>
                      )}
                    </div>

                    {/* Provider info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-gray-900 truncate">
                            {provider.businessName}
                          </h4>
                          
                          {/* Tier badge */}
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getTierBadgeColor(provider.tier)}`}>
                            {getTierIcon(provider.tier)}
                            {provider.tier.charAt(0).toUpperCase() + provider.tier.slice(1)}
                          </span>
                          
                          {/* Verified badge */}
                          {provider.isVerified && (
                            <Shield className="w-4 h-4 text-blue-500" />
                          )}
                        </div>

                        {provider.service && (
                          <div className="text-right">
                            <div className="text-lg font-semibold text-gray-900">
                              ${provider.service.basePrice.toLocaleString()} {provider.service.currency}
                            </div>
                            <div className="text-xs text-gray-600">
                              {provider.service.estimatedDuration}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Rating and stats */}
                      <div className="flex items-center gap-4 mb-3 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="font-medium">{provider.rating.averageRating.toFixed(1)}</span>
                          <span>({provider.rating.totalReviews})</span>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{provider.responseTime}min respuesta</span>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <Award className="w-4 h-4" />
                          <span>{provider.completedJobs} trabajos</span>
                        </div>
                      </div>

                      {/* Location */}
                      <div className="flex items-center gap-2 mb-3 text-sm text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span>{provider.location.city}, {provider.location.state}</span>
                        {provider.location.distance && (
                          <span className="text-primary font-medium">
                            • {provider.location.distance.toFixed(1)} km
                          </span>
                        )}
                      </div>

                      {/* Description */}
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {provider.service?.description || provider.description}
                      </p>

                      {/* Portfolio preview */}
                      {provider.portfolioImages.length > 0 && (
                        <div className="flex items-center gap-2 mb-4">
                          <Eye className="w-4 h-4 text-gray-400" />
                          <div className="flex gap-1">
                            {provider.portfolioImages.slice(0, 3).map((image, idx) => (
                              <img
                                key={idx}
                                src={image}
                                alt=""
                                className="w-8 h-8 rounded object-cover border"
                              />
                            ))}
                            {provider.portfolioImages.length > 3 && (
                              <div className="w-8 h-8 rounded bg-gray-100 border flex items-center justify-center text-xs text-gray-600">
                                +{provider.portfolioImages.length - 3}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Action buttons */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                            provider.isOnline 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            <div className={`w-2 h-2 rounded-full ${
                              provider.isOnline ? 'bg-green-500' : 'bg-gray-400'
                            }`}></div>
                            {provider.isOnline ? 'En Línea' : 'Desconectado'}
                          </span>
                          
                          {provider.service && provider.service.availableSlots > 0 && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              <Calendar className="w-3 h-3" />
                              {provider.service.availableSlots} slots
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <button className="p-2 rounded-lg glass hover:bg-gray-50 transition-colors">
                            <MessageCircle className="w-4 h-4 text-gray-600" />
                          </button>
                          <button className="p-2 rounded-lg glass hover:bg-gray-50 transition-colors">
                            <Phone className="w-4 h-4 text-gray-600" />
                          </button>
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}