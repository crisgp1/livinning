import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/utils/stripe'
import Stripe from 'stripe'
import { v4 as uuidv4 } from 'uuid'
import connectDB from '@/lib/infrastructure/database/connection'
import ServiceOrderModel from '@/lib/infrastructure/database/models/ServiceOrderModel'
import { ServiceOrderStatus, ServiceType } from '@/lib/domain/entities/ServiceOrder'
import { PropertyService } from '@/lib/application/services/PropertyService'
import { MongoPropertyRepository } from '@/lib/infrastructure/repositories/MongoPropertyRepository'

export async function POST(request: Request) {
  console.log('🔔 Webhook received at:', new Date().toISOString())
  
  const body = await request.text()
  const signature = (await headers()).get('stripe-signature')

  console.log('📥 Webhook body length:', body.length)
  console.log('🔐 Stripe signature present:', !!signature)
  console.log('🔑 Webhook secret configured:', !!process.env.STRIPE_WEBHOOK_SECRET)

  if (!signature) {
    console.error('❌ No signature provided in webhook request')
    return NextResponse.json(
      { error: 'No signature provided' },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  try {
    console.log('🔐 Verifying webhook signature...')
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
    console.log('✅ Webhook signature verified successfully')
    console.log('📦 Event type:', event.type)
    console.log('🆔 Event ID:', event.id)
  } catch (err) {
    console.error('❌ Webhook signature verification failed:', err)
    console.error('❌ Error details:', err instanceof Error ? err.message : 'Unknown error')
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
          console.log('🔄 Processing service payment for serviceId:', session.metadata.serviceId)
          console.log('📝 Session metadata:', JSON.stringify(session.metadata, null, 2))
          console.log('💰 Amount total:', session.amount_total)
          console.log('👤 User ID:', userId)
          console.log('📧 Customer email:', customerEmail)
          
          try {
            console.log('🔌 Connecting to MongoDB...')
            await connectDB()
            console.log('✅ MongoDB connection successful')

            // Check if service order already exists for this session
            const existingOrder = await ServiceOrderModel.findOne({ 
              stripeSessionId: session.id 
            })

            if (existingOrder) {
              console.log('⚠️ Service order already exists for session:', session.id)
              console.log('📋 Existing order status:', existingOrder.status)
              
              // If the order exists but property hasn't been highlighted yet, do it now
              if (session.metadata.serviceId?.startsWith('highlight-') && 
                  existingOrder.status !== ServiceOrderStatus.COMPLETED) {
                console.log('🌟 Applying highlight to property for existing order...')
                const propertyId = session.metadata.propertyId
                const highlightDuration = parseInt(session.metadata.highlightDuration || '0')
                
                if (propertyId && highlightDuration > 0) {
                  try {
                    const propertyRepository = new MongoPropertyRepository()
                    const propertyService = new PropertyService(propertyRepository)
                    
                    const highlightedProperty = await propertyService.highlightProperty(
                      propertyId,
                      userId,
                      highlightDuration
                    )
                    
                    console.log('✅ Property highlighted successfully:', propertyId)
                    
                    // Update existing order
                    existingOrder.status = ServiceOrderStatus.COMPLETED
                    existingOrder.actualDelivery = new Date()
                    existingOrder.deliverables = [`Property ${propertyId} highlighted for ${highlightDuration} days`]
                    existingOrder.notes = [...existingOrder.notes, `Highlight activated via webhook at ${new Date().toISOString()}`]
                    await existingOrder.save()
                  } catch (error) {
                    console.error('❌ Failed to apply highlight:', error)
                  }
                }
              }
              break
            }

            const serviceOrderData = {
              _id: uuidv4(),
              userId,
              serviceType: session.metadata.serviceId?.startsWith('highlight-') ? ServiceType.HIGHLIGHT : session.metadata.serviceId,
              serviceName: session.metadata.serviceName,
              serviceDescription: `Professional ${session.metadata.serviceName} service`,
              propertyAddress: session.metadata.propertyAddress || 'Dirección no especificada',
              contactPhone: session.metadata.contactPhone || customerEmail || 'No proporcionado',
              preferredDate: session.metadata.preferredDate || new Date().toISOString().split('T')[0],
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
            }

            console.log('📄 Creating service order with data:', JSON.stringify(serviceOrderData, null, 2))
            
            const serviceOrder = new ServiceOrderModel(serviceOrderData)
            
            console.log('💾 Saving service order to database...')
            const savedOrder = await serviceOrder.save()
            console.log('✅ Service order created successfully:', savedOrder._id)
            console.log('🎉 Service order saved with status:', savedOrder.status)

            // Check if this is a highlight service
            if (session.metadata.serviceId?.startsWith('highlight-')) {
              console.log('🌟 Processing highlight service...')
              const propertyId = session.metadata.propertyId
              const highlightDuration = parseInt(session.metadata.highlightDuration || '0')
              
              if (propertyId && highlightDuration > 0) {
                try {
                  const propertyRepository = new MongoPropertyRepository()
                  const propertyService = new PropertyService(propertyRepository)
                  
                  // Apply highlight to property
                  const highlightedProperty = await propertyService.highlightProperty(
                    propertyId,
                    userId,
                    highlightDuration
                  )
                  
                  console.log('✅ Property highlighted successfully:', propertyId)
                  console.log('⏰ Highlight expires at:', highlightedProperty.highlightExpiresAt)
                  
                  // Update service order with completion info
                  savedOrder.status = ServiceOrderStatus.COMPLETED
                  savedOrder.actualDelivery = new Date()
                  savedOrder.deliverables = [`Property ${propertyId} highlighted for ${highlightDuration} days`]
                  savedOrder.notes = [`Highlight activated at ${new Date().toISOString()}`]
                  await savedOrder.save()
                  
                  console.log('✅ Service order marked as completed')
                } catch (error) {
                  console.error('❌ Failed to apply highlight:', error)
                  // The payment was successful, so we should log this error but not fail the webhook
                  savedOrder.notes = [`Error applying highlight: ${error instanceof Error ? error.message : 'Unknown error'}`]
                  await savedOrder.save()
                }
              }
            }

            // TODO: Send notification email to service team
            // TODO: Send confirmation email to customer
          } catch (error) {
            console.error('❌ Failed to create service order:', error)
            console.error('❌ Error details:', error instanceof Error ? error.message : 'Unknown error')
            console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace')
            
            // Also try to log more details about the error
            if (error instanceof Error && error.name === 'ValidationError') {
              console.error('❌ Mongoose validation error details:', (error as any).errors)
            }
          }
        } else {
          console.log('⚠️  No serviceId or planId found in session metadata')
          console.log('📝 Available metadata keys:', Object.keys(session.metadata || {}))
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