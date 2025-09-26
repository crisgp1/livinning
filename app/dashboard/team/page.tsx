'use client'

import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Users, 
  UserPlus, 
  Search, 
  Crown, 
  Shield, 
  User,
  Mail,
  Calendar,
  MoreVertical,
  Edit3,
  Trash2,
  Sparkles
} from 'lucide-react'
import Image from 'next/image'

interface TeamMember {
  id: string
  firstName: string
  lastName: string
  email: string
  role: 'admin' | 'agent' | 'member'
  status: 'active' | 'invited' | 'inactive'
  joinedAt: string
  avatar?: string
}

export default function DashboardTeam() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showInviteForm, setShowInviteForm] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'agent' | 'member'>('member')
  const [isAgent, setIsAgent] = useState(false)

  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/sign-in')
    } else if (isLoaded && user) {
      const metadata = user.publicMetadata as any
      const userRole = metadata?.role || (user as any).privateMetadata?.role
      const isAgency = metadata?.isAgency || metadata?.organizationId
      setIsAgent(userRole === 'agent' || isAgency)
      
      if (!isAgency && userRole !== 'agent') {
        router.push('/dashboard')
        return
      }
      
      fetchTeamMembers()
    }
  }, [user, isLoaded, router])

  const fetchTeamMembers = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/dashboard/team')
      if (response.ok) {
        const data = await response.json()
        setTeamMembers(data.data || [])
      } else {
        setTeamMembers([])
      }
    } catch (error) {
      console.error('Error fetching team members:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteEmail) return

    try {
      // Mock invite - replace with actual API call
      const newMember: TeamMember = {
        id: Date.now().toString(),
        firstName: 'Nuevo',
        lastName: 'Miembro',
        email: inviteEmail,
        role: inviteRole,
        status: 'invited',
        joinedAt: new Date().toISOString().split('T')[0]
      }
      
      setTeamMembers([...teamMembers, newMember])
      setInviteEmail('')
      setShowInviteForm(false)
    } catch (error) {
      console.error('Error inviting member:', error)
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Crown className="w-4 h-4" />
      case 'agent': return <Shield className="w-4 h-4" />
      default: return <User className="w-4 h-4" />
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'agent': return 'text-blue-600 bg-blue-50 border-blue-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-50 border-green-200'
      case 'invited': return 'text-orange-600 bg-orange-50 border-orange-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const filteredMembers = teamMembers.filter(member =>
    member.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (!isLoaded || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-primary rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!isAgent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h2 className="text-2xl font-light text-gray-900 mb-2">Acceso restringido</h2>
          <p className="text-gray-600">Esta sección es solo para agentes y organizaciones</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="relative">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-200 to-cyan-200 rounded-full filter blur-3xl opacity-60"></div>
          <div className="absolute top-80 -left-40 w-96 h-96 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full filter blur-3xl opacity-60"></div>
          <div className="absolute bottom-20 right-20 w-72 h-72 bg-gradient-to-br from-green-200 to-emerald-200 rounded-full filter blur-3xl opacity-40"></div>
        </div>

        <main className="relative z-10 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* Header */}
            <div className="mb-8 lg:mb-12 mt-6 lg:mt-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 mb-4"
              >
                <div className="p-2 rounded-lg glass">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <span className="text-sm font-medium text-primary">Gestión de Equipo</span>
              </motion.div>
              
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-3xl lg:text-4xl font-light mb-2 text-gray-900">
                    Equipo
                  </h1>
                  <p className="text-lg text-gray-600">
                    Gestiona los miembros de tu equipo y sus permisos
                  </p>
                </div>
                
                <motion.button
                  onClick={() => setShowInviteForm(true)}
                  className="btn-primary flex items-center gap-3 w-full sm:w-auto justify-center"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <UserPlus size={20} />
                  Invitar Miembro
                </motion.button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-card p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500">
                    <Users size={20} className="text-white" />
                  </div>
                  <span className="text-xs font-medium text-gray-500">Total</span>
                </div>
                <div className="text-3xl font-light mb-1 text-gray-900">{teamMembers.length}</div>
                <div className="text-sm text-gray-600">Miembros</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-card p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500">
                    <Shield size={20} className="text-white" />
                  </div>
                  <span className="text-xs font-medium text-gray-500">Activos</span>
                </div>
                <div className="text-3xl font-light mb-1 text-gray-900">
                  {teamMembers.filter(m => m.status === 'active').length}
                </div>
                <div className="text-sm text-gray-600">Activos</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="glass-card p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-red-500">
                    <Mail size={20} className="text-white" />
                  </div>
                  <span className="text-xs font-medium text-gray-500">Pendientes</span>
                </div>
                <div className="text-3xl font-light mb-1 text-gray-900">
                  {teamMembers.filter(m => m.status === 'invited').length}
                </div>
                <div className="text-sm text-gray-600">Invitaciones</div>
              </motion.div>
            </div>

            {/* Search */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="glass-icon-container rounded-2xl p-6 mb-8"
            >
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                <input
                  type="text"
                  placeholder="Buscar miembros del equipo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/50 backdrop-blur-sm border border-gray-200 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                />
              </div>
            </motion.div>

            {/* Invite Form Modal */}
            {showInviteForm && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={() => setShowInviteForm(false)}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="glass-icon-container rounded-2xl p-8 max-w-md w-full"
                  onClick={(e) => e.stopPropagation()}
                >
                  <h3 className="text-2xl font-light mb-6 text-gray-900">Invitar nuevo miembro</h3>
                  <form onSubmit={handleInviteMember} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700">Email</label>
                      <input
                        type="email"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-white/50 backdrop-blur-sm border border-gray-200 text-gray-800 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                        placeholder="ejemplo@email.com"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700">Rol</label>
                      <select
                        value={inviteRole}
                        onChange={(e) => setInviteRole(e.target.value as 'agent' | 'member')}
                        className="w-full px-4 py-3 rounded-xl bg-white/50 backdrop-blur-sm border border-gray-200 text-gray-800 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                      >
                        <option value="member">Miembro</option>
                        <option value="agent">Agente</option>
                      </select>
                    </div>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setShowInviteForm(false)}
                        className="flex-1 py-3 px-4 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="flex-1 btn-primary"
                      >
                        Enviar Invitación
                      </button>
                    </div>
                  </form>
                </motion.div>
              </motion.div>
            )}

            {/* Team Members Table */}
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-2 border-gray-200 border-t-primary rounded-full animate-spin"></div>
              </div>
            ) : filteredMembers.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass-icon-container rounded-2xl p-12 text-center"
              >
                <div className="w-16 h-16 mx-auto mb-6 glass rounded-2xl flex items-center justify-center">
                  <Users className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium mb-2 text-gray-900">
                  {searchTerm ? 'No se encontraron miembros' : 'No hay miembros en el equipo'}
                </h3>
                <p className="text-sm mb-6 text-gray-600">
                  {searchTerm 
                    ? 'Intenta ajustar tu búsqueda' 
                    : 'Comienza invitando a tu primer miembro del equipo'
                  }
                </p>
                {!searchTerm && (
                  <button
                    onClick={() => setShowInviteForm(true)}
                    className="btn-primary"
                  >
                    Invitar Miembro
                  </button>
                )}
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="glass-icon-container rounded-2xl overflow-hidden"
              >
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left py-4 px-6 text-sm font-medium text-gray-700">Miembro</th>
                        <th className="text-left py-4 px-6 text-sm font-medium text-gray-700">Rol</th>
                        <th className="text-left py-4 px-6 text-sm font-medium text-gray-700">Estado</th>
                        <th className="text-left py-4 px-6 text-sm font-medium text-gray-700">Fecha</th>
                        <th className="text-left py-4 px-6 text-sm font-medium text-gray-700">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredMembers.map((member, index) => (
                        <motion.tr
                          key={member.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="border-b border-gray-50 hover:bg-white/50 transition-colors"
                        >
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100">
                                {member.avatar ? (
                                  <Image
                                    src={member.avatar}
                                    alt={`${member.firstName} ${member.lastName}`}
                                    width={80}
                                    height={80}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary to-blue-600">
                                    <span className="text-white font-medium text-sm">
                                      {member.firstName[0]}{member.lastName[0]}
                                    </span>
                                  </div>
                                )}
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">
                                  {member.firstName} {member.lastName}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {member.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${getRoleColor(member.role)}`}>
                              {getRoleIcon(member.role)}
                              {member.role === 'admin' ? 'Administrador' : member.role === 'agent' ? 'Agente' : 'Miembro'}
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(member.status)}`}>
                              {member.status === 'active' ? 'Activo' : member.status === 'invited' ? 'Invitado' : 'Inactivo'}
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-1 text-gray-500">
                              <Calendar size={14} />
                              <span className="text-sm">
                                {new Date(member.joinedAt).toLocaleDateString()}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2">
                              <button
                                className="p-2 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors"
                                title="Editar miembro"
                              >
                                <Edit3 size={16} />
                              </button>
                              <button
                                className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                                title="Eliminar miembro"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {/* Mobile Card Layout */}
                <div className="md:hidden space-y-4">
                  {filteredMembers.map((member, index) => (
                    <div key={member.id} className="p-4 bg-white/50 rounded-xl border border-gray-100">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100">
                            {member.avatar ? (
                              <Image
                                src={member.avatar}
                                alt={`${member.firstName} ${member.lastName}`}
                                width={48}
                                height={48}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary to-blue-600">
                                <span className="text-white font-medium">
                                  {member.firstName[0]}{member.lastName[0]}
                                </span>
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {member.firstName} {member.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {member.email}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button className="p-2 rounded-lg bg-gray-50 text-gray-600">
                            <Edit3 size={16} />
                          </button>
                          <button className="p-2 rounded-lg bg-red-50 text-red-600">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex gap-2">
                          <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getRoleColor(member.role)}`}>
                            {getRoleIcon(member.role)}
                            <span className="hidden sm:inline">{member.role === 'admin' ? 'Admin' : member.role === 'agent' ? 'Agente' : 'Miembro'}</span>
                          </div>
                          <div className={`inline-flex px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(member.status)}`}>
                            {member.status === 'active' ? 'Activo' : member.status === 'invited' ? 'Invitado' : 'Inactivo'}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-gray-500">
                          <Calendar size={12} />
                          <span className="text-xs">
                            {new Date(member.joinedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
