'use client'

import { useAuth, useUser } from '@clerk/nextjs'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { canAccessProviderDashboard, getProviderDisplayName } from '@/lib/utils/provider-helpers'
import { translateServiceType, translateServiceName } from '@/lib/utils/service-translations'
import Navigation from '@/components/Navigation'
import {
  Home,
  BarChart3,
  Settings,
  Plus,
  Package,
  CheckCircle,
  Clock,
  AlertCircle,
  Wrench,
  FileText,
  Users,
  TrendingUp,
  History,
  Star,
  DollarSign,
  Calendar,
  MapPin,
  Shield,
  Store,
  X
} from 'lucide-react'

interface ApprovedService {
  id: string
  serviceType: string
  serviceName: string
  serviceDescription: string
  approvedBy: string
  approvedAt: string
  pricing: {
    basePrice: number
    currency: string
    priceType: string
  }
  serviceDetails: {
    estimatedDuration?: string
    deliverables: string[]
    requirements: string[]
    specialNotes?: string
  }
}

interface VendorService {
  id: string
  serviceType: string
  serviceName: string
  serviceDescription: string
  isActive: boolean
  isAvailable: boolean
  customPricing?: {
    basePrice: number
    currency: string
    priceType: string
  }
  performance: {
    totalOrders: number
    completedOrders: number
    averageRating: number
    onTimeDelivery: number
  }
  addedAt: string
}

export default function VendorServicesPage() {
  const { isLoaded, userId } = useAuth()
  const { user } = useUser()
  const router = useRouter()
  const [hasAccess, setHasAccess] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)
  const [approvedServices, setApprovedServices] = useState<ApprovedService[]>([])
  const [vendorServices, setVendorServices] = useState<VendorService[]>([])
  const [showAddServiceModal, setShowAddServiceModal] = useState(false)
  const [selectedApprovedService, setSelectedApprovedService] = useState<ApprovedService | null>(null)
  const [addingService, setAddingService] = useState(false)
  const [showRequestModal, setShowRequestModal] = useState(false)
  const [serviceRequests, setServiceRequests] = useState<any[]>([])
  const [submittingRequest, setSubmittingRequest] = useState(false)
  const [showChargeModifyModal, setShowChargeModifyModal] = useState(false)
  const [selectedServiceForCharge, setSelectedServiceForCharge] = useState<VendorService | null>(null)
  const [chargeModifications, setChargeModifications] = useState<any[]>([])
  const [submittingChargeModification, setSubmittingChargeModification] = useState(false)
  const [loadingRequest, setLoadingRequest] = useState(false)

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
        const isInvitedVendor = metadata?.invitedVendor === true
        
        // Allow access for providers, suppliers, or invited vendors
        const hasRoleAccess = userRole === 'supplier' || 
                             userRole === 'provider' || 
                             (userRole === 'vendor' && isInvitedVendor) ||
                             providerAccess
        
        if (!hasRoleAccess) {
          router.push('/dashboard')
          return
        }

        setHasAccess(true)
        await Promise.all([
          fetchApprovedServices(),
          fetchVendorServices(),
          fetchServiceRequests(),
          fetchChargeModifications()
        ])
      } catch (error) {
        console.error('Error checking provider access:', error)
        router.push('/dashboard')
      } finally {
        setLoading(false)
      }
    }

    checkProviderAccess()
  }, [isLoaded, userId, user, router])

  const fetchApprovedServices = async () => {
    try {
      const response = await fetch('/api/vendor-dashboard/approved-services')
      if (response.ok) {
        const data = await response.json()
        setApprovedServices(data.approvedServices)
      }
    } catch (error) {
      console.error('Error fetching approved services:', error)
    }
  }

  const fetchVendorServices = async () => {
    try {
      const response = await fetch('/api/vendor-dashboard/services')
      if (response.ok) {
        const data = await response.json()
        setVendorServices(data.services)
      }
    } catch (error) {
      console.error('Error fetching vendor services:', error)
    }
  }

  const fetchServiceRequests = async () => {
    try {
      const response = await fetch('/api/vendor-dashboard/service-requests')
      if (response.ok) {
        const data = await response.json()
        setServiceRequests(data.requests)
      }
    } catch (error) {
      console.error('Error fetching service requests:', error)
    }
  }

  const fetchChargeModifications = async () => {
    try {
      const response = await fetch('/api/vendor-dashboard/charge-modifications')
      if (response.ok) {
        const data = await response.json()
        setChargeModifications(data.modifications)
      }
    } catch (error) {
      console.error('Error fetching charge modifications:', error)
    }
  }

  const handleAddService = async () => {
    if (!selectedApprovedService) return

    setAddingService(true)
    try {
      const response = await fetch('/api/vendor-dashboard/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          approvedServiceId: selectedApprovedService.id 
        })
      })

      if (response.ok) {
        setShowAddServiceModal(false)
        setSelectedApprovedService(null)
        await fetchVendorServices()
        alert('Servicio agregado exitosamente')
      } else {
        const error = await response.json()
        alert(error.error || 'Error al agregar servicio')
      }
    } catch (error) {
      console.error('Error adding service:', error)
      alert('Error al agregar servicio')
    } finally {
      setAddingService(false)
    }
  }

  const handleChargeModificationRequest = async (formData: { newPrice: number, reason: string, notes?: string }) => {
    if (!selectedServiceForCharge) return

    setSubmittingChargeModification(true)
    try {
      const response = await fetch('/api/vendor-dashboard/charge-modifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: selectedServiceForCharge.id,
          newPrice: formData.newPrice,
          reason: formData.reason,
          notes: formData.notes
        })
      })

      if (response.ok) {
        setShowChargeModifyModal(false)
        setSelectedServiceForCharge(null)
        await fetchChargeModifications()
        alert('Solicitud de modificación de tarifa enviada exitosamente')
      } else {
        const error = await response.json()
        alert(error.error || 'Error al enviar solicitud de modificación')
      }
    } catch (error) {
      console.error('Error submitting charge modification:', error)
      alert('Error al enviar solicitud de modificación')
    } finally {
      setSubmittingChargeModification(false)
    }
  }

  const handleApplyChargeModification = async (modificationId: string) => {
    try {
      const response = await fetch(`/api/vendor-dashboard/charge-modifications/${modificationId}/apply`, {
        method: 'POST'
      })

      if (response.ok) {
        await Promise.all([fetchVendorServices(), fetchChargeModifications()])
        alert('Modificación de tarifa aplicada exitosamente')
      } else {
        const error = await response.json()
        alert(error.error || 'Error al aplicar modificación')
      }
    } catch (error) {
      console.error('Error applying modification:', error)
      alert('Error al aplicar modificación')
    }
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
          <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Acceso Denegado</h1>
          <p className="text-gray-600 mb-6">No tienes permisos para acceder a esta sección.</p>
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

  // Get services that are approved but not yet added
  const availableToAdd = approvedServices.filter(approved => 
    !vendorServices.some(vendor => vendor.serviceType === approved.serviceType)
  )

  const totalOrders = vendorServices.reduce((sum, service) => sum + service.performance.totalOrders, 0)
  const totalCompletedOrders = vendorServices.reduce((sum, service) => sum + service.performance.completedOrders, 0)
  const averageRating = vendorServices.length > 0 
    ? vendorServices.reduce((sum, service) => sum + service.performance.averageRating, 0) / vendorServices.length 
    : 0

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      <div className="pt-20 flex relative">
        {/* Enhanced Background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-200 to-indigo-200 rounded-full filter blur-3xl opacity-60"></div>
          <div className="absolute top-80 -left-40 w-96 h-96 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full filter blur-3xl opacity-60"></div>
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
                const isActive = item.id === 'vendor-services'
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
                  <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium mb-6 glass-icon-container">
                    <div className="w-4 h-4 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center">
                      <Store className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-gray-700">Gestión de Servicios</span>
                  </div>
                  <h1 className="text-4xl md:text-6xl font-light mb-6 text-gray-900">
                    Mis <span className="text-blue-600 font-medium">Servicios</span>
                  </h1>
                  <p className="text-xl max-w-3xl text-gray-600 mb-8">
                    Gestiona tus servicios aprobados y expande tu oferta en la plataforma.
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
                    <div className="p-3 rounded-full bg-blue-100">
                      <Package className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{vendorServices.length}</p>
                      <p className="text-sm text-gray-600">Servicios Activos</p>
                    </div>
                  </div>
                </div>
                
                <div className="glass-icon-container rounded-2xl p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-green-100">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{totalCompletedOrders}</p>
                      <p className="text-sm text-gray-600">Órdenes Completadas</p>
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
                    <div className="p-3 rounded-full bg-purple-100">
                      <Shield className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{approvedServices.length}</p>
                      <p className="text-sm text-gray-600">Servicios Aprobados</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Add Service Section */}
              {availableToAdd.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="glass-icon-container rounded-2xl p-6 mb-8"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Servicios Disponibles para Agregar</h3>
                      <p className="text-gray-600">Tienes {availableToAdd.length} servicios aprobados que puedes agregar</p>
                    </div>
                    <button
                      onClick={() => setShowAddServiceModal(true)}
                      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                    >
                      <Plus size={20} />
                      Agregar Servicio
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Request New Service Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="glass-icon-container rounded-2xl p-6 mb-8"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Solicitar Nuevo Servicio</h3>
                    <p className="text-gray-600">¿Necesitas ofrecer un servicio que no está aprobado? Solicita autorización</p>
                  </div>
                  <button
                    onClick={() => setShowRequestModal(true)}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    <Plus size={20} />
                    Solicitar Servicio
                  </button>
                </div>
                
                {/* Service Requests Status */}
                {serviceRequests.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Solicitudes Recientes:</h4>
                    <div className="space-y-2">
                      {serviceRequests.slice(0, 3).map((request) => (
                        <div key={request.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-sm text-gray-900">{translateServiceName(request.serviceName)}</p>
                            <p className="text-xs text-gray-600">{translateServiceType(request.serviceType)}</p>
                          </div>
                          <div className="text-right">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              request.status === 'approved' ? 'bg-green-100 text-green-700' :
                              request.status === 'rejected' ? 'bg-red-100 text-red-700' :
                              request.status === 'under_review' ? 'bg-blue-100 text-blue-700' :
                              'bg-yellow-100 text-yellow-700'
                            }`}>
                              {request.status === 'pending' ? 'Pendiente' :
                               request.status === 'under_review' ? 'En Revisión' :
                               request.status === 'approved' ? 'Aprobado' : 'Rechazado'}
                            </span>
                          </div>
                        </div>
                      ))}
                      {serviceRequests.length > 3 && (
                        <p className="text-xs text-gray-500 text-center">+{serviceRequests.length - 3} solicitudes más</p>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>

              {/* Modify Service Charges Section - Only for invited vendors */}
              {hasAccess && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.37 }}
                  className="glass-icon-container rounded-2xl p-6 mb-8"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Modificar Tarifas de Servicios</h3>
                      <p className="text-gray-600">Solicita modificaciones autorizadas para las tarifas de tus servicios activos</p>
                    </div>
                    <button
                      onClick={() => {
                        if (vendorServices.length === 0) {
                          alert('Primero debes agregar servicios para poder modificar sus tarifas')
                          return
                        }
                        setShowChargeModifyModal(true)
                      }}
                      disabled={vendorServices.length === 0}
                      className={`flex items-center gap-2 font-medium py-2 px-4 rounded-lg transition-colors ${
                        vendorServices.length === 0
                          ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                          : 'bg-orange-600 hover:bg-orange-700 text-white'
                      }`}
                    >
                      <DollarSign size={20} />
                      Modificar Tarifas
                    </button>
                  </div>
                  
                  {/* Charge Modifications Status */}
                  {chargeModifications.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Modificaciones Recientes:</h4>
                      <div className="space-y-2">
                        {chargeModifications.slice(0, 3).map((modification) => (
                          <div key={modification.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium text-sm text-gray-900">{translateServiceName(modification.serviceName)}</p>
                              <p className="text-xs text-gray-600">
                                ${modification.originalPrice} → ${modification.newPrice} {modification.currency}
                              </p>
                            </div>
                            <div className="text-right flex flex-col gap-1">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                modification.status === 'approved' ? 'bg-green-100 text-green-700' :
                                modification.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                modification.status === 'expired' ? 'bg-gray-100 text-gray-700' :
                                'bg-yellow-100 text-yellow-700'
                              }`}>
                                {modification.status === 'pending' ? 'Pendiente' :
                                 modification.status === 'approved' ? 'Aprobado' :
                                 modification.status === 'rejected' ? 'Rechazado' : 'Expirado'}
                              </span>
                              {modification.status === 'approved' && !modification.appliedAt && (
                                <button
                                  onClick={() => handleApplyChargeModification(modification.id)}
                                  className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded"
                                >
                                  Aplicar
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                        {chargeModifications.length > 3 && (
                          <p className="text-xs text-gray-500 text-center">+{chargeModifications.length - 3} modificaciones más</p>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Current Services */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mb-8"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Mis Servicios Activos</h2>
                
                {vendorServices.length === 0 ? (
                  <div className="glass-icon-container rounded-2xl p-12 text-center">
                    <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-gray-900 mb-2">No tienes servicios activos</h3>
                    <p className="text-gray-600 mb-6">Agrega tus primeros servicios aprobados para comenzar a recibir órdenes</p>
                    {availableToAdd.length > 0 && (
                      <button
                        onClick={() => setShowAddServiceModal(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg"
                      >
                        Agregar Primer Servicio
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {vendorServices.map((service) => (
                      <div key={service.id} className="glass-icon-container rounded-2xl p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-100">
                              <Package className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">{translateServiceName(service.serviceName)}</h3>
                              <p className="text-sm text-gray-600">{translateServiceType(service.serviceType)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {service.isActive && service.isAvailable ? (
                              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            ) : (
                              <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                            )}
                          </div>
                        </div>
                        
                        <p className="text-gray-600 text-sm mb-4">{service.serviceDescription}</p>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">Órdenes</p>
                            <p className="font-medium">{service.performance.totalOrders}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Calificación</p>
                            <p className="font-medium">{service.performance.averageRating.toFixed(1)}/5</p>
                          </div>
                        </div>
                        
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Precio base:</span>
                            <span className="font-medium">
                              ${service.customPricing?.basePrice || 0} {service.customPricing?.currency || 'MXN'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            </div>
          </main>
        </div>
      </div>

      {/* Add Service Modal */}
      {showAddServiceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Agregar Nuevo Servicio</h2>
              <p className="text-gray-600">Selecciona un servicio aprobado para agregar a tu oferta</p>
            </div>
            
            <div className="p-6">
              {availableToAdd.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">No hay servicios aprobados disponibles para agregar.</p>
                  <p className="text-sm text-gray-500 mt-2">Contacta al super administrador para aprobar nuevos servicios.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {availableToAdd.map((service) => (
                    <div key={service.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                         onClick={() => setSelectedApprovedService(service)}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{translateServiceName(service.serviceName)}</h3>
                          <p className="text-sm text-gray-600 mt-1">{service.serviceDescription}</p>
                          <div className="mt-3 grid grid-cols-2 gap-4 text-sm text-gray-500">
                            <div>
                              <span className="font-medium">Tipo:</span> {translateServiceType(service.serviceType)}
                            </div>
                            <div>
                              <span className="font-medium">Precio:</span> ${service.pricing.basePrice} {service.pricing.currency}
                            </div>
                            <div>
                              <span className="font-medium">Duración:</span> {service.serviceDetails.estimatedDuration || 'N/A'}
                            </div>
                            <div>
                              <span className="font-medium">Aprobado:</span> {new Date(service.approvedAt).toLocaleDateString()}
                            </div>
                          </div>
                          {service.serviceDetails.deliverables.length > 0 && (
                            <div className="mt-3">
                              <span className="text-sm font-medium text-gray-700">Entregables:</span>
                              <ul className="text-sm text-gray-600 ml-4 mt-1">
                                {service.serviceDetails.deliverables.slice(0, 3).map((deliverable, index) => (
                                  <li key={index}>• {deliverable}</li>
                                ))}
                                {service.serviceDetails.deliverables.length > 3 && (
                                  <li>• +{service.serviceDetails.deliverables.length - 3} más...</li>
                                )}
                              </ul>
                            </div>
                          )}
                        </div>
                        <input
                          type="radio"
                          name="selectedService"
                          checked={selectedApprovedService?.id === service.id}
                          onChange={() => setSelectedApprovedService(service)}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => {
                  setShowAddServiceModal(false)
                  setSelectedApprovedService(null)
                }}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg"
                disabled={addingService}
              >
                Cancelar
              </button>
              <button
                onClick={handleAddService}
                disabled={!selectedApprovedService || addingService}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-medium py-2 px-4 rounded-lg"
              >
                {addingService ? 'Agregando...' : 'Agregar Servicio'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Service Request Modal */}
      {showRequestModal && (
        <ServiceRequestModal
          onClose={() => setShowRequestModal(false)}
          onSubmit={async (requestData) => {
            setLoadingRequest(true)
            setSubmittingRequest(true)
            try {
              const response = await fetch('/api/vendor-dashboard/service-requests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestData)
              })

              if (response.ok) {
                setShowRequestModal(false)
                await fetchServiceRequests()
                alert('Solicitud enviada exitosamente. Será revisada por el super administrador.')
              } else {
                const error = await response.json()
                alert(error.error || 'Error al enviar solicitud')
              }
            } catch (error) {
              console.error('Error submitting request:', error)
              alert('Error al enviar solicitud')
            } finally {
              setSubmittingRequest(false)
              setLoadingRequest(false)
            }
          }}
          submitting={submittingRequest}
        />
      )}

      {/* Loading Screen for Service Request */}
      {loadingRequest && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60]">
          <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-sm w-full mx-4">
            <div className="flex flex-col items-center">
              <div className="relative mb-6">
                <div className="w-20 h-20 border-4 border-primary/20 rounded-full"></div>
                <div className="absolute top-0 left-0 w-20 h-20 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Procesando Solicitud</h3>
              <p className="text-gray-600 text-center mb-4">Estamos enviando tu solicitud de servicio...</p>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div className="bg-primary h-full rounded-full animate-pulse" style={{ width: '60%' }}></div>
              </div>
              <p className="text-sm text-gray-500 mt-4">Por favor, no cierres esta ventana</p>
            </div>
          </div>
        </div>
      )}

      {/* Charge Modification Modal */}
      {showChargeModifyModal && (
        <ChargeModificationModal
          services={vendorServices}
          onClose={() => {
            setShowChargeModifyModal(false)
            setSelectedServiceForCharge(null)
          }}
          onSubmit={handleChargeModificationRequest}
          submitting={submittingChargeModification}
          selectedService={selectedServiceForCharge}
          onServiceSelect={setSelectedServiceForCharge}
        />
      )}
    </div>
  )
}

// Service Request Modal Component
function ServiceRequestModal({ onClose, onSubmit, submitting }: {
  onClose: () => void
  onSubmit: (data: any) => void
  submitting: boolean
}) {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    serviceType: '',
    serviceName: '',
    serviceDescription: '',
    pricing: {
      basePrice: '',
      currency: 'MXN',
      priceType: 'fixed'
    },
    serviceDetails: {
      estimatedDuration: '',
      deliverables: [''],
      requirements: [''],
      specialNotes: ''
    },
    vendorInfo: {
      experience: '',
      certifications: [''],
      portfolio: [''],
      whyThisService: ''
    }
  })

  const steps = [
    { id: 1, name: 'Información Básica', icon: '📋' },
    { id: 2, name: 'Precios y Detalles', icon: '💰' },
    { id: 3, name: 'Tu Experiencia', icon: '🎯' },
    { id: 4, name: 'Revisión Final', icon: '✅' }
  ]

  const addField = (section: string, field: string) => {
    setFormData(prev => {
      const sectionData = prev[section as keyof typeof prev]
      if (typeof sectionData === 'object' && sectionData !== null) {
        return {
          ...prev,
          [section]: {
            ...sectionData,
            [field]: [...((sectionData as any)[field] as string[] || []), '']
          }
        }
      }
      return prev
    })
  }

  const removeField = (section: string, field: string, index: number) => {
    setFormData(prev => {
      const sectionData = prev[section as keyof typeof prev]
      if (typeof sectionData === 'object' && sectionData !== null) {
        return {
          ...prev,
          [section]: {
            ...sectionData,
            [field]: ((sectionData as any)[field] as string[] || []).filter((_, i) => i !== index)
          }
        }
      }
      return prev
    })
  }

  const updateField = (section: string, field: string, value: any, index?: number) => {
    setFormData(prev => {
      const sectionData = prev[section as keyof typeof prev]
      if (typeof sectionData === 'object' && sectionData !== null) {
        if (index !== undefined) {
          const array = [...((sectionData as any)[field] as string[] || [])]
          array[index] = value
          return {
            ...prev,
            [section]: {
              ...sectionData,
              [field]: array
            }
          }
        } else {
          return {
            ...prev,
            [section]: {
              ...sectionData,
              [field]: value
            }
          }
        }
      }
      return prev
    })
  }

  const validateStep = (step: number) => {
    switch (step) {
      case 1:
        return formData.serviceType && formData.serviceName && formData.serviceDescription
      case 2:
        return formData.pricing.basePrice && parseFloat(formData.pricing.basePrice) > 0
      case 3:
        return formData.vendorInfo.experience && formData.vendorInfo.whyThisService
      default:
        return true
    }
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4))
    } else {
      alert('Por favor completa todos los campos requeridos antes de continuar')
    }
  }

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate all steps
    if (!validateStep(1) || !validateStep(2) || !validateStep(3)) {
      alert('Por favor completa todos los campos requeridos')
      return
    }

    // Clean up empty array items
    const cleanedData = {
      ...formData,
      pricing: {
        ...formData.pricing,
        basePrice: parseFloat(formData.pricing.basePrice)
      },
      serviceDetails: {
        ...formData.serviceDetails,
        deliverables: formData.serviceDetails.deliverables.filter(d => d.trim()),
        requirements: formData.serviceDetails.requirements.filter(r => r.trim())
      },
      vendorInfo: {
        ...formData.vendorInfo,
        certifications: formData.vendorInfo.certifications.filter(c => c.trim()),
        portfolio: formData.vendorInfo.portfolio.filter(p => p.trim())
      }
    }

    onSubmit(cleanedData)
  }

  const renderStep1 = () => (
    <div className="space-y-8">
      <div className="mb-8">
        <h3 className="text-xl font-light text-gray-900 mb-2">
          Información <span className="font-medium">Básica</span>
        </h3>
        <p className="text-gray-600">Proporcione los datos básicos del servicio que desea ofrecer</p>
      </div>

      <div className="space-y-8">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Tipo de Servicio *
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { value: 'cleaning', label: 'Limpieza' },
              { value: 'maintenance', label: 'Mantenimiento' },
              { value: 'electrical', label: 'Eléctrico' },
              { value: 'plumbing', label: 'Plomería' },
              { value: 'painting', label: 'Pintura' },
              { value: 'gardening', label: 'Jardinería' },
              { value: 'carpentry', label: 'Carpintería' },
              { value: 'photography', label: 'Fotografía' },
              { value: 'legal', label: 'Legal' }
            ].map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, serviceType: type.value }))}
                className={`p-4 rounded-xl text-center transition-all duration-200 ${
                  formData.serviceType === type.value
                    ? 'bg-primary text-white shadow-md'
                    : 'bg-white/50 backdrop-blur-sm border border-gray-200 text-gray-700 hover:bg-white hover:shadow-sm'
                }`}
              >
                <div className="text-sm font-medium">{type.label}</div>
              </button>
            ))}
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Nombre del Servicio *
          </label>
          <input
            type="text"
            value={formData.serviceName}
            onChange={(e) => setFormData(prev => ({ ...prev, serviceName: e.target.value }))}
            className="w-full px-4 py-3 rounded-xl bg-white/50 backdrop-blur-sm border border-gray-200 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
            placeholder="Ej: Limpieza Profunda de Oficinas"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Descripción del Servicio *
          </label>
          <textarea
            value={formData.serviceDescription}
            onChange={(e) => setFormData(prev => ({ ...prev, serviceDescription: e.target.value }))}
            rows={5}
            className="w-full px-4 py-3 rounded-xl bg-white/50 backdrop-blur-sm border border-gray-200 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 resize-none"
            placeholder="Describa detalladamente qué incluye este servicio, qué problemas resuelve y qué beneficios ofrece a los clientes..."
          />
        </div>
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-8">
      <div className="mb-8">
        <h3 className="text-xl font-light text-gray-900 mb-2">
          Precios y <span className="font-medium">Detalles</span>
        </h3>
        <p className="text-gray-600">Configure la estructura de precios y especificaciones del servicio</p>
      </div>

      <div className="space-y-8">
        <div>
          <h4 className="text-lg font-medium text-gray-900 mb-6">Estructura de Precios</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Precio Base *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  value={formData.pricing.basePrice}
                  onChange={(e) => updateField('pricing', 'basePrice', e.target.value)}
                  className="w-full pl-8 pr-4 py-3 rounded-xl bg-white/50 backdrop-blur-sm border border-gray-200 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                  placeholder="1500"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Moneda</label>
              <select
                value={formData.pricing.currency}
                onChange={(e) => updateField('pricing', 'currency', e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/50 backdrop-blur-sm border border-gray-200 text-gray-800 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
              >
                <option value="MXN">MXN (Pesos Mexicanos)</option>
                <option value="USD">USD (Dólares)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Tipo de Precio</label>
              <select
                value={formData.pricing.priceType}
                onChange={(e) => updateField('pricing', 'priceType', e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/50 backdrop-blur-sm border border-gray-200 text-gray-800 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
              >
                <option value="fixed">Precio Fijo</option>
                <option value="hourly">Por Hora</option>
                <option value="per_sqft">Por Metro Cuadrado</option>
                <option value="custom">Personalizado</option>
              </select>
            </div>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Duración Estimada</label>
          <input
            type="text"
            value={formData.serviceDetails.estimatedDuration}
            onChange={(e) => updateField('serviceDetails', 'estimatedDuration', e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-white/50 backdrop-blur-sm border border-gray-200 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
            placeholder="Ej: 3-4 horas, 1-2 días, 1 semana"
          />
          <p className="text-sm text-gray-500 mt-1">Tiempo aproximado que toma completar este servicio</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Notas Especiales</label>
          <textarea
            value={formData.serviceDetails.specialNotes}
            onChange={(e) => updateField('serviceDetails', 'specialNotes', e.target.value)}
            rows={4}
            className="w-full px-4 py-3 rounded-xl bg-white/50 backdrop-blur-sm border border-gray-200 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 resize-none"
            placeholder="Información adicional sobre el servicio, materiales incluidos, restricciones, etc."
          />
        </div>
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-8">
      <div className="mb-8">
        <h3 className="text-xl font-light text-gray-900 mb-2">
          Su <span className="font-medium">Experiencia</span>
        </h3>
        <p className="text-gray-600">Proporcione información sobre su experiencia y motivación profesional</p>
      </div>

      <div className="space-y-8">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            ¿Por qué desea ofrecer este servicio? *
          </label>
          <textarea
            value={formData.vendorInfo.whyThisService}
            onChange={(e) => updateField('vendorInfo', 'whyThisService', e.target.value)}
            rows={5}
            className="w-full px-4 py-3 rounded-xl bg-white/50 backdrop-blur-sm border border-gray-200 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 resize-none"
            placeholder="Explique su motivación profesional, el valor que puede aportar y por qué considera importante este servicio"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Experiencia Profesional *
          </label>
          <textarea
            value={formData.vendorInfo.experience}
            onChange={(e) => updateField('vendorInfo', 'experience', e.target.value)}
            rows={5}
            className="w-full px-4 py-3 rounded-xl bg-white/50 backdrop-blur-sm border border-gray-200 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 resize-none"
            placeholder="Describa su experiencia relevante: años de experiencia, proyectos anteriores, clientes atendidos, logros destacados, etc."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Certificaciones (Opcional)
          </label>
          {formData.vendorInfo.certifications.map((cert, index) => (
            <div key={index} className="flex gap-2 mb-3">
              <input
                type="text"
                value={cert}
                onChange={(e) => updateField('vendorInfo', 'certifications', e.target.value, index)}
                className="flex-1 px-4 py-3 rounded-xl bg-white/50 backdrop-blur-sm border border-gray-200 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                placeholder="Nombre de la certificación"
              />
              <button
                type="button"
                onClick={() => removeField('vendorInfo', 'certifications', index)}
                className="px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
              >
                ✕
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => addField('vendorInfo', 'certifications')}
            className="text-primary hover:text-primary-dark text-sm font-medium transition-colors"
          >
            + Agregar certificación
          </button>
        </div>
      </div>
    </div>
  )

  const renderStep4 = () => (
    <div className="space-y-8">
      <div className="mb-8">
        <h3 className="text-xl font-light text-gray-900 mb-2">
          Revisión <span className="font-medium">Final</span>
        </h3>
        <p className="text-gray-600">Verifique que toda la información proporcionada sea correcta antes de enviar</p>
      </div>

      <div className="space-y-8">
        <div className="border border-gray-200 rounded-xl p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-6">Resumen de la Solicitud</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h5 className="font-medium text-gray-700 mb-4">Información del Servicio</h5>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-500">Tipo:</span>
                  <span className="ml-2 font-medium text-gray-900">{formData.serviceType}</span>
                </div>
                <div>
                  <span className="text-gray-500">Nombre:</span>
                  <span className="ml-2 font-medium text-gray-900">{formData.serviceName}</span>
                </div>
                <div>
                  <span className="text-gray-500">Descripción:</span>
                  <p className="mt-1 text-gray-700 text-sm leading-relaxed">{formData.serviceDescription}</p>
                </div>
              </div>
            </div>
            
            <div>
              <h5 className="font-medium text-gray-700 mb-4">Información de Precios</h5>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-500">Precio Base:</span>
                  <span className="ml-2 font-medium text-gray-900">${formData.pricing.basePrice} {formData.pricing.currency}</span>
                </div>
                <div>
                  <span className="text-gray-500">Tipo de Precio:</span>
                  <span className="ml-2 font-medium text-gray-900">{formData.pricing.priceType}</span>
                </div>
                <div>
                  <span className="text-gray-500">Duración Estimada:</span>
                  <span className="ml-2 font-medium text-gray-900">{formData.serviceDetails.estimatedDuration || 'No especificada'}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-gray-100">
            <h5 className="font-medium text-gray-700 mb-3">Motivación Profesional</h5>
            <div className="bg-gray-50 p-4 rounded-xl">
              <p className="text-sm text-gray-700 leading-relaxed">
                {formData.vendorInfo.whyThisService}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-blue-50/50 border border-blue-200 rounded-xl p-6">
          <h4 className="font-medium text-blue-900 mb-4">Proceso de Revisión</h4>
          <div className="space-y-3 text-sm text-blue-800">
            <div className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
              <p>Su solicitud será revisada por nuestro equipo de administración</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
              <p>Recibirá una notificación con la decisión en 2-3 días hábiles</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
              <p>Si es aprobada, el servicio aparecerá en su lista de servicios disponibles</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
              <p>Podrá comenzar a recibir órdenes una vez agregado el servicio</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[85vh] shadow-2xl flex flex-col">
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-light text-gray-900">
                Solicitar <span className="font-medium">Nuevo Servicio</span>
              </h2>
              <p className="text-sm text-gray-500 mt-1">Complete el formulario para solicitar autorización</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              disabled={submitting}
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="px-8 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                    currentStep > step.id
                      ? 'bg-primary text-white'
                      : currentStep === step.id
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-400'
                  }`}>
                    {currentStep > step.id ? (
                      <CheckCircle size={16} />
                    ) : (
                      <span className="text-sm font-medium">{step.id}</span>
                    )}
                  </div>
                  <span className={`ml-3 text-sm font-medium hidden md:block ${
                    currentStep >= step.id ? 'text-gray-900' : 'text-gray-400'
                  }`}>
                    {step.name}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className="flex-1 mx-4">
                    <div className="h-0.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className={`h-full bg-primary transition-all duration-500 ${
                        currentStep > step.id ? 'w-full' : 'w-0'
                      }`} />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="px-8 py-6">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}
          </div>

          {/* Footer */}
          <div className="px-8 py-6 border-t border-gray-100 bg-gray-50/50">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={currentStep === 1 ? onClose : prevStep}
                className="px-6 py-2.5 text-gray-600 hover:text-gray-900 font-medium transition-colors"
                disabled={submitting}
              >
                {currentStep === 1 ? 'Cancelar' : 'Anterior'}
              </button>
              
              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={!validateStep(currentStep)}
                  className="px-8 py-2.5 bg-primary hover:bg-primary-dark disabled:bg-gray-200 disabled:text-gray-400 text-white font-medium rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  Siguiente
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={submitting || !validateStep(1) || !validateStep(2) || !validateStep(3)}
                  className="px-8 py-2.5 bg-primary hover:bg-primary-dark disabled:bg-gray-200 disabled:text-gray-400 text-white font-medium rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  {submitting ? 'Enviando...' : 'Enviar Solicitud'}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

// Charge Modification Modal Component
function ChargeModificationModal({ 
  services, 
  onClose, 
  onSubmit, 
  submitting, 
  selectedService, 
  onServiceSelect 
}: {
  services: VendorService[]
  onClose: () => void
  onSubmit: (data: { newPrice: number, reason: string, notes?: string }) => void
  submitting: boolean
  selectedService: VendorService | null
  onServiceSelect: (service: VendorService) => void
}) {
  const [formData, setFormData] = useState({
    newPrice: '',
    reason: '',
    notes: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedService) {
      alert('Por favor selecciona un servicio')
      return
    }

    if (!formData.newPrice || !formData.reason) {
      alert('Por favor completa todos los campos requeridos')
      return
    }

    const newPrice = parseFloat(formData.newPrice)
    if (isNaN(newPrice) || newPrice <= 0) {
      alert('Por favor ingresa un precio válido')
      return
    }

    const currentPrice = selectedService.customPricing?.basePrice || 0
    if (newPrice === currentPrice) {
      alert('El nuevo precio debe ser diferente al precio actual')
      return
    }

    onSubmit({
      newPrice,
      reason: formData.reason.trim(),
      notes: formData.notes.trim() || undefined
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Solicitar Modificación de Tarifa</h2>
              <p className="text-gray-600">Solicita autorización para modificar el precio de tus servicios</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Service Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Seleccionar Servicio *
              </label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {services.map((service) => (
                  <div
                    key={service.id}
                    onClick={() => onServiceSelect(service)}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedService?.id === service.id
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">{translateServiceName(service.serviceName)}</h3>
                        <p className="text-sm text-gray-600">{translateServiceType(service.serviceType)}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">
                          ${service.customPricing?.basePrice || 0} {service.customPricing?.currency || 'MXN'}
                        </p>
                        <p className="text-xs text-gray-500">Precio actual</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* New Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nuevo Precio * {selectedService && (
                  <span className="text-gray-500 font-normal">
                    (Actual: ${selectedService.customPricing?.basePrice || 0} {selectedService.customPricing?.currency || 'MXN'})
                  </span>
                )}
              </label>
              <div className="flex items-center">
                <span className="text-gray-500 mr-2">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.newPrice}
                  onChange={(e) => setFormData(prev => ({ ...prev, newPrice: e.target.value }))}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="0.00"
                  required
                />
                <span className="text-gray-500 ml-2">MXN</span>
              </div>
            </div>

            {/* Reason */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Razón de la Modificación *
              </label>
              <textarea
                value={formData.reason}
                onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                rows={3}
                placeholder="Explica por qué necesitas modificar el precio de este servicio..."
                required
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notas Adicionales (Opcional)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                rows={2}
                placeholder="Información adicional que pueda ser útil para la aprobación..."
              />
            </div>

            {/* Warning */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-yellow-400 mr-3 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-yellow-800">Importante</h3>
                  <p className="text-sm text-yellow-700 mt-1">
                    Esta solicitud será revisada por el administrador. Una vez aprobada, 
                    podrás aplicar el cambio de precio cuando lo consideres necesario.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting || !selectedService || !formData.newPrice || !formData.reason}
              className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Enviando...' : 'Enviar Solicitud'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}