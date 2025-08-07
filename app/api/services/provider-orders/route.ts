import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import connectDB from '@/lib/infrastructure/database/connection'
import ServiceOrderModel from '@/lib/infrastructure/database/models/ServiceOrderModel'

export async function GET(request: Request) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const serviceType = searchParams.get('serviceType')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    await connectDB()

    // Build query - filter by assignedTo field for providers
    const query: any = { assignedTo: userId }
    
    if (status) {
      query.status = status
    }
    
    if (serviceType) {
      query.serviceType = serviceType
    }

    // Add date range filter if provided
    if (startDate || endDate) {
      query.createdAt = {}
      if (startDate) {
        query.createdAt.$gte = new Date(startDate)
      }
      if (endDate) {
        query.createdAt.$lte = new Date(endDate)
      }
    }

    // Get orders with pagination
    const orders = await ServiceOrderModel
      .find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(offset)
      .lean()

    // Get total count for pagination
    const totalCount = await ServiceOrderModel.countDocuments(query)

    // Get status counts for dashboard stats
    const statusCounts = await ServiceOrderModel.aggregate([
      { $match: { assignedTo: userId } },
      { 
        $group: { 
          _id: '$status', 
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        } 
      }
    ])

    // Transform the data for the frontend
    const transformedOrders = orders.map(order => ({
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
      deliverables: order.deliverables,
      notes: order.notes,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      customerEmail: order.customerEmail
    }))

    // Transform status counts
    const stats = statusCounts.reduce((acc, item) => {
      acc[item._id] = {
        count: item.count,
        totalAmount: item.totalAmount
      }
      return acc
    }, {} as Record<string, { count: number, totalAmount: number }>)

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
    console.error('Get provider service orders error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch provider service orders'
      },
      { status: 500 }
    )
  }
}