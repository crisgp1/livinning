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
  Search,
  Filter,
  MessageSquare,
  MoreVertical,
  Eye,
  UserPlus,
  Heart,
  DollarSign
} from 'lucide-react'

interface Client {
  id: string
  name: string
  email: string
  phone: string
  address: string
  avatar?: string
  joinDate: string
  totalServices: number
  totalSpent: number
  averageRating: number
  lastServiceDate: string
  status: 'active' | 'inactive'
  preferredServices: string[]
  serviceHistory: ServiceHistory[]
  notes: string
}

interface ServiceHistory {
  id: string
  serviceName: string
  date: string
  amount: number
  rating: number
  status: 'completed' | 'cancelled'
}

export default function ClientsPage() {
  const { isLoaded, userId } = useAuth()
  const { user } = useUser()
  const router = useRouter()
  const [hasAccess, setHasAccess] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [clients, setClients] = useState<Client[]>([])
  const [filteredClients, setFilteredClients] = useState<Client[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)

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
        fetchClients()
      } catch (error) {
        console.error('Error checking provider access:', error)
        router.push('/dashboard')
      } finally {
        setLoading(false)
      }
    }

    checkProviderAccess()
  }, [isLoaded, userId, user, router])

  const fetchClients = async () => {
    try {
      // Simulated clients data - in real app this would be from an API
      const mockClients: Client[] = [
        {
          id: '1',
          name: 'Ana López Martínez',
          email: 'ana.lopez@email.com',
          phone: '+52 55 1111 2222',
          address: 'Calle Reforma 789, Polanco, CDMX',
          avatar: '/api/placeholder/100/100',
          joinDate: '2023-08-15',
          totalServices: 8,
          totalSpent: 12450,
          averageRating: 4.8,
          lastServiceDate: '2024-01-10',
          status: 'active',
          preferredServices: ['Limpieza Residencial', 'Limpieza Profunda'],
          notes: 'Cliente VIP, siempre muy puntual con los pagos. Prefiere productos ecológicos.',
          serviceHistory: [
            {
              id: 'h1',
              serviceName: 'Limpieza Profunda Residencial',
              date: '2024-01-10',
              amount: 1800,
              rating: 5,
              status: 'completed'
            },
            {
              id: 'h2',
              serviceName: 'Limpieza Semanal',
              date: '2023-12-28',
              amount: 1200,
              rating: 5,
              status: 'completed'
            }
          ]
        },
        {
          id: '2',
          name: 'Roberto Sánchez Díaz',
          email: 'roberto.sanchez@email.com',
          phone: '+52 55 3333 4444',
          address: 'Av. Universidad 456, Coyoacán, CDMX',
          avatar: '/api/placeholder/100/100',
          joinDate: '2023-09-22',
          totalServices: 5,
          totalSpent: 8900,
          averageRating: 4.2,
          lastServiceDate: '2024-01-08',
          status: 'active',
          preferredServices: ['Mantenimiento de Jardín', 'Poda de Árboles'],
          notes: 'Tiene mascotas en el jardín. Requiere cuidado especial con las plantas.',
          serviceHistory: [
            {
              id: 'h3',
              serviceName: 'Mantenimiento de Jardín Completo',
              date: '2024-01-08',
              amount: 2200,
              rating: 4,
              status: 'completed'
            }
          ]
        },
        {
          id: '3',
          name: 'Carmen Herrera Vega',
          email: 'carmen.herrera@email.com',
          phone: '+52 55 5555 6666',
          address: 'Calle Insurgentes 321, Roma Norte, CDMX',
          joinDate: '2023-11-05',
          totalServices: 3,
          totalSpent: 2850,
          averageRating: 5.0,
          lastServiceDate: '2024-01-05',
          status: 'active',
          preferredServices: ['Plomería', 'Reparaciones Menores'],
          notes: 'Muy detallista, aprecia la explicación técnica de los trabajos realizados.',
          serviceHistory: [
            {
              id: 'h4',
              serviceName: 'Reparación de Plomería',
              date: '2024-01-05',
              amount: 850,
              rating: 5,
              status: 'completed'
            }
          ]
        },
        {
          id: '4',
          name: 'Miguel Torres Ruiz',
          email: 'miguel.torres@email.com',
          phone: '+52 55 7777 8888',
          address: 'Av. Revolución 654, San Ángel, CDMX',
          joinDate: '2023-07-12',
          totalServices: 2,
          totalSpent: 1600,
          averageRating: 3.5,
          lastServiceDate: '2023-12-20',
          status: 'inactive',
          preferredServices: ['Electricidad', 'Instalaciones'],
          notes: 'Cliente ocasional, contactar para servicios de mantenimiento preventivo.',
          serviceHistory: [
            {
              id: 'h5',
              serviceName: 'Instalación Eléctrica',
              date: '2023-12-20',
              amount: 950,
              rating: 4,
              status: 'completed'
            }
          ]
        }
      ]
      setClients(mockClients)
      setFilteredClients(mockClients)
    } catch (error) {
      console.error('Error fetching clients:', error)
    }
  }

  useEffect(() => {
    let filtered = clients

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(client => 
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.phone.includes(searchTerm) ||
        client.address.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(client => client.status === statusFilter)
    }

    setFilteredClients(filtered)
  }, [searchTerm, statusFilter, clients])

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        size={12}
        className={i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}
      />
    ))
  }

  const totalClients = clients.length
  const activeClients = clients.filter(c => c.status === 'active').length
  const totalRevenue = clients.reduce((sum, client) => sum + client.totalSpent, 0)
  const averageClientRating = clients.length > 0 
    ? clients.reduce((sum, client) => sum + client.averageRating, 0) / clients.length 
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
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full filter blur-3xl opacity-60"></div>
          <div className="absolute top-80 -left-40 w-96 h-96 bg-gradient-to-br from-blue-200 to-indigo-200 rounded-full filter blur-3xl opacity-60"></div>
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
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500">
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
                const isActive = item.href === '/provider-dashboard/clients'
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
                  Mis Clientes
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
                    <div className="w-4 h-4 rounded-full bg-gradient-to-br from-purple-600 to-pink-700 flex items-center justify-center">
                      <Users className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-gray-700">Mis Clientes</span>
                  </div>
                  <h1 className="text-4xl md:text-6xl font-light mb-6 text-gray-900">
                    Mis <span className="text-purple-600 font-medium">Clientes</span>
                  </h1>
                  <p className="text-xl max-w-3xl text-gray-600 mb-8">
                    Administra tu cartera de clientes, mantén el contacto y construye 
                    relaciones duraderas para hacer crecer tu negocio.
                  </p>
                </motion.div>
              </div>

              {/* Stats Cards */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
              >
                <div className="glass-icon-container rounded-2xl p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-purple-100">
                      <Users className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{totalClients}</p>
                      <p className="text-sm text-gray-600">Total Clientes</p>
                    </div>
                  </div>
                </div>
                <div className="glass-icon-container rounded-2xl p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-green-100">
                      <Heart className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{activeClients}</p>
                      <p className="text-sm text-gray-600">Clientes Activos</p>
                    </div>
                  </div>
                </div>
                <div className="glass-icon-container rounded-2xl p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-blue-100">
                      <DollarSign className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">${totalRevenue.toLocaleString()}</p>
                      <p className="text-sm text-gray-600">Ingresos Totales</p>
                    </div>
                  </div>
                </div>
                <div className="glass-icon-container rounded-2xl p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-yellow-100">
                      <Star className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{averageClientRating.toFixed(1)}</p>
                      <p className="text-sm text-gray-600">Calificación Promedio</p>
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
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Search */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Buscar clientes..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>

                    {/* Status Filter */}
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as any)}
                      className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="all">Todos los clientes</option>
                      <option value="active">Activos</option>
                      <option value="inactive">Inactivos</option>
                    </select>
                  </div>

                  <button
                    onClick={() => {
                      setSearchTerm('')
                      setStatusFilter('all')
                    }}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Limpiar Filtros
                  </button>
                </div>
              </motion.div>

              {/* Clients List */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredClients.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="lg:col-span-2 glass-icon-container rounded-2xl p-12 text-center"
                  >
                    <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-gray-900 mb-2">
                      No hay clientes
                    </h3>
                    <p className="text-gray-600">
                      Los clientes aparecerán aquí cuando completes servicios para ellos
                    </p>
                  </motion.div>
                ) : (
                  filteredClients.map((client, index) => (
                    <motion.div
                      key={client.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 + 0.4 }}
                      className="glass-icon-container rounded-2xl p-6 hover:shadow-lg transition-all duration-300"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                            {client.avatar ? (
                              <img src={client.avatar} alt={client.name} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-white font-medium text-xl">
                                {client.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                              </span>
                            )}
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg text-gray-900">{client.name}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex items-center gap-1">
                                {renderStars(Math.round(client.averageRating))}
                              </div>
                              <span className="text-sm text-gray-600">({client.averageRating})</span>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium mt-2 inline-block ${
                              client.status === 'active' 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-gray-100 text-gray-700'
                            }`}>
                              {client.status === 'active' ? 'Activo' : 'Inactivo'}
                            </span>
                          </div>
                        </div>
                        <button className="p-2 hover:bg-gray-100 rounded-lg">
                          <MoreVertical className="w-4 h-4 text-gray-500" />
                        </button>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="w-4 h-4" />
                          <span>{client.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone className="w-4 h-4" />
                          <span>{client.phone}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="w-4 h-4" />
                          <span>{client.address}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-gray-900">{client.totalServices}</p>
                          <p className="text-xs text-gray-600">Servicios</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-green-600">${client.totalSpent.toLocaleString()}</p>
                          <p className="text-xs text-gray-600">Total Gastado</p>
                        </div>
                      </div>

                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-900 mb-2">Servicios Preferidos:</p>
                        <div className="flex flex-wrap gap-1">
                          {client.preferredServices.slice(0, 2).map((service, serviceIndex) => (
                            <span
                              key={serviceIndex}
                              className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs"
                            >
                              {service}
                            </span>
                          ))}
                          {client.preferredServices.length > 2 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                              +{client.preferredServices.length - 2}
                            </span>
                          )}
                        </div>
                      </div>

                      {client.notes && (
                        <div className="mb-4 p-3 bg-yellow-50 rounded-lg">
                          <p className="text-sm text-gray-700">{client.notes}</p>
                        </div>
                      )}

                      <div className="flex gap-3">
                        <button
                          onClick={() => setSelectedClient(client)}
                          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm"
                        >
                          <Eye size={14} />
                          Ver Historial
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm">
                          <MessageSquare size={14} />
                          Contactar
                        </button>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>

              {/* Client Details Modal */}
              {selectedClient && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                          {selectedClient.avatar ? (
                            <img src={selectedClient.avatar} alt={selectedClient.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-white font-medium text-xl">
                              {selectedClient.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </span>
                          )}
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900">{selectedClient.name}</h3>
                          <p className="text-gray-600">{selectedClient.email}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedClient(null)}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                      >
                        <X className="w-5 h-5 text-gray-500" />
                      </button>
                    </div>

                    <div className="mb-6">
                      <h4 className="font-semibold text-gray-900 mb-3">Historial de Servicios</h4>
                      <div className="space-y-3">
                        {selectedClient.serviceHistory.map((service) => (
                          <div key={service.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium text-gray-900">{service.serviceName}</p>
                              <p className="text-sm text-gray-600">
                                {new Date(service.date).toLocaleDateString('es-MX')}
                              </p>
                              <div className="flex items-center gap-1 mt-1">
                                {renderStars(service.rating)}
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-green-600">${service.amount.toLocaleString()}</p>
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                service.status === 'completed' 
                                  ? 'bg-green-100 text-green-700' 
                                  : 'bg-red-100 text-red-700'
                              }`}>
                                {service.status === 'completed' ? 'Completado' : 'Cancelado'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors">
                        <Phone size={16} />
                        Llamar
                      </button>
                      <button className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors">
                        <Mail size={16} />
                        Enviar Email
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}