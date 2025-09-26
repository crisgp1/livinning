'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Users,
  Shield,
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  Filter,
  RefreshCw,
  UserCheck,
  UserX,
  Headphones,
  AlertTriangle,
  CheckCircle,
  Clock,
  Home
} from 'lucide-react'
import Navigation from '@/components/Navigation'
import Modal from '@/components/ui/Modal'
import { useModal } from '@/hooks/useModal'

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  imageUrl: string
  role: string
  isAgency: boolean
  isSuperAdmin: boolean
  helpdeskAccess: boolean
  createdAt: number
  lastActiveAt: number | null
  banned: boolean
}

interface UserStats {
  totalUsers: number
  helpdeskUsers: number
  providerUsers: number
  agencyUsers: number
  activeUsers: number
  bannedUsers: number
}

export default function SuperAdminUsersPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<User[]>([])
  const [stats, setStats] = useState<UserStats | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const {
    isOpen: showUserModal,
    openModal: openUserModal,
    closeModal: closeUserModal
  } = useModal()

  // Check superadmin status
  useEffect(() => {
    if (isLoaded && user) {
      const metadata = user.publicMetadata as any

      const isSuperAdminUser = metadata?.isSuperAdmin === true ||
        metadata?.role === 'superadmin' ||
        user.emailAddresses?.some(email => email.emailAddress === 'cristiangp2001@gmail.com')

      if (!isSuperAdminUser) {
        router.push('/dashboard')
        return
      }

      setIsSuperAdmin(true)
      fetchUsers()
    } else if (isLoaded && !user) {
      router.push('/sign-in')
    }
  }, [user, isLoaded, router])

  const fetchUsers = async () => {
    try {
      setLoading(true)

      const params = new URLSearchParams()
      if (searchTerm) params.set('search', searchTerm)
      if (roleFilter) params.set('role', roleFilter)
      params.set('limit', '50')

      const response = await fetch(`/api/helpdesk/users?${params.toString()}`)
      const data = await response.json()

      if (data.success) {
        setUsers(data.data.users)

        // Calculate stats
        const totalUsers = data.data.users.length
        const helpdeskUsers = data.data.users.filter((u: User) => u.role === 'helpdesk').length
        const providerUsers = data.data.users.filter((u: User) => u.role === 'provider').length
        const agencyUsers = data.data.users.filter((u: User) => u.isAgency).length
        const bannedUsers = data.data.users.filter((u: User) => u.banned).length
        const activeUsers = data.data.users.filter((u: User) =>
          u.lastActiveAt && (Date.now() - u.lastActiveAt < 7 * 24 * 60 * 60 * 1000)
        ).length

        setStats({
          totalUsers,
          helpdeskUsers,
          providerUsers,
          agencyUsers,
          activeUsers,
          bannedUsers
        })
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAssignHelpdeskRole = async (userId: string, action: 'assign' | 'remove') => {
    try {
      setActionLoading(`${action}-${userId}`)

      const response = await fetch('/api/admin/assign-helpdesk-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          targetUserId: userId,
          action
        })
      })

      const data = await response.json()

      if (data.success) {
        await fetchUsers() // Refresh the list
        closeUserModal()
      } else {
        console.error('Error managing helpdesk role:', data.error)
      }
    } catch (error) {
      console.error('Error managing helpdesk role:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const handleUserAction = async (userId: string, action: 'ban' | 'unban', reason?: string) => {
    try {
      setActionLoading(`${action}-${userId}`)

      const response = await fetch('/api/helpdesk/users', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          targetUserId: userId,
          action,
          reason
        })
      })

      const data = await response.json()

      if (data.success) {
        await fetchUsers() // Refresh the list
        closeUserModal()
      } else {
        console.error('Error performing user action:', data.error)
      }
    } catch (error) {
      console.error('Error performing user action:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const openUserDetails = (user: User) => {
    setSelectedUser(user)
    openUserModal()
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchTerm ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesRole = !roleFilter ||
      (roleFilter === 'helpdesk' && user.role === 'helpdesk') ||
      (roleFilter === 'provider' && user.role === 'provider') ||
      (roleFilter === 'agency' && user.isAgency) ||
      (roleFilter === 'superadmin' && user.isSuperAdmin) ||
      (roleFilter === 'client' && !user.role && !user.isAgency && !user.isSuperAdmin)

    return matchesSearch && matchesRole
  })

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
        <div className="text-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center mx-auto mb-6">
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
      </div>

      <div className="pt-20 relative z-10">
        <div className="max-w-7xl mx-auto p-4 lg:p-8">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-light mb-2 text-gray-900">
                Gestión de Usuarios
              </h1>
              <p className="text-gray-600">
                Administra usuarios y asigna roles de helpdesk
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/superadmin')}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
              >
                <Home size={16} />
                Volver
              </button>
              <button
                onClick={fetchUsers}
                disabled={loading}
                className="btn-primary flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Actualizar
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
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
                <div className="text-2xl font-light mb-1 text-gray-900">
                  {stats.totalUsers}
                </div>
                <div className="text-sm text-gray-600">Total Usuarios</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-card p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
                    <Headphones className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="text-2xl font-light mb-1 text-gray-900">
                  {stats.helpdeskUsers}
                </div>
                <div className="text-sm text-gray-600">Helpdesk</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-card p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500">
                    <UserCheck className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="text-2xl font-light mb-1 text-gray-900">
                  {stats.providerUsers}
                </div>
                <div className="text-sm text-gray-600">Proveedores</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="glass-card p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-red-500">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="text-2xl font-light mb-1 text-gray-900">
                  {stats.agencyUsers}
                </div>
                <div className="text-sm text-gray-600">Agencias</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="glass-card p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-teal-500 to-blue-500">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="text-2xl font-light mb-1 text-gray-900">
                  {stats.activeUsers}
                </div>
                <div className="text-sm text-gray-600">Activos</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="glass-card p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-red-500 to-pink-500">
                    <UserX className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="text-2xl font-light mb-1 text-gray-900">
                  {stats.bannedUsers}
                </div>
                <div className="text-sm text-gray-600">Bloqueados</div>
              </motion.div>
            </div>
          )}

          {/* Filters */}
          <div className="glass-card p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Buscar Usuario</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Email, nombre..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Filtrar por Rol</label>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                >
                  <option value="">Todos los Roles</option>
                  <option value="helpdesk">Helpdesk</option>
                  <option value="provider">Proveedor</option>
                  <option value="agency">Agencia</option>
                  <option value="superadmin">Superadmin</option>
                  <option value="client">Cliente</option>
                </select>
              </div>
            </div>

            <div className="mt-4 flex justify-between items-center">
              <span className="text-sm text-gray-600">
                Mostrando {filteredUsers.length} de {users.length} usuarios
              </span>
              <button
                onClick={() => {
                  setSearchTerm('')
                  setRoleFilter('')
                }}
                className="text-sm text-primary hover:text-primary-dark"
              >
                Limpiar filtros
              </button>
            </div>
          </div>

          {/* Users Table */}
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Usuario</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Rol</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Estado</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Última Actividad</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          {user.imageUrl ? (
                            <img
                              src={user.imageUrl}
                              alt={`${user.firstName} ${user.lastName}`}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <Users className="w-5 h-5 text-gray-500" />
                            </div>
                          )}
                          <div>
                            <div className="font-medium text-gray-900">
                              {user.firstName} {user.lastName}
                            </div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          {user.isSuperAdmin && (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              Superadmin
                            </span>
                          )}
                          {user.role === 'helpdesk' && (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              Helpdesk
                            </span>
                          )}
                          {user.role === 'provider' && (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Proveedor
                            </span>
                          )}
                          {user.isAgency && (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Agencia
                            </span>
                          )}
                          {!user.role && !user.isAgency && !user.isSuperAdmin && (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              Cliente
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {user.banned ? (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                            Bloqueado
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                            Activo
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {user.lastActiveAt
                          ? new Date(user.lastActiveAt).toLocaleDateString('es-ES')
                          : 'Nunca'
                        }
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => openUserDetails(user)}
                            className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                            title="Ver detalles"
                          >
                            <Eye size={16} />
                          </button>

                          {user.role !== 'helpdesk' && !user.isSuperAdmin && (
                            <button
                              onClick={() => handleAssignHelpdeskRole(user.id, 'assign')}
                              disabled={actionLoading === `assign-${user.id}`}
                              className="p-2 rounded-lg bg-purple-50 text-purple-600 hover:bg-purple-100 transition-colors disabled:opacity-50"
                              title="Asignar rol de Helpdesk"
                            >
                              {actionLoading === `assign-${user.id}` ? (
                                <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <Headphones size={16} />
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredUsers.length === 0 && (
              <div className="p-12 text-center">
                <Users className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron usuarios</h3>
                <p className="text-gray-600">
                  {searchTerm || roleFilter
                    ? 'No hay usuarios que coincidan con los filtros aplicados.'
                    : 'No hay usuarios disponibles.'
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* User Detail Modal */}
      <Modal
        isOpen={showUserModal}
        onClose={closeUserModal}
        title={selectedUser ? `${selectedUser.firstName} ${selectedUser.lastName}` : 'Detalles del Usuario'}
        size="lg"
      >
        {selectedUser && (
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              {selectedUser.imageUrl ? (
                <img
                  src={selectedUser.imageUrl}
                  alt={`${selectedUser.firstName} ${selectedUser.lastName}`}
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                  <Users className="w-8 h-8 text-gray-500" />
                </div>
              )}
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {selectedUser.firstName} {selectedUser.lastName}
                </h3>
                <p className="text-gray-600">{selectedUser.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ID de Usuario</label>
                <p className="text-gray-900 font-mono text-sm">{selectedUser.id}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  selectedUser.banned
                    ? 'bg-red-100 text-red-800'
                    : 'bg-green-100 text-green-800'
                }`}>
                  {selectedUser.banned ? 'Bloqueado' : 'Activo'}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Registro</label>
                <p className="text-gray-900">
                  {new Date(selectedUser.createdAt).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Última Actividad</label>
                <p className="text-gray-900">
                  {selectedUser.lastActiveAt
                    ? new Date(selectedUser.lastActiveAt).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })
                    : 'Nunca'
                  }
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Roles y Permisos</label>
              <div className="flex flex-wrap gap-2">
                {selectedUser.isSuperAdmin && (
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                    Superadministrador
                  </span>
                )}
                {selectedUser.role === 'helpdesk' && (
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                    Helpdesk
                  </span>
                )}
                {selectedUser.role === 'provider' && (
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    Proveedor de Servicios
                  </span>
                )}
                {selectedUser.isAgency && (
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    Agencia Inmobiliaria
                  </span>
                )}
                {!selectedUser.role && !selectedUser.isAgency && !selectedUser.isSuperAdmin && (
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                    Cliente Regular
                  </span>
                )}
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-gray-100">
              <div className="flex space-x-3">
                {selectedUser.role === 'helpdesk' && !selectedUser.isSuperAdmin && (
                  <button
                    onClick={() => handleAssignHelpdeskRole(selectedUser.id, 'remove')}
                    disabled={actionLoading === `remove-${selectedUser.id}`}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50"
                  >
                    {actionLoading === `remove-${selectedUser.id}` ? (
                      <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <UserX size={16} />
                    )}
                    Quitar Helpdesk
                  </button>
                )}

                {selectedUser.role !== 'helpdesk' && !selectedUser.isSuperAdmin && (
                  <button
                    onClick={() => handleAssignHelpdeskRole(selectedUser.id, 'assign')}
                    disabled={actionLoading === `assign-${selectedUser.id}`}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-50 text-purple-600 hover:bg-purple-100 transition-colors disabled:opacity-50"
                  >
                    {actionLoading === `assign-${selectedUser.id}` ? (
                      <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Headphones size={16} />
                    )}
                    Asignar Helpdesk
                  </button>
                )}

                {!selectedUser.banned && !selectedUser.isSuperAdmin && (
                  <button
                    onClick={() => handleUserAction(selectedUser.id, 'ban')}
                    disabled={actionLoading === `ban-${selectedUser.id}`}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-50 text-orange-600 hover:bg-orange-100 transition-colors disabled:opacity-50"
                  >
                    {actionLoading === `ban-${selectedUser.id}` ? (
                      <div className="w-4 h-4 border-2 border-orange-600 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <UserX size={16} />
                    )}
                    Bloquear Usuario
                  </button>
                )}

                {selectedUser.banned && (
                  <button
                    onClick={() => handleUserAction(selectedUser.id, 'unban')}
                    disabled={actionLoading === `unban-${selectedUser.id}`}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-50 text-green-600 hover:bg-green-100 transition-colors disabled:opacity-50"
                  >
                    {actionLoading === `unban-${selectedUser.id}` ? (
                      <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <CheckCircle size={16} />
                    )}
                    Desbloquear Usuario
                  </button>
                )}
              </div>

              <button
                onClick={closeUserModal}
                className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}