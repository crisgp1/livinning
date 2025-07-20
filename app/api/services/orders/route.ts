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
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')

    await connectDB()

    // Build query
    const query: any = { userId }
    if (status) {
      query.status = status
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
      assignedTo: order.assignedTo,
      deliverables: order.deliverables,
      notes: order.notes,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt
    }))

    return NextResponse.json({
      success: true,
      data: transformedOrders,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount
      }
    })

  } catch (error) {
    console.error('Get service orders error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch service orders'
      },
      { status: 500 }
    )
  }
}