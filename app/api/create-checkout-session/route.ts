// ============================================
// LIVINNING - API Route: Create Stripe Checkout Session
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { getStripe } from '@/lib/stripe/client';
import { ApiResponse } from '@/types/api';
import { z } from 'zod';

const checkoutSchema = z.object({
  priceId: z.string().min(1, 'Price ID es requerido'),
});

// POST - Create checkout session
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    const clerkUser = await currentUser();

    if (!userId || !clerkUser) {
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

    const userRole = (clerkUser.publicMetadata?.role as string)?.toUpperCase() || 'USER';

    // Only AGENCY users can create subscriptions
    if (userRole !== 'AGENCY') {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Solo las agencias pueden suscribirse',
          },
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validation = checkoutSchema.safeParse(body);

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

    const { priceId } = validation.data;

    // Get the base URL for redirects
    const protocol = request.headers.get('x-forwarded-proto') || 'http';
    const host = request.headers.get('host') || 'localhost:3000';
    const baseUrl = `${protocol}://${host}`;

    // Create Stripe checkout session
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/dashboard/agency?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/dashboard/agency/suscripcion`,
      customer_email: clerkUser.primaryEmailAddress?.emailAddress || '',
      client_reference_id: userId,
      metadata: {
        userId: userId,
        userRole: userRole,
      },
      subscription_data: {
        metadata: {
          userId: userId,
          userRole: userRole,
        },
        trial_period_days: 14, // 14-day free trial
      },
    });

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: { url: session.url },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in POST /api/create-checkout-session:', error);

    // Handle Stripe-specific errors
    if (error instanceof Error) {
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
          message: 'Error al crear sesión de pago',
        },
      },
      { status: 500 }
    );
  }
}
