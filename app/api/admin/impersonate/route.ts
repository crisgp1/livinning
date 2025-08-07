import { auth, currentUser } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    const user = await currentUser()
    
    if (!userId || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { targetUserId, targetEmail } = await request.json()

    if (!targetUserId && !targetEmail) {
      return NextResponse.json(
        { error: 'Either targetUserId or targetEmail is required' },
        { status: 400 }
      )
    }

    // Get target user from Clerk
    const { clerkClient } = await import('@clerk/nextjs/server')
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

    // Store impersonation data in session/response
    const impersonationData = {
      originalUserId: userId,
      originalUserName: `${user.firstName} ${user.lastName}`,
      targetUserId: targetUser.id,
      targetUserName: `${targetUser.firstName} ${targetUser.lastName}`,
      targetUserEmail: targetUser.emailAddresses[0]?.emailAddress || '',
      targetUserRole: targetUser.publicMetadata?.role || 'user',
      impersonatedAt: new Date().toISOString()
    }

    const response = NextResponse.json({ 
      success: true,
      message: `Now impersonating ${targetUser.firstName} ${targetUser.lastName}`,
      impersonationData
    })

    // Set impersonation cookie
    response.cookies.set('impersonation', JSON.stringify(impersonationData), {
      httpOnly: false, // Allow client-side access
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 // 24 hours
    })

    return response
  } catch (error) {
    console.error('Error starting impersonation:', error)
    return NextResponse.json(
      { error: 'Failed to start impersonation' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const response = NextResponse.json({ 
      success: true,
      message: 'Impersonation stopped'
    })

    // Remove impersonation cookie
    response.cookies.delete('impersonation')

    return response
  } catch (error) {
    console.error('Error stopping impersonation:', error)
    return NextResponse.json(
      { error: 'Failed to stop impersonation' },
      { status: 500 }
    )
  }
}