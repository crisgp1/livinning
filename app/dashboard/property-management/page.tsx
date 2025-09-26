'use client'

import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Building,
  PlusCircle,
  BarChart3,
  Settings,
  Eye,
  Sparkles,
  Filter,
  Search,
  Grid3X3,
  List,
  Star,
  Globe,
  TrendingUp,
  Edit,
  Trash2,
  MoreHorizontal,
  Home,
  DollarSign
} from 'lucide-react'

interface Property {
  id: string
  title: string
  price: { amount: number; currency: string }
  propertyType: string
  transactionType: 'sale' | 'rent'
  address: { city: string; state: string }
  images: string[]
  status: 'draft' | 'published' | 'suspended'
  createdAt: string
  features: {
    bedrooms: number
    bathrooms: number
    squareMeters: number
  }
  views?: number
  inquiries?: number
  isHighlighted?: boolean
}

interface PropertyStats {
  totalProperties: number
  activeProperties: number
  draftProperties: number
  suspendedProperties: number
  totalViews: number
  totalInquiries: number
  featuredProperties: number
}

type PropertyFilter = 'all' | 'sale' | 'rent'
type PropertyStatusFilter = 'all' | 'active' | 'inactive' | 'draft'
type ViewMode = 'grid' | 'list'

export default function PropertyManagementDashboard() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [properties, setProperties] = useState<Property[]>([])
  const [stats, setStats] = useState<PropertyStats>({
    totalProperties: 0,
    activeProperties: 0,
    draftProperties: 0,
    suspendedProperties: 0,
    totalViews: 0,
    totalInquiries: 0,
    featuredProperties: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [propertyFilter, setPropertyFilter] = useState<PropertyFilter>('all')
  const [statusFilter, setStatusFilter] = useState<PropertyStatusFilter>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')

  useEffect(() => {
    if (isLoaded && user) {
      fetchPropertyData()
    }
  }, [user, isLoaded, propertyFilter, statusFilter])

  const fetchPropertyData = async () => {
    try {
      setIsLoading(true)

      // Build query parameters
      const params = new URLSearchParams()
      if (propertyFilter !== 'all') params.append('type', propertyFilter)
      if (statusFilter !== 'all') {
        if (statusFilter === 'active') params.append('status', 'published')
        else if (statusFilter === 'inactive') params.append('status', 'suspended')
        else if (statusFilter === 'draft') params.append('status', 'draft')
      }

      const propertiesResponse = await fetch(`/api/dashboard/properties?${params.toString()}`)
      if (propertiesResponse.ok) {
        const propertiesData = await propertiesResponse.json()
        setProperties(propertiesData.data || [])
      }

      const statsResponse = await fetch('/api/dashboard/property-stats')
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData.data || stats)
      }
    } catch (error) {
      console.error('Error fetching property data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredProperties = properties.filter(property => {
    const matchesSearch = property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         property.address.city.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  const handleDeleteProperty = async (propertyId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta propiedad?')) return

    try {
      const response = await fetch(`/api/properties/${propertyId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setProperties(properties.filter(p => p.id !== propertyId))
        fetchPropertyData()
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
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 mb-4"
              >
                <div className="p-2 rounded-lg glass">
                  <Building className="w-5 h-5 text-primary" />
                </div>
                <span className="text-sm font-medium text-primary">Gestión de Propiedades</span>
              </motion.div>
              <h1 className="text-3xl lg:text-4xl font-light mb-2 text-gray-900">
                Panel de Anunciante
              </h1>
              <p className="text-lg text-gray-600">
                Administra todas tus propiedades desde un solo lugar
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <motion.button
                onClick={() => router.push('/publish')}
                className="btn-primary flex items-center gap-3 justify-center"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <PlusCircle size={20} />
                Publicar Propiedad
              </motion.button>
              <motion.button
                onClick={() => router.push('/services')}
                className="btn-secondary flex items-center gap-3 justify-center"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Sparkles size={20} />
                Destacar Propiedades
              </motion.button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="flex items-center gap-6 border-b border-gray-200">
            {[
              { id: 'properties', label: 'Propiedades', icon: Building, active: true },
              { id: 'featured', label: 'Destacados', icon: Star },
              { id: 'microsites', label: 'Micrositios', icon: Globe },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 },
            ].map((tab) => (
              <button
                key={tab.id}
                className={`flex items-center gap-2 pb-4 px-1 border-b-2 transition-colors ${
                  tab.active
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon size={18} />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          {[
            {
              label: 'Total',
              value: stats.totalProperties,
              sublabel: 'Propiedades',
              icon: Building,
              color: 'from-blue-500 to-cyan-500'
            },
            {
              label: 'Activas',
              value: stats.activeProperties,
              sublabel: 'Publicadas',
              icon: Home,
              color: 'from-green-500 to-emerald-500'
            },
            {
              label: 'Borradores',
              value: stats.draftProperties,
              sublabel: 'En proceso',
              icon: Edit,
              color: 'from-orange-500 to-red-500'
            },
            {
              label: 'Vistas',
              value: stats.totalViews,
              sublabel: 'Este mes',
              icon: Eye,
              color: 'from-purple-500 to-pink-500'
            }
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

        {/* Filters */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6">
            {/* Property Type Filter */}
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Tipo:</span>
              <div className="flex items-center gap-1">
                {[
                  { id: 'all', label: 'Todos' },
                  { id: 'sale', label: 'Comprar' },
                  { id: 'rent', label: 'Rentar' }
                ].map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => setPropertyFilter(filter.id as PropertyFilter)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      propertyFilter === filter.id
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Estado:</span>
              <div className="flex items-center gap-1">
                {[
                  { id: 'all', label: 'Todos' },
                  { id: 'active', label: 'Activos' },
                  { id: 'inactive', label: 'Inactivos' },
                  { id: 'draft', label: 'Borradores' }
                ].map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => setStatusFilter(filter.id as PropertyStatusFilter)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      statusFilter === filter.id
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Search */}
            <div className="flex-1 lg:max-w-sm">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar propiedades..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Grid3X3 size={16} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Properties Content */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-gray-200 border-t-primary rounded-full animate-spin"></div>
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="glass-icon-container rounded-2xl p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-6 glass rounded-2xl flex items-center justify-center">
              <Building className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium mb-2 text-gray-900">
              {searchQuery ? 'No se encontraron propiedades' : 'No hay propiedades'}
            </h3>
            <p className="text-sm mb-6 text-gray-600">
              {searchQuery
                ? 'Intenta con otros términos de búsqueda'
                : 'Comienza publicando tu primera propiedad para aparecer como agencia verificada'
              }
            </p>
            {!searchQuery && (
              <button
                onClick={() => router.push('/publish')}
                className="btn-primary shadow-lg shadow-primary/20"
              >
                Publicar Primera Propiedad
              </button>
            )}
          </div>
        ) : (
          <div className={viewMode === 'grid'
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            : "space-y-4"
          }>
            {filteredProperties.map((property, index) => (
              <motion.div
                key={property.id}
                className={`glass-icon-container rounded-2xl overflow-hidden group hover:shadow-xl transition-all duration-300 ${
                  viewMode === 'list' ? 'flex items-center gap-6 p-4' : ''
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: viewMode === 'grid' ? -4 : 0 }}
              >
                {/* Property Image */}
                <div className={`bg-gray-100 relative overflow-hidden ${
                  viewMode === 'grid'
                    ? 'aspect-video rounded-t-xl'
                    : 'w-32 h-24 rounded-xl flex-shrink-0'
                }`}>
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

                  {/* Status Badge */}
                  <div className="absolute top-3 right-3">
                    <div className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                      property.status === 'published'
                        ? 'bg-green-100 text-green-700 border border-green-200'
                        : property.status === 'draft'
                        ? 'bg-orange-100 text-orange-700 border border-orange-200'
                        : 'bg-red-100 text-red-700 border border-red-200'
                    }`}>
                      {property.status === 'published' ? 'Activa'
                       : property.status === 'draft' ? 'Borrador'
                       : 'Suspendida'}
                    </div>
                  </div>

                  {/* Highlight Badge */}
                  {property.isHighlighted && (
                    <div className="absolute top-3 left-3">
                      <div className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 border border-yellow-200">
                        Destacada
                      </div>
                    </div>
                  )}
                </div>

                {/* Property Details */}
                <div className={`bg-white/50 backdrop-blur-sm ${
                  viewMode === 'grid' ? 'p-6' : 'flex-1'
                }`}>
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium line-clamp-1 text-gray-900 flex-1">
                      {property.title}
                    </h3>
                    <button className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
                      <MoreHorizontal size={16} className="text-gray-400" />
                    </button>
                  </div>

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

                  {/* Performance Metrics */}
                  {(property.views || property.inquiries) && (
                    <div className="flex items-center gap-4 mb-4 text-xs text-gray-600">
                      {property.views && (
                        <div className="flex items-center gap-1">
                          <Eye size={12} />
                          <span>{property.views} vistas</span>
                        </div>
                      )}
                      {property.inquiries && (
                        <div className="flex items-center gap-1">
                          <DollarSign size={12} />
                          <span>{property.inquiries} consultas</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => router.push(`/properties/${property.id}`)}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-all duration-200 shadow-sm"
                    >
                      Ver
                    </button>
                    <button
                      onClick={() => router.push(`/dashboard/property-management/${property.id}/edit`)}
                      className="py-2.5 px-4 rounded-xl bg-white/50 backdrop-blur-sm border border-gray-200 text-gray-700 text-sm font-medium hover:bg-white hover:shadow-sm transition-all duration-200"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDeleteProperty(property.id)}
                      className="py-2.5 px-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-medium hover:bg-red-100 transition-all duration-200"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}