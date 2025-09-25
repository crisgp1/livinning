'use server'

import { auth, clerkClient } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export async function startImpersonation(targetEmail: string): Promise<{ success: boolean; redirectUrl?: string; error?: string }> {
  try {
    const { userId } = await auth()

    if (!userId) {
      return {
        success: false,
        error: 'Authentication required. Please log in first.'
      }
    }

    // TODO: Add proper permission check for admin/superadmin role

    const clerk = await clerkClient()

    // Find target user
    const usersList = await clerk.users.getUserList({
      emailAddress: [targetEmail]
    })

    if (usersList.data.length === 0) {
      return {
        success: false,
        error: 'Target user not found'
      }
    }

    const targetUser = usersList.data[0]

    try {
      // Try to create actor token (this might not be available in all Clerk versions)
      const actorToken = await (clerk.users as any).createActorToken({
        userId: targetUser.id,
        actor: { sub: targetUser.id },
        expiresInSeconds: 60 * 60 * 24 // 24 hours
      })

      return {
        success: true,
        redirectUrl: actorToken.url
      }
    } catch (error) {
      // If createActorToken doesn't exist, fall back to manual session switching
      console.error('createActorToken not available, using alternative approach:', error)
      return {
        success: false,
        error: 'Impersonation feature not fully supported in current Clerk version'
      }
    }
  } catch (error) {
    console.error('Impersonation error:', error)
    return {
      success: false,
      error: 'An unexpected error occurred during impersonation'
    }
  }
}

export async function stopImpersonation(): Promise<{ success: boolean; redirectUrl?: string; error?: string }> {
  try {
    return {
      success: true,
      redirectUrl: '/'
    }
  } catch (error) {
    console.error('Stop impersonation error:', error)
    return {
      success: false,
      error: 'An error occurred while stopping impersonation'
    }
  }
}