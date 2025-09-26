import { NextRequest } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import connectDB from '@/lib/infrastructure/database/connection'
import mongoose from 'mongoose'
import logger from '@/lib/utils/logger'
import { createSuccessResponse, createErrorResponse } from '@/lib/utils/api-response'
import { ObjectId } from 'mongodb'

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return createErrorResponse('No autenticado', 401)
    }

    // Check if user has helpdesk or superadmin role
    const user = await clerkClient.users.getUser(userId)
    const metadata = user.publicMetadata as any

    const isHelpdesk = metadata?.role === 'helpdesk'
    const isSuperAdmin = metadata?.isSuperAdmin === true ||
      metadata?.role === 'superadmin' ||
      user.emailAddresses?.some(email => email.emailAddress === 'cristiangp2001@gmail.com')

    if (!isHelpdesk && !isSuperAdmin) {
      return createErrorResponse('No autorizado', 403)
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || ''
    const serviceType = searchParams.get('serviceType') || ''
    const search = searchParams.get('search') || ''
    const dateFrom = searchParams.get('dateFrom') || ''
    const dateTo = searchParams.get('dateTo') || ''
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = parseInt(searchParams.get('skip') || '0')

    await connectDB()
    const db = mongoose.connection.db

    // Build query
    let query: any = {}

    if (status && status !== 'all') {
      query.status = status
    }

    if (serviceType) {
      query.serviceType = serviceType
    }

    if (search) {
      query.$or = [
        { serviceName: { $regex: search, $options: 'i' } },
        { clientEmail: { $regex: search, $options: 'i' } },
        { providerEmail: { $regex: search, $options: 'i' } },
        { orderNumber: { $regex: search, $options: 'i' } }
      ]
    }

    if (dateFrom || dateTo) {
      query.createdAt = {}
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom)
      if (dateTo) query.createdAt.$lte = new Date(dateTo)
    }

    // Get service orders with pagination
    const [orders, totalCount] = await Promise.all([
      db.collection('service_orders')
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      db.collection('service_orders').countDocuments(query)
    ])

    // Get additional stats
    const stats = await db.collection('service_orders').aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          avgAmount: { $avg: '$amount' },
          statusCounts: {
            $push: '$status'
          }
        }
      }
    ]).toArray()

    const statusCounts = stats[0]?.statusCounts?.reduce((acc: any, status: string) => {
      acc[status] = (acc[status] || 0) + 1
      return acc
    }, {}) || {}

    // Format response
    const formattedOrders = orders.map(order => ({
      ...order,
      _id: order._id.toString()
    }))

    logger.info('Helpdesk', 'Service orders retrieved', {
      requesterId: userId,
      totalOrders: formattedOrders.length,
      filters: { status, serviceType, search }
    })

    return createSuccessResponse({
      orders: formattedOrders,
      totalCount,
      stats: {
        totalOrders: stats[0]?.totalOrders || 0,
        totalAmount: stats[0]?.totalAmount || 0,
        avgAmount: stats[0]?.avgAmount || 0,
        statusCounts
      },
      pagination: {
        limit,
        skip,
        hasMore: skip + formattedOrders.length < totalCount
      }
    })

  } catch (error: any) {
    logger.error('Helpdesk', 'Error fetching service orders', error)
    return createErrorResponse('Error interno del servidor', 500)
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return createErrorResponse('No autenticado', 401)
    }

    // Check if user has helpdesk or superadmin role
    const user = await clerkClient.users.getUser(userId)
    const metadata = user.publicMetadata as any

    const isHelpdesk = metadata?.role === 'helpdesk'
    const isSuperAdmin = metadata?.isSuperAdmin === true ||
      metadata?.role === 'superadmin' ||
      user.emailAddresses?.some(email => email.emailAddress === 'cristiangp2001@gmail.com')

    if (!isHelpdesk && !isSuperAdmin) {
      return createErrorResponse('No autorizado', 403)
    }

    const body = await request.json()
    const { orderId, action, notes, newStatus, refundAmount } = body

    if (!orderId || !action) {
      return createErrorResponse('orderId y action son requeridos', 400)
    }

    await connectDB()
    const db = mongoose.connection.db

    let updateData: any = {
      updatedAt: new Date(),
      lastModifiedBy: userId
    }

    const orderObjectId = new ObjectId(orderId)

    switch (action) {
      case 'add_note':
        if (!notes) {
          return createErrorResponse('notes es requerido para agregar nota', 400)
        }

        const newNote = {
          id: new ObjectId().toString(),
          note: notes,
          addedBy: userId,
          addedByName: `${user.firstName} ${user.lastName}`.trim(),
          addedAt: new Date(),
          type: 'helpdesk_note'
        }

        updateData.$push = {
          notes: newNote,
          adminActions: {
            action: 'note_added',
            performedBy: userId,
            performedByName: `${user.firstName} ${user.lastName}`.trim(),
            timestamp: new Date(),
            details: notes
          }
        }
        break

      case 'update_status':
        if (!newStatus) {
          return createErrorResponse('newStatus es requerido para actualizar estado', 400)
        }

        updateData.status = newStatus
        updateData.statusUpdatedAt = new Date()

        updateData.$push = {
          adminActions: {
            action: 'status_updated',
            performedBy: userId,
            performedByName: `${user.firstName} ${user.lastName}`.trim(),
            timestamp: new Date(),
            details: `Status changed to ${newStatus}`,
            previousStatus: 'unknown' // We'd need to fetch the current status first
          }
        }
        break

      case 'escalate':
        updateData.escalated = true
        updateData.escalatedAt = new Date()
        updateData.escalatedBy = userId
        updateData.priority = 'high'

        if (notes) {
          updateData.$push = {
            notes: {
              id: new ObjectId().toString(),
              note: notes,
              addedBy: userId,
              addedByName: `${user.firstName} ${user.lastName}`.trim(),
              addedAt: new Date(),
              type: 'escalation_note'
            },
            adminActions: {
              action: 'escalated',
              performedBy: userId,
              performedByName: `${user.firstName} ${user.lastName}`.trim(),
              timestamp: new Date(),
              details: notes
            }
          }
        }
        break

      case 'request_refund':
        if (!refundAmount || refundAmount <= 0) {
          return createErrorResponse('refundAmount válido es requerido', 400)
        }

        updateData.refundRequested = true
        updateData.refundAmount = refundAmount
        updateData.refundRequestedAt = new Date()
        updateData.refundRequestedBy = userId
        updateData.status = 'refund_pending'

        updateData.$push = {
          adminActions: {
            action: 'refund_requested',
            performedBy: userId,
            performedByName: `${user.firstName} ${user.lastName}`.trim(),
            timestamp: new Date(),
            details: `Refund of $${refundAmount} requested. ${notes || ''}`
          }
        }
        break

      case 'cancel_order':
        updateData.status = 'cancelled'
        updateData.cancelledAt = new Date()
        updateData.cancelledBy = userId
        updateData.cancellationReason = notes || 'Cancelled by helpdesk'

        updateData.$push = {
          adminActions: {
            action: 'order_cancelled',
            performedBy: userId,
            performedByName: `${user.firstName} ${user.lastName}`.trim(),
            timestamp: new Date(),
            details: notes || 'Order cancelled by helpdesk'
          }
        }
        break

      default:
        return createErrorResponse('Acción no válida', 400)
    }

    const result = await db.collection('service_orders').updateOne(
      { _id: orderObjectId },
      updateData.$push ? updateData : { $set: updateData }
    )

    if (result.matchedCount === 0) {
      return createErrorResponse('Orden no encontrada', 404)
    }

    logger.info('Helpdesk', 'Service order updated', {
      updatedBy: userId,
      orderId,
      action,
      notes
    })

    return createSuccessResponse({
      message: 'Orden actualizada exitosamente',
      orderId,
      action
    })

  } catch (error: any) {
    logger.error('Helpdesk', 'Error updating service order', error)
    return createErrorResponse('Error interno del servidor', 500)
  }
}