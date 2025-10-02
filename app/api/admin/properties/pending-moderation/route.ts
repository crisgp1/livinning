// ============================================
// LIVINNING - API Route: Get Properties Pending Moderation
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { getCollection } from '@/lib/db/mongodb';
import { COLLECTIONS } from '@/lib/utils/constants';
import { ApiResponse } from '@/types/api';
import { PropertyDocument } from '@/types/database';
import { propertyDocumentToProperty } from '@/lib/db/models/property';

/**
 * GET - Obtener propiedades pendientes de moderación
 * Solo accesible para SUPERADMIN, ADMIN y HELPDESK
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

    // Solo SUPERADMIN, ADMIN y HELPDESK pueden ver propiedades pendientes
    if (role !== 'SUPERADMIN' && role !== 'ADMIN' && role !== 'HELPDESK') {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'No tienes permisos para ver propiedades pendientes',
          },
        },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status') || 'all'; // all, pending, needs_correction, active, rejected

    // Construir query
    const query: any = {};

    if (status === 'pending') {
      query.moderationStatus = { $in: [null, 'pending'] };
    } else if (status === 'needs_correction') {
      query.moderationStatus = 'needs_correction';
    } else if (status === 'active') {
      query.status = 'active';
    } else if (status === 'rejected') {
      query.status = 'rejected';
    }
    // Si status === 'all', no se aplica filtro (muestra todas)

    const collection = await getCollection<PropertyDocument>(
      COLLECTIONS.PROPERTIES
    );

    // Obtener total
    const total = await collection.countDocuments(query);

    // Obtener propiedades
    const skip = (page - 1) * limit;
    const properties = await collection
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    // Mapear a formato de respuesta
    const mappedProperties = properties.map(propertyDocumentToProperty);

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: {
          properties: mappedProperties,
          total,
          page,
          limit,
          hasMore: total > page * limit,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in GET /api/admin/properties/pending-moderation:', error);

    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Error al obtener propiedades pendientes',
        },
      },
      { status: 500 }
    );
  }
}
