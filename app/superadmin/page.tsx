'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Users, Building2, Settings, Shield, Plus, Edit, Trash2, Eye, X, LayoutDashboard, Home } from 'lucide-react'
import Navigation from '@/components/Navigation'

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
  const [showCreateModal, setShowCreateModal] = useState(false)
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
      // Check if user is superadmin (you can customize this logic)
      const userEmails = user.emailAddresses?.map(email => email.emailAddress) || []
      const isSuperAdminUser = userEmails.includes('cristiangp2001@gmail.com') // Add your email
      
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
        setShowCreateModal(false)
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
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0a0a' }}>
        <div className="w-16 h-16 border-4 border-white border-opacity-20 border-t-white rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!isSuperAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0a0a' }}>
        <div className="text-center">
          <div 
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ 
              background: 'rgba(255, 59, 48, 0.1)',
              border: '1px solid rgba(255, 59, 48, 0.2)'
            }}
          >
            <Shield className="w-10 h-10" style={{ color: '#ff3b30' }} />
          </div>
          <h1 className="text-2xl font-light mb-2" style={{ color: '#ffffff' }}>Acceso Denegado</h1>
          <p style={{ color: '#a3a3a3' }}>No tienes permisos de superadministrador</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: '#0a0a0a' }}>
      <Navigation />
      
      <div className="pt-20 flex">
        {/* Sidebar */}
        <div className="w-64 h-screen sticky top-20">
          <div className="glass-card m-4 p-6" style={{ height: 'calc(100vh - 6rem)' }}>
            <div className="border-b pb-6 mb-6" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ 
                    background: 'linear-gradient(135deg, #ffffff, #e5e5e5)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
                  }}
                >
                  <Shield className="w-6 h-6" style={{ color: '#000000' }} />
                </div>
                <div>
                  <h2 className="font-light" style={{ color: '#ffffff' }}>Superadmin</h2>
                  <p className="text-xs" style={{ color: '#a3a3a3' }}>Panel de Control</p>
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
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200"
                  style={{
                    background: activeTab === tab.id 
                      ? 'rgba(255, 255, 255, 0.2)' 
                      : 'transparent',
                    color: activeTab === tab.id ? '#ffffff' : '#a3a3a3',
                    border: activeTab === tab.id 
                      ? '1px solid rgba(255, 255, 255, 0.2)' 
                      : '1px solid transparent'
                  }}
                  onMouseEnter={(e) => {
                    if (activeTab !== tab.id) {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeTab !== tab.id) {
                      e.currentTarget.style.background = 'transparent'
                    }
                  }}
                >
                  <tab.icon size={20} />
                  <span className="font-light">{tab.label}</span>
                </button>
              ))}
            </nav>

            <div className="absolute bottom-6 left-6 right-6">
              <button 
                onClick={() => router.push('/dashboard')}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200"
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: '#a3a3a3',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                }}
              >
                <Home size={20} />
                <span>Volver al Dashboard</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">

            {/* Dashboard Header */}
            {activeTab === 'overview' && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
              >
                <h1 className="text-3xl font-light mb-2" style={{ color: '#ffffff' }}>Dashboard</h1>
                <p style={{ color: '#a3a3a3' }}>Vista general del sistema y estadísticas</p>
              </motion.div>
            )}

            {activeTab === 'organizations' && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 flex justify-between items-center"
              >
                <div>
                  <h1 className="text-3xl font-light mb-2" style={{ color: '#ffffff' }}>Organizaciones</h1>
                  <p style={{ color: '#a3a3a3' }}>Gestiona todas las organizaciones del sistema</p>
                </div>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center gap-2 px-6 py-3 rounded-lg transition-all duration-200"
                  style={{
                    background: 'linear-gradient(135deg, #ffffff, #e5e5e5)',
                    color: '#000000',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #e5e5e5, #d4d4d4)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #ffffff, #e5e5e5)'
                  }}
                >
                  <Plus size={20} />
                  Nueva Organización
                </button>
              </motion.div>
            )}

            {activeTab === 'settings' && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
              >
                <h1 className="text-3xl font-light mb-2" style={{ color: '#ffffff' }}>Configuración</h1>
                <p style={{ color: '#a3a3a3' }}>Configuraciones del sistema y parámetros globales</p>
              </motion.div>
            )}

            {/* Overview Content */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Stats Cards */}
                {stats && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="glass-card p-6 transition-all duration-200"
                      whileHover={{ y: -4 }}
                    >
                      <div className="flex items-center gap-4">
                        <div 
                          className="p-3 rounded-lg"
                          style={{ 
                            background: 'linear-gradient(135deg, #666666, #525252)',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
                          }}
                        >
                          <Users className="h-6 w-6" style={{ color: '#ffffff' }} />
                        </div>
                        <div>
                          <p className="text-sm" style={{ color: '#a3a3a3' }}>Total Usuarios</p>
                          <p className="text-2xl font-light" style={{ color: '#ffffff' }}>{stats.totalUsers}</p>
                        </div>
                      </div>
                    </motion.div>

                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="glass-card p-6 transition-all duration-200"
                      whileHover={{ y: -4 }}
                    >
                      <div className="flex items-center gap-4">
                        <div 
                          className="p-3 rounded-lg"
                          style={{ 
                            background: 'linear-gradient(135deg, #e5e5e5, #a3a3a3)',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
                          }}
                        >
                          <Building2 className="h-6 w-6" style={{ color: '#000000' }} />
                        </div>
                        <div>
                          <p className="text-sm" style={{ color: '#a3a3a3' }}>Organizaciones</p>
                          <p className="text-2xl font-light" style={{ color: '#ffffff' }}>{stats.totalOrganizations}</p>
                        </div>
                      </div>
                    </motion.div>

                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="glass-card p-6 transition-all duration-200"
                      whileHover={{ y: -4 }}
                    >
                      <div className="flex items-center gap-4">
                        <div 
                          className="p-3 rounded-lg"
                          style={{ 
                            background: 'linear-gradient(135deg, #ffffff, #e5e5e5)',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
                          }}
                        >
                          <Home className="h-6 w-6" style={{ color: '#000000' }} />
                        </div>
                        <div>
                          <p className="text-sm" style={{ color: '#a3a3a3' }}>Propiedades</p>
                          <p className="text-2xl font-light" style={{ color: '#ffffff' }}>{stats.totalProperties}</p>
                        </div>
                      </div>
                    </motion.div>

                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="glass-card p-6 transition-all duration-200"
                      whileHover={{ y: -4 }}
                    >
                      <div className="flex items-center gap-4">
                        <div 
                          className="p-3 rounded-lg"
                          style={{ 
                            background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
                          }}
                        >
                          <Shield className="h-6 w-6" style={{ color: '#000000' }} />
                        </div>
                        <div>
                          <p className="text-sm" style={{ color: '#a3a3a3' }}>Org. Activas</p>
                          <p className="text-2xl font-light" style={{ color: '#ffffff' }}>{stats.activeOrganizations}</p>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                )}

                {/* Recent Organizations */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="glass-card"
                >
                  <div className="p-6 border-b" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                    <h3 className="text-lg font-light" style={{ color: '#ffffff' }}>Organizaciones Recientes</h3>
                  </div>
                  <div className="p-6">
                    {organizations.slice(0, 5).map((org) => (
                      <div key={org.id} className="flex items-center justify-between py-3 border-b last:border-0" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                        <div>
                          <h4 className="font-light" style={{ color: '#ffffff' }}>{org.name}</h4>
                          <p className="text-sm" style={{ color: '#a3a3a3' }}>{org.slug} • {org.plan}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 text-xs rounded-full font-medium" style={{
                            background: org.status === 'active' 
                              ? 'rgba(52, 211, 153, 0.2)' 
                              : 'rgba(239, 68, 68, 0.2)',
                            color: org.status === 'active' 
                              ? '#34d399' 
                              : '#ef4444',
                            border: org.status === 'active' 
                              ? '1px solid rgba(52, 211, 153, 0.3)' 
                              : '1px solid rgba(239, 68, 68, 0.3)'
                          }}>
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
                className="glass-card overflow-hidden"
              >
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#a3a3a3' }}>
                          Organización
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#a3a3a3' }}>
                          Plan
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#a3a3a3' }}>
                          Estado
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#a3a3a3' }}>
                          Creado
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#a3a3a3' }}>
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                      {organizations.map((org) => (
                        <tr key={org.id} className="transition-colors hover:bg-white hover:bg-opacity-5">
                          <td className="px-6 py-4">
                            <div>
                              <div className="font-light" style={{ color: '#ffffff' }}>{org.name}</div>
                              <div className="text-sm" style={{ color: '#a3a3a3' }}>{org.slug}</div>
                              {org.ownerEmail && (
                                <div className="text-xs" style={{ color: '#71717a' }}>{org.ownerEmail}</div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-3 py-1 text-xs rounded-full font-medium" style={{
                              background: org.plan === 'free' ? 'rgba(107, 114, 128, 0.2)' :
                                         org.plan === 'basic' ? 'rgba(59, 130, 246, 0.2)' :
                                         org.plan === 'premium' ? 'rgba(147, 51, 234, 0.2)' :
                                         'rgba(245, 158, 11, 0.2)',
                              color: org.plan === 'free' ? '#6b7280' :
                                    org.plan === 'basic' ? '#3b82f6' :
                                    org.plan === 'premium' ? '#9333ea' :
                                    '#f59e0b',
                              border: org.plan === 'free' ? '1px solid rgba(107, 114, 128, 0.3)' :
                                     org.plan === 'basic' ? '1px solid rgba(59, 130, 246, 0.3)' :
                                     org.plan === 'premium' ? '1px solid rgba(147, 51, 234, 0.3)' :
                                     '1px solid rgba(245, 158, 11, 0.3)'
                            }}>
                              {org.plan.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-3 py-1 text-xs rounded-full font-medium" style={{
                              background: org.status === 'active' 
                                ? 'rgba(52, 211, 153, 0.2)' 
                                : 'rgba(239, 68, 68, 0.2)',
                              color: org.status === 'active' 
                                ? '#34d399' 
                                : '#ef4444',
                              border: org.status === 'active' 
                                ? '1px solid rgba(52, 211, 153, 0.3)' 
                                : '1px solid rgba(239, 68, 68, 0.3)'
                            }}>
                              {org.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm" style={{ color: '#a3a3a3' }}>
                            {new Date(org.createdAt).toLocaleDateString('es-ES')}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <button className="p-2 rounded-lg transition-all duration-200" style={{
                                background: 'rgba(59, 130, 246, 0.1)',
                                color: '#3b82f6',
                                border: '1px solid rgba(59, 130, 246, 0.2)'
                              }}>
                                <Eye size={16} />
                              </button>
                              <button className="p-2 rounded-lg transition-all duration-200" style={{
                                background: 'rgba(107, 114, 128, 0.1)',
                                color: '#6b7280',
                                border: '1px solid rgba(107, 114, 128, 0.2)'
                              }}>
                                <Edit size={16} />
                              </button>
                              <button className="p-2 rounded-lg transition-all duration-200" style={{
                                background: 'rgba(239, 68, 68, 0.1)',
                                color: '#ef4444',
                                border: '1px solid rgba(239, 68, 68, 0.2)'
                              }}>
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {/* Settings Content */}
            {activeTab === 'settings' && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-card p-8"
              >
                <h2 className="text-xl font-light mb-4" style={{ color: '#ffffff' }}>Configuración del Sistema</h2>
                <p style={{ color: '#a3a3a3' }}>Configuraciones del sistema próximamente...</p>
              </motion.div>
            )}

          </div>
        </div>
      </div>

      {/* Create Organization Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card w-full max-w-md"
          >
            <div className="p-6 border-b" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-light" style={{ color: '#ffffff' }}>Nueva Organización</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="transition-colors p-1 rounded-lg"
                  style={{ color: '#a3a3a3' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#ffffff'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#a3a3a3'}
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#a3a3a3' }}>
                  Nombre de la Organización *
                </label>
                <input
                  type="text"
                  value={createForm.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg transition-all duration-200"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#ffffff'
                  }}
                  placeholder="Ej. Inmobiliaria XYZ"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#a3a3a3' }}>
                  Slug (URL) *
                </label>
                <input
                  type="text"
                  value={createForm.slug}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, slug: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg transition-all duration-200"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#ffffff'
                  }}
                  placeholder="inmobiliaria-xyz"
                />
                <p className="text-xs mt-1" style={{ color: '#71717a' }}>Solo letras minúsculas, números y guiones</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#a3a3a3' }}>
                  ID del Propietario (Clerk User ID) *
                </label>
                <input
                  type="text"
                  value={createForm.ownerId}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, ownerId: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg transition-all duration-200"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#ffffff'
                  }}
                  placeholder="user_2..."
                />
                {user && (
                  <div className="mt-2 p-2 rounded text-xs" style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                    <p className="mb-1" style={{ color: '#3b82f6' }}><strong>Tu ID:</strong> {user.id}</p>
                    <button
                      type="button"
                      onClick={() => setCreateForm(prev => ({ ...prev, ownerId: user.id }))}
                      className="underline transition-colors"
                      style={{ color: '#3b82f6' }}
                    >
                      Usar mi ID
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#a3a3a3' }}>
                  Descripción
                </label>
                <textarea
                  value={createForm.description}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg transition-all duration-200"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#ffffff'
                  }}
                  placeholder="Descripción de la organización..."
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#a3a3a3' }}>
                  Plan
                </label>
                <select
                  value={createForm.plan}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, plan: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg transition-all duration-200"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#ffffff'
                  }}
                >
                  <option value="free" style={{ background: '#0a0a0a', color: '#ffffff' }}>Free</option>
                  <option value="basic" style={{ background: '#0a0a0a', color: '#ffffff' }}>Basic</option>
                  <option value="premium" style={{ background: '#0a0a0a', color: '#ffffff' }}>Premium</option>
                  <option value="enterprise" style={{ background: '#0a0a0a', color: '#ffffff' }}>Enterprise</option>
                </select>
              </div>
            </div>

            <div className="p-6 border-t flex justify-end gap-3" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 rounded-lg transition-colors"
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: '#a3a3a3',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
                disabled={isCreating}
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateOrganization}
                disabled={isCreating || !createForm.name || !createForm.slug || !createForm.ownerId}
                className="px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                style={{
                  background: 'linear-gradient(135deg, #ffffff, #e5e5e5)',
                  color: '#000000',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}
              >
                {isCreating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Creando...
                  </>
                ) : (
                  'Crear Organización'
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}