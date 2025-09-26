import { NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import connectDB from '@/lib/infrastructure/database/connection'
import ServiceOrderModel from '@/lib/infrastructure/database/models/ServiceOrderModel'
import { ServiceOrderStatus } from '@/lib/domain/entities/ServiceOrder'

export async function GET(request: Request) {
  try {
    const { userId } = await auth()
    const user = await currentUser()
    
    if (!userId || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user has provider access
    const metadata = user.publicMetadata as any
    const userRole = metadata?.role
    const hasProviderAccess = userRole === 'supplier' || userRole === 'provider'

    if (!hasProviderAccess) {
      return NextResponse.json(
        { error: 'Forbidden: Provider access required' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const serviceType = searchParams.get('serviceType')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    await connectDB()

    // Build query filter for orders assigned to this provider
    const filter: any = {
      assignedProviderId: userId  // Orders assigned to this provider
    }

    if (status) filter.status = status
    if (serviceType) filter.serviceType = serviceType
    if (startDate || endDate) {
      filter.createdAt = {}
      if (startDate) filter.createdAt.$gte = new Date(startDate)
      if (endDate) filter.createdAt.$lte = new Date(endDate)
    }

    // Get orders with pagination
    const orders = await ServiceOrderModel
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(offset)
      .lean()

    // Get total count for pagination
    const totalCount = await ServiceOrderModel.countDocuments(filter)

    // Calculate stats
    const statsAggregation = await ServiceOrderModel.aggregate([
      { $match: { assignedProviderId: userId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ])

    const stats = Object.values(ServiceOrderStatus).reduce((acc, status) => {
      const stat = statsAggregation.find(s => s._id === status)
      acc[status] = {
        count: stat?.count || 0,
        totalAmount: stat?.totalAmount || 0
      }
      return acc
    }, {} as any)

    // Transform orders for frontend
    const transformedOrders = orders.map((order: any) => ({
      id: order._id,
      serviceType: order.serviceType,
      serviceName: order.serviceName,
      serviceDescription: order.serviceDescription,
      propertyAddress: order.propertyAddress,
      contactPhone: order.contactPhone,
      preferredDate: order.preferredDate,
      specialRequests: order.specialRequests,
      amount: order.amount,
      currency: order.currency,
      status: order.status,
      estimatedDelivery: order.estimatedDelivery,
      actualDelivery: order.actualDelivery,
      deliverables: order.deliverables || [],
      notes: order.notes || [],
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      customerEmail: order.customerEmail,
      customerName: order.customerName
    }))

    return NextResponse.json({
      success: true,
      data: transformedOrders,
      stats,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount
      }
    })

  } catch (error) {
    console.error('Provider orders API error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch provider orders'
      },
      { status: 500 }
    )
  }
}