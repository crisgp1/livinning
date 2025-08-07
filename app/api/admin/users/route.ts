import { auth, currentUser } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    const user = await currentUser()
    
    if (!userId || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Allow all authenticated users for development purposes
    // In production, you might want to add proper role-based access control

    // Get all users from Clerk
    const { clerkClient } = await import('@clerk/nextjs/server')
    const clerk = await clerkClient()
    
    // Fetch users with pagination
    const usersList = await clerk.users.getUserList({
      limit: 100,
      orderBy: '+created_at'
    })

    const users = usersList.data.map(user => ({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      emailAddress: user.emailAddresses[0]?.emailAddress || '',
      role: user.publicMetadata?.role || 'user',
      isVerified: user.publicMetadata?.isVerified || false,
      createdAt: user.createdAt
    }))

    return NextResponse.json({ 
      success: true,
      users,
      total: usersList.totalCount
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}