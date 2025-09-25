'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import Navigation from '@/components/Navigation'
import { 
  Users, 
  Briefcase, 
  Settings, 
  CheckCircle,
  Calendar,
  BarChart3,
  Palette,
  HeadphonesIcon,
  Zap,
  Building2,
  ArrowRight,
  Camera,
  Video,
  Scale,
  Home,
  Star
} from 'lucide-react'

interface ServiceTier {
  name: string
  description: string
  features: string[]
  icon: React.ReactNode
  color: string
  popular?: boolean
}

const Services = () => {
  const router = useRouter()
  const { user } = useUser()
  const [activeTab, setActiveTab] = useState('consulting')
  const [showAccountModal, setShowAccountModal] = useState(false)

  const handleAccountCreation = () => {
    if (user) {
      setShowAccountModal(true)
    } else {
      router.push('/sign-up')
    }
  }

  const serviceTiers: ServiceTier[] = [
    {
      name: 'Premium',
      description: 'Consultoría personalizada para empresas en crecimiento',
      features: [
        'Gerente de cuenta dedicado',
        'Sesiones de estrategia mensuales',
        'Respuesta de soporte prioritaria',
        'Análisis de mercado personalizado',
        'Optimización de rendimiento'
      ],
      icon: <Briefcase className="w-6 h-6" />,
      color: '#006AFF',
      popular: true
    },
    {
      name: 'Enterprise',
      description: 'Soluciones completas de transformación empresarial',
      features: [
        'Equipo completo de consultores',
        'Reuniones de estrategia semanales',
        'Soporte dedicado 24/7',
        'Panel de análisis avanzado',
        'Integraciones personalizadas',
        'Opciones de marca blanca'
      ],
      icon: <Building2 className="w-6 h-6" />,
      color: '#28a745'
    }
  ]

  const digitalServices = [
    {
      id: 'direct-services',
      title: 'Servicios Directos',
      description: 'Acceso directo a nuestros servicios profesionales más demandados',
      icon: <Zap className="w-8 h-8" />,
      features: [
        'Fotografía profesional inmobiliaria',
        'Tours virtuales 360°',
        'Asesoría legal especializada',
        'Análisis de mercado detallado'
      ]
    },
    {
      id: 'user-types',
      title: 'Tipos de Usuario',
      description: 'Descubre qué tipo de cuenta se adapta mejor a tus necesidades',
      icon: <Users className="w-8 h-8" />,
      features: [
        'Cuenta Propietario',
        'Cuenta Inmobiliaria',
        'Cuenta Proveedor de Servicios',
        'Cuenta Agencia Premium'
      ]
    },
    {
      id: 'consulting',
      title: 'Consultoría Personalizada',
      description: 'Orientación experta adaptada a las necesidades de tu negocio',
      icon: <Briefcase className="w-8 h-8" />,
      features: [
        'Análisis e insights del mercado',
        'Desarrollo de estrategias de crecimiento',
        'Optimización del rendimiento',
        'Evaluación y mitigación de riesgos'
      ]
    },
    {
      id: 'contracting',
      title: 'Servicios Profesionales de Un Clic',
      description: 'Acceso instantáneo a profesionales verificados con seguimiento en tiempo real',
      icon: <Settings className="w-8 h-8" />,
      features: [
        'Reserva instantánea de servicios',
        'Red de profesionales verificados',
        'Seguimiento de estado en tiempo real',
        'Facturación automatizada'
      ]
    }
  ]

  const contractingServices = [
    { name: 'Servicios Legales', time: '24h', available: true },
    { name: 'Contabilidad y Finanzas', time: '48h', available: true },
    { name: 'Especialistas en Marketing', time: '24h', available: true },
    { name: 'Consultores IT', time: 'Inmediato', available: true },
    { name: 'Gestión de Propiedades', time: '48h', available: true },
    { name: 'Arquitectura y Diseño', time: '72h', available: true }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Navigation />
      
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary/10 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full filter blur-3xl"></div>
      </div>

      <main className="pt-20 relative z-10">
        <div className="container mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              Servicios Digitales de Livinning
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Transforma tu negocio con nuestra completa suite de servicios digitales
            </p>
          </motion.div>

          <div className="mb-16">
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              {digitalServices.map((service) => (
                <motion.button
                  key={service.id}
                  onClick={() => setActiveTab(service.id)}
                  className={`px-6 py-3 rounded-full font-medium transition-all ${
                    activeTab === service.id
                      ? 'bg-primary text-white shadow-lg'
                      : 'bg-white text-gray-700 hover:bg-gray-100 shadow-md'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {service.title}
                </motion.button>
              ))}
            </div>

            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="glass-card p-8 rounded-2xl max-w-4xl mx-auto"
            >
              {activeTab === 'direct-services' && (
                <div className="space-y-8">
                  <div className="text-center mb-8">
                    <div className="glass-icon-container w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                      <Zap className="w-10 h-10 text-primary" />
                    </div>
                    <h2 className="text-3xl font-bold mb-4">Servicios Directos</h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                      Accede directamente a nuestros servicios profesionales más demandados para potenciar tu negocio inmobiliario
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="glass-card p-6 rounded-xl hover:shadow-xl transition-all cursor-pointer group"
                      onClick={() => router.push('/services')}
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <Camera className="w-8 h-8 text-primary" />
                        <h3 className="text-xl font-bold">Fotografía Profesional</h3>
                      </div>
                      <p className="text-gray-600 mb-4">Sesiones fotográficas profesionales con dron incluido</p>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-primary">$2,499 MXN</span>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="glass-card p-6 rounded-xl hover:shadow-xl transition-all cursor-pointer group"
                      onClick={() => router.push('/services')}
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <Video className="w-8 h-8 text-primary" />
                        <h3 className="text-xl font-bold">Tours Virtuales 360°</h3>
                      </div>
                      <p className="text-gray-600 mb-4">Recorridos virtuales interactivos de alta calidad</p>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-primary">$3,499 MXN</span>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="glass-card p-6 rounded-xl hover:shadow-xl transition-all cursor-pointer group"
                      onClick={() => router.push('/services')}
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <Scale className="w-8 h-8 text-primary" />
                        <h3 className="text-xl font-bold">Asesoría Legal</h3>
                      </div>
                      <p className="text-gray-600 mb-4">Revisión completa de contratos y documentación</p>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-primary">$4,999 MXN</span>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="glass-card p-6 rounded-xl hover:shadow-xl transition-all cursor-pointer group"
                      onClick={() => router.push('/services')}
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <BarChart3 className="w-8 h-8 text-primary" />
                        <h3 className="text-xl font-bold">Análisis de Mercado</h3>
                      </div>
                      <p className="text-gray-600 mb-4">Estudio detallado del mercado inmobiliario</p>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-primary">$2,999 MXN</span>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </motion.div>
                  </div>

                  <div className="text-center mt-8">
                    <button 
                      onClick={() => router.push('/services')}
                      className="btn-primary px-8 py-3"
                    >
                      Ver Todos los Servicios
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'user-types' && (
                <div className="space-y-8">
                  <div className="text-center mb-8">
                    <div className="glass-icon-container w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                      <Users className="w-10 h-10 text-primary" />
                    </div>
                    <h2 className="text-3xl font-bold mb-4">Tipos de Usuario</h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                      Elige el tipo de cuenta que mejor se adapte a tus necesidades y objetivos profesionales
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="glass-card p-6 rounded-xl border-2 border-transparent hover:border-primary transition-all"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <Home className="w-8 h-8 text-blue-500" />
                        <h3 className="text-xl font-bold">Propietario</h3>
                      </div>
                      <p className="text-gray-600 mb-4">Para personas que buscan vender o rentar sus propiedades</p>
                      <ul className="space-y-2 mb-6">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm">Publicaciones ilimitadas</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm">Herramientas de promoción</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm">Soporte especializado</span>
                        </li>
                      </ul>
                      <button 
                        onClick={handleAccountCreation}
                        className="btn-primary w-full"
                      >
                        Crear Cuenta Propietario
                      </button>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="glass-card p-6 rounded-xl border-2 border-transparent hover:border-primary transition-all"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <Building2 className="w-8 h-8 text-purple-500" />
                        <h3 className="text-xl font-bold">Inmobiliaria</h3>
                      </div>
                      <p className="text-gray-600 mb-4">Para agencias y corredores inmobiliarios profesionales</p>
                      <ul className="space-y-2 mb-6">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm">Dashboard avanzado</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm">CRM integrado</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm">Análiticas detalladas</span>
                        </li>
                      </ul>
                      <button 
                        onClick={handleAccountCreation}
                        className="btn-primary w-full"
                      >
                        Crear Cuenta Inmobiliaria
                      </button>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="glass-card p-6 rounded-xl border-2 border-transparent hover:border-primary transition-all"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <Briefcase className="w-8 h-8 text-green-500" />
                        <h3 className="text-xl font-bold">Proveedor de Servicios</h3>
                      </div>
                      <p className="text-gray-600 mb-4">Para profesionales que ofrecen servicios inmobiliarios</p>
                      <ul className="space-y-2 mb-6">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm">Perfil profesional</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm">Sistema de pedidos</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm">Tracking de trabajos</span>
                        </li>
                      </ul>
                      <button 
                        onClick={handleAccountCreation}
                        className="btn-primary w-full"
                      >
                        Crear Cuenta Proveedor
                      </button>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="glass-card p-6 rounded-xl border-2 border-primary hover:shadow-xl transition-all"
                    >
                      <div className="bg-primary text-white text-sm px-3 py-1 rounded-full inline-block mb-4">
                        Premium
                      </div>
                      <div className="flex items-center gap-3 mb-4">
                        <Star className="w-8 h-8 text-yellow-500" />
                        <h3 className="text-xl font-bold">Agencia Premium</h3>
                      </div>
                      <p className="text-gray-600 mb-4">Para agencias de alto volumen con necesidades avanzadas</p>
                      <ul className="space-y-2 mb-6">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm">Características ilimitadas</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm">Soporte prioritario 24/7</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm">API personalizada</span>
                        </li>
                      </ul>
                      <button 
                        onClick={handleAccountCreation}
                        className="btn-primary w-full"
                      >
                        Crear Cuenta Premium
                      </button>
                    </motion.div>
                  </div>

                  <div className="text-center mt-8">
                    <p className="text-gray-600 mb-4">¿No estás seguro qué tipo de cuenta necesitas?</p>
                    <button 
                      onClick={() => router.push('/contacto')}
                      className="btn-outline px-8 py-3"
                    >
                      Hablar con un Experto
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'consulting' && (
                <div className="space-y-8">
                  <div className="text-center mb-8">
                    <div className="glass-icon-container w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                      <Users className="w-10 h-10 text-primary" />
                    </div>
                    <h2 className="text-3xl font-bold mb-4">Consultoría Personalizada</h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                      Obtén orientación experta con nuestros servicios de consultoría nivel Premium y Enterprise
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    {serviceTiers.map((tier, index) => (
                      <motion.div
                        key={tier.name}
                        initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.2 }}
                        className={`glass-card p-6 rounded-xl border-2 ${
                          tier.popular ? 'border-primary' : 'border-transparent'
                        } hover:shadow-xl transition-all`}
                      >
                        {tier.popular && (
                          <div className="bg-primary text-white text-sm px-3 py-1 rounded-full inline-block mb-4">
                            Más Popular
                          </div>
                        )}
                        <div className="flex items-center gap-3 mb-4">
                          <div className="glass-icon-container w-12 h-12 flex items-center justify-center" style={{ backgroundColor: `${tier.color}20` }}>
                            {tier.icon}
                          </div>
                          <h3 className="text-2xl font-bold">{tier.name}</h3>
                        </div>
                        <p className="text-gray-600 mb-6">{tier.description}</p>
                        <ul className="space-y-3">
                          {tier.features.map((feature, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                              <span className="text-gray-700">{feature}</span>
                            </li>
                          ))}
                        </ul>
                        <button 
                          onClick={handleAccountCreation}
                          className="btn-primary w-full mt-6"
                        >
                          Comenzar
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'contracting' && (
                <div className="space-y-8">
                  <div className="text-center mb-8">
                    <div className="glass-icon-container w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                      <Zap className="w-10 h-10 text-primary" />
                    </div>
                    <h2 className="text-3xl font-bold mb-4">Servicios Profesionales de Un Clic</h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                      Conéctate con profesionales verificados al instante y rastrea tus proyectos en tiempo real
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    {contractingServices.map((service, index) => (
                      <motion.div
                        key={service.name}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="glass-card p-4 rounded-lg hover:shadow-md transition-all cursor-pointer group"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <span className="font-medium">{service.name}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Calendar className="w-4 h-4" />
                            <span>{service.time}</span>
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <div className="bg-primary/10 rounded-xl p-6 mt-8">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <BarChart3 className="w-6 h-6" />
                      Panel de Seguimiento en Tiempo Real
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="glass-card p-4 rounded-lg">
                        <div className="text-3xl font-bold text-primary">24/7</div>
                        <div className="text-sm text-gray-600">Monitoreo de Proyectos</div>
                      </div>
                      <div className="glass-card p-4 rounded-lg">
                        <div className="text-3xl font-bold text-primary">95%</div>
                        <div className="text-sm text-gray-600">Finalización a Tiempo</div>
                      </div>
                      <div className="glass-card p-4 rounded-lg">
                        <div className="text-3xl font-bold text-primary">4.9★</div>
                        <div className="text-sm text-gray-600">Calificación Promedio</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </motion.div>
          </div>

        </div>
      </main>

      {/* Account Already Exists Modal */}
      {showAccountModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-icon-container rounded-2xl max-w-md w-full p-8"
          >
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-primary" />
              </div>
              
              <h3 className="text-2xl font-bold mb-4 text-gray-900">
                Ya tienes una cuenta
              </h3>
              
              <p className="text-gray-600 mb-8">
                Ya estás registrado en Livinning. ¿Te gustaría contactarnos para obtener más información o continuar navegando?
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setShowAccountModal(false)
                    router.push('/contacto')
                  }}
                  className="btn-primary w-full"
                >
                  Contactarnos
                </button>
                
                <button
                  onClick={() => setShowAccountModal(false)}
                  className="btn-outline w-full"
                >
                  Continuar Navegando
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default Services