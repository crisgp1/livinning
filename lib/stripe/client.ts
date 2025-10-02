// ============================================
// LIVINNING - Stripe Client Configuration
// ============================================

import Stripe from 'stripe';

let stripeInstance: Stripe | null = null;

// Lazy initialization of Stripe client
export function getStripe(): Stripe {
  if (!stripeInstance) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not defined in environment variables');
    }

    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-09-30.clover',
      typescript: true,
    });
  }

  return stripeInstance;
}
