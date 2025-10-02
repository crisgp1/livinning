// ============================================
// LIVINNING - API Route: Admin Users Management
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { ApiResponse } from '@/types/api';

/**
 * GET - Obtener lista de usuarios
 * Solo accesible para SUPERADMIN y HELPDESK
 * Principio de Responsabilidad Única: Solo lista usuarios
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

    // Verificar permisos (solo SUPERADMIN y HELPDESK)
    if (role !== 'SUPERADMIN' && role !== 'HELPDESK' && role !== 'ADMIN') {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'No tienes permisos para acceder a esta información',
          },
        },
        { status: 403 }
      );
    }

    // Obtener parámetros de búsqueda
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const roleFilter = searchParams.get('role') || '';

    // Calcular offset
    const offset = (page - 1) * limit;

    // Construir query
    const query: any = {};

    if (search) {
      query.query = search;
    }

    // Obtener usuarios de Clerk
    const response = await client.users.getUserList({
      limit,
      offset,
      ...(search && { query: search }),
    });

    // Filtrar por rol si se especifica
    let users = response.data;
    if (roleFilter) {
      users = users.filter(
        (user) => (user.publicMetadata?.role as string)?.toUpperCase() === roleFilter.toUpperCase()
      );
    }

    // Mapear usuarios a formato simplificado
    const mappedUsers = users.map((user) => ({
      id: user.id,
      email: user.emailAddresses[0]?.emailAddress || '',
      name: user.fullName || user.firstName || 'Sin nombre',
      role: (user.publicMetadata?.role as string)?.toUpperCase() || 'USER',
      avatar: user.imageUrl,
      createdAt: user.createdAt,
      lastSignInAt: user.lastSignInAt,
      isSuspended: user.publicMetadata?.isSuspended || false,
      suspensionReason: user.publicMetadata?.suspensionReason as string,
      propertyCount: user.publicMetadata?.propertyCount || 0,
    }));

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: {
          users: mappedUsers,
          total: response.totalCount,
          page,
          limit,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in GET /api/admin/users:', error);

    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Error al obtener usuarios',
        },
      },
      { status: 500 }
    );
  }
}
