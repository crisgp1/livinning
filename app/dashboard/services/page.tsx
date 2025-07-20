'use client'

import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ArrowLeft, Plus, ExternalLink, TrendingUp, Clock, CheckCircle, Zap } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Navigation from '@/components/Navigation'
import ServiceOrders from '@/components/ServiceOrders'
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
        return <Clock className="w-4 h-4" />
      case 'completed':
        return <CheckCircle className="w-4 h-4" />
      case 'investment':
        return <TrendingUp className="w-4 h-4" />
      case 'month':
        return <Zap className="w-4 h-4" />
      default:
        return <div className="w-4 h-4 rounded-full bg-current opacity-60"></div>
    }
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0a0a' }}>
        <div className="loading-spinner"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen" style={{ background: '#0a0a0a' }}>
      <Navigation />
      
      <main className="pt-20">
        <div className="section-container py-16">
          <div className="max-w-7xl mx-auto">
            
            {/* Header */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <button
                onClick={() => router.push('/dashboard')}
                className="inline-flex items-center gap-2 mb-6 transition-colors"
                style={{ color: '#666666' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#ffffff'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#666666'}
              >
                <ArrowLeft size={20} />
                Volver al Dashboard
              </button>
              
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-4xl font-light mb-2" style={{ color: '#ffffff' }}>
                    Servicios
                  </h1>
                  <p className="text-lg" style={{ color: '#a3a3a3' }}>
                    Gestiona y contrata servicios profesionales
                  </p>
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => router.push('/services')}
                    className="flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all"
                    style={{
                      background: 'rgba(255, 255, 255, 0.2)',
                      color: '#ffffff',
                      border: '1px solid rgba(255, 255, 255, 0.3)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.4)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)'
                    }}
                  >
                    <div className="w-1 h-1 rounded-full bg-current opacity-60"></div>
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
              <div className="flex flex-wrap justify-center gap-4">
                {[
                  { id: 'overview', label: 'Resumen' },
                  { id: 'active', label: 'Activos' },
                  { id: 'history', label: 'Historial' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className="flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all"
                    style={{
                      background: activeTab === tab.id 
                        ? 'rgba(255, 255, 255, 0.2)'
                        : 'rgba(255, 255, 255, 0.05)',
                      color: activeTab === tab.id ? '#ffffff' : '#a3a3a3',
                      border: `1px solid ${activeTab === tab.id ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)'}`
                    }}
                    onMouseEnter={(e) => {
                      if (activeTab !== tab.id) {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                        e.currentTarget.style.color = '#ffffff'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (activeTab !== tab.id) {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                        e.currentTarget.style.color = '#a3a3a3'
                      }
                    }}
                  >
                    <div className="w-1 h-1 rounded-full bg-current opacity-60"></div>
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
                          className="glass-card p-6 hover:scale-105 transition-transform"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm mb-1" style={{ color: '#a3a3a3' }}>{stat.label}</p>
                              <p className="text-2xl font-light" style={{ color: '#ffffff' }}>
                                {isLoadingStats ? (
                                  <div className="w-8 h-6 bg-white bg-opacity-10 rounded animate-pulse"></div>
                                ) : (
                                  stat.format === 'currency' 
                                    ? `$${stats[stat.key as keyof typeof stats].toLocaleString()}`
                                    : stats[stat.key as keyof typeof stats]
                                )}
                              </p>
                            </div>
                            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ 
                              background: 'rgba(255, 255, 255, 0.1)'
                            }}>
                              {getStatIcon(stat.type)}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {/* Quick Actions */}
                  <div className="glass-card p-8">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-light" style={{ color: '#ffffff' }}>Acciones Rápidas</h2>
                      <button
                        onClick={() => router.push('/services')}
                        className="flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all"
                        style={{
                          background: 'rgba(255, 255, 255, 0.05)',
                          color: '#a3a3a3',
                          border: '1px solid rgba(255, 255, 255, 0.1)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                          e.currentTarget.style.color = '#ffffff'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                          e.currentTarget.style.color = '#a3a3a3'
                        }}
                      >
                        <div className="w-1 h-1 rounded-full bg-current opacity-60"></div>
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
                          className="relative p-4 rounded-lg cursor-pointer transition-all hover:scale-105"
                          style={{ 
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)'
                          }}
                          onClick={() => handleQuickAction(action.id)}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                          }}
                        >
                          {action.popular && (
                            <div className="absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-light" style={{ 
                              background: 'linear-gradient(135deg, #ffffff, #e5e5e5)',
                              color: '#000000'
                            }}>
                              Popular
                            </div>
                          )}
                          <div className="w-8 h-8 rounded-full flex items-center justify-center mb-3" style={{ 
                            background: 'rgba(255, 255, 255, 0.1)'
                          }}>
                            <div className="w-2 h-2 rounded-full bg-white opacity-60"></div>
                          </div>
                          <h3 className="font-light mb-1" style={{ color: '#ffffff' }}>{action.title}</h3>
                          <p className="text-sm mb-2" style={{ color: '#a3a3a3' }}>{action.description}</p>
                          <p className="text-sm font-light" style={{ color: '#e5e5e5' }}>{action.price}</p>
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
                  <div className="glass-card p-8">
                    <ServiceOrders />
                  </div>
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
                  <div className="glass-card p-8">
                    <div className="text-center py-12">
                      <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ 
                        background: 'rgba(255, 255, 255, 0.1)'
                      }}>
                        <div className="w-2 h-2 rounded-full bg-white opacity-60"></div>
                      </div>
                      <h3 className="text-lg font-light mb-2" style={{ color: '#ffffff' }}>
                        Historial de Servicios
                      </h3>
                      <p style={{ color: '#a3a3a3' }}>
                        Aquí aparecerá el historial completo de tus servicios
                      </p>
                    </div>
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