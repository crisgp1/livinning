'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  Building2,
  MessageSquare,
  Package,
  Users,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  TrendingUp,
  RefreshCw,
  Eye,
  ArrowRight,
  Calendar,
  Activity,
  UserCheck,
  FileText
} from 'lucide-react'

interface DashboardStats {
  properties: {
    total: number
    pendingModeration: number
    approvedToday: number
    rejectedToday: number
  }
  supportTickets: {
    total: number
    open: number
    inProgress: number
    resolved: number
    urgent: number
    createdToday: number
    resolvedToday: number
    avgResolutionTime: number
  }
  serviceOrders: {
    total: number
    totalRevenue: number
    pending: number
    inProgress: number
    completed: number
    escalated: number
    ordersToday: number
    revenueToday: number
    avgOrderValue: number
  }
  users: {
    totalUsers: number
    activeUsers: number
    newUsersToday: number
    providerUsers: number
    clientUsers: number
  }
}

interface RecentActivity {
  _id: string
  type: 'property' | 'ticket' | 'order' | 'user'
  action: string
  description: string
  timestamp: string
  userId?: string
  userEmail?: string
}

export default function HelpdeskDashboard() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [isHelpdesk, setIsHelpdesk] = useState(false)

  useEffect(() => {
    if (isLoaded && user) {
      const metadata = user.publicMetadata as any

      const helpdeskStatus = metadata?.role === 'helpdesk'
      const isSuperAdmin = metadata?.isSuperAdmin === true ||
        metadata?.role === 'superadmin' ||
        user.emailAddresses?.some(email => email.emailAddress === 'cristiangp2001@gmail.com')

      if (!helpdeskStatus && !isSuperAdmin) {
        router.push('/')
        return
      }

      setIsHelpdesk(true)
      fetchDashboardData()
    } else if (isLoaded && !user) {
      router.push('/sign-in')
    }
  }, [user, isLoaded, router])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)

      const response = await fetch('/api/helpdesk/dashboard/stats')
      const data = await response.json()

      if (data.success) {
        setStats(data.data.stats)
        setRecentActivity(data.data.recentActivity || [])
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-primary rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!isHelpdesk) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-light mb-2 text-gray-900">Acceso Denegado</h1>
          <p className="text-gray-600">No tienes permisos de helpdesk</p>
        </div>
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
              <h1 className="text-2xl font-bold text-gray-900">Dashboard Helpdesk</h1>
              <p className="text-gray-600 mt-1">
                Bienvenido, {user?.firstName}. Aquí tienes un resumen del sistema.
              </p>
            </div>
            <button
              onClick={fetchDashboardData}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {stats && (
          <>
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Properties Pending Moderation */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-red-500">
                    <Building2 className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
                    Requiere atención
                  </span>
                </div>
                <div className="text-3xl font-bold mb-1 text-gray-900">
                  {stats.properties.pendingModeration}
                </div>
                <div className="text-sm text-gray-600 mb-2">Propiedades Pendientes</div>
                <div className="text-xs text-gray-500">
                  +{stats.properties.approvedToday} aprobadas hoy
                </div>
              </motion.div>

              {/* Open Support Tickets */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500">
                    <MessageSquare className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                    {stats.supportTickets.urgent} urgentes
                  </span>
                </div>
                <div className="text-3xl font-bold mb-1 text-gray-900">
                  {stats.supportTickets.open}
                </div>
                <div className="text-sm text-gray-600 mb-2">Tickets Abiertos</div>
                <div className="text-xs text-gray-500">
                  {stats.supportTickets.resolvedToday} resueltos hoy
                </div>
              </motion.div>

              {/* Escalated Service Orders */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
                    <Package className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
                    Escaladas
                  </span>
                </div>
                <div className="text-3xl font-bold mb-1 text-gray-900">
                  {stats.serviceOrders.escalated}
                </div>
                <div className="text-sm text-gray-600 mb-2">Órdenes Escaladas</div>
                <div className="text-xs text-gray-500">
                  {stats.serviceOrders.ordersToday} nuevas hoy
                </div>
              </motion.div>

              {/* System Health */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500">
                    <Activity className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                    Saludable
                  </span>
                </div>
                <div className="text-3xl font-bold mb-1 text-gray-900">
                  {stats.supportTickets.avgResolutionTime}h
                </div>
                <div className="text-sm text-gray-600 mb-2">Tiempo Resolución</div>
                <div className="text-xs text-gray-500">Promedio actual</div>
              </motion.div>
            </div>

            {/* Detailed Stats Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 mb-8">
              {/* Property Management Summary */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-xl shadow-sm border border-gray-100"
              >
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Moderación de Propiedades</h3>
                    <Building2 className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total de Propiedades</span>
                    <span className="font-semibold text-gray-900">{stats.properties.total}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Pendientes de Moderación</span>
                    <span className="font-semibold text-orange-600">{stats.properties.pendingModeration}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Aprobadas Hoy</span>
                    <span className="font-semibold text-green-600">{stats.properties.approvedToday}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Rechazadas Hoy</span>
                    <span className="font-semibold text-red-600">{stats.properties.rejectedToday}</span>
                  </div>
                </div>
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                  <button
                    onClick={() => router.push('/helpdesk/moderation')}
                    className="flex items-center gap-2 text-sm text-primary hover:text-primary-dark font-medium"
                  >
                    Ver Moderación
                    <ArrowRight size={16} />
                  </button>
                </div>
              </motion.div>

              {/* Support Tickets Summary */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white rounded-xl shadow-sm border border-gray-100"
              >
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Tickets de Soporte</h3>
                    <MessageSquare className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total de Tickets</span>
                    <span className="font-semibold text-gray-900">{stats.supportTickets.total}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Abiertos</span>
                    <span className="font-semibold text-yellow-600">{stats.supportTickets.open}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">En Progreso</span>
                    <span className="font-semibold text-blue-600">{stats.supportTickets.inProgress}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Urgentes</span>
                    <span className="font-semibold text-red-600">{stats.supportTickets.urgent}</span>
                  </div>
                </div>
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                  <button
                    onClick={() => router.push('/helpdesk/tickets')}
                    className="flex items-center gap-2 text-sm text-primary hover:text-primary-dark font-medium"
                  >
                    Ver Tickets
                    <ArrowRight size={16} />
                  </button>
                </div>
              </motion.div>

              {/* Service Orders Summary */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-white rounded-xl shadow-sm border border-gray-100"
              >
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Órdenes de Servicios</h3>
                    <Package className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total de Órdenes</span>
                    <span className="font-semibold text-gray-900">{stats.serviceOrders.total}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Escaladas</span>
                    <span className="font-semibold text-red-600">{stats.serviceOrders.escalated}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Valor Promedio</span>
                    <span className="font-semibold text-green-600">${stats.serviceOrders.avgOrderValue}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Ingresos Hoy</span>
                    <span className="font-semibold text-green-600">${stats.serviceOrders.revenueToday}</span>
                  </div>
                </div>
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                  <button
                    onClick={() => router.push('/helpdesk/orders')}
                    className="flex items-center gap-2 text-sm text-primary hover:text-primary-dark font-medium"
                  >
                    Ver Órdenes
                    <ArrowRight size={16} />
                  </button>
                </div>
              </motion.div>
            </div>

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100"
            >
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Actividad Reciente</h3>
                  <Activity className="w-5 h-5 text-gray-400" />
                </div>
              </div>
              <div className="divide-y divide-gray-100">
                {recentActivity.length > 0 ? (
                  recentActivity.slice(0, 10).map((activity, index) => (
                    <div key={activity._id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start space-x-4">
                        <div className={`p-2 rounded-lg ${
                          activity.type === 'property' ? 'bg-orange-100 text-orange-600' :
                          activity.type === 'ticket' ? 'bg-blue-100 text-blue-600' :
                          activity.type === 'order' ? 'bg-purple-100 text-purple-600' :
                          'bg-green-100 text-green-600'
                        }`}>
                          {activity.type === 'property' && <Building2 size={16} />}
                          {activity.type === 'ticket' && <MessageSquare size={16} />}
                          {activity.type === 'order' && <Package size={16} />}
                          {activity.type === 'user' && <Users size={16} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {activity.action}
                            </p>
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                              <Clock size={12} />
                              {new Date(activity.timestamp).toLocaleTimeString('es-ES')}
                            </p>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {activity.description}
                          </p>
                          {activity.userEmail && (
                            <p className="text-xs text-gray-500 mt-1">
                              Por: {activity.userEmail}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-12 text-center">
                    <Activity className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">No hay actividad reciente</h4>
                    <p className="text-gray-600">
                      La actividad del sistema aparecerá aquí cuando haya eventos.
                    </p>
                  </div>
                )}
              </div>
              {recentActivity.length > 10 && (
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                  <button
                    onClick={() => router.push('/helpdesk/logs')}
                    className="flex items-center gap-2 text-sm text-primary hover:text-primary-dark font-medium"
                  >
                    Ver Todos los Logs
                    <ArrowRight size={16} />
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}

        {!stats && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <LayoutDashboard className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Cargando datos del sistema</h3>
            <p className="text-gray-600">
              Por favor espera mientras obtenemos la información más reciente.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}