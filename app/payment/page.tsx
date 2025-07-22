'use client'

import { useState, useEffect, Suspense } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter, useSearchParams } from 'next/navigation'
import { CreditCard, Lock, ArrowLeft, Building2, Shield, Check } from 'lucide-react'
import { loadStripe } from '@stripe/stripe-js'
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js'
import { motion } from 'framer-motion'
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
  basic: {
    id: 'basic',
    name: 'Basic',
    price: 49,
    currency: 'EUR',
    period: 'mes'
  },
  premium: {
    id: 'premium',
    name: 'Premium',
    price: 99,
    currency: 'EUR',
    period: 'mes'
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    price: 199,
    currency: 'EUR',
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
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-primary rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!user) {
    router.push('/sign-in')
    return null
  }

  if (!selectedPlan) {
    router.push('/upgrade-agency')
    return null
  }

  const tax = Math.round(selectedPlan.price * 0.21) // EU VAT 21%
  const total = selectedPlan.price + tax

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-200 to-cyan-200 rounded-full filter blur-3xl opacity-60"></div>
        <div className="absolute top-80 -left-40 w-96 h-96 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full filter blur-3xl opacity-60"></div>
        <div className="absolute bottom-20 right-20 w-72 h-72 bg-gradient-to-br from-green-200 to-emerald-200 rounded-full filter blur-3xl opacity-40"></div>
      </div>
      
      <main className="pt-20 relative z-10">
        <div className="section-container py-16">
          <div className="max-w-5xl mx-auto">
            
            {/* Header */}
            <div className="text-center mb-12">
              <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => router.back()}
                className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
              >
                <ArrowLeft size={20} />
                Volver a planes
              </motion.button>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium mb-6 glass-icon-container"
              >
                <Lock className="w-4 h-4 text-primary" />
                <span className="text-gray-700">Pago Seguro</span>
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-3xl md:text-4xl font-light text-gray-900 mb-4"
              >
                Completa tu suscripción
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-gray-600"
              >
                Estás a un paso de activar tu plan <strong>{selectedPlan.name}</strong>
              </motion.p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Stripe Embedded Checkout */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="lg:col-span-2"
              >
                <div className="glass-icon-container rounded-2xl p-8">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 rounded-xl bg-primary/10">
                      <CreditCard className="w-6 h-6 text-primary" />
                    </div>
                    <h2 className="text-2xl font-light text-gray-900">Información de Pago</h2>
                  </div>

                  {isLoading ? (
                    <div className="flex items-center justify-center h-96">
                      <div className="w-8 h-8 border-2 border-gray-200 border-t-primary rounded-full animate-spin"></div>
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
                      <p className="text-gray-600 mb-4">Error al cargar el formulario de pago</p>
                      <button
                        onClick={() => router.push('/upgrade-agency')}
                        className="text-primary hover:text-primary/80 font-medium"
                      >
                        Volver a planes
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Order Summary */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="lg:col-span-1"
              >
                <div className="glass-icon-container rounded-2xl p-6 sticky top-24">
                  <h3 className="text-xl font-light text-gray-900 mb-6">Resumen del Pedido</h3>
                  
                  <div className="space-y-4 mb-6">
                    <div className="flex items-center gap-3 p-4 rounded-lg glass">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Building2 className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">Plan {selectedPlan.name}</h4>
                        <p className="text-sm text-gray-600">Suscripción mensual</p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium text-gray-900">€{selectedPlan.price.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">IVA (21%)</span>
                      <span className="font-medium text-gray-900">€{tax.toLocaleString()}</span>
                    </div>
                    <div className="border-t border-gray-100 pt-3 flex justify-between text-lg font-medium">
                      <span className="text-gray-900">Total</span>
                      <span className="text-primary">€{total.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Security Features */}
                  <div className="mt-6 space-y-3">
                    <div className="flex items-center gap-3 p-3 rounded-lg glass">
                      <Shield className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Pago 100% seguro</p>
                        <p className="text-xs text-gray-600">Protegido con SSL</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 rounded-lg glass">
                      <Check className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Activación instantánea</p>
                        <p className="text-xs text-gray-600">Acceso inmediato</p>
                      </div>
                    </div>
                  </div>

                  {/* Support Contact */}
                  <div className="mt-6 p-4 rounded-lg glass text-center">
                    <p className="text-xs text-gray-600 mb-2">
                      ¿Necesitas ayuda?
                    </p>
                    <a 
                      href="mailto:soporte@livinning.com" 
                      className="text-primary hover:text-primary/80 text-sm font-medium"
                    >
                      soporte@livinning.com
                    </a>
                  </div>
                </div>
              </motion.div>
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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-primary rounded-full animate-spin"></div>
      </div>
    }>
      <PaymentContent />
    </Suspense>
  )
}