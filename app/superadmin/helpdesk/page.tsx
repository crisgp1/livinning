'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Users,
  Building2,
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
  UserCheck,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Filter,
  Search,
  RefreshCw,
  MessageSquare,
  FileText,
  ChevronDown,
  ChevronRight,
  Phone,
  Mail,
  MapPin,
  Calendar
} from 'lucide-react'
import Navigation from '@/components/Navigation'
import Modal from '@/components/ui/Modal'
import { useModal } from '@/hooks/useModal'

interface Transaction {
  id: string
  type: 'service_order' | 'payment' | 'subscription' | 'property_listing'
  serviceType?: string
  serviceName?: string
  amount: number
  currency: string
  status: string
  clientId: string
  clientName: string
  clientEmail: string
  providerId?: string
  providerName?: string
  propertyAddress?: string
  contactPhone?: string
  stripePaymentIntentId?: string
  stripeSessionId?: string
  createdAt: string
  updatedAt: string
  notes: string[]
  metadata?: Record<string, any>
}

interface SupportTicket {
  id: string
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
}

interface HelpdeskStats {
  transactions: {
    total: number
    today: number
    thisWeek: number
    totalAmount: number
    byStatus: Record<string, number>
    byType: Record<string, number>
  }
  supportTickets: {
    total: number
    open: number
    inProgress: number
    resolved: number
    byPriority: Record<string, number>
    avgResolutionTime: number
  }
  users: {
    totalClients: number
    totalProviders: number
    activeToday: number
    newThisWeek: number
  }
}

const TRANSACTION_STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
  in_progress: 'bg-orange-100 text-orange-800 border-orange-200',
  completed: 'bg-green-100 text-green-800 border-green-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
  paid: 'bg-green-100 text-green-800 border-green-200',
  failed: 'bg-red-100 text-red-800 border-red-200'
}

const SUPPORT_PRIORITY_COLORS = {
  low: 'bg-gray-100 text-gray-800 border-gray-200',
  medium: 'bg-blue-100 text-blue-800 border-blue-200',
  high: 'bg-orange-100 text-orange-800 border-orange-200',
  urgent: 'bg-red-100 text-red-800 border-red-200'
}

const SUPPORT_STATUS_COLORS = {
  open: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  in_progress: 'bg-blue-100 text-blue-800 border-blue-200',
  resolved: 'bg-green-100 text-green-800 border-green-200',
  closed: 'bg-gray-100 text-gray-800 border-gray-200'
}

export default function HelpdeskPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<HelpdeskStats | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([])
  const [activeTab, setActiveTab] = useState('overview')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null)
  const { isOpen: showTransactionModal, openModal: openTransactionModal, closeModal: closeTransactionModal } = useModal()
  const { isOpen: showTicketModal, openModal: openTicketModal, closeModal: closeTicketModal } = useModal()

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
      fetchData()
    } else if (isLoaded && !user) {
      router.push('/sign-in')
    }
  }, [user, isLoaded, router])

  const fetchData = async () => {
    try {
      setLoading(true)

      // Fetch stats, transactions, and support tickets
      const [statsRes, transactionsRes, ticketsRes] = await Promise.all([
        fetch('/api/superadmin/helpdesk/stats'),
        fetch('/api/superadmin/helpdesk/transactions'),
        fetch('/api/superadmin/helpdesk/support-tickets')
      ])

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData.data)
      }

      if (transactionsRes.ok) {
        const transactionsData = await transactionsRes.json()
        setTransactions(transactionsData.data || [])
      }

      if (ticketsRes.ok) {
        const ticketsData = await ticketsRes.json()
        setSupportTickets(ticketsData.data || [])
      }

    } catch (error) {
      console.error('Error fetching helpdesk data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTransactionClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
    openTransactionModal()
  }

  const handleTicketClick = (ticket: SupportTicket) => {
    setSelectedTicket(ticket)
    openTicketModal()
  }

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = !searchTerm ||
      transaction.serviceName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.providerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.id.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = !statusFilter || transaction.status === statusFilter
    const matchesType = !typeFilter || transaction.type === typeFilter

    return matchesSearch && matchesStatus && matchesType
  })

  const filteredTickets = supportTickets.filter(ticket => {
    const matchesSearch = !searchTerm ||
      ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.userEmail.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = !statusFilter || ticket.status === statusFilter

    return matchesSearch && matchesStatus
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
        <div className="flex">
          {/* Sidebar */}
          <div className="w-64 h-screen sticky top-20">
            <div className="glass-icon-container m-4 p-6" style={{ height: 'calc(100vh - 6rem)' }}>
              <div className="border-b border-gray-100 pb-6 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="font-light text-gray-900">Helpdesk</h2>
                    <p className="text-xs text-gray-600">Centro de Control</p>
                  </div>
                </div>
              </div>

              <nav className="space-y-2">
                {[
                  { id: 'overview', label: 'Vista General', icon: LayoutDashboard },
                  { id: 'transactions', label: 'Transacciones', icon: DollarSign },
                  { id: 'support', label: 'Soporte', icon: MessageSquare },
                  { id: 'analytics', label: 'Análisis', icon: TrendingUp }
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
                  onClick={() => router.push('/superadmin')}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 bg-gray-100 text-gray-700 hover:bg-gray-200"
                >
                  <Home size={20} />
                  <span>Volver a Superadmin</span>
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-4 lg:p-8">
            <div className="max-w-7xl mx-auto">

              {/* Header */}
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-light mb-2 text-gray-900">
                    {activeTab === 'overview' ? 'Vista General del Sistema' :
                     activeTab === 'transactions' ? 'Transacciones' :
                     activeTab === 'support' ? 'Tickets de Soporte' :
                     'Análisis y Reportes'}
                  </h1>
                  <p className="text-gray-600">
                    {activeTab === 'overview' ? 'Monitoreo en tiempo real de todas las actividades del sistema' :
                     activeTab === 'transactions' ? 'Gestión y seguimiento de todas las transacciones' :
                     activeTab === 'support' ? 'Centro de atención al cliente y resolución de tickets' :
                     'Métricas avanzadas y análisis de rendimiento'}
                  </p>
                </div>
                <button
                  onClick={fetchData}
                  disabled={loading}
                  className="btn-primary flex items-center gap-2"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  Actualizar
                </button>
              </div>

              {/* Overview Content */}
              {activeTab === 'overview' && stats && (
                <div className="space-y-8">
                  {/* Key Metrics Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="glass-card p-6"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500">
                          <DollarSign className="h-6 w-6 text-white" />
                        </div>
                      </div>
                      <div className="text-3xl font-light mb-1 text-gray-900">
                        ${stats.transactions.totalAmount.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600 mb-1">Total Transacciones</div>
                      <div className="text-xs text-green-600">+{stats.transactions.today} hoy</div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="glass-card p-6"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500">
                          <FileText className="h-6 w-6 text-white" />
                        </div>
                      </div>
                      <div className="text-3xl font-light mb-1 text-gray-900">
                        {stats.supportTickets.open}
                      </div>
                      <div className="text-sm text-gray-600 mb-1">Tickets Abiertos</div>
                      <div className="text-xs text-orange-600">
                        {stats.supportTickets.inProgress} en progreso
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="glass-card p-6"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
                          <Users className="h-6 w-6 text-white" />
                        </div>
                      </div>
                      <div className="text-3xl font-light mb-1 text-gray-900">
                        {stats.users.totalClients + stats.users.totalProviders}
                      </div>
                      <div className="text-sm text-gray-600 mb-1">Total Usuarios</div>
                      <div className="text-xs text-blue-600">
                        {stats.users.activeToday} activos hoy
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="glass-card p-6"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-red-500">
                          <Clock className="h-6 w-6 text-white" />
                        </div>
                      </div>
                      <div className="text-3xl font-light mb-1 text-gray-900">
                        {stats.supportTickets.avgResolutionTime}h
                      </div>
                      <div className="text-sm text-gray-600 mb-1">Tiempo Resolución</div>
                      <div className="text-xs text-gray-500">Promedio</div>
                    </motion.div>
                  </div>

                  {/* Recent Activity */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Recent Transactions */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="glass-card"
                    >
                      <div className="p-6 border-b border-gray-100">
                        <h3 className="text-lg font-light text-gray-900">Transacciones Recientes</h3>
                      </div>
                      <div className="divide-y divide-gray-50">
                        {transactions.slice(0, 5).map((transaction) => (
                          <div
                            key={transaction.id}
                            className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                            onClick={() => handleTransactionClick(transaction)}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="font-medium text-gray-900">
                                {transaction.serviceName || `Transacción ${transaction.type}`}
                              </div>
                              <div className="text-green-600 font-semibold">
                                ${transaction.amount} {transaction.currency}
                              </div>
                            </div>
                            <div className="flex items-center justify-between text-sm text-gray-600">
                              <span>{transaction.clientName}</span>
                              <span className={`px-2 py-1 rounded-full text-xs ${TRANSACTION_STATUS_COLORS[transaction.status as keyof typeof TRANSACTION_STATUS_COLORS]}`}>
                                {transaction.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="p-4 border-t border-gray-100">
                        <button
                          onClick={() => setActiveTab('transactions')}
                          className="text-primary hover:text-primary-dark text-sm font-medium"
                        >
                          Ver todas las transacciones →
                        </button>
                      </div>
                    </motion.div>

                    {/* Recent Support Tickets */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="glass-card"
                    >
                      <div className="p-6 border-b border-gray-100">
                        <h3 className="text-lg font-light text-gray-900">Tickets Recientes</h3>
                      </div>
                      <div className="divide-y divide-gray-50">
                        {supportTickets.slice(0, 5).map((ticket) => (
                          <div
                            key={ticket.id}
                            className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                            onClick={() => handleTicketClick(ticket)}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="font-medium text-gray-900 truncate">
                                {ticket.subject}
                              </div>
                              <span className={`px-2 py-1 rounded-full text-xs ${SUPPORT_PRIORITY_COLORS[ticket.priority as keyof typeof SUPPORT_PRIORITY_COLORS]}`}>
                                {ticket.priority}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-sm text-gray-600">
                              <span>{ticket.userName}</span>
                              <span className={`px-2 py-1 rounded-full text-xs ${SUPPORT_STATUS_COLORS[ticket.status as keyof typeof SUPPORT_STATUS_COLORS]}`}>
                                {ticket.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="p-4 border-t border-gray-100">
                        <button
                          onClick={() => setActiveTab('support')}
                          className="text-primary hover:text-primary-dark text-sm font-medium"
                        >
                          Ver todos los tickets →
                        </button>
                      </div>
                    </motion.div>
                  </div>
                </div>
              )}

              {/* Transactions Content */}
              {activeTab === 'transactions' && (
                <div className="space-y-6">
                  {/* Filters */}
                  <div className="glass-card p-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Buscar</label>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                          <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="ID, cliente, proveedor..."
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
                          <option value="">Todos</option>
                          <option value="pending">Pendiente</option>
                          <option value="confirmed">Confirmado</option>
                          <option value="in_progress">En Progreso</option>
                          <option value="completed">Completado</option>
                          <option value="cancelled">Cancelado</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
                        <select
                          value={typeFilter}
                          onChange={(e) => setTypeFilter(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                        >
                          <option value="">Todos</option>
                          <option value="service_order">Órdenes de Servicio</option>
                          <option value="payment">Pagos</option>
                          <option value="subscription">Suscripciones</option>
                          <option value="property_listing">Publicaciones</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Período</label>
                        <select
                          value={dateFilter}
                          onChange={(e) => setDateFilter(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                        >
                          <option value="">Todos</option>
                          <option value="today">Hoy</option>
                          <option value="week">Esta Semana</option>
                          <option value="month">Este Mes</option>
                        </select>
                      </div>
                    </div>

                    <div className="mt-4 flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        Mostrando {filteredTransactions.length} de {transactions.length} transacciones
                      </span>
                      <button
                        onClick={() => {
                          setSearchTerm('')
                          setStatusFilter('')
                          setTypeFilter('')
                          setDateFilter('')
                        }}
                        className="text-sm text-primary hover:text-primary-dark"
                      >
                        Limpiar filtros
                      </button>
                    </div>
                  </div>

                  {/* Transactions Table */}
                  <div className="glass-card overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-100">
                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">ID / Servicio</th>
                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Cliente</th>
                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Proveedor</th>
                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Monto</th>
                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Estado</th>
                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Fecha</th>
                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Acciones</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {filteredTransactions.map((transaction) => (
                            <tr key={transaction.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4">
                                <div>
                                  <div className="font-medium text-gray-900 truncate">{transaction.serviceName || 'N/A'}</div>
                                  <div className="text-xs text-gray-500">{transaction.id}</div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div>
                                  <div className="font-medium text-gray-900">{transaction.clientName}</div>
                                  <div className="text-xs text-gray-500">{transaction.clientEmail}</div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="font-medium text-gray-900">
                                  {transaction.providerName || 'Sin asignar'}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="font-semibold text-green-600">
                                  ${transaction.amount} {transaction.currency}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${TRANSACTION_STATUS_COLORS[transaction.status as keyof typeof TRANSACTION_STATUS_COLORS]}`}>
                                  {transaction.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600">
                                {new Date(transaction.createdAt).toLocaleDateString('es-ES')}
                              </td>
                              <td className="px-6 py-4">
                                <button
                                  onClick={() => handleTransactionClick(transaction)}
                                  className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                                  title="Ver detalles"
                                >
                                  <Eye size={16} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Support Tickets Content */}
              {activeTab === 'support' && (
                <div className="space-y-6">
                  {/* Support tickets implementation would go here */}
                  <div className="glass-card p-12 text-center">
                    <MessageSquare className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Sistema de Tickets</h3>
                    <p className="text-gray-600">
                      El sistema de tickets de soporte estará disponible próximamente.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Transaction Detail Modal */}
      <Modal
        isOpen={showTransactionModal}
        onClose={closeTransactionModal}
        title="Detalles de Transacción"
        size="lg"
      >
        {selectedTransaction && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ID de Transacción</label>
                <p className="text-gray-900 font-mono text-sm">{selectedTransaction.id}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                <p className="text-gray-900">{selectedTransaction.type}</p>
              </div>
            </div>

            {selectedTransaction.serviceName && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Servicio</label>
                <p className="text-gray-900">{selectedTransaction.serviceName}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
                <div>
                  <p className="text-gray-900 font-medium">{selectedTransaction.clientName}</p>
                  <p className="text-sm text-gray-600">{selectedTransaction.clientEmail}</p>
                </div>
              </div>
              {selectedTransaction.providerName && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Proveedor</label>
                  <p className="text-gray-900 font-medium">{selectedTransaction.providerName}</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Monto</label>
                <p className="text-2xl font-semibold text-green-600">
                  ${selectedTransaction.amount} {selectedTransaction.currency}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${TRANSACTION_STATUS_COLORS[selectedTransaction.status as keyof typeof TRANSACTION_STATUS_COLORS]}`}>
                  {selectedTransaction.status}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
                <p className="text-gray-900">{new Date(selectedTransaction.createdAt).toLocaleDateString('es-ES')}</p>
              </div>
            </div>

            {selectedTransaction.propertyAddress && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                <p className="text-gray-900">{selectedTransaction.propertyAddress}</p>
              </div>
            )}

            {selectedTransaction.contactPhone && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                <p className="text-gray-900">{selectedTransaction.contactPhone}</p>
              </div>
            )}

            {selectedTransaction.stripePaymentIntentId && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ID de Pago Stripe</label>
                <p className="text-gray-900 font-mono text-sm">{selectedTransaction.stripePaymentIntentId}</p>
              </div>
            )}

            {selectedTransaction.notes.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Notas</label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {selectedTransaction.notes.map((note, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">{note}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-4 border-t border-gray-100">
              <button
                onClick={closeTransactionModal}
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