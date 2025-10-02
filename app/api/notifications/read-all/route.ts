// ============================================
// LIVINNING - API Route: Mark All Notifications as Read
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getCollection } from '@/lib/db/mongodb';
import { COLLECTIONS } from '@/lib/utils/constants';
import { ApiResponse } from '@/types/api';
import { UserNotificationDocument } from '@/types/database';

/**
 * PUT - Marcar todas las notificaciones como leídas
 */
export async function PUT(request: NextRequest) {
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

    const collection = await getCollection<UserNotificationDocument>(
      COLLECTIONS.USER_NOTIFICATIONS
    );

    // Marcar todas las notificaciones no leídas como leídas
    const result = await collection.updateMany(
      {
        userId: userId,
        isRead: false,
      },
      {
        $set: {
          isRead: true,
          readAt: new Date(),
        },
      }
    );

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: {
          message: 'Todas las notificaciones marcadas como leídas',
          count: result.modifiedCount,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in PUT /api/notifications/read-all:', error);

    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Error al marcar notificaciones como leídas',
        },
      },
      { status: 500 }
    );
  }
}
