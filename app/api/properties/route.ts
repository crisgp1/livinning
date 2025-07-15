import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { PropertyService } from '@/lib/application/services/PropertyService'
import { MongoPropertyRepository } from '@/lib/infrastructure/repositories/MongoPropertyRepository'
import { CreatePropertyDTOSchema } from '@/lib/application/dtos/CreatePropertyDTO'
import { PropertyFilters } from '@/lib/domain/repositories/PropertyRepository'
import { getOrganizationContext } from '@/lib/utils/organizationContext'

const propertyRepository = new MongoPropertyRepository()
const propertyService = new PropertyService(propertyRepository)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Parse query parameters
    const filters: PropertyFilters = {}
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    if (searchParams.get('priceMin')) {
      filters.priceMin = parseInt(searchParams.get('priceMin')!)
    }
    if (searchParams.get('priceMax')) {
      filters.priceMax = parseInt(searchParams.get('priceMax')!)
    }
    if (searchParams.get('propertyType')) {
      filters.propertyType = searchParams.get('propertyType')!
    }
    if (searchParams.get('city')) {
      filters.city = searchParams.get('city')!
    }
    if (searchParams.get('state')) {
      filters.state = searchParams.get('state')!
    }
    if (searchParams.get('bedrooms')) {
      filters.bedrooms = parseInt(searchParams.get('bedrooms')!)
    }
    if (searchParams.get('bathrooms')) {
      filters.bathrooms = parseInt(searchParams.get('bathrooms')!)
    }
    if (searchParams.get('amenities')) {
      filters.amenities = searchParams.get('amenities')!.split(',')
    }

    const result = await propertyService.getProperties({ filters, page, limit })

    return NextResponse.json({
      success: true,
      data: result
    })
  } catch (error) {
    console.error('Error fetching properties:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch properties' 
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, organization } = await getOrganizationContext()
    
    const body = await request.json()
    
    // Validate the request body
    const validationResult = CreatePropertyDTOSchema.safeParse({
      ...body,
      ownerId: userId,
      organizationId: organization.id
    })

    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Validation failed',
          details: validationResult.error.issues
        },
        { status: 400 }
      )
    }

    const property = await propertyService.createProperty(validationResult.data)

    return NextResponse.json({
      success: true,
      data: property
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating property:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create property' 
      },
      { status: 500 }
    )
  }
}