'use client'

import { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  Camera, 
  Scale, 
  Home, 
  Briefcase, 
  FileText, 
  Video,
  Users,
  Shield,
  Star,
  Check,
  ArrowRight,
  Clock,
  Award
} from 'lucide-react'
import Navigation from '@/components/Navigation'
import { useToast } from '@/components/Toast'

interface Service {
  id: string
  title: string
  description: string
  icon: any
  features: string[]
  price: number
  currency: string
  duration: string
  popular?: boolean
  category: string
}

const services: Service[] = [
  {
    id: 'photography',
    title: 'Fotografía Profesional',
    description: 'Sesión fotográfica profesional para tu propiedad con equipo de alta calidad',
    icon: Camera,
    category: 'visual',
    features: [
      '20-30 fotos profesionales editadas',
      'Fotografía con dron incluida',
      'Edición profesional HDR',
      'Entrega en 48 horas',
      'Licencia comercial completa'
    ],
    price: 2499,
    currency: 'MXN',
    duration: 'por sesión',
    popular: true
  },
  {
    id: 'legal',
    title: 'Asesoría Legal',
    description: 'Revisión completa de contratos y documentación legal por abogados especializados',
    icon: Scale,
    category: 'legal',
    features: [
      'Revisión de contratos de compraventa',
      'Verificación de documentos de propiedad',
      'Asesoría en procesos legales',
      'Consultas ilimitadas por 30 días',
      'Certificación notarial'
    ],
    price: 4999,
    currency: 'MXN',
    duration: 'por caso'
  },
  {
    id: 'virtual-tour',
    title: 'Tour Virtual 360°',
    description: 'Recorrido virtual interactivo de alta calidad para tus propiedades',
    icon: Video,
    category: 'visual',
    features: [
      'Tour virtual 360° completo',
      'Compatible con VR',
      'Hosting por 1 año incluido',
      'Integración con tu sitio web',
      'Estadísticas de visualización'
    ],
    price: 3499,
    currency: 'MXN',
    duration: 'por propiedad'
  },
  {
    id: 'home-staging',
    title: 'Home Staging',
    description: 'Diseño y decoración profesional para maximizar el atractivo de tu propiedad',
    icon: Home,
    category: 'staging',
    features: [
      'Consultoría de diseño interior',
      'Plan de staging personalizado',
      'Mobiliario y decoración',
      'Sesión fotográfica incluida',
      'Aumento promedio 15% en precio de venta'
    ],
    price: 8999,
    currency: 'MXN',
    duration: 'por proyecto'
  },
  {
    id: 'market-analysis',
    title: 'Análisis de Mercado',
    description: 'Estudio detallado del mercado inmobiliario para optimizar tu estrategia',
    icon: Briefcase,
    category: 'consulting',
    features: [
      'Análisis comparativo de mercado',
      'Valuación profesional',
      'Reporte detallado de 20+ páginas',
      'Estrategia de pricing',
      'Actualización trimestral'
    ],
    price: 2999,
    currency: 'MXN',
    duration: 'por reporte'
  },
  {
    id: 'documentation',
    title: 'Gestión Documental',
    description: 'Organización y digitalización completa de documentación inmobiliaria',
    icon: FileText,
    category: 'legal',
    features: [
      'Digitalización de documentos',
      'Organización en nube segura',
      'Verificación de autenticidad',
      'Acceso 24/7 a documentos',
      'Respaldo certificado'
    ],
    price: 1999,
    currency: 'MXN',
    duration: 'por propiedad'
  }
]

const categories = [
  { id: 'all', name: 'Todos', icon: Shield },
  { id: 'visual', name: 'Visual', icon: Camera },
  { id: 'legal', name: 'Legal', icon: Scale },
  { id: 'staging', name: 'Staging', icon: Home },
  { id: 'consulting', name: 'Consultoría', icon: Briefcase }
]

export default function Services() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const { showToast } = useToast()
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [showModal, setShowModal] = useState(false)

  const filteredServices = selectedCategory === 'all' 
    ? services 
    : services.filter(s => s.category === selectedCategory)

  const handleServiceSelect = (service: Service) => {
    if (!user) {
      showToast('Debes iniciar sesión para contratar servicios', 'warning')
      router.push('/sign-in')
      return
    }
    setSelectedService(service)
    setShowModal(true)
  }

  const handlePurchase = () => {
    if (selectedService) {
      router.push(`/services/checkout?service=${selectedService.id}`)
    }
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedService(null)
  }

  if (!isLoaded) {
    return <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0a0a' }}>
      <div className="loading-spinner"></div>
    </div>
  }

  return (
    <div className="min-h-screen" style={{ background: '#0a0a0a' }}>
      <Navigation />
      
      <main className="pt-20">
        <div className="section-container py-16">
          
          {/* Header */}
          <div className="text-center mb-16">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6"
              style={{ 
                background: 'rgba(255, 255, 255, 0.1)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            >
              <div className="w-1 h-1 rounded-full bg-white opacity-60"></div>
              Servicios Premium para Agencias
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-light mb-6"
              style={{ color: '#ffffff' }}
            >
              Potencia tu agencia con
              <span className="gradient-text"> servicios profesionales</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl max-w-3xl mx-auto"
              style={{ color: '#a3a3a3' }}
            >
              Trabajamos con los mejores profesionales certificados para ofrecerte 
              servicios de la más alta calidad que elevarán tu negocio inmobiliario
            </motion.p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {categories.map((category) => {
              const Icon = category.icon
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className="flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all"
                  style={{
                    background: selectedCategory === category.id 
                      ? 'rgba(255, 255, 255, 0.2)'
                      : 'rgba(255, 255, 255, 0.05)',
                    color: selectedCategory === category.id ? '#ffffff' : '#a3a3a3',
                    border: `1px solid ${selectedCategory === category.id ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)'}`
                  }}
                  onMouseEnter={(e) => {
                    if (selectedCategory !== category.id) {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                      e.currentTarget.style.color = '#ffffff'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedCategory !== category.id) {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                      e.currentTarget.style.color = '#a3a3a3'
                    }
                  }}
                >
                  <div className="w-1 h-1 rounded-full bg-current opacity-60"></div>
                  {category.name}
                </button>
              )
            })}
          </div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredServices.map((service, index) => {
              const Icon = service.icon
              return (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`glass-card overflow-hidden relative ${
                    service.popular ? 'ring-2 ring-white' : ''
                  }`}
                  whileHover={{ y: -4 }}
                >
                  {service.popular && (
                    <div className="absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1" style={{ 
                      background: 'linear-gradient(135deg, #ffffff, #e5e5e5)',
                      color: '#000000'
                    }}>
                      <div className="w-1 h-1 rounded-full bg-current opacity-60"></div>
                      Popular
                    </div>
                  )}
                  
                  <div className="p-8">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6" style={{ 
                      background: 'rgba(255, 255, 255, 0.1)'
                    }}>
                      <div className="w-2 h-2 rounded-full bg-white opacity-60"></div>
                    </div>
                    
                    <h3 className="text-2xl font-light mb-3" style={{ color: '#ffffff' }}>
                      {service.title}
                    </h3>
                    
                    <p className="mb-6" style={{ color: '#a3a3a3' }}>
                      {service.description}
                    </p>
                    
                    <div className="space-y-3 mb-8">
                      {service.features.map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <div className="w-1 h-1 rounded-full bg-white opacity-60 flex-shrink-0 mt-2"></div>
                          <span className="text-sm" style={{ color: '#a3a3a3' }}>{feature}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="border-t pt-6" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                      <div className="flex items-baseline gap-1 mb-4">
                        <span className="text-3xl font-light" style={{ color: '#ffffff' }}>
                          ${service.price.toLocaleString()}
                        </span>
                        <span style={{ color: '#666666' }}>
                          {service.currency} {service.duration}
                        </span>
                      </div>
                      
                      <button
                        onClick={() => handleServiceSelect(service)}
                        className="btn-primary w-full flex items-center justify-center gap-2"
                      >
                        Contratar Servicio
                        <ArrowRight size={18} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Trust Section */}
          <div className="mt-20 glass-card p-12">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-light mb-4" style={{ color: '#ffffff' }}>
                ¿Por qué elegir nuestros servicios?
              </h2>
              <p className="text-xl" style={{ color: '#a3a3a3' }}>
                Trabajamos solo con profesionales certificados y de alta calidad
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ 
                  background: 'rgba(255, 255, 255, 0.1)'
                }}>
                  <div className="w-2 h-2 rounded-full bg-white opacity-60"></div>
                </div>
                <h3 className="text-xl font-light mb-2" style={{ color: '#ffffff' }}>
                  Profesionales Verificados
                </h3>
                <p style={{ color: '#a3a3a3' }}>
                  Todos nuestros proveedores pasan por un riguroso proceso de selección
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ 
                  background: 'rgba(255, 255, 255, 0.1)'
                }}>
                  <div className="w-2 h-2 rounded-full bg-white opacity-60"></div>
                </div>
                <h3 className="text-xl font-light mb-2" style={{ color: '#ffffff' }}>
                  Entrega Garantizada
                </h3>
                <p style={{ color: '#a3a3a3' }}>
                  Cumplimos con los tiempos acordados o te devolvemos tu dinero
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ 
                  background: 'rgba(255, 255, 255, 0.1)'
                }}>
                  <div className="w-2 h-2 rounded-full bg-white opacity-60"></div>
                </div>
                <h3 className="text-xl font-light mb-2" style={{ color: '#ffffff' }}>
                  Soporte Dedicado
                </h3>
                <p style={{ color: '#a3a3a3' }}>
                  Acompañamiento durante todo el proceso con nuestro equipo experto
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Service Detail Modal */}
      {showModal && selectedService && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-8">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ 
                    background: 'rgba(255, 255, 255, 0.1)'
                  }}>
                    <div className="w-2 h-2 rounded-full bg-white opacity-60"></div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-light" style={{ color: '#ffffff' }}>
                      {selectedService.title}
                    </h3>
                    <p style={{ color: '#a3a3a3' }}>
                      {selectedService.description}
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeModal}
                  className="text-2xl transition-colors"
                  style={{ color: '#666666' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#ffffff'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#666666'}
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="font-light mb-3" style={{ color: '#ffffff' }}>
                    Características incluidas:
                  </h4>
                  <div className="space-y-2">
                    {selectedService.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <div className="w-1 h-1 rounded-full bg-white opacity-60 flex-shrink-0 mt-2"></div>
                        <span style={{ color: '#a3a3a3' }}>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-6" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <p className="mb-1" style={{ color: '#a3a3a3' }}>Precio del servicio</p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-light" style={{ color: '#ffffff' }}>
                          ${selectedService.price.toLocaleString()}
                        </span>
                        <span style={{ color: '#666666' }}>
                          {selectedService.currency} {selectedService.duration}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm" style={{ color: '#a3a3a3' }}>Tiempo de entrega</p>
                      <p className="font-light" style={{ color: '#ffffff' }}>48-72 horas</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={closeModal}
                      className="flex-1 py-3 px-4 rounded-xl font-light transition-colors"
                      style={{ 
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        background: 'rgba(255, 255, 255, 0.05)',
                        color: '#a3a3a3'
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
                      Cancelar
                    </button>
                    <button
                      onClick={handlePurchase}
                      className="btn-primary flex-1 flex items-center justify-center gap-2"
                    >
                      Continuar con el Pago
                      <ArrowRight size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}