import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import connectDB from '@/lib/infrastructure/database/connection'
import { ServiceChargeModificationModel } from '@/lib/infrastructure/database/schemas/ServiceChargeModificationSchema'
import { VendorDashboardServiceModel } from '@/lib/infrastructure/database/schemas/VendorDashboardServiceSchema'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Verify vendor access and check if invited
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

    // Only invited vendors can modify charges
    if (!isInvitedVendor && userRole !== 'provider' && userRole !== 'supplier') {
      return NextResponse.json({ 
        error: 'Solo proveedores invitados pueden aplicar modificaciones de tarifa' 
      }, { status: 403 })
    }

    await connectDB()

    const resolvedParams = await params
    // Find the modification
    const modification = await ServiceChargeModificationModel.findOne({
      _id: resolvedParams.id,
      vendorId: userId
    })

    if (!modification) {
      return NextResponse.json({ 
        error: 'Modificación no encontrada' 
      }, { status: 404 })
    }

    // Check if modification is approved and not expired
    if (modification.status !== 'approved') {
      return NextResponse.json({ 
        error: 'La modificación debe estar aprobada para aplicarse' 
      }, { status: 400 })
    }

    if (modification.expiresAt && new Date() > modification.expiresAt) {
      // Mark as expired
      modification.status = 'expired'
      modification.modificationHistory.push({
        action: 'expired',
        timestamp: new Date(),
        performedBy: 'system',
        notes: 'Modificación expirada automáticamente'
      })
      await modification.save()

      return NextResponse.json({ 
        error: 'La modificación ha expirado' 
      }, { status: 400 })
    }

    if (modification.appliedAt) {
      return NextResponse.json({ 
        error: 'La modificación ya ha sido aplicada' 
      }, { status: 400 })
    }

    // Update the service pricing
    const service = await VendorDashboardServiceModel.findOneAndUpdate(
      { _id: modification.serviceId, vendorId: userId },
      {
        $set: {
          'customPricing.basePrice': modification.newPrice,
          lastModified: new Date()
        }
      },
      { new: true }
    )

    if (!service) {
      return NextResponse.json({ 
        error: 'Servicio no encontrado' 
      }, { status: 404 })
    }

    // Mark modification as applied
    modification.appliedAt = new Date()
    modification.modificationHistory.push({
      action: 'applied',
      timestamp: new Date(),
      performedBy: userId,
      notes: 'Modificación aplicada por el proveedor'
    })
    await modification.save()

    return NextResponse.json({
      message: 'Modificación de tarifa aplicada exitosamente',
      service: {
        id: service._id,
        serviceName: service.serviceName,
        oldPrice: modification.originalPrice,
        newPrice: modification.newPrice,
        currency: modification.currency
      }
    })

  } catch (error) {
    console.error('Error applying charge modification:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}