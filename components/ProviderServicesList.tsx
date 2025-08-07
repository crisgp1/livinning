'use client'

import { useState, useEffect } from 'react'
import { ServiceOrderStatus, ServiceType } from '@/lib/domain/entities/ServiceOrder'

interface ServiceOrder {
  id: string
  serviceType: ServiceType
  serviceName: string
  serviceDescription: string
  propertyAddress: string
  contactPhone: string
  preferredDate: string
  specialRequests: string
  amount: number
  currency: string
  status: ServiceOrderStatus
  estimatedDelivery?: string
  actualDelivery?: Date
  deliverables: string[]
  notes: string[]
  createdAt: Date
  updatedAt: Date
  customerEmail?: string
}

interface ProviderStats {
  [key: string]: {
    count: number
    totalAmount: number
  }
}

interface FilterState {
  status: string
  serviceType: string
  startDate: string
  endDate: string
  search: string
}

export default function ProviderServicesList() {
  const [orders, setOrders] = useState<ServiceOrder[]>([])
  const [stats, setStats] = useState<ProviderStats>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 20,
    offset: 0,
    hasMore: false
  })

  const [filters, setFilters] = useState<FilterState>({
    status: '',
    serviceType: '',
    startDate: '',
    endDate: '',
    search: ''
  })

  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      
      if (filters.status) params.append('status', filters.status)
      if (filters.serviceType) params.append('serviceType', filters.serviceType)
      if (filters.startDate) params.append('startDate', filters.startDate)
      if (filters.endDate) params.append('endDate', filters.endDate)
      params.append('limit', pagination.limit.toString())
      params.append('offset', pagination.offset.toString())

      const response = await fetch(`/api/services/provider-orders?${params}`)
      const data = await response.json()

      if (data.success) {
        setOrders(data.data)
        setStats(data.stats)
        setPagination(data.pagination)
      } else {
        setError(data.error || 'Error al cargar los servicios')
      }
    } catch (err) {
      setError('Error al conectar con el servidor')
      console.error('Fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [filters, pagination.offset])

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setPagination(prev => ({ ...prev, offset: 0 }))
  }

  const clearFilters = () => {
    setFilters({
      status: '',
      serviceType: '',
      startDate: '',
      endDate: '',
      search: ''
    })
  }

  const getStatusBadge = (status: ServiceOrderStatus) => {
    const statusStyles = {
      [ServiceOrderStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
      [ServiceOrderStatus.CONFIRMED]: 'bg-blue-100 text-blue-800',
      [ServiceOrderStatus.IN_PROGRESS]: 'bg-orange-100 text-orange-800',
      [ServiceOrderStatus.COMPLETED]: 'bg-green-100 text-green-800',
      [ServiceOrderStatus.CANCELLED]: 'bg-red-100 text-red-800'
    }

    const statusText = {
      [ServiceOrderStatus.PENDING]: 'Pendiente',
      [ServiceOrderStatus.CONFIRMED]: 'Confirmado',
      [ServiceOrderStatus.IN_PROGRESS]: 'En Progreso',
      [ServiceOrderStatus.COMPLETED]: 'Completado',
      [ServiceOrderStatus.CANCELLED]: 'Cancelado'
    }

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyles[status]}`}>
        {statusText[status]}
      </span>
    )
  }

  const getServiceTypeLabel = (type: ServiceType) => {
    const labels = {
      [ServiceType.PHOTOGRAPHY]: 'Fotografía',
      [ServiceType.LEGAL]: 'Legal',
      [ServiceType.VIRTUAL_TOUR]: 'Tour Virtual',
      [ServiceType.HOME_STAGING]: 'Home Staging',
      [ServiceType.MARKET_ANALYSIS]: 'Análisis de Mercado',
      [ServiceType.DOCUMENTATION]: 'Documentación'
    }
    return labels[type] || type
  }

  const filteredOrders = orders.filter(order => {
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      return (
        order.serviceName.toLowerCase().includes(searchLower) ||
        order.propertyAddress.toLowerCase().includes(searchLower) ||
        order.customerEmail?.toLowerCase().includes(searchLower)
      )
    }
    return true
  })

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(stats).map(([status, data]) => (
          <div key={status} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                {getStatusBadge(status as ServiceOrderStatus)}
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900">{data.count} servicios</p>
                <p className="text-xs text-gray-500">${data.totalAmount.toFixed(2)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos los estados</option>
              <option value={ServiceOrderStatus.PENDING}>Pendiente</option>
              <option value={ServiceOrderStatus.CONFIRMED}>Confirmado</option>
              <option value={ServiceOrderStatus.IN_PROGRESS}>En Progreso</option>
              <option value={ServiceOrderStatus.COMPLETED}>Completado</option>
              <option value={ServiceOrderStatus.CANCELLED}>Cancelado</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Servicio</label>
            <select
              value={filters.serviceType}
              onChange={(e) => handleFilterChange('serviceType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos los tipos</option>
              {Object.values(ServiceType).map(type => (
                <option key={type} value={type}>{getServiceTypeLabel(type)}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Inicio</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Fin</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Buscar</label>
            <input
              type="text"
              placeholder="Buscar por servicio, dirección..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <button
          onClick={clearFilters}
          className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
        >
          Limpiar Filtros
        </button>
      </div>

      {/* Orders List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {error ? (
          <div className="p-6 text-center text-red-600">
            {error}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No se encontraron servicios asignados
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Servicio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Propiedad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Monto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha Creación
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <>
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {order.serviceName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {getServiceTypeLabel(order.serviceType)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{order.propertyAddress}</div>
                        {order.customerEmail && (
                          <div className="text-sm text-gray-500">{order.customerEmail}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(order.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${order.amount.toFixed(2)} {order.currency}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          {expandedOrder === order.id ? 'Ocultar' : 'Ver Detalles'}
                        </button>
                      </td>
                    </tr>
                    {expandedOrder === order.id && (
                      <tr>
                        <td colSpan={6} className="px-6 py-4 bg-gray-50">
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <h4 className="font-medium text-gray-900">Descripción</h4>
                                <p className="text-sm text-gray-600">{order.serviceDescription}</p>
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900">Solicitudes Especiales</h4>
                                <p className="text-sm text-gray-600">{order.specialRequests || 'Ninguna'}</p>
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900">Fecha Preferida</h4>
                                <p className="text-sm text-gray-600">{order.preferredDate}</p>
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900">Teléfono de Contacto</h4>
                                <p className="text-sm text-gray-600">{order.contactPhone}</p>
                              </div>
                              {order.estimatedDelivery && (
                                <div>
                                  <h4 className="font-medium text-gray-900">Entrega Estimada</h4>
                                  <p className="text-sm text-gray-600">{order.estimatedDelivery}</p>
                                </div>
                              )}
                              {order.deliverables.length > 0 && (
                                <div>
                                  <h4 className="font-medium text-gray-900">Entregables</h4>
                                  <ul className="text-sm text-gray-600 list-disc list-inside">
                                    {order.deliverables.map((deliverable, index) => (
                                      <li key={index}>{deliverable}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                            {order.notes.length > 0 && (
                              <div>
                                <h4 className="font-medium text-gray-900">Notas</h4>
                                <div className="space-y-1">
                                  {order.notes.map((note, index) => (
                                    <p key={index} className="text-sm text-gray-600 p-2 bg-white rounded border-l-2 border-blue-200">
                                      {note}
                                    </p>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.total > pagination.limit && (
        <div className="flex items-center justify-between bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setPagination(prev => ({ ...prev, offset: Math.max(0, prev.offset - prev.limit) }))}
              disabled={pagination.offset === 0}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Anterior
            </button>
            <button
              onClick={() => setPagination(prev => ({ ...prev, offset: prev.offset + prev.limit }))}
              disabled={!pagination.hasMore}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Mostrando <span className="font-medium">{pagination.offset + 1}</span> a{' '}
                <span className="font-medium">
                  {Math.min(pagination.offset + pagination.limit, pagination.total)}
                </span>{' '}
                de <span className="font-medium">{pagination.total}</span> resultados
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, offset: Math.max(0, prev.offset - prev.limit) }))}
                  disabled={pagination.offset === 0}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  Anterior
                </button>
                <button
                  onClick={() => setPagination(prev => ({ ...prev, offset: prev.offset + prev.limit }))}
                  disabled={!pagination.hasMore}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  Siguiente
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}