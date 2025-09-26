'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  BarChart3,
  TrendingUp,
  Users,
  Building2,
  Package,
  DollarSign,
  Calendar,
  Download,
  RefreshCw,
  Filter,
  Eye,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText
} from 'lucide-react'

interface SystemReports {
  overview: {
    totalUsers: number
    totalProperties: number
    totalOrders: number
    totalRevenue: number
    ticketsResolved: number
    avgResolutionTime: number
  }
  userMetrics: {
    newUsersThisMonth: number
    activeUsersThisMonth: number
    userGrowthPercentage: number
    usersByRole: {
      clients: number
      providers: number
      agencies: number
      helpdesk: number
    }
  }
  propertyMetrics: {
    propertiesThisMonth: number
    pendingModeration: number
    approvalRate: number
    avgModerationTime: number
    propertiesByType: {
      [key: string]: number
    }
  }
  serviceMetrics: {
    ordersThisMonth: number
    revenueThisMonth: number
    revenueGrowthPercentage: number
    avgOrderValue: number
    ordersByStatus: {
      [key: string]: number
    }
    topServices: Array<{
      name: string
      count: number
      revenue: number
    }>
  }
  supportMetrics: {
    ticketsThisMonth: number
    ticketsResolved: number
    resolutionRate: number
    avgResolutionTime: number
    ticketsByPriority: {
      [key: string]: number
    }
    ticketsByCategory: {
      [key: string]: number
    }
  }
  systemHealth: {
    uptime: number
    errorRate: number
    performanceScore: number
    securityScore: number
  }
}

export default function HelpdeskReportsPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [reports, setReports] = useState<SystemReports | null>(null)
  const [dateRange, setDateRange] = useState('30') // Last 30 days
  const [reportType, setReportType] = useState('overview')
  const [exporting, setExporting] = useState(false)

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

      fetchReports()
    } else if (isLoaded && !user) {
      router.push('/sign-in')
    }
  }, [user, isLoaded, router, dateRange])

  const fetchReports = async () => {
    try {
      setLoading(true)

      // Simulate fetching comprehensive reports
      // In a real implementation, this would call multiple API endpoints
      const mockReports: SystemReports = {
        overview: {
          totalUsers: 1247,
          totalProperties: 892,
          totalOrders: 456,
          totalRevenue: 127500,
          ticketsResolved: 89,
          avgResolutionTime: 4.2
        },
        userMetrics: {
          newUsersThisMonth: 127,
          activeUsersThisMonth: 856,
          userGrowthPercentage: 12.5,
          usersByRole: {
            clients: 987,
            providers: 189,
            agencies: 45,
            helpdesk: 12
          }
        },
        propertyMetrics: {
          propertiesThisMonth: 89,
          pendingModeration: 23,
          approvalRate: 87.2,
          avgModerationTime: 2.4,
          propertiesByType: {
            'Apartamento': 345,
            'Casa': 287,
            'Oficina': 156,
            'Local Comercial': 89,
            'Terreno': 67
          }
        },
        serviceMetrics: {
          ordersThisMonth: 78,
          revenueThisMonth: 23450,
          revenueGrowthPercentage: 18.3,
          avgOrderValue: 300.64,
          ordersByStatus: {
            pending: 12,
            in_progress: 23,
            completed: 345,
            cancelled: 18
          },
          topServices: [
            { name: 'Limpieza Profunda', count: 89, revenue: 8900 },
            { name: 'Mantenimiento General', count: 67, revenue: 6700 },
            { name: 'Jardinería', count: 45, revenue: 4500 },
            { name: 'Pintura', count: 34, revenue: 3400 },
            { name: 'Plomería', count: 28, revenue: 2800 }
          ]
        },
        supportMetrics: {
          ticketsThisMonth: 145,
          ticketsResolved: 123,
          resolutionRate: 84.8,
          avgResolutionTime: 4.2,
          ticketsByPriority: {
            low: 45,
            medium: 67,
            high: 28,
            urgent: 5
          },
          ticketsByCategory: {
            technical: 56,
            billing: 34,
            service: 28,
            account: 21,
            other: 6
          }
        },
        systemHealth: {
          uptime: 99.8,
          errorRate: 0.02,
          performanceScore: 95,
          securityScore: 98
        }
      }

      setReports(mockReports)
    } catch (error) {
      console.error('Error fetching reports:', error)
    } finally {
      setLoading(false)
    }
  }

  const exportReport = async (format: 'pdf' | 'excel' | 'csv') => {
    try {
      setExporting(true)

      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 2000))

      // In a real implementation, this would generate and download the report
      console.log(`Exporting ${reportType} report as ${format} for last ${dateRange} days`)

    } catch (error) {
      console.error('Error exporting report:', error)
    } finally {
      setExporting(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`
  }

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
              <h1 className="text-2xl font-bold text-gray-900">Reportes del Sistema</h1>
              <p className="text-gray-600 mt-1">
                Análisis y métricas detalladas del rendimiento del sistema
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => exportReport('pdf')}
                disabled={exporting}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {exporting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Download size={16} />
                )}
                PDF
              </button>
              <button
                onClick={() => exportReport('excel')}
                disabled={exporting}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {exporting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Download size={16} />
                )}
                Excel
              </button>
              <button
                onClick={fetchReports}
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
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Período</label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
              >
                <option value="7">Últimos 7 días</option>
                <option value="30">Últimos 30 días</option>
                <option value="90">Últimos 3 meses</option>
                <option value="365">Último año</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Reporte</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
              >
                <option value="overview">Vista General</option>
                <option value="users">Usuarios</option>
                <option value="properties">Propiedades</option>
                <option value="services">Servicios</option>
                <option value="support">Soporte</option>
                <option value="financial">Financiero</option>
              </select>
            </div>

            <div className="flex items-end">
              <span className="text-sm text-gray-600">
                Generado para los últimos {dateRange} días
              </span>
            </div>
          </div>
        </div>

        {reports && (
          <>
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="text-2xl font-bold mb-1 text-gray-900">
                  {reports.overview.totalUsers.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Usuarios Totales</div>
                <div className="text-xs text-green-600 mt-1">
                  +{reports.userMetrics.userGrowthPercentage}% este mes
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-red-500">
                    <Building2 className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="text-2xl font-bold mb-1 text-gray-900">
                  {reports.overview.totalProperties.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Propiedades</div>
                <div className="text-xs text-orange-600 mt-1">
                  {reports.propertyMetrics.pendingModeration} pendientes
                </div>
              </motion.div>

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
                </div>
                <div className="text-2xl font-bold mb-1 text-gray-900">
                  {reports.overview.totalOrders.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Órdenes</div>
                <div className="text-xs text-blue-600 mt-1">
                  {reports.serviceMetrics.ordersThisMonth} este mes
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500">
                    <DollarSign className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="text-2xl font-bold mb-1 text-gray-900">
                  {formatCurrency(reports.overview.totalRevenue)}
                </div>
                <div className="text-sm text-gray-600">Ingresos Totales</div>
                <div className="text-xs text-green-600 mt-1">
                  +{formatPercentage(reports.serviceMetrics.revenueGrowthPercentage)} mes
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500">
                    <CheckCircle className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="text-2xl font-bold mb-1 text-gray-900">
                  {reports.overview.ticketsResolved}
                </div>
                <div className="text-sm text-gray-600">Tickets Resueltos</div>
                <div className="text-xs text-teal-600 mt-1">
                  {formatPercentage(reports.supportMetrics.resolutionRate)} resolución
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="text-2xl font-bold mb-1 text-gray-900">
                  {reports.overview.avgResolutionTime}h
                </div>
                <div className="text-sm text-gray-600">Tiempo Resolución</div>
                <div className="text-xs text-indigo-600 mt-1">Promedio</div>
              </motion.div>
            </div>

            {/* Detailed Reports */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* User Analytics */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-white rounded-xl shadow-sm border border-gray-100"
              >
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Análisis de Usuarios</h3>
                    <Users className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-semibold text-gray-900">Clientes</div>
                        <div className="text-sm text-gray-600">Usuarios regulares</div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-blue-600">
                          {reports.userMetrics.usersByRole.clients}
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatPercentage((reports.userMetrics.usersByRole.clients / reports.overview.totalUsers) * 100)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-semibold text-gray-900">Proveedores</div>
                        <div className="text-sm text-gray-600">Ofrecen servicios</div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-purple-600">
                          {reports.userMetrics.usersByRole.providers}
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatPercentage((reports.userMetrics.usersByRole.providers / reports.overview.totalUsers) * 100)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-semibold text-gray-900">Agencias</div>
                        <div className="text-sm text-gray-600">Inmobiliarias</div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">
                          {reports.userMetrics.usersByRole.agencies}
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatPercentage((reports.userMetrics.usersByRole.agencies / reports.overview.totalUsers) * 100)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Nuevos usuarios este mes</span>
                      <span className="font-semibold text-gray-900">{reports.userMetrics.newUsersThisMonth}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-2">
                      <span className="text-gray-600">Usuarios activos</span>
                      <span className="font-semibold text-gray-900">{reports.userMetrics.activeUsersThisMonth}</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Property Analytics */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="bg-white rounded-xl shadow-sm border border-gray-100"
              >
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Análisis de Propiedades</h3>
                    <Building2 className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {Object.entries(reports.propertyMetrics.propertiesByType).map(([type, count]) => (
                      <div key={type} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium text-gray-900">{type}</span>
                        <div className="text-right">
                          <span className="font-semibold text-gray-900">{count}</span>
                          <div className="text-sm text-gray-500">
                            {formatPercentage((count / reports.overview.totalProperties) * 100)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 pt-6 border-t border-gray-100 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Tasa de Aprobación</span>
                      <span className="font-semibold text-green-600">
                        {formatPercentage(reports.propertyMetrics.approvalRate)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Tiempo Promedio Moderación</span>
                      <span className="font-semibold text-gray-900">
                        {reports.propertyMetrics.avgModerationTime}h
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Pendientes Moderación</span>
                      <span className="font-semibold text-orange-600">
                        {reports.propertyMetrics.pendingModeration}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Service Performance */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8"
            >
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Rendimiento de Servicios</h3>
                  <BarChart3 className="w-5 h-5 text-gray-400" />
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Top Services */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-4">Servicios Más Populares</h4>
                    <div className="space-y-3">
                      {reports.serviceMetrics.topServices.map((service, index) => (
                        <div key={service.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-semibold">
                              {index + 1}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{service.name}</div>
                              <div className="text-sm text-gray-600">{service.count} órdenes</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-green-600">
                              {formatCurrency(service.revenue)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Status Distribution */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-4">Distribución por Estado</h4>
                    <div className="space-y-3">
                      {Object.entries(reports.serviceMetrics.ordersByStatus).map(([status, count]) => (
                        <div key={status} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${
                              status === 'completed' ? 'bg-green-500' :
                              status === 'in_progress' ? 'bg-blue-500' :
                              status === 'pending' ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`} />
                            <span className="font-medium text-gray-900 capitalize">{status.replace('_', ' ')}</span>
                          </div>
                          <span className="font-semibold text-gray-900">{count}</span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 pt-6 border-t border-gray-100 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Valor Promedio Orden</span>
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(reports.serviceMetrics.avgOrderValue)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Ingresos Este Mes</span>
                        <span className="font-semibold text-green-600">
                          {formatCurrency(reports.serviceMetrics.revenueThisMonth)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Support Metrics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8"
            >
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Métricas de Soporte</h3>
                  <FileText className="w-5 h-5 text-gray-400" />
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Tickets by Priority */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-4">Tickets por Prioridad</h4>
                    <div className="space-y-3">
                      {Object.entries(reports.supportMetrics.ticketsByPriority).map(([priority, count]) => (
                        <div key={priority} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className={`px-2 py-1 rounded text-xs font-medium ${
                              priority === 'urgent' ? 'bg-red-100 text-red-800' :
                              priority === 'high' ? 'bg-orange-100 text-orange-800' :
                              priority === 'medium' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {priority.charAt(0).toUpperCase() + priority.slice(1)}
                            </div>
                          </div>
                          <span className="font-semibold text-gray-900">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tickets by Category */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-4">Tickets por Categoría</h4>
                    <div className="space-y-3">
                      {Object.entries(reports.supportMetrics.ticketsByCategory).map(([category, count]) => (
                        <div key={category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="font-medium text-gray-900 capitalize">{category}</span>
                          <span className="font-semibold text-gray-900">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-100">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{reports.supportMetrics.ticketsThisMonth}</div>
                      <div className="text-sm text-gray-600">Tickets Este Mes</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{reports.supportMetrics.ticketsResolved}</div>
                      <div className="text-sm text-gray-600">Resueltos</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {formatPercentage(reports.supportMetrics.resolutionRate)}
                      </div>
                      <div className="text-sm text-gray-600">Tasa Resolución</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {reports.supportMetrics.avgResolutionTime}h
                      </div>
                      <div className="text-sm text-gray-600">Tiempo Promedio</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* System Health */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100"
            >
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Estado del Sistema</h3>
                  <TrendingUp className="w-5 h-5 text-gray-400" />
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className={`text-3xl font-bold mb-2 ${
                      reports.systemHealth.uptime > 99 ? 'text-green-600' :
                      reports.systemHealth.uptime > 95 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {formatPercentage(reports.systemHealth.uptime)}
                    </div>
                    <div className="text-sm text-gray-600">Tiempo Actividad</div>
                    <div className={`text-xs mt-1 ${
                      reports.systemHealth.uptime > 99 ? 'text-green-600' :
                      reports.systemHealth.uptime > 95 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      Excelente
                    </div>
                  </div>

                  <div className="text-center">
                    <div className={`text-3xl font-bold mb-2 ${
                      reports.systemHealth.errorRate < 0.1 ? 'text-green-600' :
                      reports.systemHealth.errorRate < 1 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {formatPercentage(reports.systemHealth.errorRate)}
                    </div>
                    <div className="text-sm text-gray-600">Tasa de Errores</div>
                    <div className={`text-xs mt-1 ${
                      reports.systemHealth.errorRate < 0.1 ? 'text-green-600' :
                      reports.systemHealth.errorRate < 1 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      Muy Baja
                    </div>
                  </div>

                  <div className="text-center">
                    <div className={`text-3xl font-bold mb-2 ${
                      reports.systemHealth.performanceScore > 90 ? 'text-green-600' :
                      reports.systemHealth.performanceScore > 70 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {reports.systemHealth.performanceScore}
                    </div>
                    <div className="text-sm text-gray-600">Rendimiento</div>
                    <div className={`text-xs mt-1 ${
                      reports.systemHealth.performanceScore > 90 ? 'text-green-600' :
                      reports.systemHealth.performanceScore > 70 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      Excelente
                    </div>
                  </div>

                  <div className="text-center">
                    <div className={`text-3xl font-bold mb-2 ${
                      reports.systemHealth.securityScore > 95 ? 'text-green-600' :
                      reports.systemHealth.securityScore > 80 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {reports.systemHealth.securityScore}
                    </div>
                    <div className="text-sm text-gray-600">Seguridad</div>
                    <div className={`text-xs mt-1 ${
                      reports.systemHealth.securityScore > 95 ? 'text-green-600' :
                      reports.systemHealth.securityScore > 80 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      Muy Seguro
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </div>
    </div>
  )
}