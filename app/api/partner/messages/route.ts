// LIVINNING - API Route: Partner Messages

import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { ApiResponse } from '@/types/api';
import { getCollection } from '@/lib/db/mongodb';
import { COLLECTIONS } from '@/lib/utils/constants';
import logger from '@/lib/utils/logger';

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
 * GET - Obtener mensajes del partner
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
    const currentUser = await client.users.getUser(userId);
    const role = (currentUser.publicMetadata?.role as string)?.toUpperCase();

    if (role !== 'PARTNER') {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Solo los partners pueden acceder a esta informacion',
          },
        },
        { status: 403 }
      );
    }

    logger.info(`GET /api/partner/messages - Partner: ${userId}`);

    // Obtener conversacion activa
    const conversationsCollection = await getCollection(COLLECTIONS.PARTNER_CONVERSATIONS);
    const activeConversation = await conversationsCollection.findOne({
      partnerId: userId,
      status: 'open',
    });

    if (!activeConversation) {
      return NextResponse.json<ApiResponse>(
        {
          success: true,
          data: {
            messages: [],
            total: 0,
            conversationClosed: true,
          },
        },
        { status: 200 }
      );
    }

    const messagesCollection = await getCollection(COLLECTIONS.PARTNER_MESSAGES);
    const messages = await messagesCollection
      .find({
        conversationId: activeConversation._id.toString(),
      })
      .sort({ createdAt: 1 })
      .limit(100)
      .toArray();

    const messageHistory = messages.map((msg) => ({
        id: msg._id.toString(),
        message: msg.message,
        sentByAdmin: msg.sentByAdmin,
        senderName: msg.senderName,
        senderId: msg.senderId,
        createdAt: msg.createdAt,
        read: msg.read,
      }));

    logger.info(`Found ${messages.length} messages for partner ${userId}`);

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: {
          messages: messageHistory,
          total: messages.length,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error(`Error in GET /api/partner/messages: ${error}`);

    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Error al obtener mensajes',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * POST - Enviar respuesta del partner
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
    const currentUser = await client.users.getUser(userId);
    const role = (currentUser.publicMetadata?.role as string)?.toUpperCase();

    if (role !== 'PARTNER') {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Solo los partners pueden enviar mensajes',
          },
        },
        { status: 403 }
      );
    }

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

    logger.info(`POST /api/partner/messages - Partner: ${userId}`);

    // Obtener o crear conversacion activa
    const conversationsCollection = await getCollection(COLLECTIONS.PARTNER_CONVERSATIONS);
    let activeConversation = await conversationsCollection.findOne({
      partnerId: userId,
      status: 'open',
    });

    if (!activeConversation) {
      // Crear nueva conversacion
      const newConversation = {
        partnerId: userId,
        partnerName: currentUser.fullName || currentUser.firstName || 'Partner',
        status: 'open',
        createdAt: Date.now(),
      };

      const convResult = await conversationsCollection.insertOne(newConversation);
      activeConversation = { ...newConversation, _id: convResult.insertedId };
      logger.info(`Created new conversation for partner ${userId}`);
    }

    const messagesCollection = await getCollection(COLLECTIONS.PARTNER_MESSAGES);

    const messageDocument: PartnerMessageDocument = {
      conversationId: activeConversation._id.toString(),
      partnerId: userId,
      partnerName: currentUser.fullName || currentUser.firstName || 'Partner',
      message: message.trim(),
      sentByAdmin: false,
      senderId: userId,
      senderName: currentUser.fullName || currentUser.firstName || 'Partner',
      createdAt: Date.now(),
      read: false,
    };

    const result = await messagesCollection.insertOne(messageDocument);

    logger.info(`Message sent by partner ${userId} - Message ID: ${result.insertedId}`);

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
    logger.error(`Error in POST /api/partner/messages: ${error}`);

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
