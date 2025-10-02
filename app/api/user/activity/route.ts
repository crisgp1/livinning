// LIVINNING - API Route: Update User Activity Status

import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { ApiResponse } from '@/types/api';
import logger from '@/lib/utils/logger';

/**
 * POST - Actualizar ultima actividad del usuario
 */
export async function POST(request: NextRequest) {
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

    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        lastActivity: Date.now(),
      },
    });

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: {
          timestamp: Date.now(),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error(`Error in POST /api/user/activity: ${error}`);

    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Error al actualizar actividad',
        },
      },
      { status: 500 }
    );
  }
}
