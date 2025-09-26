'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Building2,
  Search,
  Filter,
  RefreshCw,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar,
  MapPin,
  DollarSign,
  Bed,
  Bath,
  Square,
  MessageSquare,
  User,
  Mail,
  Clock
} from 'lucide-react'
import Modal from '@/components/ui/Modal'
import { useModal } from '@/hooks/useModal'

interface Property {
  _id: string
  title: string
  description: string
  price: number
  currency: string
  propertyType: string
  transactionType: string
  bedrooms: number
  bathrooms: number
  area: number
  location: {
    address: string
    city: string
    state: string
    country: string
    coordinates?: [number, number]
  }
  images: string[]
  amenities: string[]
  status: string
  ownerEmail: string
  ownerName?: string
  createdAt: string
  updatedAt: string
  moderationNotes?: Array<{
    note: string
    date: string
    moderator: string
  }>
  moderatedBy?: string
  moderatedAt?: string
}

interface ModerationStats {
  totalProperties: number
  pendingModeration: number
  approved: number
  rejected: number
  changesRequested: number
}

const PROPERTY_STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  under_review: 'bg-blue-100 text-blue-800 border-blue-200',
  active: 'bg-green-100 text-green-800 border-green-200',
  rejected: 'bg-red-100 text-red-800 border-red-200',
  changes_requested: 'bg-orange-100 text-orange-800 border-orange-200',
  inactive: 'bg-gray-100 text-gray-800 border-gray-200'
}

export default function PropertyModerationPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [properties, setProperties] = useState<Property[]>([])
  const [stats, setStats] = useState<ModerationStats | null>(null)
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [moderationNotes, setModerationNotes] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('pending')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  const {
    isOpen: showPropertyModal,
    openModal: openPropertyModal,
    closeModal: closePropertyModal
  } = useModal()

  const {
    isOpen: showModerationModal,
    openModal: openModerationModal,
    closeModal: closeModerationModal
  } = useModal()

  useEffect(() => {
    if (isLoaded && user) {
      const metadata = user.publicMetadata as any

      const isHelpdesk = metadata?.role === 'helpdesk'
      const isSuperAdmin = metadata?.isSuperAdmin === true ||
        metadata?.role === 'superadmin' ||
        user.emailAddresses?.some(email => email.emailAddress === 'cristiangp2001@gmail.com')

      if (!isHelpdesk && !isSuperAdmin) {
        router.push('/')
        return
      }

      fetchProperties()
    } else if (isLoaded && !user) {
      router.push('/sign-in')
    }
  }, [user, isLoaded, router, statusFilter, searchTerm, currentPage])

  const fetchProperties = async () => {
    try {
      setLoading(true)

      const params = new URLSearchParams()
      params.set('status', statusFilter)
      if (searchTerm) params.set('search', searchTerm)
      params.set('limit', '20')
      params.set('skip', ((currentPage - 1) * 20).toString())

      const response = await fetch(`/api/helpdesk/properties?${params.toString()}`)
      const data = await response.json()

      if (data.success) {
        setProperties(data.data.properties)
        setTotalCount(data.data.totalCount)

        // Calculate stats
        const pending = data.data.properties.filter((p: Property) =>
          p.status === 'pending' || p.status === 'under_review'
        ).length
        const approved = data.data.properties.filter((p: Property) => p.status === 'active').length
        const rejected = data.data.properties.filter((p: Property) => p.status === 'rejected').length
        const changesRequested = data.data.properties.filter((p: Property) =>
          p.status === 'changes_requested'
        ).length

        setStats({
          totalProperties: data.data.totalCount,
          pendingModeration: pending,
          approved,
          rejected,
          changesRequested
        })
      }
    } catch (error) {
      console.error('Error fetching properties:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleModerationAction = async (propertyId: string, action: 'approve' | 'reject' | 'request_changes') => {
    try {
      setActionLoading(action)

      const response = await fetch('/api/helpdesk/properties', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          propertyId,
          action,
          notes: moderationNotes
        })
      })

      const data = await response.json()

      if (data.success) {
        await fetchProperties() // Refresh the list
        closeModerationModal()
        setModerationNotes('')
        setSelectedProperty(null)
      } else {
        console.error('Error performing moderation action:', data.error)
      }
    } catch (error) {
      console.error('Error performing moderation action:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const openPropertyDetails = (property: Property) => {
    setSelectedProperty(property)
    openPropertyModal()
  }

  const openModerationActions = (property: Property) => {
    setSelectedProperty(property)
    setModerationNotes('')
    openModerationModal()
  }

  const formatPrice = (price: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: currency.toUpperCase(),
      minimumFractionDigits: 0
    }).format(price)
  }

  const filteredProperties = properties.filter(property => {
    if (!searchTerm) return true

    return (
      property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.location.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.location.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.ownerEmail.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  const totalPages = Math.ceil(totalCount / 20)

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-primary rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Moderación de Propiedades</h1>
              <p className="text-gray-600 mt-1">
                Revisa y aprueba propiedades pendientes de publicación
              </p>
            </div>
            <button
              onClick={fetchProperties}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="text-2xl font-bold mb-1 text-gray-900">
                {stats.totalProperties}
              </div>
              <div className="text-sm text-gray-600">Total Propiedades</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500">
                  <Clock className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="text-2xl font-bold mb-1 text-gray-900">
                {stats.pendingModeration}
              </div>
              <div className="text-sm text-gray-600">Pendientes</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="text-2xl font-bold mb-1 text-gray-900">
                {stats.approved}
              </div>
              <div className="text-sm text-gray-600">Aprobadas</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-red-500 to-pink-500">
                  <XCircle className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="text-2xl font-bold mb-1 text-gray-900">
                {stats.rejected}
              </div>
              <div className="text-sm text-gray-600">Rechazadas</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-red-500">
                  <AlertCircle className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="text-2xl font-bold mb-1 text-gray-900">
                {stats.changesRequested}
              </div>
              <div className="text-sm text-gray-600">Cambios Solicitados</div>
            </motion.div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Buscar Propiedades</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Título, dirección, propietario..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Estado de Moderación</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
              >
                <option value="pending">Pendientes</option>
                <option value="all">Todos los Estados</option>
                <option value="active">Aprobadas</option>
                <option value="rejected">Rechazadas</option>
                <option value="changes_requested">Cambios Solicitados</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('')
                  setStatusFilter('pending')
                  setCurrentPage(1)
                }}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Limpiar Filtros
              </button>
            </div>
          </div>

          <div className="mt-4 flex justify-between items-center">
            <span className="text-sm text-gray-600">
              Mostrando {filteredProperties.length} de {totalCount} propiedades
            </span>
            <div className="text-sm text-gray-500">
              Página {currentPage} de {totalPages}
            </div>
          </div>
        </div>

        {/* Properties Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredProperties.map((property) => (
            <motion.div
              key={property._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Property Image */}
              <div className="relative h-48 bg-gray-200">
                {property.images && property.images.length > 0 ? (
                  <img
                    src={property.images[0]}
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Building2 className="w-12 h-12 text-gray-400" />
                  </div>
                )}

                {/* Status Badge */}
                <div className="absolute top-3 right-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    PROPERTY_STATUS_COLORS[property.status as keyof typeof PROPERTY_STATUS_COLORS] ||
                    PROPERTY_STATUS_COLORS.pending
                  }`}>
                    {property.status}
                  </span>
                </div>
              </div>

              {/* Property Info */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                    {property.title}
                  </h3>
                  <div className="text-lg font-bold text-primary">
                    {formatPrice(property.price, property.currency)}
                  </div>
                </div>

                <div className="flex items-center text-gray-600 text-sm mb-3">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span className="truncate">
                    {property.location.city}, {property.location.state}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-1">
                    <Bed className="w-4 h-4" />
                    <span>{property.bedrooms}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Bath className="w-4 h-4" />
                    <span>{property.bathrooms}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Square className="w-4 h-4" />
                    <span>{property.area}m²</span>
                  </div>
                </div>

                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <User className="w-4 h-4 mr-2" />
                  <span className="truncate">{property.ownerEmail}</span>
                </div>

                <div className="flex items-center text-xs text-gray-500 mb-4">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>
                    Creada: {new Date(property.createdAt).toLocaleDateString('es-ES')}
                  </span>
                </div>

                {/* Moderation Notes */}
                {property.moderationNotes && property.moderationNotes.length > 0 && (
                  <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center gap-2 text-sm font-medium text-yellow-800 mb-1">
                      <MessageSquare className="w-4 h-4" />
                      Notas de Moderación
                    </div>
                    <div className="text-sm text-yellow-700">
                      {property.moderationNotes[property.moderationNotes.length - 1].note}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => openPropertyDetails(property)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Eye size={16} />
                    Ver Detalles
                  </button>

                  {(property.status === 'pending' || property.status === 'under_review') && (
                    <button
                      onClick={() => openModerationActions(property)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                    >
                      <CheckCircle size={16} />
                      Moderar
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-8">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>

            <span className="text-sm text-gray-600">
              Página {currentPage} de {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
        )}

        {filteredProperties.length === 0 && !loading && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <Building2 className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron propiedades</h3>
            <p className="text-gray-600">
              {searchTerm || statusFilter !== 'all'
                ? 'No hay propiedades que coincidan con los filtros aplicados.'
                : 'No hay propiedades disponibles para moderar.'
              }
            </p>
          </div>
        )}
      </div>

      {/* Property Details Modal */}
      <Modal
        isOpen={showPropertyModal}
        onClose={closePropertyModal}
        title={selectedProperty?.title || 'Detalles de la Propiedad'}
        size="lg"
      >
        {selectedProperty && (
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Precio</label>
                <p className="text-2xl font-bold text-primary">
                  {formatPrice(selectedProperty.price, selectedProperty.currency)}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                <p className="text-gray-900">
                  {selectedProperty.propertyType} - {selectedProperty.transactionType}
                </p>
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación</label>
              <p className="text-gray-900">{selectedProperty.location.address}</p>
              <p className="text-sm text-gray-600">
                {selectedProperty.location.city}, {selectedProperty.location.state}, {selectedProperty.location.country}
              </p>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <Bed className="w-6 h-6 mx-auto mb-2 text-gray-600" />
                <div className="text-lg font-semibold">{selectedProperty.bedrooms}</div>
                <div className="text-sm text-gray-600">Habitaciones</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <Bath className="w-6 h-6 mx-auto mb-2 text-gray-600" />
                <div className="text-lg font-semibold">{selectedProperty.bathrooms}</div>
                <div className="text-sm text-gray-600">Baños</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <Square className="w-6 h-6 mx-auto mb-2 text-gray-600" />
                <div className="text-lg font-semibold">{selectedProperty.area}</div>
                <div className="text-sm text-gray-600">m²</div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
              <p className="text-gray-900 bg-gray-50 p-4 rounded-lg">
                {selectedProperty.description}
              </p>
            </div>

            {/* Owner Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Propietario</label>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-900">{selectedProperty.ownerEmail}</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado Actual</label>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  PROPERTY_STATUS_COLORS[selectedProperty.status as keyof typeof PROPERTY_STATUS_COLORS] ||
                  PROPERTY_STATUS_COLORS.pending
                }`}>
                  {selectedProperty.status}
                </span>
              </div>
            </div>

            {/* Moderation History */}
            {selectedProperty.moderationNotes && selectedProperty.moderationNotes.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Historial de Moderación</label>
                <div className="space-y-3 max-h-40 overflow-y-auto">
                  {selectedProperty.moderationNotes.map((note, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">{note.note}</p>
                      <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                        <span>Por: {note.moderator}</span>
                        <span>{new Date(note.date).toLocaleDateString('es-ES')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-4 border-t border-gray-100">
              <button
                onClick={closePropertyModal}
                className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Moderation Actions Modal */}
      <Modal
        isOpen={showModerationModal}
        onClose={closeModerationModal}
        title="Acciones de Moderación"
        size="md"
      >
        {selectedProperty && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {selectedProperty.title}
              </h3>
              <p className="text-sm text-gray-600">
                {selectedProperty.location.address}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Notas de Moderación (opcional)
              </label>
              <textarea
                value={moderationNotes}
                onChange={(e) => setModerationNotes(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary resize-none"
                placeholder="Agrega comentarios sobre la moderación..."
              />
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => handleModerationAction(selectedProperty._id, 'approve')}
                disabled={actionLoading === 'approve'}
                className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {actionLoading === 'approve' ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <CheckCircle size={20} />
                )}
                Aprobar Propiedad
              </button>

              <button
                onClick={() => handleModerationAction(selectedProperty._id, 'request_changes')}
                disabled={actionLoading === 'request_changes'}
                className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
              >
                {actionLoading === 'request_changes' ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <AlertCircle size={20} />
                )}
                Solicitar Cambios
              </button>

              <button
                onClick={() => handleModerationAction(selectedProperty._id, 'reject')}
                disabled={actionLoading === 'reject'}
                className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {actionLoading === 'reject' ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <XCircle size={20} />
                )}
                Rechazar Propiedad
              </button>
            </div>

            <div className="flex justify-between pt-4 border-t border-gray-100">
              <button
                onClick={closeModerationModal}
                className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}