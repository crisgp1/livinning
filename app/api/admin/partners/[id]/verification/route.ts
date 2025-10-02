// LIVINNING - API Route: Admin Review Partner Verification

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
 * GET - Obtener verificacion de un partner especifico
 * Solo ADMIN y SUPERADMIN
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

    const client = await clerkClient();
    const currentUser = await client.users.getUser(userId);
    const role = (currentUser.publicMetadata?.role as string)?.toUpperCase();

    if (role !== 'SUPERADMIN' && role !== 'ADMIN') {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Solo ADMIN y SUPERADMIN pueden revisar verificaciones',
          },
        },
        { status: 403 }
      );
    }

    const { id } = await params;

    logger.info(`GET /api/admin/partners/${id}/verification - Admin: ${userId}`);

    const verificationsCollection = await getCollection(COLLECTIONS.PARTNER_VERIFICATIONS);
    const verification = await verificationsCollection.findOne({ partnerId: id });

    if (!verification) {
      return NextResponse.json<ApiResponse>(
        {
          success: true,
          data: {
            status: 'not_started',
            documents: {},
            bankInfo: null,
            submittedAt: null,
            reviewedAt: null,
            reviewedBy: null,
            reviewNotes: null,
          },
        },
        { status: 200 }
      );
    }

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: {
          status: verification.status,
          documents: verification.documents || {},
          bankInfo: verification.bankInfo || null,
          submittedAt: verification.submittedAt || null,
          reviewedAt: verification.reviewedAt || null,
          reviewedBy: verification.reviewedBy || null,
          reviewNotes: verification.reviewNotes || null,
          partnerName: verification.partnerName,
          partnerEmail: verification.partnerEmail,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error(`Error in GET /api/admin/partners/[id]/verification: ${error}`);

    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Error al obtener verificacion',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * PUT - Actualizar estado de verificacion
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
            message: 'Solo ADMIN y SUPERADMIN pueden actualizar verificaciones',
          },
        },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { status, reviewNotes } = body;

    if (!status) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'El estado es requerido',
          },
        },
        { status: 400 }
      );
    }

    const validStatuses = ['in_review', 'verified', 'rejected', 'resubmit_required'];
    if (!validStatuses.includes(status)) {
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

    logger.info(`PUT /api/admin/partners/${id}/verification - Status: ${status} by ${userId}`);

    const verificationsCollection = await getCollection(COLLECTIONS.PARTNER_VERIFICATIONS);

    const result = await verificationsCollection.updateOne(
      { partnerId: id },
      {
        $set: {
          status,
          reviewNotes: reviewNotes || '',
          reviewedAt: Date.now(),
          reviewedBy: userId,
          reviewedByName: currentUser.fullName || currentUser.firstName || 'Admin',
          updatedAt: Date.now(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Verificacion no encontrada',
          },
        },
        { status: 404 }
      );
    }

    logger.info(`Verification ${status} for partner ${id} by admin ${userId}`);

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: {
          message: 'Verificacion actualizada exitosamente',
        },
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error(`Error in PUT /api/admin/partners/[id]/verification: ${error}`);

    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Error al actualizar verificacion',
        },
      },
      { status: 500 }
    );
  }
}
