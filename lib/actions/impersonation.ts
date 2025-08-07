'use server'

import { auth, clerkClient } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export async function startImpersonation(targetEmail: string) {
  const { userId } = await auth()
  
  if (!userId) {
    throw new Error('Unauthorized')
  }

  // TODO: Add proper permission check
  
  const clerk = await clerkClient()
  
  // Find target user
  const usersList = await clerk.users.getUserList({
    emailAddress: [targetEmail]
  })
  
  if (usersList.data.length === 0) {
    throw new Error('Target user not found')
  }
  
  const targetUser = usersList.data[0]
  
  try {
    // Try to create actor token (this might not be available in all Clerk versions)
    const actorToken = await (clerk.users as any).createActorToken({
      userId: targetUser.id,
      actor: { sub: targetUser.id },
      expiresInSeconds: 60 * 60 * 24 // 24 hours
    })
    
    // Redirect to the actor token URL
    redirect(actorToken.url)
  } catch (error) {
    // If createActorToken doesn't exist, fall back to manual session switching
    console.error('createActorToken not available, using alternative approach:', error)
    throw new Error('Impersonation feature not fully supported in current Clerk version')
  }
}

export async function stopImpersonation() {
  // Simply redirect back to the application without actor token
  redirect('/')
}