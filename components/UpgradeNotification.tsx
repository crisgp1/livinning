'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Star, CheckCircle } from 'lucide-react'
import { useUser } from '@clerk/nextjs'

export default function UpgradeNotification() {
  const { user } = useUser()
  const [showNotification, setShowNotification] = useState(false)
  const [hasShown, setHasShown] = useState(false)

  useEffect(() => {
    if (user && !hasShown) {
      const metadata = user.publicMetadata as any
      const isAutoUpgraded = metadata?.autoUpgraded === true
      const upgradeReason = metadata?.autoUpgradeReason
      const role = metadata?.role
      
      // Show notification if user was auto-upgraded and we haven't shown it yet
      if (isAutoUpgraded && upgradeReason === 'first_property_published' && role === 'agent') {
        // Check if we've already shown this notification in this session
        const notificationKey = `upgrade_notification_shown_${user.id}`
        const alreadyShown = sessionStorage.getItem(notificationKey)
        
        if (!alreadyShown) {
          setShowNotification(true)
          setHasShown(true)
          sessionStorage.setItem(notificationKey, 'true')
        }
      }
    }
  }, [user, hasShown])

  const handleClose = () => {
    setShowNotification(false)
  }

  const handleViewDashboard = () => {
    setShowNotification(false)
    window.location.href = '/dashboard'
  }

  if (!showNotification) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 20 }}
        className="fixed top-24 right-6 z-50 max-w-sm"
      >
        <div className="glass-icon-container rounded-2xl p-6 shadow-2xl border border-green-200">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                <Star className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">¡Felicidades!</h3>
                <p className="text-sm text-gray-600">Has sido promovido</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Content */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle size={16} className="text-green-500" />
              <span className="text-sm font-medium text-gray-900">
                Ahora eres un Agente
              </span>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              Al publicar tu primera propiedad, has sido automáticamente promovido a 
              <span className="font-medium text-green-600"> Agente Inmobiliario</span>. 
              Ahora tienes acceso a funciones avanzadas y herramientas profesionales.
            </p>
          </div>

          {/* Benefits */}
          <div className="mb-6">
            <p className="text-xs font-medium text-gray-700 mb-2">Beneficios incluidos:</p>
            <ul className="space-y-1 text-xs text-gray-600">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                Dashboard profesional completo
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                Gestión avanzada de propiedades
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                Analytics y estadísticas detalladas
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                Herramientas de gestión de equipo
              </li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={handleViewDashboard}
              className="flex-1 py-2 px-3 rounded-xl bg-green-500 text-white text-sm font-medium hover:bg-green-600 transition-colors"
            >
              Ver Dashboard
            </button>
            <button
              onClick={handleClose}
              className="px-3 py-2 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}