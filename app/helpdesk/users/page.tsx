'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Users,
  Search,
  RefreshCw,
  Eye,
  User,
  Mail,
  Shield,
  UserCheck,
  Clock,
  AlertTriangle,
  Phone,
  MapPin,
  Calendar,
  Activity
} from 'lucide-react'
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
  clientUsers: number
  providerUsers: number
  agencyUsers: number
  helpdeskUsers: number
  activeUsers: number
  newUsersToday: number
  bannedUsers: number
}

export default function HelpdeskUsersPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<User[]>([])
  const [stats, setStats] = useState<UserStats | null>(null)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  const {
    isOpen: showUserModal,
    openModal: openUserModal,
    closeModal: closeUserModal
  } = useModal()

  useEffect(() => {
    if (isLoaded && user) {
      const metadata = user.publicMetadata as any

      const isHelpdesk = metadata?.role === 'helpdesk'
      const isSuperAdmin = metadata?.isSuperAdmin === true ||
        metadata?.role === 'superadmin' ||
        user.emailAddresses?.some(email => email.emailAddress === 'cristiangp2001@gmail.com')

      if (!isHelpdesk && !isSuperAdmin) {
        router.push('/')
        return
      }

      fetchUsers()
    } else if (isLoaded && !user) {
      router.push('/sign-in')
    }
  }, [user, isLoaded, router, searchTerm, roleFilter, currentPage])

  const fetchUsers = async () => {
    try {
      setLoading(true)

      const params = new URLSearchParams()
      if (searchTerm) params.set('search', searchTerm)
      if (roleFilter) params.set('role', roleFilter)
      params.set('limit', '50')
      params.set('offset', ((currentPage - 1) * 50).toString())

      const response = await fetch(`/api/helpdesk/users?${params.toString()}`)
      const data = await response.json()

      if (data.success) {
        setUsers(data.data.users)
        setTotalCount(data.data.totalCount)

        // Calculate stats
        const allUsers = data.data.users
        const totalUsers = allUsers.length
        const clientUsers = allUsers.filter((u: User) => !u.role && !u.isAgency && !u.isSuperAdmin).length
        const providerUsers = allUsers.filter((u: User) => u.role === 'provider').length
        const agencyUsers = allUsers.filter((u: User) => u.isAgency).length
        const helpdeskUsers = allUsers.filter((u: User) => u.role === 'helpdesk').length
        const bannedUsers = allUsers.filter((u: User) => u.banned).length

        // Users active in the last 7 days
        const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
        const activeUsers = allUsers.filter((u: User) => u.lastActiveAt && u.lastActiveAt > oneWeekAgo).length

        // Users created today
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const newUsersToday = allUsers.filter((u: User) => u.createdAt >= today.getTime()).length

        setStats({
          totalUsers,
          clientUsers,
          providerUsers,
          agencyUsers,
          helpdeskUsers,
          activeUsers,
          newUsersToday,
          bannedUsers
        })
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const openUserDetails = (user: User) => {
    setSelectedUser(user)
    openUserModal()
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTimeAgo = (timestamp: number) => {
    const now = Date.now()
    const diffInHours = Math.floor((now - timestamp) / (1000 * 60 * 60))

    if (diffInHours < 1) return 'Hace menos de 1 hora'
    if (diffInHours < 24) return `Hace ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`

    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `Hace ${diffInDays} día${diffInDays > 1 ? 's' : ''}`

    const diffInWeeks = Math.floor(diffInDays / 7)
    if (diffInWeeks < 4) return `Hace ${diffInWeeks} semana${diffInWeeks > 1 ? 's' : ''}`

    const diffInMonths = Math.floor(diffInDays / 30)
    return `Hace ${diffInMonths} mes${diffInMonths > 1 ? 'es' : ''}`
  }

  const getRoleLabel = (user: User) => {
    if (user.isSuperAdmin) return 'Superadmin'
    if (user.role === 'helpdesk') return 'Helpdesk'
    if (user.role === 'provider') return 'Proveedor'
    if (user.isAgency) return 'Agencia'
    return 'Cliente'
  }

  const getRoleBadgeColor = (user: User) => {
    if (user.isSuperAdmin) return 'bg-red-100 text-red-800 border-red-200'
    if (user.role === 'helpdesk') return 'bg-purple-100 text-purple-800 border-purple-200'
    if (user.role === 'provider') return 'bg-blue-100 text-blue-800 border-blue-200'
    if (user.isAgency) return 'bg-green-100 text-green-800 border-green-200'
    return 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const filteredUsers = users.filter(user => {
    if (!searchTerm && !roleFilter) return true

    const matchesSearch = !searchTerm ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesRole = !roleFilter ||
      (roleFilter === 'client' && !user.role && !user.isAgency && !user.isSuperAdmin) ||
      (roleFilter === 'provider' && user.role === 'provider') ||
      (roleFilter === 'agency' && user.isAgency) ||
      (roleFilter === 'helpdesk' && user.role === 'helpdesk') ||
      (roleFilter === 'superadmin' && user.isSuperAdmin)

    return matchesSearch && matchesRole
  })

  const totalPages = Math.ceil(totalCount / 50)

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-primary rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>
              <p className="text-gray-600 mt-1">
                Visualiza y administra información de usuarios del sistema
              </p>
            </div>
            <button
              onClick={fetchUsers}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-8 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500">
                  <Users className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="text-2xl font-bold mb-1 text-gray-900">
                {stats.totalUsers}
              </div>
              <div className="text-sm text-gray-600">Total</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-gray-500 to-gray-600">
                  <User className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="text-2xl font-bold mb-1 text-gray-900">
                {stats.clientUsers}
              </div>
              <div className="text-sm text-gray-600">Clientes</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500">
                  <UserCheck className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="text-2xl font-bold mb-1 text-gray-900">
                {stats.providerUsers}
              </div>
              <div className="text-sm text-gray-600">Proveedores</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500">
                  <Shield className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="text-2xl font-bold mb-1 text-gray-900">
                {stats.agencyUsers}
              </div>
              <div className="text-sm text-gray-600">Agencias</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
                  <Users className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="text-2xl font-bold mb-1 text-gray-900">
                {stats.helpdeskUsers}
              </div>
              <div className="text-sm text-gray-600">Helpdesk</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500">
                  <Activity className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="text-2xl font-bold mb-1 text-gray-900">
                {stats.activeUsers}
              </div>
              <div className="text-sm text-gray-600">Activos (7d)</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="text-2xl font-bold mb-1 text-gray-900">
                {stats.newUsersToday}
              </div>
              <div className="text-sm text-gray-600">Nuevos Hoy</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-red-500 to-pink-500">
                  <AlertTriangle className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="text-2xl font-bold mb-1 text-gray-900">
                {stats.bannedUsers}
              </div>
              <div className="text-sm text-gray-600">Bloqueados</div>
            </motion.div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Buscar Usuarios</label>
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
                <option value="client">Clientes</option>
                <option value="provider">Proveedores</option>
                <option value="agency">Agencias</option>
                <option value="helpdesk">Helpdesk</option>
                <option value="superadmin">Superadmin</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('')
                  setRoleFilter('')
                  setCurrentPage(1)
                }}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Limpiar Filtros
              </button>
            </div>
          </div>

          <div className="mt-4 flex justify-between items-center">
            <span className="text-sm text-gray-600">
              Mostrando {filteredUsers.length} de {totalCount} usuarios
            </span>
            <div className="text-sm text-gray-500">
              Página {currentPage} de {totalPages}
            </div>
          </div>
        </div>

        {/* Users Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredUsers.map((userItem) => (
            <motion.div
              key={userItem.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => openUserDetails(userItem)}
            >
              <div className="p-6">
                {/* User Avatar and Basic Info */}
                <div className="flex items-center mb-4">
                  {userItem.imageUrl ? (
                    <img
                      src={userItem.imageUrl}
                      alt={`${userItem.firstName} ${userItem.lastName}`}
                      className="w-12 h-12 rounded-full object-cover mr-3"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                      <User className="w-6 h-6 text-gray-500" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {userItem.firstName} {userItem.lastName}
                    </h3>
                    <p className="text-sm text-gray-600 truncate">{userItem.email}</p>
                  </div>
                </div>

                {/* Role Badges */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getRoleBadgeColor(userItem)}`}>
                    {getRoleLabel(userItem)}
                  </span>

                  {userItem.banned && (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                      Bloqueado
                    </span>
                  )}
                </div>

                {/* User Status */}
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>Registro: {formatDate(userItem.createdAt)}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>
                      {userItem.lastActiveAt
                        ? `Activo: ${getTimeAgo(userItem.lastActiveAt)}`
                        : 'Nunca activo'
                      }
                    </span>
                  </div>
                </div>

                {/* Quick Stats for Providers/Agencies */}
                {(userItem.role === 'provider' || userItem.isAgency) && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Perfil de Servicio</span>
                      <span className="text-primary font-medium">
                        {userItem.role === 'provider' ? 'Proveedor' : 'Agencia'}
                      </span>
                    </div>
                  </div>
                )}

                {/* Action Button */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      openUserDetails(userItem)
                    }}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 text-primary hover:bg-primary hover:text-white rounded-lg transition-colors border border-primary"
                  >
                    <Eye size={16} />
                    Ver Detalles
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {filteredUsers.length === 0 && !loading && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-8">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>

            <span className="text-sm text-gray-600">
              Página {currentPage} de {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
        )}
      </div>

      {/* User Details Modal */}
      <Modal
        isOpen={showUserModal}
        onClose={closeUserModal}
        title={selectedUser ? `${selectedUser.firstName} ${selectedUser.lastName}` : 'Detalles del Usuario'}
        size="lg"
      >
        {selectedUser && (
          <div className="space-y-6">
            {/* User Header */}
            <div className="flex items-center space-x-4 pb-6 border-b border-gray-100">
              {selectedUser.imageUrl ? (
                <img
                  src={selectedUser.imageUrl}
                  alt={`${selectedUser.firstName} ${selectedUser.lastName}`}
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
                  <User className="w-10 h-10 text-gray-500" />
                </div>
              )}
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                  {selectedUser.firstName} {selectedUser.lastName}
                </h2>
                <div className="flex items-center gap-2 mb-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">{selectedUser.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getRoleBadgeColor(selectedUser)}`}>
                    {getRoleLabel(selectedUser)}
                  </span>
                  {selectedUser.banned && (
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 border border-red-200">
                      Usuario Bloqueado
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* User Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ID de Usuario</label>
                <p className="text-gray-900 font-mono text-sm bg-gray-50 p-2 rounded">{selectedUser.id}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado de la Cuenta</label>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  selectedUser.banned
                    ? 'bg-red-100 text-red-800 border border-red-200'
                    : 'bg-green-100 text-green-800 border border-green-200'
                }`}>
                  {selectedUser.banned ? 'Bloqueado' : 'Activo'}
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Registro</label>
                <p className="text-gray-900">
                  {formatDate(selectedUser.createdAt)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Última Actividad</label>
                <p className="text-gray-900">
                  {selectedUser.lastActiveAt
                    ? formatDate(selectedUser.lastActiveAt)
                    : 'Nunca'
                  }
                </p>
              </div>
            </div>

            {/* Roles and Permissions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Roles y Permisos</label>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="space-y-3">
                  {selectedUser.isSuperAdmin && (
                    <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <Shield className="w-5 h-5 text-red-600" />
                      <div>
                        <div className="font-medium text-red-900">Superadministrador</div>
                        <div className="text-sm text-red-700">Acceso completo al sistema</div>
                      </div>
                    </div>
                  )}

                  {selectedUser.role === 'helpdesk' && (
                    <div className="flex items-center gap-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                      <UserCheck className="w-5 h-5 text-purple-600" />
                      <div>
                        <div className="font-medium text-purple-900">Helpdesk</div>
                        <div className="text-sm text-purple-700">Soporte y moderación del sistema</div>
                      </div>
                    </div>
                  )}

                  {selectedUser.role === 'provider' && (
                    <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <UserCheck className="w-5 h-5 text-blue-600" />
                      <div>
                        <div className="font-medium text-blue-900">Proveedor de Servicios</div>
                        <div className="text-sm text-blue-700">Puede ofrecer servicios a clientes</div>
                      </div>
                    </div>
                  )}

                  {selectedUser.isAgency && (
                    <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <Shield className="w-5 h-5 text-green-600" />
                      <div>
                        <div className="font-medium text-green-900">Agencia Inmobiliaria</div>
                        <div className="text-sm text-green-700">Acceso a funciones de agencia</div>
                      </div>
                    </div>
                  )}

                  {!selectedUser.role && !selectedUser.isAgency && !selectedUser.isSuperAdmin && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                      <User className="w-5 h-5 text-gray-600" />
                      <div>
                        <div className="font-medium text-gray-900">Cliente Regular</div>
                        <div className="text-sm text-gray-700">Acceso básico a la plataforma</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Activity Summary */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Resumen de Actividad</label>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-lg font-semibold text-gray-900">
                      {selectedUser.lastActiveAt
                        ? getTimeAgo(selectedUser.lastActiveAt)
                        : 'Nunca'
                      }
                    </div>
                    <div className="text-sm text-gray-600">Última actividad</div>
                  </div>

                  <div>
                    <div className="text-lg font-semibold text-gray-900">
                      {Math.floor((Date.now() - selectedUser.createdAt) / (1000 * 60 * 60 * 24))}
                    </div>
                    <div className="text-sm text-gray-600">Días en el sistema</div>
                  </div>

                  <div>
                    <div className="text-lg font-semibold text-gray-900">
                      {selectedUser.lastActiveAt && selectedUser.lastActiveAt > (Date.now() - 7 * 24 * 60 * 60 * 1000)
                        ? 'Activo'
                        : 'Inactivo'
                      }
                    </div>
                    <div className="text-sm text-gray-600">Estado (últimos 7 días)</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Note: Helpdesk users can view information but cannot perform admin actions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <div className="font-medium text-blue-900 mb-1">Información de Helpdesk</div>
                  <div className="text-sm text-blue-700">
                    Como usuario de helpdesk, puedes visualizar información de usuarios para proporcionar soporte,
                    pero no puedes realizar acciones administrativas como bloquear usuarios o cambiar roles.
                    Para acciones administrativas, contacta a un superadministrador.
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-100">
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