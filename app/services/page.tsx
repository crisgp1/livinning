'use client'

import { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
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
  Award,
  MapPin,
  X
} from 'lucide-react'
import AvailableProvidersList from '@/components/AvailableProvidersList'
import { useToast } from '@/components/Toast'
import { ServiceType } from '@/lib/domain/entities/ServiceOrder'
import Image from 'next/image'

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
  serviceType: ServiceType
}

interface AvailableProvider {
  id: string
  userId: string
  businessName: string
  description: string
  profileImageUrl?: string
  tier: 'basic' | 'premium' | 'elite'
  status: string
  isVerified: boolean
  rating: {
    averageRating: number
    totalReviews: number
  }
  location: {
    city: string
    state: string
    country: string
    distance?: number | null
  }
  service: {
    basePrice: number
    currency: string
    estimatedDuration: string
    availableSlots: number
    description: string
  } | null
  completedJobs: number
  responseTime: number
  portfolioImages: string[]
  isOnline: boolean
  lastActive: Date
}

const services: Service[] = [
  {
    id: 'photography',
    title: 'Fotografía Profesional',
    description: 'Sesión fotográfica profesional para tu propiedad con equipo de alta calidad',
    icon: Camera,
    category: 'visual',
    serviceType: ServiceType.PHOTOGRAPHY,
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
    serviceType: ServiceType.LEGAL,
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
    serviceType: ServiceType.VIRTUAL_TOUR,
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
    serviceType: ServiceType.HOME_STAGING,
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
    serviceType: ServiceType.MARKET_ANALYSIS,
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
    serviceType: ServiceType.DOCUMENTATION,
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
  const [selectedProvider, setSelectedProvider] = useState<AvailableProvider | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [showProviders, setShowProviders] = useState(false)
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | undefined>()

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

  const handleViewProviders = () => {
    if (selectedService) {
      setShowProviders(true)
      setShowModal(false)
      
      // Try to get user location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setUserLocation({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            })
          },
          (error) => {
            console.log('Location access denied or failed:', error)
          }
        )
      }
    }
  }

  const handleProviderSelect = (provider: AvailableProvider) => {
    setSelectedProvider(provider)
  }

  const handlePurchase = () => {
    if (selectedService) {
      const params = new URLSearchParams({
        service: selectedService.id
      })
      
      if (selectedProvider) {
        params.append('providerId', selectedProvider.id)
        params.append('providerName', selectedProvider.businessName)
        if (selectedProvider.service) {
          params.append('providerPrice', selectedProvider.service.basePrice.toString())
        }
      }
      
      router.push(`/services/checkout?${params.toString()}`)
    }
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedService(null)
  }

  const closeProviders = () => {
    setShowProviders(false)
    setSelectedProvider(null)
  }

  if (!isLoaded) {
    return <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-8 h-8 border-2 border-gray-200 border-t-primary rounded-full animate-spin"></div>
    </div>
  }

  return (
    <>
      <main className="pb-16 relative z-10">
        <div className="section-container py-16">
          
          {/* Header */}
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium mb-6 glass-icon-container"
            >
              <Award className="w-4 h-4 text-primary" />
              <span className="text-gray-700">Servicios Premium para Agencias</span>
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl font-light mb-6 text-gray-900"
            >
              Potencia tu agencia con
              <span className="text-primary font-medium"> servicios profesionales</span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl max-w-3xl mx-auto text-gray-600"
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
                  className={`flex items-center gap-3 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                    selectedCategory === category.id
                      ? 'bg-primary text-white shadow-lg shadow-primary/20'
                      : 'glass-icon-container text-gray-600 hover:text-gray-900 hover:bg-white/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
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
                  className={`glass-icon-container rounded-2xl overflow-hidden relative group hover:shadow-xl transition-all duration-300 ${
                    service.popular ? 'ring-2 ring-primary' : ''
                  }`}
                  whileHover={{ y: -4 }}
                >
                  {service.popular && (
                    <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-2 bg-primary text-white shadow-lg">
                      <Star className="w-3 h-3" />
                      Popular
                    </div>
                  )}
                  
                  <div className="p-8">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                      <Icon className="w-8 h-8 text-primary" />
                    </div>
                    
                    <h3 className="text-2xl font-light mb-3 text-gray-900">
                      {service.title}
                    </h3>
                    
                    <p className="mb-6 text-gray-600">
                      {service.description}
                    </p>
                    
                    <div className="space-y-3 mb-8">
                      {service.features.map((feature, idx) => (
                        <div key={`${service.id}-feature-${idx}`} className="flex items-start gap-3">
                          <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-gray-600">{feature}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="border-t border-gray-100 pt-6">
                      <div className="flex items-baseline gap-1 mb-4">
                        <span className="text-3xl font-light text-gray-900">
                          ${service.price.toLocaleString()}
                        </span>
                        <span className="text-gray-500">
                          {service.currency} {service.duration}
                        </span>
                      </div>
                      
                      <div className="space-y-3">
                        <button
                          onClick={() => handleServiceSelect(service)}
                          className="btn-primary w-full flex items-center justify-center gap-2 group"
                        >
                          Ver Proveedores Disponibles
                          <Users size={18} className="group-hover:scale-110 transition-transform" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedService(service)
                            router.push(`/services/checkout?service=${service.id}`)
                          }}
                          className="btn-secondary w-full flex items-center justify-center gap-2 group"
                        >
                          Contratar Directamente
                          <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Trust Section */}
          <div className="mt-20 glass-icon-container rounded-2xl p-12">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-light mb-4 text-gray-900">
                ¿Por qué elegir nuestros servicios?
              </h2>
              <p className="text-xl text-gray-600">
                Trabajamos solo con profesionales certificados y de alta calidad
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center group">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/10 to-blue-600/5 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Shield className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-light mb-3 text-gray-900">
                  Profesionales Verificados
                </h3>
                <p className="text-gray-600">
                  Todos nuestros proveedores pasan por un riguroso proceso de selección
                </p>
              </div>
              
              <div className="text-center group">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500/10 to-green-600/5 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Clock className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-light mb-3 text-gray-900">
                  Entrega Garantizada
                </h3>
                <p className="text-gray-600">
                  Cumplimos con los tiempos acordados o te devolvemos tu dinero
                </p>
              </div>
              
              <div className="text-center group">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/10 to-purple-600/5 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-light mb-3 text-gray-900">
                  Soporte Dedicado
                </h3>
                <p className="text-gray-600">
                  Acompañamiento durante todo el proceso con nuestro equipo experto
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Service Detail Modal */}
      {showModal && selectedService && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-icon-container rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-8">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                    {selectedService.icon && <selectedService.icon className="w-8 h-8 text-primary" />}
                  </div>
                  <div>
                    <h3 className="text-2xl font-light text-gray-900">
                      {selectedService.title}
                    </h3>
                    <p className="text-gray-600">
                      {selectedService.description}
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeModal}
                  className="w-8 h-8 rounded-lg glass flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="font-medium mb-4 text-gray-900">
                    Características incluidas:
                  </h4>
                  <div className="space-y-3">
                    {selectedService.features.map((feature, idx) => (
                      <div key={`modal-feature-${idx}`} className="flex items-start gap-3">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-600">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <p className="mb-1 text-gray-600">Precio base del servicio</p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-light text-gray-900">
                          ${selectedService.price.toLocaleString()}
                        </span>
                        <span className="text-gray-500">
                          {selectedService.currency} {selectedService.duration}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        *Los precios pueden variar según el proveedor seleccionado
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Tiempo estimado</p>
                      <p className="font-medium text-gray-900">48-72 horas</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={handleViewProviders}
                      className="btn-primary w-full flex items-center justify-center gap-2"
                    >
                      <Users size={18} />
                      Ver Proveedores Disponibles
                    </button>
                    <button
                      onClick={handlePurchase}
                      className="btn-secondary w-full flex items-center justify-center gap-2"
                    >
                      Continuar sin Proveedor Específico
                      <ArrowRight size={18} />
                    </button>
                    <button
                      onClick={closeModal}
                      className="w-full py-3 px-4 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Available Providers Modal */}
      <AnimatePresence>
        {showProviders && selectedService && (
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-icon-container rounded-2xl w-full max-w-4xl h-[80vh] flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                    {selectedService.icon && <selectedService.icon className="w-5 h-5 text-primary" />}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {selectedService.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Selecciona un proveedor para tu servicio
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeProviders}
                  className="w-8 h-8 rounded-lg glass flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Providers List */}
              <div className="flex-1 overflow-auto p-6">
                <AvailableProvidersList
                  serviceType={selectedService.serviceType}
                  userLocation={userLocation}
                  onProviderSelect={handleProviderSelect}
                  selectedProviderId={selectedProvider?.id}
                />
              </div>

              {/* Footer with selected provider info and action buttons */}
              {selectedProvider && (
                <div className="border-t border-gray-100 p-6">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-white shadow-sm">
                        {selectedProvider.profileImageUrl ? (
                          <Image
                            src={selectedProvider.profileImageUrl}
                            alt={selectedProvider.businessName}
                            width={48}
                            height={48}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                            <span className="text-primary font-medium">
                              {selectedProvider.businessName[0]}
                            </span>
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {selectedProvider.businessName}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span>{selectedProvider.rating.averageRating.toFixed(1)}</span>
                          <span>•</span>
                          <span>${selectedProvider.service?.basePrice.toLocaleString()} {selectedProvider.service?.currency}</span>
                          {selectedProvider.location.distance && (
                            <>
                              <span>•</span>
                              <MapPin className="w-3 h-3" />
                              <span>{selectedProvider.location.distance.toFixed(1)} km</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <button
                        onClick={closeProviders}
                        className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handlePurchase}
                        className="btn-primary flex items-center gap-2"
                      >
                        Continuar con {selectedProvider.businessName}
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}