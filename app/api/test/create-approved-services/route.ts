import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import connectDB from '@/lib/infrastructure/database/connection'
import { ApprovedVendorServiceModel } from '@/lib/infrastructure/database/schemas/ApprovedVendorServiceSchema'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { vendorId } = body
    
    // Use current user as vendor if not specified
    const targetVendorId = vendorId || userId

    await connectDB()

    // Create sample approved vendor services
    const sampleApprovedServices = [
      {
        _id: uuidv4(),
        vendorId: targetVendorId,
        serviceType: 'cleaning',
        serviceName: 'Limpieza Profesional Residencial',
        serviceDescription: 'Servicio completo de limpieza para hogares y departamentos con productos profesionales',
        approvedBy: 'superadmin-user-id',
        approvedAt: new Date(),
        isActive: true,
        pricing: {
          basePrice: 1500,
          currency: 'MXN',
          priceType: 'fixed'
        },
        serviceDetails: {
          estimatedDuration: '3-4 horas',
          deliverables: ['Limpieza completa de todas las habitaciones', 'Desinfección de superficies', 'Aspirado de alfombras y tapetes'],
          requirements: ['Acceso a agua corriente', 'Espacio para equipos de limpieza', 'Ventilación adecuada'],
          specialNotes: 'Productos de limpieza ecológicos incluidos en el servicio'
        },
        vendorInfo: {
          experience: '5 años de experiencia en limpieza residencial y comercial',
          certifications: ['Certificación en limpieza profesional', 'Manejo de productos químicos'],
          portfolio: ['https://example.com/portfolio1', 'https://example.com/portfolio2']
        }
      },
      {
        _id: uuidv4(),
        vendorId: targetVendorId,
        serviceType: 'plumbing',
        serviceName: 'Reparaciones de Plomería',
        serviceDescription: 'Reparación y mantenimiento de sistemas de plomería residencial y comercial',
        approvedBy: 'superadmin-user-id',
        approvedAt: new Date(),
        isActive: true,
        pricing: {
          basePrice: 800,
          currency: 'MXN',
          priceType: 'hourly'
        },
        serviceDetails: {
          estimatedDuration: '1-3 horas',
          deliverables: ['Diagnóstico del problema', 'Reparación completa', 'Pruebas de funcionamiento', 'Garantía de 30 días'],
          requirements: ['Acceso al área de trabajo', 'Posibilidad de cierre temporal de agua', 'Espacio para herramientas'],
          specialNotes: 'Materiales adicionales se cobran por separado según cotización'
        },
        vendorInfo: {
          experience: '8 años como plomero certificado en instalaciones residenciales',
          certifications: ['Certificación de plomería residencial', 'Licencia municipal vigente'],
          portfolio: []
        }
      },
      {
        _id: uuidv4(),
        vendorId: targetVendorId,
        serviceType: 'electrical',
        serviceName: 'Instalaciones Eléctricas',
        serviceDescription: 'Instalación y reparación de sistemas eléctricos residenciales y comerciales',
        approvedBy: 'superadmin-user-id',
        approvedAt: new Date(),
        isActive: true,
        pricing: {
          basePrice: 1200,
          currency: 'MXN',
          priceType: 'fixed'
        },
        serviceDetails: {
          estimatedDuration: '2-5 horas',
          deliverables: ['Instalación profesional', 'Pruebas de seguridad', 'Certificado de instalación', 'Manual de mantenimiento'],
          requirements: ['Corte de energía temporal', 'Acceso al tablero principal', 'Área de trabajo despejada'],
          specialNotes: 'Incluye garantía de 1 año en mano de obra'
        },
        vendorInfo: {
          experience: '10 años en instalaciones eléctricas residenciales y comerciales',
          certifications: ['Licencia de electricista clase A', 'Certificación CFE'],
          portfolio: []
        }
      },
      {
        _id: uuidv4(),
        vendorId: targetVendorId,
        serviceType: 'photography',
        serviceName: 'Fotografía Inmobiliaria',
        serviceDescription: 'Sesiones fotográficas profesionales para propiedades inmobiliarias',
        approvedBy: 'superadmin-user-id',
        approvedAt: new Date(),
        isActive: true,
        pricing: {
          basePrice: 2500,
          currency: 'MXN',
          priceType: 'fixed'
        },
        serviceDetails: {
          estimatedDuration: '2-3 horas',
          deliverables: ['50 fotos profesionales editadas', 'Imágenes en alta resolución', 'Entrega digital en 24 horas', 'Licencia de uso comercial'],
          requirements: ['Propiedad preparada y ordenada', 'Buena iluminación natural', 'Acceso a todas las áreas'],
          specialNotes: 'Edición profesional y retoque incluidos en el precio'
        },
        vendorInfo: {
          experience: '6 años especializándose en fotografía inmobiliaria',
          certifications: ['Certificación en fotografía inmobiliaria', 'Curso de marketing visual'],
          portfolio: ['https://example.com/photo1', 'https://example.com/photo2']
        }
      },
      {
        _id: uuidv4(),
        vendorId: targetVendorId,
        serviceType: 'gardening',
        serviceName: 'Mantenimiento de Jardines',
        serviceDescription: 'Servicio completo de jardinería y mantenimiento de áreas verdes',
        approvedBy: 'superadmin-user-id',
        approvedAt: new Date(),
        isActive: true,
        pricing: {
          basePrice: 1800,
          currency: 'MXN',
          priceType: 'fixed'
        },
        serviceDetails: {
          estimatedDuration: '4-6 horas',
          deliverables: ['Poda profesional', 'Riego y fertilización', 'Limpieza de área verde', 'Recomendaciones de cuidado'],
          requirements: ['Acceso a agua', 'Herramientas básicas disponibles', 'Espacio para residuos'],
          specialNotes: 'Incluye fertilizantes y productos básicos de cuidado'
        },
        vendorInfo: {
          experience: '7 años en diseño y mantenimiento de jardines',
          certifications: ['Certificación en horticultura', 'Curso de paisajismo'],
          portfolio: []
        }
      }
    ]

    // Insert sample approved services
    const insertedServices = await ApprovedVendorServiceModel.insertMany(sampleApprovedServices)

    return NextResponse.json({
      success: true,
      message: 'Servicios aprobados creados exitosamente',
      servicesCreated: insertedServices.length,
      vendorId: targetVendorId,
      services: insertedServices.map(service => ({
        id: service._id,
        serviceName: service.serviceName,
        serviceType: service.serviceType,
        pricing: service.pricing,
        approvedAt: service.approvedAt
      }))
    })

  } catch (error) {
    console.error('Error creating approved services:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error },
      { status: 500 }
    )
  }
}