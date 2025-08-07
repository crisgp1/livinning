import { auth, clerkClient } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // TODO: Add proper permission check like:
    // if (!has({ permission: 'org:admin:impersonate' })) {
    //   return NextResponse.json({ error: 'You do not have permission to impersonate users' }, { status: 403 })
    // }

    const { targetUserId, targetEmail } = await request.json()

    if (!targetUserId && !targetEmail) {
      return NextResponse.json(
        { error: 'Either targetUserId or targetEmail is required' },
        { status: 400 }
      )
    }

    const clerk = await clerkClient()
    let targetUser
    
    if (targetUserId) {
      try {
        targetUser = await clerk.users.getUser(targetUserId)
      } catch (error) {
        return NextResponse.json(
          { error: 'Target user not found' },
          { status: 404 }
        )
      }
    } else if (targetEmail) {
      try {
        const usersList = await clerk.users.getUserList({
          emailAddress: [targetEmail]
        })
        
        if (usersList.data.length === 0) {
          return NextResponse.json(
            { error: 'Target user not found' },
            { status: 404 }
          )
        }
        
        targetUser = usersList.data[0]
      } catch (error) {
        return NextResponse.json(
          { error: 'Error finding target user' },
          { status: 500 }
        )
      }
    }

    if (!targetUser) {
      return NextResponse.json(
        { error: 'Target user not found' },
        { status: 404 }
      )
    }

    const targetName = targetUser.firstName || targetUser.lastName
      ? `${targetUser.firstName || ''} ${targetUser.lastName || ''}`.trim()
      : targetUser.emailAddresses[0]?.emailAddress || 'User';

    // Create actor token using Clerk's Backend API
    try {
      const actorTokenResponse = await fetch('https://api.clerk.com/v1/actor_tokens', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: targetUser.id,
          actor: { sub: userId }, // Current admin user is the actor
          expires_in_seconds: 60 * 60 * 24 // 24 hours
        })
      })

      if (actorTokenResponse.ok) {
        const actorToken = await actorTokenResponse.json()
        
        return NextResponse.json({ 
          success: true,
          message: `Now impersonating ${targetName}`,
          actorTokenUrl: actorToken.url,
          targetUser: {
            id: targetUser.id,
            name: targetName,
            email: targetUser.emailAddresses[0]?.emailAddress || '',
            imageUrl: targetUser.imageUrl,
            role: targetUser.publicMetadata?.role || 'user'
          }
        })
      } else {
        throw new Error('Failed to create actor token')
      }
    } catch (actorError) {
      console.log('Actor token creation failed, falling back to cookie-based approach:', actorError)
      
      // Fallback to cookie-based impersonation if actor tokens fail
      const impersonationData = {
        originalUserId: userId,
        targetUserId: targetUser.id,
        targetUserName: targetName,
        targetUserEmail: targetUser.emailAddresses[0]?.emailAddress || '',
        targetUserImageUrl: targetUser.imageUrl,
        targetUserRole: targetUser.publicMetadata?.role || 'user',
        impersonatedAt: new Date().toISOString()
      }

      const response = NextResponse.json({ 
        success: true,
        message: `Now impersonating ${targetName}`,
        impersonationData,
        requiresReload: true // Signal that page needs reload
      })

      // Set impersonation cookie as fallback
      response.cookies.set('impersonation', JSON.stringify(impersonationData), {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 // 24 hours
      })

      return response
    }
  } catch (error) {
    console.error('Error starting impersonation:', error)
    return NextResponse.json(
      { error: 'Failed to start impersonation' },
      { status: 500 }
    )
  }
}

export async function DELETE() {
  try {
    // With Clerk's actor tokens, stopping impersonation is simply redirecting 
    // back to the application without the actor token
    return NextResponse.json({ 
      success: true,
      message: 'Impersonation stopped',
      redirectUrl: '/' // Redirect to home page as the original user
    })
  } catch (error) {
    console.error('Error stopping impersonation:', error)
    return NextResponse.json(
      { error: 'Failed to stop impersonation' },
      { status: 500 }
    )
  }
}