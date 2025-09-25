'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Star, Clock, CheckCircle2, TrendingUp, Target, Eye } from 'lucide-react'
import { motion } from 'framer-motion'

interface HighlightPropertyServiceProps {
  propertyId: string
  propertyTitle: string
  propertyAddress: string
  isHighlighted?: boolean
  isHighlightActive?: boolean
  highlightExpiresAt?: string
  onHighlightChange?: (highlighted: boolean) => void
}

// Pricing tiers for highlight service
const pricingPlans = [
  {
    id: 'highlight-7',
    name: 'Básico',
    duration: 7,
    price: 299,
    currency: 'MXN',
    features: [
      'Destacado por 7 días',
      'Aparece primero en búsquedas',
      'Distintivo "Destacada"',
      '50% más visibilidad'
    ],
    recommended: false
  },
  {
    id: 'highlight-15',
    name: 'Popular',
    duration: 15,
    price: 499,
    currency: 'MXN',
    features: [
      'Destacado por 15 días',
      'Aparece primero en búsquedas',
      'Distintivo "Destacada"',
      '100% más visibilidad',
      'Reporte de estadísticas'
    ],
    recommended: true
  },
  {
    id: 'highlight-30',
    name: 'Premium',
    duration: 30,
    price: 899,
    currency: 'MXN',
    features: [
      'Destacado por 30 días',
      'Aparece primero en búsquedas',
      'Distintivo "Destacada"',
      '200% más visibilidad',
      'Reporte de estadísticas',
      'Soporte prioritario'
    ],
    recommended: false
  }
]

export default function HighlightPropertyService({
  propertyId,
  propertyTitle,
  propertyAddress,
  isHighlighted = false,
  isHighlightActive = false,
  highlightExpiresAt,
  onHighlightChange
}: HighlightPropertyServiceProps) {
  const router = useRouter()
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [showPricing, setShowPricing] = useState(false)

  const formatExpiryDate = (dateString?: string) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const getDaysUntilExpiry = (dateString?: string) => {
    if (!dateString) return 0
    const expiry = new Date(dateString)
    const now = new Date()
    const diffTime = expiry.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const handleSelectPlan = (planId: string, duration: number, price: number) => {
    // Navigate to checkout with service details
    const params = new URLSearchParams({
      service: 'highlight',
      propertyId: propertyId,
      duration: duration.toString(),
      price: price.toString(),
      planId: planId
    })
    router.push(`/services/highlight/checkout?${params.toString()}`)
  }

  const daysUntilExpiry = getDaysUntilExpiry(highlightExpiresAt)

  if (isHighlightActive) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
          <div className="p-2 bg-yellow-100 rounded-lg">
            <Star className="w-5 h-5 text-yellow-600 fill-yellow-600" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-yellow-800">Propiedad destacada</p>
            <div className="flex items-center gap-2 text-sm text-yellow-700">
              <Clock className="w-4 h-4" />
              <span>
                {daysUntilExpiry > 0 
                  ? `${daysUntilExpiry} días restantes`
                  : 'Expira hoy'
                }
              </span>
            </div>
            <p className="text-xs text-yellow-600 mt-1">
              Expira el {formatExpiryDate(highlightExpiresAt)}
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowPricing(true)}
          className="w-full px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
        >
          Extender Destacado
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {!showPricing ? (
        <>
          <div className="glass-icon-container rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl">
                <Star className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Destaca tu Propiedad
                </h3>
                <p className="text-sm text-gray-600">
                  Aumenta la visibilidad hasta 200%
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <TrendingUp className="w-5 h-5 mx-auto mb-1 text-green-600" />
                <p className="text-xs text-gray-600">+200% Vistas</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <Target className="w-5 h-5 mx-auto mb-1 text-blue-600" />
                <p className="text-xs text-gray-600">Primera Posición</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <Eye className="w-5 h-5 mx-auto mb-1 text-purple-600" />
                <p className="text-xs text-gray-600">Distintivo Especial</p>
              </div>
            </div>

            <button
              onClick={() => setShowPricing(true)}
              className="w-full btn-primary"
            >
              Ver Planes de Destacado
            </button>
          </div>
        </>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Elige tu Plan
            </h3>
            <button
              onClick={() => setShowPricing(false)}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Cancelar
            </button>
          </div>

          <div className="grid gap-4">
            {pricingPlans.map((plan) => (
              <motion.div
                key={plan.id}
                className={`relative p-4 rounded-xl border-2 transition-all cursor-pointer ${
                  selectedPlan === plan.id 
                    ? 'border-yellow-500 bg-yellow-50' 
                    : 'border-gray-200 hover:border-gray-300'
                } ${plan.recommended ? 'ring-2 ring-yellow-500 ring-offset-2' : ''}`}
                onClick={() => setSelectedPlan(plan.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {plan.recommended && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="px-3 py-1 bg-yellow-500 text-white text-xs font-medium rounded-full">
                      Más Popular
                    </span>
                  </div>
                )}

                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-900">{plan.name}</h4>
                    <p className="text-sm text-gray-600">{plan.duration} días</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">
                      ${plan.price}
                    </p>
                    <p className="text-xs text-gray-500">MXN</p>
                  </div>
                </div>

                <ul className="space-y-2 mb-4">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleSelectPlan(plan.id, plan.duration, plan.price)
                  }}
                  className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                    selectedPlan === plan.id
                      ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Seleccionar Plan
                </button>
              </motion.div>
            ))}
          </div>

          <div className="text-center text-xs text-gray-500 mt-4">
            <p>Todos los planes incluyen garantía de satisfacción</p>
            <p>El servicio se activa inmediatamente después del pago</p>
          </div>
        </motion.div>
      )}
    </div>
  )
}