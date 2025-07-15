'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { gsap } from 'gsap'
import { z } from 'zod'
import { ArrowLeft, ArrowRight, Home, MapPin, Euro, Camera, FileText, CheckCircle } from 'lucide-react'
import Navigation from '@/components/Navigation'
import ImageUpload from '@/components/ImageUpload'
import { PropertyTypeEnum } from '@/lib/domain/value-objects/PropertyType'

const steps = [
  { id: 1, title: 'Información Básica', icon: Home },
  { id: 2, title: 'Ubicación', icon: MapPin },
  { id: 3, title: 'Precio y Características', icon: Euro },
  { id: 4, title: 'Fotos', icon: Camera },
  { id: 5, title: 'Descripción', icon: FileText },
  { id: 6, title: 'Revisión', icon: CheckCircle }
]

const propertyTypes = [
  { value: PropertyTypeEnum.VILLA, label: 'Villa', description: 'Casa independiente de lujo' },
  { value: PropertyTypeEnum.PENTHOUSE, label: 'Penthouse', description: 'Último piso con terraza' },
  { value: PropertyTypeEnum.APARTMENT, label: 'Apartamento', description: 'Vivienda en edificio' },
  { value: PropertyTypeEnum.HOUSE, label: 'Casa', description: 'Vivienda unifamiliar' },
  { value: PropertyTypeEnum.LOFT, label: 'Loft', description: 'Espacio abierto y moderno' },
  { value: PropertyTypeEnum.TOWNHOUSE, label: 'Casa Adosada', description: 'Casa conectada a otras' },
  { value: PropertyTypeEnum.STUDIO, label: 'Estudio', description: 'Espacio compacto' },
  { value: PropertyTypeEnum.DUPLEX, label: 'Dúplex', description: 'Vivienda de dos plantas' }
]

const amenities = [
  'Piscina', 'Jardín', 'Garaje', 'Terraza', 'Balcón', 'Aire acondicionado',
  'Calefacción', 'Chimenea', 'Ascensor', 'Trastero', 'Gimnasio', 'Portero',
  'Seguridad 24h', 'Zona comunitaria', 'Barbacoa', 'Spa', 'Sala de juegos'
]

export default function PublishProperty() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const formRef = useRef<HTMLFormElement>(null)
  const stepRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)

  const [formData, setFormData] = useState({
    title: '',
    propertyType: '',
    address: {
      street: '',
      city: '',
      state: '',
      country: 'España',
      postalCode: '',
      coordinates: { latitude: 0, longitude: 0 }
    },
    price: { amount: 0, currency: 'EUR' },
    features: {
      bedrooms: 1,
      bathrooms: 1,
      squareMeters: 50,
      lotSize: undefined as number | undefined,
      yearBuilt: undefined as number | undefined,
      parking: 0 as number,
      amenities: [] as string[]
    },
    images: [] as string[],
    description: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/sign-in')
    }
  }, [user, isLoaded, router])

  useEffect(() => {
    // Animate step change
    if (stepRef.current) {
      gsap.fromTo(stepRef.current,
        { x: 50, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.5, ease: "power3.out" }
      )
    }

    // Update progress bar
    if (progressRef.current) {
      const progress = (currentStep / steps.length) * 100
      gsap.to(progressRef.current, {
        width: `${progress}%`,
        duration: 0.5,
        ease: "power2.out"
      })
    }
  }, [currentStep])

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {}

    switch (step) {
      case 1:
        if (!formData.title.trim()) newErrors.title = 'El título es obligatorio'
        if (!formData.propertyType) newErrors.propertyType = 'Selecciona un tipo de propiedad'
        break
      case 2:
        if (!formData.address.street.trim()) newErrors.street = 'La dirección es obligatoria'
        if (!formData.address.city.trim()) newErrors.city = 'La ciudad es obligatoria'
        if (!formData.address.state.trim()) newErrors.state = 'La provincia es obligatoria'
        if (!formData.address.postalCode.trim()) newErrors.postalCode = 'El código postal es obligatorio'
        break
      case 3:
        if (formData.price.amount <= 0) newErrors.price = 'El precio debe ser mayor que 0'
        if (formData.features.squareMeters <= 0) newErrors.squareMeters = 'Los metros cuadrados son obligatorios'
        break
      case 4:
        if (formData.images.length === 0) newErrors.images = 'Sube al menos una imagen'
        break
      case 5:
        if (!formData.description.trim() || formData.description.length < 20) {
          newErrors.description = 'La descripción debe tener al menos 20 caracteres'
        }
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length))
    }
  }

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const handleSubmit = async () => {
    if (!validateStep(5)) return

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const result = await response.json()

      if (result.success) {
        setCurrentStep(6)
        // Animate success
        setTimeout(() => {
          router.push(`/properties/${result.data.id}`)
        }, 2000)
      } else {
        throw new Error(result.error || 'Error al crear la propiedad')
      }
    } catch (error) {
      console.error('Submit error:', error)
      alert('Error al publicar la propiedad. Inténtalo de nuevo.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleAmenity = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      features: {
        ...prev.features,
        amenities: prev.features.amenities.includes(amenity)
          ? prev.features.amenities.filter(a => a !== amenity)
          : [...prev.features.amenities, amenity]
      }
    }))
  }

  if (!isLoaded || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff385c]"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="pt-20">
        <div className="section-container py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Publica tu Propiedad
            </h1>
            <p className="text-lg text-gray-600">
              Completa los siguientes pasos para publicar tu propiedad
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              {steps.map((step) => (
                <div
                  key={step.id}
                  className={`flex flex-col items-center ${
                    step.id <= currentStep ? 'text-[#ff385c]' : 'text-gray-400'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full border-2 flex items-center justify-center mb-2 transition-colors duration-300 ${
                      step.id <= currentStep
                        ? 'border-[#ff385c] bg-[#ff385c] text-white'
                        : 'border-gray-300 bg-white'
                    }`}
                  >
                    <step.icon size={16} />
                  </div>
                  <span className="text-xs font-medium text-center hidden md:block">
                    {step.title}
                  </span>
                </div>
              ))}
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                ref={progressRef}
                className="bg-[#ff385c] h-2 rounded-full transition-all duration-500"
                style={{ width: `${(currentStep / steps.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Form Steps */}
          <div className="max-w-2xl mx-auto">
            <div ref={stepRef} className="bg-white rounded-xl shadow-lg p-8">
              {currentStep === 1 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Información Básica</h2>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Título de la propiedad *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff385c] ${
                        errors.title ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Ej. Villa moderna con vistas al mar"
                    />
                    {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo de propiedad *
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {propertyTypes.map((type) => (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, propertyType: type.value }))}
                          className={`p-4 border rounded-lg text-left transition-all duration-200 hover:border-[#ff385c] ${
                            formData.propertyType === type.value
                              ? 'border-[#ff385c] bg-red-50'
                              : 'border-gray-300'
                          }`}
                        >
                          <div className="font-medium text-gray-800">{type.label}</div>
                          <div className="text-sm text-gray-500">{type.description}</div>
                        </button>
                      ))}
                    </div>
                    {errors.propertyType && <p className="text-red-500 text-sm mt-1">{errors.propertyType}</p>}
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Ubicación</h2>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dirección *
                    </label>
                    <input
                      type="text"
                      value={formData.address.street}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        address: { ...prev.address, street: e.target.value }
                      }))}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff385c] ${
                        errors.street ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Calle, número, piso..."
                    />
                    {errors.street && <p className="text-red-500 text-sm mt-1">{errors.street}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ciudad *
                      </label>
                      <input
                        type="text"
                        value={formData.address.city}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          address: { ...prev.address, city: e.target.value }
                        }))}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff385c] ${
                          errors.city ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Madrid, Barcelona..."
                      />
                      {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Provincia *
                      </label>
                      <input
                        type="text"
                        value={formData.address.state}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          address: { ...prev.address, state: e.target.value }
                        }))}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff385c] ${
                          errors.state ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Madrid, Cataluña..."
                      />
                      {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Código Postal *
                      </label>
                      <input
                        type="text"
                        value={formData.address.postalCode}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          address: { ...prev.address, postalCode: e.target.value }
                        }))}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff385c] ${
                          errors.postalCode ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="28001, 08001..."
                      />
                      {errors.postalCode && <p className="text-red-500 text-sm mt-1">{errors.postalCode}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        País
                      </label>
                      <input
                        type="text"
                        value={formData.address.country}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          address: { ...prev.address, country: e.target.value }
                        }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff385c]"
                        placeholder="España"
                      />
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Precio y Características</h2>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Precio *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">€</span>
                      <input
                        type="number"
                        value={formData.price.amount || ''}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          price: { ...prev.price, amount: Number(e.target.value) }
                        }))}
                        className={`w-full pl-8 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff385c] ${
                          errors.price ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="750000"
                      />
                    </div>
                    {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Dormitorios
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.features.bedrooms}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          features: { ...prev.features, bedrooms: Number(e.target.value) }
                        }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff385c]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Baños
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.features.bathrooms}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          features: { ...prev.features, bathrooms: Number(e.target.value) }
                        }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff385c]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        M² *
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={formData.features.squareMeters}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          features: { ...prev.features, squareMeters: Number(e.target.value) }
                        }))}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff385c] ${
                          errors.squareMeters ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.squareMeters && <p className="text-red-500 text-sm mt-1">{errors.squareMeters}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Parking
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.features.parking || ''}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          features: { ...prev.features, parking: Number(e.target.value) || 0 }
                        }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff385c]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Características adicionales
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {amenities.map((amenity) => (
                        <button
                          key={amenity}
                          type="button"
                          onClick={() => toggleAmenity(amenity)}
                          className={`p-3 border rounded-lg text-sm transition-all duration-200 ${
                            formData.features.amenities.includes(amenity)
                              ? 'border-[#ff385c] bg-red-50 text-[#ff385c]'
                              : 'border-gray-300 hover:border-[#ff385c]'
                          }`}
                        >
                          {amenity}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Fotos de la Propiedad</h2>
                  
                  <ImageUpload
                    onImagesChange={(images) => setFormData(prev => ({ ...prev, images }))}
                    maxImages={10}
                    existingImages={formData.images}
                  />
                  
                  {errors.images && <p className="text-red-500 text-sm mt-1">{errors.images}</p>}
                </div>
              )}

              {currentStep === 5 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Descripción</h2>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Describe tu propiedad *
                    </label>
                    <textarea
                      rows={8}
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff385c] resize-none ${
                        errors.description ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Describe las características únicas de tu propiedad, ubicación, vistas, acabados, etc. Mínimo 20 caracteres."
                    />
                    <div className="flex justify-between items-center mt-2">
                      {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
                      <p className="text-sm text-gray-500 ml-auto">
                        {formData.description.length} caracteres
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 6 && (
                <div className="text-center space-y-6">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle size={40} className="text-green-500" />
                  </div>
                  
                  <h2 className="text-2xl font-bold text-gray-800">¡Propiedad Creada!</h2>
                  <p className="text-gray-600">
                    Tu propiedad ha sido creada exitosamente. Serás redirigido a la página de la propiedad.
                  </p>
                  
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ff385c] mx-auto"></div>
                </div>
              )}

              {/* Navigation Buttons */}
              {currentStep < 6 && (
                <div className="flex justify-between pt-8 border-t">
                  <button
                    type="button"
                    onClick={prevStep}
                    disabled={currentStep === 1}
                    className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:border-[#ff385c] transition-colors duration-200"
                  >
                    <ArrowLeft size={20} />
                    Anterior
                  </button>

                  {currentStep < 5 ? (
                    <button
                      type="button"
                      onClick={nextStep}
                      className="flex items-center gap-2 px-6 py-3 bg-[#ff385c] text-white rounded-lg hover:bg-[#e5315a] transition-colors duration-200"
                    >
                      Siguiente
                      <ArrowRight size={20} />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="flex items-center gap-2 px-6 py-3 bg-[#ff385c] text-white rounded-lg hover:bg-[#e5315a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Publicando...
                        </>
                      ) : (
                        <>
                          Publicar Propiedad
                          <CheckCircle size={20} />
                        </>
                      )}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}