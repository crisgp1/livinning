// ============================================
// LIVINNING - API Route: Create Property Package Checkout
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { getStripe } from '@/lib/stripe/client';
import { ApiResponse } from '@/types/api';
import { z } from 'zod';
import { UpgradePackageType } from '@/types/upgrade';
import { UPGRADE_PACKAGES } from '@/lib/utils/upgrade-plans';

const propertyCheckoutSchema = z.object({
  packageType: z.enum(['single', 'package_5', 'agency']),
  userId: z.string(),
  userEmail: z.string().email(),
  userName: z.string(),
});

/**
 * POST - Create checkout session for property packages
 * Principio de Responsabilidad Única: Solo maneja la creación de sesiones de checkout
 */
export async function POST(request: NextRequest) {
  try {
    console.log('=== Iniciando creación de checkout session ===');

    const { userId } = await auth();
    const clerkUser = await currentUser();

    console.log('Usuario autenticado:', userId);

    if (!userId || !clerkUser) {
      console.error('Usuario no autenticado');
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

    const body = await request.json();
    console.log('Body recibido:', body);

    const validation = propertyCheckoutSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Datos de entrada inválidos',
            details: validation.error.issues,
          },
        },
        { status: 400 }
      );
    }

    const { packageType, userEmail, userName } = validation.data;

    console.log('Buscando paquete:', packageType);

    // Buscar el paquete seleccionado
    const selectedPackage = UPGRADE_PACKAGES.find(pkg => pkg.id === packageType);

    if (!selectedPackage) {
      console.error('Paquete no encontrado:', packageType);
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'INVALID_PACKAGE',
            message: 'Paquete no válido',
          },
        },
        { status: 400 }
      );
    }

    console.log('Paquete encontrado:', selectedPackage.name, '- Precio:', selectedPackage.price);

    // Get the base URL for redirects
    const protocol = request.headers.get('x-forwarded-proto') || 'http';
    const host = request.headers.get('host') || 'localhost:3000';
    const baseUrl = `${protocol}://${host}`;

    console.log('Base URL:', baseUrl);

    const stripe = getStripe();
    console.log('Stripe client inicializado');

    // Determinar el modo de pago según el tipo de paquete
    const isAgencyPackage = packageType === 'agency';
    console.log('Modo de pago:', isAgencyPackage ? 'subscription' : 'payment');

    // Crear sesión de checkout con estructura correcta para Stripe 2025
    console.log('Creando sesión de checkout...');
    const session = await stripe.checkout.sessions.create({
      mode: isAgencyPackage ? 'subscription' : 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'mxn',
            product_data: {
              name: selectedPackage.name,
              description: selectedPackage.description,
            },
            unit_amount: selectedPackage.price * 100, // Convertir a centavos
            ...(isAgencyPackage && {
              recurring: {
                interval: 'month',
              },
            }),
          },
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/dashboard/user?upgrade=success&package=${packageType}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/dashboard/user?upgrade=cancelled`,
      customer_email: userEmail,
      client_reference_id: userId,
      metadata: {
        userId,
        packageType,
        userName,
        properties: String(selectedPackage.properties),
      },
      ...(isAgencyPackage && {
        subscription_data: {
          metadata: {
            userId,
            packageType,
            userName,
          },
        },
      }),
    });

    console.log('Sesión creada exitosamente:', session.id);
    console.log('URL de checkout:', session.url);

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: { url: session.url },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in POST /api/create-property-checkout:', error);

    // Manejo específico de errores de Stripe
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });

      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'STRIPE_ERROR',
            message: error.message || 'Error al crear sesión de pago',
          },
        },
        { status: 500 }
      );
    }

    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Error desconocido al crear sesión de pago',
        },
      },
      { status: 500 }
    );
  }
}
