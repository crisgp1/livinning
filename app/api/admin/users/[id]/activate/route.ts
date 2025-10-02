// ============================================
// LIVINNING - API Route: Activate User
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { ApiResponse } from '@/types/api';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * PUT - Activar usuario (quitar suspensión)
 * Solo accesible para SUPERADMIN y ADMIN
 * Principio de Responsabilidad Única: Solo activa usuarios
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

    // Obtener el usuario actual para verificar rol
    const client = await clerkClient();
    const currentUser = await client.users.getUser(userId);
    const role = (currentUser.publicMetadata?.role as string)?.toUpperCase();

    // Solo SUPERADMIN y ADMIN pueden activar
    if (role !== 'SUPERADMIN' && role !== 'ADMIN') {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'No tienes permisos para activar usuarios',
          },
        },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Obtener usuario objetivo
    const targetUser = await client.users.getUser(id);

    // Verificar si el usuario tiene suspensión permanente
    const isPermanentlySuspended = targetUser.publicMetadata?.isPermanentlySuspended === true;

    if (isPermanentlySuspended && role !== 'SUPERADMIN') {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Este usuario no puede ser reactivado',
          },
        },
        { status: 403 }
      );
    }

    // Activar usuario en Clerk (remover suspensión)
    await client.users.updateUserMetadata(id, {
      publicMetadata: {
        ...targetUser.publicMetadata,
        isSuspended: false,
        suspendedAt: null,
        suspendedBy: null,
        suspensionReason: null,
        // Solo SUPERADMIN puede remover suspensión permanente
        ...(role === 'SUPERADMIN' && {
          isPermanentlySuspended: false,
          suspensionCount: 0,
        }),
      },
    });

    console.log(`✅ User ${id} activated by ${userId} (role: ${role})`);

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: {
          message: 'Usuario activado exitosamente',
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in PUT /api/admin/users/[id]/activate:', error);

    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Error al activar usuario',
        },
      },
      { status: 500 }
    );
  }
}
