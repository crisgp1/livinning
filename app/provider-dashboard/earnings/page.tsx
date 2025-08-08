'use client'

import { useAuth, useUser } from '@clerk/nextjs'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { canAccessProviderDashboard, getProviderDisplayName } from '@/lib/utils/provider-helpers'
import Navigation from '@/components/Navigation'
import {
  Home,
  BarChart3,
  Settings,
  Menu,
  X,
  Wrench,
  Sparkles,
  FileText,
  Users,
  Package,
  TrendingUp,
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  User,
  Phone,
  Mail,
  Star,
  CheckCircle2,
  Download,
  Eye,
  DollarSign,
  Filter,
  Search,
  CreditCard,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  PieChart,
  BarChart,
  TrendingDown
} from 'lucide-react'

interface EarningsData {
  totalEarnings: number
  thisMonth: number
  lastMonth: number
  thisWeek: number
  pendingPayments: number
  completedJobs: number
  averageJobValue: number
  topService: string
}

interface Transaction {
  id: string
  type: 'payment' | 'withdrawal' | 'fee'
  description: string
  amount: number
  date: string
  status: 'completed' | 'pending' | 'failed'
  clientName?: string
  serviceName?: string
  invoiceId?: string
}

interface MonthlyEarning {
  month: string
  amount: number
  jobs: number
}

export default function EarningsPage() {
  const { isLoaded, userId } = useAuth()
  const { user } = useUser()
  const router = useRouter()
  const [hasAccess, setHasAccess] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [earningsData, setEarningsData] = useState<EarningsData | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [monthlyEarnings, setMonthlyEarnings] = useState<MonthlyEarning[]>([])
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month')

  useEffect(() => {
    const checkProviderAccess = async () => {
      if (!isLoaded) return

      if (!userId) {
        router.push('/')
        return
      }

      try {
        const metadata = user?.publicMetadata as any
        const userRole = metadata?.role
        const providerAccess = canAccessProviderDashboard(user)
        
        const hasRoleAccess = userRole === 'supplier' || userRole === 'provider' || providerAccess
        
        if (!hasRoleAccess) {
          router.push('/dashboard')
          return
        }

        setHasAccess(true)
        fetchEarningsData()
      } catch (error) {
        console.error('Error checking provider access:', error)
        router.push('/dashboard')
      } finally {
        setLoading(false)
      }
    }

    checkProviderAccess()
  }, [isLoaded, userId, user, router])

  const fetchEarningsData = async () => {
    try {
      // Simulated earnings data - in real app this would be from an API
      const mockEarningsData: EarningsData = {
        totalEarnings: 45750,
        thisMonth: 12450,
        lastMonth: 8900,
        thisWeek: 3200,
        pendingPayments: 2850,
        completedJobs: 23,
        averageJobValue: 1989,
        topService: 'Limpieza Profunda'
      }

      const mockTransactions: Transaction[] = [
        {
          id: '1',
          type: 'payment',
          description: 'Pago por servicio completado',
          amount: 1800,
          date: '2024-01-15T14:30:00',
          status: 'completed',
          clientName: 'Ana López',
          serviceName: 'Limpieza Profunda Residencial',
          invoiceId: 'INV-001'
        },
        {
          id: '2',
          type: 'payment',
          description: 'Pago por servicio completado',
          amount: 2200,
          date: '2024-01-12T11:15:00',
          status: 'completed',
          clientName: 'Roberto Sánchez',
          serviceName: 'Mantenimiento de Jardín',
          invoiceId: 'INV-002'
        },
        {
          id: '3',
          type: 'fee',
          description: 'Comisión de plataforma (5%)',
          amount: -110,
          date: '2024-01-12T11:16:00',
          status: 'completed'
        },
        {
          id: '4',
          type: 'payment',
          description: 'Pago pendiente',
          amount: 850,
          date: '2024-01-10T16:45:00',
          status: 'pending',
          clientName: 'Carmen Herrera',
          serviceName: 'Reparación de Plomería',
          invoiceId: 'INV-003'
        },
        {
          id: '5',
          type: 'withdrawal',
          description: 'Retiro a cuenta bancaria',
          amount: -5000,
          date: '2024-01-08T09:00:00',
          status: 'completed'
        }
      ]

      const mockMonthlyEarnings: MonthlyEarning[] = [
        { month: 'Ene 2024', amount: 12450, jobs: 8 },
        { month: 'Dic 2023', amount: 8900, jobs: 6 },
        { month: 'Nov 2023', amount: 15200, jobs: 9 },
        { month: 'Oct 2023', amount: 9400, jobs: 5 },
        { month: 'Sep 2023', amount: 11800, jobs: 7 },
        { month: 'Ago 2023', amount: 7650, jobs: 4 }
      ]

      setEarningsData(mockEarningsData)
      setTransactions(mockTransactions)
      setMonthlyEarnings(mockMonthlyEarnings)
    } catch (error) {
      console.error('Error fetching earnings data:', error)
    }
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'payment': return <ArrowUpRight className="w-4 h-4 text-green-600" />
      case 'withdrawal': return <ArrowDownRight className="w-4 h-4 text-blue-600" />
      case 'fee': return <ArrowDownRight className="w-4 h-4 text-red-600" />
      default: return <DollarSign className="w-4 h-4 text-gray-600" />
    }
  }

  const getTransactionColor = (type: string, amount: number) => {
    if (amount > 0) return 'text-green-600'
    if (type === 'withdrawal') return 'text-blue-600'
    return 'text-red-600'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700 border-green-200'
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'failed': return 'bg-red-100 text-red-700 border-red-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const monthlyGrowth = earningsData 
    ? ((earningsData.thisMonth - earningsData.lastMonth) / earningsData.lastMonth * 100) 
    : 0

  if (loading || !isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Acceso Denegado</h1>
          <p className="text-gray-600 mb-6">No tienes permisos para acceder al dashboard de proveedores.</p>
        </div>
      </div>
    )
  }

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, href: '/provider-dashboard' },
    { id: 'assigned-services', label: 'Servicios Asignados', icon: Wrench, href: '/provider-dashboard/assigned' },
    { id: 'work-orders', label: 'Órdenes de Trabajo', icon: FileText, href: '/provider-dashboard/orders' },
    { id: 'completed', label: 'Trabajos Completados', icon: Package, href: '/provider-dashboard/completed' },
    { id: 'clients', label: 'Mis Clientes', icon: Users, href: '/provider-dashboard/clients' },
    { id: 'earnings', label: 'Ganancias', icon: TrendingUp, href: '/provider-dashboard/earnings' },
    { id: 'settings', label: 'Configuración', icon: Settings, href: '/provider-dashboard/settings' },
    { id: 'home', label: 'Ir al Inicio', icon: Home, href: '/' },
  ]

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      <div className="pt-20 flex relative">
        {/* Enhanced Background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-green-200 to-emerald-200 rounded-full filter blur-3xl opacity-60"></div>
          <div className="absolute top-80 -left-40 w-96 h-96 bg-gradient-to-br from-blue-200 to-indigo-200 rounded-full filter blur-3xl opacity-60"></div>
          <div className="absolute bottom-20 right-20 w-72 h-72 bg-gradient-to-br from-yellow-200 to-orange-200 rounded-full filter blur-3xl opacity-40"></div>
        </div>

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-white bg-opacity-50 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div className={`fixed left-0 top-20 h-[calc(100vh-5rem)] w-64 z-50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <div className="m-4 p-6 h-full overflow-y-auto glass-sidebar rounded-2xl">
            {/* User Info */}
            <div className="border-b border-gray-100 pb-6 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-white shadow-lg">
                  {user?.imageUrl ? (
                    <img src={user.imageUrl} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-500 to-emerald-500">
                      <span className="text-white font-medium text-lg">
                        {user?.firstName?.[0] || 'P'}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate text-gray-900">
                    {getProviderDisplayName(user)}
                  </p>
                  <p className="text-xs truncate text-gray-500">
                    Proveedor de Servicios
                  </p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="space-y-2">
              {sidebarItems.map((item) => {
                const isActive = item.href === '/provider-dashboard/earnings'
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      router.push(item.href)
                      setSidebarOpen(false)
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                      isActive
                        ? 'bg-primary text-white shadow-lg shadow-primary/20'
                        : 'text-gray-600 hover:bg-white/50 hover:text-gray-900'
                    }`}
                  >
                    <div className={`p-2 rounded-lg transition-colors ${
                      isActive ? 'bg-white/20' : 'bg-gray-50'
                    }`}>
                      <item.icon size={18} className={isActive ? 'text-white' : ''} />
                    </div>
                    <span className="font-medium text-sm leading-tight">{item.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 lg:ml-0 relative z-10">
          <main className="pb-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              
              {/* Mobile Header */}
              <div className="lg:hidden flex items-center justify-between py-6 border-b border-gray-100">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="p-2 rounded-lg glass-icon-container"
                >
                  <Menu size={20} className="text-gray-700" />
                </button>
                <h1 className="text-xl font-medium text-gray-900">
                  Ganancias
                </h1>
                <button
                  onClick={() => router.push('/provider-dashboard')}
                  className="p-2 rounded-lg glass-icon-container"
                >
                  <ArrowLeft size={20} className="text-gray-700" />
                </button>
              </div>
          
              {/* Header */}
              <div className="mb-8 lg:mb-12 mt-6 lg:mt-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="hidden lg:block"
                >
                  <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium mb-6 glass-icon-container">
                    <div className="w-4 h-4 rounded-full bg-gradient-to-br from-green-600 to-emerald-700 flex items-center justify-center">
                      <TrendingUp className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-gray-700">Ganancias</span>
                  </div>
                  <h1 className="text-4xl md:text-6xl font-light mb-6 text-gray-900">
                    Mis <span className="text-green-600 font-medium">Ganancias</span>
                  </h1>
                  <p className="text-xl max-w-3xl text-gray-600 mb-8">
                    Monitorea tus ingresos, pagos pendientes y el crecimiento de tu negocio 
                    con métricas detalladas y análisis de rendimiento.
                  </p>
                </motion.div>
              </div>

              {/* Main Stats Cards */}
              {earningsData && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
                >
                  <div className="glass-icon-container rounded-2xl p-6 bg-gradient-to-br from-green-50 to-emerald-50">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 rounded-full bg-green-100">
                        <DollarSign className="w-6 h-6 text-green-600" />
                      </div>
                      <TrendingUp className="w-5 h-5 text-green-500" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900 mb-1">
                      ${earningsData.totalEarnings.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600">Ganancias Totales</p>
                  </div>

                  <div className="glass-icon-container rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 rounded-full bg-blue-100">
                        <Calendar className="w-6 h-6 text-blue-600" />
                      </div>
                      {monthlyGrowth > 0 ? (
                        <TrendingUp className="w-5 h-5 text-green-500" />
                      ) : (
                        <TrendingDown className="w-5 h-5 text-red-500" />
                      )}
                    </div>
                    <p className="text-3xl font-bold text-gray-900 mb-1">
                      ${earningsData.thisMonth.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600">Este Mes</p>
                    <p className={`text-xs font-medium ${monthlyGrowth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {monthlyGrowth > 0 ? '+' : ''}{monthlyGrowth.toFixed(1)}% vs mes anterior
                    </p>
                  </div>

                  <div className="glass-icon-container rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 rounded-full bg-yellow-100">
                        <Clock className="w-6 h-6 text-yellow-600" />
                      </div>
                      <ArrowUpRight className="w-5 h-5 text-yellow-500" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900 mb-1">
                      ${earningsData.pendingPayments.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600">Pagos Pendientes</p>
                  </div>

                  <div className="glass-icon-container rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 rounded-full bg-purple-100">
                        <BarChart3 className="w-6 h-6 text-purple-600" />
                      </div>
                      <PieChart className="w-5 h-5 text-purple-500" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900 mb-1">
                      ${earningsData.averageJobValue.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600">Valor Promedio por Trabajo</p>
                    <p className="text-xs text-gray-500">{earningsData.completedJobs} trabajos completados</p>
                  </div>
                </motion.div>
              )}

              {/* Charts and Analytics Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Monthly Earnings Chart */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="glass-icon-container rounded-2xl p-6"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-gray-900">Ganancias Mensuales</h3>
                    <div className="flex gap-2">
                      {['week', 'month', 'year'].map((period) => (
                        <button
                          key={period}
                          onClick={() => setSelectedPeriod(period as any)}
                          className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                            selectedPeriod === period
                              ? 'bg-primary text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {period === 'week' ? 'Semana' : period === 'month' ? 'Mes' : 'Año'}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Simple Bar Chart Visualization */}
                  <div className="space-y-4">
                    {monthlyEarnings.map((earning, index) => {
                      const maxAmount = Math.max(...monthlyEarnings.map(e => e.amount))
                      const widthPercentage = (earning.amount / maxAmount) * 100
                      
                      return (
                        <div key={index} className="relative">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">{earning.month}</span>
                            <span className="text-sm font-bold text-gray-900">${earning.amount.toLocaleString()}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <motion.div
                              className="bg-gradient-to-r from-green-500 to-emerald-600 h-3 rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${widthPercentage}%` }}
                              transition={{ delay: index * 0.1 + 0.5, duration: 0.8 }}
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{earning.jobs} trabajos</p>
                        </div>
                      )
                    })}
                  </div>
                </motion.div>

                {/* Quick Actions */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="space-y-6"
                >
                  <div className="glass-icon-container rounded-2xl p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
                    <div className="space-y-3">
                      <button className="w-full flex items-center gap-3 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                        <div className="p-2 rounded-lg bg-green-100">
                          <Wallet className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="font-medium text-gray-900">Retirar Fondos</p>
                          <p className="text-sm text-gray-600">Transfiere a tu cuenta bancaria</p>
                        </div>
                        <ArrowUpRight className="w-5 h-5 text-gray-400" />
                      </button>

                      <button className="w-full flex items-center gap-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                        <div className="p-2 rounded-lg bg-blue-100">
                          <CreditCard className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="font-medium text-gray-900">Configurar Pagos</p>
                          <p className="text-sm text-gray-600">Métodos de pago y facturación</p>
                        </div>
                        <ArrowUpRight className="w-5 h-5 text-gray-400" />
                      </button>

                      <button className="w-full flex items-center gap-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
                        <div className="p-2 rounded-lg bg-purple-100">
                          <Download className="w-5 h-5 text-purple-600" />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="font-medium text-gray-900">Descargar Reporte</p>
                          <p className="text-sm text-gray-600">Reporte detallado de ingresos</p>
                        </div>
                        <ArrowUpRight className="w-5 h-5 text-gray-400" />
                      </button>
                    </div>
                  </div>

                  {/* Top Service */}
                  {earningsData && (
                    <div className="glass-icon-container rounded-2xl p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Servicio Más Rentable</h3>
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500">
                          <Star className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{earningsData.topService}</p>
                          <p className="text-sm text-gray-600">Tu servicio estrella</p>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              </div>

              {/* Transactions History */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="glass-icon-container rounded-2xl p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">Historial de Transacciones</h3>
                  <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                    <Download size={16} />
                    Exportar
                  </button>
                </div>

                <div className="space-y-4">
                  {transactions.map((transaction, index) => (
                    <motion.div
                      key={transaction.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 + 0.6 }}
                      className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex-shrink-0">
                        {getTransactionIcon(transaction.type)}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{transaction.description}</p>
                        {transaction.clientName && (
                          <p className="text-sm text-gray-600">{transaction.clientName} • {transaction.serviceName}</p>
                        )}
                        <p className="text-xs text-gray-500">
                          {new Date(transaction.date).toLocaleDateString('es-MX', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${getTransactionColor(transaction.type, transaction.amount)}`}>
                          {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toLocaleString()}
                        </p>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(transaction.status)}`}>
                          {transaction.status === 'completed' ? 'Completado' :
                           transaction.status === 'pending' ? 'Pendiente' : 'Fallido'}
                        </span>
                      </div>
                      {transaction.invoiceId && (
                        <button className="p-2 hover:bg-gray-200 rounded-lg">
                          <Eye className="w-4 h-4 text-gray-500" />
                        </button>
                      )}
                    </motion.div>
                  ))}
                </div>

                <div className="flex justify-center mt-6">
                  <button className="px-6 py-2 text-gray-600 hover:text-gray-900 transition-colors">
                    Ver más transacciones
                  </button>
                </div>
              </motion.div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}