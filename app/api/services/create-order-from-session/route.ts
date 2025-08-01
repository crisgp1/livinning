import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { v4 as uuidv4 } from 'uuid'
import connectDB from '@/lib/infrastructure/database/connection'
import ServiceOrderModel from '@/lib/infrastructure/database/models/ServiceOrderModel'
import { ServiceOrderStatus, ServiceType } from '@/lib/domain/entities/ServiceOrder'

export async function POST(request: Request) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { sessionId, sessionData } = await request.json()

    if (!sessionId || !sessionData) {
      return NextResponse.json(
        { error: 'Missing session data' },
        { status: 400 }
      )
    }

    console.log('🔄 Creating service order from session:', sessionId)
    console.log('📝 Session metadata:', JSON.stringify(sessionData.metadata, null, 2))

    // Check if we have service metadata
    if (!sessionData.metadata?.serviceId) {
      return NextResponse.json(
        { error: 'No service metadata found in session' },
        { status: 400 }
      )
    }

    await connectDB()

    // Check if service order already exists for this session
    const existingOrder = await ServiceOrderModel.findOne({ 
      stripeSessionId: sessionId 
    })

    if (existingOrder) {
      console.log('⚠️ Service order already exists for session:', sessionId)
      return NextResponse.json({
        success: true,
        message: 'Service order already exists',
        data: {
          id: existingOrder._id,
          status: existingOrder.status,
          serviceName: existingOrder.serviceName
        }
      })
    }

    // Create the service order
    const serviceOrderData = {
      _id: uuidv4(),
      userId,
      serviceType: sessionData.metadata.serviceId,
      serviceName: sessionData.metadata.serviceName,
      serviceDescription: `Professional ${sessionData.metadata.serviceName} service`,
      propertyAddress: sessionData.metadata.propertyAddress,
      contactPhone: sessionData.metadata.contactPhone,
      preferredDate: sessionData.metadata.preferredDate,
      specialRequests: sessionData.metadata.specialRequests || '',
      amount: (sessionData.amount_total || 0) / 100, // Convert from cents
      currency: 'MXN',
      status: ServiceOrderStatus.CONFIRMED, // Mark as confirmed since payment is complete
      stripePaymentIntentId: sessionData.payment_intent,
      stripeSessionId: sessionData.id,
      customerEmail: sessionData.customer_email,
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

    return NextResponse.json({
      success: true,
      data: {
        id: savedOrder._id,
        serviceType: savedOrder.serviceType,
        serviceName: savedOrder.serviceName,
        status: savedOrder.status,
        amount: savedOrder.amount,
        currency: savedOrder.currency,
        createdAt: savedOrder.createdAt
      },
      message: 'Service order created successfully from session'
    })

  } catch (error) {
    console.error('❌ Service order creation from session error:', error)
    console.error('❌ Error details:', error instanceof Error ? error.message : 'Unknown error')
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create service order from session'
      },
      { status: 500 }
    )
  }
}