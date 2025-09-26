<<<<<<< HEAD
'use client'

import { useAuth, useUser } from '@clerk/nextjs'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Navigation from '@/components/Navigation'
import { canAccessProviderDashboard, getProviderDisplayName } from '@/lib/utils/provider-helpers'
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
  Download,
  Home,
  BarChart3,
  Settings,
  Wrench,
  Users,
  History,
  Store
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
  const { isLoaded, userId } = useAuth()
  const { user } = useUser()
  const router = useRouter()
  const [hasAccess, setHasAccess] = useState<boolean | null>(null)
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

      if (!userId) {
        router.push('/')
        return
      }

      const metadata = user?.publicMetadata as any
      const userRole = metadata?.role
      const providerAccess = canAccessProviderDashboard(user)

      if (!providerAccess && userRole !== 'supplier' && userRole !== 'provider') {
        router.push('/dashboard')
        return
      }

      setHasAccess(true)
      await fetchOrders()
    }

    checkAccess()
  }, [isLoaded, userId, user, router])

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

  if (loading || !isLoaded || !hasAccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, href: '/provider-dashboard' },
    { id: 'assigned-services', label: 'Asignados', icon: Wrench, href: '/provider-dashboard/assigned' },
    { id: 'work-orders', label: 'Órdenes', icon: FileText, href: '/provider-dashboard/orders' },
    { id: 'completed', label: 'Completados', icon: Package, href: '/provider-dashboard/completed' },
    { id: 'clients', label: 'Clientes', icon: Users, href: '/provider-dashboard/clients' },
    { id: 'earnings', label: 'Ganancias', icon: TrendingUp, href: '/provider-dashboard/earnings' },
    { id: 'vendor-services', label: 'Mis Servicios', icon: Store, href: '/provider-dashboard/vendor-services' },
    { id: 'historial', label: 'Historial', icon: History, href: '/provider-dashboard/historial' },
    { id: 'settings', label: 'Ajustes', icon: Settings, href: '/provider-dashboard/settings' },
    { id: 'home', label: 'Inicio', icon: Home, href: '/' },
  ]

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      <div className="pt-20 flex relative">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-orange-200 to-red-200 rounded-full filter blur-3xl opacity-60"></div>
          <div className="absolute top-80 -left-40 w-96 h-96 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full filter blur-3xl opacity-60"></div>
        </div>

        {/* Sidebar */}
        <div className="w-64 flex-shrink-0">
          <div className="fixed left-0 top-20 h-[calc(100vh-5rem)] w-64 m-4 p-6 overflow-y-auto glass-sidebar rounded-2xl">
            {/* User Info */}
            <div className="border-b border-gray-100 pb-6 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-white shadow-lg">
                  {user?.imageUrl ? (
                    <img src={user.imageUrl} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-500 to-red-500">
                      <span className="text-white font-medium text-lg">
                        {user?.firstName?.[0] || 'P'}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate text-gray-900">
                    {getProviderDisplayName(user)}
                  </p>
                  <p className="text-xs truncate text-gray-500">
                    Proveedor de Servicios
                  </p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="space-y-2">
              {sidebarItems.map((item) => {
                const isActive = item.href === '/provider-dashboard/orders'
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      router.push(item.href)
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

        <div className="flex-1 relative z-10">
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
    </div>
  )
=======
'use client'

import { useAuth, useUser } from '@clerk/nextjs'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { canAccessProviderDashboard, getProviderDisplayName } from '@/lib/utils/provider-helpers'
import { translateServiceType, translateServiceName } from '@/lib/utils/service-translations'
import Navigation from '@/components/Navigation'
import {
  Home,
  BarChart3,
  Settings,
  Menu,
  X,
  Wrench,
  Sparkles,
  FileText,
  Users,
  Package,
  TrendingUp,
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  User,
  Phone,
  Mail,
  AlertCircle,
  CheckCircle2,
  Play,
  Pause,
  History,
  Store
} from 'lucide-react'

interface WorkOrder {
  id: string
  serviceName: string
  serviceType: string
  clientName: string
  clientEmail: string
  clientPhone: string
  propertyAddress: string
  scheduledDate: string
  estimatedDuration: string
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high'
  description: string
  notes: string[]
  amount: number
  currency: string
}

export default function WorkOrdersPage() {
  const { isLoaded, userId } = useAuth()
  const { user } = useUser()
  const router = useRouter()
  const [hasAccess, setHasAccess] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([])
  const [filter, setFilter] = useState<'all' | 'scheduled' | 'in_progress' | 'completed'>('all')

  useEffect(() => {
    const checkProviderAccess = async () => {
      if (!isLoaded) return

      if (!userId) {
        router.push('/')
        return
      }

      try {
        const metadata = user?.publicMetadata as any
        const userRole = metadata?.role
        const providerAccess = canAccessProviderDashboard(user)
        
        const hasRoleAccess = userRole === 'supplier' || userRole === 'provider' || providerAccess
        
        if (!hasRoleAccess) {
          router.push('/dashboard')
          return
        }

        setHasAccess(true)
        fetchWorkOrders()
      } catch (error) {
        console.error('Error checking provider access:', error)
        router.push('/dashboard')
      } finally {
        setLoading(false)
      }
    }

    checkProviderAccess()
  }, [isLoaded, userId, user, router])

  const fetchWorkOrders = async () => {
    try {
      const response = await fetch('/api/services/provider-orders?limit=50')
      if (!response.ok) throw new Error('Failed to fetch work orders')
      
      const result = await response.json()
      
      // Transform the data to match WorkOrder interface
      const orders: WorkOrder[] = result.data.map((order: any) => ({
        id: order.id,
        serviceName: order.serviceName,
        serviceType: order.serviceType,
        clientName: order.customerName,
        clientEmail: order.customerEmail,
        clientPhone: order.contactPhone,
        propertyAddress: order.propertyAddress,
        scheduledDate: order.preferredDate,
        estimatedDuration: order.estimatedDelivery || 'N/A',
        status: order.status === 'pending' ? 'scheduled' : order.status,
        priority: 'medium', // Default priority as it's not in the API
        description: order.serviceDescription,
        notes: order.notes || [],
        amount: order.amount,
        currency: order.currency
      }))
      
      setWorkOrders(orders)
    } catch (error) {
      console.error('Error fetching work orders:', error)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled': return <Calendar className="w-5 h-5" />
      case 'in_progress': return <Play className="w-5 h-5" />
      case 'completed': return <CheckCircle2 className="w-5 h-5" />
      case 'cancelled': return <X className="w-5 h-5" />
      default: return <Clock className="w-5 h-5" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'in_progress': return 'bg-orange-100 text-orange-700 border-orange-200'
      case 'completed': return 'bg-green-100 text-green-700 border-green-200'
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700'
      case 'medium': return 'bg-yellow-100 text-yellow-700'
      case 'low': return 'bg-green-100 text-green-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const filteredOrders = workOrders.filter(order => {
    if (filter === 'all') return true
    return order.status === filter
  })

  if (loading || !isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Acceso Denegado</h1>
          <p className="text-gray-600 mb-6">No tienes permisos para acceder al dashboard de proveedores.</p>
        </div>
      </div>
    )
  }

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, href: '/provider-dashboard' },
    { id: 'assigned-services', label: 'Asignados', icon: Wrench, href: '/provider-dashboard/assigned' },
    { id: 'work-orders', label: 'Órdenes', icon: FileText, href: '/provider-dashboard/orders' },
    { id: 'completed', label: 'Completados', icon: Package, href: '/provider-dashboard/completed' },
    { id: 'clients', label: 'Clientes', icon: Users, href: '/provider-dashboard/clients' },
    { id: 'earnings', label: 'Ganancias', icon: TrendingUp, href: '/provider-dashboard/earnings' },
    { id: 'vendor-services', label: 'Mis Servicios', icon: Store, href: '/provider-dashboard/vendor-services' },
    { id: 'historial', label: 'Historial', icon: History, href: '/provider-dashboard/historial' },
    { id: 'settings', label: 'Ajustes', icon: Settings, href: '/provider-dashboard/settings' },
    { id: 'home', label: 'Inicio', icon: Home, href: '/' },
  ]

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      <div className="pt-20 flex relative">
        {/* Enhanced Background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-200 to-indigo-200 rounded-full filter blur-3xl opacity-60"></div>
          <div className="absolute top-80 -left-40 w-96 h-96 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full filter blur-3xl opacity-60"></div>
          <div className="absolute bottom-20 right-20 w-72 h-72 bg-gradient-to-br from-green-200 to-emerald-200 rounded-full filter blur-3xl opacity-40"></div>
        </div>


        {/* Sidebar */}
        <div className="w-64 flex-shrink-0">
          <div className="fixed left-0 top-20 h-[calc(100vh-5rem)] w-64">
          <div className="m-4 p-6 h-full overflow-y-auto glass-sidebar rounded-2xl">
            {/* User Info */}
            <div className="border-b border-gray-100 pb-6 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-white shadow-lg">
                  {user?.imageUrl ? (
                    <img src={user.imageUrl} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-500">
                      <span className="text-white font-medium text-lg">
                        {user?.firstName?.[0] || 'P'}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate text-gray-900">
                    {getProviderDisplayName(user)}
                  </p>
                  <p className="text-xs truncate text-gray-500">
                    Proveedor de Servicios
                  </p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="space-y-2">
              {sidebarItems.map((item) => {
                const isActive = item.href === '/provider-dashboard/orders'
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      router.push(item.href)
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
        </div>

        {/* Main Content */}
        <div className="flex-1 relative z-10">
          <main className="pb-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              
          
              {/* Header */}
              <div className="mb-8 lg:mb-12 mt-6 lg:mt-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className=""
                >
                  <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium mb-6 glass-icon-container">
                    <div className="w-4 h-4 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center">
                      <FileText className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-gray-700">Órdenes de Trabajo</span>
                  </div>
                  <h1 className="text-4xl md:text-6xl font-light mb-6 text-gray-900">
                    Órdenes de <span className="text-blue-600 font-medium">Trabajo</span>
                  </h1>
                  <p className="text-xl max-w-3xl text-gray-600 mb-8">
                    Administra todas tus órdenes de trabajo programadas, en progreso y completadas. 
                    Mantén un control detallado de cada proyecto.
                  </p>
                </motion.div>
              </div>

              {/* Filters */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-8"
              >
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'all', label: 'Todas', count: workOrders.length },
                    { id: 'scheduled', label: 'Programadas', count: workOrders.filter(o => o.status === 'scheduled').length },
                    { id: 'in_progress', label: 'En Progreso', count: workOrders.filter(o => o.status === 'in_progress').length },
                    { id: 'completed', label: 'Completadas', count: workOrders.filter(o => o.status === 'completed').length }
                  ].map((filterOption) => (
                    <button
                      key={filterOption.id}
                      onClick={() => setFilter(filterOption.id as any)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        filter === filterOption.id
                          ? 'bg-primary text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-50 glass-icon-container'
                      }`}
                    >
                      {filterOption.label} ({filterOption.count})
                    </button>
                  ))}
                </div>
              </motion.div>

              {/* Work Orders List */}
              <div className="space-y-6">
                {filteredOrders.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="glass-icon-container rounded-2xl p-12 text-center"
                  >
                    <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-gray-900 mb-2">
                      No hay órdenes de trabajo
                    </h3>
                    <p className="text-gray-600">
                      Las órdenes de trabajo aparecerán aquí cuando tengas servicios programados
                    </p>
                  </motion.div>
                ) : (
                  filteredOrders.map((order, index) => (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 + 0.3 }}
                      className="glass-icon-container rounded-2xl p-6 hover:shadow-lg transition-all duration-300"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <div className="flex items-center gap-3 mb-2">
                                <div className={`p-2 rounded-lg ${getStatusColor(order.status).replace('text-', 'bg-').replace('700', '100')}`}>
                                  {getStatusIcon(order.status)}
                                </div>
                                <div>
                                  <h3 className="font-semibold text-lg text-gray-900">
                                    {translateServiceName(order.serviceName)}
                                  </h3>
                                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                                    {order.status === 'scheduled' ? 'Programada' :
                                     order.status === 'in_progress' ? 'En Progreso' :
                                     order.status === 'completed' ? 'Completada' : 'Cancelada'}
                                  </span>
                                </div>
                              </div>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(order.priority)}`}>
                                Prioridad {order.priority === 'high' ? 'Alta' : order.priority === 'medium' ? 'Media' : 'Baja'}
                              </span>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold text-green-600">
                                ${order.amount.toLocaleString()} {order.currency}
                              </p>
                            </div>
                          </div>

                          <p className="text-gray-600 mb-4">{order.description}</p>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <User className="w-4 h-4" />
                              <div>
                                <span className="font-medium">{order.clientName}</span>
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                  <Mail className="w-3 h-3" />
                                  <span>{order.clientEmail}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Phone className="w-4 h-4" />
                              <span>{order.clientPhone}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <MapPin className="w-4 h-4" />
                              <span>{order.propertyAddress}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Calendar className="w-4 h-4" />
                              <span>
                                {new Date(order.scheduledDate).toLocaleDateString('es-MX', {
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Clock className="w-4 h-4" />
                              <span>Duración: {order.estimatedDuration}</span>
                            </div>
                          </div>

                          {order.notes.length > 0 && (
                            <div className="mb-4">
                              <h4 className="font-medium text-gray-900 mb-2">Notas importantes:</h4>
                              <ul className="space-y-1">
                                {order.notes.map((note, noteIndex) => (
                                  <li key={noteIndex} className="flex items-start gap-2 text-sm text-gray-600">
                                    <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                                    <span>{note}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          <div className="flex gap-3">
                            <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors">
                              <Play size={16} />
                              {order.status === 'scheduled' ? 'Iniciar Trabajo' : 
                               order.status === 'in_progress' ? 'Marcar Completado' : 'Ver Detalles'}
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                              <Phone size={16} />
                              Contactar Cliente
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
>>>>>>> 58f1e799c779b3a7fa2d1b6374712fd44597bda3
}