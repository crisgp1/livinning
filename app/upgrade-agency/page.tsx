'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  Crown, 
  Check, 
  Users,
  BarChart3,
  Shield,
  Zap,
  Sparkles,
  ArrowRight,
  Star,
  Building,
  Phone,
  Mail,
  Award,
  Globe,
  Target
} from 'lucide-react'
import Navigation from '@/components/Navigation'

interface Plan {
  id: string
  name: string
  price: number
  currency: string
  period: string
  description: string
  icon: any
  color: string
  gradient: string
  popular?: boolean
  features: string[]
  limits: {
    properties: string
    users: string
    storage: string
    support: string
  }
}

const plans: Plan[] = [
  {
    id: 'basic',
    name: 'Basic',
    price: 49,
    currency: 'MXN',
    period: '/mes',
    description: 'Perfecto para agencias pequeñas que están comenzando',
    icon: Building,
    color: 'text-green-600',
    gradient: 'from-green-500 to-emerald-500',
    features: [
      'Hasta 25 propiedades activas',
      'Panel de control básico',
      'Soporte por email',
      'Integración web básica',
      'Galería de fotos estándar',
      'Reportes mensuales'
    ],
    limits: {
      properties: '25 propiedades',
      users: '3 usuarios',
      storage: '5 GB',
      support: 'Email (24-48h)'
    }
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 99,
    currency: 'MXN',
    period: '/mes',
    description: 'La opción más popular para agencias en crecimiento',
    icon: Star,
    color: 'text-blue-600',
    gradient: 'from-blue-500 to-cyan-500',
    popular: true,
    features: [
      'Hasta 100 propiedades activas',
      'Analytics avanzados',
      'Soporte prioritario',
      'Tours virtuales 360°',
      'CRM integrado',
      'API personalizada',
      'Reportes en tiempo real',
      'Branding personalizado'
    ],
    limits: {
      properties: '100 propiedades',
      users: '10 usuarios',
      storage: '25 GB',
      support: 'Chat + Email (4-8h)'
    }
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 199,
    currency: 'MXN',
    period: '/mes',
    description: 'Solución completa para grandes agencias inmobiliarias',
    icon: Crown,
    color: 'text-purple-600',
    gradient: 'from-purple-500 to-pink-500',
    features: [
      'Propiedades ilimitadas',
      'IA para valoraciones',
      'Manager dedicado',
      'Soporte telefónico 24/7',
      'Integración completa',
      'White-label disponible',
      'Analytics predictivos',
      'Automatización avanzada',
      'SLA garantizado'
    ],
    limits: {
      properties: 'Ilimitadas',
      users: 'Ilimitados',
      storage: '100 GB',
      support: 'Telefónico 24/7 (2-4h)'
    }
  }
]

const features = [
  {
    icon: BarChart3,
    title: 'Analytics Avanzados',
    description: 'Reportes detallados y métricas de rendimiento en tiempo real'
  },
  {
    icon: Users,
    title: 'Gestión de Equipos',
    description: 'Administra tu equipo con roles y permisos personalizados'
  },
  {
    icon: Shield,
    title: 'Seguridad Premium',
    description: 'Protección avanzada de datos y backups automáticos'
  },
  {
    icon: Zap,
    title: 'Automatización',
    description: 'Flujos de trabajo automatizados para mayor eficiencia'
  },
  {
    icon: Globe,
    title: 'Integración Web',
    description: 'Conecta con tu sitio web y plataformas externas'
  },
  {
    icon: Target,
    title: 'Lead Management',
    description: 'Sistema CRM integrado para gestionar clientes potenciales'
  }
]

export default function UpgradeAgency() {
  const { user } = useUser()
  const router = useRouter()
  const [selectedPlan, setSelectedPlan] = useState('premium')
  const [isAnnual, setIsAnnual] = useState(false)
  const [currentPlan, setCurrentPlan] = useState('free')

  useEffect(() => {
    if (user) {
      const metadata = user.publicMetadata as any
      setCurrentPlan(metadata?.organizationPlan || 'free')
    }
  }, [user])

  const handleUpgrade = (planId: string) => {
    if (!user) {
      router.push('/sign-in')
      return
    }
    
    const plan = plans.find(p => p.id === planId)
    if (plan) {
      router.push(`/payment?plan=${planId}&type=agency&annual=${isAnnual}`)
    }
  }

  const getDiscountedPrice = (price: number) => {
    return isAnnual ? Math.round(price * 0.8) : price
  }

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
          
          {/* Header */}
          <div className="text-center mb-16">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium mb-6 glass-icon-container"
            >
              <Crown className="w-4 h-4 text-primary" />
              <span className="text-gray-700">Planes para Agencias</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl font-light mb-6 text-gray-900"
            >
              Potencia tu agencia con
              <span className="text-primary font-medium"> herramientas profesionales</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl max-w-3xl mx-auto text-gray-600 mb-8"
            >
              Elige el plan perfecto para hacer crecer tu negocio inmobiliario con las mejores herramientas del mercado
            </motion.p>

            {/* Annual/Monthly Toggle */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="inline-flex items-center gap-4 p-2 rounded-xl glass-icon-container"
            >
              <span className={`text-sm font-medium transition-colors ${!isAnnual ? 'text-gray-900' : 'text-gray-500'}`}>
                Mensual
              </span>
              <button
                onClick={() => setIsAnnual(!isAnnual)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isAnnual ? 'bg-primary' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isAnnual ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className={`text-sm font-medium transition-colors ${isAnnual ? 'text-gray-900' : 'text-gray-500'}`}>
                Anual
              </span>
              {isAnnual && (
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-green-100 text-green-700">
                  Ahorra 20%
                </span>
              )}
            </motion.div>
          </div>

          {/* Current Plan Info */}
          {user && currentPlan !== 'free' && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mb-12 glass-icon-container rounded-2xl p-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Award className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Plan Actual: {currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)}</h3>
                    <p className="text-sm text-gray-600">Gestiona tu suscripción o actualiza a un plan superior</p>
                  </div>
                </div>
                <button 
                  onClick={() => router.push('/dashboard/settings')}
                  className="text-sm text-primary hover:text-primary/80 font-medium"
                >
                  Gestionar Plan
                </button>
              </div>
            </motion.div>
          )}

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {plans.map((plan, index) => {
              const Icon = plan.icon
              const isCurrentPlan = currentPlan === plan.id
              const discountedPrice = getDiscountedPrice(plan.price)
              
              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * (index + 1) }}
                  className={`glass-icon-container rounded-2xl overflow-hidden relative group hover:shadow-xl transition-all duration-300 ${
                    plan.popular ? 'ring-2 ring-primary scale-105' : ''
                  } ${isCurrentPlan ? 'ring-2 ring-green-500' : ''}`}
                  whileHover={{ y: -4 }}
                >
                  {plan.popular && (
                    <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-2 bg-primary text-white shadow-lg">
                      <Sparkles className="w-3 h-3" />
                      Más Popular
                    </div>
                  )}

                  {isCurrentPlan && (
                    <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-2 bg-green-500 text-white shadow-lg">
                      <Check className="w-3 h-3" />
                      Plan Actual
                    </div>
                  )}
                  
                  <div className="p-8">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${plan.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    
                    <h3 className="text-2xl font-light mb-2 text-gray-900">
                      {plan.name}
                    </h3>
                    
                    <p className="mb-6 text-gray-600">
                      {plan.description}
                    </p>

                    <div className="mb-6">
                      <div className="flex items-baseline gap-1">
                        {isAnnual && plan.price !== discountedPrice && (
                          <span className="text-lg text-gray-400 line-through">
                            ${plan.price}
                          </span>
                        )}
                        <span className="text-4xl font-light text-gray-900">
                          ${discountedPrice}
                        </span>
                        <span className="text-gray-500">
                          {plan.period}
                        </span>
                      </div>
                      {isAnnual && (
                        <span className="text-sm text-green-600 font-medium">
                          Ahorro anual: ${(plan.price - discountedPrice) * 12}
                        </span>
                      )}
                    </div>

                    {/* Plan Limits */}
                    <div className="mb-6 p-4 rounded-xl glass">
                      <h4 className="text-sm font-medium mb-3 text-gray-700">Límites del Plan</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Propiedades:</span>
                          <span className="font-medium text-gray-900">{plan.limits.properties}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Usuarios:</span>
                          <span className="font-medium text-gray-900">{plan.limits.users}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Almacenamiento:</span>
                          <span className="font-medium text-gray-900">{plan.limits.storage}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Soporte:</span>
                          <span className="font-medium text-gray-900">{plan.limits.support}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3 mb-8">
                      {plan.features.map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-gray-600">{feature}</span>
                        </div>
                      ))}
                    </div>
                    
                    <button
                      onClick={() => handleUpgrade(plan.id)}
                      disabled={isCurrentPlan}
                      className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-all duration-200 ${
                        isCurrentPlan
                          ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                          : plan.popular
                          ? 'btn-primary'
                          : 'bg-gray-900 text-white hover:bg-gray-800'
                      }`}
                    >
                      {isCurrentPlan ? (
                        'Plan Actual'
                      ) : (
                        <>
                          Elegir {plan.name}
                          <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Features Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="glass-icon-container rounded-2xl p-12 mb-16"
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl font-light mb-4 text-gray-900">
                ¿Por qué elegir Livinning Agency?
              </h2>
              <p className="text-xl text-gray-600">
                Herramientas profesionales diseñadas específicamente para agencias inmobiliarias
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => {
                const Icon = feature.icon
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 + index * 0.1 }}
                    className="text-center group"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                      <Icon className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-light mb-3 text-gray-900">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600">
                      {feature.description}
                    </p>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>

          {/* Contact Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="glass-icon-container rounded-2xl p-8 text-center"
          >
            <h3 className="text-2xl font-light mb-4 text-gray-900">
              ¿Necesitas un plan personalizado?
            </h3>
            <p className="text-gray-600 mb-6">
              Contacta con nuestro equipo de ventas para planes enterprise personalizados
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => router.push('/contacto')}
                className="btn-primary flex items-center gap-2"
              >
                <Mail size={18} />
                Contactar Ventas
              </button>
              <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors">
                <Phone size={18} />
                +34 91 123 4567
              </button>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  )
}