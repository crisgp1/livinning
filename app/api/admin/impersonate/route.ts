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

    // Get current user info for impersonation data
    const clerk = await clerkClient()
    const currentUser = await clerk.users.getUser(userId)
    
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

    // For now, use cookie-based impersonation as primary method
    // Actor tokens may require a specific Clerk plan or configuration
    console.log('Using cookie-based impersonation approach')
    
    const originalName = currentUser.firstName || currentUser.lastName 
      ? `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim()
      : currentUser.emailAddresses[0]?.emailAddress || 'User';
    
    const impersonationData = {
      originalUserId: userId,
      originalUserName: originalName,
      originalUserImageUrl: currentUser.imageUrl,
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

    // Set impersonation cookie
    response.cookies.set('impersonation', JSON.stringify(impersonationData), {
      httpOnly: false,
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

export async function DELETE() {
  try {
    const response = NextResponse.json({ 
      success: true,
      message: 'Impersonation stopped',
      redirectUrl: '/' // Redirect to home page as the original user
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