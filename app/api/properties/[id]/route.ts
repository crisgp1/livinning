// ============================================
// LIVINNING - API Route: Get Property by ID
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { findPropertyById } from '@/lib/db/models/property';
import { ApiResponse } from '@/types/api';
import logger from '@/lib/utils/logger';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET - Obtener propiedad por ID
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    logger.info(`📍 GET /api/properties/${id} - Fetching property`);
    const property = await findPropertyById(id);

    if (!property) {
      logger.warn(`❌ Property ${id} not found in database`);
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Propiedad no encontrada',
          },
        },
        { status: 404 }
      );
    }

    logger.info(`✅ Property ${id} found - Status: ${property.status}`);

    // Si la propiedad está inactiva/suspendida, solo permitir acceso a admins o al dueño
    if (property.status === 'inactive') {
      logger.info(`🚫 Property ${id} is inactive - checking permissions`);
      const { userId } = await auth();

      if (!userId) {
        logger.info(`🔒 No user logged in - returning 404 for inactive property ${id}`);
        return NextResponse.json<ApiResponse>(
          {
            success: false,
            error: {
              code: 'NOT_FOUND',
              message: 'Propiedad no encontrada',
            },
          },
          { status: 404 }
        );
      }

      const user = await currentUser();
      const role = (user?.publicMetadata?.role as string)?.toUpperCase();
      const isAdmin = role === 'SUPERADMIN' || role === 'ADMIN' || role === 'HELPDESK';
      const isOwner = property.ownerId === userId;

      logger.info(`👤 User ${userId} - Role: ${role}, isAdmin: ${isAdmin}, isOwner: ${isOwner}`);

      if (!isAdmin && !isOwner) {
        logger.info(`🚫 User ${userId} is not admin or owner - returning 404 for property ${id}`);
        return NextResponse.json<ApiResponse>(
          {
            success: false,
            error: {
              code: 'NOT_FOUND',
              message: 'Propiedad no encontrada',
            },
          },
          { status: 404 }
        );
      } else {
        logger.info(`✅ User ${userId} has permission to view inactive property ${id}`);
      }
    }

    logger.info(`📤 Returning property ${id} to user`);
    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: {
          property,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error(`Error in GET /api/properties/[id]: ${error}`);

    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Error al obtener la propiedad',
        },
      },
      { status: 500 }
    );
  }
}
