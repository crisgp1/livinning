'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  Phone,
  Mail,
  MessageSquare,
  Clock,
  AlertTriangle,
  Send,
  Search,
  Filter,
  Plus,
  Eye,
  Calendar,
  User,
  Building,
  CheckCircle,
  X
} from 'lucide-react'

interface Communication {
  id: string
  type: 'call' | 'email' | 'sms' | 'whatsapp' | 'meeting'
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'responded' | 'failed'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  subject: string
  recipient: string
  recipientType: 'customer' | 'supplier'
  serviceId?: string
  message: string
  scheduledDate: string
  sentDate?: string
  responseDate?: string
  createdBy: string
  isDelayNotification: boolean
  delayReason?: string
  followUpRequired: boolean
  tags: string[]
}

interface Template {
  id: string
  name: string
  type: string
  subject: string
  content: string
  variables: string[]
}

export default function CommunicationsPage() {
  const [communications, setCommunications] = useState<Communication[]>([])
  const [templates, setTemplates] = useState<Template[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterType, setFilterType] = useState<string>('all')
  const [showNewCommModal, setShowNewCommModal] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  const [newComm, setNewComm] = useState({
    type: 'email',
    recipient: '',
    recipientType: 'supplier',
    subject: '',
    message: '',
    priority: 'medium',
    scheduledDate: '',
    isDelayNotification: false,
    delayReason: '',
    followUpRequired: false
  })

  useEffect(() => {
    // Simulate API call for communications data
    setCommunications([
      {
        id: '1',
        type: 'email',
        status: 'sent',
        priority: 'high',
        subject: 'Retraso en Servicio de Limpieza - Acción Requerida',
        recipient: 'Servicios de Limpieza Pro',
        recipientType: 'supplier',
        serviceId: 'SRV-2024-001',
        message: 'Se requiere comunicación inmediata sobre el retraso en el servicio...',
        scheduledDate: '2024-01-08T10:00:00',
        sentDate: '2024-01-08T10:02:00',
        createdBy: 'Ana Pérez',
        isDelayNotification: true,
        delayReason: 'Falta de personal',
        followUpRequired: true,
        tags: ['retraso', 'urgente', 'limpieza']
      },
      {
        id: '2',
        type: 'call',
        status: 'delivered',
        priority: 'medium',
        subject: 'Seguimiento de Mantenimiento de Aires',
        recipient: 'Corporación ABC',
        recipientType: 'customer',
        serviceId: 'SRV-2024-002',
        message: 'Llamada de seguimiento programada para informar progreso del mantenimiento',
        scheduledDate: '2024-01-09T14:00:00',
        sentDate: '2024-01-09T14:05:00',
        createdBy: 'Carlos Ruiz',
        isDelayNotification: false,
        followUpRequired: false,
        tags: ['seguimiento', 'mantenimiento']
      },
      {
        id: '3',
        type: 'whatsapp',
        status: 'pending',
        priority: 'urgent',
        subject: 'Comunicación Urgente - Cliente Molesto',
        recipient: 'María González',
        recipientType: 'customer',
        serviceId: 'SRV-2024-001',
        message: 'Comunicación urgente requerida para cliente afectado por retrasos',
        scheduledDate: '2024-01-10T09:00:00',
        createdBy: 'Ana Pérez',
        isDelayNotification: true,
        delayReason: 'Retrasos múltiples',
        followUpRequired: true,
        tags: ['urgente', 'cliente-molesto', 'retraso']
      },
      {
        id: '4',
        type: 'email',
        status: 'responded',
        priority: 'low',
        subject: 'Confirmación de Servicios Completados',
        recipient: 'Hotel Plaza',
        recipientType: 'customer',
        serviceId: 'SRV-2024-003',
        message: 'Confirmación de servicios de jardinería completados satisfactoriamente',
        scheduledDate: '2024-01-07T16:00:00',
        sentDate: '2024-01-07T16:00:00',
        responseDate: '2024-01-07T17:30:00',
        createdBy: 'Sistema',
        isDelayNotification: false,
        followUpRequired: false,
        tags: ['completado', 'jardinería', 'satisfacción']
      }
    ])

    // Simulate templates
    setTemplates([
      {
        id: '1',
        name: 'Notificación de Retraso - Cliente',
        type: 'delay_customer',
        subject: 'Información sobre retraso en su servicio - {SERVICE_ID}',
        content: 'Estimado/a {CUSTOMER_NAME},\n\nLe informamos que el servicio {SERVICE_TYPE} programado para {EXPECTED_DATE} se ha retrasado debido a {DELAY_REASON}.\n\nNuestra nueva fecha estimada es {NEW_DATE}. Lamentamos las molestias.\n\nSaludos cordiales.',
        variables: ['CUSTOMER_NAME', 'SERVICE_TYPE', 'EXPECTED_DATE', 'DELAY_REASON', 'NEW_DATE', 'SERVICE_ID']
      },
      {
        id: '2',
        name: 'Requerimiento Urgente - Proveedor',
        type: 'urgent_supplier',
        subject: 'URGENTE: Acción requerida para servicio {SERVICE_ID}',
        content: 'Estimado proveedor {SUPPLIER_NAME},\n\nSe requiere acción inmediata para el servicio {SERVICE_ID}.\n\nMotivo: {REASON}\nFecha límite: {DEADLINE}\n\nFavor contactar inmediatamente.',
        variables: ['SUPPLIER_NAME', 'SERVICE_ID', 'REASON', 'DEADLINE']
      }
    ])
  }, [])

  const filteredCommunications = communications.filter(comm => {
    const matchesSearch =
      comm.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comm.recipient.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comm.message.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = filterStatus === 'all' || comm.status === filterStatus
    const matchesType = filterType === 'all' || comm.type === filterType

    return matchesSearch && matchesStatus && matchesType
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-blue-100 text-blue-800'
      case 'delivered': return 'bg-green-100 text-green-800'
      case 'read': return 'bg-purple-100 text-purple-800'
      case 'responded': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'failed': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="h-4 w-4" />
      case 'call': return <Phone className="h-4 w-4" />
      case 'sms': return <MessageSquare className="h-4 w-4" />
      case 'whatsapp': return <MessageSquare className="h-4 w-4" />
      case 'meeting': return <Calendar className="h-4 w-4" />
      default: return <MessageSquare className="h-4 w-4" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'sent': return 'Enviado'
      case 'delivered': return 'Entregado'
      case 'read': return 'Leído'
      case 'responded': return 'Respondido'
      case 'pending': return 'Pendiente'
      case 'failed': return 'Falló'
      default: return status
    }
  }

  const handleCreateCommunication = () => {
    const communication = {
      ...newComm,
      id: Date.now().toString(),
      status: 'pending' as const,
      createdBy: 'Usuario Actual',
      tags: newComm.isDelayNotification ? ['retraso'] : []
    }

    setCommunications([communication, ...communications])
    setShowNewCommModal(false)
    setNewComm({
      type: 'email',
      recipient: '',
      recipientType: 'supplier',
      subject: '',
      message: '',
      priority: 'medium',
      scheduledDate: '',
      isDelayNotification: false,
      delayReason: '',
      followUpRequired: false
    })
  }

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find(t => t.id === templateId)
    if (template) {
      setNewComm({
        ...newComm,
        subject: template.subject,
        message: template.content
      })
    }
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Centro de Comunicaciones</h1>
        <p className="text-gray-600">Gestión de comunicaciones con clientes y proveedores para retrasos y seguimientos</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Comunicaciones Hoy</CardTitle>
            <Send className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {communications.filter(c =>
                new Date(c.scheduledDate).toDateString() === new Date().toDateString()
              ).length}
            </div>
            <p className="text-xs text-gray-600">Programadas para hoy</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Urgentes Pendientes</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {communications.filter(c => c.status === 'pending' && c.priority === 'urgent').length}
            </div>
            <p className="text-xs text-gray-600">Requieren atención inmediata</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Notificaciones de Retraso</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {communications.filter(c => c.isDelayNotification).length}
            </div>
            <p className="text-xs text-gray-600">Este mes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa de Respuesta</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {Math.round((communications.filter(c => c.status === 'responded').length /
                          communications.filter(c => c.status !== 'pending').length) * 100) || 0}%
            </div>
            <p className="text-xs text-gray-600">Comunicaciones respondidas</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar comunicaciones..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="w-48">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="all">Todos los estados</option>
                <option value="pending">Pendientes</option>
                <option value="sent">Enviados</option>
                <option value="delivered">Entregados</option>
                <option value="responded">Respondidos</option>
                <option value="failed">Fallidos</option>
              </select>
            </div>
            <div className="w-48">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="all">Todos los tipos</option>
                <option value="email">Email</option>
                <option value="call">Llamada</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="sms">SMS</option>
                <option value="meeting">Reunión</option>
              </select>
            </div>
            <Button onClick={() => setShowNewCommModal(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Nueva Comunicación
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Communications List */}
      <Card>
        <CardHeader>
          <CardTitle>Registro de Comunicaciones</CardTitle>
          <CardDescription>
            Historial completo de comunicaciones con clientes y proveedores
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredCommunications.map((comm) => (
              <div key={comm.id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(comm.type)}
                    <h4 className="font-medium">{comm.subject}</h4>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={getPriorityColor(comm.priority)}>
                      {comm.priority.charAt(0).toUpperCase() + comm.priority.slice(1)}
                    </Badge>
                    <Badge className={getStatusColor(comm.status)}>
                      {getStatusText(comm.status)}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-2">
                  <div className="flex items-center gap-2">
                    {comm.recipientType === 'customer' ?
                      <User className="h-4 w-4" /> :
                      <Building className="h-4 w-4" />
                    }
                    <span>{comm.recipient}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(comm.scheduledDate).toLocaleString('es-ES')}</span>
                  </div>
                </div>

                <p className="text-sm text-gray-700 mb-3 line-clamp-2">{comm.message}</p>

                <div className="flex justify-between items-center">
                  <div className="flex gap-2">
                    {comm.isDelayNotification && (
                      <Badge className="bg-orange-100 text-orange-800">
                        <Clock className="mr-1 h-3 w-3" />
                        Notificación de Retraso
                      </Badge>
                    )}
                    {comm.followUpRequired && (
                      <Badge className="bg-yellow-100 text-yellow-800">
                        Requiere Seguimiento
                      </Badge>
                    )}
                    {comm.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    {comm.status === 'pending' && (
                      <Button size="sm">
                        <Send className="mr-1 h-4 w-4" />
                        Enviar
                      </Button>
                    )}
                  </div>
                </div>

                <div className="text-xs text-gray-500 mt-2">
                  Creado por: {comm.createdBy}
                  {comm.serviceId && ` • Servicio: ${comm.serviceId}`}
                </div>
              </div>
            ))}
          </div>

          {filteredCommunications.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No se encontraron comunicaciones con los filtros aplicados
            </div>
          )}
        </CardContent>
      </Card>

      {/* New Communication Modal */}
      {showNewCommModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-96 overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Nueva Comunicación</h3>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Tipo</label>
                  <select
                    value={newComm.type}
                    onChange={(e) => setNewComm({...newComm, type: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="email">Email</option>
                    <option value="call">Llamada</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="sms">SMS</option>
                    <option value="meeting">Reunión</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Prioridad</label>
                  <select
                    value={newComm.priority}
                    onChange={(e) => setNewComm({...newComm, priority: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="low">Baja</option>
                    <option value="medium">Media</option>
                    <option value="high">Alta</option>
                    <option value="urgent">Urgente</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Plantilla</label>
                <select
                  value={selectedTemplate}
                  onChange={(e) => {
                    setSelectedTemplate(e.target.value)
                    if (e.target.value) handleTemplateSelect(e.target.value)
                  }}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">Sin plantilla</option>
                  {templates.map(template => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Destinatario</label>
                  <Input
                    value={newComm.recipient}
                    onChange={(e) => setNewComm({...newComm, recipient: e.target.value})}
                    placeholder="Nombre del destinatario"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Tipo de Destinatario</label>
                  <select
                    value={newComm.recipientType}
                    onChange={(e) => setNewComm({...newComm, recipientType: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="customer">Cliente</option>
                    <option value="supplier">Proveedor</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Asunto</label>
                <Input
                  value={newComm.subject}
                  onChange={(e) => setNewComm({...newComm, subject: e.target.value})}
                  placeholder="Asunto de la comunicación"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Mensaje</label>
                <Textarea
                  value={newComm.message}
                  onChange={(e) => setNewComm({...newComm, message: e.target.value})}
                  placeholder="Contenido del mensaje..."
                  rows={4}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Programar para</label>
                <Input
                  type="datetime-local"
                  value={newComm.scheduledDate}
                  onChange={(e) => setNewComm({...newComm, scheduledDate: e.target.value})}
                />
              </div>

              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={newComm.isDelayNotification}
                    onChange={(e) => setNewComm({...newComm, isDelayNotification: e.target.checked})}
                  />
                  <span className="text-sm">Es notificación de retraso</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={newComm.followUpRequired}
                    onChange={(e) => setNewComm({...newComm, followUpRequired: e.target.checked})}
                  />
                  <span className="text-sm">Requiere seguimiento</span>
                </label>
              </div>

              {newComm.isDelayNotification && (
                <div>
                  <label className="block text-sm font-medium mb-2">Razón del Retraso</label>
                  <Input
                    value={newComm.delayReason}
                    onChange={(e) => setNewComm({...newComm, delayReason: e.target.value})}
                    placeholder="Motivo del retraso"
                  />
                </div>
              )}
            </div>

            <div className="flex gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowNewCommModal(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCreateCommunication}
                className="flex-1"
                disabled={!newComm.recipient || !newComm.subject || !newComm.message}
              >
                Crear Comunicación
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}