'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuthContext } from '@/components/providers/AuthProvider'
import {
  Calendar,
  Clock,
  DollarSign,
  Eye,
  Filter,
  MapPin,
  MessageCircle,
  Phone,
  RefreshCw,
  Search,
  Star,
  TrendingUp,
  User,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Package,
  FileText,
  MessageSquare,
  ChevronRight,
  Download
} from 'lucide-react'

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
  status: string
  estimatedDelivery?: string
  actualDelivery?: string
  deliverables: string[]
  notes: string[]
  createdAt: string
  updatedAt: string
  customerEmail?: string
  customerName?: string
}

interface OrderStats {
  pending: { count: number; totalAmount: number }
  confirmed: { count: number; totalAmount: number }
  in_progress: { count: number; totalAmount: number }
  completed: { count: number; totalAmount: number }
  cancelled: { count: number; totalAmount: number }
}

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
  in_progress: 'bg-orange-100 text-orange-800 border-orange-200',
  completed: 'bg-green-100 text-green-800 border-green-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200'
}

const STATUS_ICONS = {
  pending: AlertCircle,
  confirmed: CheckCircle2,
  in_progress: RefreshCw,
  completed: Package,
  cancelled: XCircle
}

const STATUS_LABELS = {
  pending: 'Pendiente',
  confirmed: 'Confirmado',
  in_progress: 'En Progreso',
  completed: 'Completado',
  cancelled: 'Cancelado'
}

export default function ProviderOrdersPage() {
  const { user, isLoaded, hasProviderAccess } = useAuthContext()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState<ServiceOrder[]>([])
  const [stats, setStats] = useState<OrderStats | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [serviceTypeFilter, setServiceTypeFilter] = useState<string>('')
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [selectedOrder, setSelectedOrder] = useState<ServiceOrder | null>(null)
  const [showOrderModal, setShowOrderModal] = useState(false)
  const [noteText, setNoteText] = useState('')

  useEffect(() => {
    const checkAccess = async () => {
      if (!isLoaded) return

      if (!user) {
        router.push('/')
        return
      }

      if (!hasProviderAccess) {
        router.push('/dashboard')
        return
      }

      setLoading(false)
      await fetchOrders()
    }

    checkAccess()
  }, [isLoaded, user, hasProviderAccess, router])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (statusFilter) params.append('status', statusFilter)
      if (serviceTypeFilter) params.append('serviceType', serviceTypeFilter)
      params.append('limit', '50')

      const response = await fetch(`/api/services/provider-orders?${params.toString()}`)
      const result = await response.json()

      if (result.success) {
        setOrders(result.data || [])
        setStats(result.stats || null)
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateOrderStatus = async (orderId: string, status: string, note?: string) => {
    try {
      const response = await fetch('/api/services/update-order-status', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          status,
          note: note || `Estado actualizado a ${STATUS_LABELS[status as keyof typeof STATUS_LABELS]}`
        })
      })

      const result = await response.json()

      if (result.success) {
        await fetchOrders()
        setShowOrderModal(false)
        setSelectedOrder(null)
      } else {
        alert(result.error || 'Error al actualizar el estado')
      }
    } catch (error) {
      console.error('Error updating order status:', error)
      alert('Error al actualizar el estado')
    }
  }

  const handleAddNote = async (orderId: string, note: string) => {
    try {
      const response = await fetch('/api/services/add-order-note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, note })
      })

      const result = await response.json()

      if (result.success) {
        await fetchOrders()
        // Update selected order if it's open
        if (selectedOrder?.id === orderId) {
          const updatedOrder = orders.find(o => o.id === orderId)
          if (updatedOrder) setSelectedOrder(updatedOrder)
        }
        setNoteText('')
      } else {
        alert(result.error || 'Error al agregar la nota')
      }
    } catch (error) {
      console.error('Error adding note:', error)
      alert('Error al agregar la nota')
    }
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch = !searchTerm ||
      order.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.propertyAddress.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesSearch
  }).sort((a, b) => {
    const aValue = a[sortBy as keyof ServiceOrder]
    const bValue = b[sortBy as keyof ServiceOrder]

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1
    }
    return aValue < bValue ? 1 : -1
  })

  if (loading || !isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!hasProviderAccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Acceso Denegado</h1>
          <p className="text-gray-600 mb-6">No tienes permisos para acceder al dashboard de proveedores.</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Ir al Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <main className="pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

            {/* Header */}
            <div className="mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-light mb-2 text-gray-900">Órdenes de Trabajo</h1>
                  <p className="text-gray-600">Gestiona todas tus órdenes de servicio</p>
                </div>
                <button
                  onClick={fetchOrders}
                  disabled={loading}
                  className="btn-primary flex items-center gap-2"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  Actualizar
                </button>
              </div>
            </div>

            {/* Stats Cards */}
            {stats && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                {Object.entries(stats).map(([status, data]) => {
                  const IconComponent = STATUS_ICONS[status as keyof typeof STATUS_ICONS]
                  return (
                    <motion.div
                      key={status}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="glass-card p-6 hover:shadow-lg transition-shadow"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className={`p-3 rounded-xl ${STATUS_COLORS[status as keyof typeof STATUS_COLORS]}`}>
                          <IconComponent className="h-5 w-5" />
                        </div>
                      </div>
                      <div className="text-2xl font-light mb-1 text-gray-900">{data.count}</div>
                      <div className="text-sm text-gray-600 mb-1">{STATUS_LABELS[status as keyof typeof STATUS_LABELS]}</div>
                      <div className="text-xs text-gray-500">${data.totalAmount.toFixed(2)}</div>
                    </motion.div>
                  )
                })}
              </div>
            )}

            {/* Filters */}
            <div className="glass-card p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Buscar</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Cliente, servicio, dirección..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                  >
                    <option value="">Todos los estados</option>
                    <option value="pending">Pendiente</option>
                    <option value="confirmed">Confirmado</option>
                    <option value="in_progress">En Progreso</option>
                    <option value="completed">Completado</option>
                    <option value="cancelled">Cancelado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ordenar por</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                  >
                    <option value="createdAt">Fecha de creación</option>
                    <option value="amount">Monto</option>
                    <option value="preferredDate">Fecha preferida</option>
                    <option value="status">Estado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Orden</label>
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                  >
                    <option value="desc">Descendente</option>
                    <option value="asc">Ascendente</option>
                  </select>
                </div>
              </div>

              <div className="mt-4 flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  Mostrando {filteredOrders.length} de {orders.length} órdenes
                </span>
                <button
                  onClick={() => {
                    setSearchTerm('')
                    setStatusFilter('')
                    setServiceTypeFilter('')
                    setSortBy('createdAt')
                    setSortOrder('desc')
                  }}
                  className="text-sm text-primary hover:text-primary-dark"
                >
                  Limpiar filtros
                </button>
              </div>
            </div>

            {/* Orders List */}
            <div className="space-y-4">
              {filteredOrders.length === 0 ? (
                <div className="glass-card p-12 text-center">
                  <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No hay órdenes</h3>
                  <p className="text-gray-600">
                    {searchTerm || statusFilter ? 'No se encontraron órdenes con los filtros aplicados.' : 'Aún no tienes órdenes de trabajo asignadas.'}
                  </p>
                </div>
              ) : (
                filteredOrders.map((order) => {
                  const StatusIcon = STATUS_ICONS[order.status as keyof typeof STATUS_ICONS]

                  return (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="glass-card p-6 hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => {
                        setSelectedOrder(order)
                        setShowOrderModal(true)
                      }}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-4 flex-1">
                          <div className={`p-3 rounded-xl ${STATUS_COLORS[order.status as keyof typeof STATUS_COLORS]}`}>
                            <StatusIcon className="h-5 w-5" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h3 className="font-medium text-gray-900 mb-1">{order.serviceName}</h3>
                                <p className="text-sm text-gray-600 mb-2">{order.serviceDescription}</p>
                              </div>
                              <div className="text-right">
                                <div className="text-2xl font-semibold text-green-600">
                                  ${order.amount.toFixed(2)} {order.currency}
                                </div>
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${STATUS_COLORS[order.status as keyof typeof STATUS_COLORS]}`}>
                                  {STATUS_LABELS[order.status as keyof typeof STATUS_LABELS]}
                                </span>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                <span>{order.customerName || 'Cliente sin nombre'}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                <span className="truncate">{order.propertyAddress}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                <span>{new Date(order.preferredDate).toLocaleDateString('es-ES')}</span>
                              </div>
                            </div>

                            {order.specialRequests && (
                              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-700">
                                  <strong>Solicitudes especiales:</strong> {order.specialRequests}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
                      </div>

                      <div className="flex items-center justify-between text-xs text-gray-500 border-t pt-3">
                        <span>Creado: {new Date(order.createdAt).toLocaleDateString('es-ES')}</span>
                        <div className="flex items-center gap-4">
                          {order.notes.length > 0 && (
                            <span className="flex items-center gap-1">
                              <MessageCircle className="h-3 w-3" />
                              {order.notes.length} nota{order.notes.length !== 1 ? 's' : ''}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {order.contactPhone}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Order Detail Modal */}
      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-light text-gray-900 mb-2">{selectedOrder.serviceName}</h2>
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${STATUS_COLORS[selectedOrder.status as keyof typeof STATUS_COLORS]}`}>
                      {STATUS_LABELS[selectedOrder.status as keyof typeof STATUS_LABELS]}
                    </span>
                    <span className="text-gray-500">ID: {selectedOrder.id}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <div className="text-2xl font-semibold text-green-600">
                      ${selectedOrder.amount.toFixed(2)} {selectedOrder.currency}
                    </div>
                  </div>
                  <button
                    onClick={() => setShowOrderModal(false)}
                    className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                  >
                    <XCircle className="h-6 w-6" />
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Customer Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Información del Cliente</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span>{selectedOrder.customerName || 'Cliente sin nombre'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span>{selectedOrder.contactPhone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span>{selectedOrder.propertyAddress}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Detalles del Servicio</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span>Fecha preferida: {new Date(selectedOrder.preferredDate).toLocaleDateString('es-ES')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span>Creado: {new Date(selectedOrder.createdAt).toLocaleDateString('es-ES')}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Service Description */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Descripción del Servicio</h3>
                <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{selectedOrder.serviceDescription}</p>
              </div>

              {/* Special Requests */}
              {selectedOrder.specialRequests && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Solicitudes Especiales</h3>
                  <p className="text-gray-700 bg-yellow-50 p-4 rounded-lg border border-yellow-200">{selectedOrder.specialRequests}</p>
                </div>
              )}

              {/* Status Actions */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Actualizar Estado</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <button
                    onClick={() => handleUpdateOrderStatus(selectedOrder.id, 'confirmed', 'Orden confirmada por el proveedor')}
                    disabled={selectedOrder.status !== 'pending'}
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Confirmar
                  </button>
                  <button
                    onClick={() => handleUpdateOrderStatus(selectedOrder.id, 'in_progress', 'Trabajo iniciado')}
                    disabled={!['confirmed'].includes(selectedOrder.status)}
                    className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Iniciar
                  </button>
                  <button
                    onClick={() => handleUpdateOrderStatus(selectedOrder.id, 'completed', 'Trabajo completado satisfactoriamente')}
                    disabled={selectedOrder.status !== 'in_progress'}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Completar
                  </button>
                  <button
                    onClick={() => handleUpdateOrderStatus(selectedOrder.id, 'cancelled', 'Orden cancelada por el proveedor')}
                    disabled={selectedOrder.status === 'completed'}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancelar
                  </button>
                </div>
              </div>

              {/* Notes Section */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Notas ({selectedOrder.notes.length})</h3>
                <div className="space-y-3 max-h-40 overflow-y-auto">
                  {selectedOrder.notes.map((note, index) => (
                    <div key={index} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-gray-700">{note}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Agregar una nota..."
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && noteText.trim()) {
                          handleAddNote(selectedOrder.id, noteText.trim())
                        }
                      }}
                    />
                    <button
                      onClick={() => {
                        if (noteText.trim()) {
                          handleAddNote(selectedOrder.id, noteText.trim())
                        }
                      }}
                      className="btn-primary px-6"
                    >
                      Agregar
                    </button>
                  </div>
                </div>
              </div>

              {/* Deliverables */}
              {selectedOrder.deliverables.length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Entregables</h3>
                  <div className="space-y-2">
                    {selectedOrder.deliverables.map((deliverable, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-gray-700">{deliverable}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </main>
  )
}