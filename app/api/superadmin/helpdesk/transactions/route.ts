import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { isSuperAdminById } from '@/lib/utils/superadmin'
import connectDB from '@/lib/infrastructure/database/connection'
import ServiceOrderModel from '@/lib/infrastructure/database/models/ServiceOrderModel'
import ProviderModel from '@/lib/infrastructure/database/models/ProviderModel'

export async function GET(request: Request) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check superadmin status
    const isAdmin = await isSuperAdminById(userId)
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized: Superadmin access required' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const type = searchParams.get('type')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    await connectDB()

    // Build query filter
    const filter: any = {}

    if (status) filter.status = status
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

    // Get provider names for orders that have assigned providers
    const providerIds = orders
      .filter(order => order.assignedProviderId)
      .map(order => order.assignedProviderId)

    const providers = await ProviderModel
      .find({ userId: { $in: providerIds } })
      .select('userId businessName')
      .lean()

    const providerMap = providers.reduce((acc: any, provider: any) => {
      acc[provider.userId] = provider.businessName
      return acc
    }, {})

    // Transform orders to transaction format
    const transactions = orders.map((order: any) => ({
      id: order._id,
      type: 'service_order',
      serviceType: order.serviceType,
      serviceName: order.serviceName,
      amount: order.amount,
      currency: order.currency,
      status: order.status,
      clientId: order.userId,
      clientName: order.customerName || 'Cliente sin nombre',
      clientEmail: order.customerEmail || '',
      providerId: order.assignedProviderId,
      providerName: order.assignedProviderId ? providerMap[order.assignedProviderId] : null,
      propertyAddress: order.propertyAddress,
      contactPhone: order.contactPhone,
      stripePaymentIntentId: order.stripePaymentIntentId,
      stripeSessionId: order.stripeSessionId,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      notes: order.notes || [],
      metadata: {
        serviceDescription: order.serviceDescription,
        preferredDate: order.preferredDate,
        specialRequests: order.specialRequests,
        deliverables: order.deliverables || []
      }
    }))

    // Get total count for pagination
    const totalCount = await ServiceOrderModel.countDocuments(filter)

    return NextResponse.json({
      success: true,
      data: transactions,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount
      }
    })

  } catch (error) {
    console.error('Helpdesk transactions error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch transactions' },
      { status: 500 }
    )
  }
}