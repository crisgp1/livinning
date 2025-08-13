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
  History
} from 'lucide-react'

interface CompletedJob {
  id: string
  serviceName: string
  serviceType: string
  clientName: string
  clientEmail: string
  clientPhone: string
  propertyAddress: string
  completedDate: string
  duration: string
  rating: number
  feedback: string
  amount: number
  currency: string
  description: string
  beforePhotos: string[]
  afterPhotos: string[]
  invoiceId: string
  paymentStatus: 'paid' | 'pending' | 'overdue'
}

export default function CompletedJobsPage() {
  const { isLoaded, userId } = useAuth()
  const { user } = useUser()
  const router = useRouter()
  const [hasAccess, setHasAccess] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)
  const [completedJobs, setCompletedJobs] = useState<CompletedJob[]>([])
  const [filteredJobs, setFilteredJobs] = useState<CompletedJob[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [ratingFilter, setRatingFilter] = useState<number | null>(null)
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'paid' | 'pending' | 'overdue'>('all')

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
        fetchCompletedJobs()
      } catch (error) {
        console.error('Error checking provider access:', error)
        router.push('/dashboard')
      } finally {
        setLoading(false)
      }
    }

    checkProviderAccess()
  }, [isLoaded, userId, user, router])

  const fetchCompletedJobs = async () => {
    try {
      // Simulated completed jobs data - in real app this would be from an API
      const mockJobs: CompletedJob[] = [
        {
          id: '1',
          serviceName: 'Limpieza Profunda Residencial',
          serviceType: 'cleaning',
          clientName: 'Ana López',
          clientEmail: 'ana.lopez@email.com',
          clientPhone: '+52 55 1111 2222',
          propertyAddress: 'Calle Reforma 789, Polanco, CDMX',
          completedDate: '2024-01-10T16:30:00',
          duration: '4 horas 15 minutos',
          rating: 5,
          feedback: 'Excelente trabajo, muy detallado y profesional. La casa quedó impecable.',
          amount: 1800,
          currency: 'MXN',
          description: 'Limpieza completa post-remodelación de departamento',
          beforePhotos: ['/api/placeholder/300/200'],
          afterPhotos: ['/api/placeholder/300/200'],
          invoiceId: 'INV-001',
          paymentStatus: 'paid'
        },
        {
          id: '2',
          serviceName: 'Mantenimiento de Jardín Completo',
          serviceType: 'gardening',
          clientName: 'Roberto Sánchez',
          clientEmail: 'roberto.sanchez@email.com',
          clientPhone: '+52 55 3333 4444',
          propertyAddress: 'Av. Universidad 456, Coyoacán, CDMX',
          completedDate: '2024-01-08T14:00:00',
          duration: '6 horas',
          rating: 4,
          feedback: 'Buen trabajo en general, aunque esperaba un poco más de detalle en las plantas ornamentales.',
          amount: 2200,
          currency: 'MXN',
          description: 'Poda, riego automático y renovación de áreas verdes',
          beforePhotos: ['/api/placeholder/300/200'],
          afterPhotos: ['/api/placeholder/300/200'],
          invoiceId: 'INV-002',
          paymentStatus: 'paid'
        },
        {
          id: '3',
          serviceName: 'Reparación de Plomería',
          serviceType: 'plumbing',
          clientName: 'Carmen Herrera',
          clientEmail: 'carmen.herrera@email.com',
          clientPhone: '+52 55 5555 6666',
          propertyAddress: 'Calle Insurgentes 321, Roma Norte, CDMX',
          completedDate: '2024-01-05T11:45:00',
          duration: '2 horas 30 minutos',
          rating: 5,
          feedback: 'Muy rápido y eficiente. Solucionó el problema de inmediato y explicó todo claramente.',
          amount: 850,
          currency: 'MXN',
          description: 'Reparación de fuga en tubería principal y cambio de válvulas',
          beforePhotos: ['/api/placeholder/300/200'],
          afterPhotos: ['/api/placeholder/300/200'],
          invoiceId: 'INV-003',
          paymentStatus: 'pending'
        }
      ]
      setCompletedJobs(mockJobs)
      setFilteredJobs(mockJobs)
    } catch (error) {
      console.error('Error fetching completed jobs:', error)
    }
  }

  useEffect(() => {
    let filtered = completedJobs

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(job => 
        job.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.propertyAddress.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Rating filter
    if (ratingFilter !== null) {
      filtered = filtered.filter(job => job.rating >= ratingFilter)
    }

    // Payment status filter
    if (paymentFilter !== 'all') {
      filtered = filtered.filter(job => job.paymentStatus === paymentFilter)
    }

    setFilteredJobs(filtered)
  }, [searchTerm, ratingFilter, paymentFilter, completedJobs])

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-700 border-green-200'
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'overdue': return 'bg-red-100 text-red-700 border-red-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        size={16}
        className={i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}
      />
    ))
  }

  const totalEarnings = completedJobs.reduce((sum, job) => sum + job.amount, 0)
  const averageRating = completedJobs.length > 0 
    ? completedJobs.reduce((sum, job) => sum + job.rating, 0) / completedJobs.length 
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
    { id: 'assigned-services', label: 'Asignados', icon: Wrench, href: '/provider-dashboard/assigned' },
    { id: 'work-orders', label: 'Órdenes', icon: FileText, href: '/provider-dashboard/orders' },
    { id: 'completed', label: 'Completados', icon: Package, href: '/provider-dashboard/completed' },
    { id: 'clients', label: 'Clientes', icon: Users, href: '/provider-dashboard/clients' },
    { id: 'earnings', label: 'Ganancias', icon: TrendingUp, href: '/provider-dashboard/earnings' },
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
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-green-200 to-emerald-200 rounded-full filter blur-3xl opacity-60"></div>
          <div className="absolute top-80 -left-40 w-96 h-96 bg-gradient-to-br from-blue-200 to-indigo-200 rounded-full filter blur-3xl opacity-60"></div>
          <div className="absolute bottom-20 right-20 w-72 h-72 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full filter blur-3xl opacity-40"></div>
        </div>


        {/* Sidebar */}
        <div className="w-64 flex-shrink-0">
          <div className="fixed left-0 top-20 h-[calc(100vh-5rem)] w-64">
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
                const isActive = item.href === '/provider-dashboard/completed'
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
                  className=""
                >
                  <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium mb-6 glass-icon-container">
                    <div className="w-4 h-4 rounded-full bg-gradient-to-br from-green-600 to-emerald-700 flex items-center justify-center">
                      <Package className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-gray-700">Trabajos Completados</span>
                  </div>
                  <h1 className="text-4xl md:text-6xl font-light mb-6 text-gray-900">
                    Trabajos <span className="text-green-600 font-medium">Completados</span>
                  </h1>
                  <p className="text-xl max-w-3xl text-gray-600 mb-8">
                    Revisa tu historial de trabajos completados, calificaciones recibidas y 
                    el seguimiento de tus ganancias.
                  </p>
                </motion.div>
              </div>

              {/* Stats Cards */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
              >
                <div className="glass-icon-container rounded-2xl p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-green-100">
                      <Package className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{completedJobs.length}</p>
                      <p className="text-sm text-gray-600">Trabajos Completados</p>
                    </div>
                  </div>
                </div>
                <div className="glass-icon-container rounded-2xl p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-yellow-100">
                      <Star className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{averageRating.toFixed(1)}</p>
                      <p className="text-sm text-gray-600">Calificación Promedio</p>
                    </div>
                  </div>
                </div>
                <div className="glass-icon-container rounded-2xl p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-blue-100">
                      <DollarSign className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">${totalEarnings.toLocaleString()}</p>
                      <p className="text-sm text-gray-600">Ganancias Totales</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Filters and Search */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="glass-icon-container rounded-2xl p-6 mb-8"
              >
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Buscar trabajos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  {/* Rating Filter */}
                  <select
                    value={ratingFilter || ''}
                    onChange={(e) => setRatingFilter(e.target.value ? Number(e.target.value) : null)}
                    className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">Todas las calificaciones</option>
                    <option value="5">5 estrellas</option>
                    <option value="4">4+ estrellas</option>
                    <option value="3">3+ estrellas</option>
                  </select>

                  {/* Payment Status Filter */}
                  <select
                    value={paymentFilter}
                    onChange={(e) => setPaymentFilter(e.target.value as any)}
                    className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="all">Todos los pagos</option>
                    <option value="paid">Pagados</option>
                    <option value="pending">Pendientes</option>
                    <option value="overdue">Vencidos</option>
                  </select>

                  {/* Clear Filters */}
                  <button
                    onClick={() => {
                      setSearchTerm('')
                      setRatingFilter(null)
                      setPaymentFilter('all')
                    }}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Limpiar Filtros
                  </button>
                </div>
              </motion.div>

              {/* Completed Jobs List */}
              <div className="space-y-6">
                {filteredJobs.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="glass-icon-container rounded-2xl p-12 text-center"
                  >
                    <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-gray-900 mb-2">
                      No hay trabajos completados
                    </h3>
                    <p className="text-gray-600">
                      Los trabajos completados aparecerán aquí una vez que termines tus servicios
                    </p>
                  </motion.div>
                ) : (
                  filteredJobs.map((job, index) => (
                    <motion.div
                      key={job.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 + 0.4 }}
                      className="glass-icon-container rounded-2xl p-6 hover:shadow-lg transition-all duration-300"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 rounded-lg bg-green-100">
                                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                                </div>
                                <div>
                                  <h3 className="font-semibold text-lg text-gray-900">
                                    {job.serviceName}
                                  </h3>
                                  <div className="flex items-center gap-2 mt-1">
                                    <div className="flex items-center gap-1">
                                      {renderStars(job.rating)}
                                    </div>
                                    <span className="text-sm text-gray-600">({job.rating}/5)</span>
                                  </div>
                                </div>
                              </div>
                              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPaymentStatusColor(job.paymentStatus)}`}>
                                {job.paymentStatus === 'paid' ? 'Pagado' :
                                 job.paymentStatus === 'pending' ? 'Pendiente' : 'Vencido'}
                              </span>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold text-green-600">
                                ${job.amount.toLocaleString()} {job.currency}
                              </p>
                            </div>
                          </div>

                          <p className="text-gray-600 mb-4">{job.description}</p>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <User className="w-4 h-4" />
                              <span>{job.clientName}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Calendar className="w-4 h-4" />
                              <span>
                                {new Date(job.completedDate).toLocaleDateString('es-MX', {
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <MapPin className="w-4 h-4" />
                              <span>{job.propertyAddress}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Clock className="w-4 h-4" />
                              <span>Duración: {job.duration}</span>
                            </div>
                          </div>

                          {job.feedback && (
                            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                              <h4 className="font-medium text-gray-900 mb-2">Comentarios del cliente:</h4>
                              <p className="text-gray-600 text-sm italic">"{job.feedback}"</p>
                            </div>
                          )}

                          <div className="flex gap-3">
                            <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors">
                              <Eye size={16} />
                              Ver Detalles
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                              <Download size={16} />
                              Descargar Factura
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