import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { PropertyService } from '@/lib/application/services/PropertyService'
import { MongoPropertyRepository } from '@/lib/infrastructure/repositories/MongoPropertyRepository'
import { getOrganizationContext } from '@/lib/utils/organizationContext'

const propertyRepository = new MongoPropertyRepository()
const propertyService = new PropertyService(propertyRepository)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userSpecific = searchParams.get('user') === 'true'

    let result

    if (userSpecific) {
      // Get user-specific featured/highlighted properties
      const { userId, organization } = await getOrganizationContext()

      result = await propertyService.getProperties({
        filters: {
          ownerId: userId,
          organizationId: organization.id,
          isHighlighted: true
        },
        page: 1,
        limit: 100
      })
    } else {
      // Get general featured properties (limit to 6 for homepage)
      result = await propertyService.getProperties({
        filters: {},
        page: 1,
        limit: 6
      })
    }

    // Serialize the properties to plain objects
    let serializedResult

    if (userSpecific) {
      // For user-specific featured properties, include highlight data and performance metrics
      const featuredProperties = result.properties.map(property => {
        const daysRemaining = property.highlightExpiresAt
          ? Math.max(0, Math.ceil((new Date(property.highlightExpiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
          : 0

        return {
          id: property.id,
          title: property.title,
          price: {
            amount: property.price.amount,
            currency: property.price.currency
          },
          images: property.images,
          isHighlighted: property.isHighlighted,
          highlightExpiresAt: property.highlightExpiresAt?.toISOString(),
          daysRemaining,
          views: Math.floor(Math.random() * 1000) + 100, // Mock data - implement real view tracking
          inquiries: Math.floor(Math.random() * 50) + 5, // Mock data - implement real inquiry tracking
          address: {
            city: property.address?.city || '',
            state: property.address?.state || ''
          }
        }
      })

      serializedResult = featuredProperties
    } else {
      // For general featured properties (homepage), use existing format
      serializedResult = {
        ...result,
        properties: result.properties.map(property => ({
          id: property.id,
          title: property.title,
          description: property.description,
          price: {
            amount: property.price.amount,
            currency: property.price.currency
          },
          propertyType: property.propertyType.value,
          status: property.status,
          address: {
            street: property.address?.street || '',
            city: property.address?.city || '',
            state: property.address?.state || '',
            country: property.address?.country || '',
            postalCode: property.address?.postalCode || '',
            coordinates: property.address?.coordinates ? {
              latitude: property.address.coordinates.latitude,
              longitude: property.address.coordinates.longitude
            } : undefined
          },
          features: {
            bedrooms: property.features.bedrooms,
            bathrooms: property.features.bathrooms,
            squareMeters: property.features.squareMeters,
            parking: property.features.parking,
            amenities: property.features.amenities
          },
          images: property.images,
          ownerId: property.ownerId,
          organizationId: property.organizationId,
          createdAt: property.createdAt,
          updatedAt: property.updatedAt
        }))
      }
    }

    return NextResponse.json({
      success: true,
      data: serializedResult
    })
  } catch (error) {
    console.error('Error fetching featured properties:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch featured properties' 
      },
      { status: 500 }
    )
  }
}