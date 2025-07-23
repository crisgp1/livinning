'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
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
  ArrowRight
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
  const [activeTab, setActiveTab] = useState('consulting')

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
      id: 'consulting',
      title: 'Consultoría Personalizada',
      description: 'Orientación experta adaptada a las necesidades de tu negocio',
      icon: <Users className="w-8 h-8" />,
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
      icon: <Zap className="w-8 h-8" />,
      features: [
        'Reserva instantánea de servicios',
        'Red de profesionales verificados',
        'Seguimiento de estado en tiempo real',
        'Facturación automatizada'
      ]
    },
    {
      id: 'customization',
      title: 'Personalización Dedicada de Tienda',
      description: 'Soluciones adaptadas para cada escala de negocio',
      icon: <Palette className="w-8 h-8" />,
      features: [
        'Opciones de marca personalizadas',
        'Diseños de layout flexibles',
        'Infraestructura escalable',
        'Integraciones de API'
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
                        <button className="btn-primary w-full mt-6">
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

              {activeTab === 'customization' && (
                <div className="space-y-8">
                  <div className="text-center mb-8">
                    <div className="glass-icon-container w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                      <Palette className="w-10 h-10 text-primary" />
                    </div>
                    <h2 className="text-3xl font-bold mb-4">Personalización Dedicada de Tienda</h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                      Desde soporte limitado hasta amplio, adaptamos soluciones para satisfacer tus necesidades exactas
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-4"
                    >
                      <h3 className="text-xl font-bold flex items-center gap-2">
                        <Settings className="w-5 h-5" />
                        Soporte Limitado
                      </h3>
                      <div className="glass-card p-6 rounded-xl space-y-3">
                        <div className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-primary mt-0.5" />
                          <div>
                            <div className="font-medium">Marca Básica</div>
                            <div className="text-sm text-gray-600">Logo, colores y tipografía</div>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-primary mt-0.5" />
                          <div>
                            <div className="font-medium">Plantillas Prediseñadas</div>
                            <div className="text-sm text-gray-600">Elige de nuestra biblioteca de diseños</div>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-primary mt-0.5" />
                          <div>
                            <div className="font-medium">Características Estándar</div>
                            <div className="text-sm text-gray-600">Herramientas esenciales e integraciones</div>
                          </div>
                        </div>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-4"
                    >
                      <h3 className="text-xl font-bold flex items-center gap-2">
                        <HeadphonesIcon className="w-5 h-5" />
                        Soporte Amplio
                      </h3>
                      <div className="glass-card p-6 rounded-xl space-y-3">
                        <div className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                          <div>
                            <div className="font-medium">Personalización Completa</div>
                            <div className="text-sm text-gray-600">Libertad total de diseño</div>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                          <div>
                            <div className="font-medium">Desarrollo Personalizado</div>
                            <div className="text-sm text-gray-600">Características y flujos de trabajo adaptados</div>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                          <div>
                            <div className="font-medium">Equipo Dedicado</div>
                            <div className="text-sm text-gray-600">Soporte personal y mantenimiento</div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  <div className="text-center mt-8">
                    <button className="btn-primary px-8 py-3">
                      Comenzar a Personalizar tu Tienda
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center mt-16 glass-card p-8 rounded-2xl max-w-2xl mx-auto"
          >
            <h2 className="text-3xl font-bold mb-4">¿Listo para Transformar tu Negocio?</h2>
            <p className="text-gray-600 mb-6">
              Únete a miles de empresas que ya utilizan los servicios digitales de Livinning
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="btn-primary px-8 py-3">
                Comenzar Hoy
              </button>
              <button className="btn-outline px-8 py-3">
                Programar Demo
              </button>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  )
}

export default Services