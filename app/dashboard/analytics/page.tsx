'use client'

import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Navigation from '@/components/Navigation'
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Eye, 
  Heart,
  MessageSquare,
  Users,
  Calendar,
  DollarSign,
  Home,
  Phone,
  Mail,
  MapPin,
  Clock,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  Zap,
  Activity
} from 'lucide-react'

interface AnalyticsData {
  overview: {
    totalViews: number
    totalInquiries: number
    conversionRate: number
    avgTimeOnListing: string
  }
  propertyPerformance: Array<{
    id: string
    title: string
    views: number
    inquiries: number
    favorites: number
    conversionRate: number
    trend: 'up' | 'down' | 'stable'
  }>
  timeBasedData: {
    daily: Array<{ date: string; views: number; inquiries: number }>
    weekly: Array<{ week: string; views: number; inquiries: number }>
    monthly: Array<{ month: string; views: number; inquiries: number }>
  }
  demographics: {
    ageGroups: Array<{ range: string; percentage: number }>
    locations: Array<{ city: string; percentage: number }>
    deviceTypes: Array<{ device: string; percentage: number }>
  }
  inquiryAnalysis: {
    responseTime: string
    inquiryTypes: Array<{ type: string; count: number }>
    peakHours: Array<{ hour: string; count: number }>
  }
}

export default function DashboardAnalytics() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<'daily' | 'weekly' | 'monthly'>('weekly')

  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/sign-in')
    } else if (isLoaded && user) {
      fetchAnalytics()
    }
  }, [user, isLoaded, router])

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true)

      // Fetch real analytics data from API
      const response = await fetch('/api/dashboard/analytics')
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data.data || null)
      } else {
        console.error('Failed to fetch analytics data')
        setAnalytics(null)
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-500" />
      case 'down': return <TrendingDown className="w-4 h-4 text-red-500" />
      default: return <div className="w-4 h-4 rounded-full bg-gray-400" />
    }
  }

  const getConversionColor = (rate: number) => {
    if (rate >= 3) return 'text-green-600'
    if (rate >= 2) return 'text-yellow-600'
    return 'text-red-600'
  }

  if (!isLoaded || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-primary rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      <div className="pt-20 relative">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-200 to-cyan-200 rounded-full filter blur-3xl opacity-60"></div>
          <div className="absolute top-80 -left-40 w-96 h-96 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full filter blur-3xl opacity-60"></div>
          <div className="absolute bottom-20 right-20 w-72 h-72 bg-gradient-to-br from-green-200 to-emerald-200 rounded-full filter blur-3xl opacity-40"></div>
        </div>

        <main className="relative z-10 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* Header */}
            <div className="mb-8 lg:mb-12 mt-6 lg:mt-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 mb-4"
              >
                <div className="p-2 rounded-lg glass">
                  <BarChart3 className="w-5 h-5 text-primary" />
                </div>
                <span className="text-sm font-medium text-primary">Analytics y Estadísticas</span>
              </motion.div>
              
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-3xl lg:text-4xl font-light mb-2 text-gray-900">
                    Analytics
                  </h1>
                  <p className="text-lg text-gray-600">
                    Analiza el rendimiento de tus propiedades y optimiza tu estrategia
                  </p>
                </div>
                
                <div className="flex items-center gap-3">
                  <select
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value as any)}
                    className="px-4 py-2 rounded-xl bg-white/50 backdrop-blur-sm border border-gray-200 text-gray-800 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="daily">Últimos 7 días</option>
                    <option value="weekly">Últimas 4 semanas</option>
                    <option value="monthly">Últimos 6 meses</option>
                  </select>
                </div>
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-2 border-gray-200 border-t-primary rounded-full animate-spin"></div>
              </div>
            ) : analytics ? (
              <div className="space-y-8">
                
                {/* Overview Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="glass-card p-6"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500">
                        <Eye size={20} className="text-white" />
                      </div>
                      <ArrowUpRight className="w-5 h-5 text-green-500" />
                    </div>
                    <div className="text-3xl font-light mb-1 text-gray-900">
                      {analytics.overview.totalViews.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">Total Visualizaciones</div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="glass-card p-6"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500">
                        <MessageSquare size={20} className="text-white" />
                      </div>
                      <ArrowUpRight className="w-5 h-5 text-green-500" />
                    </div>
                    <div className="text-3xl font-light mb-1 text-gray-900">
                      {analytics.overview.totalInquiries}
                    </div>
                    <div className="text-sm text-gray-600">Total Consultas</div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="glass-card p-6"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
                        <Target size={20} className="text-white" />
                      </div>
                      <ArrowUpRight className="w-5 h-5 text-green-500" />
                    </div>
                    <div className="text-3xl font-light mb-1 text-gray-900">
                      {analytics.overview.conversionRate}%
                    </div>
                    <div className="text-sm text-gray-600">Tasa de Conversión</div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="glass-card p-6"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-red-500">
                        <Clock size={20} className="text-white" />
                      </div>
                      <div className="w-5 h-5 rounded-full bg-gray-200"></div>
                    </div>
                    <div className="text-3xl font-light mb-1 text-gray-900">
                      {analytics.overview.avgTimeOnListing}
                    </div>
                    <div className="text-sm text-gray-600">Tiempo Promedio</div>
                  </motion.div>
                </div>

                {/* Property Performance */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="glass-icon-container rounded-2xl p-8"
                >
                  <h2 className="text-2xl font-light mb-6 text-gray-900">Rendimiento por Propiedad</h2>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-100">
                          <th className="text-left py-3 text-sm font-medium text-gray-700">Propiedad</th>
                          <th className="text-left py-3 text-sm font-medium text-gray-700">Visualizaciones</th>
                          <th className="text-left py-3 text-sm font-medium text-gray-700">Consultas</th>
                          <th className="text-left py-3 text-sm font-medium text-gray-700">Favoritos</th>
                          <th className="text-left py-3 text-sm font-medium text-gray-700">Conversión</th>
                          <th className="text-left py-3 text-sm font-medium text-gray-700">Tendencia</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analytics.propertyPerformance.map((property, index) => (
                          <motion.tr
                            key={property.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 + index * 0.1 }}
                            className="border-b border-gray-50 hover:bg-white/50 transition-colors"
                          >
                            <td className="py-4">
                              <div className="font-medium text-gray-900 line-clamp-1">
                                {property.title}
                              </div>
                            </td>
                            <td className="py-4 text-gray-600">
                              {property.views.toLocaleString()}
                            </td>
                            <td className="py-4 text-gray-600">
                              {property.inquiries}
                            </td>
                            <td className="py-4 text-gray-600">
                              {property.favorites}
                            </td>
                            <td className="py-4">
                              <span className={`font-medium ${getConversionColor(property.conversionRate)}`}>
                                {property.conversionRate}%
                              </span>
                            </td>
                            <td className="py-4">
                              {getTrendIcon(property.trend)}
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>

                {/* Demographics & Insights */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  
                  {/* Demographics */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="glass-icon-container rounded-2xl p-8"
                  >
                    <h3 className="text-xl font-light mb-6 text-gray-900">Demografía de Visitantes</h3>
                    
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-sm font-medium mb-3 text-gray-700">Grupos de Edad</h4>
                        <div className="space-y-2">
                          {analytics.demographics.ageGroups.map((group, index) => (
                            <div key={index} className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">{group.range} años</span>
                              <div className="flex items-center gap-2">
                                <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-primary rounded-full transition-all duration-500"
                                    style={{ width: `${group.percentage}%` }}
                                  />
                                </div>
                                <span className="text-sm font-medium text-gray-900 w-8">
                                  {group.percentage}%
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium mb-3 text-gray-700">Ubicaciones</h4>
                        <div className="space-y-2">
                          {analytics.demographics.locations.map((location, index) => (
                            <div key={index} className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">{location.city}</span>
                              <div className="flex items-center gap-2">
                                <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-green-500 rounded-full transition-all duration-500"
                                    style={{ width: `${location.percentage}%` }}
                                  />
                                </div>
                                <span className="text-sm font-medium text-gray-900 w-8">
                                  {location.percentage}%
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Inquiry Analysis */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="glass-icon-container rounded-2xl p-8"
                  >
                    <h3 className="text-xl font-light mb-6 text-gray-900">Análisis de Consultas</h3>
                    
                    <div className="space-y-6">
                      <div className="flex items-center justify-between p-4 rounded-xl glass">
                        <div className="flex items-center gap-3">
                          <Activity className="w-5 h-5 text-primary" />
                          <span className="font-medium text-gray-900">Tiempo de Respuesta</span>
                        </div>
                        <span className="text-primary font-medium">{analytics.inquiryAnalysis.responseTime}</span>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium mb-3 text-gray-700">Tipos de Consulta</h4>
                        <div className="space-y-2">
                          {analytics.inquiryAnalysis.inquiryTypes.map((type, index) => (
                            <div key={index} className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">{type.type}</span>
                              <span className="text-sm font-medium text-gray-900">
                                {type.count}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium mb-3 text-gray-700">Horas Pico de Consultas</h4>
                        <div className="flex items-end justify-between gap-2 h-20">
                          {analytics.inquiryAnalysis.peakHours.map((hour, index) => (
                            <div key={index} className="flex flex-col items-center gap-1">
                              <div 
                                className="w-6 bg-gradient-to-t from-primary to-blue-400 rounded-t-sm transition-all duration-500"
                                style={{ height: `${(hour.count / 89) * 100}%` }}
                              />
                              <span className="text-xs text-gray-500">{hour.hour}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="w-16 h-16 mx-auto mb-6 glass rounded-2xl flex items-center justify-center">
                  <BarChart3 className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium mb-2 text-gray-900">
                  No hay datos disponibles
                </h3>
                <p className="text-sm text-gray-600">
                  Publica propiedades para ver sus estadísticas
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}