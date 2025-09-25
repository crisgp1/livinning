import { NextRequest, NextResponse } from 'next/server'
import { PropertyService } from '@/lib/application/services/PropertyService'
import { MongoPropertyRepository } from '@/lib/infrastructure/repositories/MongoPropertyRepository'

const propertyRepository = new MongoPropertyRepository()
const propertyService = new PropertyService(propertyRepository)

export async function GET(request: NextRequest) {
  try {
    // Get featured properties (limit to 6 for homepage)
    const result = await propertyService.getProperties({ 
      filters: {}, 
      page: 1, 
      limit: 6 
    })

    // Serialize the properties to plain objects
    const serializedResult = {
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