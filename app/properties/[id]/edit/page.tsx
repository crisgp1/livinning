'use client'

import { useUser } from '@clerk/nextjs'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Navigation from '@/components/Navigation'
import { 
  Edit3, 
  Save, 
  X,
  Upload,
  MapPin,
  Home,
  DollarSign,
  Bed,
  Bath,
  Square,
  Car,
  Sparkles,
  ArrowLeft,
  Eye,
  Trash2
} from 'lucide-react'

interface Property {
  id: string
  title: string
  description: string
  price: { amount: number; currency: string }
  propertyType: string
  status: 'published' | 'draft'
  address: {
    street: string
    city: string
    state: string
    country: string
    zipCode: string
  }
  features: {
    bedrooms: number
    bathrooms: number
    squareMeters: number
    parking: number
  }
  images: string[]
  amenities: string[]
}

export default function EditProperty() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const params = useParams()
  const propertyId = params.id as string

  const [property, setProperty] = useState<Property | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [uploadingImages, setUploadingImages] = useState(false)

  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/sign-in')
    } else if (isLoaded && user && propertyId) {
      fetchProperty()
    }
  }, [user, isLoaded, router, propertyId])

  const fetchProperty = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/properties/${propertyId}`)
      if (response.ok) {
        const data = await response.json()
        setProperty(data.data)
      } else {
        router.push('/dashboard/properties')
      }
    } catch (error) {
      console.error('Error fetching property:', error)
      router.push('/dashboard/properties')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!property) return

    setIsSaving(true)
    try {
      const response = await fetch(`/api/properties/${propertyId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(property)
      })

      if (response.ok) {
        router.push('/dashboard/properties')
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || !property) return

    setUploadingImages(true)
    try {
      const formData = new FormData()
      Array.from(files).forEach(file => {
        formData.append('images', file)
      })

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        setProperty({
          ...property,
          images: [...property.images, ...data.urls]
        })
      }
    } catch (error) {
      console.error('Error uploading images:', error)
    } finally {
      setUploadingImages(false)
    }
  }

  const removeImage = (index: number) => {
    if (!property) return
    const newImages = property.images.filter((_, i) => i !== index)
    setProperty({ ...property, images: newImages })
  }

  const toggleStatus = () => {
    if (!property) return
    setProperty({
      ...property,
      status: property.status === 'published' ? 'draft' : 'published'
    })
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
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="pt-20 flex items-center justify-center min-h-[80vh]">
          <div className="w-8 h-8 border-2 border-gray-200 border-t-primary rounded-full animate-spin"></div>
        </div>
      </div>
    )
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="pt-20 flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <h2 className="text-2xl font-light text-gray-900 mb-2">Propiedad no encontrada</h2>
            <p className="text-gray-600 mb-6">La propiedad que buscas no existe o no tienes permisos para editarla</p>
            <button
              onClick={() => router.push('/dashboard/properties')}
              className="btn-primary"
            >
              Volver a propiedades
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      <div className="pt-20 relative">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-200 to-cyan-200 rounded-full filter blur-3xl opacity-60"></div>
          <div className="absolute top-80 -left-40 w-96 h-96 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full filter blur-3xl opacity-60"></div>
          <div className="absolute bottom-20 right-20 w-72 h-72 bg-gradient-to-br from-green-200 to-emerald-200 rounded-full filter blur-3xl opacity-40"></div>
        </div>

        <main className="relative z-10 pb-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* Header */}
            <div className="mb-8 lg:mb-12 mt-6 lg:mt-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-4 mb-4"
              >
                <button
                  onClick={() => router.push('/dashboard/properties')}
                  className="p-2 rounded-lg glass hover:bg-white/50 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
                <div className="inline-flex items-center gap-2">
                  <div className="p-2 rounded-lg glass">
                    <Edit3 className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-primary">Editar Propiedad</span>
                </div>
              </motion.div>
              
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-3xl lg:text-4xl font-light mb-2 text-gray-900">
                    Editar propiedad
                  </h1>
                  <p className="text-lg text-gray-600">
                    Actualiza la información de tu propiedad
                  </p>
                </div>
                
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => router.push(`/properties/${propertyId}`)}
                    className="btn-secondary flex items-center gap-2"
                  >
                    <Eye size={20} />
                    Vista previa
                  </button>
                  <button
                    onClick={toggleStatus}
                    className={`px-4 py-2 rounded-xl font-medium transition-colors ${
                      property.status === 'published'
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                    }`}
                  >
                    {property.status === 'published' ? 'Publicada' : 'Borrador'}
                  </button>
                </div>
              </div>
            </div>

            {/* Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-8"
            >
              {/* Basic Information */}
              <div className="glass-icon-container rounded-2xl p-8">
                <h2 className="text-xl font-medium mb-6 text-gray-900">Información básica</h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">Título</label>
                    <input
                      type="text"
                      value={property.title}
                      onChange={(e) => setProperty({ ...property, title: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-white/50 backdrop-blur-sm border border-gray-200 text-gray-800 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                      placeholder="Ej: Villa moderna con vista al mar"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">Descripción</label>
                    <textarea
                      value={property.description}
                      onChange={(e) => setProperty({ ...property, description: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-3 rounded-xl bg-white/50 backdrop-blur-sm border border-gray-200 text-gray-800 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                      placeholder="Describe las características principales de la propiedad..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700">Tipo de propiedad</label>
                      <select
                        value={property.propertyType}
                        onChange={(e) => setProperty({ ...property, propertyType: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-white/50 backdrop-blur-sm border border-gray-200 text-gray-800 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                      >
                        <option value="casa">Casa</option>
                        <option value="apartamento">Apartamento</option>
                        <option value="villa">Villa</option>
                        <option value="penthouse">Penthouse</option>
                        <option value="loft">Loft</option>
                        <option value="chalet">Chalet</option>
                        <option value="estudio">Estudio</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700">Precio</label>
                      <div className="relative">
                        <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="number"
                          value={property.price.amount}
                          onChange={(e) => setProperty({
                            ...property,
                            price: { ...property.price, amount: Number(e.target.value) }
                          })}
                          className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/50 backdrop-blur-sm border border-gray-200 text-gray-800 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="glass-icon-container rounded-2xl p-8">
                <h2 className="text-xl font-medium mb-6 text-gray-900">Ubicación</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2 text-gray-700">Dirección</label>
                    <input
                      type="text"
                      value={property.address.street}
                      onChange={(e) => setProperty({
                        ...property,
                        address: { ...property.address, street: e.target.value }
                      })}
                      className="w-full px-4 py-3 rounded-xl bg-white/50 backdrop-blur-sm border border-gray-200 text-gray-800 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                      placeholder="Calle, número"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">Ciudad</label>
                    <input
                      type="text"
                      value={property.address.city}
                      onChange={(e) => setProperty({
                        ...property,
                        address: { ...property.address, city: e.target.value }
                      })}
                      className="w-full px-4 py-3 rounded-xl bg-white/50 backdrop-blur-sm border border-gray-200 text-gray-800 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                      placeholder="Ciudad"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">Estado/Provincia</label>
                    <input
                      type="text"
                      value={property.address.state}
                      onChange={(e) => setProperty({
                        ...property,
                        address: { ...property.address, state: e.target.value }
                      })}
                      className="w-full px-4 py-3 rounded-xl bg-white/50 backdrop-blur-sm border border-gray-200 text-gray-800 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                      placeholder="Estado/Provincia"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">Código postal</label>
                    <input
                      type="text"
                      value={property.address.zipCode}
                      onChange={(e) => setProperty({
                        ...property,
                        address: { ...property.address, zipCode: e.target.value }
                      })}
                      className="w-full px-4 py-3 rounded-xl bg-white/50 backdrop-blur-sm border border-gray-200 text-gray-800 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                      placeholder="00000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">País</label>
                    <input
                      type="text"
                      value={property.address.country}
                      onChange={(e) => setProperty({
                        ...property,
                        address: { ...property.address, country: e.target.value }
                      })}
                      className="w-full px-4 py-3 rounded-xl bg-white/50 backdrop-blur-sm border border-gray-200 text-gray-800 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                      placeholder="País"
                    />
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="glass-icon-container rounded-2xl p-8">
                <h2 className="text-xl font-medium mb-6 text-gray-900">Características</h2>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">Habitaciones</label>
                    <div className="relative">
                      <Bed className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="number"
                        min="0"
                        value={property.features.bedrooms}
                        onChange={(e) => setProperty({
                          ...property,
                          features: { ...property.features, bedrooms: Number(e.target.value) }
                        })}
                        className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/50 backdrop-blur-sm border border-gray-200 text-gray-800 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">Baños</label>
                    <div className="relative">
                      <Bath className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="number"
                        min="0"
                        value={property.features.bathrooms}
                        onChange={(e) => setProperty({
                          ...property,
                          features: { ...property.features, bathrooms: Number(e.target.value) }
                        })}
                        className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/50 backdrop-blur-sm border border-gray-200 text-gray-800 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">Metros²</label>
                    <div className="relative">
                      <Square className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="number"
                        min="0"
                        value={property.features.squareMeters}
                        onChange={(e) => setProperty({
                          ...property,
                          features: { ...property.features, squareMeters: Number(e.target.value) }
                        })}
                        className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/50 backdrop-blur-sm border border-gray-200 text-gray-800 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">Parking</label>
                    <div className="relative">
                      <Car className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="number"
                        min="0"
                        value={property.features.parking}
                        onChange={(e) => setProperty({
                          ...property,
                          features: { ...property.features, parking: Number(e.target.value) }
                        })}
                        className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/50 backdrop-blur-sm border border-gray-200 text-gray-800 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Images */}
              <div className="glass-icon-container rounded-2xl p-8">
                <h2 className="text-xl font-medium mb-6 text-gray-900">Imágenes</h2>
                
                <div className="space-y-6">
                  {/* Upload */}
                  <div>
                    <label className="block text-sm font-medium mb-3 text-gray-700">Subir nuevas imágenes</label>
                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-primary/50 transition-colors">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                        disabled={uploadingImages}
                      />
                      <label
                        htmlFor="image-upload"
                        className="cursor-pointer flex flex-col items-center gap-3"
                      >
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                          <Upload className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {uploadingImages ? 'Subiendo...' : 'Haz clic para subir imágenes'}
                          </div>
                          <div className="text-sm text-gray-500">PNG, JPG hasta 10MB</div>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Current Images */}
                  {property.images.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium mb-3 text-gray-700">Imágenes actuales</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {property.images.map((image, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={image}
                              alt={`Property ${index + 1}`}
                              className="w-full h-32 object-cover rounded-xl"
                            />
                            <button
                              onClick={() => removeImage(index)}
                              className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-4 pt-8">
                <button
                  onClick={() => router.push('/dashboard/properties')}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="btn-primary flex items-center gap-2"
                >
                  <Save size={20} />
                  {isSaving ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </div>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  )
}