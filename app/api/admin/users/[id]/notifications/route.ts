// ============================================
// LIVINNING - API Route: Get User Notifications
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { getCollection } from '@/lib/db/mongodb';
import { COLLECTIONS } from '@/lib/utils/constants';
import { ApiResponse } from '@/types/api';
import { UserNotificationDocument } from '@/types/database';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET - Obtener historial de notificaciones de un usuario
 * Solo accesible para SUPERADMIN, ADMIN y HELPDESK
 * Principio de Responsabilidad Única: Solo obtiene notificaciones
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
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

    // Obtener el usuario actual para verificar rol
    const client = await clerkClient();
    const currentUser = await client.users.getUser(userId);
    const role = (currentUser.publicMetadata?.role as string)?.toUpperCase();

    // Solo SUPERADMIN, ADMIN y HELPDESK pueden ver notificaciones
    if (role !== 'SUPERADMIN' && role !== 'ADMIN' && role !== 'HELPDESK') {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'No tienes permisos para ver notificaciones',
          },
        },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Obtener notificaciones del usuario desde MongoDB
    const collection = await getCollection<UserNotificationDocument>(
      COLLECTIONS.USER_NOTIFICATIONS
    );

    const notifications = await collection
      .find({ userId: id })
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();

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
          total: mappedNotifications.length,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in GET /api/admin/users/[id]/notifications:', error);

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
