import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { connectToDatabase } from '@/lib/infrastructure/database/connection'
import ServiceSettingsModel from '@/lib/infrastructure/database/models/ServiceSettingsModel'
import { isSuperAdmin } from '@/lib/utils/superadmin'

export async function GET() {
  try {
    const { userId } = auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!await isSuperAdmin(userId)) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    await connectToDatabase()

    let serviceSettings = await ServiceSettingsModel.findOne({ _id: 'global' })

    // Create default settings if none exist
    if (!serviceSettings) {
      serviceSettings = new ServiceSettingsModel({
        _id: 'global',
        pageSettings: {
          title: 'Servicios Digitales de Livinning',
          subtitle: 'Transforma tu negocio con nuestra completa suite de servicios digitales',
          description: 'Ofrecemos soluciones completas para el sector inmobiliario con tecnología de vanguardia'
        },
        categories: [
          {
            id: 'direct-services',
            title: 'Servicios Directos',
            description: 'Acceso directo a nuestros servicios profesionales más demandados',
            icon: 'Zap',
            isEnabled: true,
            order: 1,
            features: [
              'Fotografía profesional inmobiliaria',
              'Tours virtuales 360°',
              'Asesoría legal especializada',
              'Análisis de mercado detallado'
            ],
            tiers: [
              {
                id: 'photography',
                name: 'Fotografía Profesional',
                description: 'Sesiones fotográficas profesionales con dron incluido',
                price: {
                  amount: 2499,
                  currency: 'MXN',
                  isVisible: true
                },
                features: [
                  {
                    id: 'professional-photos',
                    title: 'Fotografías de alta resolución',
                    isIncluded: true,
                    order: 1
                  },
                  {
                    id: 'drone-included',
                    title: 'Fotografía con dron incluida',
                    isIncluded: true,
                    order: 2
                  }
                ],
                icon: 'Camera',
                color: '#ff385c',
                isPopular: false,
                isEnabled: true,
                order: 1,
                callToAction: {
                  text: 'Contratar Servicio',
                  href: '/services',
                  action: 'redirect'
                }
              },
              {
                id: 'virtual-tour',
                name: 'Tours Virtuales 360°',
                description: 'Recorridos virtuales interactivos de alta calidad',
                price: {
                  amount: 3499,
                  currency: 'MXN',
                  isVisible: true
                },
                features: [
                  {
                    id: 'virtual-tour',
                    title: 'Tour virtual completo',
                    isIncluded: true,
                    order: 1
                  }
                ],
                icon: 'Video',
                color: '#ff385c',
                isPopular: false,
                isEnabled: true,
                order: 2,
                callToAction: {
                  text: 'Contratar Servicio',
                  href: '/services',
                  action: 'redirect'
                }
              }
            ]
          },
          {
            id: 'consulting',
            title: 'Consultoría Personalizada',
            description: 'Orientación experta adaptada a las necesidades de tu negocio',
            icon: 'Briefcase',
            isEnabled: true,
            order: 2,
            features: [
              'Análisis e insights del mercado',
              'Desarrollo de estrategias de crecimiento',
              'Optimización del rendimiento',
              'Evaluación y mitigación de riesgos'
            ],
            tiers: [
              {
                id: 'premium',
                name: 'Premium',
                description: 'Consultoría personalizada para empresas en crecimiento',
                price: {
                  amount: 0,
                  currency: 'MXN',
                  isVisible: false
                },
                features: [
                  {
                    id: 'dedicated-manager',
                    title: 'Gerente de cuenta dedicado',
                    isIncluded: true,
                    order: 1
                  },
                  {
                    id: 'monthly-strategy',
                    title: 'Sesiones de estrategia mensuales',
                    isIncluded: true,
                    order: 2
                  }
                ],
                icon: 'Briefcase',
                color: '#006AFF',
                isPopular: true,
                isEnabled: true,
                order: 1,
                callToAction: {
                  text: 'Comenzar',
                  action: 'contact'
                }
              }
            ]
          }
        ],
        contractingServices: [
          {
            id: 'legal',
            name: 'Servicios Legales',
            estimatedTime: '24h',
            isAvailable: true,
            category: 'legal',
            order: 1
          },
          {
            id: 'accounting',
            name: 'Contabilidad y Finanzas',
            estimatedTime: '48h',
            isAvailable: true,
            category: 'finance',
            order: 2
          }
        ],
        pricingDisplay: {
          showPrices: true,
          currency: 'MXN',
          priceFormat: 'before',
          showPeriod: true,
          showDiscount: false
        },
        contactSettings: {
          showContactForm: true,
          showConsultationBooking: true,
          consultationLabel: 'Hablar con un Experto',
          contactButtonText: 'Contactarnos',
          expertConsultationText: '¿No estás seguro qué tipo de cuenta necesitas?'
        },
        trackingSettings: {
          enableRealTimeTracking: true,
          showProjectStats: true,
          stats: {
            monitoringLabel: 'Monitoreo de Proyectos',
            completionRateLabel: 'Finalización a Tiempo',
            avgRatingLabel: 'Calificación Promedio',
            monitoringValue: '24/7',
            completionRateValue: '95%',
            avgRatingValue: '4.9★'
          }
        },
        accountTypes: {
          owner: {
            name: 'Propietario',
            description: 'Para personas que buscan vender o rentar sus propiedades',
            features: ['Publicaciones ilimitadas', 'Herramientas de promoción', 'Soporte especializado'],
            buttonText: 'Crear Cuenta Propietario',
            isEnabled: true
          },
          realEstate: {
            name: 'Inmobiliaria',
            description: 'Para agencias y corredores inmobiliarios profesionales',
            features: ['Dashboard avanzado', 'CRM integrado', 'Análiticas detalladas'],
            buttonText: 'Crear Cuenta Inmobiliaria',
            isEnabled: true
          },
          provider: {
            name: 'Proveedor de Servicios',
            description: 'Para profesionales que ofrecen servicios inmobiliarios',
            features: ['Perfil profesional', 'Sistema de pedidos', 'Tracking de trabajos'],
            buttonText: 'Crear Cuenta Proveedor',
            isEnabled: true
          },
          premium: {
            name: 'Agencia Premium',
            description: 'Para agencias de alto volumen con necesidades avanzadas',
            features: ['Características ilimitadas', 'Soporte prioritario 24/7', 'API personalizada'],
            buttonText: 'Crear Cuenta Premium',
            isEnabled: true,
            badge: 'Premium'
          }
        }
      })
      await serviceSettings.save()
    }

    return NextResponse.json(serviceSettings)
  } catch (error) {
    console.error('Error fetching service settings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId } = auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!await isSuperAdmin(userId)) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    const body = await request.json()

    await connectToDatabase()

    const serviceSettings = await ServiceSettingsModel.findOneAndUpdate(
      { _id: 'global' },
      {
        ...body,
        updatedAt: new Date()
      },
      {
        new: true,
        upsert: true,
        runValidators: true
      }
    )

    return NextResponse.json(serviceSettings)
  } catch (error) {
    console.error('Error updating service settings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}