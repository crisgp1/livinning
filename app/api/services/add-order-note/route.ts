import { NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import connectDB from '@/lib/infrastructure/database/connection'
import ServiceOrderModel from '@/lib/infrastructure/database/models/ServiceOrderModel'
import { NotificationService } from '@/lib/application/services/NotificationService'
import logger from '@/lib/utils/logger'

export async function POST(request: Request) {
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

    const { orderId, note } = await request.json()

    if (!orderId || !note || !note.trim()) {
      return NextResponse.json(
        { error: 'Missing required fields: orderId and note' },
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

    // Add the note with timestamp and provider info
    const providerName = user.firstName && user.lastName
      ? `${user.firstName} ${user.lastName}`
      : user.firstName || user.emailAddresses[0]?.emailAddress || 'Proveedor'

    const timestampedNote = `[${new Date().toLocaleDateString('es-ES')} ${new Date().toLocaleTimeString('es-ES')}] ${providerName}: ${note.trim()}`

    const updatedOrder = await ServiceOrderModel.findByIdAndUpdate(
      orderId,
      {
        $push: { notes: timestampedNote },
        updatedAt: new Date()
      },
      { new: true }
    )

    if (!updatedOrder) {
      return NextResponse.json(
        { error: 'Failed to add note' },
        { status: 500 }
      )
    }

    // Send notification to client about new note
    try {
      await NotificationService.notifyClientOfOrderUpdate(
        order.userId,
        orderId,
        providerName,
        order.status,
        `Nueva nota agregada: ${note.trim()}`
      )
    } catch (notificationError) {
      logger.error('AddOrderNote', 'Failed to send notification', notificationError)
    }

    logger.info('AddOrderNote', `Note added to order ${orderId} by provider ${userId}`)

    return NextResponse.json({
      success: true,
      data: {
        id: updatedOrder._id,
        notes: updatedOrder.notes,
        updatedAt: updatedOrder.updatedAt
      },
      message: 'Note added successfully'
    })

  } catch (error) {
    logger.error('AddOrderNote', 'Add note failed', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to add note'
      },
      { status: 500 }
    )
  }
}