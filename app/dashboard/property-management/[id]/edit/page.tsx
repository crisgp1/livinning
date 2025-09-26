'use client'

import { useUser } from '@clerk/nextjs'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Building,
  Save,
  ArrowLeft,
  Camera,
  MapPin,
  DollarSign,
  Home,
  Bed,
  Bath,
  Square,
  Car,
  Trash2,
  Plus,
  Eye,
  BarChart3,
  Star,
  Clock,
  Users,
  TrendingUp
} from 'lucide-react'

interface PropertyEditData {
  id: string
  title: string
  description: string
  price: { amount: number; currency: string }
  propertyType: string
  transactionType: 'sale' | 'rent' | 'both'
  address: {
    street: string
    city: string
    state: string
    country: string
    postalCode: string
  }
  features: {
    bedrooms: number
    bathrooms: number
    squareMeters: number
    parking: number
  }
  images: string[]
  status: 'draft' | 'published' | 'suspended'
  isHighlighted: boolean
  highlightExpiresAt?: string
  performance?: {
    views: number
    inquiries: number
    favorites: number
    conversionRate: number
  }
}

export default function PropertyEditPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const params = useParams()
  const propertyId = params.id as string

  const [property, setProperty] = useState<PropertyEditData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'basic' | 'images' | 'performance'>('basic')

  useEffect(() => {
    if (isLoaded && user && propertyId) {
      fetchProperty()
    }
  }, [user, isLoaded, propertyId])

  const fetchProperty = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/properties/${propertyId}`)
      if (response.ok) {
        const data = await response.json()
        // Add mock performance data
        const propertyData = {
          ...data.data,
          performance: {
            views: Math.floor(Math.random() * 1000) + 100,
            inquiries: Math.floor(Math.random() * 50) + 5,
            favorites: Math.floor(Math.random() * 25) + 2,
            conversionRate: (Math.random() * 10 + 2).toFixed(1)
          }
        }
        setProperty(propertyData)
      }
    } catch (error) {
      console.error('Error fetching property:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!property) return

    try {
      setIsSaving(true)
      const response = await fetch(`/api/properties/${propertyId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(property)
      })

      if (response.ok) {
        router.push('/dashboard/property-management')
      } else {
        alert('Error al guardar la propiedad')
      }
    } catch (error) {
      console.error('Error saving property:', error)
      alert('Error al guardar la propiedad')
    } finally {
      setIsSaving(false)
    }
  }

  const handlePublishToggle = async () => {
    if (!property) return

    const newStatus = property.status === 'published' ? 'draft' : 'published'
    setProperty({
      ...property,
      status: newStatus
    })
  }

  const handleHighlightToggle = () => {
    if (!property) return

    if (property.isHighlighted) {
      // Remove highlight
      setProperty({
        ...property,
        isHighlighted: false,
        highlightExpiresAt: undefined
      })
    } else {
      // Redirect to highlight service
      router.push(`/services/highlight/checkout?propertyId=${propertyId}`)
    }
  }

  if (!isLoaded || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-primary rounded-full animate-spin"></div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-primary rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <Building className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h2 className="text-xl font-medium text-gray-900 mb-2">Propiedad no encontrada</h2>
          <button
            onClick={() => router.push('/dashboard/property-management')}
            className="btn-primary"
          >
            Volver al Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <main className="pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-8 mt-6">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => router.push('/dashboard/property-management')}
              className="p-2 rounded-lg glass-icon-container"
            >
              <ArrowLeft size={20} className="text-gray-600" />
            </button>
            <div className="flex-1">
              <h1 className="text-2xl lg:text-3xl font-light text-gray-900">
                Editar Propiedad
              </h1>
              <p className="text-gray-600">
                {property.title}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handlePublishToggle}
                className={`btn-secondary ${
                  property.status === 'published' ? 'bg-orange-50 text-orange-600 border-orange-200' : ''
                }`}
              >
                {property.status === 'published' ? 'Despublicar' : 'Publicar'}
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="btn-primary flex items-center gap-2"
              >
                <Save size={16} />
                {isSaving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>

          {/* Status and Performance Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className={`glass-card p-4 ${
              property.status === 'published' ? 'border-green-200 bg-green-50'
              : property.status === 'draft' ? 'border-orange-200 bg-orange-50'
              : 'border-red-200 bg-red-50'
            }`}>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${
                  property.status === 'published' ? 'bg-green-500'
                  : property.status === 'draft' ? 'bg-orange-500'
                  : 'bg-red-500'
                }`}></div>
                <span className="text-sm font-medium">
                  {property.status === 'published' ? 'Publicada'
                   : property.status === 'draft' ? 'Borrador'
                   : 'Suspendida'}
                </span>
              </div>
            </div>

            <div className="glass-card p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye size={16} className="text-blue-500" />
                  <span className="text-sm text-gray-600">Vistas</span>
                </div>
                <span className="font-medium">{property.performance?.views || 0}</span>
              </div>
            </div>

            <div className="glass-card p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users size={16} className="text-green-500" />
                  <span className="text-sm text-gray-600">Consultas</span>
                </div>
                <span className="font-medium">{property.performance?.inquiries || 0}</span>
              </div>
            </div>

            <div className="glass-card p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp size={16} className="text-purple-500" />
                  <span className="text-sm text-gray-600">Conversión</span>
                </div>
                <span className="font-medium">{property.performance?.conversionRate || 0}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="flex items-center gap-6 border-b border-gray-200">
            {[
              { id: 'basic', label: 'Información Básica', icon: Building },
              { id: 'images', label: 'Imágenes', icon: Camera },
              { id: 'performance', label: 'Rendimiento', icon: BarChart3 }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 pb-4 px-1 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon size={18} />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-8">
          {activeTab === 'basic' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Basic Information */}
              <div className="glass-card p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-6">Información Básica</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Título
                    </label>
                    <input
                      type="text"
                      value={property.title}
                      onChange={(e) => setProperty({...property, title: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-primary focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descripción
                    </label>
                    <textarea
                      value={property.description}
                      onChange={(e) => setProperty({...property, description: e.target.value})}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-primary focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Precio
                      </label>
                      <input
                        type="number"
                        value={property.price.amount}
                        onChange={(e) => setProperty({
                          ...property,
                          price: {...property.price, amount: Number(e.target.value)}
                        })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-primary focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tipo de Transacción
                      </label>
                      <select
                        value={property.transactionType}
                        onChange={(e) => setProperty({
                          ...property,
                          transactionType: e.target.value as any
                        })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-primary focus:outline-none"
                      >
                        <option value="sale">Venta</option>
                        <option value="rent">Renta</option>
                        <option value="both">Venta/Renta</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="glass-card p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-6">Ubicación</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dirección
                    </label>
                    <input
                      type="text"
                      value={property.address.street}
                      onChange={(e) => setProperty({
                        ...property,
                        address: {...property.address, street: e.target.value}
                      })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-primary focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ciudad
                      </label>
                      <input
                        type="text"
                        value={property.address.city}
                        onChange={(e) => setProperty({
                          ...property,
                          address: {...property.address, city: e.target.value}
                        })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-primary focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Estado
                      </label>
                      <input
                        type="text"
                        value={property.address.state}
                        onChange={(e) => setProperty({
                          ...property,
                          address: {...property.address, state: e.target.value}
                        })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-primary focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Código Postal
                      </label>
                      <input
                        type="text"
                        value={property.address.postalCode}
                        onChange={(e) => setProperty({
                          ...property,
                          address: {...property.address, postalCode: e.target.value}
                        })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-primary focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        País
                      </label>
                      <input
                        type="text"
                        value={property.address.country}
                        onChange={(e) => setProperty({
                          ...property,
                          address: {...property.address, country: e.target.value}
                        })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-primary focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="glass-card p-6 lg:col-span-2">
                <h3 className="text-lg font-medium text-gray-900 mb-6">Características</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Habitaciones
                    </label>
                    <div className="flex items-center gap-2">
                      <Bed size={16} className="text-gray-400" />
                      <input
                        type="number"
                        value={property.features.bedrooms}
                        onChange={(e) => setProperty({
                          ...property,
                          features: {...property.features, bedrooms: Number(e.target.value)}
                        })}
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:border-primary focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Baños
                    </label>
                    <div className="flex items-center gap-2">
                      <Bath size={16} className="text-gray-400" />
                      <input
                        type="number"
                        value={property.features.bathrooms}
                        onChange={(e) => setProperty({
                          ...property,
                          features: {...property.features, bathrooms: Number(e.target.value)}
                        })}
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:border-primary focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Metros²
                    </label>
                    <div className="flex items-center gap-2">
                      <Square size={16} className="text-gray-400" />
                      <input
                        type="number"
                        value={property.features.squareMeters}
                        onChange={(e) => setProperty({
                          ...property,
                          features: {...property.features, squareMeters: Number(e.target.value)}
                        })}
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:border-primary focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estacionamiento
                    </label>
                    <div className="flex items-center gap-2">
                      <Car size={16} className="text-gray-400" />
                      <input
                        type="number"
                        value={property.features.parking}
                        onChange={(e) => setProperty({
                          ...property,
                          features: {...property.features, parking: Number(e.target.value)}
                        })}
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:border-primary focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'images' && (
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900">Galería de Imágenes</h3>
                <button className="btn-secondary flex items-center gap-2">
                  <Plus size={16} />
                  Agregar Imagen
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {property.images.map((image, index) => (
                  <div key={index} className="relative group rounded-lg overflow-hidden">
                    <img
                      src={image}
                      alt={`Imagen ${index + 1}`}
                      className="w-full h-32 object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                      <button className="opacity-0 group-hover:opacity-100 p-2 bg-red-500 text-white rounded-lg transition-opacity">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}

                <div className="border-2 border-dashed border-gray-300 rounded-lg h-32 flex items-center justify-center text-gray-400 hover:border-primary hover:text-primary transition-colors cursor-pointer">
                  <div className="text-center">
                    <Camera className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm">Agregar imagen</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'performance' && (
            <div className="space-y-6">
              {/* Performance Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="glass-card p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-blue-100">
                      <Eye className="w-5 h-5 text-blue-600" />
                    </div>
                    <h4 className="font-medium text-gray-900">Vistas</h4>
                  </div>
                  <div className="text-2xl font-light text-gray-900 mb-1">
                    {property.performance?.views || 0}
                  </div>
                  <div className="text-sm text-gray-600">
                    En los últimos 30 días
                  </div>
                </div>

                <div className="glass-card p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-green-100">
                      <Users className="w-5 h-5 text-green-600" />
                    </div>
                    <h4 className="font-medium text-gray-900">Consultas</h4>
                  </div>
                  <div className="text-2xl font-light text-gray-900 mb-1">
                    {property.performance?.inquiries || 0}
                  </div>
                  <div className="text-sm text-gray-600">
                    Formularios enviados
                  </div>
                </div>

                <div className="glass-card p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-purple-100">
                      <TrendingUp className="w-5 h-5 text-purple-600" />
                    </div>
                    <h4 className="font-medium text-gray-900">Conversión</h4>
                  </div>
                  <div className="text-2xl font-light text-gray-900 mb-1">
                    {property.performance?.conversionRate || 0}%
                  </div>
                  <div className="text-sm text-gray-600">
                    Vistas a consultas
                  </div>
                </div>

                <div className="glass-card p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-red-100">
                      <Star className="w-5 h-5 text-red-600" />
                    </div>
                    <h4 className="font-medium text-gray-900">Favoritos</h4>
                  </div>
                  <div className="text-2xl font-light text-gray-900 mb-1">
                    {property.performance?.favorites || 0}
                  </div>
                  <div className="text-sm text-gray-600">
                    Guardada como favorita
                  </div>
                </div>
              </div>

              {/* Highlight Management */}
              <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-gray-900">Gestión de Destacado</h3>
                  {property.isHighlighted && (
                    <div className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-700">
                      Destacada
                    </div>
                  )}
                </div>

                {property.isHighlighted ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock size={16} />
                      <span>
                        Expira: {property.highlightExpiresAt
                          ? new Date(property.highlightExpiresAt).toLocaleDateString()
                          : 'No definido'
                        }
                      </span>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => router.push(`/services/highlight/checkout?propertyId=${propertyId}&extend=true`)}
                        className="btn-secondary"
                      >
                        Extender Destacado
                      </button>
                      <button
                        onClick={handleHighlightToggle}
                        className="btn-secondary text-red-600 border-red-200 hover:bg-red-50"
                      >
                        Remover Destacado
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Star className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <h4 className="font-medium text-gray-900 mb-2">
                      Esta propiedad no está destacada
                    </h4>
                    <p className="text-gray-600 mb-6">
                      Destacar tu propiedad puede incrementar las vistas hasta 5x
                    </p>
                    <button
                      onClick={handleHighlightToggle}
                      className="btn-primary"
                    >
                      Destacar Propiedad
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}