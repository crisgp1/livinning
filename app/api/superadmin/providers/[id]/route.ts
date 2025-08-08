import { NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import connectDB from '@/lib/infrastructure/database/connection'
import ProviderModel from '@/lib/infrastructure/database/models/ProviderModel'
import { ServiceType } from '@/lib/domain/entities/ServiceOrder'

// Update specific provider
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    // Find the provider to update
    const existingProvider = await ProviderModel.findById(params.id)
    if (!existingProvider) {
      return NextResponse.json(
        { error: 'Provider not found' },
        { status: 404 }
      )
    }

    // Create updated service capabilities
    const serviceCapabilities = serviceTypes.map((serviceType: string) => {
      // Try to find existing capability to preserve price
      const existingCapability = existingProvider.serviceCapabilities.find(
        (cap: any) => cap.serviceType === serviceType
      )

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
        basePrice: existingCapability?.basePrice || defaultPrices[serviceType] || 2000,
        currency: existingCapability?.currency || 'MXN',
        estimatedDuration: existingCapability?.estimatedDuration || '2-3 días',
        availableSlots: existingCapability?.availableSlots || 3,
        description: existingCapability?.description || `Servicio profesional de ${serviceType.replace('-', ' ')}`
      }
    })

    // Update the provider
    const updatedProvider = await ProviderModel.findByIdAndUpdate(
      params.id,
      {
        userId: targetUserId,
        businessName,
        description: description || existingProvider.description,
        serviceCapabilities,
        'location.city': city,
        'location.state': state || existingProvider.location.state,
        'location.country': country || existingProvider.location.country,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    )

    if (!updatedProvider) {
      return NextResponse.json(
        { error: 'Failed to update provider' },
        { status: 500 }
      )
    }

    console.log(`Updated provider ${params.id}`)

    return NextResponse.json({
      success: true,
      data: {
        id: updatedProvider._id,
        userId: updatedProvider.userId,
        businessName: updatedProvider.businessName,
        serviceCapabilities: updatedProvider.serviceCapabilities.map((cap: any) => cap.serviceType)
      },
      message: 'Provider updated successfully'
    })

  } catch (error) {
    console.error('Update provider error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update provider'
      },
      { status: 500 }
    )
  }
}

// Delete specific provider
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    // Find and delete the provider
    const deletedProvider = await ProviderModel.findByIdAndDelete(params.id)
    
    if (!deletedProvider) {
      return NextResponse.json(
        { error: 'Provider not found' },
        { status: 404 }
      )
    }

    console.log(`Deleted provider ${params.id} (${deletedProvider.businessName})`)

    return NextResponse.json({
      success: true,
      message: 'Provider deleted successfully'
    })

  } catch (error) {
    console.error('Delete provider error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to delete provider'
      },
      { status: 500 }
    )
  }
}

// Get specific provider details
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    // Find the specific provider
    const provider = await ProviderModel.findById(params.id).lean()
    
    if (!provider) {
      return NextResponse.json(
        { error: 'Provider not found' },
        { status: 404 }
      )
    }

    // Transform for frontend
    const transformedProvider = {
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
    }

    return NextResponse.json({
      success: true,
      data: transformedProvider
    })

  } catch (error) {
    console.error('Get provider error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch provider' },
      { status: 500 }
    )
  }
}