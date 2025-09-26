'use client'

import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart3,
  TrendingUp,
  Eye,
  Users,
  DollarSign,
  Clock,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  ArrowUp,
  ArrowDown,
  Building,
  Star,
  MapPin
} from 'lucide-react'

interface AnalyticsData {
  overview: {
    totalViews: number
    totalInquiries: number
    totalProperties: number
    avgResponseTime: string
    conversionRate: number
    topProperty: string
  }
  trends: {
    viewsChange: number
    inquiriesChange: number
    conversionChange: number
  }
  topPerformingProperties: Array<{
    id: string
    title: string
    views: number
    inquiries: number
    address: string
    image: string
  }>
  timeSeriesData: Array<{
    date: string
    views: number
    inquiries: number
  }>
}

type TimeRange = '7d' | '30d' | '90d' | '1y'

export default function PropertyAnalyticsPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<TimeRange>('30d')
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    if (isLoaded && user) {
      fetchAnalytics()
    }
  }, [user, isLoaded, timeRange])

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true)
      // Simulated analytics data since this is a new feature
      const mockData: AnalyticsData = {
        overview: {
          totalViews: 2847,
          totalInquiries: 156,
          totalProperties: 8,
          avgResponseTime: '2.4 hrs',
          conversionRate: 5.5,
          topProperty: 'Casa en Polanco'
        },
        trends: {
          viewsChange: 15.3,
          inquiriesChange: 8.7,
          conversionChange: -2.1
        },
        topPerformingProperties: [
          {
            id: '1',
            title: 'Casa moderna en Polanco',
            views: 847,
            inquiries: 45,
            address: 'Polanco, CDMX',
            image: '/uploads/properties/a0997005-ace1-4776-9734-52842eb572b3.png'
          },
          {
            id: '2',
            title: 'Departamento en Roma Norte',
            views: 623,
            inquiries: 28,
            address: 'Roma Norte, CDMX',
            image: '/uploads/properties/a0997005-ace1-4776-9734-52842eb572b3.png'
          },
          {
            id: '3',
            title: 'Penthouse en Santa Fe',
            views: 445,
            inquiries: 19,
            address: 'Santa Fe, CDMX',
            image: '/uploads/properties/a0997005-ace1-4776-9734-52842eb572b3.png'
          }
        ],
        timeSeriesData: generateTimeSeriesData(timeRange)
      }

      setAnalyticsData(mockData)
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const generateTimeSeriesData = (range: TimeRange) => {
    const days = range === '7d' ? 7 : range === '30d' ? 30 : range === '90d' ? 90 : 365
    const data = []
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      data.push({
        date: date.toISOString().split('T')[0],
        views: Math.floor(Math.random() * 100) + 20,
        inquiries: Math.floor(Math.random() * 10) + 1
      })
    }
    return data
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchAnalytics()
    setIsRefreshing(false)
  }

  const handleExport = () => {
    alert('Funcionalidad de exportación disponible en el plan Premium.')
  }

  if (!isLoaded || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-primary rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <main className="pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-8 lg:mb-12 mt-6 lg:mt-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 mb-4"
          >
            <div className="p-2 rounded-lg glass">
              <BarChart3 className="w-5 h-5 text-purple-500" />
            </div>
            <span className="text-sm font-medium text-purple-600">Analytics</span>
          </motion.div>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-3xl lg:text-4xl font-light mb-2 text-gray-900">
                Analytics de Propiedades
              </h1>
              <p className="text-lg text-gray-600">
                Monitorea el rendimiento y engagement de tus propiedades
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="btn-secondary flex items-center gap-2"
              >
                <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
                Actualizar
              </button>
              <button
                onClick={handleExport}
                className="btn-primary flex items-center gap-2"
              >
                <Download size={16} />
                Exportar
              </button>
            </div>
          </div>
        </div>

        {/* Time Range Filter */}
        <div className="mb-8">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-gray-500" />
            <span className="text-sm font-medium text-gray-700 mr-2">Período:</span>
            <div className="flex items-center gap-1">
              {[
                { id: '7d', label: '7 días' },
                { id: '30d', label: '30 días' },
                { id: '90d', label: '90 días' },
                { id: '1y', label: '1 año' }
              ].map((range) => (
                <button
                  key={range.id}
                  onClick={() => setTimeRange(range.id as TimeRange)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    timeRange === range.id
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-gray-200 border-t-primary rounded-full animate-spin"></div>
          </div>
        ) : analyticsData ? (
          <div className="space-y-8">

            {/* Overview Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  label: 'Vistas Totales',
                  value: analyticsData.overview.totalViews.toLocaleString(),
                  change: analyticsData.trends.viewsChange,
                  icon: Eye,
                  color: 'from-blue-500 to-cyan-500'
                },
                {
                  label: 'Consultas',
                  value: analyticsData.overview.totalInquiries.toLocaleString(),
                  change: analyticsData.trends.inquiriesChange,
                  icon: Users,
                  color: 'from-green-500 to-emerald-500'
                },
                {
                  label: 'Tasa de Conversión',
                  value: `${analyticsData.overview.conversionRate}%`,
                  change: analyticsData.trends.conversionChange,
                  icon: TrendingUp,
                  color: 'from-purple-500 to-pink-500'
                },
                {
                  label: 'Tiempo de Respuesta',
                  value: analyticsData.overview.avgResponseTime,
                  change: null,
                  icon: Clock,
                  color: 'from-orange-500 to-red-500'
                }
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  className="glass-card p-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color}`}>
                      <stat.icon size={20} className="text-white" />
                    </div>
                    {stat.change !== null && (
                      <div className={`flex items-center gap-1 text-sm ${
                        stat.change > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {stat.change > 0 ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                        <span>{Math.abs(stat.change)}%</span>
                      </div>
                    )}
                  </div>
                  <div className="text-2xl font-light text-gray-900 mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-600">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Performance Chart Placeholder */}
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-medium text-gray-900">
                  Rendimiento en el Tiempo
                </h2>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="text-gray-600">Vistas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-gray-600">Consultas</span>
                  </div>
                </div>
              </div>

              <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <BarChart3 className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">Gráfico de rendimiento</p>
                  <p className="text-xs">Funcionalidad completa disponible en Premium</p>
                </div>
              </div>
            </div>

            {/* Top Performing Properties */}
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-medium text-gray-900">
                  Propiedades con Mejor Rendimiento
                </h2>
                <button
                  onClick={() => router.push('/dashboard/property-management')}
                  className="text-sm text-primary hover:text-primary-hover font-medium"
                >
                  Ver todas
                </button>
              </div>

              <div className="space-y-4">
                {analyticsData.topPerformingProperties.map((property, index) => (
                  <motion.div
                    key={property.id}
                    className="flex items-center gap-4 p-4 rounded-xl bg-gray-50/50 hover:bg-gray-100/50 transition-colors"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="w-12 h-12 rounded-lg bg-gray-200 overflow-hidden flex-shrink-0">
                      <img
                        src={property.image}
                        alt={property.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.style.display = 'none'
                          target.parentElement!.innerHTML = `<div class="w-full h-full flex items-center justify-center"><Building class="w-6 h-6 text-gray-400" /></div>`
                        }}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 line-clamp-1">
                        {property.title}
                      </h3>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <MapPin size={12} />
                        <span>{property.address}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 text-sm">
                      <div className="text-center">
                        <div className="font-medium text-gray-900">{property.views}</div>
                        <div className="text-gray-600">Vistas</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-gray-900">{property.inquiries}</div>
                        <div className="text-gray-600">Consultas</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-green-600">
                          {((property.inquiries / property.views) * 100).toFixed(1)}%
                        </div>
                        <div className="text-gray-600">Conversión</div>
                      </div>
                    </div>

                    <button
                      onClick={() => router.push(`/properties/${property.id}`)}
                      className="p-2 rounded-lg hover:bg-white transition-colors"
                    >
                      <Eye size={16} className="text-gray-400" />
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Insights & Recommendations */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="glass-card p-6">
                <h3 className="font-medium text-gray-900 mb-4">Insights Clave</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>
                    <p className="text-sm text-gray-600">
                      Tus propiedades en Polanco tienen un 23% más de engagement que el promedio
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                    <p className="text-sm text-gray-600">
                      Las propiedades con más de 5 fotos generan 45% más consultas
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-yellow-500 mt-2 flex-shrink-0"></div>
                    <p className="text-sm text-gray-600">
                      Los miércoles y jueves son tus días con mejor rendimiento
                    </p>
                  </div>
                </div>
              </div>

              <div className="glass-card p-6">
                <h3 className="font-medium text-gray-900 mb-4">Recomendaciones</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Star className="w-4 h-4 text-yellow-500 mt-1 flex-shrink-0" />
                    <p className="text-sm text-gray-600">
                      Considera destacar "Casa moderna en Polanco" para maximizar su potencial
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Star className="w-4 h-4 text-yellow-500 mt-1 flex-shrink-0" />
                    <p className="text-sm text-gray-600">
                      Actualiza las fotos de propiedades con menos de 3 imágenes
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Star className="w-4 h-4 text-yellow-500 mt-1 flex-shrink-0" />
                    <p className="text-sm text-gray-600">
                      Reduce tu tiempo de respuesta para mejorar la tasa de conversión
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No hay datos de analytics disponibles</p>
          </div>
        )}

        {/* Premium Features Banner */}
        <div className="mt-12 glass-icon-container rounded-2xl p-8 bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center">
              <BarChart3 className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              Desbloquea Analytics Avanzado
            </h3>
            <p className="text-gray-600 mb-6">
              Obtén insights más profundos, gráficos interactivos, comparaciones de mercado y exportación de datos con nuestro plan Premium.
            </p>
            <button
              onClick={() => router.push('/upgrade-agency')}
              className="btn-primary shadow-lg shadow-primary/20"
            >
              Upgrade a Premium
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}