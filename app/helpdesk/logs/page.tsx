'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  FileText,
  Search,
  Filter,
  RefreshCw,
  Download,
  Calendar,
  Clock,
  User,
  Activity,
  AlertTriangle,
  CheckCircle,
  Info,
  XCircle,
  Settings,
  Eye
} from 'lucide-react'
import Modal from '@/components/ui/Modal'
import { useModal } from '@/hooks/useModal'

interface ActivityLog {
  _id: string
  timestamp: string
  level: 'info' | 'warning' | 'error' | 'success'
  category: 'auth' | 'property' | 'service' | 'payment' | 'admin' | 'system' | 'support'
  action: string
  description: string
  userId?: string
  userEmail?: string
  userRole?: string
  metadata?: Record<string, any>
  ipAddress?: string
  userAgent?: string
  affectedResource?: {
    type: string
    id: string
    name?: string
  }
}

interface LogStats {
  totalLogs: number
  todayLogs: number
  errorLogs: number
  warningLogs: number
  byCategory: Record<string, number>
  byLevel: Record<string, number>
}

const LOG_LEVEL_COLORS = {
  info: 'bg-blue-100 text-blue-800 border-blue-200',
  success: 'bg-green-100 text-green-800 border-green-200',
  warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  error: 'bg-red-100 text-red-800 border-red-200'
}

const LOG_LEVEL_ICONS = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error: XCircle
}

const CATEGORY_COLORS = {
  auth: 'bg-purple-100 text-purple-800',
  property: 'bg-orange-100 text-orange-800',
  service: 'bg-blue-100 text-blue-800',
  payment: 'bg-green-100 text-green-800',
  admin: 'bg-red-100 text-red-800',
  system: 'bg-gray-100 text-gray-800',
  support: 'bg-indigo-100 text-indigo-800'
}

export default function ActivityLogsPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [stats, setStats] = useState<LogStats | null>(null)
  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [levelFilter, setLevelFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [dateFilter, setDateFilter] = useState('today')
  const [userFilter, setUserFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [exporting, setExporting] = useState(false)

  const {
    isOpen: showLogModal,
    openModal: openLogModal,
    closeModal: closeLogModal
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

      fetchLogs()
    } else if (isLoaded && !user) {
      router.push('/sign-in')
    }
  }, [user, isLoaded, router, searchTerm, levelFilter, categoryFilter, dateFilter, userFilter, currentPage])

  const fetchLogs = async () => {
    try {
      setLoading(true)

      // Simulate fetching activity logs
      // In a real implementation, this would call an API endpoint
      const mockLogs: ActivityLog[] = Array.from({ length: 50 }, (_, index) => {
        const levels: Array<'info' | 'warning' | 'error' | 'success'> = ['info', 'warning', 'error', 'success']
        const categories: Array<'auth' | 'property' | 'service' | 'payment' | 'admin' | 'system' | 'support'> =
          ['auth', 'property', 'service', 'payment', 'admin', 'system', 'support']

        const level = levels[Math.floor(Math.random() * levels.length)]
        const category = categories[Math.floor(Math.random() * categories.length)]

        const actions = {
          auth: ['user_login', 'user_logout', 'password_reset', 'role_changed'],
          property: ['property_created', 'property_approved', 'property_rejected', 'property_updated'],
          service: ['order_created', 'order_completed', 'order_cancelled', 'service_updated'],
          payment: ['payment_processed', 'refund_issued', 'payment_failed', 'subscription_created'],
          admin: ['user_banned', 'user_unbanned', 'role_assigned', 'system_config_changed'],
          system: ['database_backup', 'system_restart', 'maintenance_started', 'performance_alert'],
          support: ['ticket_created', 'ticket_resolved', 'ticket_escalated', 'response_sent']
        }

        const action = actions[category][Math.floor(Math.random() * actions[category].length)]

        const now = new Date()
        const timestamp = new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000) // Last 7 days

        return {
          _id: `log_${index}`,
          timestamp: timestamp.toISOString(),
          level,
          category,
          action,
          description: `Sistema ejecutó ${action.replace('_', ' ')} con éxito`,
          userId: Math.random() > 0.3 ? `user_${Math.floor(Math.random() * 100)}` : undefined,
          userEmail: Math.random() > 0.3 ? `usuario${Math.floor(Math.random() * 100)}@ejemplo.com` : undefined,
          userRole: Math.random() > 0.5 ? 'client' : Math.random() > 0.5 ? 'provider' : 'admin',
          ipAddress: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
          userAgent: 'Mozilla/5.0 (compatible; Sistema)',
          metadata: {
            resourceId: `resource_${Math.floor(Math.random() * 1000)}`,
            amount: category === 'payment' ? Math.floor(Math.random() * 1000) : undefined,
            propertyId: category === 'property' ? `prop_${Math.floor(Math.random() * 100)}` : undefined
          }
        }
      })

      const filteredLogs = mockLogs.filter(log => {
        const matchesSearch = !searchTerm ||
          log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.userEmail?.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesLevel = !levelFilter || log.level === levelFilter
        const matchesCategory = !categoryFilter || log.category === categoryFilter
        const matchesUser = !userFilter || log.userEmail?.toLowerCase().includes(userFilter.toLowerCase())

        const matchesDate = (() => {
          if (!dateFilter || dateFilter === 'all') return true

          const logDate = new Date(log.timestamp)
          const today = new Date()

          switch (dateFilter) {
            case 'today':
              return logDate.toDateString() === today.toDateString()
            case 'week':
              const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
              return logDate >= weekAgo
            case 'month':
              const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
              return logDate >= monthAgo
            default:
              return true
          }
        })()

        return matchesSearch && matchesLevel && matchesCategory && matchesUser && matchesDate
      })

      setLogs(filteredLogs)
      setTotalCount(filteredLogs.length)

      // Calculate stats
      const totalLogs = mockLogs.length
      const today = new Date().toDateString()
      const todayLogs = mockLogs.filter(log => new Date(log.timestamp).toDateString() === today).length
      const errorLogs = mockLogs.filter(log => log.level === 'error').length
      const warningLogs = mockLogs.filter(log => log.level === 'warning').length

      const byCategory = mockLogs.reduce((acc, log) => {
        acc[log.category] = (acc[log.category] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      const byLevel = mockLogs.reduce((acc, log) => {
        acc[log.level] = (acc[log.level] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      setStats({
        totalLogs,
        todayLogs,
        errorLogs,
        warningLogs,
        byCategory,
        byLevel
      })

    } catch (error) {
      console.error('Error fetching activity logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const exportLogs = async () => {
    try {
      setExporting(true)

      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 2000))

      console.log('Exporting activity logs...')

    } catch (error) {
      console.error('Error exporting logs:', error)
    } finally {
      setExporting(false)
    }
  }

  const openLogDetails = (log: ActivityLog) => {
    setSelectedLog(log)
    openLogModal()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const getTimeAgo = (dateString: string) => {
    const now = new Date().getTime()
    const date = new Date(dateString).getTime()
    const diffInMinutes = Math.floor((now - date) / (1000 * 60))

    if (diffInMinutes < 1) return 'Hace menos de 1 minuto'
    if (diffInMinutes < 60) return `Hace ${diffInMinutes} minuto${diffInMinutes > 1 ? 's' : ''}`

    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `Hace ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`

    const diffInDays = Math.floor(diffInHours / 24)
    return `Hace ${diffInDays} día${diffInDays > 1 ? 's' : ''}`
  }

  const totalPages = Math.ceil(totalCount / 50)

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
              <h1 className="text-2xl font-bold text-gray-900">Logs de Actividad del Sistema</h1>
              <p className="text-gray-600 mt-1">
                Monitoreo y auditoría de todas las actividades del sistema
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={exportLogs}
                disabled={exporting}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {exporting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Download size={16} />
                )}
                Exportar
              </button>
              <button
                onClick={fetchLogs}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Actualizar
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500">
                  <FileText className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="text-2xl font-bold mb-1 text-gray-900">
                {stats.totalLogs.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Total Logs</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="text-2xl font-bold mb-1 text-gray-900">
                {stats.todayLogs}
              </div>
              <div className="text-sm text-gray-600">Hoy</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-red-500 to-pink-500">
                  <XCircle className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="text-2xl font-bold mb-1 text-gray-900">
                {stats.errorLogs}
              </div>
              <div className="text-sm text-gray-600">Errores</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500">
                  <AlertTriangle className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="text-2xl font-bold mb-1 text-gray-900">
                {stats.warningLogs}
              </div>
              <div className="text-sm text-gray-600">Advertencias</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500">
                  <Info className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="text-2xl font-bold mb-1 text-gray-900">
                {stats.byLevel.info || 0}
              </div>
              <div className="text-sm text-gray-600">Info</div>
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
                {stats.byLevel.success || 0}
              </div>
              <div className="text-sm text-gray-600">Éxito</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500">
                  <Activity className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="text-2xl font-bold mb-1 text-gray-900">
                {Object.keys(stats.byCategory).length}
              </div>
              <div className="text-sm text-gray-600">Categorías</div>
            </motion.div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Acción, descripción..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nivel</label>
              <select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
              >
                <option value="">Todos</option>
                <option value="info">Info</option>
                <option value="success">Éxito</option>
                <option value="warning">Advertencia</option>
                <option value="error">Error</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Categoría</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
              >
                <option value="">Todas</option>
                <option value="auth">Autenticación</option>
                <option value="property">Propiedades</option>
                <option value="service">Servicios</option>
                <option value="payment">Pagos</option>
                <option value="admin">Administración</option>
                <option value="system">Sistema</option>
                <option value="support">Soporte</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Período</label>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
              >
                <option value="all">Todos</option>
                <option value="today">Hoy</option>
                <option value="week">Esta Semana</option>
                <option value="month">Este Mes</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Usuario</label>
              <input
                type="text"
                value={userFilter}
                onChange={(e) => setUserFilter(e.target.value)}
                placeholder="Email usuario..."
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('')
                  setLevelFilter('')
                  setCategoryFilter('')
                  setDateFilter('today')
                  setUserFilter('')
                  setCurrentPage(1)
                }}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Limpiar
              </button>
            </div>
          </div>

          <div className="mt-4 flex justify-between items-center">
            <span className="text-sm text-gray-600">
              Mostrando {logs.length} de {totalCount} logs
            </span>
            <div className="text-sm text-gray-500">
              Página {currentPage} de {totalPages}
            </div>
          </div>
        </div>

        {/* Activity Logs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="divide-y divide-gray-100">
            {logs.map((log) => {
              const LevelIcon = LOG_LEVEL_ICONS[log.level]

              return (
                <motion.div
                  key={log._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => openLogDetails(log)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className={`p-2 rounded-lg border ${LOG_LEVEL_COLORS[log.level]}`}>
                        <LevelIcon size={16} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {log.action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${CATEGORY_COLORS[log.category]}`}>
                            {log.category}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${LOG_LEVEL_COLORS[log.level]}`}>
                            {log.level}
                          </span>
                        </div>

                        <p className="text-gray-600 text-sm mb-3">
                          {log.description}
                        </p>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                          {log.userEmail && (
                            <div className="flex items-center gap-1">
                              <User className="w-4 h-4" />
                              <span>{log.userEmail}</span>
                              {log.userRole && (
                                <span className="px-2 py-1 rounded text-xs bg-gray-100">
                                  {log.userRole}
                                </span>
                              )}
                            </div>
                          )}

                          {log.ipAddress && (
                            <div className="flex items-center gap-1">
                              <Settings className="w-4 h-4" />
                              <span>{log.ipAddress}</span>
                            </div>
                          )}

                          {log.affectedResource && (
                            <div className="flex items-center gap-1">
                              <FileText className="w-4 h-4" />
                              <span>{log.affectedResource.type}: {log.affectedResource.id}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2 ml-6">
                      <div className="text-sm text-gray-500 text-right">
                        <div>{getTimeAgo(log.timestamp)}</div>
                        <div className="flex items-center gap-1 mt-1">
                          <Clock className="w-4 h-4" />
                          <span>{formatDate(log.timestamp)}</span>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          openLogDetails(log)
                        }}
                        className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                        title="Ver detalles"
                      >
                        <Eye size={16} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {logs.length === 0 && !loading && (
            <div className="p-12 text-center">
              <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron logs</h3>
              <p className="text-gray-600">
                {searchTerm || levelFilter || categoryFilter || userFilter
                  ? 'No hay logs que coincidan con los filtros aplicados.'
                  : 'No hay logs de actividad disponibles para el período seleccionado.'
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

      {/* Log Details Modal */}
      <Modal
        isOpen={showLogModal}
        onClose={closeLogModal}
        title="Detalles del Log de Actividad"
        size="lg"
      >
        {selectedLog && (
          <div className="space-y-6">
            {/* Log Header */}
            <div className="border-b border-gray-100 pb-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-lg border ${LOG_LEVEL_COLORS[selectedLog.level]}`}>
                    {React.createElement(LOG_LEVEL_ICONS[selectedLog.level], { size: 20 })}
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-1">
                      {selectedLog.action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </h2>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${CATEGORY_COLORS[selectedLog.category]}`}>
                        {selectedLog.category}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${LOG_LEVEL_COLORS[selectedLog.level]}`}>
                        {selectedLog.level}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-sm text-gray-500">
                <div className="flex items-center gap-1 mb-1">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(selectedLog.timestamp)}</span>
                </div>
                <div>{getTimeAgo(selectedLog.timestamp)}</div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
              <p className="text-gray-900 bg-gray-50 p-4 rounded-lg">{selectedLog.description}</p>
            </div>

            {/* User Information */}
            {selectedLog.userEmail && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Usuario</label>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900">{selectedLog.userEmail}</span>
                  </div>
                </div>
                {selectedLog.userRole && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
                    <span className="px-2 py-1 rounded text-sm bg-gray-100 text-gray-700">
                      {selectedLog.userRole}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Technical Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Log ID</label>
                <p className="text-gray-900 font-mono text-sm">{selectedLog._id}</p>
              </div>
              {selectedLog.ipAddress && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dirección IP</label>
                  <p className="text-gray-900 font-mono text-sm">{selectedLog.ipAddress}</p>
                </div>
              )}
            </div>

            {/* Affected Resource */}
            {selectedLog.affectedResource && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Recurso Afectado</label>
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-medium text-blue-900">Tipo:</span>
                      <span className="ml-2 text-blue-800">{selectedLog.affectedResource.type}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-blue-900">ID:</span>
                      <span className="ml-2 text-blue-800 font-mono">{selectedLog.affectedResource.id}</span>
                    </div>
                    {selectedLog.affectedResource.name && (
                      <div className="md:col-span-2">
                        <span className="text-sm font-medium text-blue-900">Nombre:</span>
                        <span className="ml-2 text-blue-800">{selectedLog.affectedResource.name}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Metadata */}
            {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Metadatos Adicionales</label>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                    {JSON.stringify(selectedLog.metadata, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            {/* User Agent */}
            {selectedLog.userAgent && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">User Agent</label>
                <p className="text-gray-900 text-sm font-mono bg-gray-50 p-2 rounded">
                  {selectedLog.userAgent}
                </p>
              </div>
            )}

            <div className="flex justify-end pt-4 border-t border-gray-100">
              <button
                onClick={closeLogModal}
                className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}