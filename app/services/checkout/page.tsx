'use client'

import { useState, useEffect, Suspense } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { gsap } from 'gsap'
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
import { loadStripe } from '@stripe/stripe-js'
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js'
import Navigation from '@/components/Navigation'
import { getStripePublishableKey } from '@/lib/utils/stripe-client'
import { useToast } from '@/components/Toast'

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

// Initialize Stripe
const stripePromise = loadStripe(getStripePublishableKey())

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
        showToast('Redirigiendo al procesador de pagos...', 'info')
      } else {
        throw new Error(data.error || 'Failed to create checkout session')
      }

    } catch (error) {
      console.error('Service request error:', error)
      showToast('Error al procesar la solicitud. Por favor intenta de nuevo.', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isLoaded) {
    return <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0a0a' }}>
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
    <div className="min-h-screen" style={{ background: '#0a0a0a' }}>
      <Navigation />
      
      <main className="pt-20">
        <div className="section-container py-16">
          
          {/* Header */}
          <div className="mb-12">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 mb-6 transition-colors"
              style={{ color: '#666666' }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#ffffff'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#666666'}
            >
              <ArrowLeft size={20} />
              Volver a servicios
            </button>
            
            <div className="text-center">
              <h1 className="text-3xl font-light mb-4" style={{ color: '#ffffff' }}>
                Solicitar Servicio Profesional
              </h1>
              <p className="max-w-2xl mx-auto" style={{ color: '#a3a3a3' }}>
                Completa la información para coordinar tu servicio de {selectedService.title}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            
            {/* Service Request Form or Stripe Checkout */}
            <div className="lg:col-span-2">
              <div className="glass-card p-8">
                
                {!showCheckout ? (
                  <>
                    <h2 className="text-2xl font-light mb-6" style={{ color: '#ffffff' }}>
                      Información del Servicio
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-6">
                      
                      {/* Property Information */}
                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: '#ffffff' }}>
                          Dirección de la Propiedad *
                        </label>
                        <input
                          type="text"
                          value={serviceRequest.propertyAddress}
                          onChange={(e) => handleInputChange('propertyAddress', e.target.value)}
                          placeholder="Calle 123, Colonia Centro, Ciudad de México"
                          className="w-full px-4 py-3 rounded-lg focus:outline-none transition-colors"
                          style={{ 
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            color: '#ffffff'
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = '#ffffff'
                            e.target.style.background = 'rgba(255, 255, 255, 0.1)'
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                            e.target.style.background = 'rgba(255, 255, 255, 0.05)'
                          }}
                          required
                        />
                      </div>

                      {/* Contact Information */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2" style={{ color: '#ffffff' }}>
                            Email de contacto
                          </label>
                          <input
                            type="email"
                            value={user.emailAddresses?.[0]?.emailAddress || ''}
                            disabled
                            className="w-full px-4 py-3 rounded-lg opacity-60"
                            style={{ 
                              background: 'rgba(255, 255, 255, 0.05)',
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                              color: '#ffffff'
                            }}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2" style={{ color: '#ffffff' }}>
                            Teléfono de contacto *
                          </label>
                          <input
                            type="tel"
                            value={serviceRequest.contactPhone}
                            onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                            placeholder="+52 55 1234 5678"
                            className="w-full px-4 py-3 rounded-lg focus:outline-none transition-colors"
                            style={{ 
                              background: 'rgba(255, 255, 255, 0.05)',
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                              color: '#ffffff'
                            }}
                            onFocus={(e) => {
                              e.target.style.borderColor = '#ffffff'
                              e.target.style.background = 'rgba(255, 255, 255, 0.1)'
                            }}
                            onBlur={(e) => {
                              e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                              e.target.style.background = 'rgba(255, 255, 255, 0.05)'
                            }}
                            required
                          />
                        </div>
                      </div>

                      {/* Preferred Date */}
                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: '#ffffff' }}>
                          Fecha Preferida *
                        </label>
                        <input
                          type="date"
                          value={serviceRequest.preferredDate}
                          onChange={(e) => handleInputChange('preferredDate', e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full px-4 py-3 rounded-lg focus:outline-none transition-colors"
                          style={{ 
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            color: '#ffffff'
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = '#ffffff'
                            e.target.style.background = 'rgba(255, 255, 255, 0.1)'
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                            e.target.style.background = 'rgba(255, 255, 255, 0.05)'
                          }}
                          required
                        />
                      </div>

                      {/* Special Requests */}
                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: '#ffffff' }}>
                          Solicitudes Especiales
                        </label>
                        <textarea
                          value={serviceRequest.specialRequests}
                          onChange={(e) => handleInputChange('specialRequests', e.target.value)}
                          placeholder="Describe cualquier requerimiento específico para tu servicio..."
                          rows={4}
                          className="w-full px-4 py-3 rounded-lg focus:outline-none transition-colors resize-none"
                          style={{ 
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            color: '#ffffff'
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = '#ffffff'
                            e.target.style.background = 'rgba(255, 255, 255, 0.1)'
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                            e.target.style.background = 'rgba(255, 255, 255, 0.05)'
                          }}
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
                      <div className="w-1 h-1 rounded-full bg-white opacity-60"></div>
                      <h2 className="text-2xl font-light" style={{ color: '#ffffff' }}>Información de Pago</h2>
                    </div>

                    {isLoading ? (
                      <div className="flex items-center justify-center h-96">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff385c]"></div>
                      </div>
                    ) : clientSecret ? (
                      <EmbeddedCheckoutProvider
                        stripe={stripePromise}
                        options={{ clientSecret }}
                      >
                        <EmbeddedCheckout />
                      </EmbeddedCheckoutProvider>
                    ) : (
                      <div className="text-center py-12">
                        <p style={{ color: '#a3a3a3' }}>Error al cargar el formulario de pago</p>
                        <button
                          onClick={() => setShowCheckout(false)}
                          className="mt-4 transition-colors"
                          style={{ color: '#666666' }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = '#ffffff'
                            e.currentTarget.style.textDecoration = 'underline'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = '#666666'
                            e.currentTarget.style.textDecoration = 'none'
                          }}
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
              <div className="glass-card p-6 sticky top-24">
                <h3 className="text-xl font-light mb-6" style={{ color: '#ffffff' }}>
                  Resumen del Servicio
                </h3>
                
                <div className="space-y-4 mb-6">
                  <div className="rounded-lg p-4" style={{ 
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}>
                    <h4 className="font-light mb-2" style={{ color: '#ffffff' }}>
                      {selectedService.title}
                    </h4>
                    <p className="text-sm mb-3" style={{ color: '#a3a3a3' }}>
                      {selectedService.description}
                    </p>
                    <div className="flex items-center gap-2 text-sm" style={{ color: '#666666' }}>
                      <div className="w-1 h-1 rounded-full bg-current opacity-60"></div>
                      Entrega: {selectedService.duration}
                    </div>
                  </div>
                </div>

                <div className="space-y-3 pb-4" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  <div className="flex justify-between">
                    <span style={{ color: '#a3a3a3' }}>Precio del servicio</span>
                    <span className="font-light" style={{ color: '#ffffff' }}>${selectedService.price.toLocaleString()} MXN</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: '#a3a3a3' }}>IVA (16%)</span>
                    <span className="font-light" style={{ color: '#ffffff' }}>${tax.toLocaleString()} MXN</span>
                  </div>
                </div>

                <div className="pt-4 mb-6">
                  <div className="flex justify-between text-lg font-light">
                    <span style={{ color: '#ffffff' }}>Total</span>
                    <span style={{ color: '#ffffff' }}>${total.toLocaleString()} MXN</span>
                  </div>
                </div>

                <div className="rounded-lg p-4" style={{ 
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                  <div className="flex items-center gap-2 text-sm font-light mb-2" style={{ color: '#ffffff' }}>
                    <div className="w-1 h-1 rounded-full bg-current opacity-60"></div>
                    Proceso Seguro
                  </div>
                  <ul className="text-xs space-y-1" style={{ color: '#a3a3a3' }}>
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff385c]"></div>
      </div>
    }>
      <ServiceCheckoutContent />
    </Suspense>
  )
}