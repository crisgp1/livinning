import { NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import connectDB from '@/lib/infrastructure/database/connection'
import ServiceOrderModel from '@/lib/infrastructure/database/models/ServiceOrderModel'
import { ServiceOrderStatus, ServiceType } from '@/lib/domain/entities/ServiceOrder'

export async function POST(request: Request) {
  try {
    console.log('🧪 Testing MongoDB connection and ServiceOrder creation...')
    
    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...')
    await connectDB()
    console.log('✅ MongoDB connection successful')

    // Create a test service order
    const testOrderData = {
      _id: uuidv4(),
      userId: 'test_user_123',
      serviceType: ServiceType.PHOTOGRAPHY,
      serviceName: 'Test Photography Service',
      serviceDescription: 'Test service order for debugging',
      propertyAddress: 'Test Address 123, Test City',
      contactPhone: '+52 123 456 7890',
      preferredDate: '2025-08-15',
      specialRequests: 'This is a test order',
      amount: 2499,
      currency: 'MXN',
      status: ServiceOrderStatus.CONFIRMED,
      stripePaymentIntentId: 'pi_test_123456789',
      stripeSessionId: 'cs_test_123456789',
      customerEmail: 'test@example.com',
      deliverables: [],
      notes: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }

    console.log('📄 Creating test service order with data:', JSON.stringify(testOrderData, null, 2))
    
    const serviceOrder = new ServiceOrderModel(testOrderData)
    
    console.log('💾 Saving test service order to database...')
    const savedOrder = await serviceOrder.save()
    console.log('✅ Test service order created successfully:', savedOrder._id)
    console.log('🎉 Test service order saved with status:', savedOrder.status)

    // Query to verify it was saved
    console.log('🔍 Querying database to verify save...')
    const foundOrder = await ServiceOrderModel.findById(savedOrder._id)
    console.log('📦 Found order:', foundOrder ? 'YES' : 'NO')

    return NextResponse.json({
      success: true,
      message: 'Test service order created successfully',
      data: {
        id: savedOrder._id,
        status: savedOrder.status,
        serviceName: savedOrder.serviceName,
        amount: savedOrder.amount,
        foundInDatabase: !!foundOrder
      }
    })

  } catch (error) {
    console.error('❌ Test failed:', error)
    console.error('❌ Error details:', error instanceof Error ? error.message : 'Unknown error')
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    
    if (error instanceof Error && error.name === 'ValidationError') {
      console.error('❌ Mongoose validation error details:', (error as any).errors)
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Test failed',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    console.log('🔍 Testing MongoDB connection and querying service orders...')
    
    await connectDB()
    console.log('✅ MongoDB connected')

    const orders = await ServiceOrderModel.find({}).limit(10).sort({ createdAt: -1 })
    console.log('📊 Found', orders.length, 'service orders')

    return NextResponse.json({
      success: true,
      count: orders.length,
      orders: orders.map(order => ({
        id: order._id,
        serviceName: order.serviceName,
        status: order.status,
        amount: order.amount,
        createdAt: order.createdAt
      }))
    })

  } catch (error) {
    console.error('❌ Query test failed:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Query test failed'
      },
      { status: 500 }
    )
  }
}