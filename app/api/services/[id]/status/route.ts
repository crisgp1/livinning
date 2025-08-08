import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import connectDB from '@/lib/infrastructure/database/connection'
import ServiceOrderModel from '@/lib/infrastructure/database/models/ServiceOrderModel'
import { ServiceOrderStatus } from '@/lib/domain/entities/ServiceOrder'

interface ServiceStatusUpdateRequest {
  status: ServiceOrderStatus
  notes?: string
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body: ServiceStatusUpdateRequest = await request.json()
    const { status, notes } = body
    const { id } = params

    if (!Object.values(ServiceOrderStatus).includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status provided' },
        { status: 400 }
      )
    }

    await connectDB()

    // Find the service order
    const serviceOrder = await ServiceOrderModel.findById(id)
    if (!serviceOrder) {
      return NextResponse.json(
        { error: 'Service order not found' },
        { status: 404 }
      )
    }

    // Check if user has permission to update this order
    // For now, we'll check if it's assigned to this provider
    if (serviceOrder.assignedProviderId !== userId) {
      return NextResponse.json(
        { error: 'Not authorized to update this order' },
        { status: 403 }
      )
    }

    // Update the status
    serviceOrder.status = status
    serviceOrder.updatedAt = new Date()

    if (notes) {
      if (!serviceOrder.notes) {
        serviceOrder.notes = []
      }
      serviceOrder.notes.push(notes)
    }

    // If marking as completed, set completion date
    if (status === ServiceOrderStatus.COMPLETED) {
      serviceOrder.actualDelivery = new Date()
    }

    await serviceOrder.save()

    return NextResponse.json({
      success: true,
      data: {
        id: serviceOrder._id,
        status: serviceOrder.status,
        updatedAt: serviceOrder.updatedAt,
        actualDelivery: serviceOrder.actualDelivery,
        notes: serviceOrder.notes
      }
    })

  } catch (error) {
    console.error('Update service status error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update service status'
      },
      { status: 500 }
    )
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params

    await connectDB()

    // Find the service order
    const serviceOrder = await ServiceOrderModel.findById(id)
    if (!serviceOrder) {
      return NextResponse.json(
        { error: 'Service order not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        id: serviceOrder._id,
        status: serviceOrder.status,
        serviceName: serviceOrder.serviceName,
        serviceType: serviceOrder.serviceType,
        customerName: serviceOrder.customerName,
        propertyAddress: serviceOrder.propertyAddress,
        amount: serviceOrder.amount,
        currency: serviceOrder.currency,
        createdAt: serviceOrder.createdAt,
        updatedAt: serviceOrder.updatedAt,
        actualDelivery: serviceOrder.actualDelivery,
        notes: serviceOrder.notes || []
      }
    })

  } catch (error) {
    console.error('Get service status error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to get service status'
      },
      { status: 500 }
    )
  }
}