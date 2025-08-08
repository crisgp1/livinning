'use client'

import { useState, useEffect } from 'react'
import { useAuth, useUser } from '@clerk/nextjs'
import { useRouter, useParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Navigation from '@/components/Navigation'
import {
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  MessageSquare,
  Upload,
  Calendar,
  Clock,
  TrendingUp,
  Camera,
  FileText,
  Shield,
  Star,
  Activity,
  Package,
  Wrench,
  User,
  MapPin,
  Phone,
  Mail,
  ChevronRight,
  Plus,
  Edit,
  X,
  AlertCircle,
  CheckSquare,
  Circle
} from 'lucide-react'

interface ServiceUpdate {
  id: string
  type: 'progress' | 'incident' | 'comment' | 'milestone' | 'completion'
  title: string
  description: string
  attachments?: string[]
  images?: string[]
  createdBy: string
  createdByName: string
  createdAt: string
  status?: 'pending' | 'in_progress' | 'resolved' | 'escalated'
  priority?: 'low' | 'medium' | 'high' | 'critical'
  tags?: string[]
}

interface ServiceTracking {
  _id: string
  serviceOrderId: string
  providerId: string
  providerName: string
  providerEmail: string
  clientId: string
  clientName: string
  clientEmail: string
  
  serviceType: string
  serviceName: string
  propertyAddress: string
  
  status: 'not_started' | 'in_progress' | 'paused' | 'completed' | 'cancelled'
  phase: 'pre_service' | 'during_service' | 'post_service' | 'warranty'
  
  startDate?: string
  estimatedCompletionDate?: string
  actualCompletionDate?: string
  
  progress: {
    percentage: number
    lastUpdated: string
    milestones: {
      name: string
      description: string
      targetDate: string
      completedDate?: string
      status: 'pending' | 'in_progress' | 'completed' | 'skipped'
    }[]
  }
  
  updates: ServiceUpdate[]
  
  qualityMetrics: {
    clientSatisfaction?: number
    qualityScore?: number
    completionRate?: number
    onTimeDelivery?: boolean
    issuesResolved?: number
    totalIssues?: number
  }
  
  finalResults?: {
    summary: string
    deliverables: string[]
    recommendations: string[]
    warranty?: {
      startDate: string
      endDate: string
      terms: string
    }
    beforeImages?: string[]
    afterImages?: string[]
    documentation?: string[]
  }
  
  communications: {
    unreadByClient: number
    unreadByProvider: number
    lastMessageAt?: string
  }
  
  permissions: {
    isInvitedProvider: boolean
    invitationId?: string
    invitedAt?: string
    acceptedAt?: string
  }
  
  metadata: {
    createdAt: string
    updatedAt: string
    lastActivityAt: string
    viewedByClient?: string
    viewedByProvider?: string
  }
}

export default function ServiceTrackingPage() {
  const { userId, isLoaded } = useAuth()
  const { user } = useUser()
  const router = useRouter()
  const params = useParams()
  const orderId = params.orderId as string

  const [tracking, setTracking] = useState<ServiceTracking | null>(null)
  const [loading, setLoading] = useState(true)
  const [showUpdateModal, setShowUpdateModal] = useState(false)
  const [showCommentModal, setShowCommentModal] = useState(false)
  const [showFinalResultsModal, setShowFinalResultsModal] = useState(false)
  const [updateType, setUpdateType] = useState<'progress' | 'incident' | 'comment' | 'milestone'>('progress')
  const [updateForm, setUpdateForm] = useState({
    title: '',
    description: '',
    progressPercentage: 0,
    status: 'pending' as 'pending' | 'in_progress' | 'resolved' | 'escalated',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    tags: [] as string[],
    images: [] as string[],
    attachments: [] as string[]
  })
  const [commentText, setCommentText] = useState('')
  const [finalResults, setFinalResults] = useState({
    summary: '',
    deliverables: [''],
    recommendations: [''],
    warranty: {
      startDate: '',
      endDate: '',
      terms: ''
    }
  })

  useEffect(() => {
    if (isLoaded && userId) {
      fetchTracking()
    }
  }, [isLoaded, userId, orderId])

  const fetchTracking = async () => {
    try {
      setLoading(true)
      
      const trackingResponse = await fetch(`/api/services/tracking?serviceOrderId=${orderId}`)
      const trackingData = await trackingResponse.json()
      
      if (trackingData.success && trackingData.data.length > 0) {
        setTracking(trackingData.data[0])
      } else {
        const createResponse = await fetch('/api/services/tracking', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ serviceOrderId: orderId })
        })
        
        const createData = await createResponse.json()
        if (createData.success) {
          setTracking(createData.data)
        }
      }
    } catch (error) {
      console.error('Error fetching tracking:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddUpdate = async () => {
    if (!tracking) return

    try {
      const response = await fetch(`/api/services/tracking/${tracking._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ADD_UPDATE',
          data: {
            type: updateType,
            ...updateForm
          }
        })
      })

      const data = await response.json()
      if (data.success) {
        setTracking(data.data)
        setShowUpdateModal(false)
        setUpdateForm({
          title: '',
          description: '',
          progressPercentage: 0,
          status: 'pending',
          priority: 'medium',
          tags: [],
          images: [],
          attachments: []
        })
      }
    } catch (error) {
      console.error('Error adding update:', error)
    }
  }

  const handleAddComment = async () => {
    if (!tracking || !commentText.trim()) return

    try {
      const response = await fetch(`/api/services/tracking/${tracking._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ADD_COMMENT',
          data: { comment: commentText }
        })
      })

      const data = await response.json()
      if (data.success) {
        setTracking(data.data)
        setShowCommentModal(false)
        setCommentText('')
      }
    } catch (error) {
      console.error('Error adding comment:', error)
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    if (!tracking) return

    try {
      const response = await fetch(`/api/services/tracking/${tracking._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'UPDATE_STATUS',
          data: { status: newStatus }
        })
      })

      const data = await response.json()
      if (data.success) {
        setTracking(data.data)
      }
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  const handleSetFinalResults = async () => {
    if (!tracking) return

    try {
      const response = await fetch(`/api/services/tracking/${tracking._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'SET_FINAL_RESULTS',
          data: finalResults
        })
      })

      const data = await response.json()
      if (data.success) {
        setTracking(data.data)
        setShowFinalResultsModal(false)
      }
    } catch (error) {
      console.error('Error setting final results:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'not_started': return 'bg-gray-100 text-gray-700'
      case 'in_progress': return 'bg-blue-100 text-blue-700'
      case 'paused': return 'bg-yellow-100 text-yellow-700'
      case 'completed': return 'bg-green-100 text-green-700'
      case 'cancelled': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'pre_service': return 'bg-purple-100 text-purple-700'
      case 'during_service': return 'bg-blue-100 text-blue-700'
      case 'post_service': return 'bg-green-100 text-green-700'
      case 'warranty': return 'bg-orange-100 text-orange-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getUpdateIcon = (type: string) => {
    switch (type) {
      case 'progress': return <TrendingUp className="w-4 h-4" />
      case 'incident': return <AlertTriangle className="w-4 h-4" />
      case 'comment': return <MessageSquare className="w-4 h-4" />
      case 'milestone': return <CheckCircle className="w-4 h-4" />
      case 'completion': return <Package className="w-4 h-4" />
      default: return <Activity className="w-4 h-4" />
    }
  }

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-50'
      case 'high': return 'text-orange-600 bg-orange-50'
      case 'medium': return 'text-yellow-600 bg-yellow-50'
      case 'low': return 'text-green-600 bg-green-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!tracking) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="pt-20 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              No se encontró el seguimiento
            </h2>
            <p className="text-gray-600 mb-6">
              No hay un registro de seguimiento para esta orden de servicio
            </p>
            <button
              onClick={() => router.push('/provider-dashboard')}
              className="btn-primary"
            >
              Volver al Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => router.push('/provider-dashboard')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver al Dashboard</span>
            </button>

            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                    Seguimiento de Servicio
                  </h1>
                  <p className="text-gray-600">{tracking.serviceName}</p>
                </div>
                
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(tracking.status)}`}>
                    {tracking.status.replace('_', ' ').toUpperCase()}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPhaseColor(tracking.phase)}`}>
                    {tracking.phase.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Service Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">Dirección</p>
                    <p className="text-gray-900">{tracking.propertyAddress}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">Cliente</p>
                    <p className="text-gray-900">{tracking.clientName}</p>
                    <p className="text-sm text-gray-600">{tracking.clientEmail}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">Fecha Estimada</p>
                    <p className="text-gray-900">
                      {tracking.estimatedCompletionDate 
                        ? new Date(tracking.estimatedCompletionDate).toLocaleDateString('es-MX')
                        : 'Por definir'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Progreso General</span>
                  <span className="text-sm font-medium text-gray-900">{tracking.progress.percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${tracking.progress.percentage}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setShowUpdateModal(true)}
                  className="btn-primary flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Agregar Actualización
                </button>
                
                <button
                  onClick={() => setShowCommentModal(true)}
                  className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  Comentar
                </button>
                
                {tracking.status !== 'completed' && (
                  <button
                    onClick={() => setShowFinalResultsModal(true)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Finalizar Servicio
                  </button>
                )}
                
                <select
                  value={tracking.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white"
                >
                  <option value="not_started">No Iniciado</option>
                  <option value="in_progress">En Progreso</option>
                  <option value="paused">Pausado</option>
                  <option value="completed">Completado</option>
                  <option value="cancelled">Cancelado</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content - Timeline */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">
                  Historial de Actualizaciones
                </h2>
                
                <div className="space-y-4">
                  {tracking.updates.length === 0 ? (
                    <div className="text-center py-12">
                      <Activity className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">
                        No hay actualizaciones aún
                      </p>
                      <p className="text-sm text-gray-400 mt-2">
                        Agrega tu primera actualización para comenzar el seguimiento
                      </p>
                    </div>
                  ) : (
                    tracking.updates
                      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                      .map((update, index) => (
                        <motion.div
                          key={update.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="relative pl-8"
                        >
                          {/* Timeline Line */}
                          {index < tracking.updates.length - 1 && (
                            <div className="absolute left-3 top-8 bottom-0 w-0.5 bg-gray-200" />
                          )}
                          
                          {/* Update Icon */}
                          <div className={`absolute left-0 top-2 w-6 h-6 rounded-full flex items-center justify-center ${
                            update.type === 'incident' ? 'bg-red-100 text-red-600' :
                            update.type === 'milestone' ? 'bg-blue-100 text-blue-600' :
                            update.type === 'completion' ? 'bg-green-100 text-green-600' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {getUpdateIcon(update.type)}
                          </div>
                          
                          {/* Update Content */}
                          <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h3 className="font-medium text-gray-900">
                                  {update.title}
                                </h3>
                                <p className="text-sm text-gray-500">
                                  {update.createdByName} • {new Date(update.createdAt).toLocaleString('es-MX')}
                                </p>
                              </div>
                              
                              {update.priority && (
                                <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(update.priority)}`}>
                                  {update.priority.toUpperCase()}
                                </span>
                              )}
                            </div>
                            
                            <p className="text-gray-700 mb-3">
                              {update.description}
                            </p>
                            
                            {update.status && update.type === 'incident' && (
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                  update.status === 'resolved' ? 'bg-green-100 text-green-700' :
                                  update.status === 'escalated' ? 'bg-red-100 text-red-700' :
                                  update.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                                  'bg-gray-100 text-gray-700'
                                }`}>
                                  {update.status.replace('_', ' ').toUpperCase()}
                                </span>
                              </div>
                            )}
                            
                            {update.images && update.images.length > 0 && (
                              <div className="mt-3 flex gap-2 flex-wrap">
                                {update.images.map((image, idx) => (
                                  <img
                                    key={idx}
                                    src={image}
                                    alt={`Imagen ${idx + 1}`}
                                    className="w-20 h-20 object-cover rounded-lg cursor-pointer hover:opacity-90"
                                  />
                                ))}
                              </div>
                            )}
                            
                            {update.tags && update.tags.length > 0 && (
                              <div className="mt-3 flex gap-2 flex-wrap">
                                {update.tags.map((tag, idx) => (
                                  <span
                                    key={idx}
                                    className="px-2 py-1 bg-white rounded text-xs text-gray-600"
                                  >
                                    #{tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      ))
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar - Stats & Info */}
            <div className="space-y-6">
              {/* Quality Metrics */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Métricas de Calidad
                </h3>
                
                <div className="space-y-4">
                  {tracking.qualityMetrics.clientSatisfaction && (
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-600">Satisfacción del Cliente</span>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${
                                star <= tracking.qualityMetrics.clientSatisfaction!
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-600">Incidencias</span>
                      <span className="text-sm font-medium text-gray-900">
                        {tracking.qualityMetrics.issuesResolved || 0} / {tracking.qualityMetrics.totalIssues || 0}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="h-full bg-green-500 rounded-full"
                        style={{
                          width: tracking.qualityMetrics.totalIssues 
                            ? `${((tracking.qualityMetrics.issuesResolved || 0) / tracking.qualityMetrics.totalIssues) * 100}%`
                            : '0%'
                        }}
                      />
                    </div>
                  </div>
                  
                  {tracking.qualityMetrics.onTimeDelivery !== undefined && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Entrega a Tiempo</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        tracking.qualityMetrics.onTimeDelivery
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {tracking.qualityMetrics.onTimeDelivery ? 'SÍ' : 'NO'}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Milestones */}
              {tracking.progress.milestones.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Hitos del Proyecto
                  </h3>
                  
                  <div className="space-y-3">
                    {tracking.progress.milestones.map((milestone, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className={`mt-1 w-5 h-5 rounded-full flex items-center justify-center ${
                          milestone.status === 'completed'
                            ? 'bg-green-100 text-green-600'
                            : milestone.status === 'in_progress'
                            ? 'bg-blue-100 text-blue-600'
                            : 'bg-gray-100 text-gray-400'
                        }`}>
                          {milestone.status === 'completed' ? (
                            <CheckSquare className="w-3 h-3" />
                          ) : milestone.status === 'in_progress' ? (
                            <Circle className="w-3 h-3" />
                          ) : (
                            <Circle className="w-3 h-3" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${
                            milestone.status === 'completed' ? 'text-gray-500 line-through' : 'text-gray-900'
                          }`}>
                            {milestone.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(milestone.targetDate).toLocaleDateString('es-MX')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Final Results */}
              {tracking.finalResults && (
                <div className="bg-white rounded-2xl shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Resultados Finales
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Resumen</p>
                      <p className="text-sm text-gray-600">
                        {tracking.finalResults.summary}
                      </p>
                    </div>
                    
                    {tracking.finalResults.deliverables.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Entregables</p>
                        <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                          {tracking.finalResults.deliverables.map((item, idx) => (
                            <li key={idx}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {tracking.finalResults.warranty && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Garantía</p>
                        <div className="bg-green-50 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <Shield className="w-4 h-4 text-green-600" />
                            <span className="text-sm font-medium text-green-900">
                              Servicio Garantizado
                            </span>
                          </div>
                          <p className="text-xs text-green-700">
                            Válido hasta: {new Date(tracking.finalResults.warranty.endDate).toLocaleDateString('es-MX')}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Update Modal */}
      <AnimatePresence>
        {showUpdateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowUpdateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Agregar Actualización
                </h2>
                <button
                  onClick={() => setShowUpdateModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Actualización
                  </label>
                  <select
                    value={updateType}
                    onChange={(e) => setUpdateType(e.target.value as any)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="progress">Progreso</option>
                    <option value="incident">Incidencia</option>
                    <option value="milestone">Hito</option>
                    <option value="comment">Comentario</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Título
                  </label>
                  <input
                    type="text"
                    value={updateForm.title}
                    onChange={(e) => setUpdateForm({ ...updateForm, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    placeholder="Título de la actualización"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción
                  </label>
                  <textarea
                    value={updateForm.description}
                    onChange={(e) => setUpdateForm({ ...updateForm, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    rows={4}
                    placeholder="Describe la actualización..."
                  />
                </div>

                {updateType === 'progress' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Porcentaje de Progreso: {updateForm.progressPercentage}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={updateForm.progressPercentage}
                      onChange={(e) => setUpdateForm({ ...updateForm, progressPercentage: parseInt(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                )}

                {updateType === 'incident' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Prioridad
                      </label>
                      <select
                        value={updateForm.priority}
                        onChange={(e) => setUpdateForm({ ...updateForm, priority: e.target.value as any })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="low">Baja</option>
                        <option value="medium">Media</option>
                        <option value="high">Alta</option>
                        <option value="critical">Crítica</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Estado
                      </label>
                      <select
                        value={updateForm.status}
                        onChange={(e) => setUpdateForm({ ...updateForm, status: e.target.value as any })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="pending">Pendiente</option>
                        <option value="in_progress">En Progreso</option>
                        <option value="resolved">Resuelto</option>
                        <option value="escalated">Escalado</option>
                      </select>
                    </div>
                  </>
                )}

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    onClick={() => setShowUpdateModal(false)}
                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleAddUpdate}
                    className="btn-primary"
                  >
                    Agregar Actualización
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Comment Modal */}
      <AnimatePresence>
        {showCommentModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowCommentModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-lg w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Agregar Comentario
                </h2>
                <button
                  onClick={() => setShowCommentModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4"
                rows={4}
                placeholder="Escribe tu comentario..."
                autoFocus
              />

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowCommentModal(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddComment}
                  className="btn-primary"
                  disabled={!commentText.trim()}
                >
                  Enviar Comentario
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Final Results Modal */}
      <AnimatePresence>
        {showFinalResultsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowFinalResultsModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Finalizar Servicio
                </h2>
                <button
                  onClick={() => setShowFinalResultsModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Resumen del Servicio
                  </label>
                  <textarea
                    value={finalResults.summary}
                    onChange={(e) => setFinalResults({ ...finalResults, summary: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    rows={4}
                    placeholder="Describe el trabajo realizado y los resultados obtenidos..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Entregables
                  </label>
                  {finalResults.deliverables.map((deliverable, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={deliverable}
                        onChange={(e) => {
                          const newDeliverables = [...finalResults.deliverables]
                          newDeliverables[index] = e.target.value
                          setFinalResults({ ...finalResults, deliverables: newDeliverables })
                        }}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                        placeholder="Describe el entregable..."
                      />
                      <button
                        onClick={() => {
                          const newDeliverables = finalResults.deliverables.filter((_, i) => i !== index)
                          setFinalResults({ ...finalResults, deliverables: newDeliverables })
                        }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => setFinalResults({ ...finalResults, deliverables: [...finalResults.deliverables, ''] })}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    + Agregar entregable
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Garantía del Servicio
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Fecha de Inicio</label>
                      <input
                        type="date"
                        value={finalResults.warranty.startDate}
                        onChange={(e) => setFinalResults({
                          ...finalResults,
                          warranty: { ...finalResults.warranty, startDate: e.target.value }
                        })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Fecha de Fin</label>
                      <input
                        type="date"
                        value={finalResults.warranty.endDate}
                        onChange={(e) => setFinalResults({
                          ...finalResults,
                          warranty: { ...finalResults.warranty, endDate: e.target.value }
                        })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>
                  <textarea
                    value={finalResults.warranty.terms}
                    onChange={(e) => setFinalResults({
                      ...finalResults,
                      warranty: { ...finalResults.warranty, terms: e.target.value }
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg mt-2"
                    rows={2}
                    placeholder="Términos de la garantía..."
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    onClick={() => setShowFinalResultsModal(false)}
                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSetFinalResults}
                    className="btn-primary"
                  >
                    Finalizar Servicio
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}