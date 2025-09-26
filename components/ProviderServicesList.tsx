'use client'

import React, { useState, useEffect } from 'react'
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

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/services/provider-orders')
      const data = await response.json()

      if (data.success && data.data) {
        setOrders(data.data)
        setStats(data.stats || {})
      } else {
        setOrders([])
        setStats({})
      }
    } catch (err) {
      setError('Error al conectar con el servidor')
      console.error('Fetch error:', err)
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Cargando servicios...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error}</p>
        <button
          onClick={fetchOrders}
          className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
        >
          Reintentar
        </button>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No hay servicios disponibles</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-light text-gray-900">Servicios del Proveedor</h2>

      <div className="grid gap-4">
        {orders.map((order) => (
          <div key={order.id} className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900">{order.serviceName}</h3>
                <p className="text-sm text-gray-600">{order.serviceDescription}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                order.status === ServiceOrderStatus.COMPLETED
                  ? 'bg-green-100 text-green-800'
                  : order.status === ServiceOrderStatus.IN_PROGRESS
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {order.status}
              </span>
            </div>

            <div className="space-y-2">
              <p><strong>Dirección:</strong> {order.propertyAddress}</p>
              <p><strong>Teléfono:</strong> {order.contactPhone}</p>
              <p><strong>Fecha preferida:</strong> {order.preferredDate}</p>
              <p><strong>Monto:</strong> ${order.amount} {order.currency}</p>
              {order.specialRequests && (
                <p><strong>Solicitudes especiales:</strong> {order.specialRequests}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}