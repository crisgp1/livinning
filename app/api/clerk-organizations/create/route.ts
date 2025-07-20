import { NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import connectDB from '@/lib/infrastructure/database/connection'
import OrganizationModel from '@/lib/infrastructure/database/models/OrganizationModel'
import { v4 as uuidv4 } from 'uuid'

// Create organization in both Clerk and our database
export async function POST(request: Request) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, slug } = await request.json()

    // 1. Create organization in Clerk
    const clerk = await clerkClient()
    const clerkOrg = await clerk.organizations.createOrganization({
      name,
      slug,
      createdBy: userId,
      publicMetadata: {
        plan: 'free',
        maxProperties: 5
      }
    })

    // 2. Create organization in our database
    await connectDB()
    
    const organization = new OrganizationModel({
      _id: uuidv4(),
      name,
      slug,
      description: `Organización ${name}`,
      ownerId: userId,
      clerkOrgId: clerkOrg.id, // Link to Clerk organization
      status: 'active',
      plan: 'free',
      settings: {
        allowPublicProperties: true,
        requireApproval: false,
        branding: {},
        notifications: {
          emailNotifications: true,
          newPropertyNotifications: true,
          inquiryNotifications: true
        }
      },
      createdAt: new Date(),
      updatedAt: new Date()
    })

    await organization.save()

    return NextResponse.json({
      success: true,
      data: {
        organization,
        clerkOrganization: clerkOrg
      }
    })

  } catch (error) {
    console.error('Clerk organization creation error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create organization' },
      { status: 500 }
    )
  }
}