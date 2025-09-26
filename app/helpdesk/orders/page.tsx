'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Package,
  Search,
  RefreshCw,
  Eye,
  User,
  Mail,
  DollarSign,
  Calendar,
  MapPin,
  Phone,
  AlertTriangle,
  MessageSquare,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Plus
} from 'lucide-react'
import Modal from '@/components/ui/Modal'
import { useModal } from '@/hooks/useModal'

interface ServiceOrder {
  _id: string
  orderNumber: string
  serviceName: string
  serviceType: string
  amount: number
  currency: string
  status: string
  clientEmail: string
  clientName?: string
  providerEmail?: string
  providerName?: string
  propertyAddress?: string
  contactPhone?: string
  description?: string
  scheduledDate?: string
  completedDate?: string
  createdAt: string
  updatedAt: string
  escalated?: boolean
  escalatedAt?: string
  escalatedBy?: string
  priority?: string
  notes?: Array<{
    id: string
    note: string
    addedBy: string
    addedByName: string
    addedAt: string
    type: string
  }>
  adminActions?: Array<{
    action: string
    performedBy: string
    performedByName: string
    timestamp: string
    details: string
  }>
  refundRequested?: boolean
  refundAmount?: number
  refundRequestedAt?: string
}

interface OrderStats {
  totalOrders: number
  totalRevenue: number
  avgOrderValue: number
  pendingOrders: number
  inProgressOrders: number
  completedOrders: number
  escalatedOrders: number
  ordersToday: number
  revenueToday: number
}

const ORDER_STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
  in_progress: 'bg-orange-100 text-orange-800 border-orange-200',
  completed: 'bg-green-100 text-green-800 border-green-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
  refund_pending: 'bg-purple-100 text-purple-800 border-purple-200'
}

export default function ServiceOrdersPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [orders, setOrders] = useState<ServiceOrder[]>([])
  const [stats, setStats] = useState<OrderStats | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<ServiceOrder | null>(null)
  const [noteText, setNoteText] = useState('')
  const [refundAmount, setRefundAmount] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [serviceTypeFilter, setServiceTypeFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  const {
    isOpen: showOrderModal,
    openModal: openOrderModal,
    closeModal: closeOrderModal
  } = useModal()

  const {
    isOpen: showActionsModal,
    openModal: openActionsModal,
    closeModal: closeActionsModal
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

      fetchOrders()
    } else if (isLoaded && !user) {
      router.push('/sign-in')
    }
  }, [user, isLoaded, router, statusFilter, serviceTypeFilter, searchTerm, currentPage])

  const fetchOrders = async () => {
    try {
      setLoading(true)

      const params = new URLSearchParams()
      if (statusFilter) params.set('status', statusFilter)
      if (serviceTypeFilter) params.set('serviceType', serviceTypeFilter)
      if (searchTerm) params.set('search', searchTerm)
      params.set('limit', '20')
      params.set('skip', ((currentPage - 1) * 20).toString())

      const response = await fetch(`/api/helpdesk/service-orders?${params.toString()}`)
      const data = await response.json()

      if (data.success) {
        setOrders(data.data.orders)
        setTotalCount(data.data.totalCount)
        setStats(data.data.stats)
      }
    } catch (error) {
      console.error('Error fetching service orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleOrderAction = async (orderId: string, action: string, extraData: any = {}) => {
    try {
      setActionLoading(action)

      const response = await fetch('/api/helpdesk/service-orders', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          action,
          notes: noteText,
          refundAmount: refundAmount ? parseFloat(refundAmount) : undefined,
          ...extraData
        })
      })

      const result = await response.json()

      if (result.success) {
        await fetchOrders() // Refresh the list
        closeActionsModal()
        setNoteText('')
        setRefundAmount('')
        setSelectedOrder(null)
      } else {
        console.error('Error performing order action:', result.error)
      }
    } catch (error) {
      console.error('Error performing order action:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const openOrderDetails = (order: ServiceOrder) => {
    setSelectedOrder(order)
    openOrderModal()
  }

  const openOrderActions = (order: ServiceOrder) => {
    setSelectedOrder(order)
    setNoteText('')
    setRefundAmount('')
    openActionsModal()
  }

  const formatPrice = (price: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: currency.toUpperCase(),
      minimumFractionDigits: 0
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTimeAgo = (dateString: string) => {
    const now = new Date().getTime()
    const date = new Date(dateString).getTime()
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60))

    if (diffInHours < 1) return 'Hace menos de 1 hora'
    if (diffInHours < 24) return `Hace ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`

    const diffInDays = Math.floor(diffInHours / 24)
    return `Hace ${diffInDays} día${diffInDays > 1 ? 's' : ''}`
  }

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
              <h1 className="text-2xl font-bold text-gray-900">Órdenes de Servicios</h1>
              <p className="text-gray-600 mt-1">
                Monitorea y gestiona órdenes de servicios del sistema
              </p>
            </div>
            <button
              onClick={fetchOrders}
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
          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-9 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500">
                  <Package className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="text-2xl font-bold mb-1 text-gray-900">
                {stats.totalOrders}
              </div>
              <div className="text-sm text-gray-600">Total Órdenes</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="text-2xl font-bold mb-1 text-gray-900">
                {formatPrice(stats.totalRevenue)}
              </div>
              <div className="text-sm text-gray-600">Ingresos Totales</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="text-2xl font-bold mb-1 text-gray-900">
                {formatPrice(stats.avgOrderValue)}
              </div>
              <div className="text-sm text-gray-600">Valor Promedio</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500">
                  <Clock className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="text-2xl font-bold mb-1 text-gray-900">
                {stats.pendingOrders}
              </div>
              <div className="text-sm text-gray-600">Pendientes</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500">
                  <Package className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="text-2xl font-bold mb-1 text-gray-900">
                {stats.inProgressOrders}
              </div>
              <div className="text-sm text-gray-600">En Progreso</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-teal-500">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="text-2xl font-bold mb-1 text-gray-900">
                {stats.completedOrders}
              </div>
              <div className="text-sm text-gray-600">Completadas</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-red-500 to-pink-500">
                  <AlertTriangle className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="text-2xl font-bold mb-1 text-gray-900">
                {stats.escalatedOrders}
              </div>
              <div className="text-sm text-gray-600">Escaladas</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="text-2xl font-bold mb-1 text-gray-900">
                {stats.ordersToday}
              </div>
              <div className="text-sm text-gray-600">Hoy</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="text-2xl font-bold mb-1 text-gray-900">
                {formatPrice(stats.revenueToday)}
              </div>
              <div className="text-sm text-gray-600">Ingresos Hoy</div>
            </motion.div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Buscar Órdenes</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Número, cliente, servicio..."
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
                <option value="">Todos los Estados</option>
                <option value="pending">Pendientes</option>
                <option value="confirmed">Confirmadas</option>
                <option value="in_progress">En Progreso</option>
                <option value="completed">Completadas</option>
                <option value="cancelled">Canceladas</option>
                <option value="refund_pending">Reembolso Pendiente</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Servicio</label>
              <select
                value={serviceTypeFilter}
                onChange={(e) => setServiceTypeFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
              >
                <option value="">Todos los Tipos</option>
                <option value="cleaning">Limpieza</option>
                <option value="maintenance">Mantenimiento</option>
                <option value="repair">Reparaciones</option>
                <option value="security">Seguridad</option>
                <option value="landscaping">Jardinería</option>
                <option value="other">Otro</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('')
                  setStatusFilter('')
                  setServiceTypeFilter('')
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
              Mostrando {orders.length} de {totalCount} órdenes
            </span>
            <div className="text-sm text-gray-500">
              Página {currentPage} de {totalPages}
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="divide-y divide-gray-100">
            {orders.map((order) => (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {order.serviceName}
                      </h3>
                      <span className="text-sm font-mono text-gray-500">
                        #{order.orderNumber}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          ORDER_STATUS_COLORS[order.status as keyof typeof ORDER_STATUS_COLORS] ||
                          ORDER_STATUS_COLORS.pending
                        }`}>
                          {order.status}
                        </span>
                        {order.escalated && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                            Escalada
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-2xl font-bold text-green-600 mb-3">
                      {formatPrice(order.amount, order.currency)}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <div>
                          <div className="font-medium">{order.clientName || 'Cliente'}</div>
                          <div>{order.clientEmail}</div>
                        </div>
                      </div>

                      {order.providerName && (
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          <div>
                            <div className="font-medium">{order.providerName}</div>
                            <div>{order.providerEmail}</div>
                          </div>
                        </div>
                      )}

                      {order.propertyAddress && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span className="truncate">{order.propertyAddress}</span>
                        </div>
                      )}

                      {order.contactPhone && (
                        <div className="flex items-center gap-1">
                          <Phone className="w-4 h-4" />
                          <span>{order.contactPhone}</span>
                        </div>
                      )}
                    </div>

                    {order.description && (
                      <p className="text-sm text-gray-600 mt-3 line-clamp-2">
                        {order.description}
                      </p>
                    )}

                    {order.notes && order.notes.length > 0 && (
                      <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center gap-2 text-sm font-medium text-yellow-800 mb-1">
                          <MessageSquare className="w-4 h-4" />
                          Notas del Helpdesk
                        </div>
                        <div className="text-sm text-yellow-700">
                          {order.notes[order.notes.length - 1].note}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-3 ml-6">
                    <div className="text-sm text-gray-500 text-right">
                      <div>{getTimeAgo(order.createdAt)}</div>
                      {order.scheduledDate && (
                        <div className="flex items-center gap-1 mt-1">
                          <Calendar className="w-4 h-4" />
                          <span>Programada: {formatDate(order.scheduledDate)}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openOrderDetails(order)}
                        className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                        title="Ver detalles"
                      >
                        <Eye size={16} />
                      </button>

                      <button
                        onClick={() => openOrderActions(order)}
                        className="p-2 rounded-lg bg-orange-50 text-orange-600 hover:bg-orange-100 transition-colors"
                        title="Acciones de helpdesk"
                      >
                        <AlertTriangle size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {orders.length === 0 && !loading && (
            <div className="p-12 text-center">
              <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron órdenes</h3>
              <p className="text-gray-600">
                {searchTerm || statusFilter || serviceTypeFilter
                  ? 'No hay órdenes que coincidan con los filtros aplicados.'
                  : 'No hay órdenes de servicios disponibles.'
                }
              </p>
            </div>
          )}
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
      </div>

      {/* Order Details Modal */}
      <Modal
        isOpen={showOrderModal}
        onClose={closeOrderModal}
        title={selectedOrder?.serviceName || 'Detalles de la Orden'}
        size="lg"
      >
        {selectedOrder && (
          <div className="space-y-6">
            {/* Order Header */}
            <div className="border-b border-gray-100 pb-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    {selectedOrder.serviceName}
                  </h2>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>Número de Orden: <span className="font-mono">{selectedOrder.orderNumber}</span></div>
                    <div>Tipo de Servicio: {selectedOrder.serviceType}</div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="text-2xl font-bold text-green-600">
                    {formatPrice(selectedOrder.amount, selectedOrder.currency)}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    ORDER_STATUS_COLORS[selectedOrder.status as keyof typeof ORDER_STATUS_COLORS] ||
                    ORDER_STATUS_COLORS.pending
                  }`}>
                    {selectedOrder.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Participants */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cliente</label>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="font-medium">{selectedOrder.clientName || 'Cliente'}</div>
                  <div className="text-sm text-gray-600">{selectedOrder.clientEmail}</div>
                  {selectedOrder.contactPhone && (
                    <div className="text-sm text-gray-600">{selectedOrder.contactPhone}</div>
                  )}
                </div>
              </div>

              {selectedOrder.providerName && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Proveedor</label>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="font-medium">{selectedOrder.providerName}</div>
                    <div className="text-sm text-gray-600">{selectedOrder.providerEmail}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Description and Address */}
            {(selectedOrder.description || selectedOrder.propertyAddress) && (
              <div className="grid grid-cols-1 gap-6">
                {selectedOrder.description && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
                    <p className="text-gray-900 bg-gray-50 p-4 rounded-lg">{selectedOrder.description}</p>
                  </div>
                )}

                {selectedOrder.propertyAddress && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Dirección</label>
                    <p className="text-gray-900 bg-gray-50 p-4 rounded-lg">{selectedOrder.propertyAddress}</p>
                  </div>
                )}
              </div>
            )}

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Creación</label>
                <p className="text-gray-900">{formatDate(selectedOrder.createdAt)}</p>
              </div>

              {selectedOrder.scheduledDate && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Programada</label>
                  <p className="text-gray-900">{formatDate(selectedOrder.scheduledDate)}</p>
                </div>
              )}

              {selectedOrder.completedDate && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Completado</label>
                  <p className="text-gray-900">{formatDate(selectedOrder.completedDate)}</p>
                </div>
              )}
            </div>

            {/* Escalation Info */}
            {selectedOrder.escalated && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 text-red-800 font-medium mb-2">
                  <AlertTriangle className="w-5 h-5" />
                  Orden Escalada
                </div>
                <div className="text-sm text-red-700">
                  Escalada el: {selectedOrder.escalatedAt ? formatDate(selectedOrder.escalatedAt) : 'Fecha no disponible'}
                </div>
              </div>
            )}

            {/* Refund Info */}
            {selectedOrder.refundRequested && (
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="flex items-center gap-2 text-purple-800 font-medium mb-2">
                  <DollarSign className="w-5 h-5" />
                  Reembolso Solicitado
                </div>
                <div className="text-sm text-purple-700">
                  <div>Cantidad: {formatPrice(selectedOrder.refundAmount || 0, selectedOrder.currency)}</div>
                  <div>Solicitado el: {selectedOrder.refundRequestedAt ? formatDate(selectedOrder.refundRequestedAt) : 'Fecha no disponible'}</div>
                </div>
              </div>
            )}

            {/* Notes */}
            {selectedOrder.notes && selectedOrder.notes.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Notas del Helpdesk</label>
                <div className="space-y-3 max-h-40 overflow-y-auto">
                  {selectedOrder.notes.map((note, index) => (
                    <div key={note.id || index} className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">{note.note}</p>
                      <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                        <span>Por: {note.addedByName}</span>
                        <span>{formatDate(note.addedAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Admin Actions History */}
            {selectedOrder.adminActions && selectedOrder.adminActions.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Historial de Acciones</label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {selectedOrder.adminActions.map((action, index) => (
                    <div key={index} className="p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-blue-900">{action.action}</span>
                        <span className="text-blue-600">{formatDate(action.timestamp)}</span>
                      </div>
                      <p className="text-sm text-blue-700 mt-1">{action.details}</p>
                      <p className="text-xs text-blue-600 mt-1">Por: {action.performedByName}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-4 border-t border-gray-100">
              <button
                onClick={closeOrderModal}
                className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Order Actions Modal */}
      <Modal
        isOpen={showActionsModal}
        onClose={closeActionsModal}
        title="Acciones de Helpdesk"
        size="md"
      >
        {selectedOrder && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {selectedOrder.serviceName}
              </h3>
              <p className="text-sm text-gray-600">
                Orden #{selectedOrder.orderNumber} - {formatPrice(selectedOrder.amount, selectedOrder.currency)}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Notas Internas (opcional)
              </label>
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary resize-none"
                placeholder="Agrega notas sobre las acciones realizadas..."
              />
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => handleOrderAction(selectedOrder._id, 'add_note')}
                disabled={!noteText.trim() || actionLoading === 'add_note'}
                className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {actionLoading === 'add_note' ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Plus size={20} />
                )}
                Agregar Nota
              </button>

              <button
                onClick={() => handleOrderAction(selectedOrder._id, 'escalate')}
                disabled={actionLoading === 'escalate' || selectedOrder.escalated}
                className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
              >
                {actionLoading === 'escalate' ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <AlertTriangle size={20} />
                )}
                {selectedOrder.escalated ? 'Ya Escalada' : 'Escalar Orden'}
              </button>

              <div className="border-t border-gray-100 pt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Solicitar Reembolso
                </label>
                <input
                  type="number"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  placeholder="Cantidad del reembolso"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary mb-3"
                />
                <button
                  onClick={() => handleOrderAction(selectedOrder._id, 'request_refund')}
                  disabled={!refundAmount || actionLoading === 'request_refund' || selectedOrder.refundRequested}
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                >
                  {actionLoading === 'request_refund' ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <DollarSign size={20} />
                  )}
                  {selectedOrder.refundRequested ? 'Reembolso Ya Solicitado' : 'Solicitar Reembolso'}
                </button>
              </div>

              <button
                onClick={() => handleOrderAction(selectedOrder._id, 'cancel_order')}
                disabled={actionLoading === 'cancel_order' || selectedOrder.status === 'cancelled'}
                className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {actionLoading === 'cancel_order' ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <XCircle size={20} />
                )}
                {selectedOrder.status === 'cancelled' ? 'Ya Cancelada' : 'Cancelar Orden'}
              </button>
            </div>

            <div className="flex justify-between pt-4 border-t border-gray-100">
              <button
                onClick={closeActionsModal}
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