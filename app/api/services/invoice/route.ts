import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import connectDB from '@/lib/infrastructure/database/connection'
import ServiceOrderModel from '@/lib/infrastructure/database/models/ServiceOrderModel'
// Force refresh - no clerkClient import

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Usuario no autenticado' },
        { status: 401 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const orderId = searchParams.get('orderId')

    if (!orderId) {
      return NextResponse.json(
        { error: 'ID de orden requerido' },
        { status: 400 }
      )
    }

    await connectDB()

    // Find the service order
    const order = await ServiceOrderModel.findById(orderId)

    if (!order) {
      return NextResponse.json(
        { error: 'Orden no encontrada' },
        { status: 404 }
      )
    }

    // Verify the order belongs to the user
    if (order.userId !== userId) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      )
    }

    // For now, use the email as customer name
    const customerName = order.customerEmail?.split('@')[0] || 'Cliente'

    // Generate invoice number (format: INV-YYYY-MM-XXXXX)
    const date = new Date(order.createdAt)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const orderNumber = order._id.slice(-5).toUpperCase()
    const invoiceNumber = `INV-${year}-${month}-${orderNumber}`

    // Prepare invoice data
    const invoiceData = {
      invoiceNumber,
      date: order.createdAt.toISOString(),
      customerName,
      customerEmail: order.customerEmail || '',
      customerPhone: order.contactPhone,
      serviceName: order.serviceName,
      serviceDescription: order.serviceDescription,
      propertyAddress: order.propertyAddress,
      amount: order.amount,
      currency: order.currency,
      paymentMethod: 'Tarjeta de Crédito/Débito',
      transactionId: order.stripePaymentIntentId || order.stripeSessionId || order._id
    }

    return NextResponse.json({
      success: true,
      invoice: invoiceData
    })
  } catch (error) {
    console.error('Error generating invoice:', error)
    return NextResponse.json(
      { error: 'Error al generar la factura' },
      { status: 500 }
    )
  }
}