'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { motion } from 'framer-motion'
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
  User
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
        <h3 className="text-xl font-light mb-4" style={{ color: '#ffffff' }}>Mis Servicios Contratados</h3>
        
        {/* Status Filter */}
        <div className="flex flex-wrap gap-3">
          {['all', 'pending', 'confirmed', 'in_progress', 'completed', 'cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className="flex items-center gap-2 px-4 py-2 font-medium transition-all whitespace-nowrap"
              style={{
                background: selectedStatus === status 
                  ? 'rgba(255, 255, 255, 0.2)'
                  : 'rgba(255, 255, 255, 0.05)',
                color: selectedStatus === status ? '#ffffff' : '#a3a3a3',
                border: `1px solid ${selectedStatus === status ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)'}`
              }}
              onMouseEnter={(e) => {
                if (selectedStatus !== status) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                  e.currentTarget.style.color = '#ffffff'
                }
              }}
              onMouseLeave={(e) => {
                if (selectedStatus !== status) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                  e.currentTarget.style.color = '#a3a3a3'
                }
              }}
            >
              <div className="w-1 h-1 rounded-full bg-current opacity-60"></div>
              {status === 'all' ? 'Todos' : getStatusText(status)}
            </button>
          ))}
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ 
            background: 'rgba(255, 255, 255, 0.1)'
          }}>
            <div className="w-2 h-2 rounded-full bg-white opacity-60"></div>
          </div>
          <h3 className="text-lg font-light mb-2" style={{ color: '#ffffff' }}>
            No tienes servicios contratados
          </h3>
          <p style={{ color: '#a3a3a3' }}>
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
              className="glass-card p-6 hover:scale-105 transition-transform"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ 
                    background: 'rgba(255, 255, 255, 0.1)'
                  }}>
                    {getServiceIcon(order.serviceType)}
                  </div>
                  <div>
                    <h4 className="font-light" style={{ color: '#ffffff' }}>{order.serviceName}</h4>
                    <p className="text-sm" style={{ color: '#a3a3a3' }}>
                      Solicitado el {formatDate(order.createdAt)}
                    </p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-light border ${getStatusColor(order.status)}`}>
                  {getStatusText(order.status)}
                </span>
              </div>

              {/* Details */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 text-sm" style={{ color: '#a3a3a3' }}>
                  <div className="w-1 h-1 rounded-full bg-current opacity-60"></div>
                  <span>{order.propertyAddress}</span>
                </div>
                <div className="flex items-center gap-2 text-sm" style={{ color: '#a3a3a3' }}>
                  <div className="w-1 h-1 rounded-full bg-current opacity-60"></div>
                  <span>Fecha preferida: {formatDate(order.preferredDate)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm" style={{ color: '#a3a3a3' }}>
                  <div className="w-1 h-1 rounded-full bg-current opacity-60"></div>
                  <span>{order.contactPhone}</span>
                </div>
                {order.assignedTo && (
                  <div className="flex items-center gap-2 text-sm" style={{ color: '#a3a3a3' }}>
                    <div className="w-1 h-1 rounded-full bg-current opacity-60"></div>
                    <span>Asignado a: {order.assignedTo}</span>
                  </div>
                )}
              </div>

              {/* Progress */}
              {order.estimatedDelivery && (
                <div className="mb-4 p-3 rounded-lg" style={{ 
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                  <div className="flex items-center gap-2 text-sm" style={{ color: '#ffffff' }}>
                    <div className="w-1 h-1 rounded-full bg-current opacity-60"></div>
                    <span>Entrega estimada: {order.estimatedDelivery}</span>
                  </div>
                </div>
              )}

              {/* Special Requests */}
              {order.specialRequests && (
                <div className="mb-4">
                  <p className="text-sm font-light mb-1" style={{ color: '#ffffff' }}>Solicitudes especiales:</p>
                  <p className="text-sm" style={{ color: '#a3a3a3' }}>{order.specialRequests}</p>
                </div>
              )}

              {/* Deliverables */}
              {order.deliverables.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-light mb-2" style={{ color: '#ffffff' }}>Entregables:</p>
                  <div className="space-y-1">
                    {order.deliverables.map((deliverable, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm" style={{ color: '#a3a3a3' }}>
                        <div className="w-1 h-1 rounded-full bg-current opacity-60"></div>
                        <span>{deliverable}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between pt-4" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <span className="text-lg font-light" style={{ color: '#ffffff' }}>
                  {formatCurrency(order.amount, order.currency)}
                </span>
                <button
                  onClick={() => setSelectedOrder(order)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    color: '#a3a3a3',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                    e.currentTarget.style.color = '#ffffff'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                    e.currentTarget.style.color = '#a3a3a3'
                  }}
                >
                  <div className="w-1 h-1 rounded-full bg-current opacity-60"></div>
                  Ver detalles
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-light" style={{ color: '#ffffff' }}>Detalles del Servicio</h3>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="transition-colors"
                  style={{ color: '#666666' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#ffffff'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#666666'}
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                {/* Service Info */}
                <div>
                  <h4 className="font-light mb-3" style={{ color: '#ffffff' }}>Información del Servicio</h4>
                  <div className="rounded-lg p-4 space-y-2" style={{ 
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}>
                    <p style={{ color: '#a3a3a3' }}><strong style={{ color: '#ffffff' }}>Servicio:</strong> {selectedOrder.serviceName}</p>
                    <p style={{ color: '#a3a3a3' }}><strong style={{ color: '#ffffff' }}>Descripción:</strong> {selectedOrder.serviceDescription}</p>
                    <p style={{ color: '#a3a3a3' }}><strong style={{ color: '#ffffff' }}>Estado:</strong> <span className={`px-2 py-1 rounded text-xs ${getStatusColor(selectedOrder.status)}`}>
                      {getStatusText(selectedOrder.status)}
                    </span></p>
                    <p style={{ color: '#a3a3a3' }}><strong style={{ color: '#ffffff' }}>Monto:</strong> {formatCurrency(selectedOrder.amount, selectedOrder.currency)}</p>
                  </div>
                </div>

                {/* Property Info */}
                <div>
                  <h4 className="font-light mb-3" style={{ color: '#ffffff' }}>Información de la Propiedad</h4>
                  <div className="rounded-lg p-4 space-y-2" style={{ 
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}>
                    <p style={{ color: '#a3a3a3' }}><strong style={{ color: '#ffffff' }}>Dirección:</strong> {selectedOrder.propertyAddress}</p>
                    <p style={{ color: '#a3a3a3' }}><strong style={{ color: '#ffffff' }}>Teléfono de contacto:</strong> {selectedOrder.contactPhone}</p>
                    <p style={{ color: '#a3a3a3' }}><strong style={{ color: '#ffffff' }}>Fecha preferida:</strong> {formatDate(selectedOrder.preferredDate)}</p>
                  </div>
                </div>

                {/* Notes */}
                {selectedOrder.notes.length > 0 && (
                  <div>
                    <h4 className="font-light mb-3" style={{ color: '#ffffff' }}>Notas del Servicio</h4>
                    <div className="rounded-lg p-4 space-y-2" style={{ 
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}>
                      {selectedOrder.notes.map((note, index) => (
                        <p key={index} className="text-sm" style={{ color: '#a3a3a3' }}>• {note}</p>
                      ))}
                    </div>
                  </div>
                )}

                {/* Timeline */}
                <div>
                  <h4 className="font-light mb-3" style={{ color: '#ffffff' }}>Cronología</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-white rounded-full opacity-60"></div>
                      <div>
                        <p className="text-sm font-light" style={{ color: '#ffffff' }}>Servicio solicitado</p>
                        <p className="text-xs" style={{ color: '#a3a3a3' }}>{formatDate(selectedOrder.createdAt)}</p>
                      </div>
                    </div>
                    {selectedOrder.status !== 'pending' && (
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-white rounded-full opacity-60"></div>
                        <div>
                          <p className="text-sm font-light" style={{ color: '#ffffff' }}>Pago confirmado</p>
                          <p className="text-xs" style={{ color: '#a3a3a3' }}>{formatDate(selectedOrder.updatedAt)}</p>
                        </div>
                      </div>
                    )}
                    {selectedOrder.actualDelivery && (
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-white rounded-full opacity-60"></div>
                        <div>
                          <p className="text-sm font-light" style={{ color: '#ffffff' }}>Servicio completado</p>
                          <p className="text-xs" style={{ color: '#a3a3a3' }}>{formatDate(selectedOrder.actualDelivery)}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}