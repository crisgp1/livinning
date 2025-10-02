// LIVINNING - API Route: Partner Verification

import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { ApiResponse } from '@/types/api';
import { getCollection } from '@/lib/db/mongodb';
import { COLLECTIONS } from '@/lib/utils/constants';
import logger from '@/lib/utils/logger';

/**
 * GET - Obtener estado de verificacion del partner
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

    logger.info(`GET /api/partner/verification - Partner: ${userId}`);

    const verificationsCollection = await getCollection(COLLECTIONS.PARTNER_VERIFICATIONS);
    const verification = await verificationsCollection.findOne({ partnerId: userId });

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
        },
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error(`Error in GET /api/partner/verification: ${error}`);

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
 * POST - Enviar documentos de verificacion
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
            message: 'Solo los partners pueden enviar verificacion',
          },
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { documents, bankInfo } = body;

    if (!documents || !bankInfo) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Documentos e informacion bancaria son requeridos',
          },
        },
        { status: 400 }
      );
    }

    logger.info(`POST /api/partner/verification - Partner: ${userId}`);

    const verificationsCollection = await getCollection(COLLECTIONS.PARTNER_VERIFICATIONS);

    const verificationDoc = {
      partnerId: userId,
      partnerName: currentUser.fullName || currentUser.firstName || 'Partner',
      partnerEmail: currentUser.emailAddresses[0]?.emailAddress || '',
      status: 'pending',
      documents,
      bankInfo,
      submittedAt: Date.now(),
      updatedAt: Date.now(),
    };

    const existing = await verificationsCollection.findOne({ partnerId: userId });

    if (existing) {
      await verificationsCollection.updateOne(
        { partnerId: userId },
        {
          $set: {
            status: 'pending',
            documents,
            bankInfo,
            submittedAt: Date.now(),
            updatedAt: Date.now(),
          },
        }
      );
    } else {
      await verificationsCollection.insertOne(verificationDoc);
    }

    logger.info(`Verification submitted by partner ${userId}`);

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: {
          message: 'Verificacion enviada exitosamente',
        },
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error(`Error in POST /api/partner/verification: ${error}`);

    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Error al enviar verificacion',
        },
      },
      { status: 500 }
    );
  }
}
