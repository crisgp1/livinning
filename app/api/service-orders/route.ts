// ============================================
// LIVINNING - API Route: Service Orders
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { getCollection } from '@/lib/db/mongodb';
import { COLLECTIONS } from '@/lib/utils/constants';
import { ApiResponse } from '@/types/api';
import { ServiceOrderDocument } from '@/types/database';
import logger from '@/lib/utils/logger';

/**
 * POST - Cliente solicita un servicio
 * Crea una orden, cobra al cliente, y retiene el dinero
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
    const user = await client.users.getUser(userId);

    const body = await request.json();
    const {
      serviceType,
      description,
      urgency,
      address,
      city,
      state,
      coordinates,
      scheduledDate,
      amount,
    } = body;

    logger.info(`📦 POST /api/service-orders - Creating order for user ${userId}`);

    // Validaciones
    if (!serviceType || !description || !address || !city || !state || !amount) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Todos los campos son requeridos',
          },
        },
        { status: 400 }
      );
    }

    // Generar número de orden único
    const ordersCollection = await getCollection<ServiceOrderDocument>(COLLECTIONS.SERVICE_ORDERS);
    const count = await ordersCollection.countDocuments();
    const orderNumber = `ORD-${new Date().getFullYear()}-${String(count + 1).padStart(6, '0')}`;

    // TODO: Integrar con Stripe para cobrar al cliente
    // Por ahora, simulamos que el pago está en estado "held"
    const paymentId = `pay_sim_${Date.now()}`;

    // Crear orden de servicio
    const serviceOrder: Omit<ServiceOrderDocument, '_id'> = {
      orderNumber,

      // Cliente
      customerId: userId,
      customerName: user.fullName || user.firstName || 'Cliente',
      customerEmail: user.emailAddresses[0]?.emailAddress || '',
      customerPhone: user.publicMetadata?.phone as string,

      // Servicio
      serviceType,
      description,
      urgency: urgency || 'medium',

      // Ubicación
      address,
      city,
      state,
      coordinates,

      // Estado inicial
      status: 'pending', // Esperando asignación a partner

      // Pago - dinero retenido por la plataforma
      amount: parseFloat(amount),
      currency: 'USD',
      paymentStatus: 'held', // Dinero retenido
      paymentId,
      paidAt: new Date(),

      // Fecha programada
      scheduledDate: scheduledDate ? new Date(scheduledDate) : undefined,

      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await ordersCollection.insertOne(serviceOrder as any);

    logger.info(`✅ Service order created: ${orderNumber} (ID: ${result.insertedId})`);

    // TODO: Notificar a HELPDESK sobre nueva orden pendiente

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: {
          message: 'Orden de servicio creada exitosamente',
          order: {
            id: result.insertedId.toString(),
            orderNumber,
            status: 'pending',
            amount: serviceOrder.amount,
            paymentStatus: 'held',
          },
        },
      },
      { status: 201 }
    );
  } catch (error) {
    logger.error(`❌ Error in POST /api/service-orders: ${error}`);

    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Error al crear orden de servicio',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * GET - Obtener órdenes de servicio
 * - Clientes: ven sus propias órdenes
 * - Partners: ven órdenes asignadas a ellos
 * - HELPDESK/ADMIN/SUPERADMIN: ven todas las órdenes
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

    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const role = (user.publicMetadata?.role as string)?.toUpperCase();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status') || '';

    const offset = (page - 1) * limit;

    const ordersCollection = await getCollection<ServiceOrderDocument>(COLLECTIONS.SERVICE_ORDERS);

    // Construir query según el rol
    let query: any = {};

    if (role === 'PARTNER') {
      // Partner solo ve órdenes asignadas a él
      query.partnerId = userId;
    } else if (role === 'USER' || role === 'AGENCY') {
      // Cliente ve solo sus órdenes
      query.customerId = userId;
    } else if (role !== 'HELPDESK' && role !== 'ADMIN' && role !== 'SUPERADMIN') {
      // Otros roles no tienen acceso
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'No tienes permisos para ver órdenes',
          },
        },
        { status: 403 }
      );
    }

    // Filtrar por estado si se especifica
    if (status) {
      query.status = status;
    }

    const total = await ordersCollection.countDocuments(query);
    const orders = await ordersCollection
      .find(query)
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .toArray();

    const mappedOrders = orders.map((order) => ({
      id: order._id.toString(),
      orderNumber: order.orderNumber,
      customerId: order.customerId,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      serviceType: order.serviceType,
      description: order.description,
      urgency: order.urgency,
      address: order.address,
      city: order.city,
      state: order.state,
      partnerId: order.partnerId,
      partnerName: order.partnerName,
      status: order.status,
      amount: order.amount,
      currency: order.currency,
      paymentStatus: order.paymentStatus,
      scheduledDate: order.scheduledDate,
      createdAt: order.createdAt,
      completedAt: order.completedAt,
      rating: order.rating,
    }));

    logger.info(`📋 GET /api/service-orders - Returning ${mappedOrders.length} orders for user ${userId} (role: ${role})`);

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: {
          orders: mappedOrders,
          total,
          page,
          limit,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error(`❌ Error in GET /api/service-orders: ${error}`);

    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Error al obtener órdenes',
        },
      },
      { status: 500 }
    );
  }
}
