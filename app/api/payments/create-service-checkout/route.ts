import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { stripe } from '@/lib/utils/stripe'

export async function POST(request: Request) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const {
      serviceId,
      serviceName,
      price,
      currency,
      userEmail,
      propertyAddress,
      contactPhone,
      preferredDate,
      specialRequests,
      propertyId,
      propertyTitle,
      highlightDuration,
      providerId,
      providerName
    } = await request.json()

    if (!serviceId || !serviceName || !price) {
      return NextResponse.json(
        { error: 'Missing required service information' },
        { status: 400 }
      )
    }

    // Create Stripe checkout session for one-time payment with embedded UI
    const session = await stripe.checkout.sessions.create({
      ui_mode: 'embedded',
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: currency.toLowerCase(),
          product_data: {
            name: `${serviceName} - Servicio Profesional${providerName ? ` por ${providerName}` : ''}`,
            description: `Servicio profesional de ${serviceName} para tu propiedad en ${propertyAddress}${providerName ? ` • Proveedor: ${providerName}` : ''}`,
            metadata: {
              preferredDate,
              propertyAddress
            }
          },
          unit_amount: price * 100, // Stripe uses cents
        },
        quantity: 1,
      }],
      mode: 'payment', // One-time payment instead of subscription
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/services/success?session_id={CHECKOUT_SESSION_ID}`,
      client_reference_id: userId,
      customer_email: userEmail,
      metadata: {
        serviceId,
        serviceName,
        userId,
        propertyAddress,
        contactPhone,
        preferredDate,
        specialRequests: specialRequests || '',
        propertyId: propertyId || '',
        propertyTitle: propertyTitle || '',
        highlightDuration: highlightDuration?.toString() || '',
        providerId: providerId || '',
        providerName: providerName || ''
      }
    })

    return NextResponse.json({ 
      success: true, 
      clientSecret: session.client_secret,
      checkoutId: session.id 
    })

  } catch (error) {
    console.error('Service payment creation error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}