'use client'

import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Globe,
  ExternalLink,
  Settings,
  Palette,
  Image,
  Type,
  BarChart3,
  Eye,
  Users,
  TrendingUp,
  Plus,
  Crown,
  Zap,
  CheckCircle,
  ArrowRight
} from 'lucide-react'

interface Microsite {
  id: string
  name: string
  subdomain: string
  customDomain?: string
  isActive: boolean
  theme: string
  propertiesCount: number
  views: number
  visits: number
  createdAt: string
  lastUpdated: string
}

export default function MicrositesPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [microsites, setMicrosites] = useState<Microsite[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (isLoaded && user) {
      fetchMicrosites()
    }
  }, [user, isLoaded])

  const fetchMicrosites = async () => {
    try {
      setIsLoading(true)
      // This would be a real API call
      // For now, we'll simulate with empty data since this is a new feature
      setMicrosites([])
    } catch (error) {
      console.error('Error fetching microsites:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateMicrosite = () => {
    // This would redirect to microsite creation flow
    alert('La funcionalidad de micrositios estará disponible próximamente en el plan Premium.')
  }

  if (!isLoaded || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-primary rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <main className="pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-8 lg:mb-12 mt-6 lg:mt-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 mb-4"
          >
            <div className="p-2 rounded-lg glass">
              <Globe className="w-5 h-5 text-blue-500" />
            </div>
            <span className="text-sm font-medium text-blue-600">Micrositios</span>
          </motion.div>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-3xl lg:text-4xl font-light mb-2 text-gray-900">
                Gestión de Micrositios
              </h1>
              <p className="text-lg text-gray-600">
                Crea sitios web personalizados para showcases tu portafolio de propiedades
              </p>
            </div>

            <motion.button
              onClick={handleCreateMicrosite}
              className="btn-primary flex items-center gap-3 justify-center"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Plus size={20} />
              Crear Micrositio
            </motion.button>
          </div>
        </div>

        {/* Feature Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-blue-100">
                <Globe className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-medium text-gray-900">Tu Propio Sitio Web</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Obtén un sitio web personalizado con tu propio dominio para mostrar todas tus propiedades de forma profesional.
            </p>
            <div className="text-xs text-blue-600 font-medium">
              Ejemplo: tusitio.livinning.com
            </div>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-purple-100">
                <Palette className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="font-medium text-gray-900">Diseño Personalizable</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Personaliza colores, tipografías, logotipo y diseño para que coincida con tu marca inmobiliaria.
            </p>
            <div className="flex gap-2">
              <div className="w-4 h-4 rounded-full bg-blue-500"></div>
              <div className="w-4 h-4 rounded-full bg-green-500"></div>
              <div className="w-4 h-4 rounded-full bg-purple-500"></div>
            </div>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-green-100">
                <BarChart3 className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="font-medium text-gray-900">Analytics Integrado</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Monitorea visitantes, páginas más vistas, consultas generadas y más métricas importantes.
            </p>
            <div className="text-xs text-green-600 font-medium">
              Dashboard en tiempo real
            </div>
          </div>
        </div>

        {/* Premium Feature Banner */}
        <div className="mb-8 glass-icon-container rounded-2xl p-8 bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Crown className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-xl font-medium text-gray-900">Función Premium</h3>
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                  Próximamente
                </span>
              </div>
              <p className="text-gray-600 mb-4">
                Los micrositios están disponibles en los planes Premium y Enterprise.
                Upgrade tu cuenta para acceder a esta funcionalidad avanzada.
              </p>
              <div className="flex items-center gap-4">
                <button className="btn-primary">
                  Upgrade a Premium
                </button>
                <button className="text-primary hover:text-primary-hover font-medium">
                  Ver Planes
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Empty State or Microsites List */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-gray-200 border-t-primary rounded-full animate-spin"></div>
          </div>
        ) : microsites.length === 0 ? (
          <div className="glass-icon-container rounded-2xl p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-6 glass rounded-2xl flex items-center justify-center">
              <Globe className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium mb-2 text-gray-900">
              No tienes micrositios creados
            </h3>
            <p className="text-sm mb-6 text-gray-600">
              Crea tu primer micrositio para tener una presencia web profesional con todas tus propiedades
            </p>
            <button
              onClick={handleCreateMicrosite}
              className="btn-primary shadow-lg shadow-primary/20"
            >
              Crear Mi Primer Micrositio
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <h2 className="text-xl font-medium text-gray-900">
              Mis Micrositios ({microsites.length})
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {microsites.map((microsite, index) => (
                <motion.div
                  key={microsite.id}
                  className="glass-icon-container rounded-2xl p-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-medium text-gray-900 mb-1">{microsite.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Globe size={14} />
                        <span>{microsite.subdomain}.livinning.com</span>
                        <ExternalLink size={12} />
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      microsite.isActive
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {microsite.isActive ? 'Activo' : 'Inactivo'}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-lg font-medium text-gray-900">{microsite.propertiesCount}</div>
                      <div className="text-xs text-gray-600">Propiedades</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-medium text-gray-900">{microsite.visits}</div>
                      <div className="text-xs text-gray-600">Visitas</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-medium text-gray-900">{microsite.views}</div>
                      <div className="text-xs text-gray-600">Páginas vistas</div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button className="flex-1 py-2 px-3 rounded-lg bg-white border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors">
                      <Settings size={14} className="inline mr-1" />
                      Configurar
                    </button>
                    <button className="flex-1 py-2 px-3 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-colors">
                      <ExternalLink size={14} className="inline mr-1" />
                      Ver Sitio
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Features Showcase */}
        <div className="mt-12 space-y-8">
          <h2 className="text-2xl font-medium text-gray-900 text-center">
            ¿Qué incluye tu micrositio?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Globe,
                title: 'Dominio Personalizado',
                description: 'Tu propio subdominio en Livinning o conecta tu dominio personalizado',
                color: 'from-blue-500 to-cyan-500'
              },
              {
                icon: Palette,
                title: 'Diseño Personalizable',
                description: 'Personaliza colores, fuentes y diseño para tu marca',
                color: 'from-purple-500 to-pink-500'
              },
              {
                icon: Image,
                title: 'Galería de Propiedades',
                description: 'Showcase automático de todas tus propiedades activas',
                color: 'from-green-500 to-emerald-500'
              },
              {
                icon: Users,
                title: 'Información de Contacto',
                description: 'Página de contacto integrada con formularios de consulta',
                color: 'from-orange-500 to-red-500'
              },
              {
                icon: BarChart3,
                title: 'Analytics Detallado',
                description: 'Estadísticas de visitas, consultas y rendimiento',
                color: 'from-indigo-500 to-purple-500'
              },
              {
                icon: Zap,
                title: 'SEO Optimizado',
                description: 'Optimizado para motores de búsqueda automáticamente',
                color: 'from-yellow-500 to-orange-500'
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                className="glass-card p-6 text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className={`w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-medium text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-12 glass-icon-container rounded-2xl p-8 text-center">
          <div className="max-w-2xl mx-auto">
            <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
              <Globe className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-medium mb-3 text-gray-900">
              ¿Listo para tener tu propio sitio web inmobiliario?
            </h3>
            <p className="text-gray-600 mb-6">
              Los micrositios te permiten tener una presencia web profesional y generar más consultas.
              Perfectos para agentes y agencias que quieren destacar.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => router.push('/upgrade-agency')}
                className="btn-primary shadow-lg shadow-primary/20"
              >
                Upgrade a Premium
              </button>
              <button className="btn-secondary">
                Ver Demo
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}