import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import connectDB from '@/lib/infrastructure/database/connection'
import { ServiceRequestModel } from '@/lib/infrastructure/database/schemas/ServiceRequestSchema'
import { v4 as uuidv4 } from 'uuid'

// Get vendor's service requests
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

    // Get vendor's service requests
    const serviceRequests = await ServiceRequestModel
      .find({ vendorId: userId })
      .sort({ requestedAt: -1 })
      .lean()

    return NextResponse.json({
      requests: serviceRequests.map(request => ({
        id: request._id,
        serviceType: request.serviceType,
        serviceName: request.serviceName,
        serviceDescription: request.serviceDescription,
        status: request.status,
        requestedAt: request.requestedAt,
        reviewedAt: request.reviewedAt,
        rejectionReason: request.rejectionReason,
        pricing: request.pricing,
        serviceDetails: request.serviceDetails,
        vendorInfo: request.vendorInfo
      }))
    })

  } catch (error) {
    console.error('Error fetching service requests:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// Submit a new service request
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
      serviceType,
      serviceName,
      serviceDescription,
      pricing,
      serviceDetails,
      vendorInfo
    } = body

    // Validate required fields
    if (!serviceType || !serviceName || !serviceDescription || !pricing || !vendorInfo) {
      return NextResponse.json({ 
        error: 'Todos los campos son requeridos' 
      }, { status: 400 })
    }

    if (!vendorInfo.experience || !vendorInfo.whyThisService) {
      return NextResponse.json({ 
        error: 'Experiencia y justificación del servicio son requeridos' 
      }, { status: 400 })
    }

    if (!pricing.basePrice || pricing.basePrice <= 0) {
      return NextResponse.json({ 
        error: 'Precio base debe ser mayor a 0' 
      }, { status: 400 })
    }

    await connectDB()

    // Check if there's already a pending or approved request for this service type
    const existingRequest = await ServiceRequestModel.findOne({
      vendorId: userId,
      serviceType: serviceType,
      status: { $in: ['pending', 'under_review', 'approved'] }
    })

    if (existingRequest) {
      let statusText = 'pendiente'
      if (existingRequest.status === 'under_review') statusText = 'en revisión'
      if (existingRequest.status === 'approved') statusText = 'aprobada'
      
      return NextResponse.json({ 
        error: `Ya tienes una solicitud ${statusText} para este tipo de servicio` 
      }, { status: 409 })
    }

    // Create new service request
    const newRequest = new ServiceRequestModel({
      _id: uuidv4(),
      vendorId: userId,
      serviceType,
      serviceName,
      serviceDescription,
      pricing: {
        basePrice: pricing.basePrice,
        currency: pricing.currency || 'MXN',
        priceType: pricing.priceType || 'fixed'
      },
      serviceDetails: {
        estimatedDuration: serviceDetails?.estimatedDuration,
        deliverables: serviceDetails?.deliverables || [],
        requirements: serviceDetails?.requirements || [],
        specialNotes: serviceDetails?.specialNotes
      },
      vendorInfo: {
        experience: vendorInfo.experience,
        certifications: vendorInfo.certifications || [],
        portfolio: vendorInfo.portfolio || [],
        whyThisService: vendorInfo.whyThisService
      }
    })

    await newRequest.save()

    return NextResponse.json({
      message: 'Solicitud de servicio enviada exitosamente',
      request: {
        id: newRequest._id,
        serviceName: newRequest.serviceName,
        serviceType: newRequest.serviceType,
        status: newRequest.status,
        requestedAt: newRequest.requestedAt
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating service request:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}