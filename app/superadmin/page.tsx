'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Users, Building2, Settings, Shield, Plus, Edit, Trash2, Eye, X, LayoutDashboard, Home, Menu } from 'lucide-react'
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
  const [activeTab, setActiveTab] = useState('overview')
  const { isOpen: showCreateModal, openModal: openCreateModal, closeModal: closeCreateModal } = useModal()
  const [showMobileSidebar, setShowMobileSidebar] = useState(false)
  const [createForm, setCreateForm] = useState<CreateOrgForm>({
    name: '',
    slug: '',
    description: '',
    ownerId: '',
    plan: 'free'
  })
  const [isCreating, setIsCreating] = useState(false)

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
      
      // Fetch stats and organizations
      const [statsRes, orgsRes] = await Promise.all([
        fetch('/api/superadmin/stats'),
        fetch('/api/superadmin/organizations')
      ])

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData.data)
      }

      if (orgsRes.ok) {
        const orgsData = await orgsRes.json()
        setOrganizations(orgsData.data || [])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
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
    </div>
  </div>
  )
}