'use client'

import { useAuth, useUser } from '@clerk/nextjs'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import ProviderServicesList from '@/components/ProviderServicesList'
import { canAccessProviderDashboard, getProviderDisplayName } from '@/lib/utils/provider-helpers'

export default function ProviderDashboard() {
  const { isLoaded, userId } = useAuth()
  const { user } = useUser()
  const router = useRouter()
  const [hasAccess, setHasAccess] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkProviderAccess = async () => {
      if (!isLoaded) {
        return
      }

      if (!userId) {
        router.push('/')
        return
      }

      try {
        const providerAccess = canAccessProviderDashboard(user)
        
        if (!providerAccess) {
          router.push('/dashboard')
          return
        }

        setHasAccess(true)
      } catch (error) {
        console.error('Error checking provider access:', error)
        router.push('/dashboard')
      } finally {
        setLoading(false)
      }
    }

    checkProviderAccess()
  }, [isLoaded, userId, user, router])

  if (loading || !isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Acceso Denegado</h1>
          <p className="text-gray-600 mb-6">No tienes permisos para acceder al dashboard de proveedores.</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Volver al Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Dashboard de Proveedor</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Bienvenido, {getProviderDisplayName(user)}
              </div>
              <button
                onClick={() => router.push('/dashboard')}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Dashboard Principal
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-2">Mis Servicios Asignados</h2>
          <p className="text-sm text-gray-600">
            Consulta todos los servicios que te han sido asignados a través de la plataforma Livinning.com.
            Puedes filtrar por estado, tipo de servicio y fechas para encontrar rápidamente lo que necesitas.
          </p>
        </div>

        <ProviderServicesList />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              © 2024 Livinning.com - Dashboard de Proveedores
            </div>
            <div className="flex space-x-6">
              <a href="/contacto" className="text-sm text-gray-500 hover:text-gray-900">
                Soporte
              </a>
              <a href="/ayuda" className="text-sm text-gray-500 hover:text-gray-900">
                Ayuda
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}