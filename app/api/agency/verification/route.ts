// ============================================
// LIVINNING - API Route: Agency Verification
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { VerificationService } from '@/lib/services/verification.service';
import { AgencyVerificationData } from '@/types/verification';
import { ApiResponse } from '@/types/api';

/**
 * POST - Enviar solicitud de verificación
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
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

    const userRole = (user.publicMetadata?.role as string) || 'USER';

    // Solo agencias pueden verificarse
    if (userRole !== 'AGENCY') {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Solo las agencias pueden verificarse',
          },
        },
        { status: 403 }
      );
    }

    const verificationData: AgencyVerificationData = await request.json();

    console.log('Recibiendo solicitud de verificación:', userId);
    console.log('Datos:', {
      companyName: verificationData.companyName,
      taxId: verificationData.taxId,
      documentsCount: verificationData.documents?.length || 0,
    });

    // Enviar verificación
    const result = await VerificationService.submitVerification(userId, verificationData);

    if (result.success) {
      console.log('✅ Verificación enviada exitosamente');
      return NextResponse.json<ApiResponse>(
        {
          success: true,
          data: { message: result.message },
        },
        { status: 200 }
      );
    } else {
      console.error('❌ Error al enviar verificación:', result.message);
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'VERIFICATION_ERROR',
            message: result.message,
          },
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error in POST /api/agency/verification:', error);

    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : 'Error al procesar verificación',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * GET - Obtener estado de verificación
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

    const verification = await VerificationService.getVerificationStatus(userId);

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: verification,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in GET /api/agency/verification:', error);

    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Error al obtener verificación',
        },
      },
      { status: 500 }
    );
  }
}
