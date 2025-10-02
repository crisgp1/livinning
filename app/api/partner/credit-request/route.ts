// LIVINNING - API Route: Partner Credit Request

import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { ApiResponse } from '@/types/api';
import { getCollection } from '@/lib/db/mongodb';
import { COLLECTIONS, CREDIT_REQUEST_COOLDOWN } from '@/lib/utils/constants';
import logger from '@/lib/utils/logger';

/**
 * GET - Obtener solicitudes de credito del partner
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

    logger.info(`GET /api/partner/credit-request - Partner: ${userId}`);

    const requestsCollection = await getCollection(COLLECTIONS.PARTNER_CREDIT_REQUESTS);
    const requests = await requestsCollection
      .find({ partnerId: userId })
      .sort({ createdAt: -1 })
      .toArray();

    const mappedRequests = requests.map((req) => ({
      id: req._id.toString(),
      amount: req.amount,
      reason: req.reason,
      justification: req.justification,
      status: req.status,
      createdAt: req.createdAt,
      reviewedAt: req.reviewedAt,
      reviewedBy: req.reviewedBy,
      reviewedByName: req.reviewedByName,
      reviewNotes: req.reviewNotes,
      counterOfferAmount: req.counterOfferAmount,
    }));

    logger.info(`Found ${requests.length} credit requests for partner ${userId}`);

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: {
          requests: mappedRequests,
          total: requests.length,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error(`Error in GET /api/partner/credit-request: ${error}`);

    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Error al obtener solicitudes',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * POST - Crear solicitud de credito
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
            message: 'Solo los partners pueden solicitar creditos',
          },
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { amount, reason, justification } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'El monto debe ser mayor a 0',
          },
        },
        { status: 400 }
      );
    }

    if (!reason) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'La razon es requerida',
          },
        },
        { status: 400 }
      );
    }

    if (!justification) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'La justificacion es requerida',
          },
        },
        { status: 400 }
      );
    }

    logger.info(`POST /api/partner/credit-request - Partner: ${userId}, Amount: ${amount}`);

    const requestsCollection = await getCollection(COLLECTIONS.PARTNER_CREDIT_REQUESTS);

    // Verificar si hay un rechazo reciente (cooldown de 3 meses)
    const lastRejection = await requestsCollection.findOne(
      {
        partnerId: userId,
        status: 'rejected',
      },
      { sort: { reviewedAt: -1 } }
    );

    if (lastRejection && lastRejection.reviewedAt) {
      const timeSinceRejection = Date.now() - lastRejection.reviewedAt;
      const cooldownRemaining = CREDIT_REQUEST_COOLDOWN - timeSinceRejection;

      if (cooldownRemaining > 0) {
        const daysRemaining = Math.ceil(cooldownRemaining / (24 * 60 * 60 * 1000));
        return NextResponse.json<ApiResponse>(
          {
            success: false,
            error: {
              code: 'COOLDOWN_ACTIVE',
              message: `Debes esperar ${daysRemaining} dias mas para solicitar otro credito despues de un rechazo`,
            },
          },
          { status: 400 }
        );
      }
    }

    const requestDoc = {
      partnerId: userId,
      partnerName: currentUser.fullName || currentUser.firstName || 'Partner',
      partnerEmail: currentUser.emailAddresses[0]?.emailAddress || '',
      amount: parseFloat(amount),
      reason,
      justification,
      status: 'pending',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const result = await requestsCollection.insertOne(requestDoc);

    logger.info(`Credit request created by partner ${userId} - Request ID: ${result.insertedId}`);

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: {
          requestId: result.insertedId.toString(),
          message: 'Solicitud de credito enviada exitosamente',
        },
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error(`Error in POST /api/partner/credit-request: ${error}`);

    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Error al crear solicitud',
        },
      },
      { status: 500 }
    );
  }
}
