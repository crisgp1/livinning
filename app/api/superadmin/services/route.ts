import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { v4 as uuidv4 } from 'uuid'
import connectDB from '@/lib/infrastructure/database/connection'
import ServiceModel, { ServiceFeature } from '@/lib/infrastructure/database/models/ServiceModel'

// GET - List all services (superadmin)
export async function GET(request: NextRequest) {
  try {
    const { userId, orgRole } = await auth()

    if (!userId || orgRole !== 'org:admin') {
      return NextResponse.json(
        { success: false, error: 'Acceso no autorizado' },
        { status: 401 }
      )
    }

    await connectDB()

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const status = searchParams.get('status')

    const filter: any = {}
    if (category && category !== 'all') {
      filter.category = category
    }
    if (status === 'active') {
      filter.isActive = true
    } else if (status === 'inactive') {
      filter.isActive = false
    }

    const services = await ServiceModel.find(filter)
      .sort({ createdAt: -1 })
      .lean()

    return NextResponse.json({
      success: true,
      data: services,
      count: services.length
    })

  } catch (error) {
    console.error('Error fetching services:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener servicios' },
      { status: 500 }
    )
  }
}

// POST - Create new service (superadmin)
export async function POST(request: NextRequest) {
  try {
    const { userId, orgRole } = await auth()

    if (!userId || orgRole !== 'org:admin') {
      return NextResponse.json(
        { success: false, error: 'Acceso no autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      title,
      description,
      category,
      basePrice,
      currency = 'MXN',
      duration,
      features,
      requiresApproval = true,
      maxProviders = 10
    } = body

    // Validate required fields
    if (!title || !description || !category || !basePrice || !duration) {
      return NextResponse.json(
        { success: false, error: 'Campos requeridos faltantes' },
        { status: 400 }
      )
    }

    // Validate category
    const validCategories = ['visual', 'legal', 'consulting', 'staging', 'documentation', 'marketing']
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { success: false, error: 'Categoría inválida' },
        { status: 400 }
      )
    }

    await connectDB()

    // Process features
    const processedFeatures: ServiceFeature[] = features?.map((feature: any) => ({
      id: feature.id || uuidv4(),
      title: feature.title,
      description: feature.description,
      included: feature.included !== false
    })) || []

    const serviceData = {
      _id: uuidv4(),
      title: title.trim(),
      description: description.trim(),
      category,
      basePrice: Number(basePrice),
      currency,
      duration: duration.trim(),
      features: processedFeatures,
      isActive: true,
      requiresApproval,
      maxProviders: Number(maxProviders),
      currentProviders: 0,
      createdBy: userId
    }

    const service = new ServiceModel(serviceData)
    await service.save()

    return NextResponse.json({
      success: true,
      data: service,
      message: 'Servicio creado exitosamente'
    })

  } catch (error) {
    console.error('Error creating service:', error)
    return NextResponse.json(
      { success: false, error: 'Error al crear servicio' },
      { status: 500 }
    )
  }
}