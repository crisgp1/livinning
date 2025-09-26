import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import connectDB from '@/lib/infrastructure/database/connection'
import { ServiceRequestModel } from '@/lib/infrastructure/database/schemas/ServiceRequestSchema'
import { ApprovedVendorServiceModel } from '@/lib/infrastructure/database/schemas/ApprovedVendorServiceSchema'
import { isSuperAdmin } from '@/lib/utils/superadmin'
import { v4 as uuidv4 } from 'uuid'

// Get all service requests (Super Admin only)
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Check super admin access
    const { clerkClient } = await import('@clerk/nextjs/server')
    const clerk = await clerkClient()
    const user = await clerk.users.getUser(userId)
    
    if (!isSuperAdmin(user)) {
      return NextResponse.json({ 
        error: 'Acceso denegado - Solo super administradores pueden ver solicitudes' 
      }, { status: 403 })
    }

    await connectDB()

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const vendorId = searchParams.get('vendorId')

    // Build query
    const query: any = {}
    if (status) query.status = status
    if (vendorId) query.vendorId = vendorId

    const requests = await ServiceRequestModel
      .find(query)
      .sort({ requestedAt: -1 })
      .lean()

    // Get vendor information for each request
    const requestsWithVendorInfo = await Promise.all(
      requests.map(async (request) => {
        try {
          const vendor = await clerk.users.getUser(request.vendorId)
          return {
            id: request._id,
            vendorId: request.vendorId,
            vendorName: vendor.firstName && vendor.lastName 
              ? `${vendor.firstName} ${vendor.lastName}`
              : vendor.emailAddresses[0]?.emailAddress || 'Unknown',
            vendorEmail: vendor.emailAddresses[0]?.emailAddress,
            serviceType: request.serviceType,
            serviceName: request.serviceName,
            serviceDescription: request.serviceDescription,
            status: request.status,
            requestedAt: request.requestedAt,
            reviewedAt: request.reviewedAt,
            reviewedBy: request.reviewedBy,
            rejectionReason: request.rejectionReason,
            pricing: request.pricing,
            serviceDetails: request.serviceDetails,
            vendorInfo: request.vendorInfo
          }
        } catch (error) {
          return {
            id: request._id,
            vendorId: request.vendorId,
            vendorName: 'Unknown Vendor',
            vendorEmail: 'unknown@example.com',
            serviceType: request.serviceType,
            serviceName: request.serviceName,
            serviceDescription: request.serviceDescription,
            status: request.status,
            requestedAt: request.requestedAt,
            reviewedAt: request.reviewedAt,
            reviewedBy: request.reviewedBy,
            rejectionReason: request.rejectionReason,
            pricing: request.pricing,
            serviceDetails: request.serviceDetails,
            vendorInfo: request.vendorInfo
          }
        }
      })
    )

    return NextResponse.json({
      requests: requestsWithVendorInfo
    })

  } catch (error) {
    console.error('Error fetching service requests:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// Review service request (approve/reject) - Super Admin only
export async function PATCH(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Check super admin access
    const { clerkClient } = await import('@clerk/nextjs/server')
    const clerk = await clerkClient()
    const user = await clerk.users.getUser(userId)
    
    if (!isSuperAdmin(user)) {
      return NextResponse.json({ 
        error: 'Acceso denegado - Solo super administradores pueden revisar solicitudes' 
      }, { status: 403 })
    }

    const body = await request.json()
    const { requestId, action, rejectionReason } = body

    if (!requestId || !action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ 
        error: 'Parámetros inválidos. Se requiere requestId y action (approve/reject)' 
      }, { status: 400 })
    }

    if (action === 'reject' && !rejectionReason) {
      return NextResponse.json({ 
        error: 'Razón de rechazo requerida para rechazar solicitudes' 
      }, { status: 400 })
    }

    await connectDB()

    // Find the service request
    const serviceRequest = await ServiceRequestModel.findById(requestId)
    
    if (!serviceRequest) {
      return NextResponse.json({ 
        error: 'Solicitud de servicio no encontrada' 
      }, { status: 404 })
    }

    if (serviceRequest.status !== 'pending' && serviceRequest.status !== 'under_review') {
      return NextResponse.json({ 
        error: 'Solo se pueden revisar solicitudes pendientes o en revisión' 
      }, { status: 400 })
    }

    if (action === 'approve') {
      // Create approved vendor service
      const approvedService = new ApprovedVendorServiceModel({
        _id: uuidv4(),
        vendorId: serviceRequest.vendorId,
        serviceType: serviceRequest.serviceType,
        serviceName: serviceRequest.serviceName,
        serviceDescription: serviceRequest.serviceDescription,
        approvedBy: userId,
        approvedAt: new Date(),
        isActive: true,
        pricing: serviceRequest.pricing,
        serviceDetails: serviceRequest.serviceDetails,
        vendorInfo: serviceRequest.vendorInfo
      })

      await approvedService.save()

      // Update service request status
      serviceRequest.status = 'approved'
      serviceRequest.reviewedBy = userId
      serviceRequest.reviewedAt = new Date()
      await serviceRequest.save()

      return NextResponse.json({
        message: 'Solicitud aprobada exitosamente',
        approvedService: {
          id: approvedService._id,
          serviceName: approvedService.serviceName,
          serviceType: approvedService.serviceType
        }
      })

    } else if (action === 'reject') {
      // Update service request status
      serviceRequest.status = 'rejected'
      serviceRequest.reviewedBy = userId
      serviceRequest.reviewedAt = new Date()
      serviceRequest.rejectionReason = rejectionReason
      await serviceRequest.save()

      return NextResponse.json({
        message: 'Solicitud rechazada',
        rejectionReason
      })
    }

  } catch (error) {
    console.error('Error reviewing service request:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}