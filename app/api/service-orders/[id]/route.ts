// ============================================
// LIVINNING - API Route: Service Order Details
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { getCollection } from '@/lib/db/mongodb';
import { COLLECTIONS } from '@/lib/utils/constants';
import { ApiResponse } from '@/types/api';
import { ServiceOrderDocument } from '@/types/database';
import { ObjectId } from 'mongodb';
import logger from '@/lib/utils/logger';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * PATCH - Actualizar estado de orden
 * - HELPDESK/ADMIN: Puede asignar partner, contactar, agregar notas
 * - PARTNER: Puede aceptar, iniciar, completar (con evidencia)
 * - SUPERADMIN: Puede liberar pago
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
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

    const { id } = await params;
    const body = await request.json();
    const { action, ...data } = body;

    logger.info(`🔄 PATCH /api/service-orders/${id} - Action: ${action}, User: ${userId}, Role: ${role}`);

    const ordersCollection = await getCollection<ServiceOrderDocument>(COLLECTIONS.SERVICE_ORDERS);
    const order = await ordersCollection.findOne({ _id: new ObjectId(id) });

    if (!order) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Orden no encontrada',
          },
        },
        { status: 404 }
      );
    }

    let updateData: any = { updatedAt: new Date() };

    // --- Acciones de HELPDESK/ADMIN ---
    if (action === 'assign_partner') {
      if (role !== 'HELPDESK' && role !== 'ADMIN' && role !== 'SUPERADMIN') {
        return NextResponse.json<ApiResponse>(
          {
            success: false,
            error: {
              code: 'FORBIDDEN',
              message: 'Solo HELPDESK/ADMIN pueden asignar partners',
            },
          },
          { status: 403 }
        );
      }

      const partnerId = data.partnerId;
      if (!partnerId) {
        return NextResponse.json<ApiResponse>(
          {
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'partnerId es requerido',
            },
          },
          { status: 400 }
        );
      }

      const partner = await client.users.getUser(partnerId);

      updateData = {
        ...updateData,
        partnerId,
        partnerName: partner.fullName || partner.firstName || 'Partner',
        assignedAt: new Date(),
        assignedBy: userId,
        status: 'assigned',
      };

      logger.info(`👤 Partner ${partnerId} assigned to order ${id}`);
    }

    // --- Acción: Contactar partner (HELPDESK) ---
    else if (action === 'contact_partner') {
      if (role !== 'HELPDESK' && role !== 'ADMIN' && role !== 'SUPERADMIN') {
        return NextResponse.json<ApiResponse>(
          {
            success: false,
            error: {
              code: 'FORBIDDEN',
              message: 'Solo HELPDESK puede registrar contactos',
            },
          },
          { status: 403 }
        );
      }

      updateData = {
        ...updateData,
        lastContactedAt: new Date(),
        contactedBy: userId,
        helpdeskNotes: data.notes || order.helpdeskNotes,
      };

      logger.info(`📞 HELPDESK contacted partner for order ${id}`);
    }

    // --- Acciones de PARTNER ---
    else if (action === 'start_service') {
      if (role !== 'PARTNER' || order.partnerId !== userId) {
        return NextResponse.json<ApiResponse>(
          {
            success: false,
            error: {
              code: 'FORBIDDEN',
              message: 'Solo el partner asignado puede iniciar el servicio',
            },
          },
          { status: 403 }
        );
      }

      updateData = {
        ...updateData,
        status: 'in_progress',
        beforePhotos: data.beforePhotos || [],
      };

      logger.info(`🔧 Partner started service for order ${id}`);
    }

    else if (action === 'complete_service') {
      if (role !== 'PARTNER' || order.partnerId !== userId) {
        return NextResponse.json<ApiResponse>(
          {
            success: false,
            error: {
              code: 'FORBIDDEN',
              message: 'Solo el partner asignado puede completar el servicio',
            },
          },
          { status: 403 }
        );
      }

      updateData = {
        ...updateData,
        status: 'completed',
        completedAt: new Date(),
        afterPhotos: data.afterPhotos || [],
        partnerNotes: data.partnerNotes,
      };

      logger.info(`✅ Partner completed service for order ${id}`);

      // TODO: Notificar al cliente para que califique el servicio
    }

    // --- Acción: Liberar pago (SUPERADMIN) ---
    else if (action === 'release_payment') {
      if (role !== 'SUPERADMIN') {
        return NextResponse.json<ApiResponse>(
          {
            success: false,
            error: {
              code: 'FORBIDDEN',
              message: 'Solo SUPERADMIN puede liberar pagos',
            },
          },
          { status: 403 }
        );
      }

      if (order.paymentStatus !== 'held') {
        return NextResponse.json<ApiResponse>(
          {
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'El pago ya fue liberado o reembolsado',
            },
          },
          { status: 400 }
        );
      }

      updateData = {
        ...updateData,
        paymentStatus: 'released',
        releasedAt: new Date(),
      };

      logger.info(`💰 Payment released for order ${id}`);

      // TODO: Transferir dinero al partner vía Stripe
    }

    // --- Acción: Cancelar orden ---
    else if (action === 'cancel') {
      if (role !== 'ADMIN' && role !== 'SUPERADMIN' && order.customerId !== userId) {
        return NextResponse.json<ApiResponse>(
          {
            success: false,
            error: {
              code: 'FORBIDDEN',
              message: 'No tienes permisos para cancelar esta orden',
            },
          },
          { status: 403 }
        );
      }

      updateData = {
        ...updateData,
        status: 'cancelled',
        cancelledAt: new Date(),
        paymentStatus: order.paymentStatus === 'held' ? 'refunded' : order.paymentStatus,
      };

      logger.info(`❌ Order ${id} cancelled`);

      // TODO: Procesar reembolso si aplica
    }

    else {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Acción no válida',
          },
        },
        { status: 400 }
      );
    }

    // Actualizar orden
    const result = await ordersCollection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateData },
      { returnDocument: 'after' }
    );

    if (!result) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Orden no encontrada',
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: {
          message: 'Orden actualizada exitosamente',
          order: {
            id: result._id.toString(),
            status: result.status,
            paymentStatus: result.paymentStatus,
          },
        },
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error(`❌ Error in PATCH /api/service-orders/[id]: ${error}`);

    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Error al actualizar orden',
        },
      },
      { status: 500 }
    );
  }
}
