import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import connectDB from '@/lib/infrastructure/database/connection'
import { ServiceChargeModificationModel } from '@/lib/infrastructure/database/schemas/ServiceChargeModificationSchema'
import { VendorDashboardServiceModel } from '@/lib/infrastructure/database/schemas/VendorDashboardServiceSchema'
import { v4 as uuidv4 } from 'uuid'

// Get vendor's charge modification requests
export async function GET(request: NextRequest) {
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
        error: 'Solo proveedores invitados pueden modificar tarifas' 
      }, { status: 403 })
    }

    await connectDB()

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const serviceId = searchParams.get('serviceId')
    
    const query: any = { vendorId: userId }
    if (status) query.status = status
    if (serviceId) query.serviceId = serviceId

    const modifications = await ServiceChargeModificationModel
      .find(query)
      .sort({ requestedAt: -1 })
      .populate('serviceId', 'serviceName serviceType')
      .lean()

    return NextResponse.json({
      modifications: modifications.map(mod => ({
        id: mod._id,
        serviceId: mod.serviceId,
        serviceName: mod.serviceName,
        serviceType: mod.serviceType,
        originalPrice: mod.originalPrice,
        newPrice: mod.newPrice,
        currency: mod.currency,
        reason: mod.reason,
        status: mod.status,
        requestedAt: mod.requestedAt,
        authorizedAt: mod.authorizedAt,
        expiresAt: mod.expiresAt,
        appliedAt: mod.appliedAt,
        notes: mod.notes,
        history: mod.modificationHistory
      }))
    })

  } catch (error) {
    console.error('Error fetching charge modifications:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// Request a new charge modification
export async function POST(request: NextRequest) {
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
        error: 'Solo proveedores invitados pueden modificar tarifas' 
      }, { status: 403 })
    }

    const body = await request.json()
    const { 
      serviceId,
      newPrice,
      reason,
      notes
    } = body

    if (!serviceId || !newPrice || !reason) {
      return NextResponse.json({ 
        error: 'Faltan campos requeridos: serviceId, newPrice, reason' 
      }, { status: 400 })
    }

    await connectDB()

    // Verify the service exists and belongs to this vendor
    const service = await VendorDashboardServiceModel.findOne({
      _id: serviceId,
      vendorId: userId,
      isActive: true
    })

    if (!service) {
      return NextResponse.json({ 
        error: 'Servicio no encontrado o no válido' 
      }, { status: 404 })
    }

    // Check if there's already a pending modification for this service
    const existingModification = await ServiceChargeModificationModel.findOne({
      vendorId: userId,
      serviceId: serviceId,
      status: { $in: ['pending', 'approved'] }
    })

    if (existingModification) {
      return NextResponse.json({ 
        error: 'Ya existe una modificación pendiente o aprobada para este servicio' 
      }, { status: 409 })
    }

    const currentPrice = service.customPricing?.basePrice || 0

    if (newPrice === currentPrice) {
      return NextResponse.json({ 
        error: 'El nuevo precio debe ser diferente al precio actual' 
      }, { status: 400 })
    }

    // Create new charge modification request
    const modification = new ServiceChargeModificationModel({
      _id: uuidv4(),
      vendorId: userId,
      serviceId: serviceId,
      authorizedBy: '', // Will be set when approved by admin
      originalPrice: currentPrice,
      newPrice: parseFloat(newPrice),
      currency: service.customPricing?.currency || 'MXN',
      reason: reason.trim(),
      status: 'pending',
      requestedAt: new Date(),
      notes: notes?.trim() || '',
      modificationHistory: [{
        action: 'requested',
        timestamp: new Date(),
        performedBy: userId,
        notes: notes?.trim() || ''
      }]
    })

    await modification.save()

    return NextResponse.json({
      message: 'Solicitud de modificación de tarifa enviada exitosamente',
      modification: {
        id: modification._id,
        serviceId: modification.serviceId,
        originalPrice: modification.originalPrice,
        newPrice: modification.newPrice,
        currency: modification.currency,
        reason: modification.reason,
        status: modification.status,
        requestedAt: modification.requestedAt
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating charge modification request:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}