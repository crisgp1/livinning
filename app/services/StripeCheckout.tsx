'use client'

import { loadStripe } from '@stripe/stripe-js'
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js'
import { getStripePublishableKey } from '@/lib/utils/stripe-client'

const stripePromise = loadStripe(getStripePublishableKey())

interface StripeCheckoutProps {
  clientSecret: string
}

export default function StripeCheckout({ clientSecret }: StripeCheckoutProps) {
  return (
    <EmbeddedCheckoutProvider
      stripe={stripePromise}
      options={{ clientSecret }}
    >
      <EmbeddedCheckout />
    </EmbeddedCheckoutProvider>
  )
}