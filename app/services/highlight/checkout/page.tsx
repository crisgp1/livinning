'use client'

import { useState, useEffect, Suspense } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, 
  Star,
  Clock,
  CheckCircle2,
  Building2,
  MapPin
} from 'lucide-react'
import { loadStripe } from '@stripe/stripe-js'
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js'
import Navigation from '@/components/Navigation'
import { getStripePublishableKey } from '@/lib/utils/stripe-client'
import { useToast } from '@/components/Toast'

// Initialize Stripe
const stripePromise = loadStripe(getStripePublishableKey())

const highlightPlans = {
  'highlight-7': {
    name: 'Básico',
    duration: 7,
    price: 299,
    description: 'Destaca tu propiedad por 7 días'
  },
  'highlight-15': {
    name: 'Popular',
    duration: 15,
    price: 499,
    description: 'Destaca tu propiedad por 15 días'
  },
  'highlight-30': {
    name: 'Premium',
    duration: 30,
    price: 899,
    description: 'Destaca tu propiedad por 30 días'
  }
}

function HighlightCheckoutContent() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { showToast } = useToast()
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [property, setProperty] = useState<any>(null)
  const [propertyLoading, setPropertyLoading] = useState(true)

  const propertyId = searchParams.get('propertyId')
  const planId = searchParams.get('planId') as keyof typeof highlightPlans
  const selectedPlan = planId ? highlightPlans[planId] : null

  useEffect(() => {
    if (propertyId) {
      fetchPropertyDetails()
    }
  }, [propertyId])

  const fetchPropertyDetails = async () => {
    try {
      setPropertyLoading(true)
      const response = await fetch(`/api/properties/${propertyId}`)
      if (response.ok) {
        const data = await response.json()
        setProperty(data.data)
      } else {
        showToast('Error al cargar la propiedad', 'error')
        router.push('/dashboard/properties')
      }
    } catch (error) {
      console.error('Error fetching property:', error)
      showToast('Error al cargar la propiedad', 'error')
    } finally {
      setPropertyLoading(false)
    }
  }

  const handleCreateCheckout = async () => {
    if (!user || !selectedPlan || !property) {
      return
    }

    setIsLoading(true)

    try {
      const tax = Math.round(selectedPlan.price * 0.16)
      const total = selectedPlan.price + tax

      // Create Stripe checkout session for highlight service
      const response = await fetch('/api/payments/create-service-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serviceId: `highlight-${selectedPlan.duration}`,
          serviceName: `Destacar Propiedad - Plan ${selectedPlan.name}`,
          price: total,
          currency: 'MXN',
          userEmail: user.emailAddresses?.[0]?.emailAddress || '',
          propertyAddress: `${property.address?.street}, ${property.address?.city}, ${property.address?.state}`,
          contactPhone: user.phoneNumbers?.[0]?.phoneNumber || user.emailAddresses?.[0]?.emailAddress || 'No proporcionado',
          preferredDate: new Date().toISOString().split('T')[0],
          specialRequests: `Destacar propiedad ID: ${propertyId} por ${selectedPlan.duration} días`,
          propertyId: propertyId,
          propertyTitle: property.title,
          highlightDuration: selectedPlan.duration
        }),
      })

      const data = await response.json()

      if (data.success && data.clientSecret) {
        setClientSecret(data.clientSecret)
        showToast('Preparando el procesador de pagos...', 'info')
      } else {
        throw new Error(data.error || 'Failed to create checkout session')
      }

    } catch (error) {
      console.error('Checkout creation error:', error)
      showToast('Error al procesar la solicitud. Por favor intenta de nuevo.', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (user && property && selectedPlan && !clientSecret) {
      handleCreateCheckout()
    }
  }, [user, property, selectedPlan])

  if (!isLoaded || propertyLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-gray-50">
      <div className="loading-spinner"></div>
    </div>
  }

  if (!user) {
    router.push('/sign-in')
    return null
  }

  if (!selectedPlan || !property) {
    router.push('/dashboard/properties')
    return null
  }

  const tax = Math.round(selectedPlan.price * 0.16)
  const total = selectedPlan.price + tax

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Navigation />
      
      <main className="pt-20">
        <div className="section-container py-16">
          
          {/* Header */}
          <div className="mb-12">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 mb-6 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft size={20} />
              Volver
            </button>
            
            <div className="text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 mb-4"
              >
                <div className="p-2 rounded-lg bg-gradient-to-br from-yellow-400 to-orange-500">
                  <Star className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm font-medium text-yellow-600">Servicio Premium</span>
              </motion.div>
              <h1 className="text-3xl font-light mb-4 text-gray-900">
                Destacar Propiedad
              </h1>
              <p className="max-w-2xl mx-auto text-gray-600">
                Aumenta la visibilidad de tu propiedad y recibe más consultas
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            
            {/* Checkout Form */}
            <div className="lg:col-span-2">
              <div className="glass-icon-container p-8 rounded-2xl">
                
                {clientSecret ? (
                  <>
                    <div className="flex items-center gap-3 mb-8">
                      <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                      <h2 className="text-2xl font-semibold text-gray-900">Información de Pago</h2>
                    </div>

                    <EmbeddedCheckoutProvider
                      stripe={stripePromise}
                      options={{ clientSecret }}
                    >
                      <EmbeddedCheckout />
                    </EmbeddedCheckoutProvider>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-96">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600"></div>
                  </div>
                )}
              </div>
            </div>

            {/* Order Summary */}
            <div>
              <div className="glass-icon-container p-6 rounded-2xl sticky top-24">
                <h3 className="text-xl font-semibold mb-6 text-gray-900">
                  Resumen del Pedido
                </h3>
                
                {/* Property Info */}
                <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-start gap-3">
                    <Building2 className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-1">
                        {property.title}
                      </h4>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-3 h-3" />
                        <span>{property.address?.city}, {property.address?.state}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Service Details */}
                <div className="space-y-4 mb-6">
                  <div className="card p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-yellow-100 rounded-lg">
                        <Star className="w-4 h-4 text-yellow-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          Plan {selectedPlan.name}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {selectedPlan.duration} días de destacado
                        </p>
                      </div>
                    </div>
                    
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        Primera posición en búsquedas
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        Distintivo "Destacada"
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        Hasta 200% más visibilidad
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Pricing */}
                <div className="space-y-3 pb-4 border-b border-gray-200">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Servicio de destacado</span>
                    <span className="font-medium text-gray-900">${selectedPlan.price.toLocaleString()} MXN</span>
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

                <div className="card p-4 bg-yellow-50 border border-yellow-200">
                  <div className="flex items-center gap-2 text-sm font-medium mb-1 text-yellow-800">
                    <Clock className="w-4 h-4" />
                    Activación Inmediata
                  </div>
                  <p className="text-xs text-yellow-700">
                    Tu propiedad será destacada inmediatamente después de completar el pago
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function HighlightCheckout() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-gray-50">
        <div className="loading-spinner"></div>
      </div>
    }>
      <HighlightCheckoutContent />
    </Suspense>
  )
}