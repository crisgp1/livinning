'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Users, Building2, Settings, Shield, Plus, Edit, Trash2, Eye, UserCheck } from 'lucide-react'
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
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-primary rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!isSuperAdmin) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
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
    <div className="p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              {[
                { id: 'overview', label: 'Dashboard', icon: Users },
                { id: 'organizations', label: 'Organizaciones', icon: Building2 },
                { id: 'providers', label: 'Proveedores', icon: UserCheck },
                { id: 'settings', label: 'Configuración', icon: Settings }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon
                    className={`mr-2 h-5 w-5 ${
                      activeTab === tab.id ? 'text-primary' : 'text-gray-400 group-hover:text-gray-500'
                    }`}
                  />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-light mb-2 text-gray-900">Dashboard</h1>
              <p className="text-gray-600">Vista general del sistema y estadísticas</p>
            </div>

            {/* Stats Cards */}
            {stats && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 lg:gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="text-3xl font-light mb-1 text-gray-900">{stats.totalUsers}</div>
                  <div className="text-sm text-gray-600">Usuarios</div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500">
                      <Building2 className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="text-3xl font-light mb-1 text-gray-900">{stats.totalOrganizations}</div>
                  <div className="text-sm text-gray-600">Organizaciones</div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-teal-500 to-green-500">
                      <UserCheck className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="text-3xl font-light mb-1 text-gray-900">{stats.totalProviders}</div>
                  <div className="text-sm text-gray-600">Proveedores</div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-red-500">
                      <Shield className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="text-3xl font-light mb-1 text-gray-900">{stats.activeOrganizations}</div>
                  <div className="text-sm text-gray-600">Org. Activas</div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500">
                      <UserCheck className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="text-3xl font-light mb-1 text-gray-900">{stats.activeProviders}</div>
                  <div className="text-sm text-gray-600">Prov. Activos</div>
                </motion.div>
              </div>
            )}

            {/* Recent Organizations */}
            <div className="glass-icon-container rounded-2xl">
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
                    <div>
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
            </div>
          </div>
        )}

        {activeTab === 'organizations' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-light mb-2 text-gray-900">Organizaciones</h1>
                <p className="text-gray-600">Gestiona todas las organizaciones del sistema</p>
              </div>
              <button
                onClick={openCreateModal}
                className="btn-primary flex items-center gap-2"
              >
                <Plus size={20} />
                Nueva Organización
              </button>
            </div>

            <div className="glass-icon-container rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Organización</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Plan</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Estado</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Creado</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {organizations.map((org) => (
                      <tr key={org.id} className="hover:bg-white/50 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-medium text-gray-900">{org.name}</div>
                            <div className="text-sm text-gray-600">{org.slug}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 text-xs rounded-full font-medium bg-blue-100 text-blue-700">
                            {org.plan.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 text-xs rounded-full font-medium ${
                            org.status === 'active'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {org.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(org.createdAt).toLocaleDateString('es-ES')}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100">
                              <Eye size={16} />
                            </button>
                            <button className="p-2 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100">
                              <Edit size={16} />
                            </button>
                            <button className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'providers' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-light mb-2 text-gray-900">Proveedores</h1>
                <p className="text-gray-600">Gestiona todos los proveedores del sistema</p>
              </div>
              <button
                onClick={openCreateProviderModal}
                className="btn-primary flex items-center gap-2"
              >
                <Plus size={20} />
                Nuevo Proveedor
              </button>
            </div>

            <div className="glass-icon-container rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Proveedor</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Estado</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Rating</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Ubicación</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {providers.map((provider) => (
                      <tr key={provider.id} className="hover:bg-white/50 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-medium text-gray-900">{provider.businessName}</div>
                            <div className="text-sm text-gray-600">{provider.description}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 text-xs rounded-full font-medium ${
                            provider.status === 'active'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {provider.status.toUpperCase()}
                          </span>
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
                              className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              onClick={() => handleEditProvider(provider)}
                              className="p-2 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteProvider(provider.id)}
                              className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-light mb-2 text-gray-900">Configuración</h1>
              <p className="text-gray-600">Configuraciones del sistema y parámetros globales</p>
            </div>
            <div className="glass-icon-container rounded-2xl p-8">
              <h2 className="text-xl font-light mb-4 text-gray-900">Configuración del Sistema</h2>
              <p className="text-gray-600">Configuraciones del sistema próximamente...</p>
            </div>
          </div>
        )}
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
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
            <button
              onClick={closeCreateModal}
              className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleCreateOrganization}
              disabled={isCreating || !createForm.name || !createForm.slug || !createForm.ownerId}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreating ? 'Creando...' : 'Crear Organización'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Modals for providers would go here - simplified for brevity */}
    </div>
  )
}