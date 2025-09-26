'use client'

import { motion } from 'framer-motion'
import {
  Eye,
  User,
  MapPin,
  Phone,
  Calendar,
  MessageSquare,
  AlertTriangle,
  DollarSign
} from 'lucide-react'
import { cn } from '@/lib/utils'

const ORDER_STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
  in_progress: 'bg-orange-100 text-orange-800 border-orange-200',
  completed: 'bg-green-100 text-green-800 border-green-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
  refund_pending: 'bg-purple-100 text-purple-800 border-purple-200'
}

interface OrderNote {
  id: string
  note: string
  addedBy: string
  addedByName: string
  addedAt: string
  type: string
}

interface OrderCardProps {
  order: {
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
    createdAt: string
    escalated?: boolean
    notes?: OrderNote[]
  }
  onViewDetails?: (order: any) => void
  onViewActions?: (order: any) => void
  formatPrice?: (price: number, currency: string) => string
  formatDate?: (dateString: string) => string
  getTimeAgo?: (dateString: string) => string
  className?: string
}

export default function OrderCard({
  order,
  onViewDetails,
  onViewActions,
  formatPrice = (price, currency) => `${currency} ${price}`,
  formatDate = (date) => new Date(date).toLocaleDateString(),
  getTimeAgo = (date) => date,
  className
}: OrderCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "p-6 hover:bg-gray-50 transition-colors",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">
              {order.serviceName}
            </h3>
            <span className="text-sm font-mono text-gray-500">
              #{order.orderNumber}
            </span>
            <div className="flex items-center gap-2">
              <span className={cn(
                "px-2 py-1 rounded-full text-xs font-medium",
                ORDER_STATUS_COLORS[order.status as keyof typeof ORDER_STATUS_COLORS] ||
                ORDER_STATUS_COLORS.pending
              )}>
                {order.status}
              </span>
              {order.escalated && (
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                  Escalada
                </span>
              )}
            </div>
          </div>

          {/* Price */}
          <div className="text-2xl font-bold text-green-600 mb-3">
            {formatPrice(order.amount, order.currency)}
          </div>

          {/* Details Grid */}
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

          {/* Description */}
          {order.description && (
            <p className="text-sm text-gray-600 mt-3 line-clamp-2">
              {order.description}
            </p>
          )}

          {/* Notes */}
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

        {/* Actions */}
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
            {onViewDetails && (
              <button
                onClick={() => onViewDetails(order)}
                className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                title="Ver detalles"
              >
                <Eye size={16} />
              </button>
            )}

            {onViewActions && (
              <button
                onClick={() => onViewActions(order)}
                className="p-2 rounded-lg bg-orange-50 text-orange-600 hover:bg-orange-100 transition-colors"
                title="Acciones de helpdesk"
              >
                <AlertTriangle size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}