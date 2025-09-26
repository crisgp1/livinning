'use client'

import { motion } from 'framer-motion'
import {
  Eye,
  User,
  Mail,
  Shield,
  UserCheck,
  Clock,
  AlertTriangle,
  Phone,
  MapPin,
  Calendar,
  Activity,
  Ban
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { StatusBadge } from '@/components/ui'

interface UserCardProps {
  user: {
    id: string
    email: string
    firstName: string
    lastName: string
    imageUrl: string
    role: string
    isAgency: boolean
    isSuperAdmin: boolean
    helpdeskAccess: boolean
    createdAt: number
    lastActiveAt: number | null
    banned: boolean
  }
  onViewDetails?: (user: any) => void
  formatDate?: (timestamp: number) => string
  getTimeAgo?: (timestamp: number) => string
  className?: string
}

const ROLE_COLORS = {
  user: 'bg-gray-100 text-gray-800 border-gray-200',
  agent: 'bg-blue-100 text-blue-800 border-blue-200',
  provider: 'bg-green-100 text-green-800 border-green-200',
  supplier: 'bg-purple-100 text-purple-800 border-purple-200',
  superadmin: 'bg-red-100 text-red-800 border-red-200',
  helpdesk: 'bg-orange-100 text-orange-800 border-orange-200'
}

export default function UserCard({
  user,
  onViewDetails,
  formatDate = (timestamp) => new Date(timestamp).toLocaleDateString(),
  getTimeAgo = (timestamp) => {
    const now = new Date().getTime()
    const diffInHours = Math.floor((now - timestamp) / (1000 * 60 * 60))
    if (diffInHours < 1) return 'Hace menos de 1 hora'
    if (diffInHours < 24) return `Hace ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`
    const diffInDays = Math.floor(diffInHours / 24)
    return `Hace ${diffInDays} día${diffInDays > 1 ? 's' : ''}`
  },
  className
}: UserCardProps) {
  const fullName = `${user.firstName} ${user.lastName}`.trim() || 'Usuario'

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
          {/* Header with Avatar and Name */}
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-white shadow-lg">
              {user.imageUrl ? (
                <img
                  src={user.imageUrl}
                  alt={fullName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary to-blue-600">
                  <span className="text-white font-medium text-lg">
                    {user.firstName?.[0] || user.email[0].toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold text-gray-900 truncate">
                  {fullName}
                </h3>
                <div className="flex items-center gap-2 flex-wrap">
                  <StatusBadge
                    variant={user.banned ? 'danger' : 'success'}
                    dot
                  >
                    {user.banned ? 'Baneado' : 'Activo'}
                  </StatusBadge>

                  <span className={cn(
                    "px-2 py-1 rounded-full text-xs font-medium",
                    ROLE_COLORS[user.role as keyof typeof ROLE_COLORS] || ROLE_COLORS.user
                  )}>
                    {user.role}
                  </span>

                  {user.isSuperAdmin && (
                    <StatusBadge variant="danger" icon={Shield}>
                      SuperAdmin
                    </StatusBadge>
                  )}

                  {user.helpdeskAccess && (
                    <StatusBadge variant="warning" icon={UserCheck}>
                      Helpdesk
                    </StatusBadge>
                  )}

                  {user.isAgency && (
                    <StatusBadge variant="info" icon={User}>
                      Agencia
                    </StatusBadge>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1 text-sm text-gray-600">
                <Mail className="w-4 h-4" />
                <span className="truncate">{user.email}</span>
              </div>
            </div>
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <div>
                <span className="font-medium">Registrado: </span>
                <span>{formatDate(user.createdAt)}</span>
              </div>
            </div>

            {user.lastActiveAt && (
              <div className="flex items-center gap-1">
                <Activity className="w-4 h-4" />
                <div>
                  <span className="font-medium">Última actividad: </span>
                  <span>{getTimeAgo(user.lastActiveAt)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Warning for banned users */}
          {user.banned && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-sm font-medium text-red-800">
                <Ban className="w-4 h-4" />
                Usuario Baneado
              </div>
              <div className="text-sm text-red-700 mt-1">
                Este usuario ha sido suspendido del sistema
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col items-end gap-3 ml-6">
          <div className="text-sm text-gray-500 text-right">
            <div>ID: {user.id.slice(-8)}</div>
          </div>

          <div className="flex items-center gap-2">
            {onViewDetails && (
              <button
                onClick={() => onViewDetails(user)}
                className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                title="Ver detalles"
              >
                <Eye size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// Role badge component for user roles
export const UserRoleBadge = ({ role }: { role: string }) => {
  const roleConfig: Record<string, { variant: any; label: string }> = {
    user: { variant: 'neutral', label: 'Usuario' },
    agent: { variant: 'info', label: 'Agente' },
    provider: { variant: 'success', label: 'Proveedor' },
    supplier: { variant: 'primary', label: 'Suplidor' },
    superadmin: { variant: 'danger', label: 'SuperAdmin' },
    helpdesk: { variant: 'warning', label: 'Helpdesk' }
  }

  const config = roleConfig[role] || { variant: 'neutral', label: role }

  return (
    <StatusBadge variant={config.variant} dot>
      {config.label}
    </StatusBadge>
  )
}