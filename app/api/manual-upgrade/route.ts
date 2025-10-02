// ============================================
// LIVINNING - Manual Upgrade Endpoint (TEMPORAL)
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser, clerkClient } from '@clerk/nextjs/server';
import { UpgradePackageType } from '@/types/upgrade';

/**
 * Endpoint TEMPORAL para actualizar manualmente usuarios que ya pagaron
 * mientras configuramos el webhook de Stripe
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { packageType } = body as { packageType: UpgradePackageType };

    if (!packageType) {
      return NextResponse.json(
        { error: 'packageType es requerido' },
        { status: 400 }
      );
    }

    console.log('Manual upgrade requested:', { userId, packageType });

    const currentPropertyLimit = (user.publicMetadata?.propertyLimit as number) || 1;
    let updatedMetadata: Record<string, any> = { ...user.publicMetadata };

    switch (packageType) {
      case 'single':
        updatedMetadata.propertyLimit = currentPropertyLimit + 1;
        updatedMetadata.lastUpgrade = new Date().toISOString();
        updatedMetadata.lastUpgradeType = 'single';
        console.log(`Límite incrementado de ${currentPropertyLimit} a ${currentPropertyLimit + 1}`);
        break;

      case 'package_5':
        updatedMetadata.propertyLimit = currentPropertyLimit + 5;
        updatedMetadata.lastUpgrade = new Date().toISOString();
        updatedMetadata.lastUpgradeType = 'package_5';
        console.log(`Límite incrementado de ${currentPropertyLimit} a ${currentPropertyLimit + 5}`);
        break;

      case 'agency':
        updatedMetadata.role = 'AGENCY';
        updatedMetadata.propertyLimit = 'unlimited';
        updatedMetadata.subscriptionStatus = 'active';
        updatedMetadata.upgradedToAgencyAt = new Date().toISOString();
        updatedMetadata.verificationStatus = 'pending';
        updatedMetadata.isVerified = false;
        console.log('Usuario convertido a AGENCY (propiedades ilimitadas)');
        console.log('Estado de verificación: pending - Necesita verificarse');
        break;

      default:
        return NextResponse.json(
          { error: `Tipo de paquete desconocido: ${packageType}` },
          { status: 400 }
        );
    }

    const client = await clerkClient();
    await client.users.updateUser(userId, {
      publicMetadata: updatedMetadata,
    });

    console.log('✅ Metadata actualizado exitosamente:', updatedMetadata);

    return NextResponse.json({
      success: true,
      message: 'Usuario actualizado exitosamente',
      newLimit: updatedMetadata.propertyLimit,
    });
  } catch (error) {
    console.error('Error en manual upgrade:', error);
    return NextResponse.json(
      { error: 'Error al actualizar usuario' },
      { status: 500 }
    );
  }
}
