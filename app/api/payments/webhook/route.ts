import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/utils/stripe'
import Stripe from 'stripe'
import { v4 as uuidv4 } from 'uuid'
import connectDB from '@/lib/infrastructure/database/connection'
import ServiceOrderModel from '@/lib/infrastructure/database/models/ServiceOrderModel'
import { ServiceOrderStatus, ServiceType } from '@/lib/domain/entities/ServiceOrder'

export async function POST(request: Request) {
  const body = await request.text()
  const signature = (await headers()).get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'No signature provided' },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        
        // Extract metadata
        const userId = session.client_reference_id
        const customerEmail = session.customer_email

        if (!userId) {
          console.error('Missing required userId in checkout session')
          break
        }

        // Check if this is a subscription payment (has planId) or service payment (has serviceId)
        if (session.metadata?.planId) {
          // Subscription payment - create organization
          const planId = session.metadata.planId
          const planName = session.metadata.planName

          const createOrgResponse = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/api/organizations/create-from-payment`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                userId,
                planId,
                planName,
                stripeCustomerId: session.customer,
                stripeSubscriptionId: session.subscription,
                email: customerEmail,
              }),
            }
          )

          if (!createOrgResponse.ok) {
            console.error('Failed to create organization after payment')
          }
        } else if (session.metadata?.serviceId) {
          // Service payment - create service order directly
          try {
            await connectDB()

            const serviceOrder = new ServiceOrderModel({
              _id: uuidv4(),
              userId,
              serviceType: session.metadata.serviceId,
              serviceName: session.metadata.serviceName,
              serviceDescription: `Professional ${session.metadata.serviceName} service`,
              propertyAddress: session.metadata.propertyAddress,
              contactPhone: session.metadata.contactPhone,
              preferredDate: session.metadata.preferredDate,
              specialRequests: session.metadata.specialRequests || '',
              amount: (session.amount_total || 0) / 100, // Convert from cents
              currency: 'MXN',
              status: ServiceOrderStatus.CONFIRMED, // Mark as confirmed since payment is complete
              stripePaymentIntentId: session.payment_intent,
              stripeSessionId: session.id,
              customerEmail,
              deliverables: [],
              notes: [],
              createdAt: new Date(),
              updatedAt: new Date()
            })

            await serviceOrder.save()
            console.log('Service order created:', serviceOrder._id)

            // TODO: Send notification email to service team
            // TODO: Send confirmation email to customer
          } catch (error) {
            console.error('Failed to create service order:', error)
          }
        }

        console.log('Checkout session completed:', session.id)
        break
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        
        // Handle subscription updates (upgrades, downgrades, cancellations)
        console.log('Subscription updated:', subscription.id)
        
        // TODO: Update organization's plan in database
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        
        // Handle failed payments
        console.log('Payment failed for invoice:', invoice.id)
        
        // TODO: Send email notification to customer
        // TODO: Update organization status if needed
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}