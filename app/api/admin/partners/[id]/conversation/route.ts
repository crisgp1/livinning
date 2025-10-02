// LIVINNING - API Route: Close Partner Conversation

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
 * POST - Cerrar conversacion con partner
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

    const client = await clerkClient();
    const currentUser = await client.users.getUser(userId);
    const role = (currentUser.publicMetadata?.role as string)?.toUpperCase();

    if (role !== 'SUPERADMIN' && role !== 'ADMIN' && role !== 'HELPDESK') {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'No tienes permisos para cerrar conversaciones',
          },
        },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { reason } = body;

    logger.info(`POST /api/admin/partners/${id}/conversation - Closing by ${userId}`);

    const conversationsCollection = await getCollection(COLLECTIONS.PARTNER_CONVERSATIONS);

    // Cerrar conversacion activa
    const result = await conversationsCollection.updateOne(
      { partnerId: id, status: 'open' },
      {
        $set: {
          status: 'closed',
          closedAt: Date.now(),
          closedBy: userId,
          closedByName: currentUser.fullName || currentUser.firstName || 'Admin',
          closeReason: reason || 'Conversacion finalizada',
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'No hay conversacion activa para cerrar',
          },
        },
        { status: 404 }
      );
    }

    logger.info(`Conversation closed for partner ${id}`);

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: {
          message: 'Conversacion cerrada exitosamente',
        },
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error(`Error in POST /api/admin/partners/[id]/conversation: ${error}`);

    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Error al cerrar conversacion',
        },
      },
      { status: 500 }
    );
  }
}
