<<<<<<< HEAD
import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { v4 as uuidv4 } from 'uuid'
import connectDB from '@/lib/infrastructure/database/connection'
import ServiceOrderModel from '@/lib/infrastructure/database/models/ServiceOrderModel'
import { ServiceOrderStatus, ServiceType } from '@/lib/domain/entities/ServiceOrder'
import { NotificationService } from '@/lib/application/services/NotificationService'
import logger from '@/lib/utils/logger'

export async function POST(request: Request) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const {
      serviceType,
      serviceName,
      serviceDescription,
      propertyAddress,
      contactPhone,
      preferredDate,
      specialRequests,
      amount,
      currency,
      customerEmail,
      customerName,
      stripePaymentIntentId,
      stripeSessionId,
      providerId,
      providerName
    } = await request.json()

    // Validate required fields
    if (!serviceType || !serviceName || !propertyAddress || !contactPhone || !preferredDate || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate service type
    if (!Object.values(ServiceType).includes(serviceType)) {
      return NextResponse.json(
        { error: 'Invalid service type' },
        { status: 400 }
      )
    }

    await connectDB()

    // Create the service order
    const serviceOrder = new ServiceOrderModel({
      _id: uuidv4(),
      userId,
      serviceType,
      serviceName,
      serviceDescription: serviceDescription || '',
      propertyAddress,
      contactPhone,
      preferredDate,
      specialRequests: specialRequests || '',
      amount,
      currency: currency || 'MXN',
      status: providerId ? ServiceOrderStatus.CONFIRMED : ServiceOrderStatus.PENDING, // Auto-confirm if provider is selected
      stripePaymentIntentId,
      stripeSessionId,
      customerEmail,
      customerName: customerName || customerEmail || 'Cliente sin nombre',
      assignedTo: providerId || undefined, // Legacy field
      assignedProviderId: providerId || undefined, // New field for provider queries
      deliverables: [],
      notes: providerId ? [`Orden asignada automáticamente a ${providerName || 'proveedor seleccionado'}`] : [],
      createdAt: new Date(),
      updatedAt: new Date()
    })

    await serviceOrder.save()

    console.log(`Created service order ${serviceOrder._id} for user ${userId}${providerId ? ` assigned to provider ${providerId}` : ''}`)

    // Send notifications asynchronously
    try {
      if (providerId) {
        // Notify the assigned provider
        await NotificationService.notifyProviderOfNewOrder(
          providerId,
          serviceOrder._id,
          customerName || customerEmail || 'Cliente sin nombre',
          serviceType,
          amount,
          currency || 'MXN'
        )

        // Notify provider of confirmed payment
        if (stripePaymentIntentId) {
          await NotificationService.notifyProviderOfPaymentReceived(
            providerId,
            serviceOrder._id,
            amount,
            currency || 'MXN'
          )
        }
      }

      // Notify admins of new order
      await NotificationService.notifyAdminOfNewOrder(
        serviceOrder._id,
        customerName || customerEmail || 'Cliente sin nombre',
        serviceType,
        amount
      )

    } catch (notificationError) {
      // Log notification errors but don't fail the order creation
      logger.error('ServiceOrderAPI', 'Failed to send notifications', notificationError, {
        orderId: serviceOrder._id,
        providerId
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        id: serviceOrder._id,
        serviceType: serviceOrder.serviceType,
        serviceName: serviceOrder.serviceName,
        status: serviceOrder.status,
        amount: serviceOrder.amount,
        currency: serviceOrder.currency,
        createdAt: serviceOrder.createdAt
      },
      message: 'Service order created successfully'
    })

  } catch (error) {
    logger.error('ServiceOrderAPI', 'Service order creation error', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create service order'
      },
      { status: 500 }
    )
  }
=======
import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { v4 as uuidv4 } from 'uuid'
import connectDB from '@/lib/infrastructure/database/connection'
import ServiceOrderModel from '@/lib/infrastructure/database/models/ServiceOrderModel'
import { ServiceOrderStatus, ServiceType } from '@/lib/domain/entities/ServiceOrder'
import logger from '@/lib/utils/logger'

export async function POST(request: Request) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const {
      serviceType,
      serviceName,
      serviceDescription,
      propertyAddress,
      contactPhone,
      preferredDate,
      specialRequests,
      amount,
      currency,
      customerEmail,
      customerName,
      stripePaymentIntentId,
      stripeSessionId,
      providerId,
      providerName
    } = await request.json()

    // Validate required fields
    if (!serviceType || !serviceName || !propertyAddress || !contactPhone || !preferredDate || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate service type
    if (!Object.values(ServiceType).includes(serviceType)) {
      return NextResponse.json(
        { error: 'Invalid service type' },
        { status: 400 }
      )
    }

    await connectDB()

    // Create the service order
    const serviceOrder = new ServiceOrderModel({
      _id: uuidv4(),
      userId,
      serviceType,
      serviceName,
      serviceDescription: serviceDescription || '',
      propertyAddress,
      contactPhone,
      preferredDate,
      specialRequests: specialRequests || '',
      amount,
      currency: currency || 'MXN',
      status: providerId ? ServiceOrderStatus.CONFIRMED : ServiceOrderStatus.PENDING, // Auto-confirm if provider is selected
      stripePaymentIntentId,
      stripeSessionId,
      customerEmail,
      customerName: customerName || customerEmail || 'Cliente sin nombre',
      assignedTo: providerId || undefined, // Legacy field
      assignedProviderId: providerId || undefined, // New field for provider queries
      deliverables: [],
      notes: providerId ? [`Orden asignada automáticamente a ${providerName || 'proveedor seleccionado'}`] : [],
      createdAt: new Date(),
      updatedAt: new Date()
    })

    await serviceOrder.save()

    console.log(`Created service order ${serviceOrder._id} for user ${userId}${providerId ? ` assigned to provider ${providerId}` : ''}`)

    return NextResponse.json({
      success: true,
      data: {
        id: serviceOrder._id,
        serviceType: serviceOrder.serviceType,
        serviceName: serviceOrder.serviceName,
        status: serviceOrder.status,
        amount: serviceOrder.amount,
        currency: serviceOrder.currency,
        createdAt: serviceOrder.createdAt
      },
      message: 'Service order created successfully'
    })

  } catch (error) {
    logger.error('ServiceOrderAPI', 'Service order creation error', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create service order'
      },
      { status: 500 }
    )
  }
>>>>>>> 58f1e799c779b3a7fa2d1b6374712fd44597bda3
}