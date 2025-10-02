// LIVINNING - API Route: Admin Review Credit Request

import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { ApiResponse } from '@/types/api';
import { getCollection } from '@/lib/db/mongodb';
import { COLLECTIONS } from '@/lib/utils/constants';
import logger from '@/lib/utils/logger';
import { ObjectId } from 'mongodb';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * PUT - Aprobar o rechazar solicitud de credito
 * Solo ADMIN y SUPERADMIN
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
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

    if (role !== 'SUPERADMIN' && role !== 'ADMIN') {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Solo ADMIN y SUPERADMIN pueden revisar solicitudes',
          },
        },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { status, reviewNotes, expiresInDays, counterOfferAmount } = body;

    if (!status || !['approved', 'rejected', 'counter_offer'].includes(status)) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Estado invalido',
          },
        },
        { status: 400 }
      );
    }

    // Verificar que SuperAdmin hizo contraoferta
    if (status === 'counter_offer') {
      if (role !== 'SUPERADMIN') {
        return NextResponse.json<ApiResponse>(
          {
            success: false,
            error: {
              code: 'FORBIDDEN',
              message: 'Solo SUPERADMIN puede hacer contraofertas',
            },
          },
          { status: 403 }
        );
      }

      if (!counterOfferAmount || counterOfferAmount <= 0) {
        return NextResponse.json<ApiResponse>(
          {
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'El monto de contraoferta es requerido',
            },
          },
          { status: 400 }
        );
      }
    }

    logger.info(`PUT /api/admin/credit-requests/${id} - Status: ${status} by ${userId}`);

    const requestsCollection = await getCollection(COLLECTIONS.PARTNER_CREDIT_REQUESTS);

    const creditRequest = await requestsCollection.findOne({ _id: new ObjectId(id) });

    if (!creditRequest) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Solicitud no encontrada',
          },
        },
        { status: 404 }
      );
    }

    if (creditRequest.status !== 'pending') {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Esta solicitud ya fue revisada',
          },
        },
        { status: 400 }
      );
    }

    const updateData: any = {
      status,
      reviewNotes: reviewNotes || '',
      reviewedAt: Date.now(),
      reviewedBy: userId,
      reviewedByName: currentUser.fullName || currentUser.firstName || 'Admin',
      updatedAt: Date.now(),
    };

    if (status === 'counter_offer') {
      updateData.counterOfferAmount = parseFloat(counterOfferAmount);
    }

    const result = await requestsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (status === 'approved' || status === 'counter_offer') {
      const creditsCollection = await getCollection(COLLECTIONS.PARTNER_CREDITS);

      const finalAmount = status === 'counter_offer'
        ? parseFloat(counterOfferAmount)
        : creditRequest.amount;

      const creditDoc = {
        partnerId: creditRequest.partnerId,
        partnerName: creditRequest.partnerName,
        amount: finalAmount,
        reason: creditRequest.reason,
        grantedBy: userId,
        grantedByName: currentUser.fullName || currentUser.firstName || 'Admin',
        createdAt: Date.now(),
        used: false,
        expiresAt: expiresInDays ? Date.now() + expiresInDays * 24 * 60 * 60 * 1000 : undefined,
        requestId: id,
        isCounterOffer: status === 'counter_offer',
        originalAmount: status === 'counter_offer' ? creditRequest.amount : undefined,
      };

      await creditsCollection.insertOne(creditDoc);

      logger.info(`Credit granted from request ${id} to partner ${creditRequest.partnerId} - Amount: ${finalAmount}`);
    }

    logger.info(`Credit request ${id} ${status} by admin ${userId}`);

    let message = 'Solicitud procesada exitosamente';
    if (status === 'approved') message = 'Solicitud aprobada exitosamente';
    else if (status === 'rejected') message = 'Solicitud rechazada exitosamente';
    else if (status === 'counter_offer') message = 'Contraoferta enviada exitosamente';

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: { message },
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error(`Error in PUT /api/admin/credit-requests/[id]: ${error}`);

    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Error al actualizar solicitud',
        },
      },
      { status: 500 }
    );
  }
}
