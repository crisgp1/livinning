// ============================================
// LIVINNING - Webhook de Stripe
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { getStripe } from '@/lib/stripe/client';
import { UpgradeService } from '@/lib/services/upgrade.service';
import { UpgradePackageType } from '@/types/upgrade';

/**
 * Webhook handler para eventos de Stripe
 * Principio de Responsabilidad Única: Solo maneja webhooks de Stripe
 */
export async function POST(request: NextRequest) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  if (!signature) {
    console.error('No signature found in request');
    return NextResponse.json(
      { error: 'No signature found' },
      { status: 400 }
    );
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET not configured');
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    );
  }

  let event: Stripe.Event;

  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    console.log('✅ Webhook signature verified:', event.type);
  } catch (error) {
    console.error('❌ Webhook signature verification failed:', error);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  // Manejar diferentes tipos de eventos
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'customer.subscription.created':
        console.log('🔔 Subscription created:', event.data.object.id);
        break;

      case 'customer.subscription.updated':
        console.log('🔔 Subscription updated:', event.data.object.id);
        break;

      case 'customer.subscription.deleted':
        console.log('🔔 Subscription deleted:', event.data.object.id);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

/**
 * Procesa el evento checkout.session.completed
 */
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  console.log('💳 Processing checkout.session.completed:', session.id);
  console.log('Payment status:', session.payment_status);
  console.log('Metadata:', session.metadata);

  // Solo procesar si el pago fue exitoso
  if (session.payment_status !== 'paid') {
    console.log('⚠️ Payment not completed yet, skipping...');
    return;
  }

  const userId = session.metadata?.userId;
  const packageType = session.metadata?.packageType as UpgradePackageType;

  if (!userId || !packageType) {
    console.error('Missing userId or packageType in metadata');
    return;
  }

  console.log(`Processing upgrade: User ${userId} -> Package ${packageType}`);

  // Procesar el upgrade usando el servicio
  const result = await UpgradeService.processUpgrade(userId, packageType, session.id);

  if (result.success) {
    console.log('✅ Upgrade processed successfully:', result.message);
  } else {
    console.error('❌ Upgrade failed:', result.message);
  }
}
