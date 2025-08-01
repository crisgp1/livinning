'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { motion } from 'framer-motion'
import OrderStatus from '@/components/OrderStatus'
import { 
  Clock, 
  MapPin, 
  Phone, 
  Calendar,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Download,
  Eye,
  User,
  X
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
  assignedTo?: string
  deliverables: string[]
  notes: string[]
  createdAt: string
  updatedAt: string
}

interface ServiceOrdersProps {
  className?: string
}

export default function ServiceOrders({ className }: ServiceOrdersProps) {
  const { user } = useUser()
  const [orders, setOrders] = useState<ServiceOrder[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedOrder, setSelectedOrder] = useState<ServiceOrder | null>(null)

  useEffect(() => {
    if (user) {
      fetchOrders()
    }
  }, [user, selectedStatus])

  const fetchOrders = async () => {
    try {
      setIsLoading(true)
      const statusParam = selectedStatus !== 'all' ? `?status=${selectedStatus}` : ''
      const response = await fetch(`/api/services/orders${statusParam}`)
      
      if (response.ok) {
        const data = await response.json()
        setOrders(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching service orders:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-white bg-opacity-10 text-white border-white border-opacity-20'
      case 'confirmed':
        return 'bg-white bg-opacity-10 text-white border-white border-opacity-20'
      case 'in_progress':
        return 'bg-white bg-opacity-10 text-white border-white border-opacity-20'
      case 'completed':
        return 'bg-white bg-opacity-10 text-white border-white border-opacity-20'
      case 'cancelled':
        return 'bg-white bg-opacity-10 text-white border-white border-opacity-20'
      default:
        return 'bg-white bg-opacity-10 text-white border-white border-opacity-20'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendiente'
      case 'confirmed':
        return 'Confirmado'
      case 'in_progress':
        return 'En Progreso'
      case 'completed':
        return 'Completado'
      case 'cancelled':
        return 'Cancelado'
      default:
        return 'Desconocido'
    }
  }

  const getServiceIcon = (serviceType: string) => {
    return <div className="w-2 h-2 rounded-full bg-white opacity-60"></div>
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: currency
    }).format(amount)
  }

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center h-64 ${className}`}>
        <div className="loading-spinner"></div>
      </div>
    )
  }

  return (
    <div className={className}>
      <div className="mb-6">
        <h3 className="text-xl font-medium mb-4 text-gray-900">Mis Servicios Contratados</h3>
        
        {/* Status Filter */}
        <div className="flex flex-wrap gap-2">
          {['all', 'pending', 'confirmed', 'in_progress', 'completed', 'cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                selectedStatus === status 
                  ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                  : 'glass-icon-container hover:scale-105'
              }`}
            >
              {status === 'all' ? 'Todos' : getStatusText(status)}
            </button>
          ))}
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="glass-icon-container rounded-2xl p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-6 glass rounded-2xl flex items-center justify-center">
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium mb-2 text-gray-900">
            No tienes servicios contratados
          </h3>
          <p className="text-sm text-gray-600">
            Cuando contrates servicios profesionales aparecerán aquí
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {orders.map((order) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-icon-container rounded-2xl p-6 hover:shadow-xl transition-all duration-300"
              whileHover={{ y: -4 }}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-blue-600">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{order.serviceName}</h4>
                    <p className="text-sm text-gray-600">
                      Solicitado el {formatDate(order.createdAt)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin size={14} className="text-gray-400" />
                  <span>{order.propertyAddress}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar size={14} className="text-gray-400" />
                  <span>Fecha preferida: {formatDate(order.preferredDate)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone size={14} className="text-gray-400" />
                  <span>{order.contactPhone}</span>
                </div>
                {order.assignedTo && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User size={14} className="text-gray-400" />
                    <span>Asignado a: {order.assignedTo}</span>
                  </div>
                )}
              </div>

              {/* Progress */}
              {order.estimatedDelivery && (
                <div className="mb-4 p-3 rounded-xl bg-blue-50 border border-blue-200">
                  <div className="flex items-center gap-2 text-sm text-blue-700">
                    <Clock size={14} />
                    <span>Entrega estimada: {order.estimatedDelivery}</span>
                  </div>
                </div>
              )}

              {/* Special Requests */}
              {order.specialRequests && (
                <div className="mb-4">
                  <p className="text-sm font-medium mb-1 text-gray-700">Solicitudes especiales:</p>
                  <p className="text-sm text-gray-600">{order.specialRequests}</p>
                </div>
              )}

              {/* Deliverables */}
              {order.deliverables.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-medium mb-2 text-gray-700">Entregables:</p>
                  <div className="space-y-1">
                    {order.deliverables.map((deliverable, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircle2 size={14} className="text-green-500" />
                        <span>{deliverable}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Order Status Tracking */}
              <div className="mb-4">
                <OrderStatus
                  status={order.status as 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'}
                  serviceName={order.serviceName}
                  orderDate={order.createdAt}
                  estimatedDelivery={order.estimatedDelivery}
                  actualDelivery={order.actualDelivery}
                />
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <span className="text-xl font-light text-gray-900">
                  {formatCurrency(order.amount, order.currency)}
                </span>
                <button
                  onClick={() => setSelectedOrder(order)}
                  className="py-2.5 px-4 rounded-xl bg-white/50 backdrop-blur-sm border border-gray-200 text-gray-700 text-sm font-medium hover:bg-white hover:shadow-sm transition-all duration-200 flex items-center gap-2"
                >
                  <Eye size={14} />
                  Ver detalles
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-medium text-gray-900">Detalles del Servicio</h3>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Service Info */}
                <div>
                  <h4 className="font-medium mb-3 text-gray-900">Información del Servicio</h4>
                  <div className="rounded-xl p-4 space-y-2 bg-gray-50">
                    <p className="text-gray-700"><span className="font-medium">Servicio:</span> {selectedOrder.serviceName}</p>
                    <p className="text-gray-700"><span className="font-medium">Descripción:</span> {selectedOrder.serviceDescription}</p>
                    <div className="text-gray-700"><span className="font-medium">Estado:</span> <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.status)}`}>
                      {getStatusText(selectedOrder.status)}
                    </span></div>
                    <p className="text-gray-700"><span className="font-medium">Monto:</span> {formatCurrency(selectedOrder.amount, selectedOrder.currency)}</p>
                  </div>
                </div>

                {/* Property Info */}
                <div>
                  <h4 className="font-medium mb-3 text-gray-900">Información de la Propiedad</h4>
                  <div className="rounded-xl p-4 space-y-2 bg-gray-50">
                    <p className="text-gray-700"><span className="font-medium">Dirección:</span> {selectedOrder.propertyAddress}</p>
                    <p className="text-gray-700"><span className="font-medium">Teléfono de contacto:</span> {selectedOrder.contactPhone}</p>
                    <p className="text-gray-700"><span className="font-medium">Fecha preferida:</span> {formatDate(selectedOrder.preferredDate)}</p>
                  </div>
                </div>

                {/* Notes */}
                {selectedOrder.notes.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-3 text-gray-900">Notas del Servicio</h4>
                    <div className="rounded-xl p-4 space-y-2 bg-gray-50">
                      {selectedOrder.notes.map((note, index) => (
                        <p key={index} className="text-sm text-gray-600">• {note}</p>
                      ))}
                    </div>
                  </div>
                )}

                {/* Timeline */}
                <div>
                  <h4 className="font-medium mb-3 text-gray-900">Cronología</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-primary rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Servicio solicitado</p>
                        <p className="text-xs text-gray-600">{formatDate(selectedOrder.createdAt)}</p>
                      </div>
                    </div>
                    {selectedOrder.status !== 'pending' && (
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Pago confirmado</p>
                          <p className="text-xs text-gray-600">{formatDate(selectedOrder.updatedAt)}</p>
                        </div>
                      </div>
                    )}
                    {selectedOrder.actualDelivery && (
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Servicio completado</p>
                          <p className="text-xs text-gray-600">{formatDate(selectedOrder.actualDelivery)}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                {(selectedOrder.status === 'confirmed' || selectedOrder.status === 'completed') && (
                  <div className="pt-6 border-t border-gray-200">
                    <button
                      onClick={() => {
                        window.location.href = `/services/invoice?orderId=${selectedOrder.id}`
                      }}
                      className="w-full py-3 px-4 rounded-xl bg-primary text-white font-medium hover:bg-primary-hover transition-colors flex items-center justify-center gap-2"
                    >
                      <Download size={20} />
                      Descargar Factura
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}