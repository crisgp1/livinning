import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { stripe } from '@/lib/utils/stripe'

export async function POST(request: Request) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { planId, planName, price, currency, userEmail } = await request.json()

    if (!planId || !planName || !price) {
      return NextResponse.json(
        { error: 'Missing required payment information' },
        { status: 400 }
      )
    }


    // Create Stripe checkout session with embedded UI mode
    const session = await stripe.checkout.sessions.create({
      ui_mode: 'embedded',
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: currency.toLowerCase(),
          product_data: {
            name: `Plan ${planName} - Livinning Agency`,
            description: `Suscripción mensual al plan ${planName}`
          },
          unit_amount: price * 100, // Stripe uses cents
          recurring: {
            interval: 'month'
          }
        },
        quantity: 1,
      }],
      mode: 'subscription',
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/upgrade-success?session_id={CHECKOUT_SESSION_ID}`,
      client_reference_id: userId,
      customer_email: userEmail,
      metadata: {
        planId,
        planName,
        userId
      }
    })

    return NextResponse.json({ 
      success: true, 
      clientSecret: session.client_secret,
      checkoutId: session.id 
    })

  } catch (error) {
    console.error('Payment creation error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}

