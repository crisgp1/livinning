'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  Package, 
  Truck, 
  Settings, 
  Shield, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  X, 
  LayoutDashboard, 
  Home, 
  Menu,
  Wrench,
  ClipboardList,
  Calendar,
  DollarSign,
  TrendingUp,
  Users,
  Star
} from 'lucide-react'
import Navigation from '@/components/Navigation'

interface SupplierOrder {
  id: string
  serviceName: string
  serviceType: string
  clientName: string
  clientEmail: string
  propertyAddress: string
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled'
  amount: number
  currency: string
  requestedDate: string
  acceptedDate?: string
  completedDate?: string
  notes: string[]
  createdAt: string
}

interface SupplierStats {
  totalOrders: number
  completedOrders: number
  pendingOrders: number
  totalEarnings: number
  averageRating: number
  activeClients: number
}

export default function SupplierDashboard() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [isSupplier, setIsSupplier] = useState(false)
  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState<SupplierOrder[]>([])
  const [stats, setStats] = useState<SupplierStats>({
    totalOrders: 0,
    completedOrders: 0,
    pendingOrders: 0,
    totalEarnings: 0,
    averageRating: 0,
    activeClients: 0
  })
  const [activeTab, setActiveTab] = useState('overview')
  const [showMobileSidebar, setShowMobileSidebar] = useState(false)

  // Check supplier status
  useEffect(() => {
    if (isLoaded && user) {
      const metadata = user.publicMetadata as any
      
      // Check if user has supplier role
      const isSupplierUser = metadata?.role === 'supplier'
      
      if (!isSupplierUser) {
        router.push('/dashboard')
        return
      }
      
      setIsSupplier(true)
      fetchSupplierData()
    } else if (isLoaded && !user) {
      router.push('/sign-in')
    }
  }, [user, isLoaded, router])

  const fetchSupplierData = async () => {
    try {
      setLoading(true)
      
      // Mock data for now - you can implement actual API calls
      // Simulating API calls
      setTimeout(() => {
        setStats({
          totalOrders: 24,
          completedOrders: 18,
          pendingOrders: 6,
          totalEarnings: 12450,
          averageRating: 4.8,
          activeClients: 12
        })

        setOrders([
          {
            id: '1',
            serviceName: 'Fotografía Profesional',
            serviceType: 'photography',
            clientName: 'María González',
            clientEmail: 'maria@email.com',
            propertyAddress: 'Calle Principal 123, Madrid',
            status: 'pending',
            amount: 299,
            currency: 'EUR',
            requestedDate: '2024-01-15',
            notes: ['Propiedad de 3 habitaciones', 'Necesita fotos exteriores e interiores'],
            createdAt: '2024-01-10'
          },
          {
            id: '2',
            serviceName: 'Tour Virtual 3D',
            serviceType: 'virtual_tour',
            clientName: 'Carlos Ruiz',
            clientEmail: 'carlos@email.com',
            propertyAddress: 'Avenida Libertad 456, Barcelona',
            status: 'in_progress',
            amount: 599,
            currency: 'EUR',
            requestedDate: '2024-01-12',
            acceptedDate: '2024-01-11',
            notes: ['Apartamento moderno', 'Cliente prefiere mañanas'],
            createdAt: '2024-01-08'
          },
          {
            id: '3',
            serviceName: 'Marketing Package',
            serviceType: 'marketing',
            clientName: 'Ana Torres',
            clientEmail: 'ana@email.com',
            propertyAddress: 'Plaza Central 789, Valencia',
            status: 'completed',
            amount: 899,
            currency: 'EUR',
            requestedDate: '2024-01-05',
            acceptedDate: '2024-01-06',
            completedDate: '2024-01-09',
            notes: ['Package completo entregado', 'Cliente muy satisfecho'],
            createdAt: '2024-01-05'
          }
        ])
        setLoading(false)
      }, 1000)
    } catch (error) {
      console.error('Error fetching supplier data:', error)
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'accepted': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'in_progress': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'completed': return 'bg-green-100 text-green-800 border-green-200'
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendiente'
      case 'accepted': return 'Aceptado'
      case 'in_progress': return 'En Progreso'
      case 'completed': return 'Completado'
      case 'cancelled': return 'Cancelado'
      default: return status
    }
  }

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-primary rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!isSupplier) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-orange-200 to-red-200 rounded-full filter blur-3xl opacity-60"></div>
          <div className="absolute top-80 -left-40 w-96 h-96 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full filter blur-3xl opacity-60"></div>
          <div className="absolute bottom-20 right-20 w-72 h-72 bg-gradient-to-br from-green-200 to-emerald-200 rounded-full filter blur-3xl opacity-40"></div>
        </div>
        
        <div className="text-center relative z-10">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center mx-auto mb-6 glass-icon-container">
            <Package className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-light mb-2 text-gray-900">Acceso Denegado</h1>
          <p className="text-gray-600">No tienes permisos de proveedor de servicios</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-orange-200 to-red-200 rounded-full filter blur-3xl opacity-60"></div>
        <div className="absolute top-80 -left-40 w-96 h-96 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full filter blur-3xl opacity-60"></div>
        <div className="absolute bottom-20 right-20 w-72 h-72 bg-gradient-to-br from-green-200 to-emerald-200 rounded-full filter blur-3xl opacity-40"></div>
      </div>
      
      <div className="pt-20 relative z-10">
        {/* Mobile Header */}
        <div className="lg:hidden px-4 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                <Package className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="font-medium text-gray-900">Supplier</h2>
                <p className="text-xs text-gray-600">Panel de Proveedor</p>
              </div>
            </div>
            <button
              onClick={() => setShowMobileSidebar(true)}
              className="p-2 rounded-lg glass-icon-container text-gray-600 hover:text-gray-900"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>

        <div className="flex">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block w-64 h-screen sticky top-20">
            <div className="glass-icon-container m-4 p-6" style={{ height: 'calc(100vh - 6rem)' }}>
              <div className="border-b border-gray-100 pb-6 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                    <Package className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="font-light text-gray-900">Supplier</h2>
                    <p className="text-xs text-gray-600">Panel de Proveedor</p>
                  </div>
                </div>
              </div>

              <nav className="space-y-2">
                {[
                  { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
                  { id: 'orders', label: 'Órdenes', icon: ClipboardList },
                  { id: 'calendar', label: 'Calendario', icon: Calendar },
                  { id: 'earnings', label: 'Ganancias', icon: DollarSign },
                  { id: 'settings', label: 'Configuración', icon: Settings }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                      activeTab === tab.id 
                        ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                    }`}
                  >
                    <tab.icon size={20} />
                    <span className="font-light">{tab.label}</span>
                  </button>
                ))}
              </nav>

              <div className="absolute bottom-6 left-6 right-6">
                <button 
                  onClick={() => router.push('/dashboard')}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 bg-gray-100 text-gray-700 hover:bg-gray-200"
                >
                  <Home size={20} />
                  <span>Volver al Dashboard</span>
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Sidebar Overlay */}
          {showMobileSidebar && (
            <div 
              className="lg:hidden fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50"
              onClick={() => setShowMobileSidebar(false)}
            >
              <motion.div 
                initial={{ x: -300 }}
                animate={{ x: 0 }}
                exit={{ x: -300 }}
                className="w-80 h-full glass-icon-container"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                        <Package className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="font-light text-gray-900">Supplier</h2>
                        <p className="text-xs text-gray-600">Panel de Proveedor</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowMobileSidebar(false)}
                      className="p-2 rounded-lg text-gray-500 hover:text-gray-700"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <nav className="space-y-2 mb-6">
                    {[
                      { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
                      { id: 'orders', label: 'Órdenes', icon: ClipboardList },
                      { id: 'calendar', label: 'Calendario', icon: Calendar },
                      { id: 'earnings', label: 'Ganancias', icon: DollarSign },
                      { id: 'settings', label: 'Configuración', icon: Settings }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => {
                          setActiveTab(tab.id)
                          setShowMobileSidebar(false)
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                          activeTab === tab.id 
                            ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                            : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                        }`}
                      >
                        <tab.icon size={20} />
                        <span className="font-light">{tab.label}</span>
                      </button>
                    ))}
                  </nav>

                  <button 
                    onClick={() => router.push('/dashboard')}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 bg-gray-100 text-gray-700 hover:bg-gray-200"
                  >
                    <Home size={20} />
                    <span>Volver al Dashboard</span>
                  </button>
                </div>
              </motion.div>
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1 p-4 lg:p-8">
            <div className="max-w-7xl mx-auto">

              {/* Dashboard Header */}
              {activeTab === 'overview' && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-8"
                >
                  <h1 className="text-3xl font-light mb-2 text-gray-900">Dashboard de Proveedor</h1>
                  <p className="text-gray-600">Gestiona tus servicios y órdenes de trabajo</p>
                </motion.div>
              )}

              {activeTab === 'orders' && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-8"
                >
                  <h1 className="text-3xl font-light mb-2 text-gray-900">Mis Órdenes</h1>
                  <p className="text-gray-600">Gestiona todas tus órdenes de servicio</p>
                </motion.div>
              )}

              {/* Overview Content */}
              {activeTab === 'overview' && (
                <div className="space-y-8">
                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="glass-card p-6"
                      whileHover={{ y: -4 }}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-red-500">
                          <ClipboardList className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-xs font-medium text-gray-500">Total</span>
                      </div>
                      <div className="text-3xl font-light mb-1 text-gray-900">{stats.totalOrders}</div>
                      <div className="text-sm text-gray-600">Órdenes</div>
                    </motion.div>

                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="glass-card p-6"
                      whileHover={{ y: -4 }}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500">
                          <DollarSign className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-xs font-medium text-gray-500">Total</span>
                      </div>
                      <div className="text-3xl font-light mb-1 text-gray-900">€{stats.totalEarnings.toLocaleString()}</div>
                      <div className="text-sm text-gray-600">Ganancias</div>
                    </motion.div>

                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="glass-card p-6"
                      whileHover={{ y: -4 }}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500">
                          <Star className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-xs font-medium text-gray-500">Rating</span>
                      </div>
                      <div className="text-3xl font-light mb-1 text-gray-900">{stats.averageRating}</div>
                      <div className="text-sm text-gray-600">Calificación Promedio</div>
                    </motion.div>
                  </div>

                  {/* Recent Orders */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="glass-icon-container rounded-2xl"
                  >
                    <div className="p-6 border-b border-gray-100">
                      <h3 className="text-lg font-light text-gray-900">Órdenes Recientes</h3>
                    </div>
                    <div className="p-6">
                      {orders.slice(0, 3).map((order) => (
                        <div key={order.id} className="flex items-center justify-between py-3 border-b last:border-0 border-gray-100">
                          <div>
                            <h4 className="font-light text-gray-900">{order.serviceName}</h4>
                            <p className="text-sm text-gray-600">{order.clientName} • €{order.amount}</p>
                            <p className="text-xs text-gray-500">{order.propertyAddress}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-3 py-1 text-xs rounded-full font-medium border ${getStatusColor(order.status)}`}>
                              {getStatusLabel(order.status)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </div>
              )}

              {/* Orders Content */}
              {activeTab === 'orders' && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="glass-icon-container rounded-2xl overflow-hidden"
                >
                  <div className="divide-y divide-gray-50">
                    {orders.map((order) => (
                      <div key={order.id} className="p-6 hover:bg-white/50 transition-colors">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-medium text-gray-900">{order.serviceName}</h3>
                              <span className={`px-2 py-1 text-xs rounded-full font-medium border ${getStatusColor(order.status)}`}>
                                {getStatusLabel(order.status)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-1">Cliente: {order.clientName} ({order.clientEmail})</p>
                            <p className="text-sm text-gray-600 mb-2">Propiedad: {order.propertyAddress}</p>
                            <p className="text-xs text-gray-500">Solicitado: {new Date(order.requestedDate).toLocaleDateString('es-ES')}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-light text-gray-900 mb-1">€{order.amount}</div>
                            <div className="flex items-center gap-1">
                              <button className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors">
                                <Eye size={14} />
                              </button>
                              <button className="p-1.5 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors">
                                <Edit size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                        {order.notes.length > 0 && (
                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-xs font-medium text-gray-600 mb-1">Notas:</p>
                            {order.notes.map((note, index) => (
                              <p key={index} className="text-xs text-gray-600">• {note}</p>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Other tabs placeholder content */}
              {(activeTab === 'calendar' || activeTab === 'earnings' || activeTab === 'settings') && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="glass-icon-container rounded-2xl p-8"
                >
                  <h2 className="text-xl font-light mb-4 text-gray-900">
                    {activeTab === 'calendar' && 'Calendario de Servicios'}
                    {activeTab === 'earnings' && 'Ganancias y Pagos'}
                    {activeTab === 'settings' && 'Configuración del Proveedor'}
                  </h2>
                  <p className="text-gray-600">Esta sección estará disponible próximamente...</p>
                </motion.div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  )
}