'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  Eye,
  Users,
  BarChart3,
  Settings,
  Check,
  X,
  Calendar,
  DollarSign
} from 'lucide-react'

interface Service {
  _id: string
  title: string
  description: string
  category: string
  basePrice: number
  currency: string
  duration: string
  features: Array<{
    id: string
    title: string
    description: string
    included: boolean
  }>
  isActive: boolean
  requiresApproval: boolean
  maxProviders: number
  currentProviders: number
  createdAt: string
  updatedAt: string
}

export default function SuperAdminServices() {
  const { user, isLoaded } = useUser()
  const router = useRouter()

  const [services, setServices] = useState<Service[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [showCreateModal, setShowCreateModal] = useState(false)

  // Check admin access
  useEffect(() => {
    if (isLoaded && (!user || user.organizationMemberships?.[0]?.role !== 'org:admin')) {
      router.push('/dashboard')
    }
  }, [user, isLoaded, router])

  // Load services
  useEffect(() => {
    if (user && user.organizationMemberships?.[0]?.role === 'org:admin') {
      loadServices()
    }
  }, [user, selectedCategory, selectedStatus])

  const loadServices = async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams()
      if (selectedCategory !== 'all') params.set('category', selectedCategory)
      if (selectedStatus !== 'all') params.set('status', selectedStatus)

      const response = await fetch(`/api/superadmin/services?${params}`)
      if (response.ok) {
        const data = await response.json()
        setServices(data.data || [])
      } else {
        console.error('Error loading services')
      }
    } catch (error) {
      console.error('Error loading services:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteService = async (serviceId: string) => {
    if (!confirm('¿Estás seguro de eliminar este servicio? Esta acción no se puede deshacer.')) {
      return
    }

    try {
      const response = await fetch(`/api/superadmin/services/${serviceId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setServices(services.filter(s => s._id !== serviceId))
      } else {
        alert('Error al eliminar servicio')
      }
    } catch (error) {
      console.error('Error deleting service:', error)
      alert('Error al eliminar servicio')
    }
  }

  const handleToggleActive = async (serviceId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/superadmin/services/${serviceId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus })
      })

      if (response.ok) {
        const data = await response.json()
        setServices(services.map(s => s._id === serviceId ? data.data : s))
      } else {
        alert('Error al actualizar servicio')
      }
    } catch (error) {
      console.error('Error updating service:', error)
      alert('Error al actualizar servicio')
    }
  }

  const filteredServices = services.filter(service =>
    service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getCategoryName = (category: string) => {
    const categories: Record<string, string> = {
      'visual': 'Visual',
      'legal': 'Legal',
      'consulting': 'Consultoría',
      'staging': 'Staging',
      'documentation': 'Documentación',
      'marketing': 'Marketing'
    }
    return categories[category] || category
  }

  if (!isLoaded || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-primary rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <main className="pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-light text-gray-900">Gestión de Servicios</h1>
              <p className="text-gray-600 mt-2">
                Administra los servicios disponibles en la plataforma
              </p>
            </div>
            <motion.button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary flex items-center gap-3 w-full sm:w-auto justify-center"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Plus size={20} />
              Crear Servicio
            </motion.button>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-8 flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar servicios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10 pr-4 w-full"
            />
          </div>

          <div className="flex gap-4">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="input"
            >
              <option value="all">Todas las categorías</option>
              <option value="visual">Visual</option>
              <option value="legal">Legal</option>
              <option value="consulting">Consultoría</option>
              <option value="staging">Staging</option>
              <option value="documentation">Documentación</option>
              <option value="marketing">Marketing</option>
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="input"
            >
              <option value="all">Todos los estados</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
            </select>
          </div>
        </div>

        {/* Services Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-4">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-600">Cargando servicios...</p>
            </div>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="text-center py-16 glass-icon-container rounded-2xl">
            <div className="w-16 h-16 mx-auto mb-6 glass rounded-2xl flex items-center justify-center">
              <Settings className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium mb-2 text-gray-900">
              No hay servicios
            </h3>
            <p className="text-gray-600 mb-6">
              Crea el primer servicio para empezar
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary"
            >
              Crear Primer Servicio
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredServices.map((service, index) => (
              <motion.div
                key={service._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`glass-icon-container rounded-2xl p-6 ${
                  !service.isActive ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium text-gray-900 line-clamp-1">
                        {service.title}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        service.isActive
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {service.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                      {service.description}
                    </p>
                    <div className="text-xs text-gray-500 mb-3">
                      {getCategoryName(service.category)} • {service.duration}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-light text-gray-900">
                      ${service.basePrice.toLocaleString()}
                    </span>
                    <span className="text-sm text-gray-600">{service.currency}</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Users size={12} />
                      {service.currentProviders}/{service.maxProviders}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleToggleActive(service._id, service.isActive)}
                      className={`p-2 rounded-lg transition-colors ${
                        service.isActive
                          ? 'text-green-600 hover:bg-green-50'
                          : 'text-gray-400 hover:bg-gray-50'
                      }`}
                      title={service.isActive ? 'Desactivar' : 'Activar'}
                    >
                      {service.isActive ? <Check size={16} /> : <X size={16} />}
                    </button>
                    <button
                      onClick={() => router.push(`/superadmin/services/${service._id}/edit`)}
                      className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                      title="Editar"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      onClick={() => router.push(`/superadmin/services/${service._id}/applications`)}
                      className="p-2 rounded-lg text-purple-600 hover:bg-purple-50 transition-colors"
                      title="Ver Aplicaciones"
                    >
                      <Users size={16} />
                    </button>
                  </div>
                  <button
                    onClick={() => handleDeleteService(service._id)}
                    className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Create Modal Placeholder */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-medium text-gray-900">Crear Nuevo Servicio</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>

              <div className="text-center py-16">
                <Settings className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600">
                  Formulario de creación de servicios en desarrollo...
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Por ahora puedes gestionar servicios existentes
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </main>
  )
}