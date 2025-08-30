
'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { gsap } from 'gsap'
import { motion } from 'framer-motion'
import ImageUpload from '@/components/ImageUpload'
import LocationAutocomplete from '@/components/LocationAutocomplete'
import { PropertyTypeEnum } from '@/lib/domain/value-objects/PropertyType'
import { useToast } from '@/components/Toast'
import { getSchemaByPropertyType } from '@/lib/validations/property-schemas'

const steps = [
  { id: 1, title: 'Información' },
  { id: 2, title: 'Ubicación' },
  { id: 3, title: 'Detalles' },
  { id: 4, title: 'Fotos' },
  { id: 5, title: 'Descripción' },
  { id: 6, title: 'Revisión' }
]

const propertyTypes = [
  { value: PropertyTypeEnum.VILLA, label: 'Villa' },
  { value: PropertyTypeEnum.PENTHOUSE, label: 'Penthouse' },
  { value: PropertyTypeEnum.APARTMENT, label: 'Departamento' },
  { value: PropertyTypeEnum.HOUSE, label: 'Casa' },
  { value: PropertyTypeEnum.LOFT, label: 'Loft' },
  { value: PropertyTypeEnum.TOWNHOUSE, label: 'Townhouse' },
  { value: PropertyTypeEnum.STUDIO, label: 'Estudio' },
  { value: PropertyTypeEnum.DUPLEX, label: 'Dúplex' }
]

const amenities = [
  'Alberca', 'Jardín', 'Estacionamiento', 'Terraza', 'Balcón', 'Aire acondicionado',
  'Calefacción', 'Chimenea', 'Elevador', 'Bodega', 'Gimnasio', 'Portero',
  'Seguridad 24h', 'Áreas comunes', 'Asador', 'Spa', 'Sala de juegos'
]

export default function PublishProperty() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const { showToast } = useToast()
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
      country: 'México',
      postalCode: '',
      coordinates: { latitude: 0, longitude: 0 },
      displayPrivacy: false
    },
    price: { amount: 0, currency: 'USD' },
    features: {
      bedrooms: 1,
      bathrooms: 1,
      squareMeters: 50,
      lotSize: undefined as number | undefined,
      yearBuilt: undefined as number | undefined,
      parking: undefined as number | undefined,
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
    if (stepRef.current) {
      gsap.fromTo(stepRef.current,
        { x: 50, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.5, ease: "power3.out" }
      )
    }

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

    if (step === 1) {
      const schema = getSchemaByPropertyType(formData.propertyType)
      const titleValidation = schema.extract('title').validate(formData.title)
      if (titleValidation.error) {
        newErrors.title = titleValidation.error.details[0].message
      }
      
      if (!formData.propertyType) {
        newErrors.propertyType = 'Selecciona un tipo de propiedad'
      }
    }

    if (step === 2) {
      const schema = getSchemaByPropertyType(formData.propertyType)
      const addressValidation = schema.extract('address').validate(formData.address)
      if (addressValidation.error) {
        const errorDetail = addressValidation.error.details[0]
        const fieldName = errorDetail.path[0]
        newErrors[fieldName] = errorDetail.message
      }
    }

    if (step === 3) {
      const schema = getSchemaByPropertyType(formData.propertyType)
      
      const priceValidation = schema.extract('price').validate(formData.price)
      if (priceValidation.error) {
        newErrors.price = priceValidation.error.details[0].message
      }
      
      const featuresValidation = schema.extract('features').validate(formData.features)
      if (featuresValidation.error) {
        const errorDetail = featuresValidation.error.details[0]
        const fieldName = errorDetail.path[0]
        newErrors[fieldName] = errorDetail.message
      }
    }

    if (step === 4) {
      const schema = getSchemaByPropertyType(formData.propertyType)
      const imagesValidation = schema.extract('images').validate(formData.images)
      if (imagesValidation.error) {
        newErrors.images = imagesValidation.error.details[0].message
      }
    }

    if (step === 5) {
      const schema = getSchemaByPropertyType(formData.propertyType)
      const descriptionValidation = schema.extract('description').validate(formData.description)
      if (descriptionValidation.error) {
        newErrors.description = descriptionValidation.error.details[0].message
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const nextStep = () => {
    const isValid = validateStep(currentStep)
    
    if (!isValid) {
      const errorMessages = Object.values(errors)
      const firstError = errorMessages[0]
      showToast(firstError, 'error')
      return
    }
    
    setCurrentStep(prev => Math.min(prev + 1, steps.length))
  }

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const handleSubmit = async () => {
    const schema = getSchemaByPropertyType(formData.propertyType)
    const validation = schema.validate(formData)
    
    if (validation.error) {
      const errorDetail = validation.error.details[0]
      const errorMessage = errorDetail.message
      showToast(errorMessage, 'error')
      return
    }

    setIsSubmitting(true)
    showToast('Publicando propiedad...', 'info')

    try {
      const response = await fetch('/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const result = await response.json()

      if (!response.ok) {
        if (response.status === 400 && result.details) {
          const firstError = result.details[0]
          const errorMessage = `Error en ${firstError.path.join('.')}: ${firstError.message}`
          showToast(errorMessage, 'error')
        } else if (response.status === 401) {
          showToast('No tienes permisos para publicar propiedades', 'error')
        } else if (response.status === 500) {
          showToast('Error del servidor. Por favor intenta más tarde', 'error')
        } else {
          showToast(result.error || 'Error al publicar la propiedad', 'error')
        }
        setIsSubmitting(false)
        return
      }

      setCurrentStep(6)
      showToast('¡Propiedad publicada exitosamente!', 'success')
      setTimeout(() => {
        router.push(`/properties/${result.data.id}`)
      }, 2000)
    } catch (error) {
      console.error('Submit error:', error)
      showToast('Error de conexión. Verifica tu internet e intenta de nuevo', 'error')
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
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  return (
    <main className="pb-16">
      <div className="max-w-4xl mx-auto px-6">
          
          {/* Header */}
          <div className="text-center mb-12">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-6xl font-light mb-4 text-gray-900"
            >
              Publicar <span className="text-primary font-medium">Propiedad</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-gray-600"
            >
              Completa la información de tu propiedad
            </motion.p>
          </div>

          {/* Progress */}
          <div className="mb-12">
            <div className="flex justify-between items-center mb-6">
              {steps.map((step) => (
                <div
                  key={step.id}
                  className={`flex flex-col items-center ${
                    step.id <= currentStep ? 'opacity-100' : 'opacity-40'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 transition-all duration-300 ${
                      step.id <= currentStep
                        ? 'bg-primary text-white'
                        : 'border border-gray-300 text-gray-400'
                    }`}
                  >
                    <div className="w-1 h-1 rounded-full bg-current"></div>
                  </div>
                  <span className="text-xs font-medium text-gray-700">
                    {step.title}
                  </span>
                </div>
              ))}
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-1">
              <div
                ref={progressRef}
                className="bg-primary h-1 rounded-full transition-all duration-500"
                style={{ width: `${(currentStep / steps.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Form */}
          <div className="max-w-2xl mx-auto">
            <motion.div 
              ref={stepRef} 
              className="glass-icon-container rounded-2xl p-8 shadow-lg"
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              
              {currentStep === 1 && (
                <div className="space-y-8">
                  <div>
                    <label className="block text-sm font-medium mb-3 text-gray-700">
                      Título
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl bg-white/50 backdrop-blur-sm border border-gray-200 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                      placeholder="Casa moderna en zona residencial"
                    />
                    {errors.title && <p className="text-red-400 text-sm mt-2">{errors.title}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-3 text-gray-700">
                      Tipo de propiedad
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {propertyTypes.map((type) => (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, propertyType: type.value }))}
                          className={`p-4 rounded-xl text-center transition-all duration-300 ${
                            formData.propertyType === type.value
                              ? 'bg-primary text-white shadow-lg shadow-primary/20'
                              : 'bg-white/50 backdrop-blur-sm border border-gray-200 text-gray-700 hover:bg-white hover:shadow-md'
                          }`}
                        >
                          <div className="text-sm font-medium">{type.label}</div>
                        </button>
                      ))}
                    </div>
                    {errors.propertyType && <p className="text-red-400 text-sm mt-2">{errors.propertyType}</p>}
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-8">
                  <div>
                    <label className="block text-sm font-medium mb-3 text-gray-700">
                      Dirección
                    </label>
                    <LocationAutocomplete
                      onLocationSelect={(location) => {
                        setFormData(prev => ({
                          ...prev,
                          address: {
                            ...prev.address,
                            ...location
                          }
                        }))
                      }}
                      placeholder="Buscar dirección..."
                    />
                    {errors.street && <p className="text-red-400 text-sm mt-2">{errors.street}</p>}
                  </div>

                  {formData.address.street && (
                    <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                      <div className="text-sm font-medium mb-2 text-gray-700">
                        Dirección seleccionada
                      </div>
                      <div className="text-sm text-gray-600">
                        {formData.address.street}, {formData.address.city}, {formData.address.state}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.address.displayPrivacy}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          address: {
                            ...prev.address,
                            displayPrivacy: e.target.checked
                          }
                        }))}
                        className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-gray-700">
                        Mantener ubicación privada
                      </span>
                    </label>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-8">
                  <div>
                    <label className="block text-sm font-medium mb-3 text-gray-700">
                      Precio
                    </label>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({
                          ...prev,
                          price: { ...prev.price, currency: 'USD' }
                        }))}
                        className={`p-3 rounded-xl text-center transition-all duration-300 ${
                          formData.price.currency === 'USD'
                            ? 'bg-primary text-white shadow-lg shadow-primary/20'
                            : 'bg-white/50 backdrop-blur-sm border border-gray-200 text-gray-700 hover:bg-white hover:shadow-md'
                        }`}
                      >
                        USD
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({
                          ...prev,
                          price: { ...prev.price, currency: 'MXN' }
                        }))}
                        className={`p-3 rounded-xl text-center transition-all duration-300 ${
                          formData.price.currency === 'MXN'
                            ? 'bg-primary text-white shadow-lg shadow-primary/20'
                            : 'bg-white/50 backdrop-blur-sm border border-gray-200 text-gray-700 hover:bg-white hover:shadow-md'
                        }`}
                      >
                        MXN
                      </button>
                    </div>
                    
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                        {formData.price.currency === 'USD' ? '$' : 'MX$'}
                      </span>
                      <input
                        type="number"
                        value={formData.price.amount || ''}
                        onChange={(e) => {
                          const value = e.target.value
                          // Limitar a 8 dígitos
                          if (value.length <= 8) {
                            setFormData(prev => ({
                              ...prev,
                              price: { ...prev.price, amount: Number(value) }
                            }))
                          }
                        }}
                        max="99999999"
                        className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/50 backdrop-blur-sm border border-gray-200 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                        placeholder="0"
                      />
                    </div>
                    {errors.price && <p className="text-red-400 text-sm mt-2">{errors.price}</p>}
                    <p className="text-xs text-gray-500 mt-1">Máximo 8 dígitos (hasta 99,999,999)</p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700">
                        Habitaciones
                      </label>
                      <input
                        type="text"
                        value={formData.features.bedrooms}
                        onChange={(e) => {
                          const value = e.target.value
                          if (/^\d*$/.test(value)) {
                            setFormData(prev => ({
                              ...prev,
                              features: { ...prev.features, bedrooms: value === '' ? 0 : Number(value) }
                            }))
                          }
                        }}
                        className="w-full px-4 py-3 rounded-xl bg-white/50 backdrop-blur-sm border border-gray-200 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                        placeholder="Ej: 3"
                      />
                      {errors.bedrooms && <p className="text-red-400 text-sm mt-2">{errors.bedrooms}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700">
                        Baños
                      </label>
                      <input
                        type="text"
                        value={formData.features.bathrooms}
                        onChange={(e) => {
                          const value = e.target.value
                          if (/^\d*$/.test(value)) {
                            setFormData(prev => ({
                              ...prev,
                              features: { ...prev.features, bathrooms: value === '' ? 0 : Number(value) }
                            }))
                          }
                        }}
                        className="w-full px-4 py-3 rounded-xl bg-white/50 backdrop-blur-sm border border-gray-200 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                        placeholder="Ej: 2"
                      />
                      {errors.bathrooms && <p className="text-red-400 text-sm mt-2">{errors.bathrooms}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700">
                        M²
                      </label>
                      <input
                        type="text"
                        value={formData.features.squareMeters}
                        onChange={(e) => {
                          const value = e.target.value
                          if (/^\d*$/.test(value)) {
                            setFormData(prev => ({
                              ...prev,
                              features: { ...prev.features, squareMeters: value === '' ? 0 : Number(value) }
                            }))
                          }
                        }}
                        className="w-full px-4 py-3 rounded-xl bg-white/50 backdrop-blur-sm border border-gray-200 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                        placeholder="Ej: 120"
                      />
                      {errors.squareMeters && <p className="text-red-400 text-sm mt-2">{errors.squareMeters}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700">
                        Parking
                      </label>
                      <select
                        value={formData.features.parking === undefined ? 'na' : formData.features.parking}
                        onChange={(e) => {
                          const value = e.target.value === 'na' ? undefined : Number(e.target.value)
                          setFormData(prev => ({
                            ...prev,
                            features: { ...prev.features, parking: value }
                          }))
                        }}
                        className="w-full px-4 py-3 rounded-xl bg-white/50 backdrop-blur-sm border border-gray-200 text-gray-800 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                      >
                        <option value="na">N/A</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                      </select>
                      {errors.parking && <p className="text-red-400 text-sm mt-2">{errors.parking}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-3 text-gray-700">
                      Características
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {amenities.map((amenity) => (
                        <button
                          key={amenity}
                          type="button"
                          onClick={() => toggleAmenity(amenity)}
                          className={`p-3 rounded-xl text-sm transition-all duration-300 ${
                            formData.features.amenities.includes(amenity)
                              ? 'bg-primary text-white shadow-lg shadow-primary/20'
                              : 'bg-white/50 backdrop-blur-sm border border-gray-200 text-gray-700 hover:bg-white hover:shadow-md'
                          }`}
                        >
                          {amenity}
                        </button>
                      ))}
                    </div>
                    {errors.amenities && <p className="text-red-400 text-sm mt-2">{errors.amenities}</p>}
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-8">
                  <div>
                    <label className="block text-sm font-medium mb-3 text-gray-700">
                      Fotos
                    </label>
                    <ImageUpload
                      onImagesChange={(images) => setFormData(prev => ({ ...prev, images }))}
                      maxImages={10}
                      existingImages={formData.images}
                    />
                    {errors.images && <p className="text-red-400 text-sm mt-2">{errors.images}</p>}
                  </div>
                </div>
              )}

              {currentStep === 5 && (
                <div className="space-y-8">
                  <div>
                    <label className="block text-sm font-medium mb-3 text-gray-700">
                      Descripción
                    </label>
                    <textarea
                      rows={6}
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl bg-white/50 backdrop-blur-sm border border-gray-200 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 resize-none"
                      placeholder="Describe tu propiedad..."
                    />
                    <div className="flex justify-between items-center mt-2">
                      {errors.description && <p className="text-red-400 text-sm">{errors.description}</p>}
                      <p className="text-sm ml-auto text-gray-500">
                        {formData.description.length} caracteres
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 6 && (
                <div className="text-center space-y-6">
                  <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto">
                    <div className="w-3 h-3 rounded-full bg-white"></div>
                  </div>
                  
                  <h2 className="text-2xl font-light text-gray-900">
                    Propiedad Publicada
                  </h2>
                  <p className="text-gray-600">
                    Redirigiendo a tu propiedad...
                  </p>
                  
                  <div className="loading-spinner mx-auto"></div>
                </div>
              )}

              {/* Navigation */}
              {currentStep < 6 && (
                <div className="flex justify-between pt-8 mt-8 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={prevStep}
                    disabled={currentStep === 1}
                    className="px-6 py-3 rounded-xl bg-white/50 backdrop-blur-sm border border-gray-200 text-gray-700 hover:bg-white hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Anterior
                  </button>

                  {currentStep < 5 ? (
                    <button
                      type="button"
                      onClick={nextStep}
                      className="px-6 py-3 rounded-xl bg-primary text-white font-medium hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all duration-200"
                    >
                      Siguiente
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="px-6 py-3 rounded-xl bg-primary text-white font-medium hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin inline-block mr-2" />
                          Publicando...
                        </>
                      ) : (
                        'Publicar'
                      )}
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        </div>
    </main>
  )
}