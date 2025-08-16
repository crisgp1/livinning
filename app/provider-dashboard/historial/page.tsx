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
  Wrench,
  FileText,
  Users,
  Package,
  TrendingUp,
  History,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar,
  Phone,
  MapPin,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  Store
} from 'lucide-react'

interface ServiceHistoryItem {
  id: string
  serviceName: string
  serviceDescription: string
  serviceType: string
  propertyAddress: string
  customerName: string
  customerEmail: string
  contactPhone: string
  amount: number
  currency: string
  status: string
  preferredDate: string
  estimatedDelivery?: string
  actualDelivery?: string
  deliverables: string[]
  notes: string[]
  createdAt: string
  updatedAt: string
}

interface HistoryResponse {
  history: ServiceHistoryItem[]
  pagination: {
    currentPage: number
    totalPages: number
    totalOrders: number
    limit: number
  }
}

export default function ProviderHistorial() {
  const { isLoaded, userId } = useAuth()
  const { user } = useUser()
  const router = useRouter()
  const [hasAccess, setHasAccess] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)
  const [history, setHistory] = useState<ServiceHistoryItem[]>([])
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalOrders: 0,
    limit: 10
  })
  const [loadingHistory, setLoadingHistory] = useState(false)

  useEffect(() => {
    const checkProviderAccess = async () => {
      if (!isLoaded) {
        return
      }

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
      } catch (error) {
        console.error('Error checking provider access:', error)
        router.push('/dashboard')
      } finally {
        setLoading(false)
      }
    }

    checkProviderAccess()
  }, [isLoaded, userId, user, router])

  const fetchHistory = async (page = 1) => {
    setLoadingHistory(true)
    try {
      // Mock data for testing - same as completed jobs
      const mockHistory: ServiceHistoryItem[] = [
        {
          id: '1',
          serviceName: 'Limpieza Profunda Residencial',
          serviceDescription: 'Limpieza completa post-remodelación de departamento',
          serviceType: 'cleaning',
          propertyAddress: 'Calle Reforma 789, Polanco, CDMX',
          customerName: 'Ana López',
          customerEmail: 'ana.lopez@email.com',
          contactPhone: '+52 55 1111 2222',
          amount: 1800,
          currency: 'MXN',
          status: 'completed',
          preferredDate: '2024-01-10T16:30:00',
          estimatedDelivery: '4 horas',
          actualDelivery: '2024-01-10T16:30:00',
          deliverables: ['Limpieza completa', 'Desinfección', 'Aspirado de alfombras'],
          notes: ['Excelente trabajo', 'Cliente muy satisfecho'],
          createdAt: '2024-01-10T12:00:00',
          updatedAt: '2024-01-10T16:30:00'
        },
        {
          id: '2',
          serviceName: 'Mantenimiento de Jardín Completo',
          serviceDescription: 'Poda, riego automático y renovación de áreas verdes',
          serviceType: 'gardening',
          propertyAddress: 'Av. Universidad 456, Coyoacán, CDMX',
          customerName: 'Roberto Sánchez',
          customerEmail: 'roberto.sanchez@email.com',
          contactPhone: '+52 55 3333 4444',
          amount: 2200,
          currency: 'MXN',
          status: 'completed',
          preferredDate: '2024-01-08T14:00:00',
          estimatedDelivery: '6 horas',
          actualDelivery: '2024-01-08T20:00:00',
          deliverables: ['Poda de árboles', 'Sistema de riego', 'Plantación nueva'],
          notes: ['Trabajo bien realizado', 'Cliente contento con el resultado'],
          createdAt: '2024-01-08T08:00:00',
          updatedAt: '2024-01-08T20:00:00'
        },
        {
          id: '3',
          serviceName: 'Reparación de Plomería',
          serviceDescription: 'Reparación de fuga en tubería principal y cambio de válvulas',
          serviceType: 'plumbing',
          propertyAddress: 'Calle Insurgentes 321, Roma Norte, CDMX',
          customerName: 'Carmen Herrera',
          customerEmail: 'carmen.herrera@email.com',
          contactPhone: '+52 55 5555 6666',
          amount: 850,
          currency: 'MXN',
          status: 'completed',
          preferredDate: '2024-01-05T11:45:00',
          estimatedDelivery: '3 horas',
          actualDelivery: '2024-01-05T14:15:00',
          deliverables: ['Reparación de fuga', 'Cambio de válvulas', 'Pruebas de presión'],
          notes: ['Reparación exitosa', 'Sistema funcionando correctamente'],
          createdAt: '2024-01-05T08:00:00',
          updatedAt: '2024-01-05T14:15:00'
        },
        {
          id: '4',
          serviceName: 'Instalación Eléctrica',
          serviceDescription: 'Instalación de nuevos circuitos y tomas de corriente',
          serviceType: 'electrical',
          propertyAddress: 'Colonia Del Valle, Benito Juárez, CDMX',
          customerName: 'Miguel Torres',
          customerEmail: 'miguel.torres@email.com',
          contactPhone: '+52 55 7777 8888',
          amount: 1500,
          currency: 'MXN',
          status: 'cancelled',
          preferredDate: '2024-01-03T09:00:00',
          estimatedDelivery: '5 horas',
          deliverables: [],
          notes: ['Cliente canceló por cambio de planes', 'Reembolso procesado'],
          createdAt: '2024-01-03T08:00:00',
          updatedAt: '2024-01-03T10:00:00'
        }
      ]

      setHistory(mockHistory)
      setPagination({
        currentPage: page,
        totalPages: 1,
        totalOrders: mockHistory.length,
        limit: 10
      })
    } catch (error) {
      console.error('Error fetching history:', error)
    } finally {
      setLoadingHistory(false)
    }
  }

  useEffect(() => {
    if (hasAccess) {
      fetchHistory(1)
    }
  }, [hasAccess])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'in_progress':
        return <Clock className="w-5 h-5 text-blue-500" />
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-500" />
      default:
        return <AlertCircle className="w-5 h-5 text-yellow-500" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendiente'
      case 'in_progress':
        return 'En Progreso'
      case 'completed':
        return 'Completado'
      case 'cancelled':
        return 'Cancelado'
      default:
        return status
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: currency
    }).format(amount)
  }

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
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Volver al Dashboard
          </button>
        </div>
      </div>
    )
  }

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, href: '/provider-dashboard' },
    { id: 'assigned-services', label: 'Asignados', icon: Wrench, href: '/provider-dashboard/assigned' },
    { id: 'work-orders', label: 'Órdenes', icon: FileText, href: '/provider-dashboard/orders' },
    { id: 'completed', label: 'Completados', icon: Package, href: '/provider-dashboard/completed' },
    { id: 'clients', label: 'Clientes', icon: Users, href: '/provider-dashboard/clients' },
    { id: 'earnings', label: 'Ganancias', icon: TrendingUp, href: '/provider-dashboard/earnings' },
    { id: 'vendor-services', label: 'Mis Servicios', icon: Store, href: '/provider-dashboard/vendor-services' },
    { id: 'historial', label: 'Historial', icon: History, href: '/provider-dashboard/historial' },
    { id: 'settings', label: 'Ajustes', icon: Settings, href: '/provider-dashboard/settings' },
    { id: 'home', label: 'Inicio', icon: Home, href: '/' },
  ]

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      <div className="pt-20 flex relative">
        {/* Enhanced Background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-amber-200 to-orange-200 rounded-full filter blur-3xl opacity-60"></div>
          <div className="absolute top-80 -left-40 w-96 h-96 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full filter blur-3xl opacity-60"></div>
          <div className="absolute bottom-20 right-20 w-72 h-72 bg-gradient-to-br from-blue-200 to-indigo-200 rounded-full filter blur-3xl opacity-40"></div>
        </div>

        {/* Sidebar */}
        <div className="w-64 flex-shrink-0">
          <div className="fixed left-0 top-20 h-[calc(100vh-5rem)] w-64 m-4 p-6 overflow-y-auto glass-sidebar rounded-2xl">
            {/* User Info */}
            <div className="border-b border-gray-100 pb-6 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-white shadow-lg">
                  {user?.imageUrl ? (
                    <img src={user.imageUrl} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-500 to-red-500">
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
                const isActive = item.id === 'historial'
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      router.push(item.href)
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
        <div className="flex-1 relative z-10">
          <main className="pb-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              
          
              {/* Header */}
              <div className="mb-8 lg:mb-12 mt-6 lg:mt-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <h1 className="text-4xl md:text-6xl font-light mb-6 text-gray-900">
                    Historial de <span className="text-gray-700 font-medium">Servicios</span>
                  </h1>
                  <p className="text-xl max-w-3xl text-gray-600 mb-8">
                    Revisa tu historial completo de servicios realizados y actividades en la plataforma
                  </p>
                </motion.div>
              </div>

              {/* Stats Cards */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
              >
                <div className="glass-icon-container rounded-2xl p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-green-100">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Servicios Completados</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {history.filter(h => h.status === 'completed').length}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="glass-icon-container rounded-2xl p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-red-100">
                      <XCircle className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Servicios Cancelados</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {history.filter(h => h.status === 'cancelled').length}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* History List */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                {loadingHistory ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : history.length === 0 ? (
                  <div className="text-center py-12 glass-icon-container rounded-2xl">
                    <History className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-gray-900 mb-2">Sin historial</h3>
                    <p className="text-gray-600">No se encontraron servicios en tu historial.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {history.map((item) => (
                      <div key={item.id} className="glass-icon-container rounded-2xl p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              {getStatusIcon(item.status)}
                              <h3 className="text-lg font-medium text-gray-900">{item.serviceName}</h3>
                              <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
                                {getStatusText(item.status)}
                              </span>
                            </div>
                            <p className="text-gray-600 mb-3">{item.serviceDescription}</p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-600">{item.propertyAddress}</span>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-600">{formatDate(item.createdAt)}</span>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-600">{item.contactPhone}</span>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <DollarSign className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-600 font-medium">
                                  {formatCurrency(item.amount, item.currency)}
                                </span>
                              </div>
                            </div>

                            {item.customerName && (
                              <div className="mt-3 text-sm">
                                <span className="text-gray-500">Cliente: </span>
                                <span className="text-gray-900 font-medium">{item.customerName}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {item.notes.length > 0 && (
                          <div className="border-t border-gray-100 pt-4">
                            <h4 className="text-sm font-medium text-gray-900 mb-2">Notas:</h4>
                            <ul className="space-y-1">
                              {item.notes.slice(0, 3).map((note, index) => (
                                <li key={index} className="text-sm text-gray-600">• {note}</li>
                              ))}
                              {item.notes.length > 3 && (
                                <li className="text-sm text-gray-500">+ {item.notes.length - 3} más...</li>
                              )}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="mt-8 flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Mostrando {((pagination.currentPage - 1) * pagination.limit) + 1} - {Math.min(pagination.currentPage * pagination.limit, pagination.totalOrders)} de {pagination.totalOrders} servicios
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => fetchHistory(pagination.currentPage - 1)}
                        disabled={pagination.currentPage === 1}
                        className="p-2 rounded-lg glass-icon-container disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/80 transition-colors"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      
                      <span className="px-4 py-2 text-sm font-medium glass-icon-container rounded-lg">
                        {pagination.currentPage} de {pagination.totalPages}
                      </span>
                      
                      <button
                        onClick={() => fetchHistory(pagination.currentPage + 1)}
                        disabled={pagination.currentPage === pagination.totalPages}
                        className="p-2 rounded-lg glass-icon-container disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/80 transition-colors"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>

            </div>
          </main>
        </div>
      </div>
    </div>
  )
}