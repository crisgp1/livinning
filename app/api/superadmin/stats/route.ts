import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { isSuperAdminById } from '@/lib/utils/superadmin'
import connectDB from '@/lib/infrastructure/database/connection'
import PropertyModel from '@/lib/infrastructure/database/models/PropertyModel'
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

    // Get stats
    const [totalOrganizations, activeOrganizations, totalProperties] = await Promise.all([
      OrganizationModel.countDocuments(),
      OrganizationModel.countDocuments({ status: 'active' }),
      PropertyModel.countDocuments()
    ])

    // For user count, you'd typically get this from Clerk API
    const totalUsers = 0 // Placeholder - implement Clerk API call if needed

    const stats = {
      totalUsers,
      totalOrganizations,
      totalProperties,
      activeOrganizations
    }

    return NextResponse.json({
      success: true,
      data: stats
    })

  } catch (error) {
    console.error('Superadmin stats error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}