'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import ServiceTrackingList from '@/components/ServiceTrackingList'
import { useAuthContext } from '@/components/providers/AuthProvider'

export default function ProviderDashboard() {
  const { user, isLoaded, hasProviderAccess, displayName } = useAuthContext()
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAccess = async () => {
      if (!isLoaded) return

      if (!user) {
        router.push('/')
        return
      }

      if (!hasProviderAccess) {
        router.push('/dashboard')
        return
      }

      setLoading(false)
    }

    checkAccess()
  }, [isLoaded, user, hasProviderAccess, router])

  if (loading || !isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!hasProviderAccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Acceso Denegado</h1>
          <p className="text-gray-600 mb-6">No tienes permisos para acceder al dashboard de proveedores.</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Ir al Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <main className="pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 lg:mb-12 mt-6 lg:mt-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium mb-6 glass-icon-container"
              >
                <div className="w-4 h-4 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
                <span className="text-gray-700">Panel de Proveedor</span>
              </motion.div>
              <h1 className="text-4xl md:text-6xl font-light mb-6 text-gray-900">
                Bienvenido, <span className="text-gray-700 font-medium">{displayName}</span>
              </h1>
              <p className="text-xl max-w-3xl text-gray-600 mb-8">
                Gestiona tus servicios y órdenes de trabajo con las herramientas profesionales de la plataforma
              </p>
            </div>
          </div>
        </div>

        {/* Service Tracking Section */}
        <div className="mb-8 lg:mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-light mb-2 text-gray-900">
              Seguimiento de Servicios
            </h2>
            <p className="text-gray-600">
              Gestiona el progreso, incidencias y comunicación de tus servicios activos
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <ServiceTrackingList />
          </motion.div>
        </div>
      </div>
    </main>
  )
}