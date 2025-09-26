import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import connectDB from '@/lib/infrastructure/database/connection'
import { ProviderModel } from '@/lib/infrastructure/database/schemas/ProviderSchema'
import { ServiceType } from '@/lib/domain/entities/ServiceOrder'

interface TransformedProvider {
  id: string
  userId: string
  businessName: string
  description: string
  profileImageUrl?: string
  tier: string
  status: string
  isVerified: boolean
  rating: {
    averageRating: number
    totalReviews: number
  }
  location: {
    city: string
    state: string
    country: string
    distance?: number | null
  }
  service: {
    basePrice: number
    currency: string
    estimatedDuration: string
    availableSlots: number
    description: string
  } | null
  completedJobs: number
  responseTime: number
  portfolioImages: string[]
  isOnline: boolean
  lastActive: Date
}

export async function GET(request: Request) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const serviceType = searchParams.get('serviceType') as ServiceType
    const latitude = searchParams.get('latitude') ? parseFloat(searchParams.get('latitude')!) : undefined
    const longitude = searchParams.get('longitude') ? parseFloat(searchParams.get('longitude')!) : undefined
    const maxDistance = searchParams.get('maxDistance') ? parseInt(searchParams.get('maxDistance')!) : 50 // Default 50km
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    if (!serviceType || !Object.values(ServiceType).includes(serviceType)) {
      return NextResponse.json(
        { error: 'Valid service type is required' },
        { status: 400 }
      )
    }

    await connectDB()

    // Get available providers for the service type
    const providers = await (ProviderModel as any).findAvailableForService(
      serviceType,
      latitude,
      longitude,
      maxDistance
    )

    // Apply pagination
    const paginatedProviders = providers.slice(offset, offset + limit)

    // Transform data for frontend
    const transformedProviders = paginatedProviders.map((provider: any) => {
      // Find the specific service capability for the requested service type
      const serviceCapability = provider.serviceCapabilities.find(
        (cap: any) => cap.serviceType === serviceType
      )

      return {
        id: provider._id,
        userId: provider.userId,
        businessName: provider.businessName,
        description: provider.description,
        profileImageUrl: provider.profileImageUrl,
        tier: provider.tier,
        status: provider.status,
        isVerified: provider.isVerified,
        rating: {
          averageRating: provider.rating.averageRating,
          totalReviews: provider.rating.totalReviews
        },
        location: {
          city: provider.location.city,
          state: provider.location.state,
          country: provider.location.country,
          distance: provider.distance || null
        },
        service: serviceCapability ? {
          basePrice: serviceCapability.basePrice,
          currency: serviceCapability.currency,
          estimatedDuration: serviceCapability.estimatedDuration,
          availableSlots: serviceCapability.availableSlots,
          description: serviceCapability.description
        } : null,
        completedJobs: provider.completedJobs,
        responseTime: provider.responseTime,
        portfolioImages: provider.portfolioImages.slice(0, 3), // Only first 3 images
        isOnline: isProviderOnline(provider.lastActive),
        lastActive: provider.lastActive
      }
    }).filter((provider: TransformedProvider) => provider.service !== null) // Only include providers that can provide the service

    // Get total count for pagination
    const totalCount = providers.length

    // Calculate service statistics
    const serviceStats = {
      totalProviders: totalCount,
      onlineProviders: transformedProviders.filter((p: TransformedProvider) => p.isOnline).length,
      averagePrice: transformedProviders.length > 0
        ? transformedProviders.reduce((sum: number, p: TransformedProvider) => sum + (p.service?.basePrice || 0), 0) / transformedProviders.length
        : 0,
      averageRating: transformedProviders.length > 0
        ? transformedProviders.reduce((sum: number, p: TransformedProvider) => sum + p.rating.averageRating, 0) / transformedProviders.length
        : 0,
      priceRange: transformedProviders.length > 0 ? {
        min: Math.min(...transformedProviders.map((p: TransformedProvider) => p.service?.basePrice || 0)),
        max: Math.max(...transformedProviders.map((p: TransformedProvider) => p.service?.basePrice || 0))
      } : { min: 0, max: 0 }
    }

    return NextResponse.json({
      success: true,
      data: transformedProviders,
      stats: serviceStats,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount
      },
      filters: {
        serviceType,
        location: latitude && longitude ? { latitude, longitude, maxDistance } : null
      }
    })

  } catch (error) {
    console.error('Get available providers error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch available providers'
      },
      { status: 500 }
    )
  }
}

function isProviderOnline(lastActive: Date): boolean {
  const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000)
  return new Date(lastActive) > fifteenMinutesAgo
}