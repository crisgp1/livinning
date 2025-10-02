// ============================================
// LIVINNING - API Route: Property Detail
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import {
  findPropertyById,
  incrementPropertyViews,
  deleteProperty
} from '@/lib/db/models/property';
import { ApiResponse } from '@/types/api';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET - Obtener detalle de una propiedad
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    console.log('GET /api/properties/[id] - ID:', id);

    const property = await findPropertyById(id);

    if (!property) {
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

    // Incrementar contador de vistas
    await incrementPropertyViews(id);

    console.log('✅ Property found:', property.title);

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: { property },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in GET /api/properties/[id]:', error);

    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Error al obtener propiedad',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Eliminar una propiedad
 * Requiere autenticación y ser el propietario
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    // Verificar autenticación
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

    const { id } = await params;

    console.log('DELETE /api/properties/[id] - ID:', id, 'User:', userId);

    // Verificar que la propiedad existe
    const property = await findPropertyById(id);

    if (!property) {
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

    // Verificar que el usuario es el propietario
    if (property.ownerId !== userId) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'No tienes permisos para eliminar esta propiedad',
          },
        },
        { status: 403 }
      );
    }

    // Eliminar la propiedad
    const deleted = await deleteProperty(id);

    if (!deleted) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Error al eliminar propiedad',
          },
        },
        { status: 500 }
      );
    }

    console.log('✅ Property deleted:', id);

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: { message: 'Propiedad eliminada exitosamente' },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in DELETE /api/properties/[id]:', error);

    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Error al eliminar propiedad',
        },
      },
      { status: 500 }
    );
  }
}
