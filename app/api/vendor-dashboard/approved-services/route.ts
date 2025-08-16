import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import connectDB from '@/lib/infrastructure/database/connection'
import { ApprovedVendorServiceModel } from '@/lib/infrastructure/database/schemas/ApprovedVendorServiceSchema'

// Get approved services for the current vendor
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Verify vendor access - must be invited vendor
    const { clerkClient } = await import('@clerk/nextjs/server')
    const clerk = await clerkClient()
    const user = await clerk.users.getUser(userId)
    
    // Check if user was invited and has vendor role or is provider/supplier
    const metadata = user.publicMetadata as any
    const userRole = metadata?.role
    const isInvitedVendor = metadata?.invitedVendor === true
    
    // Allow access for invited vendors, providers, or suppliers
    const hasVendorAccess = (userRole === 'vendor' && isInvitedVendor) || 
                           userRole === 'provider' || 
                           userRole === 'supplier'
    
    if (!hasVendorAccess) {
      return NextResponse.json({ 
        error: 'Acceso denegado - Solo vendedores invitados pueden acceder' 
      }, { status: 403 })
    }

    await connectDB()

    // Get all approved services for this vendor
    const approvedServices = await ApprovedVendorServiceModel
      .find({ 
        vendorId: userId,
        isActive: true 
      })
      .sort({ approvedAt: -1 })
      .lean()

    return NextResponse.json({
      approvedServices: approvedServices.map(service => ({
        id: service._id,
        serviceType: service.serviceType,
        serviceName: service.serviceName,
        serviceDescription: service.serviceDescription,
        approvedBy: service.approvedBy,
        approvedAt: service.approvedAt,
        pricing: service.pricing,
        serviceDetails: service.serviceDetails,
        vendorInfo: service.vendorInfo
      }))
    })

  } catch (error) {
    console.error('Error fetching approved services:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}