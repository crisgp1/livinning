'use client'

import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { ArrowLeft, Plus, ExternalLink, TrendingUp, Clock, CheckCircle, Zap } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Navigation from '@/components/Navigation'
import ServiceOrders from '@/components/ServiceOrders'
import OrderStatus from '@/components/OrderStatus'
import { useToast } from '@/components/Toast'

const quickActions = [
  {
    id: 'photography',
    title: 'Fotografía',
    description: 'Sesión profesional',
    price: 'Desde $2,499',
    popular: true
  },
  {
    id: 'legal',
    title: 'Asesoría Legal',
    description: 'Revisión de contratos',
    price: 'Desde $4,999',
    popular: false
  },
  {
    id: 'virtual-tour',
    title: 'Tour Virtual',
    description: 'Recorrido 360°',
    price: 'Desde $3,499',
    popular: false
  },
  {
    id: 'market-analysis',
    title: 'Análisis de Mercado',
    description: 'Estudio detallado',
    price: 'Desde $2,999',
    popular: false
  }
]

export default function ServicesPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const { showToast } = useToast()
  const [isAgent, setIsAgent] = useState(false)
  const [stats, setStats] = useState({
    activeServices: 0,
    completedServices: 0,
    totalInvestment: 0,
    thisMonthServices: 0
  })
  const [isLoadingStats, setIsLoadingStats] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/sign-in')
    } else if (isLoaded && user) {
      // Check if user has completed onboarding
      const metadata = user.publicMetadata as any
      
      // Skip onboarding redirect if user has an organization (paid user)
      const hasOrganization = metadata?.organizationId || metadata?.isAgency
      
      if (!metadata?.onboardingCompleted && !hasOrganization) {
        router.push('/onboarding')
      } else {
        // Check if user is an agent
        const userRole = metadata?.role || (user as any).privateMetadata?.role
        setIsAgent(userRole === 'agent')
        
        // Fetch service stats if user is an agent
        if (userRole === 'agent') {
          fetchServiceStats()
        }
      }
    }
  }, [user, isLoaded, router])

  const fetchServiceStats = async () => {
    try {
      setIsLoadingStats(true)
      const response = await fetch('/api/services/stats')
      
      if (response.ok) {
        const data = await response.json()
        setStats(data.data || stats)
      }
    } catch (error) {
      console.error('Error fetching service stats:', error)
      showToast('Error al cargar estadísticas', 'error')
    } finally {
      setIsLoadingStats(false)
    }
  }

  const handleQuickAction = (serviceId: string) => {
    showToast('Redirigiendo al servicio...', 'info')
    router.push(`/services/checkout?service=${serviceId}`)
  }

  const getStatIcon = (type: string) => {
    switch (type) {
      case 'active':
        return <Clock className="w-5 h-5" />
      case 'completed':
        return <CheckCircle className="w-5 h-5" />
      case 'investment':
        return <TrendingUp className="w-5 h-5" />
      case 'month':
        return <Zap className="w-5 h-5" />
      default:
        return <div className="w-5 h-5 rounded-full bg-current opacity-60"></div>
    }
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-primary rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      <main className="pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div>
            
            {/* Header */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <button
                onClick={() => router.push('/dashboard')}
                className="inline-flex items-center gap-2 mb-6 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft size={20} />
                Volver al Dashboard
              </button>
              
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl lg:text-4xl font-light mb-2 text-gray-900">
                    Servicios
                  </h1>
                  <p className="text-lg text-gray-600">
                    Gestiona y contrata servicios profesionales
                  </p>
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => router.push('/services')}
                    className="btn-primary flex items-center gap-3"
                  >
                    <Plus size={20} />
                    Explorar Servicios
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Tab Navigation */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-8"
            >
              <div className="flex flex-wrap justify-center gap-2">
                {[
                  { id: 'overview', label: 'Resumen' },
                  { id: 'active', label: 'Activos' },
                  { id: 'history', label: 'Historial' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-6 py-3 rounded-xl text-sm font-medium transition-all ${
                      activeTab === tab.id 
                        ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                        : 'glass-icon-container hover:scale-105'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </motion.div>

            <AnimatePresence mode="wait">
              {activeTab === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-8"
                >
                  {/* Quick Stats */}
                  {isAgent && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      {[
                        { key: 'activeServices', label: 'Activos', type: 'active' },
                        { key: 'completedServices', label: 'Completados', type: 'completed' },
                        { key: 'totalInvestment', label: 'Inversión', type: 'investment', format: 'currency' },
                        { key: 'thisMonthServices', label: 'Este Mes', type: 'month' }
                      ].map((stat, index) => (
                        <motion.div
                          key={stat.key}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 + index * 0.1 }}
                          className="glass-card p-6 group"
                          whileHover={{ y: -4 }}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm mb-1 text-gray-600">{stat.label}</p>
                              <p className="text-2xl font-light text-gray-900">
                                {isLoadingStats ? (
                                  <div className="w-8 h-6 bg-gray-200 rounded animate-pulse"></div>
                                ) : (
                                  stat.format === 'currency' 
                                    ? `$${stats[stat.key as keyof typeof stats].toLocaleString()}`
                                    : stats[stat.key as keyof typeof stats]
                                )}
                              </p>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white">
                              {getStatIcon(stat.type)}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {/* Quick Actions */}
                  <div className="glass-icon-container rounded-2xl p-8">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-medium text-gray-900">Acciones Rápidas</h2>
                      <button
                        onClick={() => router.push('/services')}
                        className="text-sm text-primary hover:text-primary-hover font-medium"
                      >
                        Ver Todos
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {quickActions.map((action, index) => (
                        <motion.div
                          key={action.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4 + index * 0.1 }}
                          className="relative glass-icon-container rounded-xl p-4 cursor-pointer hover:shadow-xl transition-all"
                          onClick={() => handleQuickAction(action.id)}
                          whileHover={{ y: -4 }}
                        >
                          {action.popular && (
                            <div className="absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                              Popular
                            </div>
                          )}
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center mb-3">
                            <Zap className="w-6 h-6 text-white" />
                          </div>
                          <h3 className="font-medium mb-1 text-gray-900">{action.title}</h3>
                          <p className="text-sm mb-2 text-gray-600">{action.description}</p>
                          <p className="text-sm font-medium text-primary">{action.price}</p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'active' && (
                <motion.div
                  key="active"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <ServiceOrders />
                </motion.div>
              )}

              {activeTab === 'history' && (
                <motion.div
                  key="history"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="glass-icon-container rounded-2xl p-12 text-center">
                    <div className="w-16 h-16 mx-auto mb-6 glass rounded-2xl flex items-center justify-center">
                      <Clock className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium mb-2 text-gray-900">
                      Historial de Servicios
                    </h3>
                    <p className="text-sm text-gray-600">
                      Aquí aparecerá el historial completo de tus servicios
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  )
}