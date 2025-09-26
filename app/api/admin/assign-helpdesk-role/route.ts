import { NextRequest, NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import logger from '@/lib/utils/logger'
import { createSuccessResponse, createErrorResponse } from '@/lib/utils/api-response'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return createErrorResponse('No autenticado', 401)
    }

    // Check if user is superadmin
    const user = await clerkClient.users.getUser(userId)
    const metadata = user.publicMetadata as any

    const isSuperAdmin = metadata?.isSuperAdmin === true ||
      metadata?.role === 'superadmin' ||
      user.emailAddresses?.some(email => email.emailAddress === 'cristiangp2001@gmail.com')

    if (!isSuperAdmin) {
      return createErrorResponse('No autorizado', 403)
    }

    const body = await request.json()
    const { targetUserId, action } = body

    if (!targetUserId || !action || !['assign', 'remove'].includes(action)) {
      return createErrorResponse('targetUserId y action (assign/remove) son requeridos', 400)
    }

    // Get target user
    const targetUser = await clerkClient.users.getUser(targetUserId)
    const targetMetadata = targetUser.publicMetadata as any

    let updatedMetadata = { ...targetMetadata }

    if (action === 'assign') {
      // Assign helpdesk role
      updatedMetadata.role = 'helpdesk'
      updatedMetadata.helpdeskAccess = true

      logger.info('Admin', 'Helpdesk role assigned', {
        adminId: userId,
        targetUserId,
        targetEmail: targetUser.emailAddresses?.[0]?.emailAddress
      })
    } else if (action === 'remove') {
      // Remove helpdesk role
      if (updatedMetadata.role === 'helpdesk') {
        delete updatedMetadata.role
      }
      delete updatedMetadata.helpdeskAccess

      logger.info('Admin', 'Helpdesk role removed', {
        adminId: userId,
        targetUserId,
        targetEmail: targetUser.emailAddresses?.[0]?.emailAddress
      })
    }

    // Update user metadata
    await clerkClient.users.updateUser(targetUserId, {
      publicMetadata: updatedMetadata
    })

    return createSuccessResponse({
      message: `Rol de helpdesk ${action === 'assign' ? 'asignado' : 'removido'} exitosamente`,
      targetUserId,
      action
    })

  } catch (error: any) {
    logger.error('Admin', 'Error managing helpdesk role', error)
    return createErrorResponse('Error interno del servidor', 500)
  }
}