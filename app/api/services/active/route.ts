import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/infrastructure/database/connection'
import ServiceModel from '@/lib/infrastructure/database/models/ServiceModel'

// GET - Get all active services (public endpoint)
export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    const filter: any = { isActive: true }

    if (category && category !== 'all') {
      filter.category = category
    }

    const services = await ServiceModel
      .find(filter)
      .select('_id title description category basePrice currency duration features')
      .sort({ createdAt: -1 })
      .lean()

    // Transform for frontend compatibility
    const transformedServices = services.map(service => ({
      id: service._id,
      title: service.title,
      description: service.description,
      category: service.category,
      price: service.basePrice,
      currency: service.currency,
      duration: service.duration,
      features: service.features?.map(f => f.title) || [],
      serviceType: service._id, // Use service ID as serviceType for compatibility
      popular: false // This could be a field in the future
    }))

    return NextResponse.json({
      success: true,
      data: transformedServices,
      count: transformedServices.length
    })

  } catch (error) {
    console.error('Error fetching active services:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener servicios' },
      { status: 500 }
    )
  }
}