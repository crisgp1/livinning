'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Users, Building2, Settings, Shield, Plus, Edit, Trash2, Eye, X, LayoutDashboard, Home, Menu, UserCheck } from 'lucide-react'
import Navigation from '@/components/Navigation'
import Modal from '@/components/ui/Modal'
import { useModal } from '@/hooks/useModal'

interface Organization {
  id: string
  name: string
  slug: string
  description: string
  ownerId: string
  status: string
  plan: string
  createdAt: string
  ownerEmail?: string
}

interface Stats {
  totalUsers: number
  totalOrganizations: number
  totalProperties: number
  activeOrganizations: number
  totalProviders: number
  activeProviders: number
}

interface Provider {
  id: string
  userId: string
  businessName: string
  description: string
  status: string
  tier: string
  isVerified: boolean
  rating: {
    averageRating: number
    totalReviews: number
  }
  location: {
    city: string
    state: string
    country: string
  }
  serviceCapabilities: Array<{
    serviceType: string
    basePrice: number
    currency: string
    estimatedDuration: string
    description: string
  }>
  completedJobs: number
  responseTime: number
  createdAt: string
  lastActive: string
}

interface CreateProviderForm {
  userId: string
  businessName: string
  description: string
  serviceTypes: string[]
  city: string
  state: string
  country: string
}

interface CreateOrgForm {
  name: string
  slug: string
  description: string
  ownerId: string
  plan: string
}

export default function SuperAdminDashboard() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<Stats | null>(null)
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [providers, setProviders] = useState<Provider[]>([])
  const [activeTab, setActiveTab] = useState('overview')
  const { isOpen: showCreateModal, openModal: openCreateModal, closeModal: closeCreateModal } = useModal()
  const { isOpen: showCreateProviderModal, openModal: openCreateProviderModal, closeModal: closeCreateProviderModal } = useModal()
  const { isOpen: showViewProviderModal, openModal: openViewProviderModal, closeModal: closeViewProviderModal } = useModal()
  const { isOpen: showEditProviderModal, openModal: openEditProviderModal, closeModal: closeEditProviderModal } = useModal()
  const [showMobileSidebar, setShowMobileSidebar] = useState(false)
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null)
  const [editProviderForm, setEditProviderForm] = useState<CreateProviderForm>({
    userId: '',
    businessName: '',
    description: '',
    serviceTypes: [],
    city: '',
    state: '',
    country: 'México'
  })
  const [isEditingProvider, setIsEditingProvider] = useState(false)
  const [isDeletingProvider, setIsDeletingProvider] = useState<string | null>(null)
  const [createForm, setCreateForm] = useState<CreateOrgForm>({
    name: '',
    slug: '',
    description: '',
    ownerId: '',
    plan: 'free'
  })
  const [createProviderForm, setCreateProviderForm] = useState<CreateProviderForm>({
    userId: '',
    businessName: '',
    description: '',
    serviceTypes: [],
    city: '',
    state: '',
    country: 'México'
  })
  const [isCreating, setIsCreating] = useState(false)
  const [isCreatingProvider, setIsCreatingProvider] = useState(false)

  // Check superadmin status
  useEffect(() => {
    if (isLoaded && user) {
      const metadata = user.publicMetadata as any
      
      // Dynamic superadmin check (same logic as utility function)
      const isSuperAdminUser = metadata?.isSuperAdmin === true ||
        metadata?.role === 'superadmin' ||
        user.emailAddresses?.some(email => email.emailAddress === 'cristiangp2001@gmail.com') // fallback
      
      if (!isSuperAdminUser) {
        router.push('/dashboard')
        return
      }
      
      setIsSuperAdmin(true)
      fetchData()
    } else if (isLoaded && !user) {
      router.push('/sign-in')
    }
  }, [user, isLoaded, router])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch stats, organizations, and providers
      const [statsRes, orgsRes, providersRes] = await Promise.all([
        fetch('/api/superadmin/stats'),
        fetch('/api/superadmin/organizations'),
        fetch('/api/superadmin/providers')
      ])

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData.data)
      }

      if (orgsRes.ok) {
        const orgsData = await orgsRes.json()
        setOrganizations(orgsData.data || [])
      }

      if (providersRes.ok) {
        const providersData = await providersRes.json()
        setProviders(providersData.data || [])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateProvider = async () => {
    if (!createProviderForm.userId || !createProviderForm.businessName || !createProviderForm.city) {
      alert('Por favor completa todos los campos requeridos')
      return
    }

    setIsCreatingProvider(true)
    try {
      const response = await fetch('/api/superadmin/providers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createProviderForm)
      })

      const result = await response.json()

      if (result.success) {
        // Reset form and close modal
        setCreateProviderForm({
          userId: '',
          businessName: '',
          description: '',
          serviceTypes: [],
          city: '',
          state: '',
          country: 'México'
        })
        closeCreateProviderModal()
        // Refresh data
        fetchData()
        alert('Proveedor creado exitosamente')
      } else {
        alert(result.error || 'Error al crear el proveedor')
      }
    } catch (error) {
      console.error('Error creating provider:', error)
      alert('Error al crear el proveedor')
    } finally {
      setIsCreatingProvider(false)
    }
  }

  const handleViewProvider = (provider: Provider) => {
    setSelectedProvider(provider)
    openViewProviderModal()
  }

  const handleEditProvider = (provider: Provider) => {
    setSelectedProvider(provider)
    setEditProviderForm({
      userId: provider.userId,
      businessName: provider.businessName,
      description: provider.description,
      serviceTypes: provider.serviceCapabilities.map(cap => cap.serviceType),
      city: provider.location.city,
      state: provider.location.state,
      country: provider.location.country
    })
    openEditProviderModal()
  }

  const handleUpdateProvider = async () => {
    if (!selectedProvider || !editProviderForm.userId || !editProviderForm.businessName || !editProviderForm.city) {
      alert('Por favor completa todos los campos requeridos')
      return
    }

    setIsEditingProvider(true)
    try {
      const response = await fetch(`/api/superadmin/providers/${selectedProvider.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editProviderForm)
      })

      const result = await response.json()

      if (result.success) {
        closeEditProviderModal()
        fetchData()
        alert('Proveedor actualizado exitosamente')
      } else {
        alert(result.error || 'Error al actualizar el proveedor')
      }
    } catch (error) {
      console.error('Error updating provider:', error)
      alert('Error al actualizar el proveedor')
    } finally {
      setIsEditingProvider(false)
    }
  }

  const handleDeleteProvider = async (providerId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este proveedor? Esta acción no se puede deshacer.')) {
      return
    }

    setIsDeletingProvider(providerId)
    try {
      const response = await fetch(`/api/superadmin/providers/${providerId}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (result.success) {
        fetchData()
        alert('Proveedor eliminado exitosamente')
      } else {
        alert(result.error || 'Error al eliminar el proveedor')
      }
    } catch (error) {
      console.error('Error deleting provider:', error)
      alert('Error al eliminar el proveedor')
    } finally {
      setIsDeletingProvider(null)
    }
  }

  const handleCreateOrganization = async () => {
    if (!createForm.name || !createForm.slug || !createForm.ownerId) {
      alert('Por favor completa todos los campos requeridos')
      return
    }

    setIsCreating(true)
    try {
      const response = await fetch('/api/superadmin/organizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createForm)
      })

      const result = await response.json()

      if (result.success) {
        // Reset form and close modal
        setCreateForm({
          name: '',
          slug: '',
          description: '',
          ownerId: '',
          plan: 'free'
        })
        closeCreateModal()
        // Refresh data
        fetchData()
        alert('Organización creada exitosamente')
      } else {
        alert(result.error || 'Error al crear la organización')
      }
    } catch (error) {
      console.error('Error creating organization:', error)
      alert('Error al crear la organización')
    } finally {
      setIsCreating(false)
    }
  }

  // Auto-generate slug from name
  const handleNameChange = (name: string) => {
    setCreateForm(prev => ({
      ...prev,
      name,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    }))
  }

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-primary rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!isSuperAdmin) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-200 to-cyan-200 rounded-full filter blur-3xl opacity-60"></div>
          <div className="absolute top-80 -left-40 w-96 h-96 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full filter blur-3xl opacity-60"></div>
          <div className="absolute bottom-20 right-20 w-72 h-72 bg-gradient-to-br from-green-200 to-emerald-200 rounded-full filter blur-3xl opacity-40"></div>
        </div>
        
        <div className="text-center relative z-10">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center mx-auto mb-6 glass-icon-container">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-light mb-2 text-gray-900">Acceso Denegado</h1>
          <p className="text-gray-600">No tienes permisos de superadministrador</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-200 to-cyan-200 rounded-full filter blur-3xl opacity-60"></div>
        <div className="absolute top-80 -left-40 w-96 h-96 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full filter blur-3xl opacity-60"></div>
        <div className="absolute bottom-20 right-20 w-72 h-72 bg-gradient-to-br from-green-200 to-emerald-200 rounded-full filter blur-3xl opacity-40"></div>
      </div>
      
      <div className="pt-20 relative z-10">
        {/* Mobile Header */}
        <div className="lg:hidden px-4 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="font-medium text-gray-900">Superadmin</h2>
                <p className="text-xs text-gray-600">Panel de Control</p>
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
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="font-light text-gray-900">Superadmin</h2>
                    <p className="text-xs text-gray-600">Panel de Control</p>
                  </div>
                </div>
              </div>

              <nav className="space-y-2">
                {[
                  { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
                  { id: 'organizations', label: 'Organizaciones', icon: Building2 },
                  { id: 'providers', label: 'Proveedores', icon: UserCheck },
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
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <Shield className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="font-light text-gray-900">Superadmin</h2>
                        <p className="text-xs text-gray-600">Panel de Control</p>
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
                      { id: 'organizations', label: 'Organizaciones', icon: Building2 },
                      { id: 'providers', label: 'Proveedores', icon: UserCheck },
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
                <h1 className="text-3xl font-light mb-2 text-gray-900">Dashboard</h1>
                <p className="text-gray-600">Vista general del sistema y estadísticas</p>
              </motion.div>
            )}

            {activeTab === 'organizations' && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h1 className="text-2xl lg:text-3xl font-light mb-2 text-gray-900">Organizaciones</h1>
                    <p className="text-gray-600">Gestiona todas las organizaciones del sistema</p>
                  </div>
                  <button
                    onClick={openCreateModal}
                    className="btn-primary flex items-center gap-2 w-full sm:w-auto justify-center"
                  >
                    <Plus size={20} />
                    <span className="hidden sm:inline">Nueva Organización</span>
                    <span className="sm:hidden">Nueva</span>
                  </button>
                </div>
              </motion.div>
            )}

            {activeTab === 'providers' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h1 className="text-2xl lg:text-3xl font-light mb-2 text-gray-900">Proveedores</h1>
                    <p className="text-gray-600">Gestiona todos los proveedores de servicios del sistema</p>
                  </div>
                  <button
                    onClick={openCreateProviderModal}
                    className="btn-primary flex items-center gap-2 w-full sm:w-auto justify-center"
                  >
                    <Plus size={20} />
                    <span className="hidden sm:inline">Nuevo Proveedor</span>
                    <span className="sm:hidden">Nuevo</span>
                  </button>
                </div>
              </motion.div>
            )}

            {activeTab === 'settings' && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
              >
                <h1 className="text-3xl font-light mb-2 text-gray-900">Configuración</h1>
                <p className="text-gray-600">Configuraciones del sistema y parámetros globales</p>
              </motion.div>
            )}

            {/* Overview Content */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Stats Cards */}
                {stats && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 lg:gap-6">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="glass-card p-6"
                      whileHover={{ y: -4 }}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500">
                          <Users className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-xs font-medium text-gray-500">Total</span>
                      </div>
                      <div className="text-3xl font-light mb-1 text-gray-900">{stats.totalUsers}</div>
                      <div className="text-sm text-gray-600">Usuarios</div>
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
                          <Building2 className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-xs font-medium text-gray-500">Total</span>
                      </div>
                      <div className="text-3xl font-light mb-1 text-gray-900">{stats.totalOrganizations}</div>
                      <div className="text-sm text-gray-600">Organizaciones</div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="glass-card p-6"
                      whileHover={{ y: -4 }}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
                          <Home className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-xs font-medium text-gray-500">Total</span>
                      </div>
                      <div className="text-3xl font-light mb-1 text-gray-900">{stats.totalProperties}</div>
                      <div className="text-sm text-gray-600">Propiedades</div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="glass-card p-6"
                      whileHover={{ y: -4 }}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-red-500">
                          <Shield className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-xs font-medium text-gray-500">Activas</span>
                      </div>
                      <div className="text-3xl font-light mb-1 text-gray-900">{stats.activeOrganizations}</div>
                      <div className="text-sm text-gray-600">Org. Activas</div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="glass-card p-6"
                      whileHover={{ y: -4 }}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-teal-500 to-green-500">
                          <UserCheck className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-xs font-medium text-gray-500">Total</span>
                      </div>
                      <div className="text-3xl font-light mb-1 text-gray-900">{stats.totalProviders}</div>
                      <div className="text-sm text-gray-600">Proveedores</div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                      className="glass-card p-6"
                      whileHover={{ y: -4 }}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500">
                          <UserCheck className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-xs font-medium text-gray-500">Activos</span>
                      </div>
                      <div className="text-3xl font-light mb-1 text-gray-900">{stats.activeProviders}</div>
                      <div className="text-sm text-gray-600">Prov. Activos</div>
                    </motion.div>
                  </div>
                )}

                {/* Recent Organizations */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="glass-icon-container rounded-2xl"
                >
                  <div className="p-6 border-b border-gray-100">
                    <h3 className="text-lg font-light text-gray-900">Organizaciones Recientes</h3>
                  </div>
                  <div className="p-6">
                    {organizations.slice(0, 5).map((org) => (
                      <div key={org.id} className="flex items-center justify-between py-3 border-b last:border-0 border-gray-100">
                        <div>
                          <h4 className="font-light text-gray-900">{org.name}</h4>
                          <p className="text-sm text-gray-600">{org.slug} • {org.plan}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 text-xs rounded-full font-medium ${
                            org.status === 'active' 
                              ? 'bg-green-100 text-green-700 border border-green-200' 
                              : 'bg-red-100 text-red-700 border border-red-200'
                          }`}>
                            {org.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>
            )}

            {/* Organizations Content */}
            {activeTab === 'organizations' && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-icon-container rounded-2xl overflow-hidden"
              >
                {/* Desktop Table */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                          Organización
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                          Plan
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                          Estado
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                          Creado
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {organizations.map((org) => (
                        <tr key={org.id} className="hover:bg-white/50 transition-colors">
                          <td className="px-6 py-4">
                            <div>
                              <div className="font-medium text-gray-900">{org.name}</div>
                              <div className="text-sm text-gray-600">{org.slug}</div>
                              {org.ownerEmail && (
                                <div className="text-xs text-gray-500">{org.ownerEmail}</div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 text-xs rounded-full font-medium ${
                              org.plan === 'free' ? 'bg-gray-100 text-gray-700 border border-gray-200' :
                              org.plan === 'basic' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                              org.plan === 'premium' ? 'bg-purple-100 text-purple-700 border border-purple-200' :
                              'bg-yellow-100 text-yellow-700 border border-yellow-200'
                            }`}>
                              {org.plan.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 text-xs rounded-full font-medium ${
                              org.status === 'active' 
                                ? 'bg-green-100 text-green-700 border border-green-200' 
                                : 'bg-red-100 text-red-700 border border-red-200'
                            }`}>
                              {org.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {new Date(org.createdAt).toLocaleDateString('es-ES')}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <button className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors">
                                <Eye size={16} />
                              </button>
                              <button className="p-2 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors">
                                <Edit size={16} />
                              </button>
                              <button className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="lg:hidden divide-y divide-gray-50">
                  {organizations.map((org) => (
                    <div key={org.id} className="p-4 hover:bg-white/50 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 mb-1">{org.name}</div>
                          <div className="text-sm text-gray-600 mb-1">{org.slug}</div>
                          {org.ownerEmail && (
                            <div className="text-xs text-gray-500">{org.ownerEmail}</div>
                          )}
                        </div>
                        <div className="flex items-center gap-1 ml-4">
                          <button className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors">
                            <Eye size={14} />
                          </button>
                          <button className="p-1.5 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors">
                            <Edit size={14} />
                          </button>
                          <button className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                            org.plan === 'free' ? 'bg-gray-100 text-gray-700 border border-gray-200' :
                            org.plan === 'basic' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                            org.plan === 'premium' ? 'bg-purple-100 text-purple-700 border border-purple-200' :
                            'bg-yellow-100 text-yellow-700 border border-yellow-200'
                          }`}>
                            {org.plan.toUpperCase()}
                          </span>
                          <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                            org.status === 'active' 
                              ? 'bg-green-100 text-green-700 border border-green-200' 
                              : 'bg-red-100 text-red-700 border border-red-200'
                          }`}>
                            {org.status.toUpperCase()}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(org.createdAt).toLocaleDateString('es-ES')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Providers Content */}
            {activeTab === 'providers' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-icon-container rounded-2xl overflow-hidden"
              >
                {/* Desktop Table */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                          Proveedor
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                          Servicios
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                          Estado
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                          Rating
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                          Ubicación
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {providers.map((provider) => (
                        <tr key={provider.id} className="hover:bg-white/50 transition-colors">
                          <td className="px-6 py-4">
                            <div>
                              <div className="font-medium text-gray-900">{provider.businessName}</div>
                              <div className="text-sm text-gray-600">{provider.description}</div>
                              <div className="text-xs text-gray-500">
                                {provider.completedJobs} trabajos • {provider.responseTime}min respuesta
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-1">
                              {provider.serviceCapabilities.slice(0, 2).map((service, index) => (
                                <span key={index} className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700 border border-blue-200">
                                  {service.serviceType}
                                </span>
                              ))}
                              {provider.serviceCapabilities.length > 2 && (
                                <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                                  +{provider.serviceCapabilities.length - 2}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-1">
                              <span className={`px-3 py-1 text-xs rounded-full font-medium w-fit ${
                                provider.status === 'active'
                                  ? 'bg-green-100 text-green-700 border border-green-200'
                                  : provider.status === 'busy'
                                  ? 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                                  : 'bg-red-100 text-red-700 border border-red-200'
                              }`}>
                                {provider.status.toUpperCase()}
                              </span>
                              {provider.isVerified && (
                                <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700 border border-blue-200 w-fit">
                                  Verificado
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1">
                              <span className="text-yellow-400">★</span>
                              <span className="font-medium">{provider.rating.averageRating.toFixed(1)}</span>
                              <span className="text-xs text-gray-500">({provider.rating.totalReviews})</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {provider.location.city}, {provider.location.state}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleViewProvider(provider)}
                                className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                                title="Ver detalles"
                              >
                                <Eye size={16} />
                              </button>
                              <button
                                onClick={() => handleEditProvider(provider)}
                                className="p-2 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors"
                                title="Editar proveedor"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={() => handleDeleteProvider(provider.id)}
                                disabled={isDeletingProvider === provider.id}
                                className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Eliminar proveedor"
                              >
                                {isDeletingProvider === provider.id ? (
                                  <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <Trash2 size={16} />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="lg:hidden divide-y divide-gray-50">
                  {providers.map((provider) => (
                    <div key={provider.id} className="p-4 hover:bg-white/50 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 mb-1">{provider.businessName}</div>
                          <div className="text-sm text-gray-600 mb-2">{provider.description}</div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-yellow-400">★</span>
                            <span className="text-sm font-medium">{provider.rating.averageRating.toFixed(1)}</span>
                            <span className="text-xs text-gray-500">({provider.rating.totalReviews})</span>
                          </div>
                          <div className="text-xs text-gray-500">
                            {provider.location.city}, {provider.location.state}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 ml-4">
                          <button
                            onClick={() => handleViewProvider(provider)}
                            className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                            title="Ver detalles"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            onClick={() => handleEditProvider(provider)}
                            className="p-1.5 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors"
                            title="Editar proveedor"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteProvider(provider.id)}
                            disabled={isDeletingProvider === provider.id}
                            className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Eliminar proveedor"
                          >
                            {isDeletingProvider === provider.id ? (
                              <div className="w-3 h-3 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Trash2 size={14} />
                            )}
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                            provider.status === 'active'
                              ? 'bg-green-100 text-green-700 border border-green-200'
                              : provider.status === 'busy'
                              ? 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                              : 'bg-red-100 text-red-700 border border-red-200'
                          }`}>
                            {provider.status.toUpperCase()}
                          </span>
                          {provider.isVerified && (
                            <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700 border border-blue-200">
                              Verificado
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">
                          {provider.completedJobs} trabajos
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-3">
                        {provider.serviceCapabilities.slice(0, 3).map((service, index) => (
                          <span key={index} className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700 border border-blue-200">
                            {service.serviceType}
                          </span>
                        ))}
                        {provider.serviceCapabilities.length > 3 && (
                          <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                            +{provider.serviceCapabilities.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Settings Content */}
            {activeTab === 'settings' && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-icon-container rounded-2xl p-8"
              >
                <h2 className="text-xl font-light mb-4 text-gray-900">Configuración del Sistema</h2>
                <p className="text-gray-600">Configuraciones del sistema próximamente...</p>
              </motion.div>
            )}

          </div>
        </div>
      </div>

      {/* Create Organization Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={closeCreateModal}
        title="Nueva Organización"
        size="md"
      >
        <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Nombre de la Organización *
                </label>
                <input
                  type="text"
                  value={createForm.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/50 backdrop-blur-sm border border-gray-200 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                  placeholder="Ej. Inmobiliaria XYZ"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Slug (URL) *
                </label>
                <input
                  type="text"
                  value={createForm.slug}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, slug: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl bg-white/50 backdrop-blur-sm border border-gray-200 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                  placeholder="inmobiliaria-xyz"
                />
                <p className="text-xs mt-1 text-gray-500">Solo letras minúsculas, números y guiones</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  ID del Propietario (Clerk User ID) *
                </label>
                <input
                  type="text"
                  value={createForm.ownerId}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, ownerId: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl bg-white/50 backdrop-blur-sm border border-gray-200 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                  placeholder="user_2..."
                />
                {user && (
                  <div className="mt-2 p-3 rounded-lg bg-blue-50 border border-blue-200">
                    <p className="mb-1 text-xs text-blue-700"><strong>Tu ID:</strong> {user.id}</p>
                    <button
                      type="button"
                      onClick={() => setCreateForm(prev => ({ ...prev, ownerId: user.id }))}
                      className="text-xs text-blue-600 hover:text-blue-800 underline"
                    >
                      Usar mi ID
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Descripción
                </label>
                <textarea
                  value={createForm.description}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl bg-white/50 backdrop-blur-sm border border-gray-200 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 resize-none"
                  placeholder="Descripción de la organización..."
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Plan
                </label>
                <select
                  value={createForm.plan}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, plan: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl bg-white/50 backdrop-blur-sm border border-gray-200 text-gray-800 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                >
                  <option value="free">Free</option>
                  <option value="basic">Basic</option>
                  <option value="premium">Premium</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
                <button
                  onClick={closeCreateModal}
                  className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                  disabled={isCreating}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateOrganization}
                  disabled={isCreating || !createForm.name || !createForm.slug || !createForm.ownerId}
                  className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Creando...
                    </>
                  ) : (
                    'Crear Organización'
                  )}
                </button>
              </div>
            </div>
      </Modal>

      {/* Create Provider Modal */}
      <Modal
        isOpen={showCreateProviderModal}
        onClose={closeCreateProviderModal}
        title="Nuevo Proveedor"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              ID del Usuario (Clerk User ID) *
            </label>
            <input
              type="text"
              value={createProviderForm.userId}
              onChange={(e) => setCreateProviderForm(prev => ({ ...prev, userId: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl bg-white/50 backdrop-blur-sm border border-gray-200 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
              placeholder="user_2..."
            />
            {user && (
              <div className="mt-2 p-3 rounded-lg bg-blue-50 border border-blue-200">
                <p className="mb-1 text-xs text-blue-700"><strong>Tu ID:</strong> {user.id}</p>
                <button
                  type="button"
                  onClick={() => setCreateProviderForm(prev => ({ ...prev, userId: user.id }))}
                  className="text-xs text-blue-600 hover:text-blue-800 underline"
                >
                  Usar mi ID
                </button>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Nombre del Negocio *
            </label>
            <input
              type="text"
              value={createProviderForm.businessName}
              onChange={(e) => setCreateProviderForm(prev => ({ ...prev, businessName: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl bg-white/50 backdrop-blur-sm border border-gray-200 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
              placeholder="Ej. Servicios de Limpieza ABC"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Descripción
            </label>
            <textarea
              value={createProviderForm.description}
              onChange={(e) => setCreateProviderForm(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl bg-white/50 backdrop-blur-sm border border-gray-200 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 resize-none"
              placeholder="Breve descripción de los servicios que ofrece..."
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Tipos de Servicios *
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                'cleaning',
                'maintenance',
                'gardening',
                'plumbing',
                'electrical',
                'painting',
                'carpentry',
                'air-conditioning'
              ].map((serviceType) => (
                <label key={serviceType} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={createProviderForm.serviceTypes.includes(serviceType)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setCreateProviderForm(prev => ({
                          ...prev,
                          serviceTypes: [...prev.serviceTypes, serviceType]
                        }))
                      } else {
                        setCreateProviderForm(prev => ({
                          ...prev,
                          serviceTypes: prev.serviceTypes.filter(type => type !== serviceType)
                        }))
                      }
                    }}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700">
                    {serviceType === 'cleaning' ? 'Limpieza' :
                     serviceType === 'maintenance' ? 'Mantenimiento' :
                     serviceType === 'gardening' ? 'Jardinería' :
                     serviceType === 'plumbing' ? 'Plomería' :
                     serviceType === 'electrical' ? 'Electricidad' :
                     serviceType === 'painting' ? 'Pintura' :
                     serviceType === 'carpentry' ? 'Carpintería' :
                     serviceType === 'air-conditioning' ? 'Aire Acondicionado' :
                     serviceType.replace('-', ' ')}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Ciudad *
              </label>
              <input
                type="text"
                value={createProviderForm.city}
                onChange={(e) => setCreateProviderForm(prev => ({ ...prev, city: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl bg-white/50 backdrop-blur-sm border border-gray-200 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                placeholder="Ciudad"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Estado
              </label>
              <input
                type="text"
                value={createProviderForm.state}
                onChange={(e) => setCreateProviderForm(prev => ({ ...prev, state: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl bg-white/50 backdrop-blur-sm border border-gray-200 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                placeholder="Estado"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                País
              </label>
              <select
                value={createProviderForm.country}
                onChange={(e) => setCreateProviderForm(prev => ({ ...prev, country: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl bg-white/50 backdrop-blur-sm border border-gray-200 text-gray-800 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
              >
                <option value="México">México</option>
                <option value="Estados Unidos">Estados Unidos</option>
                <option value="Canadá">Canadá</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
            <button
              onClick={closeCreateProviderModal}
              className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
              disabled={isCreatingProvider}
            >
              Cancelar
            </button>
            <button
              onClick={handleCreateProvider}
              disabled={isCreatingProvider || !createProviderForm.userId || !createProviderForm.businessName || !createProviderForm.city || createProviderForm.serviceTypes.length === 0}
              className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreatingProvider ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creando...
                </>
              ) : (
                'Crear Proveedor'
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* View Provider Details Modal */}
      <Modal
        isOpen={showViewProviderModal}
        onClose={closeViewProviderModal}
        title="Detalles del Proveedor"
        size="lg"
      >
        {selectedProvider && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Negocio</label>
                <p className="text-gray-900 font-medium">{selectedProvider.businessName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Usuario ID</label>
                <p className="text-gray-600 text-sm font-mono">{selectedProvider.userId}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
              <p className="text-gray-900">{selectedProvider.description || 'Sin descripción'}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Estado y Verificación</label>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 text-xs rounded-full font-medium ${
                  selectedProvider.status === 'active'
                    ? 'bg-green-100 text-green-700 border border-green-200'
                    : selectedProvider.status === 'busy'
                    ? 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                    : 'bg-red-100 text-red-700 border border-red-200'
                }`}>
                  {selectedProvider.status.toUpperCase()}
                </span>
                {selectedProvider.isVerified && (
                  <span className="px-3 py-1 text-xs rounded-full bg-blue-100 text-blue-700 border border-blue-200">
                    Verificado
                  </span>
                )}
                <span className={`px-3 py-1 text-xs rounded-full font-medium ${
                  selectedProvider.tier === 'premium' ? 'bg-purple-100 text-purple-700 border border-purple-200' :
                  selectedProvider.tier === 'standard' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                  'bg-gray-100 text-gray-700 border border-gray-200'
                }`}>
                  {selectedProvider.tier.toUpperCase()}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rating y Estadísticas</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <span className="text-yellow-400 text-lg">★</span>
                    <span className="font-semibold text-lg">{selectedProvider.rating.averageRating.toFixed(1)}</span>
                  </div>
                  <p className="text-xs text-gray-500">{selectedProvider.rating.totalReviews} reseñas</p>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-lg text-blue-600">{selectedProvider.completedJobs}</div>
                  <p className="text-xs text-gray-500">Trabajos completados</p>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-lg text-green-600">{selectedProvider.responseTime}</div>
                  <p className="text-xs text-gray-500">min respuesta</p>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-lg text-purple-600">
                    {new Date(selectedProvider.lastActive).toLocaleDateString('es-ES')}
                  </div>
                  <p className="text-xs text-gray-500">Última actividad</p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ubicación</label>
              <p className="text-gray-900">
                {selectedProvider.location.city}, {selectedProvider.location.state}, {selectedProvider.location.country}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Servicios Ofrecidos</label>
              <div className="grid grid-cols-1 gap-3">
                {selectedProvider.serviceCapabilities.map((service, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-gray-900 capitalize">{service.serviceType.replace('-', ' ')}</h4>
                      <span className="text-lg font-semibold text-green-600">
                        ${service.basePrice} {service.currency}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{service.description}</p>
                    <p className="text-xs text-gray-500">Duración estimada: {service.estimatedDuration}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-100">
              <button
                onClick={closeViewProviderModal}
                className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Provider Modal */}
      <Modal
        isOpen={showEditProviderModal}
        onClose={closeEditProviderModal}
        title="Editar Proveedor"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              ID del Usuario (Clerk User ID) *
            </label>
            <input
              type="text"
              value={editProviderForm.userId}
              onChange={(e) => setEditProviderForm(prev => ({ ...prev, userId: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl bg-white/50 backdrop-blur-sm border border-gray-200 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
              placeholder="user_2..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Nombre del Negocio *
            </label>
            <input
              type="text"
              value={editProviderForm.businessName}
              onChange={(e) => setEditProviderForm(prev => ({ ...prev, businessName: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl bg-white/50 backdrop-blur-sm border border-gray-200 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
              placeholder="Ej. Servicios de Limpieza ABC"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Descripción
            </label>
            <textarea
              value={editProviderForm.description}
              onChange={(e) => setEditProviderForm(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl bg-white/50 backdrop-blur-sm border border-gray-200 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 resize-none"
              placeholder="Breve descripción de los servicios que ofrece..."
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Tipos de Servicios *
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                'cleaning',
                'maintenance',
                'gardening',
                'plumbing',
                'electrical',
                'painting',
                'carpentry',
                'air-conditioning'
              ].map((serviceType) => (
                <label key={serviceType} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editProviderForm.serviceTypes.includes(serviceType)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setEditProviderForm(prev => ({
                          ...prev,
                          serviceTypes: [...prev.serviceTypes, serviceType]
                        }))
                      } else {
                        setEditProviderForm(prev => ({
                          ...prev,
                          serviceTypes: prev.serviceTypes.filter(type => type !== serviceType)
                        }))
                      }
                    }}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700">
                    {serviceType === 'cleaning' ? 'Limpieza' :
                     serviceType === 'maintenance' ? 'Mantenimiento' :
                     serviceType === 'gardening' ? 'Jardinería' :
                     serviceType === 'plumbing' ? 'Plomería' :
                     serviceType === 'electrical' ? 'Electricidad' :
                     serviceType === 'painting' ? 'Pintura' :
                     serviceType === 'carpentry' ? 'Carpintería' :
                     serviceType === 'air-conditioning' ? 'Aire Acondicionado' :
                     serviceType.replace('-', ' ')}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Ciudad *
              </label>
              <input
                type="text"
                value={editProviderForm.city}
                onChange={(e) => setEditProviderForm(prev => ({ ...prev, city: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl bg-white/50 backdrop-blur-sm border border-gray-200 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                placeholder="Ciudad"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Estado
              </label>
              <input
                type="text"
                value={editProviderForm.state}
                onChange={(e) => setEditProviderForm(prev => ({ ...prev, state: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl bg-white/50 backdrop-blur-sm border border-gray-200 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                placeholder="Estado"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                País
              </label>
              <select
                value={editProviderForm.country}
                onChange={(e) => setEditProviderForm(prev => ({ ...prev, country: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl bg-white/50 backdrop-blur-sm border border-gray-200 text-gray-800 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
              >
                <option value="México">México</option>
                <option value="Estados Unidos">Estados Unidos</option>
                <option value="Canadá">Canadá</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
            <button
              onClick={closeEditProviderModal}
              className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
              disabled={isEditingProvider}
            >
              Cancelar
            </button>
            <button
              onClick={handleUpdateProvider}
              disabled={isEditingProvider || !editProviderForm.userId || !editProviderForm.businessName || !editProviderForm.city || editProviderForm.serviceTypes.length === 0}
              className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isEditingProvider ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Actualizando...
                </>
              ) : (
                'Actualizar Proveedor'
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  </div>
  )
}