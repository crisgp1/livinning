'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  Building,
  Search,
  Star,
  Edit,
  Eye,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertTriangle,
  Phone,
  Mail,
  MapPin
} from 'lucide-react'

interface Provider {
  id: string
  name: string
  category: string
  rating: number
  status: 'active' | 'inactive' | 'under_review'
  contact: {
    phone: string
    email: string
    address: string
  }
  stats: {
    completedServices: number
    averageResponseTime: string
    onTimeDelivery: number
  }
  lastService: string
  notes: string
}

export default function ProvidersPage() {
  const [providers, setProviders] = useState<Provider[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null)
  const [showReviewModal, setShowReviewModal] = useState(false)

  useEffect(() => {
    // Simulate API call for providers data
    setProviders([
      {
        id: '1',
        name: 'Servicios de Limpieza Pro',
        category: 'Limpieza',
        rating: 4.5,
        status: 'active',
        contact: {
          phone: '+1 234 567 8901',
          email: 'contacto@limpiezapro.com',
          address: 'Av. Principal 123, Ciudad'
        },
        stats: {
          completedServices: 87,
          averageResponseTime: '2.5 horas',
          onTimeDelivery: 92
        },
        lastService: '2024-01-10',
        notes: 'Proveedor confiable con buen historial'
      },
      {
        id: '2',
        name: 'Mantenimiento Total',
        category: 'Mantenimiento',
        rating: 3.8,
        status: 'under_review',
        contact: {
          phone: '+1 234 567 8902',
          email: 'info@mantenimientotal.com',
          address: 'Calle Secundaria 456, Ciudad'
        },
        stats: {
          completedServices: 45,
          averageResponseTime: '4.2 horas',
          onTimeDelivery: 78
        },
        lastService: '2024-01-08',
        notes: 'Problemas recientes con tiempos de entrega'
      },
      {
        id: '3',
        name: 'Jardinería Verde',
        category: 'Jardinería',
        rating: 4.8,
        status: 'active',
        contact: {
          phone: '+1 234 567 8903',
          email: 'contacto@jardinerieverde.com',
          address: 'Parque Industrial 789, Ciudad'
        },
        stats: {
          completedServices: 156,
          averageResponseTime: '1.8 horas',
          onTimeDelivery: 96
        },
        lastService: '2024-01-12',
        notes: 'Excelente proveedor, muy recomendado'
      },
      {
        id: '4',
        name: 'Seguridad 24/7',
        category: 'Seguridad',
        rating: 4.2,
        status: 'active',
        contact: {
          phone: '+1 234 567 8904',
          email: 'seguridad@247.com',
          address: 'Centro Comercial 321, Ciudad'
        },
        stats: {
          completedServices: 203,
          averageResponseTime: '0.5 horas',
          onTimeDelivery: 89
        },
        lastService: '2024-01-11',
        notes: 'Respuesta rápida en emergencias'
      }
    ])
  }, [])

  const categories = ['all', 'Limpieza', 'Mantenimiento', 'Jardinería', 'Seguridad']

  const filteredProviders = providers.filter(provider => {
    const matchesSearch = provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         provider.category.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === 'all' || provider.category === filterCategory
    const matchesStatus = filterStatus === 'all' || provider.status === filterStatus
    return matchesSearch && matchesCategory && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-gray-100 text-gray-800'
      case 'under_review': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Activo'
      case 'inactive': return 'Inactivo'
      case 'under_review': return 'En Revisión'
      default: return status
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4" />
      case 'inactive': return <Clock className="h-4 w-4" />
      case 'under_review': return <AlertTriangle className="h-4 w-4" />
      default: return null
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ))
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Proveedores</h1>
        <p className="text-gray-600">Revisión y seguimiento de proveedores de servicios</p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar proveedores..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="w-48">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'Todas las categorías' : category}
                  </option>
                ))}
              </select>
            </div>
            <div className="w-48">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="all">Todos los estados</option>
                <option value="active">Activos</option>
                <option value="under_review">En Revisión</option>
                <option value="inactive">Inactivos</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Providers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredProviders.map((provider) => (
          <Card key={provider.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg mb-1">{provider.name}</CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    {provider.category}
                  </CardDescription>
                </div>
                <Badge className={getStatusColor(provider.status)}>
                  <div className="flex items-center gap-1">
                    {getStatusIcon(provider.status)}
                    {getStatusText(provider.status)}
                  </div>
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex">
                  {renderStars(provider.rating)}
                </div>
                <span className="text-sm font-medium">{provider.rating.toFixed(1)}</span>
              </div>

              {/* Stats */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Servicios completados:</span>
                  <span className="font-medium">{provider.stats.completedServices}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tiempo promedio:</span>
                  <span className="font-medium">{provider.stats.averageResponseTime}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Entrega a tiempo:</span>
                  <span className="font-medium">{provider.stats.onTimeDelivery}%</span>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-2 mb-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Phone className="h-3 w-3" />
                  <span>{provider.contact.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-3 w-3" />
                  <span>{provider.contact.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-3 w-3" />
                  <span>{provider.contact.address}</span>
                </div>
              </div>

              {/* Notes */}
              <div className="mb-4">
                <p className="text-sm text-gray-600 italic">{provider.notes}</p>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedProvider(provider)}
                  className="flex-1"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Ver Detalles
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    setSelectedProvider(provider)
                    setShowReviewModal(true)
                  }}
                  className="flex-1"
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Revisar
                </Button>
              </div>

              <div className="text-xs text-gray-500 mt-2">
                Último servicio: {new Date(provider.lastService).toLocaleDateString('es-ES')}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProviders.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Building className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No se encontraron proveedores
            </h3>
            <p className="text-gray-600">
              Ajusta los filtros para ver más resultados
            </p>
          </CardContent>
        </Card>
      )}

      {/* Review Modal */}
      {showReviewModal && selectedProvider && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              Revisar Proveedor: {selectedProvider.name}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Calificación
                </label>
                <div className="flex gap-1">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star
                      key={i}
                      className="h-6 w-6 text-yellow-400 cursor-pointer hover:fill-current"
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Estado del Proveedor
                </label>
                <select className="w-full p-2 border border-gray-300 rounded-md">
                  <option value="active">Activo</option>
                  <option value="under_review">En Revisión</option>
                  <option value="inactive">Inactivo</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Comentarios
                </label>
                <Textarea
                  placeholder="Agregar comentarios sobre el proveedor..."
                  rows={4}
                  defaultValue={selectedProvider.notes}
                />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setShowReviewModal(false)
                  setSelectedProvider(null)
                }}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={() => {
                  setShowReviewModal(false)
                  setSelectedProvider(null)
                }}
                className="flex-1"
              >
                Guardar Revisión
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}