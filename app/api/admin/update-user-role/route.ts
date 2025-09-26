import { auth, currentUser } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { userId: currentUserId } = await auth()
    const user = await currentUser()
    
    if (!currentUserId || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get current user's role for permission checking
    const currentUserMetadata = user.publicMetadata as any
    const currentUserRole = currentUserMetadata?.role || 'user'
    
    const { userId, role } = await request.json()

    if (!userId || !role) {
      return NextResponse.json(
        { error: 'Missing userId or role' },
        { status: 400 }
      )
    }

    if (!['user', 'agent', 'agency', 'supplier', 'superadmin'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be one of: user, agent, agency, supplier, superadmin' },
        { status: 400 }
      )
    }

    // Allow all role changes for development/testing purposes
    // In production, you might want to implement proper role-based restrictions
    
    // Role hierarchy for reference (can be used later for production restrictions)
    const roleHierarchy = {
      user: 0,
      agent: 1,
      agency: 2,
      supplier: 2,
      superadmin: 3
    }

    // Update user metadata in Clerk
    const { clerkClient } = await import('@clerk/nextjs/server')
    const clerk = await clerkClient()
    
    // Get the target user to preserve existing metadata
    const targetUser = await clerk.users.getUser(userId)
    const existingMetadata = targetUser.publicMetadata as any || {}
    
    await clerk.users.updateUser(userId, {
      publicMetadata: {
        ...existingMetadata,
        role: role,
        // Keep existing values for other metadata
        onboardingCompleted: existingMetadata.onboardingCompleted || false,
        isVerified: existingMetadata.isVerified || false,
        isAgency: role === 'agency' || existingMetadata.isAgency || false,
        isSupplier: role === 'supplier',
        isSuperAdmin: role === 'superadmin',
        lastRoleUpdate: new Date().toISOString(),
        updatedBy: currentUserId
      }
    })

    return NextResponse.json({ 
      success: true,
      message: `User role updated to ${role} successfully`
    })
  } catch (error) {
    console.error('Error updating user role:', error)
    return NextResponse.json(
      { error: 'Failed to update user role' },
      { status: 500 }
    )
  }
}