// LIVINNING - API Route: Grant Credits to Partner

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
 * POST - Otorgar credito a partner
 * Solo ADMIN y SUPERADMIN
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

    const client = await clerkClient();
    const currentUser = await client.users.getUser(userId);
    const role = (currentUser.publicMetadata?.role as string)?.toUpperCase();

    if (role !== 'SUPERADMIN' && role !== 'ADMIN') {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Solo ADMIN y SUPERADMIN pueden otorgar creditos',
          },
        },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { amount, reason, expiresInDays } = body;

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

    logger.info(`POST /api/admin/partners/${id}/credits - Granting $${amount} by ${userId}`);

    const creditsCollection = await getCollection(COLLECTIONS.PARTNER_CREDITS);

    const creditDoc = {
      partnerId: id,
      partnerName: partner.fullName || partner.firstName || 'Partner',
      amount: parseFloat(amount),
      reason,
      grantedBy: userId,
      grantedByName: currentUser.fullName || currentUser.firstName || 'Admin',
      createdAt: Date.now(),
      used: false,
      expiresAt: expiresInDays ? Date.now() + expiresInDays * 24 * 60 * 60 * 1000 : undefined,
    };

    const result = await creditsCollection.insertOne(creditDoc);

    logger.info(`Credit granted to partner ${id} - Credit ID: ${result.insertedId}`);

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: {
          creditId: result.insertedId.toString(),
          message: 'Credito otorgado exitosamente',
        },
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error(`Error in POST /api/admin/partners/[id]/credits: ${error}`);

    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Error al otorgar credito',
        },
      },
      { status: 500 }
    );
  }
}
