'use client'

import { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Navigation from '@/components/Navigation'

interface Plan {
  id: string
  name: string
  price: number
  currency: string
  period: string
  popular?: boolean
  features: string[]
  maxProperties: number
  description: string
  color: string
}

const plans: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 299,
    currency: 'MXN',
    period: 'mes',
    maxProperties: 10,
    description: 'Perfecto para agentes independientes',
    color: 'blue',
    features: [
      'Hasta 10 propiedades activas',
      '15 fotos por propiedad',
      'Perfil de agencia básico',
      '100 leads por mes',
      'Soporte por email (48h)',
      'Estadísticas básicas'
    ]
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 599,
    currency: 'MXN',
    period: 'mes',
    popular: true,
    maxProperties: 30,
    description: 'Ideal para agencias establecidas',
    color: 'purple',
    features: [
      'Hasta 30 propiedades activas',
      '25 fotos por propiedad',
      'Marca personalizada',
      '500 leads por mes',
      'Soporte prioritario (24h)',
      'Tours virtuales (10/mes)',
      'WhatsApp Business',
      'Analytics avanzados',
      '2 usuarios adicionales'
    ]
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 1299,
    currency: 'MXN',
    period: 'mes',
    maxProperties: 75,
    description: 'Para inmobiliarias en crecimiento',
    color: 'gold',
    features: [
      'Hasta 75 propiedades activas',
      '40 fotos por propiedad',
      'Marca 100% personalizada',
      '2000 leads por mes',
      'Soporte dedicado',
      'Tours virtuales (30/mes)',
      'CRM completo',
      '5 usuarios adicionales',
      'API access (1000 calls/mes)',
      'Reportes personalizados'
    ]
  },
  {
    id: 'custom',
    name: 'Personalizado',
    price: 0,
    currency: 'MXN',
    period: 'mes',
    maxProperties: -1,
    description: 'Solución a medida para grandes empresas',
    color: 'gradient',
    features: [
      'Propiedades personalizadas',
      'Almacenamiento ilimitado',
      'Integraciones personalizadas',
      'SLA garantizado',
      'Account Manager dedicado',
      'Capacitación on-site',
      'Desarrollo de features exclusivas',
      'Usuarios ilimitados',
      'API sin límites',
      'Soporte 24/7 con prioridad'
    ]
  }
]

export default function UpgradeAgency() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [isProcessing] = useState(false)
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly')

  const handlePurchase = (plan: Plan) => {
    if (!user) {
      router.push('/sign-in')
      return
    }

    // Redirect to payment form with selected plan
    router.push(`/payment?plan=${plan.id}&billing=${billingPeriod}`)
  }

  const getPrice = (plan: Plan) => {
    if (billingPeriod === 'yearly') {
      // 20% discount for yearly billing
      return Math.round(plan.price * 12 * 0.8)
    }
    return plan.price
  }

  const getPeriodText = () => {
    return billingPeriod === 'yearly' ? 'año' : 'mes'
  }

  const getPlanGradient = (planId: string) => {
    switch(planId) {
      case 'starter':
        return 'linear-gradient(135deg, #666666, #525252)'
      case 'professional':
        return 'linear-gradient(135deg, #e5e5e5, #a3a3a3)'
      case 'enterprise':
        return 'linear-gradient(135deg, #ffffff, #e5e5e5)'
      case 'custom':
        return 'linear-gradient(135deg, #fbbf24, #f59e0b)'
      default:
        return 'linear-gradient(135deg, #666666, #525252)'
    }
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0a0a' }}>
        <div className="loading-spinner"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: '#0a0a0a' }}>
      <Navigation />
      
      <main className="pt-20">
        <div className="section-container py-16">
          {/* Header */}
          <div className="text-center mb-16">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6"
              style={{ 
                background: 'rgba(255, 255, 255, 0.1)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            >
              <div className="w-1 h-1 rounded-full bg-white opacity-60"></div>
              Upgrade a Agencia
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-light mb-6"
              style={{ color: '#ffffff' }}
            >
              Lleva tu agencia inmobiliaria
              <span className="gradient-text"> al siguiente nivel</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl max-w-3xl mx-auto"
              style={{ color: '#a3a3a3' }}
            >
              Obtén acceso a herramientas profesionales, mayor visibilidad y funciones avanzadas 
              para hacer crecer tu negocio inmobiliario en México
            </motion.p>
          </div>

          {/* Billing Toggle */}
          <div className="flex justify-center mb-12">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-card p-1 flex rounded-full"
            >
              <button
                onClick={() => setBillingPeriod('monthly')}
                className={`px-6 py-3 rounded-full transition-all duration-200 ${
                  billingPeriod === 'monthly' 
                    ? 'bg-white text-black' 
                    : 'text-white hover:text-gray-300'
                }`}
              >
                Mensual
              </button>
              <button
                onClick={() => setBillingPeriod('yearly')}
                className={`px-6 py-3 rounded-full transition-all duration-200 flex items-center gap-2 ${
                  billingPeriod === 'yearly' 
                    ? 'bg-white text-black' 
                    : 'text-white hover:text-gray-300'
                }`}
              >
                Anual
                <span className="text-xs px-2 py-1 bg-green-500 text-white rounded-full">
                  20% OFF
                </span>
              </button>
            </motion.div>
          </div>

          {/* Pricing Plans */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className={`glass-card overflow-hidden relative ${
                  plan.popular ? 'ring-2 ring-white ring-opacity-20 scale-105' : ''
                }`}
                whileHover={{ y: -4 }}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-0 right-0 text-center py-2 text-sm font-medium"
                    style={{ 
                      background: 'linear-gradient(135deg, #ffffff, #e5e5e5)',
                      color: '#000000'
                    }}
                  >
                    <div className="inline-flex items-center gap-1">
                      <div className="w-1 h-1 rounded-full bg-current opacity-60"></div>
                      Más Popular
                    </div>
                  </div>
                )}

                <div className={`p-8 ${plan.popular ? 'pt-12' : ''}`}>
                  {/* Plan Header */}
                  <div className="text-center mb-8">
                    <div 
                      className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
                      style={{ 
                        background: getPlanGradient(plan.id),
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
                      }}
                    >
                      <div className="w-2 h-2 rounded-full bg-black opacity-60"></div>
                    </div>
                    <h3 className="text-2xl font-light mb-2" style={{ color: '#ffffff' }}>{plan.name}</h3>
                    <p className="text-sm" style={{ color: '#a3a3a3' }}>{plan.description}</p>
                  </div>

                  {/* Pricing */}
                  <div className="text-center mb-8">
                    {plan.id === 'custom' ? (
                      <>
                        <div className="h-12 flex items-center justify-center">
                          <span className="text-2xl font-light" style={{ color: '#ffffff' }}>
                            Cotización personalizada
                          </span>
                        </div>
                        <p className="text-sm mt-2" style={{ color: '#a3a3a3' }}>
                          Diseñado para tus necesidades
                        </p>
                      </>
                    ) : (
                      <>
                        <div className="flex items-baseline justify-center gap-1">
                          <span className="text-3xl font-light" style={{ color: '#ffffff' }}>$</span>
                          <span className="text-5xl font-light" style={{ color: '#ffffff' }}>{getPrice(plan).toLocaleString()}</span>
                          <span className="text-lg" style={{ color: '#a3a3a3' }}>MXN/{getPeriodText()}</span>
                        </div>
                        {billingPeriod === 'yearly' && (
                          <p className="text-sm mt-2" style={{ color: '#71717a' }}>
                            ${Math.round(getPrice(plan) / 12).toLocaleString()} MXN/mes
                          </p>
                        )}
                        <p className="text-sm mt-1" style={{ color: '#a3a3a3' }}>
                          Hasta {plan.maxProperties} propiedades activas
                        </p>
                      </>
                    )}
                  </div>

                  {/* Features */}
                  <div className="space-y-4 mb-8">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <div 
                          className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5"
                          style={{ 
                            background: getPlanGradient(plan.id),
                            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
                          }}
                        >
                          <div className="w-1 h-1 rounded-full bg-black opacity-60"></div>
                        </div>
                        <span style={{ color: '#a3a3a3' }}>{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA Button */}
                  <button
                    onClick={() => plan.id === 'custom' ? router.push('/contacto') : handlePurchase(plan)}
                    disabled={isProcessing}
                    className="w-full py-4 px-6 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      background: plan.popular 
                        ? 'linear-gradient(135deg, #ffffff, #e5e5e5)'
                        : plan.id === 'custom'
                        ? 'linear-gradient(135deg, #fbbf24, #f59e0b)'
                        : 'rgba(255, 255, 255, 0.1)',
                      color: plan.popular || plan.id === 'custom' ? '#000000' : '#ffffff',
                      border: '1px solid rgba(255, 255, 255, 0.2)'
                    }}
                    onMouseEnter={(e) => {
                      if (!isProcessing) {
                        e.currentTarget.style.background = plan.popular 
                          ? 'linear-gradient(135deg, #e5e5e5, #d4d4d4)'
                          : plan.id === 'custom'
                          ? 'linear-gradient(135deg, #f59e0b, #dc2626)'
                          : 'rgba(255, 255, 255, 0.2)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isProcessing) {
                        e.currentTarget.style.background = plan.popular 
                          ? 'linear-gradient(135deg, #ffffff, #e5e5e5)'
                          : plan.id === 'custom'
                          ? 'linear-gradient(135deg, #fbbf24, #f59e0b)'
                          : 'rgba(255, 255, 255, 0.1)'
                      }
                    }}
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        Procesando...
                      </>
                    ) : (
                      <>
                        <div className="w-1 h-1 rounded-full bg-current opacity-60"></div>
                        {plan.id === 'custom' ? 'Contáctanos' : `Elegir ${plan.name}`}
                        <div className="w-1 h-1 rounded-full bg-current opacity-60"></div>
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Benefits Section */}
          <div className="mt-20 text-center">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-light mb-12"
              style={{ color: '#ffffff' }}
            >
              ¿Por qué elegir <span className="gradient-text">Livinning</span> para tu agencia?
            </motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-card p-8 text-center"
                whileHover={{ y: -4 }}
              >
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ 
                    background: 'linear-gradient(135deg, #666666, #525252)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
                  }}
                >
                  <div className="w-2 h-2 rounded-full bg-white opacity-60"></div>
                </div>
                <h3 className="text-xl font-light mb-2" style={{ color: '#ffffff' }}>Presencia Profesional</h3>
                <p style={{ color: '#a3a3a3' }}>
                  Crea una imagen profesional con tu marca personalizada y landing pages únicas
                </p>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-card p-8 text-center"
                whileHover={{ y: -4 }}
              >
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ 
                    background: 'linear-gradient(135deg, #e5e5e5, #a3a3a3)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
                  }}
                >
                  <div className="w-2 h-2 rounded-full bg-black opacity-60"></div>
                </div>
                <h3 className="text-xl font-light mb-2" style={{ color: '#ffffff' }}>Mayor Alcance</h3>
                <p style={{ color: '#a3a3a3' }}>
                  Llega a más clientes potenciales con mejor SEO y integración con portales
                </p>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="glass-card p-8 text-center"
                whileHover={{ y: -4 }}
              >
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ 
                    background: 'linear-gradient(135deg, #ffffff, #e5e5e5)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
                  }}
                >
                  <div className="w-2 h-2 rounded-full bg-black opacity-60"></div>
                </div>
                <h3 className="text-xl font-light mb-2" style={{ color: '#ffffff' }}>Herramientas Avanzadas</h3>
                <p style={{ color: '#a3a3a3' }}>
                  CRM integrado, analytics detallados y automatizaciones para optimizar tu trabajo
                </p>
              </motion.div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mt-20 max-w-3xl mx-auto">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-light text-center mb-12"
              style={{ color: '#ffffff' }}
            >
              Preguntas Frecuentes
            </motion.h2>
            <div className="space-y-6">
              <motion.details 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-card p-6 cursor-pointer"
              >
                <summary className="font-light text-lg" style={{ color: '#ffffff' }}>
                  ¿Qué pasa si excedo el límite de propiedades?
                </summary>
                <p className="mt-4" style={{ color: '#a3a3a3' }}>
                  Te notificaremos cuando te acerques al límite y podrás actualizar tu plan en cualquier momento.
                </p>
              </motion.details>
              <motion.details 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-card p-6 cursor-pointer"
              >
                <summary className="font-light text-lg" style={{ color: '#ffffff' }}>
                  ¿Puedo cancelar mi suscripción en cualquier momento?
                </summary>
                <p className="mt-4" style={{ color: '#a3a3a3' }}>
                  Sí, puedes cancelar tu suscripción cuando quieras. Mantendrás el acceso hasta el final del período facturado.
                </p>
              </motion.details>
              <motion.details 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="glass-card p-6 cursor-pointer"
              >
                <summary className="font-light text-lg" style={{ color: '#ffffff' }}>
                  ¿Ofrecen descuentos por pago anual?
                </summary>
                <p className="mt-4" style={{ color: '#a3a3a3' }}>
                  Sí, ofrecemos 20% de descuento al pagar anualmente. Contáctanos para más información.
                </p>
              </motion.details>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}