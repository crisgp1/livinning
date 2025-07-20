import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getUserOrganizationInfo } from '@/lib/utils/user-helpers'

export async function GET() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const orgInfo = await getUserOrganizationInfo()
    
    return NextResponse.json({
      success: true,
      data: orgInfo.hasOrganization ? orgInfo.organization : null
    })

  } catch (error) {
    console.error('Error fetching organization:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch organization' },
      { status: 500 }
    )
  }
}