'use client'

import { useState, useEffect, Suspense } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
// GSAP removed - using Framer Motion for animations
import { DotLottieReact } from '@lottiefiles/dotlottie-react'
import { 
  ArrowLeft, 
  CreditCard, 
  Lock, 
  CheckCircle2,
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  Building2
} from 'lucide-react'
import dynamic from 'next/dynamic'
import { getStripePublishableKey } from '@/lib/utils/stripe-client'
import { useToast } from '@/components/Toast'
import logger from '@/lib/utils/logger'

// Service definitions (same as services page)
const services = {
  photography: {
    id: 'photography',
    title: 'Fotografía Profesional',
    description: 'Sesión fotográfica profesional para tu propiedad con equipo de alta calidad',
    price: 2499,
    currency: 'MXN',
    duration: '48 horas',
    features: ['20-30 fotos profesionales editadas', 'Fotografía con dron incluida', 'Edición profesional HDR']
  },
  legal: {
    id: 'legal',
    title: 'Asesoría Legal',
    description: 'Revisión completa de contratos y documentación legal por abogados especializados',
    price: 4999,
    currency: 'MXN',
    duration: '72 horas',
    features: ['Revisión de contratos de compraventa', 'Verificación de documentos', 'Consultas ilimitadas por 30 días']
  },
  'virtual-tour': {
    id: 'virtual-tour',
    title: 'Tour Virtual 360°',
    description: 'Recorrido virtual interactivo de alta calidad para tus propiedades',
    price: 3499,
    currency: 'MXN',
    duration: '72 horas',
    features: ['Tour virtual 360° completo', 'Compatible con VR', 'Hosting por 1 año incluido']
  },
  'home-staging': {
    id: 'home-staging',
    title: 'Home Staging',
    description: 'Diseño y decoración profesional para maximizar el atractivo de tu propiedad',
    price: 8999,
    currency: 'MXN',
    duration: '5-7 días',
    features: ['Consultoría de diseño interior', 'Plan de staging personalizado', 'Mobiliario y decoración']
  },
  'market-analysis': {
    id: 'market-analysis',
    title: 'Análisis de Mercado',
    description: 'Estudio detallado del mercado inmobiliario para optimizar tu estrategia',
    price: 2999,
    currency: 'MXN',
    duration: '48 horas',
    features: ['Análisis comparativo de mercado', 'Valuación profesional', 'Reporte detallado de 20+ páginas']
  },
  documentation: {
    id: 'documentation',
    title: 'Gestión Documental',
    description: 'Organización y digitalización completa de documentación inmobiliaria',
    price: 1999,
    currency: 'MXN',
    duration: '24 horas',
    features: ['Digitalización de documentos', 'Organización en nube segura', 'Verificación de autenticidad']
  }
}

interface ServiceRequest {
  propertyAddress: string
  contactPhone: string
  preferredDate: string
  specialRequests: string
}

// Dynamic Stripe components
const StripeCheckout = dynamic(() => import('../StripeCheckout'), {
  loading: () => <div className="flex items-center justify-center h-96">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff385c]"></div>
  </div>,
  ssr: false
})

function ServiceCheckoutContent() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { showToast } = useToast()
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [showCheckout, setShowCheckout] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [serviceRequest, setServiceRequest] = useState<ServiceRequest>({
    propertyAddress: '',
    contactPhone: '',
    preferredDate: '',
    specialRequests: ''
  })

  const serviceId = searchParams.get('service')
  const selectedService = serviceId ? services[serviceId as keyof typeof services] : null

  useEffect(() => {
    if (isLoaded && user) {
      setServiceRequest(prev => ({
        ...prev,
        contactPhone: user.phoneNumbers?.[0]?.phoneNumber || ''
      }))
    }
  }, [isLoaded, user])

  const handleInputChange = (field: keyof ServiceRequest, value: string) => {
    setServiceRequest(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user || !selectedService) {
      return
    }

    // Validate required fields
    if (!serviceRequest.propertyAddress || !serviceRequest.contactPhone || !serviceRequest.preferredDate) {
      showToast('Por favor completa todos los campos requeridos', 'warning')
      return
    }

    setIsLoading(true)

    try {
      const tax = Math.round(selectedService.price * 0.16)
      const total = selectedService.price + tax

      logger.info('ServiceCheckout', 'Creating checkout session', {
        serviceId: selectedService.id,
        serviceName: selectedService.title,
        price: total,
        userId: user.id,
        userEmail: user.emailAddresses?.[0]?.emailAddress
      })

      // Create Stripe checkout session for service payment
      const response = await fetch('/api/payments/create-service-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serviceId: selectedService.id,
          serviceName: selectedService.title,
          price: total, // total includes tax
          currency: selectedService.currency,
          userEmail: user.emailAddresses?.[0]?.emailAddress || '',
          ...serviceRequest
        }),
      })

      const data = await response.json()

      if (data.success && data.clientSecret) {
        // Set client secret to show embedded checkout
        setClientSecret(data.clientSecret)
        setShowCheckout(true)
        logger.info('ServiceCheckout', 'Checkout session created successfully', {
          clientSecret: data.clientSecret.substring(0, 20) + '...'
        })
        showToast('Redirigiendo al procesador de pagos...', 'info')
      } else {
        throw new Error(data.error || 'Failed to create checkout session')
      }

    } catch (error) {
      logger.error('ServiceCheckout', 'Service request error', error)
      showToast('Error al procesar la solicitud. Por favor intenta de nuevo.', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isLoaded) {
    return <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-gray-50">
      <div className="loading-spinner"></div>
    </div>
  }

  if (!user) {
    router.push('/sign-in')
    return null
  }

  if (!selectedService) {
    router.push('/services')
    return null
  }

  const tax = Math.round(selectedService.price * 0.16)
  const total = selectedService.price + tax

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      
      <main>
        <div className="section-container py-16">
          
          {/* Header */}
          <div className="mb-12">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 mb-6 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft size={20} />
              Volver a servicios
            </button>
            
            <div className="text-center">
              <h1 className="text-3xl font-light mb-4 text-gray-900">
                Solicitar Servicio Profesional
              </h1>
              <p className="max-w-2xl mx-auto text-gray-600">
                Completa la información para coordinar tu servicio de {selectedService.title}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            
            {/* Service Request Form or Stripe Checkout */}
            <div className="lg:col-span-2">
              <div className="glass-icon-container p-8 rounded-2xl">
                
                {!showCheckout ? (
                  <>
                    <h2 className="text-2xl font-semibold mb-6 text-gray-900">
                      Información del Servicio
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-6">
                      
                      {/* Property Information */}
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700">
                          Dirección de la Propiedad *
                        </label>
                        <input
                          type="text"
                          value={serviceRequest.propertyAddress}
                          onChange={(e) => handleInputChange('propertyAddress', e.target.value)}
                          placeholder="Calle 123, Colonia Centro, Ciudad de México"
                          className="input"
                          required
                        />
                      </div>

                      {/* Contact Information */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2 text-gray-700">
                            Email de contacto
                          </label>
                          <input
                            type="email"
                            value={user.emailAddresses?.[0]?.emailAddress || ''}
                            disabled
                            className="input opacity-60"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2 text-gray-700">
                            Teléfono de contacto *
                          </label>
                          <input
                            type="tel"
                            value={serviceRequest.contactPhone}
                            onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                            placeholder="+52 55 1234 5678"
                            className="input"
                            required
                          />
                        </div>
                      </div>

                      {/* Preferred Date */}
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700">
                          Fecha Preferida *
                        </label>
                        <input
                          type="date"
                          value={serviceRequest.preferredDate}
                          onChange={(e) => handleInputChange('preferredDate', e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                          className="input"
                          required
                        />
                      </div>

                      {/* Special Requests */}
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700">
                          Solicitudes Especiales
                        </label>
                        <textarea
                          value={serviceRequest.specialRequests}
                          onChange={(e) => handleInputChange('specialRequests', e.target.value)}
                          placeholder="Describe cualquier requerimiento específico para tu servicio..."
                          rows={4}
                          className="input resize-none"
                        />
                      </div>

                      {/* Submit Button */}
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="btn-primary w-full flex items-center justify-center gap-2"
                      >
                        {isLoading ? (
                          <>
                            <div className="loading-spinner"></div>
                            Procesando...
                          </>
                        ) : (
                          <>
                            <div className="w-1 h-1 rounded-full bg-current opacity-60"></div>
                            Proceder al Pago - ${total.toLocaleString()} MXN
                          </>
                        )}
                      </button>
                    </form>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-3 mb-8">
                      <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                      <h2 className="text-2xl font-semibold text-gray-900">Información de Pago</h2>
                    </div>

                    {isLoading ? (
                      <div className="flex items-center justify-center h-96">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff385c]"></div>
                      </div>
                    ) : clientSecret ? (
                      <StripeCheckout clientSecret={clientSecret} />
                    ) : (
                      <div className="text-center py-12">
                        <p className="text-gray-600">Error al cargar el formulario de pago</p>
                        <button
                          onClick={() => setShowCheckout(false)}
                          className="mt-4 text-gray-600 hover:text-gray-900 hover:underline transition-colors"
                        >
                          Volver al formulario
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Service Summary */}
            <div>
              <div className="glass-icon-container p-6 rounded-2xl sticky top-24">
                <h3 className="text-xl font-semibold mb-6 text-gray-900">
                  Resumen del Servicio
                </h3>
                
                <div className="space-y-4 mb-6">
                  <div className="card p-4">
                    <h4 className="font-semibold mb-2 text-gray-900">
                      {selectedService.title}
                    </h4>
                    <p className="text-sm mb-3 text-gray-600">
                      {selectedService.description}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      Entrega: {selectedService.duration}
                    </div>
                  </div>
                </div>

                <div className="space-y-3 pb-4 border-b border-gray-200">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Precio del servicio</span>
                    <span className="font-medium text-gray-900">${selectedService.price.toLocaleString()} MXN</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">IVA (16%)</span>
                    <span className="font-medium text-gray-900">${tax.toLocaleString()} MXN</span>
                  </div>
                </div>

                <div className="pt-4 mb-6">
                  <div className="flex justify-between text-lg font-semibold">
                    <span className="text-gray-900">Total</span>
                    <span className="text-gray-900">${total.toLocaleString()} MXN</span>
                  </div>
                </div>

                <div className="card p-4">
                  <div className="flex items-center gap-2 text-sm font-medium mb-2 text-gray-900">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    Proceso Seguro
                  </div>
                  <ul className="text-xs space-y-1 text-gray-600">
                    <li>• Profesionales certificados</li>
                    <li>• Garantía de calidad</li>
                    <li>• Soporte 24/7</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function ServiceCheckout() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-gray-50">
        <div className="loading-spinner"></div>
      </div>
    }>
      <ServiceCheckoutContent />
    </Suspense>
  )
}