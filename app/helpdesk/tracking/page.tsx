'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  TrendingUp,
  Search,
  Clock,
  AlertTriangle,
  CheckCircle,
  User,
  Building,
  Calendar,
  MessageCircle,
  Phone,
  Mail,
  Filter,
  Eye,
  Edit,
  Plus
} from 'lucide-react'

interface ServiceTracking {
  id: string
  serviceId: string
  customerName: string
  supplierName: string
  serviceType: string
  status: 'pending' | 'in_progress' | 'delayed' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  requestDate: string
  expectedDate: string
  completionDate?: string
  lastUpdate: string
  delayReason?: string
  customerSatisfaction?: number
  notes: string
  contactHistory: ContactRecord[]
}

interface ContactRecord {
  id: string
  date: string
  type: 'call' | 'email' | 'meeting' | 'system'
  contactedBy: string
  details: string
  followUpRequired: boolean
}

export default function TrackingPage() {
  const [trackingData, setTrackingData] = useState<ServiceTracking[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterPriority, setFilterPriority] = useState<string>('all')
  const [selectedService, setSelectedService] = useState<ServiceTracking | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showContactModal, setShowContactModal] = useState(false)

  useEffect(() => {
    // Simulate API call for tracking data
    setTrackingData([
      {
        id: '1',
        serviceId: 'SRV-2024-001',
        customerName: 'María González',
        supplierName: 'Servicios de Limpieza Pro',
        serviceType: 'Limpieza de Oficinas',
        status: 'delayed',
        priority: 'high',
        requestDate: '2024-01-05',
        expectedDate: '2024-01-10',
        lastUpdate: '2024-01-08',
        delayReason: 'Falta de personal disponible',
        notes: 'Cliente solicita reprogramación urgente',
        contactHistory: [
          {
            id: '1',
            date: '2024-01-08',
            type: 'call',
            contactedBy: 'Ana Pérez',
            details: 'Cliente informado sobre el retraso',
            followUpRequired: true
          }
        ]
      },
      {
        id: '2',
        serviceId: 'SRV-2024-002',
        customerName: 'Corporación ABC',
        supplierName: 'Mantenimiento Total',
        serviceType: 'Reparación de Aires Acondicionados',
        status: 'in_progress',
        priority: 'medium',
        requestDate: '2024-01-03',
        expectedDate: '2024-01-12',
        lastUpdate: '2024-01-07',
        notes: 'Servicio en curso, sin problemas reportados',
        contactHistory: [
          {
            id: '2',
            date: '2024-01-07',
            type: 'email',
            contactedBy: 'Carlos Ruiz',
            details: 'Actualización de progreso enviada',
            followUpRequired: false
          }
        ]
      },
      {
        id: '3',
        serviceId: 'SRV-2024-003',
        customerName: 'Hotel Plaza',
        supplierName: 'Jardinería Verde',
        serviceType: 'Mantenimiento de Jardines',
        status: 'completed',
        priority: 'low',
        requestDate: '2024-01-01',
        expectedDate: '2024-01-08',
        completionDate: '2024-01-07',
        lastUpdate: '2024-01-07',
        customerSatisfaction: 5,
        notes: 'Servicio completado satisfactoriamente',
        contactHistory: [
          {
            id: '3',
            date: '2024-01-07',
            type: 'system',
            contactedBy: 'Sistema',
            details: 'Servicio marcado como completado',
            followUpRequired: false
          }
        ]
      },
      {
        id: '4',
        serviceId: 'SRV-2024-004',
        customerName: 'Edificio Residencial Sur',
        supplierName: 'Seguridad 24/7',
        serviceType: 'Instalación de Cámaras',
        status: 'pending',
        priority: 'urgent',
        requestDate: '2024-01-09',
        expectedDate: '2024-01-15',
        lastUpdate: '2024-01-09',
        notes: 'Esperando confirmación de horarios',
        contactHistory: []
      }
    ])
  }, [])

  const filteredData = trackingData.filter(item => {
    const matchesSearch =
      item.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.serviceType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.serviceId.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = filterStatus === 'all' || item.status === filterStatus
    const matchesPriority = filterPriority === 'all' || item.priority === filterPriority

    return matchesSearch && matchesStatus && matchesPriority
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'in_progress': return 'bg-blue-100 text-blue-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'delayed': return 'bg-red-100 text-red-800'
      case 'cancelled': return 'bg-gray-100 text-gray-800'
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

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Completado'
      case 'in_progress': return 'En Progreso'
      case 'pending': return 'Pendiente'
      case 'delayed': return 'Retrasado'
      case 'cancelled': return 'Cancelado'
      default: return status
    }
  }

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'Urgente'
      case 'high': return 'Alta'
      case 'medium': return 'Media'
      case 'low': return 'Baja'
      default: return priority
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />
      case 'in_progress': return <Clock className="h-4 w-4" />
      case 'pending': return <Clock className="h-4 w-4" />
      case 'delayed': return <AlertTriangle className="h-4 w-4" />
      default: return null
    }
  }

  const getDaysUntilExpected = (expectedDate: string) => {
    const today = new Date()
    const expected = new Date(expectedDate)
    const diffTime = expected.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Canal C:S - Seguimiento Customer/Supplier</h1>
        <p className="text-gray-600">Departamento de seguimiento a servicios entre clientes y proveedores</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Servicios Activos</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {trackingData.filter(item => ['pending', 'in_progress'].includes(item.status)).length}
            </div>
            <p className="text-xs text-gray-600">En seguimiento</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Servicios Retrasados</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {trackingData.filter(item => item.status === 'delayed').length}
            </div>
            <p className="text-xs text-gray-600">Requieren atención</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completados Hoy</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {trackingData.filter(item =>
                item.status === 'completed' &&
                item.completionDate === new Date().toISOString().split('T')[0]
              ).length}
            </div>
            <p className="text-xs text-gray-600">Este día</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Satisfacción Promedio</CardTitle>
            <TrendingUp className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {(trackingData.filter(item => item.customerSatisfaction)
                .reduce((acc, item) => acc + (item.customerSatisfaction || 0), 0) /
                trackingData.filter(item => item.customerSatisfaction).length || 0).toFixed(1)}
            </div>
            <p className="text-xs text-gray-600">De 5 estrellas</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por cliente, proveedor, servicio o ID..."
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
                <option value="in_progress">En Progreso</option>
                <option value="delayed">Retrasados</option>
                <option value="completed">Completados</option>
                <option value="cancelled">Cancelados</option>
              </select>
            </div>
            <div className="w-48">
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="all">Todas las prioridades</option>
                <option value="urgent">Urgente</option>
                <option value="high">Alta</option>
                <option value="medium">Media</option>
                <option value="low">Baja</option>
              </select>
            </div>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Seguimiento
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tracking Table */}
      <Card>
        <CardHeader>
          <CardTitle>Servicios en Seguimiento</CardTitle>
          <CardDescription>
            Monitoreo completo de servicios entre clientes y proveedores
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 font-semibold">ID</th>
                  <th className="text-left p-4 font-semibold">Cliente</th>
                  <th className="text-left p-4 font-semibold">Proveedor</th>
                  <th className="text-left p-4 font-semibold">Servicio</th>
                  <th className="text-left p-4 font-semibold">Estado</th>
                  <th className="text-left p-4 font-semibold">Prioridad</th>
                  <th className="text-left p-4 font-semibold">Fecha Esperada</th>
                  <th className="text-left p-4 font-semibold">Días Restantes</th>
                  <th className="text-left p-4 font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item) => {
                  const daysUntilExpected = getDaysUntilExpected(item.expectedDate)
                  return (
                    <tr key={item.id} className="border-b hover:bg-gray-50">
                      <td className="p-4 font-medium">{item.serviceId}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          {item.customerName}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-gray-400" />
                          {item.supplierName}
                        </div>
                      </td>
                      <td className="p-4">{item.serviceType}</td>
                      <td className="p-4">
                        <Badge className={getStatusColor(item.status)}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(item.status)}
                            {getStatusText(item.status)}
                          </div>
                        </Badge>
                      </td>
                      <td className="p-4">
                        <Badge className={getPriorityColor(item.priority)}>
                          {getPriorityText(item.priority)}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          {new Date(item.expectedDate).toLocaleDateString('es-ES')}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`font-medium ${
                          daysUntilExpected < 0
                            ? 'text-red-600'
                            : daysUntilExpected <= 2
                              ? 'text-orange-600'
                              : 'text-gray-600'
                        }`}>
                          {daysUntilExpected < 0
                            ? `${Math.abs(daysUntilExpected)} días atrasado`
                            : `${daysUntilExpected} días`
                          }
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedService(item)
                              setShowDetailsModal(true)
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedService(item)
                              setShowContactModal(true)
                            }}
                          >
                            <Phone className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {filteredData.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No se encontraron servicios con los filtros aplicados
            </div>
          )}
        </CardContent>
      </Card>

      {/* Details Modal */}
      {showDetailsModal && selectedService && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-96 overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              Detalles del Servicio: {selectedService.serviceId}
            </h3>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Cliente</label>
                <p className="text-sm">{selectedService.customerName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Proveedor</label>
                <p className="text-sm">{selectedService.supplierName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Tipo de Servicio</label>
                <p className="text-sm">{selectedService.serviceType}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Estado</label>
                <Badge className={getStatusColor(selectedService.status)}>
                  {getStatusText(selectedService.status)}
                </Badge>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Fecha de Solicitud</label>
                <p className="text-sm">{new Date(selectedService.requestDate).toLocaleDateString('es-ES')}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Fecha Esperada</label>
                <p className="text-sm">{new Date(selectedService.expectedDate).toLocaleDateString('es-ES')}</p>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-600 mb-1">Notas</label>
              <p className="text-sm bg-gray-50 p-3 rounded">{selectedService.notes}</p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-600 mb-2">Historial de Contactos</label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {selectedService.contactHistory.map((contact) => (
                  <div key={contact.id} className="bg-gray-50 p-3 rounded text-sm">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-medium">{contact.contactedBy}</span>
                      <span className="text-gray-500 text-xs">
                        {new Date(contact.date).toLocaleDateString('es-ES')}
                      </span>
                    </div>
                    <p className="text-gray-700">{contact.details}</p>
                    {contact.followUpRequired && (
                      <Badge className="mt-1 bg-yellow-100 text-yellow-800">
                        Seguimiento Requerido
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDetailsModal(false)
                  setSelectedService(null)
                }}
                className="flex-1"
              >
                Cerrar
              </Button>
              <Button className="flex-1">
                Editar Servicio
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Contact Modal */}
      {showContactModal && selectedService && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              Registrar Contacto: {selectedService.serviceId}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Tipo de Contacto</label>
                <select className="w-full p-2 border border-gray-300 rounded-md">
                  <option value="call">Llamada</option>
                  <option value="email">Email</option>
                  <option value="meeting">Reunión</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Detalles del Contacto
                </label>
                <Textarea
                  placeholder="Descripción de la comunicación..."
                  rows={4}
                />
              </div>

              <div className="flex items-center space-x-2">
                <input type="checkbox" id="followUp" />
                <label htmlFor="followUp" className="text-sm">
                  Requiere seguimiento
                </label>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setShowContactModal(false)
                  setSelectedService(null)
                }}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={() => {
                  setShowContactModal(false)
                  setSelectedService(null)
                }}
                className="flex-1"
              >
                Guardar Contacto
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}