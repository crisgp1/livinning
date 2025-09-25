'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  MessageSquare,
  TrendingUp,
  Calendar,
  MapPin,
  User,
  ChevronRight,
  Circle,
  AlertCircle,
  Pause
} from 'lucide-react'

interface ServiceTracking {
  _id: string
  serviceOrderId: string
  serviceName: string
  serviceType: string
  propertyAddress: string
  clientName: string
  status: 'not_started' | 'in_progress' | 'paused' | 'completed' | 'cancelled'
  phase: 'pre_service' | 'during_service' | 'post_service' | 'warranty'
  progress: {
    percentage: number
    lastUpdated: string
  }
  communications: {
    unreadByProvider: number
    lastMessageAt?: string
  }
  metadata: {
    lastActivityAt: string
    createdAt: string
  }
  estimatedCompletionDate?: string
  qualityMetrics?: {
    totalIssues?: number
    issuesResolved?: number
  }
}

export default function ServiceTrackingList() {
  const router = useRouter()
  const [trackings, setTrackings] = useState<ServiceTracking[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all')

  useEffect(() => {
    fetchTrackings()
    const interval = setInterval(fetchTrackings, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchTrackings = async () => {
    try {
      const response = await fetch('/api/services/tracking')
      const data = await response.json()
      if (data.success && data.data && data.data.length > 0) {
        setTrackings(data.data)
      } else {
        // No hay datos reales - mostrar lista vacía
        setTrackings([])
      }
    } catch (error) {
      console.error('Error fetching trackings:', error)
      // En caso de error, mostrar lista vacía
      setTrackings([])
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'not_started': return <Circle className="w-4 h-4" />
      case 'in_progress': return <Activity className="w-4 h-4" />
      case 'paused': return <Pause className="w-4 h-4" />
      case 'completed': return <CheckCircle className="w-4 h-4" />
      case 'cancelled': return <AlertCircle className="w-4 h-4" />
      default: return <Circle className="w-4 h-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'not_started': return 'bg-gray-100 text-gray-700'
      case 'in_progress': return 'bg-blue-100 text-blue-700'
      case 'paused': return 'bg-yellow-100 text-yellow-700'
      case 'completed': return 'bg-green-100 text-green-700'
      case 'cancelled': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getPhaseLabel = (phase: string) => {
    switch (phase) {
      case 'pre_service': return 'Pre-Servicio'
      case 'during_service': return 'Durante Servicio'
      case 'post_service': return 'Post-Servicio'
      case 'warranty': return 'Garantía'
      default: return phase
    }
  }

  const filteredTrackings = trackings.filter(tracking => {
    if (filter === 'all') return true
    if (filter === 'active') return ['not_started', 'in_progress', 'paused'].includes(tracking.status)
    if (filter === 'completed') return tracking.status === 'completed'
    return true
  })

  const getDaysUntilDeadline = (date?: string) => {
    if (!date) return null
    const deadline = new Date(date)
    const today = new Date()
    const diffTime = deadline.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const totalUnreadMessages = trackings.reduce((sum, t) => sum + t.communications.unreadByProvider, 0)
  const activeServices = trackings.filter(t => t.status === 'in_progress').length
  const completedServices = trackings.filter(t => t.status === 'completed').length
  const totalIssues = trackings.reduce((sum, t) => sum + (t.qualityMetrics?.totalIssues || 0), 0)

  if (loading) {
    return (
      <div className="glass-icon-container rounded-2xl p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="text-gray-600 mt-4">Cargando seguimientos...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 rounded-lg bg-blue-100">
              <Activity className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-2xl font-semibold text-gray-900">{activeServices}</span>
          </div>
          <p className="text-sm text-gray-600">Servicios Activos</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 rounded-lg bg-green-100">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-2xl font-semibold text-gray-900">{completedServices}</span>
          </div>
          <p className="text-sm text-gray-600">Completados</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6 relative"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 rounded-lg bg-purple-100">
              <MessageSquare className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-2xl font-semibold text-gray-900">{totalUnreadMessages}</span>
          </div>
          <p className="text-sm text-gray-600">Mensajes sin leer</p>
          {totalUnreadMessages > 0 && (
            <div className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 rounded-lg bg-orange-100">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
            </div>
            <span className="text-2xl font-semibold text-gray-900">{totalIssues}</span>
          </div>
          <p className="text-sm text-gray-600">Incidencias</p>
        </motion.div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'all'
              ? 'bg-primary text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          Todos ({trackings.length})
        </button>
        <button
          onClick={() => setFilter('active')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'active'
              ? 'bg-primary text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          Activos ({trackings.filter(t => ['not_started', 'in_progress', 'paused'].includes(t.status)).length})
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'completed'
              ? 'bg-primary text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          Completados ({completedServices})
        </button>
      </div>

      {/* Services List */}
      <div className="space-y-4">
        {filteredTrackings.length === 0 ? (
          <div className="glass-icon-container rounded-2xl p-12 text-center">
            <Activity className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay servicios con seguimiento
            </h3>
            <p className="text-sm text-gray-600">
              Los servicios con seguimiento aparecerán aquí
            </p>
          </div>
        ) : (
          filteredTrackings.map((tracking, index) => {
            const daysUntilDeadline = getDaysUntilDeadline(tracking.estimatedCompletionDate)
            const hasUnreadMessages = tracking.communications.unreadByProvider > 0
            const hasIssues = (tracking.qualityMetrics?.totalIssues || 0) > (tracking.qualityMetrics?.issuesResolved || 0)

            return (
              <motion.div
                key={tracking._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="glass-icon-container rounded-xl p-6 hover:shadow-lg transition-all duration-300 cursor-pointer relative"
                onClick={() => router.push(`/provider-dashboard/tracking/${tracking.serviceOrderId}`)}
              >
                {/* Notification Badges */}
                <div className="absolute top-4 right-4 flex gap-2">
                  {hasUnreadMessages && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-purple-100 rounded-full">
                      <MessageSquare className="w-3 h-3 text-purple-600" />
                      <span className="text-xs font-medium text-purple-700">
                        {tracking.communications.unreadByProvider}
                      </span>
                    </div>
                  )}
                  {hasIssues && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-orange-100 rounded-full">
                      <AlertTriangle className="w-3 h-3 text-orange-600" />
                      <span className="text-xs font-medium text-orange-700">
                        {(tracking.qualityMetrics?.totalIssues || 0) - (tracking.qualityMetrics?.issuesResolved || 0)}
                      </span>
                    </div>
                  )}
                  {daysUntilDeadline !== null && daysUntilDeadline <= 3 && daysUntilDeadline >= 0 && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-red-100 rounded-full">
                      <Clock className="w-3 h-3 text-red-600" />
                      <span className="text-xs font-medium text-red-700">
                        {daysUntilDeadline === 0 ? 'Hoy' : `${daysUntilDeadline}d`}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`p-2 rounded-lg ${getStatusColor(tracking.status).replace('text-', 'bg-').replace('700', '100')}`}>
                        {getStatusIcon(tracking.status)}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {tracking.serviceName}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {getPhaseLabel(tracking.phase)}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <User className="w-4 h-4 text-gray-400" />
                        <span>{tracking.clientName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="truncate">{tracking.propertyAddress}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>
                          {tracking.estimatedCompletionDate
                            ? new Date(tracking.estimatedCompletionDate).toLocaleDateString('es-MX')
                            : 'Por definir'}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-500">Progreso</span>
                        <span className="text-xs font-medium text-gray-700">
                          {tracking.progress.percentage}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
                          style={{ width: `${tracking.progress.percentage}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(tracking.status)}`}>
                        {tracking.status.replace('_', ' ').toUpperCase()}
                      </span>
                      <div className="flex items-center gap-2 text-gray-500">
                        <Clock className="w-4 h-4" />
                        <span className="text-xs">
                          Actualizado {new Date(tracking.metadata.lastActivityAt).toLocaleDateString('es-MX')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <ChevronRight className="w-5 h-5 text-gray-400 ml-4" />
                </div>
              </motion.div>
            )
          })
        )}
      </div>
    </div>
  )
}