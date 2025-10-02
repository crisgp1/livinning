// ============================================
// LIVINNING - API Route: Send Message to Partner
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

interface PartnerMessageDocument {
  conversationId: string;
  partnerId: string;
  partnerName: string;
  message: string;
  sentByAdmin: boolean;
  senderId: string;
  senderName: string;
  createdAt: number;
  read: boolean;
}

/**
 * POST - Enviar mensaje a un partner
 * Solo accesible para SUPERADMIN, ADMIN y HELPDESK
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

    // Verificar permisos
    if (role !== 'SUPERADMIN' && role !== 'ADMIN' && role !== 'HELPDESK') {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'No tienes permisos para enviar mensajes',
          },
        },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { message } = body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'El mensaje es requerido',
          },
        },
        { status: 400 }
      );
    }

    logger.info(`📨 POST /api/admin/partners/${id}/message - Sender: ${currentUser.fullName || currentUser.firstName}`);

    // Verificar que el destinatario es un partner
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

    // Obtener o crear conversacion activa
    const conversationsCollection = await getCollection(COLLECTIONS.PARTNER_CONVERSATIONS);
    let activeConversation = await conversationsCollection.findOne({
      partnerId: id,
      status: 'open',
    });

    if (!activeConversation) {
      // Crear nueva conversacion
      const newConversation = {
        partnerId: id,
        partnerName: partner.fullName || partner.firstName || 'Partner',
        status: 'open',
        createdAt: Date.now(),
      };

      const convResult = await conversationsCollection.insertOne(newConversation);
      activeConversation = { ...newConversation, _id: convResult.insertedId };
      logger.info(`Created new conversation for partner ${id}`);
    }

    // Guardar mensaje en MongoDB
    const messagesCollection = await getCollection(COLLECTIONS.PARTNER_MESSAGES);

    const messageDocument: PartnerMessageDocument = {
      conversationId: activeConversation._id.toString(),
      partnerId: id,
      partnerName: partner.fullName || partner.firstName || 'Partner',
      message: message.trim(),
      sentByAdmin: true,
      senderId: userId,
      senderName: currentUser.fullName || currentUser.firstName || 'Admin',
      createdAt: Date.now(),
      read: false,
    };

    const result = await messagesCollection.insertOne(messageDocument);

    logger.info(`✅ Message sent to partner ${id} - Message ID: ${result.insertedId}`);

    // TODO: Enviar notificación al partner (email, push notification, etc.)

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: {
          messageId: result.insertedId.toString(),
          message: 'Mensaje enviado exitosamente',
        },
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error(`❌ Error in POST /api/admin/partners/[id]/message: ${error}`);

    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Error al enviar mensaje',
        },
      },
      { status: 500 }
    );
  }
}
