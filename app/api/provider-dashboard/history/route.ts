import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import connectDB from '@/lib/infrastructure/database/connection'
import { ServiceOrderModel } from '@/lib/infrastructure/database/schemas/ServiceOrderSchema'
import { canAccessProviderDashboard } from '@/lib/utils/provider-helpers'

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Get user from Clerk to check provider access
    const { clerkClient } = await import('@clerk/nextjs/server')
    const clerk = await clerkClient()
    const user = await clerk.users.getUser(userId)
    const metadata = user.publicMetadata as any
    const userRole = metadata?.role
    
    // Check if user has provider access
    const hasProviderAccess = userRole === 'supplier' || userRole === 'provider' || 
      (metadata?.providerAccess === true) || 
      user.emailAddresses?.some(email => email.emailAddress === 'cristiangp2001@gmail.com')
    
    if (!hasProviderAccess) {
      return NextResponse.json({ error: 'Acceso denegado - No eres un proveedor autorizado' }, { status: 403 })
    }

    await connectDB()

    // Get search params for pagination
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    // Build query - find only completed and cancelled orders assigned to this provider
    const query: any = {
      assignedProviderId: userId,
      status: { $in: ['completed', 'cancelled'] }
    }

    // Get total count for pagination
    const totalOrders = await ServiceOrderModel.countDocuments(query)

    // Fetch service orders with sorting by creation date (newest first)
    const serviceOrders = await ServiceOrderModel
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()

    // Transform data for frontend
    const history = serviceOrders.map(order => ({
      id: order._id,
      serviceName: order.serviceName,
      serviceDescription: order.serviceDescription,
      serviceType: order.serviceType,
      propertyAddress: order.propertyAddress,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      contactPhone: order.contactPhone,
      amount: order.amount,
      currency: order.currency,
      status: order.status,
      preferredDate: order.preferredDate,
      estimatedDelivery: order.estimatedDelivery,
      actualDelivery: order.actualDelivery,
      deliverables: order.deliverables,
      notes: order.notes,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt
    }))

    return NextResponse.json({
      history,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalOrders / limit),
        totalOrders,
        limit
      }
    })

  } catch (error) {
    console.error('Error fetching provider service history:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}