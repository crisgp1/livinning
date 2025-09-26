import { NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import connectDB from '@/lib/infrastructure/database/connection'
import ServiceOrderModel from '@/lib/infrastructure/database/models/ServiceOrderModel'
import { ServiceOrderStatus } from '@/lib/domain/entities/ServiceOrder'
import { NotificationService } from '@/lib/application/services/NotificationService'
import logger from '@/lib/utils/logger'

export async function PUT(request: Request) {
  try {
    const { userId } = await auth()
    const user = await currentUser()

    if (!userId || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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

    const { orderId, status, note } = await request.json()

    if (!orderId || !status) {
      return NextResponse.json(
        { error: 'Missing required fields: orderId and status' },
        { status: 400 }
      )
    }

    // Validate status
    if (!Object.values(ServiceOrderStatus).includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status value' },
        { status: 400 }
      )
    }

    await connectDB()

    // Find the order and ensure it belongs to this provider
    const order = await ServiceOrderModel.findOne({
      _id: orderId,
      assignedProviderId: userId
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found or not assigned to you' },
        { status: 404 }
      )
    }

    // Update the order
    const updateData: any = {
      status,
      updatedAt: new Date()
    }

    // Add note if provided
    if (note) {
      updateData.$push = { notes: note }
    }

    // Set actual delivery date if completing
    if (status === ServiceOrderStatus.COMPLETED) {
      updateData.actualDelivery = new Date()
    }

    const updatedOrder = await ServiceOrderModel.findByIdAndUpdate(
      orderId,
      updateData,
      { new: true }
    )

    if (!updatedOrder) {
      return NextResponse.json(
        { error: 'Failed to update order' },
        { status: 500 }
      )
    }

    // Send notification to client about status update
    try {
      const providerName = user.firstName && user.lastName
        ? `${user.firstName} ${user.lastName}`
        : user.firstName || user.emailAddresses[0]?.emailAddress || 'Proveedor'

      await NotificationService.notifyClientOfOrderUpdate(
        order.userId,
        orderId,
        providerName,
        status,
        note || `Estado actualizado a ${status}`
      )
    } catch (notificationError) {
      logger.error('UpdateOrderStatus', 'Failed to send notification', notificationError)
    }

    logger.info('UpdateOrderStatus', `Order ${orderId} status updated to ${status} by provider ${userId}`)

    return NextResponse.json({
      success: true,
      data: {
        id: updatedOrder._id,
        status: updatedOrder.status,
        notes: updatedOrder.notes,
        updatedAt: updatedOrder.updatedAt
      },
      message: 'Order status updated successfully'
    })

  } catch (error) {
    logger.error('UpdateOrderStatus', 'Order status update failed', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update order status'
      },
      { status: 500 }
    )
  }
}