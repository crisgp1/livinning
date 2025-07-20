import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { v4 as uuidv4 } from 'uuid'
import { isSuperAdminById } from '@/lib/utils/superadmin'
import connectDB from '@/lib/infrastructure/database/connection'
import OrganizationModel from '@/lib/infrastructure/database/models/OrganizationModel'

export async function GET() {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check superadmin status
    const isAdmin = await isSuperAdminById(userId)
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized: Superadmin access required' }, { status: 403 })
    }

    await connectDB()

    // Get all organizations with pagination
    const organizations = await OrganizationModel.find({})
      .sort({ createdAt: -1 })
      .limit(100) // Limit to prevent large responses
      .lean()

    return NextResponse.json({
      success: true,
      data: organizations
    })

  } catch (error) {
    console.error('Superadmin organizations error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch organizations' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check superadmin status
    const isAdmin = await isSuperAdminById(userId)
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized: Superadmin access required' }, { status: 403 })
    }

    const body = await request.json()
    const { name, slug, description, ownerId, plan = 'free' } = body

    if (!name || !slug || !ownerId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    await connectDB()

    // Check if slug is available
    const existingOrg = await OrganizationModel.findOne({ slug })
    if (existingOrg) {
      return NextResponse.json(
        { success: false, error: 'Organization slug already exists' },
        { status: 400 }
      )
    }

    // Create new organization
    const organization = new OrganizationModel({
      _id: uuidv4(),
      name,
      slug,
      description: description || `Organización ${name}`,
      ownerId,
      status: 'active',
      plan,
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
      data: organization
    })

  } catch (error) {
    console.error('Create organization error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create organization' },
      { status: 500 }
    )
  }
}