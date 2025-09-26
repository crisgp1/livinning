import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import connectDB from '@/lib/infrastructure/database/connection'
import { ApprovedVendorServiceModel } from '@/lib/infrastructure/database/schemas/ApprovedVendorServiceSchema'
import { isSuperAdmin } from '@/lib/utils/superadmin'
import { v4 as uuidv4 } from 'uuid'

// Get all vendor service approval requests (Super Admin only)
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
        error: 'Acceso denegado - Solo super administradores pueden ver aprobaciones' 
      }, { status: 403 })
    }

    await connectDB()

    const { searchParams } = new URL(request.url)
    const vendorId = searchParams.get('vendorId')
    const serviceType = searchParams.get('serviceType')
    const isActive = searchParams.get('isActive')

    // Build query
    const query: any = {}
    if (vendorId) query.vendorId = vendorId
    if (serviceType) query.serviceType = serviceType
    if (isActive !== null) query.isActive = isActive === 'true'

    const approvals = await ApprovedVendorServiceModel
      .find(query)
      .sort({ approvedAt: -1 })
      .lean()

    // Get vendor information for each approval
    const approvalsWithVendorInfo = await Promise.all(
      approvals.map(async (approval) => {
        try {
          const vendor = await clerk.users.getUser(approval.vendorId)
          return {
            id: approval._id,
            vendorId: approval.vendorId,
            vendorName: vendor.firstName && vendor.lastName 
              ? `${vendor.firstName} ${vendor.lastName}`
              : vendor.emailAddresses[0]?.emailAddress || 'Unknown',
            vendorEmail: vendor.emailAddresses[0]?.emailAddress,
            serviceType: approval.serviceType,
            serviceName: approval.serviceName,
            serviceDescription: approval.serviceDescription,
            approvedBy: approval.approvedBy,
            approvedAt: approval.approvedAt,
            isActive: approval.isActive,
            pricing: approval.pricing,
            serviceDetails: approval.serviceDetails,
            vendorInfo: approval.vendorInfo
          }
        } catch (error) {
          return {
            id: approval._id,
            vendorId: approval.vendorId,
            vendorName: 'Unknown Vendor',
            vendorEmail: 'unknown@example.com',
            serviceType: approval.serviceType,
            serviceName: approval.serviceName,
            serviceDescription: approval.serviceDescription,
            approvedBy: approval.approvedBy,
            approvedAt: approval.approvedAt,
            isActive: approval.isActive,
            pricing: approval.pricing,
            serviceDetails: approval.serviceDetails,
            vendorInfo: approval.vendorInfo
          }
        }
      })
    )

    return NextResponse.json({
      approvals: approvalsWithVendorInfo
    })

  } catch (error) {
    console.error('Error fetching vendor approvals:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// Approve a new vendor service (Super Admin only)
export async function POST(request: NextRequest) {
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
        error: 'Acceso denegado - Solo super administradores pueden aprobar servicios' 
      }, { status: 403 })
    }

    const body = await request.json()
    const {
      vendorId,
      serviceType,
      serviceName,
      serviceDescription,
      pricing,
      serviceDetails,
      vendorInfo
    } = body

    // Validate required fields
    if (!vendorId || !serviceType || !serviceName || !serviceDescription || !pricing) {
      return NextResponse.json({ 
        error: 'Campos requeridos: vendorId, serviceType, serviceName, serviceDescription, pricing' 
      }, { status: 400 })
    }

    // Verify vendor exists and has proper role
    try {
      const vendor = await clerk.users.getUser(vendorId)
      const vendorMetadata = vendor.publicMetadata as any
      const vendorRole = vendorMetadata?.role
      const isInvitedVendor = vendorMetadata?.invitedVendor === true
      
      const hasVendorAccess = (vendorRole === 'vendor' && isInvitedVendor) || 
                             vendorRole === 'provider' || 
                             vendorRole === 'supplier'
      
      if (!hasVendorAccess) {
        return NextResponse.json({ 
          error: 'El usuario no es un vendedor válido o no ha sido invitado' 
        }, { status: 400 })
      }
    } catch (error) {
      return NextResponse.json({ 
        error: 'Vendedor no encontrado' 
      }, { status: 404 })
    }

    await connectDB()

    // Check if approval already exists
    const existingApproval = await ApprovedVendorServiceModel.findOne({
      vendorId,
      serviceType
    })

    if (existingApproval && existingApproval.isActive) {
      return NextResponse.json({ 
        error: 'Ya existe una aprobación activa para este vendedor y tipo de servicio' 
      }, { status: 409 })
    }

    // Create new approval
    const newApproval = new ApprovedVendorServiceModel({
      _id: uuidv4(),
      vendorId,
      serviceType,
      serviceName,
      serviceDescription,
      approvedBy: userId,
      approvedAt: new Date(),
      isActive: true,
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
        experience: vendorInfo?.experience || '',
        certifications: vendorInfo?.certifications || [],
        portfolio: vendorInfo?.portfolio || []
      }
    })

    await newApproval.save()

    return NextResponse.json({
      message: 'Servicio de vendedor aprobado exitosamente',
      approval: {
        id: newApproval._id,
        vendorId: newApproval.vendorId,
        serviceType: newApproval.serviceType,
        serviceName: newApproval.serviceName,
        approvedAt: newApproval.approvedAt
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Error approving vendor service:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}