// ============================================
// LIVINNING - API Route: Partner Services Management
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { ApiResponse } from '@/types/api';
import { SERVICE_TYPES } from '@/lib/utils/constants';
import logger from '@/lib/utils/logger';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * POST - Agregar servicio a un partner
 * Solo accesible para SUPERADMIN y ADMIN
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

    // Verificar permisos (solo SUPERADMIN y ADMIN)
    if (role !== 'SUPERADMIN' && role !== 'ADMIN') {
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
    const { serviceType } = body;

    // Validar que el servicio existe
    if (!serviceType || !SERVICE_TYPES[serviceType as keyof typeof SERVICE_TYPES]) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Tipo de servicio inválido',
          },
        },
        { status: 400 }
      );
    }

    logger.info(`➕ Adding service ${serviceType} to partner ${id}`);

    // Obtener partner actual
    const partner = await client.users.getUser(id);
    const currentServices = (partner.publicMetadata?.servicesOffered as string[]) || [];

    // Verificar si el servicio ya existe
    if (currentServices.includes(serviceType)) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'El servicio ya está agregado',
          },
        },
        { status: 400 }
      );
    }

    // Agregar el nuevo servicio
    const updatedServices = [...currentServices, serviceType];

    await client.users.updateUserMetadata(id, {
      publicMetadata: {
        ...partner.publicMetadata,
        servicesOffered: updatedServices,
      },
    });

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: {
          message: 'Servicio agregado exitosamente',
          servicesOffered: updatedServices,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error(`❌ Error in POST /api/admin/partners/[id]/services: ${error}`);

    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Error al agregar servicio',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Eliminar servicio de un partner
 * Solo accesible para SUPERADMIN
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
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

    // Verificar permisos (solo SUPERADMIN)
    if (role !== 'SUPERADMIN') {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Solo SUPERADMIN puede eliminar servicios',
          },
        },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { serviceType } = body;

    if (!serviceType) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Tipo de servicio es requerido',
          },
        },
        { status: 400 }
      );
    }

    logger.info(`➖ Removing service ${serviceType} from partner ${id}`);

    // Obtener partner actual
    const partner = await client.users.getUser(id);
    const currentServices = (partner.publicMetadata?.servicesOffered as string[]) || [];

    // Filtrar el servicio
    const updatedServices = currentServices.filter((s) => s !== serviceType);

    if (updatedServices.length === currentServices.length) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'El servicio no existe en este partner',
          },
        },
        { status: 404 }
      );
    }

    await client.users.updateUserMetadata(id, {
      publicMetadata: {
        ...partner.publicMetadata,
        servicesOffered: updatedServices,
      },
    });

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: {
          message: 'Servicio eliminado exitosamente',
          servicesOffered: updatedServices,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error(`❌ Error in DELETE /api/admin/partners/[id]/services: ${error}`);

    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Error al eliminar servicio',
        },
      },
      { status: 500 }
    );
  }
}
