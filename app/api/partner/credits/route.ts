// LIVINNING - API Route: Partner Credits

import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { ApiResponse } from '@/types/api';
import { getCollection } from '@/lib/db/mongodb';
import { COLLECTIONS } from '@/lib/utils/constants';
import logger from '@/lib/utils/logger';

/**
 * GET - Obtener creditos del partner
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

    logger.info(`GET /api/partner/credits - Partner: ${userId}`);

    const creditsCollection = await getCollection(COLLECTIONS.PARTNER_CREDITS);
    const credits = await creditsCollection
      .find({ partnerId: userId })
      .sort({ createdAt: -1 })
      .toArray();

    const mappedCredits = credits.map((credit) => ({
      id: credit._id.toString(),
      amount: credit.amount,
      reason: credit.reason,
      grantedBy: credit.grantedBy,
      grantedByName: credit.grantedByName,
      createdAt: credit.createdAt,
      used: credit.used,
      usedAt: credit.usedAt,
      expiresAt: credit.expiresAt,
    }));

    const totalAvailable = credits
      .filter((c) => !c.used && (!c.expiresAt || c.expiresAt > Date.now()))
      .reduce((sum, c) => sum + c.amount, 0);

    const totalUsed = credits
      .filter((c) => c.used)
      .reduce((sum, c) => sum + c.amount, 0);

    logger.info(`Found ${credits.length} credits for partner ${userId}`);

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: {
          credits: mappedCredits,
          totalAvailable,
          totalUsed,
          total: credits.length,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error(`Error in GET /api/partner/credits: ${error}`);

    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Error al obtener creditos',
        },
      },
      { status: 500 }
    );
  }
}
