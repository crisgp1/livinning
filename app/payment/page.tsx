'use client'

import { useState, useEffect, Suspense } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter, useSearchParams } from 'next/navigation'
import { CreditCard, Lock, ArrowLeft, Building2 } from 'lucide-react'
import { loadStripe } from '@stripe/stripe-js'
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js'
import Navigation from '@/components/Navigation'
import { getStripePublishableKey } from '@/lib/utils/stripe-client'

interface Plan {
  id: string
  name: string
  price: number
  currency: string
  period: string
}

const plans: Record<string, Plan> = {
  starter: {
    id: 'starter',
    name: 'Starter',
    price: 299,
    currency: 'MXN',
    period: 'mes'
  },
  professional: {
    id: 'professional',
    name: 'Professional',
    price: 599,
    currency: 'MXN',
    period: 'mes'
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    price: 1299,
    currency: 'MXN',
    period: 'mes'
  }
}

// Initialize Stripe
const stripePromise = loadStripe(getStripePublishableKey())

function PaymentContent() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  const planId = searchParams.get('plan')
  const selectedPlan = planId ? plans[planId] : null

  useEffect(() => {
    if (!isLoaded || !user || !selectedPlan) return

    const fetchClientSecret = async () => {
      try {
        // Create Stripe checkout session
        const response = await fetch('/api/payments/create-checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            planId: selectedPlan.id,
            planName: selectedPlan.name,
            price: selectedPlan.price,
            currency: selectedPlan.currency,
            userEmail: user.emailAddresses?.[0]?.emailAddress
          })
        })

        const result = await response.json()

        if (result.success && result.clientSecret) {
          setClientSecret(result.clientSecret)
        } else {
          console.error('Failed to create checkout session:', result.error)
          alert(result.error || 'Error al crear la sesión de pago')
          router.push('/upgrade-agency')
        }
      } catch (error) {
        console.error('Payment error:', error)
        alert('Error al procesar el pago')
        router.push('/upgrade-agency')
      } finally {
        setIsLoading(false)
      }
    }

    fetchClientSecret()
  }, [isLoaded, user, selectedPlan, router])

  if (!isLoaded) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff385c]"></div>
    </div>
  }

  if (!user) {
    router.push('/sign-in')
    return null
  }

  if (!selectedPlan) {
    router.push('/upgrade-agency')
    return null
  }

  const tax = Math.round(selectedPlan.price * 0.16)
  const total = selectedPlan.price + tax

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="pt-20">
        <div className="section-container py-16">
          <div className="max-w-5xl mx-auto">
            
            {/* Header */}
            <div className="text-center mb-12">
              <button
                onClick={() => router.back()}
                className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6"
              >
                <ArrowLeft size={20} />
                Volver a planes
              </button>
              
              <div className="inline-flex items-center gap-2 bg-[#ff385c] text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Lock size={16} />
                Pago Seguro
              </div>
              
              <h1 className="text-3xl font-bold text-gray-800 mb-4">
                Completa tu suscripción
              </h1>
              <p className="text-gray-600">
                Estás a un paso de activar tu plan <strong>{selectedPlan.name}</strong>
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Stripe Embedded Checkout */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <div className="flex items-center gap-3 mb-8">
                    <CreditCard className="w-6 h-6 text-[#ff385c]" />
                    <h2 className="text-2xl font-bold text-gray-800">Información de Pago</h2>
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
                      <p className="text-gray-600">Error al cargar el formulario de pago</p>
                      <button
                        onClick={() => router.push('/upgrade-agency')}
                        className="mt-4 text-[#ff385c] hover:underline"
                      >
                        Volver a planes
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
                  <h3 className="text-xl font-bold text-gray-800 mb-6">Resumen del Pedido</h3>
                  
                  <div className="space-y-4 mb-6">
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                      <Building2 className="w-8 h-8 text-[#ff385c]" />
                      <div>
                        <h4 className="font-semibold text-gray-800">Plan {selectedPlan.name}</h4>
                        <p className="text-sm text-gray-600">Suscripción mensual</p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium">${selectedPlan.price.toLocaleString()} {selectedPlan.currency}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">IVA (16%)</span>
                      <span className="font-medium">${tax.toLocaleString()} {selectedPlan.currency}</span>
                    </div>
                    <div className="border-t pt-3 flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span className="text-[#ff385c]">${total.toLocaleString()} {selectedPlan.currency}</span>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2 text-green-700 text-sm">
                      <Lock size={16} />
                      <span className="font-medium">Pago 100% seguro</span>
                    </div>
                    <p className="text-green-600 text-xs mt-1">
                      Tus datos están protegidos con encriptación SSL
                    </p>
                  </div>

                  <div className="mt-4 text-center">
                    <p className="text-xs text-gray-500">
                      ¿Necesitas ayuda? Contáctanos en<br />
                      <a href="mailto:soporte@livinning.com" className="text-[#ff385c] hover:underline">
                        soporte@livinning.com
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function Payment() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff385c]"></div>
      </div>
    }>
      <PaymentContent />
    </Suspense>
  )
}