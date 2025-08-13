'use client'

import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Building,
  Search,
  Filter,
  Eye,
  Edit3,
  Trash2,
  Plus,
  Calendar,
  MapPin,
  DollarSign,
  Home,
  Sparkles,
  TrendingUp
} from 'lucide-react'

interface Property {
  id: string
  title: string
  price: { amount: number; currency: string } | number
  propertyType: string
  address: { city: string; state: string; street?: string; country?: string }
  images: string[]
  status: string
  createdAt: string
  features: {
    bedrooms: number
    bathrooms: number
    squareMeters: number
  }
}

export default function DashboardProperties() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [properties, setProperties] = useState<Property[]>([])
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    if (isLoaded && user) {
      fetchProperties()
    }
  }, [user, isLoaded])

  const fetchProperties = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/dashboard/properties')
      if (response.ok) {
        const data = await response.json()
        const propertiesData = data.data || []
        
        // Map the API response to our interface
        const mappedProperties = Array.isArray(propertiesData) ? propertiesData.map((prop: any) => ({
          id: prop.id || prop._id,
          title: prop.title || '',
          price: prop.price || { amount: 0, currency: 'EUR' },
          propertyType: prop.propertyType?.value || prop.propertyType || '',
          address: {
            city: prop.address?.city || '',
            state: prop.address?.state || '',
            street: prop.address?.street || '',
            country: prop.address?.country || ''
          },
          images: prop.images || [],
          status: prop.status || 'draft',
          createdAt: prop.createdAt || new Date().toISOString(),
          features: {
            bedrooms: prop.features?.bedrooms || 0,
            bathrooms: prop.features?.bathrooms || 0,
            squareMeters: prop.features?.squareMeters || 0
          }
        })) : []
        
        setProperties(mappedProperties)
      }
    } catch (error) {
      console.error('Error fetching properties:', error)
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
      } else {
        alert('Error al eliminar la propiedad')
      }
    } catch (error) {
      console.error('Error deleting property:', error)
      alert('Error al eliminar la propiedad')
    }
  }

  // Filter properties
  useEffect(() => {
    let filtered = properties

    if (searchTerm) {
      filtered = filtered.filter(property => 
        (property.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (property.address?.city || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (property.address?.state || '').toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(property => property.status === filterStatus)
    }

    setFilteredProperties(filtered)
  }, [searchTerm, filterStatus, properties])

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
                  <Building className="w-5 h-5 text-primary" />
                </div>
                <span className="text-sm font-medium text-primary">Gestión de Propiedades</span>
              </motion.div>
              
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-3xl lg:text-4xl font-light mb-2 text-gray-900">
                    Mis Propiedades
                  </h1>
                  <p className="text-lg text-gray-600">
                    Gestiona todas tus propiedades desde un solo lugar
                  </p>
                </div>
                
                <motion.button
                  onClick={() => router.push('/publish')}
                  className="btn-primary flex items-center gap-3 w-full sm:w-auto justify-center"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Plus size={20} />
                  Nueva Propiedad
                </motion.button>
              </div>
            </div>

            {/* Search and Filters */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-icon-container rounded-2xl p-6 mb-8"
            >
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search Bar */}
                <div className="flex-1 relative group">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                  <input
                    type="text"
                    placeholder="Buscar propiedades..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/50 backdrop-blur-sm border border-gray-200 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                  />
                </div>

                {/* Filter Toggle */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                    showFilters 
                      ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                      : 'bg-white/50 backdrop-blur-sm border border-gray-200 text-gray-700 hover:bg-white hover:shadow-md'
                  }`}
                >
                  <Filter className="w-5 h-5" />
                  Filtros
                </button>
              </div>

              {/* Expanded Filters */}
              {showFilters && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-6 pt-6 border-t border-gray-100"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700">Estado</label>
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-white/50 backdrop-blur-sm border border-gray-200 text-gray-800 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                      >
                        <option value="all">Todas</option>
                        <option value="published">Publicadas</option>
                        <option value="draft">Borradores</option>
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-card p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500">
                    <Building size={20} className="text-white" />
                  </div>
                  <span className="text-xs font-medium text-gray-500">Total</span>
                </div>
                <div className="text-3xl font-light mb-1 text-gray-900">{properties.length}</div>
                <div className="text-sm text-gray-600">Propiedades</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="glass-card p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500">
                    <Home size={20} className="text-white" />
                  </div>
                  <span className="text-xs font-medium text-gray-500">Activas</span>
                </div>
                <div className="text-3xl font-light mb-1 text-gray-900">
                  {properties.filter(p => p.status === 'published').length}
                </div>
                <div className="text-sm text-gray-600">Publicadas</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="glass-card p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-red-500">
                    <Edit3 size={20} className="text-white" />
                  </div>
                  <span className="text-xs font-medium text-gray-500">Borradores</span>
                </div>
                <div className="text-3xl font-light mb-1 text-gray-900">
                  {properties.filter(p => p.status === 'draft').length}
                </div>
                <div className="text-sm text-gray-600">En proceso</div>
              </motion.div>
            </div>

            {/* Properties Table */}
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-2 border-gray-200 border-t-primary rounded-full animate-spin"></div>
              </div>
            ) : filteredProperties.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass-icon-container rounded-2xl p-12 text-center"
              >
                <div className="w-16 h-16 mx-auto mb-6 glass rounded-2xl flex items-center justify-center">
                  <Building className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium mb-2 text-gray-900">
                  {searchTerm || filterStatus !== 'all' ? 'No se encontraron propiedades' : 'No hay propiedades'}
                </h3>
                <p className="text-sm mb-6 text-gray-600">
                  {searchTerm || filterStatus !== 'all' 
                    ? 'Intenta ajustar tus filtros de búsqueda' 
                    : 'Comienza publicando tu primera propiedad'
                  }
                </p>
                {!(searchTerm || filterStatus !== 'all') && (
                  <button
                    onClick={() => router.push('/publish')}
                    className="btn-primary"
                  >
                    Publicar Propiedad
                  </button>
                )}
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="glass-icon-container rounded-2xl overflow-hidden"
              >
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left py-4 px-6 text-sm font-medium text-gray-700">Propiedad</th>
                        <th className="text-left py-4 px-6 text-sm font-medium text-gray-700">Ubicación</th>
                        <th className="text-left py-4 px-6 text-sm font-medium text-gray-700">Precio</th>
                        <th className="text-left py-4 px-6 text-sm font-medium text-gray-700">Estado</th>
                        <th className="text-left py-4 px-6 text-sm font-medium text-gray-700">Fecha</th>
                        <th className="text-left py-4 px-6 text-sm font-medium text-gray-700">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProperties.map((property, index) => (
                        <motion.tr
                          key={property.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="border-b border-gray-50 hover:bg-white/50 transition-colors"
                        >
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
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
                              <div>
                                <div className="font-medium text-gray-900 line-clamp-1">
                                  {property.title}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {property.propertyType}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-1 text-gray-600">
                              <MapPin size={14} />
                              <span className="text-sm">
                                {[property.address?.city, property.address?.state].filter(Boolean).join(', ') || 'Sin ubicación'}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-1 text-gray-900">
                              <DollarSign size={14} />
                              <span className="font-medium">
                                {typeof property.price === 'object' 
                                  ? property.price.amount?.toLocaleString() || '0'
                                  : property.price?.toLocaleString() || '0'
                                }
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                              property.status === 'published' 
                                ? 'bg-green-100 text-green-700 border border-green-200' 
                                : 'bg-orange-100 text-orange-700 border border-orange-200'
                            }`}>
                              {property.status === 'published' ? 'Publicada' : 'Borrador'}
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-1 text-gray-500">
                              <Calendar size={14} />
                              <span className="text-sm">
                                {new Date(property.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => router.push(`/properties/${property.id}`)}
                                className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                                title="Ver propiedad"
                              >
                                <Eye size={16} />
                              </button>
                              <button
                                onClick={() => router.push(`/properties/${property.id}/edit`)}
                                className="p-2 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors"
                                title="Editar propiedad"
                              >
                                <Edit3 size={16} />
                              </button>
                              <button
                                onClick={() => handleDeleteProperty(property.id)}
                                className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                                title="Eliminar propiedad"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
      </div>
    </main>
  )
}