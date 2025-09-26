import { NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import connectDB from '@/lib/infrastructure/database/connection'
import ProviderModel from '@/lib/infrastructure/database/models/ProviderModel'
import { Provider, ProviderStatus, ProviderTier } from '@/lib/domain/entities/Provider'
import { ServiceType } from '@/lib/domain/entities/ServiceOrder'

// Get all providers
export async function GET(request: Request) {
  try {
    const { userId } = await auth()
    const user = await currentUser()
    
    if (!userId || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is superadmin
    const metadata = user.publicMetadata as any
    const isSuperAdmin = metadata?.isSuperAdmin === true ||
      metadata?.role === 'superadmin' ||
      user.emailAddresses?.some(email => email.emailAddress === 'cristiangp2001@gmail.com')

    if (!isSuperAdmin) {
      return NextResponse.json(
        { error: 'Forbidden: Superadmin access required' },
        { status: 403 }
      )
    }

    await connectDB()

    // Get all providers
    const providers = await ProviderModel.find({})
      .sort({ createdAt: -1 })
      .lean()

    // Transform for frontend
    const transformedProviders = providers.map((provider: any) => ({
      id: provider._id,
      userId: provider.userId,
      businessName: provider.businessName,
      description: provider.description,
      status: provider.status,
      tier: provider.tier,
      isVerified: provider.isVerified,
      rating: provider.rating,
      location: provider.location,
      serviceCapabilities: provider.serviceCapabilities,
      completedJobs: provider.completedJobs,
      responseTime: provider.responseTime,
      createdAt: provider.createdAt,
      lastActive: provider.lastActive
    }))

    return NextResponse.json({
      success: true,
      data: transformedProviders
    })

  } catch (error) {
    console.error('Get providers error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch providers' },
      { status: 500 }
    )
  }
}

// Create new provider
export async function POST(request: Request) {
  try {
    const { userId } = await auth()
    const user = await currentUser()
    
    if (!userId || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is superadmin
    const metadata = user.publicMetadata as any
    const isSuperAdmin = metadata?.isSuperAdmin === true ||
      metadata?.role === 'superadmin' ||
      user.emailAddresses?.some(email => email.emailAddress === 'cristiangp2001@gmail.com')

    if (!isSuperAdmin) {
      return NextResponse.json(
        { error: 'Forbidden: Superadmin access required' },
        { status: 403 }
      )
    }

    const {
      userId: targetUserId,
      businessName,
      description,
      serviceTypes,
      city,
      state,
      country
    } = await request.json()

    // Validate required fields
    if (!targetUserId || !businessName || !city) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, businessName, city' },
        { status: 400 }
      )
    }

    await connectDB()

    // Check if provider already exists for this user
    const existingProvider = await ProviderModel.findOne({ userId: targetUserId })
    if (existingProvider) {
      return NextResponse.json(
        { error: 'Provider already exists for this user' },
        { status: 400 }
      )
    }

    // Create service capabilities with default prices
    const serviceCapabilities = serviceTypes.map((serviceType: string) => {
      const defaultPrices: { [key: string]: number } = {
        'photography': 2499,
        'legal': 4999,
        'virtual-tour': 3499,
        'home-staging': 8999,
        'market-analysis': 2999,
        'documentation': 1999,
        'highlight': 5999,
        'cleaning': 1500,
        'maintenance': 2500,
        'gardening': 1800,
        'electrical': 3500,
        'carpentry': 2800,
        'plumbing': 3200,
        'painting': 2200,
        'air-conditioning': 4500
      }

      return {
        serviceType: serviceType as ServiceType,
        basePrice: defaultPrices[serviceType] || 2000,
        currency: 'MXN',
        estimatedDuration: '2-3 días',
        availableSlots: 3,
        description: `Servicio profesional de ${serviceType.replace('-', ' ')}`
      }
    })

    // Create basic schedule (Monday to Friday, 9-18)
    const defaultSchedule = {
      timezone: 'America/Mexico_City',
      workingHours: {
        monday: { start: '09:00', end: '18:00', available: true },
        tuesday: { start: '09:00', end: '18:00', available: true },
        wednesday: { start: '09:00', end: '18:00', available: true },
        thursday: { start: '09:00', end: '18:00', available: true },
        friday: { start: '09:00', end: '18:00', available: true },
        saturday: { start: '09:00', end: '15:00', available: false },
        sunday: { start: '09:00', end: '15:00', available: false }
      },
      blockedDates: []
    }

    // Create Provider domain entity
    const provider = Provider.create(
      targetUserId,
      businessName,
      description || `Proveedor profesional de servicios en ${city}`,
      serviceCapabilities,
      {
        latitude: 19.4326, // Mexico City default coordinates
        longitude: -99.1332,
        city,
        state: state || '',
        country: country || 'México',
        serviceRadius: 25
      },
      defaultSchedule
    )

    // Save to database
    const providerModel = new ProviderModel({
      _id: provider.id,
      userId: provider.userId,
      businessName: provider.businessName,
      description: provider.description,
      serviceCapabilities: provider.serviceCapabilities,
      location: provider.location,
      status: provider.status,
      tier: provider.tier,
      rating: provider.rating,
      schedule: provider.schedule,
      isVerified: false, // New providers start unverified
      profileImageUrl: provider.profileImageUrl,
      portfolioImages: provider.portfolioImages,
      certifications: provider.certifications,
      completedJobs: provider.completedJobs,
      responseTime: provider.responseTime,
      lastActive: provider.lastActive,
      createdAt: provider.createdAt,
      updatedAt: provider.updatedAt
    })

    await providerModel.save()

    console.log(`Created provider ${provider.id} for user ${targetUserId}`)

    return NextResponse.json({
      success: true,
      data: {
        id: provider.id,
        userId: provider.userId,
        businessName: provider.businessName,
        serviceCapabilities: provider.serviceCapabilities.map(cap => cap.serviceType)
      },
      message: 'Provider created successfully'
    })

  } catch (error) {
    console.error('Create provider error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create provider'
      },
      { status: 500 }
    )
  }
}