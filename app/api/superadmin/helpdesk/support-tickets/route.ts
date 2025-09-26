import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { isSuperAdminById } from '@/lib/utils/superadmin'

export async function GET(request: Request) {
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

    // For now, return empty array as support tickets system is not fully implemented
    // This would be replaced with actual support ticket database queries
    const supportTickets: any[] = []

    return NextResponse.json({
      success: true,
      data: supportTickets,
      pagination: {
        total: 0,
        limit: 50,
        offset: 0,
        hasMore: false
      }
    })

  } catch (error) {
    console.error('Support tickets error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch support tickets' },
      { status: 500 }
    )
  }
}