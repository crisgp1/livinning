// ============================================
// LIVINNING - API Route: Suspend User
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
 * PUT - Suspender usuario
 * Solo accesible para SUPERADMIN y ADMIN
 * Principio de Responsabilidad Única: Solo suspende usuarios
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

    // Solo SUPERADMIN y ADMIN pueden suspender
    if (role !== 'SUPERADMIN' && role !== 'ADMIN') {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'No tienes permisos para suspender usuarios',
          },
        },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { reason } = body;

    if (!reason) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Se requiere una razón para la suspensión',
          },
        },
        { status: 400 }
      );
    }

    // No permitir suspender a SUPERADMIN
    const targetUser = await client.users.getUser(id);
    const targetRole = (targetUser.publicMetadata?.role as string)?.toUpperCase();

    if (targetRole === 'SUPERADMIN') {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'No se puede suspender a un SUPERADMIN',
          },
        },
        { status: 403 }
      );
    }

    // Verificar si ya fue suspendido antes
    const wasPreviouslySuspended = targetUser.publicMetadata?.isSuspended === true;
    const suspensionCount = (targetUser.publicMetadata?.suspensionCount as number) || 0;
    const isPermanentlySuspended = wasPreviouslySuspended && suspensionCount >= 1;

    // Suspender usuario en Clerk
    await client.users.updateUserMetadata(id, {
      publicMetadata: {
        ...targetUser.publicMetadata,
        isSuspended: true,
        suspendedAt: new Date().toISOString(),
        suspendedBy: userId,
        suspensionReason: reason,
        suspensionCount: suspensionCount + 1,
        isPermanentlySuspended: isPermanentlySuspended,
      },
    });

    // Revocar todas las sesiones activas del usuario para forzar re-login
    // Esto asegura que el middleware detecte la suspensión inmediatamente
    try {
      const sessions = await client.sessions.getSessionList({ userId: id });
      for (const session of sessions.data) {
        await client.sessions.revokeSession(session.id);
      }
      console.log(`✅ Revoked ${sessions.data.length} active session(s) for user ${id}`);
    } catch (sessionError) {
      console.error('Error revoking sessions:', sessionError);
      // Continuar aunque falle la revocación de sesiones
    }

    console.log(`✅ User ${id} suspended by ${userId}`);

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: {
          message: 'Usuario suspendido exitosamente',
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in PUT /api/admin/users/[id]/suspend:', error);

    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Error al suspender usuario',
        },
      },
      { status: 500 }
    );
  }
}
