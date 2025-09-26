import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { NotificationService } from '@/lib/application/services/NotificationService'

export async function GET() {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const count = await NotificationService.getUnreadCount(userId)

    return NextResponse.json({
      success: true,
      data: { count }
    })

  } catch (error) {
    console.error('Unread count API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch unread count' },
      { status: 500 }
    )
  }
}