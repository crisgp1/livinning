import { NextRequest, NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const clerk = await clerkClient()
    const user = await clerk.users.getUser(userId)
    
    const settings = {
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.emailAddresses?.[0]?.emailAddress || '',
      phone: user.phoneNumbers?.[0]?.phoneNumber || '',
      notifications: user.publicMetadata?.notifications || {
        email: true,
        sms: false,
        push: true
      },
      privacy: user.publicMetadata?.privacy || {
        profileVisible: true,
        contactVisible: false
      }
    }

    return NextResponse.json({ success: true, data: settings })
  } catch (error) {
    console.error('Error fetching user settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user settings' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { firstName, lastName, phone, notifications, privacy } = body

    // Update user profile
    const updateData: any = {}
    
    if (firstName !== undefined) updateData.firstName = firstName
    if (lastName !== undefined) updateData.lastName = lastName
    
    if (phone !== undefined && phone !== '') {
      // Format phone number if needed
      const formattedPhone = phone.replace(/\D/g, '')
      if (formattedPhone) {
        updateData.phoneNumbers = [{ phoneNumber: phone }]
      }
    }

    // Get current user metadata
    const clerk = await clerkClient()
    const user = await clerk.users.getUser(userId)
    const currentMetadata = user.publicMetadata || {}

    // Update public metadata for notifications and privacy
    const updatedMetadata = {
      ...currentMetadata,
      notifications: notifications || currentMetadata.notifications,
      privacy: privacy || currentMetadata.privacy
    }

    updateData.publicMetadata = updatedMetadata

    // Update user in Clerk
    await clerk.users.updateUser(userId, updateData)

    return NextResponse.json({ 
      success: true, 
      message: 'Settings updated successfully' 
    })
  } catch (error) {
    console.error('Error updating user settings:', error)
    return NextResponse.json(
      { error: 'Failed to update user settings' },
      { status: 500 }
    )
  }
}