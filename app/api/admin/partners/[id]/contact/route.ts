// ============================================
// LIVINNING - API Route: Partner Contact Notes
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { ApiResponse } from '@/types/api';
import { getCollection } from '@/lib/db/mongodb';
import { COLLECTIONS } from '@/lib/utils/constants';
import logger from '@/lib/utils/logger';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * POST - Guardar nota de contacto con un partner
 * Solo accesible para SUPERADMIN, ADMIN y HELPDESK
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

    // Verificar permisos
    if (role !== 'SUPERADMIN' && role !== 'ADMIN' && role !== 'HELPDESK') {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'No tienes permisos para realizar esta acción',
          },
        },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { note } = body;

    if (!note || !note.trim()) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'La nota es requerida',
          },
        },
        { status: 400 }
      );
    }

    logger.info(`📝 Saving contact note for partner ${id} by ${currentUser.fullName || userId}`);

    // Actualizar metadata del partner con la última fecha de contacto
    await client.users.updateUserMetadata(id, {
      publicMetadata: {
        lastContactedAt: new Date().toISOString(),
        lastContactedBy: userId,
      },
    });

    // Guardar la nota en una colección de contact notes (opcional)
    // Por ahora, podríamos guardar en USER_NOTIFICATIONS o crear una nueva colección
    const notificationsCollection = await getCollection(COLLECTIONS.USER_NOTIFICATIONS);

    await notificationsCollection.insertOne({
      userId: id,
      type: 'info',
      title: 'Nota de Contacto',
      message: note,
      severity: 'low',
      isRead: false,
      createdBy: userId,
      createdByName: currentUser.fullName || currentUser.firstName || 'Admin',
      createdAt: new Date(),
    });

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: {
          message: 'Nota guardada exitosamente',
        },
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error(`❌ Error in POST /api/admin/partners/[id]/contact: ${error}`);

    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Error al guardar nota',
        },
      },
      { status: 500 }
    );
  }
}
