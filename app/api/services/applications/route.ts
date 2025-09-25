import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { v4 as uuidv4 } from 'uuid'
import connectDB from '@/lib/infrastructure/database/connection'
import ServiceProviderApplicationModel from '@/lib/infrastructure/database/models/ServiceProviderApplicationModel'
import ServiceModel from '@/lib/infrastructure/database/models/ServiceModel'

// GET - List applications (for providers to see their own, for admin to see all)
export async function GET(request: NextRequest) {
  try {
    const { userId, orgRole } = await auth()

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }

    await connectDB()

    const { searchParams } = new URL(request.url)
    const serviceId = searchParams.get('serviceId')
    const status = searchParams.get('status')

    let filter: any = {}

    // If superadmin, can see all applications
    if (orgRole === 'org:admin') {
      if (serviceId) filter.serviceId = serviceId
      if (status && status !== 'all') filter.status = status
    } else {
      // Regular users can only see their own applications
      filter.providerId = userId
      if (serviceId) filter.serviceId = serviceId
      if (status && status !== 'all') filter.status = status
    }

    const applications = await ServiceProviderApplicationModel
      .find(filter)
      .sort({ createdAt: -1 })
      .lean()

    return NextResponse.json({
      success: true,
      data: applications,
      count: applications.length
    })

  } catch (error) {
    console.error('Error fetching applications:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener aplicaciones' },
      { status: 500 }
    )
  }
}

// POST - Create new application (providers)
export async function POST(request: NextRequest) {
  try {
    const { userId, user } = await auth()

    if (!userId || !user) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      serviceId,
      businessName,
      experience,
      certifications = [],
      portfolio = [],
      proposedPrice,
      currency = 'MXN',
      availability,
      coverLetter
    } = body

    // Validate required fields
    if (!serviceId || !experience || !proposedPrice || !availability || !coverLetter) {
      return NextResponse.json(
        { success: false, error: 'Campos requeridos faltantes' },
        { status: 400 }
      )
    }

    await connectDB()

    // Check if service exists and is active
    const service = await ServiceModel.findById(serviceId)
    if (!service || !service.isActive) {
      return NextResponse.json(
        { success: false, error: 'Servicio no encontrado o inactivo' },
        { status: 404 }
      )
    }

    // Check if user already applied for this service
    const existingApplication = await ServiceProviderApplicationModel.findOne({
      serviceId,
      providerId: userId
    })

    if (existingApplication) {
      return NextResponse.json(
        { success: false, error: 'Ya has aplicado a este servicio' },
        { status: 400 }
      )
    }

    // Process portfolio items
    const processedPortfolio = portfolio.map((item: any) => ({
      id: item.id || uuidv4(),
      title: item.title,
      description: item.description,
      imageUrl: item.imageUrl,
      projectDate: item.projectDate,
      clientTestimonial: item.clientTestimonial
    }))

    const applicationData = {
      _id: uuidv4(),
      serviceId,
      providerId: userId,
      providerName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Usuario',
      providerEmail: user.primaryEmailAddress?.emailAddress || '',
      businessName,
      experience,
      certifications: Array.isArray(certifications) ? certifications : [],
      portfolio: processedPortfolio,
      proposedPrice: Number(proposedPrice),
      currency,
      availability,
      coverLetter,
      status: 'pending'
    }

    const application = new ServiceProviderApplicationModel(applicationData)
    await application.save()

    return NextResponse.json({
      success: true,
      data: application,
      message: 'Aplicación enviada exitosamente'
    })

  } catch (error) {
    console.error('Error creating application:', error)
    return NextResponse.json(
      { success: false, error: 'Error al crear aplicación' },
      { status: 500 }
    )
  }
}