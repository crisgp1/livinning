import { NextRequest } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import connectDB from '@/lib/infrastructure/database/connection'
import mongoose from 'mongoose'
import logger from '@/lib/utils/logger'
import { createSuccessResponse, createErrorResponse } from '@/lib/utils/api-response'
import { ObjectId } from 'mongodb'

interface SupportTicket {
  _id?: ObjectId
  userId: string
  userEmail: string
  userName: string
  userRole: 'client' | 'provider' | 'admin'
  subject: string
  description: string
  category: 'technical' | 'billing' | 'service' | 'account' | 'other'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  assignedTo?: string
  assignedToName?: string
  tags: string[]
  messages: Array<{
    id: string
    senderId: string
    senderName: string
    senderRole: string
    message: string
    createdAt: Date
  }>
  createdAt: Date
  updatedAt: Date
  resolvedAt?: Date
  closedAt?: Date
}

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
    const status = searchParams.get('status') || 'open'
    const priority = searchParams.get('priority') || ''
    const assigned = searchParams.get('assigned') || ''
    const search = searchParams.get('search') || ''
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = parseInt(searchParams.get('skip') || '0')

    await connectDB()
    const db = mongoose.connection.db

    // Build query
    let query: any = {}

    if (status !== 'all') {
      query.status = status
    }

    if (priority) {
      query.priority = priority
    }

    if (assigned === 'me') {
      query.assignedTo = userId
    } else if (assigned === 'unassigned') {
      query.assignedTo = { $exists: false }
    }

    if (search) {
      query.$or = [
        { subject: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { userEmail: { $regex: search, $options: 'i' } },
        { userName: { $regex: search, $options: 'i' } }
      ]
    }

    // Get tickets with pagination
    const [tickets, totalCount] = await Promise.all([
      db.collection('support_tickets')
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      db.collection('support_tickets').countDocuments(query)
    ])

    // Format response
    const formattedTickets = tickets.map(ticket => ({
      ...ticket,
      _id: ticket._id.toString()
    }))

    logger.info('Helpdesk', 'Support tickets retrieved', {
      requesterId: userId,
      totalTickets: formattedTickets.length,
      filters: { status, priority, assigned, search }
    })

    return createSuccessResponse({
      tickets: formattedTickets,
      totalCount,
      pagination: {
        limit,
        skip,
        hasMore: skip + formattedTickets.length < totalCount
      }
    })

  } catch (error: any) {
    logger.error('Helpdesk', 'Error fetching support tickets', error)
    return createErrorResponse('Error interno del servidor', 500)
  }
}

export async function POST(request: NextRequest) {
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
    const { subject, description, category, priority, userEmail, userName } = body

    if (!subject || !description || !category || !priority || !userEmail) {
      return createErrorResponse('Todos los campos requeridos deben ser proporcionados', 400)
    }

    await connectDB()
    const db = mongoose.connection.db

    const newTicket: SupportTicket = {
      userId: 'system', // Created by helpdesk on behalf of user
      userEmail,
      userName: userName || 'Usuario',
      userRole: 'client',
      subject,
      description,
      category,
      priority,
      status: 'open',
      assignedTo: userId,
      assignedToName: `${user.firstName} ${user.lastName}`.trim(),
      tags: [],
      messages: [{
        id: new ObjectId().toString(),
        senderId: userId,
        senderName: `${user.firstName} ${user.lastName}`.trim(),
        senderRole: 'helpdesk',
        message: description,
        createdAt: new Date()
      }],
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const result = await db.collection('support_tickets').insertOne(newTicket)

    logger.info('Helpdesk', 'Support ticket created', {
      createdBy: userId,
      ticketId: result.insertedId,
      userEmail,
      category,
      priority
    })

    return createSuccessResponse({
      message: 'Ticket de soporte creado exitosamente',
      ticketId: result.insertedId
    })

  } catch (error: any) {
    logger.error('Helpdesk', 'Error creating support ticket', error)
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
    const { ticketId, action, message, priority, assignTo } = body

    if (!ticketId || !action) {
      return createErrorResponse('ticketId y action son requeridos', 400)
    }

    await connectDB()
    const db = mongoose.connection.db

    let updateData: any = {
      updatedAt: new Date()
    }

    const ticketObjectId = new ObjectId(ticketId)

    switch (action) {
      case 'assign':
        if (!assignTo) {
          return createErrorResponse('assignTo es requerido para asignar ticket', 400)
        }

        const assigneeUser = await clerkClient.users.getUser(assignTo)
        updateData.assignedTo = assignTo
        updateData.assignedToName = `${assigneeUser.firstName} ${assigneeUser.lastName}`.trim()
        updateData.status = 'in_progress'
        break

      case 'reply':
        if (!message) {
          return createErrorResponse('message es requerido para responder', 400)
        }

        const newMessage = {
          id: new ObjectId().toString(),
          senderId: userId,
          senderName: `${user.firstName} ${user.lastName}`.trim(),
          senderRole: metadata?.role || 'helpdesk',
          message,
          createdAt: new Date()
        }

        updateData.$push = { messages: newMessage }
        updateData.status = 'in_progress'
        break

      case 'resolve':
        updateData.status = 'resolved'
        updateData.resolvedAt = new Date()
        break

      case 'close':
        updateData.status = 'closed'
        updateData.closedAt = new Date()
        break

      case 'reopen':
        updateData.status = 'in_progress'
        updateData.$unset = { resolvedAt: '', closedAt: '' }
        break

      case 'update_priority':
        if (!priority || !['low', 'medium', 'high', 'urgent'].includes(priority)) {
          return createErrorResponse('priority válido es requerido', 400)
        }
        updateData.priority = priority
        break

      default:
        return createErrorResponse('Acción no válida', 400)
    }

    const result = await db.collection('support_tickets').updateOne(
      { _id: ticketObjectId },
      updateData.$push || updateData.$unset ? updateData : { $set: updateData }
    )

    if (result.matchedCount === 0) {
      return createErrorResponse('Ticket no encontrado', 404)
    }

    logger.info('Helpdesk', 'Support ticket updated', {
      updatedBy: userId,
      ticketId,
      action
    })

    return createSuccessResponse({
      message: 'Ticket actualizado exitosamente',
      ticketId,
      action
    })

  } catch (error: any) {
    logger.error('Helpdesk', 'Error updating support ticket', error)
    return createErrorResponse('Error interno del servidor', 500)
  }
}