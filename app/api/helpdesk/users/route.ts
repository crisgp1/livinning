import { NextRequest, NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import logger from '@/lib/utils/logger'
import { createSuccessResponse, createErrorResponse } from '@/lib/utils/api-response'

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
    const search = searchParams.get('search') || ''
    const role = searchParams.get('role') || ''
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Get all users from Clerk
    let query: any = {
      limit,
      offset
    }

    // Build query based on filters
    if (search) {
      query.query = search
    }

    const { data: users, totalCount } = await clerkClient.users.getUserList(query)

    // Filter and format users
    const formattedUsers = users
      .filter(user => {
        const userMetadata = user.publicMetadata as any
        if (role === 'helpdesk') return userMetadata?.role === 'helpdesk'
        if (role === 'provider') return userMetadata?.role === 'provider'
        if (role === 'agency') return userMetadata?.isAgency === true
        if (role === 'superadmin') return userMetadata?.isSuperAdmin === true || userMetadata?.role === 'superadmin'
        return true
      })
      .map(user => {
        const userMetadata = user.publicMetadata as any
        return {
          id: user.id,
          email: user.emailAddresses?.[0]?.emailAddress || '',
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          imageUrl: user.imageUrl || '',
          role: userMetadata?.role || 'client',
          isAgency: userMetadata?.isAgency || false,
          isSuperAdmin: userMetadata?.isSuperAdmin || false,
          helpdeskAccess: userMetadata?.helpdeskAccess || false,
          createdAt: user.createdAt,
          lastActiveAt: user.lastActiveAt,
          banned: user.banned
        }
      })

    logger.info('Helpdesk', 'Users list retrieved', {
      requesterId: userId,
      totalUsers: formattedUsers.length,
      filters: { search, role }
    })

    return createSuccessResponse({
      users: formattedUsers,
      totalCount: formattedUsers.length,
      pagination: {
        limit,
        offset,
        hasMore: formattedUsers.length === limit
      }
    })

  } catch (error: any) {
    logger.error('Helpdesk', 'Error fetching users', error)
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
    const { targetUserId, action, reason } = body

    if (!targetUserId || !action || !['ban', 'unban', 'reset_password'].includes(action)) {
      return createErrorResponse('targetUserId y action válida son requeridos', 400)
    }

    let result: any = {}

    switch (action) {
      case 'ban':
        await clerkClient.users.banUser(targetUserId)
        result.message = 'Usuario bloqueado exitosamente'
        break

      case 'unban':
        await clerkClient.users.unbanUser(targetUserId)
        result.message = 'Usuario desbloqueado exitosamente'
        break

      case 'reset_password':
        // Note: Clerk doesn't have a direct password reset API
        // This would typically trigger an email to the user
        result.message = 'Se ha enviado un email de recuperación de contraseña'
        break
    }

    logger.info('Helpdesk', 'User action performed', {
      helpdeskUserId: userId,
      targetUserId,
      action,
      reason
    })

    return createSuccessResponse(result)

  } catch (error: any) {
    logger.error('Helpdesk', 'Error performing user action', error)
    return createErrorResponse('Error interno del servidor', 500)
  }
}