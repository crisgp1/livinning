import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { stripe } from '@/lib/utils/stripe'

export async function GET(request: Request) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('session_id')

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Missing session_id parameter' },
        { status: 400 }
      )
    }

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    // Verify the session belongs to the authenticated user
    if (session.client_reference_id !== userId) {
      return NextResponse.json(
        { error: 'Session does not belong to authenticated user' },
        { status: 403 }
      )
    }

    return NextResponse.json({
      success: true,
      session: {
        id: session.id,
        payment_status: session.payment_status,
        status: session.status,
        metadata: session.metadata,
        customer_email: session.customer_email,
        amount_total: session.amount_total,
        currency: session.currency
      }
    })

  } catch (error) {
    console.error('Get session error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve session' },
      { status: 500 }
    )
  }
}