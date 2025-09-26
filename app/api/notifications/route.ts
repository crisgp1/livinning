import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { NotificationService } from '@/lib/application/services/NotificationService'
import { NotificationStatus } from '@/lib/infrastructure/database/models/NotificationModel'

export async function GET(request: Request) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') as NotificationStatus | undefined
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    const { notifications, total } = await NotificationService.getUserNotifications(
      userId,
      status,
      limit,
      offset
    )

    return NextResponse.json({
      success: true,
      data: notifications,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    })

  } catch (error) {
    console.error('Notifications API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch notifications' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { action, notificationId } = await request.json()

    if (action === 'mark_all_read') {
      const success = await NotificationService.markAllAsRead(userId)

      return NextResponse.json({
        success,
        message: success ? 'All notifications marked as read' : 'Failed to mark notifications as read'
      })
    }

    if (action === 'mark_read' && notificationId) {
      const success = await NotificationService.markAsRead(notificationId, userId)

      return NextResponse.json({
        success,
        message: success ? 'Notification marked as read' : 'Failed to mark notification as read'
      })
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action or missing parameters' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Notifications PUT API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update notifications' },
      { status: 500 }
    )
  }
}