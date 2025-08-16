import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import connectDB from '@/lib/infrastructure/database/connection'
import { VendorDashboardServiceModel } from '@/lib/infrastructure/database/schemas/VendorDashboardServiceSchema'
import { ApprovedVendorServiceModel } from '@/lib/infrastructure/database/schemas/ApprovedVendorServiceSchema'
import { v4 as uuidv4 } from 'uuid'

// Get vendor's dashboard services
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Verify vendor access
    const { clerkClient } = await import('@clerk/nextjs/server')
    const clerk = await clerkClient()
    const user = await clerk.users.getUser(userId)
    
    const metadata = user.publicMetadata as any
    const userRole = metadata?.role
    const isInvitedVendor = metadata?.invitedVendor === true
    
    const hasVendorAccess = (userRole === 'vendor' && isInvitedVendor) || 
                           userRole === 'provider' || 
                           userRole === 'supplier'
    
    if (!hasVendorAccess) {
      return NextResponse.json({ 
        error: 'Acceso denegado - Solo vendedores invitados pueden acceder' 
      }, { status: 403 })
    }

    await connectDB()

    // Get vendor's dashboard services
    const vendorServices = await VendorDashboardServiceModel
      .find({ vendorId: userId })
      .sort({ addedAt: -1 })
      .lean()

    return NextResponse.json({
      services: vendorServices.map(service => ({
        id: service._id,
        serviceType: service.serviceType,
        serviceName: service.serviceName,
        serviceDescription: service.serviceDescription,
        isActive: service.isActive,
        isAvailable: service.isAvailable,
        customPricing: service.customPricing,
        serviceArea: service.serviceArea,
        availability: service.availability,
        performance: service.performance,
        addedAt: service.addedAt
      }))
    })

  } catch (error) {
    console.error('Error fetching vendor services:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// Add a new service (must be approved)
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Verify vendor access
    const { clerkClient } = await import('@clerk/nextjs/server')
    const clerk = await clerkClient()
    const user = await clerk.users.getUser(userId)
    
    const metadata = user.publicMetadata as any
    const userRole = metadata?.role
    const isInvitedVendor = metadata?.invitedVendor === true
    
    const hasVendorAccess = (userRole === 'vendor' && isInvitedVendor) || 
                           userRole === 'provider' || 
                           userRole === 'supplier'
    
    if (!hasVendorAccess) {
      return NextResponse.json({ 
        error: 'Acceso denegado - Solo vendedores invitados pueden acceder' 
      }, { status: 403 })
    }

    const body = await request.json()
    const { 
      approvedServiceId,
      customPricing,
      serviceArea,
      availability 
    } = body

    if (!approvedServiceId) {
      return NextResponse.json({ 
        error: 'ID de servicio aprobado requerido' 
      }, { status: 400 })
    }

    await connectDB()

    // Verify the approved service exists and belongs to this vendor
    const approvedService = await ApprovedVendorServiceModel.findOne({
      _id: approvedServiceId,
      vendorId: userId,
      isActive: true
    })

    if (!approvedService) {
      return NextResponse.json({ 
        error: 'Servicio aprobado no encontrado o inválido' 
      }, { status: 404 })
    }

    // Check if service already exists in vendor dashboard
    const existingService = await VendorDashboardServiceModel.findOne({
      vendorId: userId,
      approvedServiceId: approvedServiceId
    })

    if (existingService) {
      return NextResponse.json({ 
        error: 'Este servicio ya está agregado a tu dashboard' 
      }, { status: 409 })
    }

    // Create new vendor dashboard service
    const newService = new VendorDashboardServiceModel({
      _id: uuidv4(),
      vendorId: userId,
      approvedServiceId: approvedServiceId,
      serviceType: approvedService.serviceType,
      serviceName: approvedService.serviceName,
      serviceDescription: approvedService.serviceDescription,
      customPricing: customPricing || {
        basePrice: approvedService.pricing.basePrice,
        currency: approvedService.pricing.currency,
        priceType: approvedService.pricing.priceType
      },
      serviceArea: serviceArea || {
        cities: ['CDMX'],
        maxDistance: 50,
        travelFee: 0
      },
      availability: availability || {
        workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
        workingHours: {
          start: '09:00',
          end: '17:00'
        },
        blackoutDates: [],
        leadTime: 1
      }
    })

    await newService.save()

    return NextResponse.json({
      message: 'Servicio agregado exitosamente a tu dashboard',
      service: {
        id: newService._id,
        serviceName: newService.serviceName,
        serviceType: newService.serviceType,
        isActive: newService.isActive,
        addedAt: newService.addedAt
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Error adding vendor service:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}