// ============================================
// LIVINNING - API Route: Send User Notification
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
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
 * POST - Enviar notificación a usuario
 * Solo accesible para SUPERADMIN, ADMIN y HELPDESK
 * Principio de Responsabilidad Única: Solo envía notificaciones
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
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

    // Solo SUPERADMIN, ADMIN y HELPDESK pueden enviar notificaciones
    if (role !== 'SUPERADMIN' && role !== 'ADMIN' && role !== 'HELPDESK') {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'No tienes permisos para enviar notificaciones',
          },
        },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { type, title, message, severity } = body;

    // Validar campos requeridos
    if (!type || !title || !message || !severity) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'type, title, message y severity son requeridos',
          },
        },
        { status: 400 }
      );
    }

    // Validar valores permitidos
    const validTypes = ['warning', 'violation', 'suspension', 'info'];
    const validSeverities = ['low', 'medium', 'high', 'critical'];

    if (!validTypes.includes(type)) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: `type debe ser uno de: ${validTypes.join(', ')}`,
          },
        },
        { status: 400 }
      );
    }

    if (!validSeverities.includes(severity)) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: `severity debe ser uno de: ${validSeverities.join(', ')}`,
          },
        },
        { status: 400 }
      );
    }

    // Crear notificación en MongoDB
    const collection = await getCollection<UserNotificationDocument>(
      COLLECTIONS.USER_NOTIFICATIONS
    );

    const notification: Omit<UserNotificationDocument, '_id'> = {
      userId: id,
      type,
      title,
      message,
      severity,
      isRead: false,
      createdBy: userId,
      createdByName: currentUser.fullName || currentUser.firstName || 'Admin',
      createdAt: new Date(),
    };

    await collection.insertOne(notification as any);

    console.log(`✅ Notification sent to user ${id} by ${userId}`);

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: {
          message: 'Notificación enviada exitosamente',
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in POST /api/admin/users/[id]/notify:', error);

    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Error al enviar notificación',
        },
      },
      { status: 500 }
    );
  }
}
