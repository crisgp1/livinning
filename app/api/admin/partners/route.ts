// ============================================
// LIVINNING - API Route: Admin Partners Management
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { ApiResponse } from '@/types/api';
import { getCollection } from '@/lib/db/mongodb';
import { COLLECTIONS } from '@/lib/utils/constants';
import logger from '@/lib/utils/logger';

/**
 * GET - Obtener lista de partners
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

    // Verificar permisos
    if (role !== 'SUPERADMIN' && role !== 'ADMIN' && role !== 'HELPDESK') {
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
    const status = searchParams.get('status') || ''; // active, suspended

    logger.info(`📋 GET /api/admin/partners - Page: ${page}, Limit: ${limit}, Search: "${search}", Status: "${status}"`);

    // Calcular offset
    const offset = (page - 1) * limit;

    // Obtener usuarios de Clerk con rol PARTNER
    const response = await client.users.getUserList({
      limit: 100, // Obtener más para filtrar
      offset: 0,
      ...(search && { query: search }),
    });

    // Filtrar solo partners
    let partners = response.data.filter(
      (user) => (user.publicMetadata?.role as string)?.toUpperCase() === 'PARTNER'
    );

    logger.info(`✅ Found ${partners.length} partners before filtering`);

    // Filtrar por estado de suspensión si se especifica
    if (status === 'active') {
      partners = partners.filter((user) => !user.publicMetadata?.isSuspended);
    } else if (status === 'suspended') {
      partners = partners.filter((user) => user.publicMetadata?.isSuspended === true);
    }

    logger.info(`✅ After status filter: ${partners.length} partners`);

    // Obtener órdenes de servicio de MongoDB
    const ordersCollection = await getCollection(COLLECTIONS.SERVICE_ORDERS);

    // Mapear partners con información adicional
    const mappedPartners = await Promise.all(
      partners.map(async (user) => {
        // Obtener órdenes asignadas al partner
        const orders = await ordersCollection
          .find({ partnerId: user.id })
          .toArray();

        const totalOrders = orders.length;
        const completedOrders = orders.filter((o) => o.status === 'completed').length;
        const pendingOrders = orders.filter((o) => o.status === 'assigned' || o.status === 'in_progress').length;

        // Calcular ganancias (solo órdenes con pago liberado)
        const totalEarnings = orders
          .filter((o) => o.paymentStatus === 'released')
          .reduce((sum, o) => sum + (o.amount || 0), 0);

        const pendingEarnings = orders
          .filter((o) => o.paymentStatus === 'held' && o.status === 'completed')
          .reduce((sum, o) => sum + (o.amount || 0), 0);

        return {
          id: user.id,
          email: user.emailAddresses[0]?.emailAddress || '',
          name: user.fullName || user.firstName || 'Sin nombre',
          companyName: user.publicMetadata?.companyName as string || '',
          avatar: user.imageUrl,
          servicesOffered: (user.publicMetadata?.servicesOffered as string[]) || [],
          totalOrders,
          completedOrders,
          pendingOrders,
          totalEarnings,
          pendingEarnings,
          isSuspended: user.publicMetadata?.isSuspended || false,
          suspensionReason: user.publicMetadata?.suspensionReason as string,
          suspensionCount: (user.publicMetadata?.suspensionCount as number) || 0,
          isPermanentlySuspended: user.publicMetadata?.isPermanentlySuspended || false,
          createdAt: user.createdAt,
          lastSignInAt: user.lastSignInAt,
        };
      })
    );

    // Aplicar paginación manual después de filtrar
    const total = mappedPartners.length;
    const paginatedPartners = mappedPartners.slice(offset, offset + limit);

    logger.info(`✅ Returning ${paginatedPartners.length} partners (total: ${total})`);

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: {
          partners: paginatedPartners,
          total,
          page,
          limit,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error(`❌ Error in GET /api/admin/partners: ${error}`);

    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Error al obtener partners',
        },
      },
      { status: 500 }
    );
  }
}
