'use client'

import { motion } from 'framer-motion'
import { 
  Clock, 
  CheckCircle2, 
  Package,
  Truck,
  Home,
  XCircle
} from 'lucide-react'

interface OrderStatusProps {
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'
  serviceName: string
  orderDate: string
  estimatedDelivery?: string
  actualDelivery?: string
}

export default function OrderStatus({ 
  status, 
  serviceName, 
  orderDate, 
  estimatedDelivery,
  actualDelivery 
}: OrderStatusProps) {
  const statusSteps = [
    { 
      id: 'pending', 
      label: 'Pendiente', 
      icon: Clock,
      description: 'Esperando confirmación'
    },
    { 
      id: 'confirmed', 
      label: 'Confirmado', 
      icon: CheckCircle2,
      description: 'Pago procesado'
    },
    { 
      id: 'in_progress', 
      label: 'En Progreso', 
      icon: Package,
      description: 'Servicio en proceso'
    },
    { 
      id: 'completed', 
      label: 'Completado', 
      icon: Home,
      description: 'Servicio finalizado'
    }
  ]

  const getStatusIndex = () => {
    if (status === 'cancelled') return -1
    return statusSteps.findIndex(step => step.id === status)
  }

  const currentStepIndex = getStatusIndex()

  if (status === 'cancelled') {
    return (
      <div className="glass-card p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 rounded-full bg-red-100">
            <XCircle className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">{serviceName}</h3>
            <p className="text-sm text-red-600">Servicio cancelado</p>
          </div>
        </div>
        <p className="text-sm text-gray-600">
          Solicitado el {new Date(orderDate).toLocaleDateString('es-MX')}
        </p>
      </div>
    )
  }

  return (
    <div className="glass-card p-6">
      <div className="mb-6">
        <h3 className="font-medium text-gray-900 mb-2">{serviceName}</h3>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span>Solicitado: {new Date(orderDate).toLocaleDateString('es-MX')}</span>
          {estimatedDelivery && (
            <span>Entrega estimada: {estimatedDelivery}</span>
          )}
          {actualDelivery && (
            <span className="text-green-600">
              Entregado: {new Date(actualDelivery).toLocaleDateString('es-MX')}
            </span>
          )}
        </div>
      </div>

      <div className="relative">
        {/* Progress Line */}
        <div className="absolute top-5 left-5 right-5 h-0.5 bg-gray-200">
          <motion.div 
            className="h-full bg-primary"
            initial={{ width: '0%' }}
            animate={{ 
              width: `${currentStepIndex === -1 ? 0 : (currentStepIndex / (statusSteps.length - 1)) * 100}%` 
            }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          />
        </div>

        {/* Status Steps */}
        <div className="relative flex justify-between">
          {statusSteps.map((step, index) => {
            const isCompleted = index <= currentStepIndex
            const isCurrent = index === currentStepIndex
            const Icon = step.icon

            return (
              <motion.div 
                key={step.id} 
                className="flex flex-col items-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div 
                  className={`
                    relative z-10 w-10 h-10 rounded-full flex items-center justify-center
                    transition-all duration-300
                    ${isCompleted 
                      ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                      : 'bg-white border-2 border-gray-300 text-gray-400'
                    }
                    ${isCurrent ? 'scale-110 ring-4 ring-primary/20' : ''}
                  `}
                >
                  <Icon size={20} />
                  {isCurrent && (
                    <motion.div
                      className="absolute inset-0 rounded-full bg-primary/20"
                      initial={{ scale: 1, opacity: 1 }}
                      animate={{ scale: 2, opacity: 0 }}
                      transition={{ 
                        duration: 1.5, 
                        repeat: Infinity,
                        ease: 'easeOut'
                      }}
                    />
                  )}
                </div>
                <div className="mt-3 text-center">
                  <p className={`text-sm font-medium ${
                    isCompleted ? 'text-gray-900' : 'text-gray-500'
                  }`}>
                    {step.label}
                  </p>
                  <p className="text-xs text-gray-500 mt-1 hidden sm:block">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Additional Status Info */}
      {status === 'in_progress' && (
        <motion.div 
          className="mt-6 p-4 rounded-xl bg-blue-50 border border-blue-200"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-blue-600" />
            <p className="text-sm text-blue-700">
              Tu servicio está siendo procesado por nuestros profesionales
            </p>
          </div>
        </motion.div>
      )}

      {status === 'completed' && (
        <motion.div 
          className="mt-6 p-4 rounded-xl bg-green-50 border border-green-200"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <p className="text-sm text-green-700">
              ¡Servicio completado exitosamente!
            </p>
          </div>
        </motion.div>
      )}
    </div>
  )
}