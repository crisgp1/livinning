// ============================================
// LIVINNING - API Route: User Notifications
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getCollection } from '@/lib/db/mongodb';
import { COLLECTIONS } from '@/lib/utils/constants';
import { ApiResponse } from '@/types/api';
import { UserNotificationDocument } from '@/types/database';

/**
 * GET - Obtener notificaciones del usuario actual
 * Accessible para cualquier usuario autenticado
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'No autenticado',
          },
        },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const unreadOnly = searchParams.get('unreadOnly') === 'true';

    // Obtener notificaciones del usuario desde MongoDB
    const collection = await getCollection<UserNotificationDocument>(
      COLLECTIONS.USER_NOTIFICATIONS
    );

    const query: any = { userId: userId };
    if (unreadOnly) {
      query.isRead = false;
    }

    const notifications = await collection
      .find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();

    // Contar notificaciones no leídas
    const unreadCount = await collection.countDocuments({
      userId: userId,
      isRead: false,
    });

    // Mapear notificaciones a formato de respuesta
    const mappedNotifications = notifications.map((notification) => ({
      id: notification._id.toString(),
      type: notification.type,
      title: notification.title,
      message: notification.message,
      severity: notification.severity,
      isRead: notification.isRead,
      createdBy: notification.createdBy,
      createdByName: notification.createdByName,
      createdAt: notification.createdAt.toISOString(),
      readAt: notification.readAt?.toISOString(),
    }));

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: {
          notifications: mappedNotifications,
          unreadCount,
          total: mappedNotifications.length,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in GET /api/notifications:', error);

    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Error al obtener notificaciones',
        },
      },
      { status: 500 }
    );
  }
}
