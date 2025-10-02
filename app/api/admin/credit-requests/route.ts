// LIVINNING - API Route: Admin Credit Requests

import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { ApiResponse } from '@/types/api';
import { getCollection } from '@/lib/db/mongodb';
import { COLLECTIONS } from '@/lib/utils/constants';
import logger from '@/lib/utils/logger';

/**
 * GET - Obtener todas las solicitudes de credito
 * Solo ADMIN y SUPERADMIN
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

    if (role !== 'SUPERADMIN' && role !== 'ADMIN') {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Solo ADMIN y SUPERADMIN pueden ver solicitudes',
          },
        },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    logger.info(`GET /api/admin/credit-requests - Admin: ${userId}`);

    const requestsCollection = await getCollection(COLLECTIONS.PARTNER_CREDIT_REQUESTS);

    const query = status ? { status } : {};
    const requests = await requestsCollection
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    const mappedRequests = requests.map((req) => ({
      id: req._id.toString(),
      partnerId: req.partnerId,
      partnerName: req.partnerName,
      partnerEmail: req.partnerEmail,
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

    logger.info(`Found ${requests.length} credit requests`);

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
    logger.error(`Error in GET /api/admin/credit-requests: ${error}`);

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
