// ============================================
// LIVINNING - API Route: Mark Notification as Read
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getCollection } from '@/lib/db/mongodb';
import { COLLECTIONS } from '@/lib/utils/constants';
import { ObjectId } from 'mongodb';
import { ApiResponse } from '@/types/api';
import { UserNotificationDocument } from '@/types/database';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * PUT - Marcar notificación como leída
 * Solo puede marcar sus propias notificaciones
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
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

    const { id } = await params;

    // Validar ObjectId
    if (!ObjectId.isValid(id)) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'ID de notificación inválido',
          },
        },
        { status: 400 }
      );
    }

    const collection = await getCollection<UserNotificationDocument>(
      COLLECTIONS.USER_NOTIFICATIONS
    );

    // Verificar que la notificación pertenece al usuario
    const notification = await collection.findOne({
      _id: new ObjectId(id),
      userId: userId,
    });

    if (!notification) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Notificación no encontrada',
          },
        },
        { status: 404 }
      );
    }

    // Marcar como leída
    await collection.updateOne(
      { _id: new ObjectId(id) },
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
          message: 'Notificación marcada como leída',
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in PUT /api/notifications/[id]/read:', error);

    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Error al marcar notificación como leída',
        },
      },
      { status: 500 }
    );
  }
}
