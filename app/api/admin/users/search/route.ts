// ============================================
// LIVINNING - API Route: Quick User Search
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { ApiResponse } from '@/types/api';

/**
 * GET - Búsqueda rápida de usuarios (para Spotlight)
 * Solo accesible para SUPERADMIN, ADMIN y HELPDESK
 * Principio de Responsabilidad Única: Solo búsqueda rápida
 */
export async function GET(request: NextRequest) {
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

    // Solo SUPERADMIN, ADMIN y HELPDESK pueden buscar usuarios
    if (role !== 'SUPERADMIN' && role !== 'ADMIN' && role !== 'HELPDESK') {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'No tienes permisos para buscar usuarios',
          },
        },
        { status: 403 }
      );
    }

    // Obtener query de búsqueda
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';

    if (!query.trim()) {
      return NextResponse.json<ApiResponse>(
        {
          success: true,
          data: {
            users: [],
          },
        },
        { status: 200 }
      );
    }

    // Buscar usuarios en Clerk
    const response = await client.users.getUserList({
      query: query,
      limit: 10, // Limitar a 10 resultados para búsqueda rápida
    });

    // Mapear usuarios a formato simplificado
    const mappedUsers = response.data.map((user) => ({
      id: user.id,
      email: user.emailAddresses[0]?.emailAddress || '',
      name: user.fullName || user.firstName || 'Sin nombre',
      role: (user.publicMetadata?.role as string)?.toUpperCase() || 'USER',
      avatar: user.imageUrl,
      isSuspended: user.publicMetadata?.isSuspended || false,
    }));

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: {
          users: mappedUsers,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in GET /api/admin/users/search:', error);

    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Error al buscar usuarios',
        },
      },
      { status: 500 }
    );
  }
}
