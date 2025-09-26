import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { PropertyService } from '@/lib/application/services/PropertyService'
import { MongoPropertyRepository } from '@/lib/infrastructure/repositories/MongoPropertyRepository'
import { getOrganizationContext } from '@/lib/utils/organizationContext'

const propertyRepository = new MongoPropertyRepository()
const propertyService = new PropertyService(propertyRepository)

export async function GET(request: NextRequest) {
  try {
    const { userId, organization } = await getOrganizationContext()

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '1000')

    // Get properties owned by the authenticated user within their organization
    const filters = {
      ownerId: userId,
      organizationId: organization.id,
      ...(status && { status })
    }

    const result = await propertyService.getProperties({ 
      filters, 
      page, 
      limit 
    })

    // Transform properties to include all necessary data
    const transformedProperties = result.properties.map(property => ({
      id: property.id,
      title: property.title,
      description: property.description,
      price: {
        amount: property.price.amount,
        currency: property.price.currency
      },
      propertyType: property.propertyType.value,
      address: {
        street: property.address?.street || '',
        city: property.address?.city || '',
        state: property.address?.state || '',
        country: property.address?.country || '',
        postalCode: property.address?.postalCode || ''
      },
      features: {
        bedrooms: property.features.bedrooms,
        bathrooms: property.features.bathrooms,
        squareMeters: property.features.squareMeters,
        parking: property.features.parking
      },
      images: property.images,
      status: property.status,
      isHighlighted: property.isHighlighted,
      highlightExpiresAt: property.highlightExpiresAt,
      isHighlightActive: property.isHighlightActive(),
      createdAt: property.createdAt,
      updatedAt: property.updatedAt,
      ownerId: property.ownerId,
      organizationId: property.organizationId
    }))

    return NextResponse.json({
      success: true,
      data: transformedProperties,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages
      }
    })
  } catch (error) {
    console.error('Error fetching user properties:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch properties' 
      },
      { status: 500 }
    )
  }
}