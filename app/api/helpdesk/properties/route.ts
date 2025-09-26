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
    const status = searchParams.get('status') || 'pending'
    const search = searchParams.get('search') || ''
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = parseInt(searchParams.get('skip') || '0')

    await connectDB()
    const db = mongoose.connection.db

    // Build query
    let query: any = {}

    if (status === 'pending') {
      query.status = { $in: ['pending', 'under_review'] }
    } else if (status !== 'all') {
      query.status = status
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { 'location.address': { $regex: search, $options: 'i' } },
        { 'location.city': { $regex: search, $options: 'i' } },
        { ownerEmail: { $regex: search, $options: 'i' } }
      ]
    }

    // Get properties with pagination
    const [properties, totalCount] = await Promise.all([
      db.collection('properties')
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      db.collection('properties').countDocuments(query)
    ])

    // Format response
    const formattedProperties = properties.map(property => ({
      ...property,
      _id: property._id.toString(),
      moderationNotes: property.moderationNotes || [],
      moderatedBy: property.moderatedBy || null,
      moderatedAt: property.moderatedAt || null
    }))

    logger.info('Helpdesk', 'Properties retrieved for moderation', {
      requesterId: userId,
      totalProperties: formattedProperties.length,
      status,
      search
    })

    return createSuccessResponse({
      properties: formattedProperties,
      totalCount,
      pagination: {
        limit,
        skip,
        hasMore: skip + formattedProperties.length < totalCount
      }
    })

  } catch (error: any) {
    logger.error('Helpdesk', 'Error fetching properties for moderation', error)
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
    const { propertyId, action, notes } = body

    if (!propertyId || !action || !['approve', 'reject', 'request_changes'].includes(action)) {
      return createErrorResponse('propertyId y action válida son requeridos', 400)
    }

    await connectDB()
    const db = mongoose.connection.db

    let updateData: any = {
      moderatedBy: userId,
      moderatedAt: new Date()
    }

    switch (action) {
      case 'approve':
        updateData.status = 'active'
        updateData.approvedAt = new Date()
        break

      case 'reject':
        updateData.status = 'rejected'
        updateData.rejectedAt = new Date()
        if (notes) {
          updateData.$push = { moderationNotes: { note: notes, date: new Date(), moderator: userId } }
        }
        break

      case 'request_changes':
        updateData.status = 'changes_requested'
        if (notes) {
          updateData.$push = { moderationNotes: { note: notes, date: new Date(), moderator: userId } }
        }
        break
    }

    const result = await db.collection('properties').updateOne(
      { _id: new ObjectId(propertyId) },
      updateData.$push ? updateData : { $set: updateData }
    )

    if (result.matchedCount === 0) {
      return createErrorResponse('Propiedad no encontrada', 404)
    }

    logger.info('Helpdesk', 'Property moderation action performed', {
      moderatorId: userId,
      propertyId,
      action,
      notes: notes || 'No notes provided'
    })

    return createSuccessResponse({
      message: `Propiedad ${action === 'approve' ? 'aprobada' : action === 'reject' ? 'rechazada' : 'marcada para cambios'} exitosamente`,
      propertyId,
      action
    })

  } catch (error: any) {
    logger.error('Helpdesk', 'Error performing property moderation', error)
    return createErrorResponse('Error interno del servidor', 500)
  }
}