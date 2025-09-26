'use client'

import { motion } from 'framer-motion'
import {
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
import { cn } from '@/lib/utils'
import { StatusBadge } from '@/components/ui'

interface PropertyCardProps {
  property: {
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
    rejectionReason?: string
    moderatedBy?: string
    moderatedAt?: string
  }
  onViewDetails?: (property: any) => void
  onApprove?: (property: any) => void
  onReject?: (property: any) => void
  formatPrice?: (price: number, currency: string) => string
  formatDate?: (dateString: string) => string
  getTimeAgo?: (dateString: string) => string
  className?: string
}

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  approved: 'bg-green-100 text-green-800 border-green-200',
  rejected: 'bg-red-100 text-red-800 border-red-200',
  draft: 'bg-gray-100 text-gray-800 border-gray-200'
}

const PROPERTY_TYPE_ICONS = {
  house: '🏠',
  apartment: '🏢',
  condo: '🏬',
  townhouse: '🏘️',
  commercial: '🏪',
  land: '🌿'
}

export default function PropertyCard({
  property,
  onViewDetails,
  onApprove,
  onReject,
  formatPrice = (price, currency) => `${currency} ${price.toLocaleString()}`,
  formatDate = (date) => new Date(date).toLocaleDateString(),
  getTimeAgo = (date) => {
    const now = new Date().getTime()
    const propDate = new Date(date).getTime()
    const diffInHours = Math.floor((now - propDate) / (1000 * 60 * 60))
    if (diffInHours < 1) return 'Hace menos de 1 hora'
    if (diffInHours < 24) return `Hace ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`
    const diffInDays = Math.floor(diffInHours / 24)
    return `Hace ${diffInDays} día${diffInDays > 1 ? 's' : ''}`
  },
  className
}: PropertyCardProps) {
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
          <div className="flex items-start gap-4 mb-4">
            {/* Property Image */}
            <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
              {property.images && property.images.length > 0 ? (
                <img
                  src={property.images[0]}
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl">
                  {PROPERTY_TYPE_ICONS[property.propertyType as keyof typeof PROPERTY_TYPE_ICONS] || '🏠'}
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold text-gray-900 truncate">
                  {property.title}
                </h3>
                <StatusBadge
                  variant={
                    property.status === 'approved' ? 'success' :
                    property.status === 'rejected' ? 'danger' :
                    property.status === 'pending' ? 'warning' : 'neutral'
                  }
                  dot
                >
                  {property.status === 'pending' ? 'Pendiente' :
                   property.status === 'approved' ? 'Aprobada' :
                   property.status === 'rejected' ? 'Rechazada' : property.status}
                </StatusBadge>
              </div>

              <div className="text-2xl font-bold text-green-600 mb-2">
                {formatPrice(property.price, property.currency)}
              </div>

              <div className="text-sm text-gray-600 mb-2">
                <span className="font-medium">{property.transactionType}</span> •
                <span className="ml-1">{property.propertyType}</span>
              </div>
            </div>
          </div>

          {/* Property Details */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Bed className="w-4 h-4" />
              <span>{property.bedrooms} hab.</span>
            </div>

            <div className="flex items-center gap-1">
              <Bath className="w-4 h-4" />
              <span>{property.bathrooms} baños</span>
            </div>

            <div className="flex items-center gap-1">
              <Square className="w-4 h-4" />
              <span>{property.area} m²</span>
            </div>

            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span className="truncate">{property.location.city}</span>
            </div>
          </div>

          {/* Location */}
          <div className="text-sm text-gray-600 mb-3">
            <MapPin className="w-4 h-4 inline mr-1" />
            <span className="truncate">{property.location.address}</span>
          </div>

          {/* Owner Info */}
          <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
            <div className="flex items-center gap-1">
              <User className="w-4 h-4" />
              <span className="font-medium">{property.ownerName || 'Propietario'}</span>
            </div>
            <div className="flex items-center gap-1">
              <Mail className="w-4 h-4" />
              <span>{property.ownerEmail}</span>
            </div>
          </div>

          {/* Description */}
          {property.description && (
            <p className="text-sm text-gray-600 line-clamp-2 mb-3">
              {property.description}
            </p>
          )}

          {/* Rejection Reason */}
          {property.status === 'rejected' && property.rejectionReason && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-sm font-medium text-red-800 mb-1">
                <XCircle className="w-4 h-4" />
                Razón de Rechazo
              </div>
              <div className="text-sm text-red-700">
                {property.rejectionReason}
              </div>
            </div>
          )}

          {/* Moderation Info */}
          {property.moderatedBy && property.moderatedAt && (
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-sm text-blue-700">
                <span className="font-medium">Moderado por:</span> {property.moderatedBy} •
                <span className="ml-1">{formatDate(property.moderatedAt)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col items-end gap-3 ml-6">
          <div className="text-sm text-gray-500 text-right">
            <div>{getTimeAgo(property.createdAt)}</div>
            <div className="flex items-center gap-1 mt-1">
              <Clock className="w-4 h-4" />
              <span>{formatDate(property.createdAt)}</span>
            </div>
          </div>

          <div className="flex flex-col items-center gap-2">
            {onViewDetails && (
              <button
                onClick={() => onViewDetails(property)}
                className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                title="Ver detalles"
              >
                <Eye size={16} />
              </button>
            )}

            {property.status === 'pending' && (
              <div className="flex flex-col gap-1">
                {onApprove && (
                  <button
                    onClick={() => onApprove(property)}
                    className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                    title="Aprobar"
                  >
                    <CheckCircle size={16} />
                  </button>
                )}

                {onReject && (
                  <button
                    onClick={() => onReject(property)}
                    className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                    title="Rechazar"
                  >
                    <XCircle size={16} />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// Property status badge component
export const PropertyStatusBadge = ({ status }: { status: string }) => {
  const statusConfig: Record<string, { variant: any; label: string }> = {
    pending: { variant: 'warning', label: 'Pendiente' },
    approved: { variant: 'success', label: 'Aprobada' },
    rejected: { variant: 'danger', label: 'Rechazada' },
    draft: { variant: 'neutral', label: 'Borrador' }
  }

  const config = statusConfig[status] || { variant: 'neutral', label: status }

  return (
    <StatusBadge variant={config.variant} dot>
      {config.label}
    </StatusBadge>
  )
}