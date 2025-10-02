// ============================================
// LIVINNING - API Route: Partner Details
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { ApiResponse } from '@/types/api';
import { getCollection } from '@/lib/db/mongodb';
import { COLLECTIONS } from '@/lib/utils/constants';
import logger from '@/lib/utils/logger';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET - Obtener detalles de un partner específico
 * Solo accesible para SUPERADMIN, ADMIN y HELPDESK
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
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

    const { id } = await params;
    const isSuperAdmin = role === 'SUPERADMIN';

    logger.info(`📋 GET /api/admin/partners/${id} - Requester role: ${role}`);

    // Obtener partner de Clerk
    const partner = await client.users.getUser(id);
    const partnerRole = (partner.publicMetadata?.role as string)?.toUpperCase();

    if (partnerRole !== 'PARTNER') {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Partner no encontrado',
          },
        },
        { status: 404 }
      );
    }

    // Obtener órdenes de servicio
    const ordersCollection = await getCollection(COLLECTIONS.SERVICE_ORDERS);
    const orders = await ordersCollection
      .find({ partnerId: id })
      .sort({ createdAt: -1 })
      .toArray();

    // Calcular estadísticas de órdenes
    const totalOrders = orders.length;
    const completedOrders = orders.filter((o) => o.status === 'completed').length;
    const pendingOrders = orders.filter((o) => o.status === 'assigned' || o.status === 'in_progress').length;
    const cancelledOrders = orders.filter((o) => o.status === 'cancelled').length;

    // Calcular ganancias
    const totalEarnings = orders
      .filter((o) => o.paymentStatus === 'released')
      .reduce((sum, o) => sum + (o.amount || 0), 0);

    const pendingEarnings = orders
      .filter((o) => o.paymentStatus === 'held' && o.status === 'completed')
      .reduce((sum, o) => sum + (o.amount || 0), 0);

    // Tasa de completación
    const completionRate = totalOrders > 0 ? ((completedOrders / totalOrders) * 100).toFixed(1) : '0';

    // Historial de órdenes (últimas 20)
    const orderHistory = orders.slice(0, 20).map((order) => ({
      id: order._id.toString(),
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      serviceType: order.serviceType,
      amount: order.amount,
      status: order.status,
      paymentStatus: order.paymentStatus,
      createdAt: order.createdAt,
      completedAt: order.completedAt,
    }));

    // Acciones legales y suspensiones (solo para SUPERADMIN)
    let legalActions: any[] = [];
    if (isSuperAdmin) {
      // Obtener reportes relacionados
      const reportsCollection = await getCollection(COLLECTIONS.REPORTS);
      const reports = await reportsCollection
        .find({ agencyId: id })
        .sort({ createdAt: -1 })
        .toArray();

      legalActions = reports.map((report) => ({
        id: report._id.toString(),
        type: report.type,
        reason: report.reason,
        status: report.status,
        action: report.moderationAction,
        reviewNotes: report.reviewNotes,
        reviewedBy: report.reviewedByName,
        createdAt: report.createdAt,
        reviewedAt: report.reviewedAt,
      }));
    }

    // Historial de suspensiones
    const suspensionHistory: any[] = [];
    if (partner.publicMetadata?.isSuspended) {
      suspensionHistory.push({
        suspendedAt: partner.publicMetadata?.suspendedAt,
        suspendedBy: partner.publicMetadata?.suspendedBy,
        reason: partner.publicMetadata?.suspensionReason,
        count: partner.publicMetadata?.suspensionCount || 1,
        isPermanent: partner.publicMetadata?.isPermanentlySuspended || false,
      });
    }

    // Obtener datos de calendario (fechas ocupadas basadas en órdenes)
    const bookedDates = orders
      .filter((o) => o.scheduledDate && (o.status === 'assigned' || o.status === 'in_progress'))
      .map((o) => new Date(o.scheduledDate!));

    // Obtener conversacion activa
    const conversationsCollection = await getCollection(COLLECTIONS.PARTNER_CONVERSATIONS);
    const activeConversation = await conversationsCollection.findOne({
      partnerId: id,
      status: 'open',
    });

    let messageHistory: any[] = [];
    let conversationClosed = false;

    if (activeConversation) {
      // Obtener mensajes de la conversacion activa
      const messagesCollection = await getCollection(COLLECTIONS.PARTNER_MESSAGES);
      const messages = await messagesCollection
        .find({ conversationId: activeConversation._id.toString() })
        .sort({ createdAt: 1 })
        .limit(50)
        .toArray();

      messageHistory = messages.map((msg) => ({
        id: msg._id.toString(),
        message: msg.message,
        sentByAdmin: msg.sentByAdmin,
        senderName: msg.senderName,
        senderId: msg.senderId,
        createdAt: msg.createdAt,
        read: msg.read,
      }));
    } else {
      conversationClosed = true;
    }

    const partnerDetails = {
      id: partner.id,
      email: partner.emailAddresses[0]?.emailAddress || '',
      name: partner.fullName || partner.firstName || 'Sin nombre',
      companyName: partner.publicMetadata?.companyName as string || '',
      avatar: partner.imageUrl,
      servicesOffered: (partner.publicMetadata?.servicesOffered as string[]) || [],
      lastActivity: partner.publicMetadata?.lastActivity as number,

      // Estadísticas de órdenes
      stats: {
        totalOrders,
        completedOrders,
        pendingOrders,
        cancelledOrders,
        totalEarnings,
        pendingEarnings,
        completionRate,
      },

      // Historial de órdenes
      orderHistory: isSuperAdmin ? orderHistory : orderHistory.slice(0, 10),

      // Calendario
      bookedDates,
      availableDates: [], // TODO: Implementar lógica de disponibilidad personalizada

      // Historial de mensajes
      messageHistory,
      conversationClosed,

      // Acciones legales (solo SUPERADMIN)
      ...(isSuperAdmin && { legalActions }),

      // Suspensiones
      suspensionHistory,

      // Estado
      isSuspended: partner.publicMetadata?.isSuspended || false,
      suspensionReason: partner.publicMetadata?.suspensionReason as string,
      suspensionCount: (partner.publicMetadata?.suspensionCount as number) || 0,
      isPermanentlySuspended: partner.publicMetadata?.isPermanentlySuspended || false,

      // Fechas
      createdAt: partner.createdAt,
      lastSignInAt: partner.lastSignInAt,
    };

    logger.info(`✅ Partner details fetched successfully for ${id}`);

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: { partner: partnerDetails },
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error(`❌ Error in GET /api/admin/partners/[id]: ${error}`);

    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Error al obtener detalles del partner',
        },
      },
      { status: 500 }
    );
  }
}
