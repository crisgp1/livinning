'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  MessageSquare,
  Search,
  Filter,
  RefreshCw,
  Eye,
  User,
  Mail,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Send,
  Plus,
  Tag,
  Calendar,
  UserCheck,
  Zap
} from 'lucide-react'
import Modal from '@/components/ui/Modal'
import { useModal } from '@/hooks/useModal'

interface SupportTicket {
  _id: string
  userId: string
  userEmail: string
  userName: string
  userRole: 'client' | 'provider' | 'admin'
  subject: string
  description: string
  category: 'technical' | 'billing' | 'service' | 'account' | 'other'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  assignedTo?: string
  assignedToName?: string
  tags: string[]
  messages: Array<{
    id: string
    senderId: string
    senderName: string
    senderRole: string
    message: string
    createdAt: string
  }>
  createdAt: string
  updatedAt: string
  resolvedAt?: string
  closedAt?: string
}

interface TicketStats {
  totalTickets: number
  openTickets: number
  inProgressTickets: number
  resolvedTickets: number
  closedTickets: number
  urgentTickets: number
  myAssignedTickets: number
  avgResolutionTime: number
}

const PRIORITY_COLORS = {
  low: 'bg-gray-100 text-gray-800 border-gray-200',
  medium: 'bg-blue-100 text-blue-800 border-blue-200',
  high: 'bg-orange-100 text-orange-800 border-orange-200',
  urgent: 'bg-red-100 text-red-800 border-red-200'
}

const STATUS_COLORS = {
  open: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  in_progress: 'bg-blue-100 text-blue-800 border-blue-200',
  resolved: 'bg-green-100 text-green-800 border-green-200',
  closed: 'bg-gray-100 text-gray-800 border-gray-200'
}

export default function SupportTicketsPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [stats, setStats] = useState<TicketStats | null>(null)
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('open')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [assignedFilter, setAssignedFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  // New ticket form
  const [newTicketForm, setNewTicketForm] = useState({
    subject: '',
    description: '',
    category: 'technical',
    priority: 'medium',
    userEmail: '',
    userName: ''
  })

  const {
    isOpen: showTicketModal,
    openModal: openTicketModal,
    closeModal: closeTicketModal
  } = useModal()

  const {
    isOpen: showCreateModal,
    openModal: openCreateModal,
    closeModal: closeCreateModal
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

      fetchTickets()
    } else if (isLoaded && !user) {
      router.push('/sign-in')
    }
  }, [user, isLoaded, router, statusFilter, priorityFilter, assignedFilter, searchTerm, currentPage])

  const fetchTickets = async () => {
    try {
      setLoading(true)

      const params = new URLSearchParams()
      params.set('status', statusFilter)
      if (priorityFilter) params.set('priority', priorityFilter)
      if (assignedFilter) params.set('assigned', assignedFilter)
      if (searchTerm) params.set('search', searchTerm)
      params.set('limit', '20')
      params.set('skip', ((currentPage - 1) * 20).toString())

      const response = await fetch(`/api/helpdesk/support-tickets?${params.toString()}`)
      const data = await response.json()

      if (data.success) {
        setTickets(data.data.tickets)
        setTotalCount(data.data.totalCount)

        // Calculate stats
        const myUserId = user?.id
        const totalTickets = data.data.totalCount
        const openTickets = data.data.tickets.filter((t: SupportTicket) => t.status === 'open').length
        const inProgressTickets = data.data.tickets.filter((t: SupportTicket) => t.status === 'in_progress').length
        const resolvedTickets = data.data.tickets.filter((t: SupportTicket) => t.status === 'resolved').length
        const closedTickets = data.data.tickets.filter((t: SupportTicket) => t.status === 'closed').length
        const urgentTickets = data.data.tickets.filter((t: SupportTicket) => t.priority === 'urgent').length
        const myAssignedTickets = data.data.tickets.filter((t: SupportTicket) => t.assignedTo === myUserId).length

        // Calculate average resolution time
        const resolvedWithTime = data.data.tickets.filter((t: SupportTicket) =>
          t.status === 'resolved' && t.resolvedAt && t.createdAt
        )
        const avgResolutionTime = resolvedWithTime.length > 0
          ? resolvedWithTime.reduce((acc: number, t: SupportTicket) => {
              const created = new Date(t.createdAt).getTime()
              const resolved = new Date(t.resolvedAt!).getTime()
              return acc + ((resolved - created) / (1000 * 60 * 60)) // Convert to hours
            }, 0) / resolvedWithTime.length
          : 0

        setStats({
          totalTickets,
          openTickets,
          inProgressTickets,
          resolvedTickets,
          closedTickets,
          urgentTickets,
          myAssignedTickets,
          avgResolutionTime: Math.round(avgResolutionTime)
        })
      }
    } catch (error) {
      console.error('Error fetching support tickets:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTicketAction = async (ticketId: string, action: string, data: any = {}) => {
    try {
      setActionLoading(action)

      const response = await fetch('/api/helpdesk/support-tickets', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ticketId,
          action,
          ...data
        })
      })

      const result = await response.json()

      if (result.success) {
        await fetchTickets() // Refresh the list

        if (action === 'reply') {
          setNewMessage('')
          // Refresh the selected ticket if it's open
          if (selectedTicket && selectedTicket._id === ticketId) {
            const updatedTicket = tickets.find(t => t._id === ticketId)
            if (updatedTicket) {
              setSelectedTicket(updatedTicket)
            }
          }
        }
      } else {
        console.error('Error performing ticket action:', result.error)
      }
    } catch (error) {
      console.error('Error performing ticket action:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const handleCreateTicket = async () => {
    try {
      setActionLoading('create')

      const response = await fetch('/api/helpdesk/support-tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTicketForm)
      })

      const result = await response.json()

      if (result.success) {
        await fetchTickets() // Refresh the list
        closeCreateModal()
        setNewTicketForm({
          subject: '',
          description: '',
          category: 'technical',
          priority: 'medium',
          userEmail: '',
          userName: ''
        })
      } else {
        console.error('Error creating ticket:', result.error)
      }
    } catch (error) {
      console.error('Error creating ticket:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const openTicketDetails = (ticket: SupportTicket) => {
    setSelectedTicket(ticket)
    setNewMessage('')
    openTicketModal()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTimeAgo = (dateString: string) => {
    const now = new Date().getTime()
    const date = new Date(dateString).getTime()
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60))

    if (diffInHours < 1) return 'Hace menos de 1 hora'
    if (diffInHours < 24) return `Hace ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`

    const diffInDays = Math.floor(diffInHours / 24)
    return `Hace ${diffInDays} día${diffInDays > 1 ? 's' : ''}`
  }

  const totalPages = Math.ceil(totalCount / 20)

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
              <h1 className="text-2xl font-bold text-gray-900">Tickets de Soporte</h1>
              <p className="text-gray-600 mt-1">
                Gestiona y responde tickets de soporte de usuarios
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={openCreateModal}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus size={16} />
                Crear Ticket
              </button>
              <button
                onClick={fetchTickets}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Actualizar
              </button>
            </div>
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
                  <MessageSquare className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="text-2xl font-bold mb-1 text-gray-900">
                {stats.totalTickets}
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
                <div className="p-3 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500">
                  <AlertTriangle className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="text-2xl font-bold mb-1 text-gray-900">
                {stats.openTickets}
              </div>
              <div className="text-sm text-gray-600">Abiertos</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500">
                  <Clock className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="text-2xl font-bold mb-1 text-gray-900">
                {stats.inProgressTickets}
              </div>
              <div className="text-sm text-gray-600">En Progreso</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="text-2xl font-bold mb-1 text-gray-900">
                {stats.resolvedTickets}
              </div>
              <div className="text-sm text-gray-600">Resueltos</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-red-500 to-pink-500">
                  <Zap className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="text-2xl font-bold mb-1 text-gray-900">
                {stats.urgentTickets}
              </div>
              <div className="text-sm text-gray-600">Urgentes</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500">
                  <UserCheck className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="text-2xl font-bold mb-1 text-gray-900">
                {stats.myAssignedTickets}
              </div>
              <div className="text-sm text-gray-600">Asignados a Mí</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-gray-500 to-gray-600">
                  <XCircle className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="text-2xl font-bold mb-1 text-gray-900">
                {stats.closedTickets}
              </div>
              <div className="text-sm text-gray-600">Cerrados</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-teal-500 to-green-500">
                  <Clock className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="text-2xl font-bold mb-1 text-gray-900">
                {stats.avgResolutionTime}h
              </div>
              <div className="text-sm text-gray-600">Tiempo Medio</div>
            </motion.div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Buscar Tickets</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Asunto, usuario, email..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
              >
                <option value="open">Abiertos</option>
                <option value="all">Todos</option>
                <option value="in_progress">En Progreso</option>
                <option value="resolved">Resueltos</option>
                <option value="closed">Cerrados</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Prioridad</label>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
              >
                <option value="">Todas</option>
                <option value="urgent">Urgente</option>
                <option value="high">Alta</option>
                <option value="medium">Media</option>
                <option value="low">Baja</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Asignación</label>
              <select
                value={assignedFilter}
                onChange={(e) => setAssignedFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
              >
                <option value="">Todos</option>
                <option value="me">Asignados a Mí</option>
                <option value="unassigned">Sin Asignar</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('')
                  setStatusFilter('open')
                  setPriorityFilter('')
                  setAssignedFilter('')
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
              Mostrando {tickets.length} de {totalCount} tickets
            </span>
            <div className="text-sm text-gray-500">
              Página {currentPage} de {totalPages}
            </div>
          </div>
        </div>

        {/* Tickets List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="divide-y divide-gray-100">
            {tickets.map((ticket) => (
              <motion.div
                key={ticket._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => openTicketDetails(ticket)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {ticket.subject}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          PRIORITY_COLORS[ticket.priority as keyof typeof PRIORITY_COLORS]
                        }`}>
                          {ticket.priority}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          STATUS_COLORS[ticket.status as keyof typeof STATUS_COLORS]
                        }`}>
                          {ticket.status}
                        </span>
                      </div>
                    </div>

                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {ticket.description}
                    </p>

                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span>{ticket.userName}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        <span>{ticket.userEmail}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Tag className="w-4 h-4" />
                        <span>{ticket.category}</span>
                      </div>
                      {ticket.assignedToName && (
                        <div className="flex items-center gap-1">
                          <UserCheck className="w-4 h-4" />
                          <span>Asignado a: {ticket.assignedToName}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <div className="text-sm text-gray-500">
                      {getTimeAgo(ticket.createdAt)}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <MessageSquare className="w-4 h-4" />
                      <span>{ticket.messages.length}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {tickets.length === 0 && !loading && (
            <div className="p-12 text-center">
              <MessageSquare className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron tickets</h3>
              <p className="text-gray-600">
                {searchTerm || statusFilter !== 'all'
                  ? 'No hay tickets que coincidan con los filtros aplicados.'
                  : 'No hay tickets de soporte disponibles.'
                }
              </p>
            </div>
          )}
        </div>

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

      {/* Ticket Details Modal */}
      <Modal
        isOpen={showTicketModal}
        onClose={closeTicketModal}
        title={selectedTicket?.subject || 'Detalles del Ticket'}
        size="lg"
      >
        {selectedTicket && (
          <div className="space-y-6">
            {/* Ticket Header */}
            <div className="border-b border-gray-100 pb-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    {selectedTicket.subject}
                  </h2>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>De: {selectedTicket.userName}</span>
                    <span>Email: {selectedTicket.userEmail}</span>
                    <span>Categoría: {selectedTicket.category}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    PRIORITY_COLORS[selectedTicket.priority as keyof typeof PRIORITY_COLORS]
                  }`}>
                    {selectedTicket.priority}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    STATUS_COLORS[selectedTicket.status as keyof typeof STATUS_COLORS]
                  }`}>
                    {selectedTicket.status}
                  </span>
                </div>
              </div>

              <div className="text-sm text-gray-500">
                Creado: {formatDate(selectedTicket.createdAt)}
                {selectedTicket.assignedToName && (
                  <span className="ml-4">
                    Asignado a: {selectedTicket.assignedToName}
                  </span>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="max-h-96 overflow-y-auto space-y-4">
              {selectedTicket.messages.map((message) => (
                <div
                  key={message.id}
                  className={`p-4 rounded-lg ${
                    message.senderRole === 'helpdesk' || message.senderRole === 'admin'
                      ? 'bg-blue-50 border border-blue-200 ml-4'
                      : 'bg-gray-50 border border-gray-200 mr-4'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">
                        {message.senderName}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        message.senderRole === 'helpdesk' || message.senderRole === 'admin'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {message.senderRole}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {formatDate(message.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {message.message}
                  </p>
                </div>
              ))}
            </div>

            {/* Reply Section */}
            {selectedTicket.status !== 'closed' && (
              <div className="border-t border-gray-100 pt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Responder al Ticket
                </label>
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary resize-none"
                  placeholder="Escribe tu respuesta..."
                />
                <div className="flex justify-between items-center mt-4">
                  <div className="flex gap-2">
                    {selectedTicket.status === 'open' && !selectedTicket.assignedTo && (
                      <button
                        onClick={() => handleTicketAction(selectedTicket._id, 'assign', { assignTo: user?.id })}
                        disabled={actionLoading === 'assign'}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                      >
                        {actionLoading === 'assign' ? 'Asignando...' : 'Asignar a Mí'}
                      </button>
                    )}

                    {selectedTicket.status !== 'resolved' && (
                      <button
                        onClick={() => handleTicketAction(selectedTicket._id, 'resolve')}
                        disabled={actionLoading === 'resolve'}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                      >
                        {actionLoading === 'resolve' ? 'Resolviendo...' : 'Marcar Resuelto'}
                      </button>
                    )}

                    <button
                      onClick={() => handleTicketAction(selectedTicket._id, 'close')}
                      disabled={actionLoading === 'close'}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
                    >
                      {actionLoading === 'close' ? 'Cerrando...' : 'Cerrar Ticket'}
                    </button>
                  </div>

                  <button
                    onClick={() => handleTicketAction(selectedTicket._id, 'reply', { message: newMessage })}
                    disabled={!newMessage.trim() || actionLoading === 'reply'}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
                  >
                    {actionLoading === 'reply' ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Send size={16} />
                    )}
                    {actionLoading === 'reply' ? 'Enviando...' : 'Enviar Respuesta'}
                  </button>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-4 border-t border-gray-100">
              <button
                onClick={closeTicketModal}
                className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Create Ticket Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={closeCreateModal}
        title="Crear Nuevo Ticket"
        size="md"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email del Usuario
              </label>
              <input
                type="email"
                value={newTicketForm.userEmail}
                onChange={(e) => setNewTicketForm({...newTicketForm, userEmail: e.target.value})}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del Usuario
              </label>
              <input
                type="text"
                value={newTicketForm.userName}
                onChange={(e) => setNewTicketForm({...newTicketForm, userName: e.target.value})}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Asunto
            </label>
            <input
              type="text"
              value={newTicketForm.subject}
              onChange={(e) => setNewTicketForm({...newTicketForm, subject: e.target.value})}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoría
              </label>
              <select
                value={newTicketForm.category}
                onChange={(e) => setNewTicketForm({...newTicketForm, category: e.target.value})}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
              >
                <option value="technical">Técnico</option>
                <option value="billing">Facturación</option>
                <option value="service">Servicio</option>
                <option value="account">Cuenta</option>
                <option value="other">Otro</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prioridad
              </label>
              <select
                value={newTicketForm.priority}
                onChange={(e) => setNewTicketForm({...newTicketForm, priority: e.target.value})}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
              >
                <option value="low">Baja</option>
                <option value="medium">Media</option>
                <option value="high">Alta</option>
                <option value="urgent">Urgente</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción
            </label>
            <textarea
              value={newTicketForm.description}
              onChange={(e) => setNewTicketForm({...newTicketForm, description: e.target.value})}
              rows={4}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary resize-none"
              required
            />
          </div>

          <div className="flex justify-between pt-4 border-t border-gray-100">
            <button
              onClick={closeCreateModal}
              className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleCreateTicket}
              disabled={actionLoading === 'create' || !newTicketForm.subject || !newTicketForm.description || !newTicketForm.userEmail}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {actionLoading === 'create' ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Plus size={16} />
              )}
              {actionLoading === 'create' ? 'Creando...' : 'Crear Ticket'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}