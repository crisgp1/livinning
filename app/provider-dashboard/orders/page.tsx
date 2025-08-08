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
  AlertCircle,
  CheckCircle2,
  Play,
  Pause
} from 'lucide-react'

interface WorkOrder {
  id: string
  serviceName: string
  serviceType: string
  clientName: string
  clientEmail: string
  clientPhone: string
  propertyAddress: string
  scheduledDate: string
  estimatedDuration: string
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high'
  description: string
  notes: string[]
  amount: number
  currency: string
}

export default function WorkOrdersPage() {
  const { isLoaded, userId } = useAuth()
  const { user } = useUser()
  const router = useRouter()
  const [hasAccess, setHasAccess] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([])
  const [filter, setFilter] = useState<'all' | 'scheduled' | 'in_progress' | 'completed'>('all')

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
        fetchWorkOrders()
      } catch (error) {
        console.error('Error checking provider access:', error)
        router.push('/dashboard')
      } finally {
        setLoading(false)
      }
    }

    checkProviderAccess()
  }, [isLoaded, userId, user, router])

  const fetchWorkOrders = async () => {
    try {
      // Simulated work orders data - in real app this would be from an API
      const mockOrders: WorkOrder[] = [
        {
          id: '1',
          serviceName: 'Limpieza Profunda Residencial',
          serviceType: 'cleaning',
          clientName: 'María González',
          clientEmail: 'maria.gonzalez@email.com',
          clientPhone: '+52 55 1234 5678',
          propertyAddress: 'Av. Insurgentes 123, Colonia Roma, CDMX',
          scheduledDate: '2024-01-15T09:00:00',
          estimatedDuration: '4 horas',
          status: 'scheduled',
          priority: 'high',
          description: 'Limpieza completa de casa de 3 recámaras después de remodelación',
          notes: ['Cliente requiere productos ecológicos', 'Mascota en casa (gato)'],
          amount: 1500,
          currency: 'MXN'
        },
        {
          id: '2',
          serviceName: 'Mantenimiento de Jardín',
          serviceType: 'gardening',
          clientName: 'Carlos Ruiz',
          clientEmail: 'carlos.ruiz@email.com',
          clientPhone: '+52 55 9876 5432',
          propertyAddress: 'Calle Palmas 456, Las Lomas, CDMX',
          scheduledDate: '2024-01-16T10:30:00',
          estimatedDuration: '3 horas',
          status: 'in_progress',
          priority: 'medium',
          description: 'Poda de árboles, corte de césped y mantenimiento de plantas ornamentales',
          notes: ['Herramientas propias', 'Acceso por la parte trasera de la casa'],
          amount: 800,
          currency: 'MXN'
        },
        // Órdenes completadas para consistencia con la página de trabajos completados
        {
          id: '3',
          serviceName: 'Limpieza Profunda Residencial',
          serviceType: 'cleaning',
          clientName: 'Ana López',
          clientEmail: 'ana.lopez@email.com',
          clientPhone: '+52 55 1111 2222',
          propertyAddress: 'Calle Reforma 789, Polanco, CDMX',
          scheduledDate: '2024-01-10T16:30:00',
          estimatedDuration: '4 horas 15 minutos',
          status: 'completed',
          priority: 'high',
          description: 'Limpieza completa post-remodelación de departamento',
          notes: ['Productos ecológicos utilizados', 'Cliente muy satisfecho'],
          amount: 1800,
          currency: 'MXN'
        },
        {
          id: '4',
          serviceName: 'Mantenimiento de Jardín Completo',
          serviceType: 'gardening',
          clientName: 'Roberto Sánchez',
          clientEmail: 'roberto.sanchez@email.com',
          clientPhone: '+52 55 3333 4444',
          propertyAddress: 'Av. Universidad 456, Coyoacán, CDMX',
          scheduledDate: '2024-01-08T14:00:00',
          estimatedDuration: '6 horas',
          status: 'completed',
          priority: 'medium',
          description: 'Poda, riego automático y renovación de áreas verdes',
          notes: ['Trabajo completado satisfactoriamente', 'Cliente solicita servicios mensuales'],
          amount: 2200,
          currency: 'MXN'
        },
        {
          id: '5',
          serviceName: 'Reparación de Plomería',
          serviceType: 'plumbing',
          clientName: 'Carmen Herrera',
          clientEmail: 'carmen.herrera@email.com',
          clientPhone: '+52 55 5555 6666',
          propertyAddress: 'Calle Insurgentes 321, Roma Norte, CDMX',
          scheduledDate: '2024-01-05T11:45:00',
          estimatedDuration: '2 horas 30 minutos',
          status: 'completed',
          priority: 'high',
          description: 'Reparación de fuga en tubería principal y cambio de válvulas',
          notes: ['Reparación exitosa', 'Sin fugas detectadas en prueba final'],
          amount: 850,
          currency: 'MXN'
        }
      ]
      setWorkOrders(mockOrders)
    } catch (error) {
      console.error('Error fetching work orders:', error)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled': return <Calendar className="w-5 h-5" />
      case 'in_progress': return <Play className="w-5 h-5" />
      case 'completed': return <CheckCircle2 className="w-5 h-5" />
      case 'cancelled': return <X className="w-5 h-5" />
      default: return <Clock className="w-5 h-5" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'in_progress': return 'bg-orange-100 text-orange-700 border-orange-200'
      case 'completed': return 'bg-green-100 text-green-700 border-green-200'
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700'
      case 'medium': return 'bg-yellow-100 text-yellow-700'
      case 'low': return 'bg-green-100 text-green-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const filteredOrders = workOrders.filter(order => {
    if (filter === 'all') return true
    return order.status === filter
  })

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
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-200 to-indigo-200 rounded-full filter blur-3xl opacity-60"></div>
          <div className="absolute top-80 -left-40 w-96 h-96 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full filter blur-3xl opacity-60"></div>
          <div className="absolute bottom-20 right-20 w-72 h-72 bg-gradient-to-br from-green-200 to-emerald-200 rounded-full filter blur-3xl opacity-40"></div>
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
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-500">
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
                const isActive = item.href === '/provider-dashboard/orders'
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
                  Órdenes de Trabajo
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
                    <div className="w-4 h-4 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center">
                      <FileText className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-gray-700">Órdenes de Trabajo</span>
                  </div>
                  <h1 className="text-4xl md:text-6xl font-light mb-6 text-gray-900">
                    Órdenes de <span className="text-blue-600 font-medium">Trabajo</span>
                  </h1>
                  <p className="text-xl max-w-3xl text-gray-600 mb-8">
                    Administra todas tus órdenes de trabajo programadas, en progreso y completadas. 
                    Mantén un control detallado de cada proyecto.
                  </p>
                </motion.div>
              </div>

              {/* Filters */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-8"
              >
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'all', label: 'Todas', count: workOrders.length },
                    { id: 'scheduled', label: 'Programadas', count: workOrders.filter(o => o.status === 'scheduled').length },
                    { id: 'in_progress', label: 'En Progreso', count: workOrders.filter(o => o.status === 'in_progress').length },
                    { id: 'completed', label: 'Completadas', count: workOrders.filter(o => o.status === 'completed').length }
                  ].map((filterOption) => (
                    <button
                      key={filterOption.id}
                      onClick={() => setFilter(filterOption.id as any)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        filter === filterOption.id
                          ? 'bg-primary text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-50 glass-icon-container'
                      }`}
                    >
                      {filterOption.label} ({filterOption.count})
                    </button>
                  ))}
                </div>
              </motion.div>

              {/* Work Orders List */}
              <div className="space-y-6">
                {filteredOrders.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="glass-icon-container rounded-2xl p-12 text-center"
                  >
                    <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-gray-900 mb-2">
                      No hay órdenes de trabajo
                    </h3>
                    <p className="text-gray-600">
                      Las órdenes de trabajo aparecerán aquí cuando tengas servicios programados
                    </p>
                  </motion.div>
                ) : (
                  filteredOrders.map((order, index) => (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 + 0.3 }}
                      className="glass-icon-container rounded-2xl p-6 hover:shadow-lg transition-all duration-300"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <div className="flex items-center gap-3 mb-2">
                                <div className={`p-2 rounded-lg ${getStatusColor(order.status).replace('text-', 'bg-').replace('700', '100')}`}>
                                  {getStatusIcon(order.status)}
                                </div>
                                <div>
                                  <h3 className="font-semibold text-lg text-gray-900">
                                    {order.serviceName}
                                  </h3>
                                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                                    {order.status === 'scheduled' ? 'Programada' :
                                     order.status === 'in_progress' ? 'En Progreso' :
                                     order.status === 'completed' ? 'Completada' : 'Cancelada'}
                                  </span>
                                </div>
                              </div>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(order.priority)}`}>
                                Prioridad {order.priority === 'high' ? 'Alta' : order.priority === 'medium' ? 'Media' : 'Baja'}
                              </span>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold text-green-600">
                                ${order.amount.toLocaleString()} {order.currency}
                              </p>
                            </div>
                          </div>

                          <p className="text-gray-600 mb-4">{order.description}</p>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <User className="w-4 h-4" />
                              <div>
                                <span className="font-medium">{order.clientName}</span>
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                  <Mail className="w-3 h-3" />
                                  <span>{order.clientEmail}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Phone className="w-4 h-4" />
                              <span>{order.clientPhone}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <MapPin className="w-4 h-4" />
                              <span>{order.propertyAddress}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Calendar className="w-4 h-4" />
                              <span>
                                {new Date(order.scheduledDate).toLocaleDateString('es-MX', {
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Clock className="w-4 h-4" />
                              <span>Duración: {order.estimatedDuration}</span>
                            </div>
                          </div>

                          {order.notes.length > 0 && (
                            <div className="mb-4">
                              <h4 className="font-medium text-gray-900 mb-2">Notas importantes:</h4>
                              <ul className="space-y-1">
                                {order.notes.map((note, noteIndex) => (
                                  <li key={noteIndex} className="flex items-start gap-2 text-sm text-gray-600">
                                    <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                                    <span>{note}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          <div className="flex gap-3">
                            <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors">
                              <Play size={16} />
                              {order.status === 'scheduled' ? 'Iniciar Trabajo' : 
                               order.status === 'in_progress' ? 'Marcar Completado' : 'Ver Detalles'}
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                              <Phone size={16} />
                              Contactar Cliente
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}