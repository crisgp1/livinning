import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { PropertyService } from '@/lib/application/services/PropertyService'
import { MongoPropertyRepository } from '@/lib/infrastructure/repositories/MongoPropertyRepository'
import { CreatePropertyDTOSchema } from '@/lib/application/dtos/CreatePropertyDTO'
import { PropertyFilters } from '@/lib/domain/repositories/PropertyRepository'
import { getOrganizationContext } from '@/lib/utils/organizationContext'
import { clerkClient } from '@clerk/nextjs/server'
import logger from '@/lib/utils/logger'

const propertyRepository = new MongoPropertyRepository()
const propertyService = new PropertyService(propertyRepository)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Parse query parameters
    const filters: PropertyFilters = {}
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '1000')

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
    if (searchParams.get('isHighlighted')) {
      filters.isHighlighted = searchParams.get('isHighlighted') === 'true'
    }

    logger.debug('PropertiesAPI', 'Getting properties', { filters, page, limit })
    const result = await propertyService.getProperties({ filters, page, limit })
    logger.info('PropertiesAPI', 'Properties retrieved', { 
      count: result.properties.length, 
      total: result.totalCount,
      hasFilters: Object.keys(filters).length > 0 
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
        isHighlighted: property.isHighlighted,
        highlightExpiresAt: property.highlightExpiresAt,
        isHighlightActive: property.isHighlightActive(),
        createdAt: property.createdAt,
        updatedAt: property.updatedAt
      }))
    }

    return NextResponse.json({
      success: true,
      data: serializedResult
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
    logger.info('PropertiesAPI', 'Property creation request received')
    const { userId, organization } = await getOrganizationContext()
    
    const body = await request.json()
    logger.debug('PropertiesAPI', 'Property creation data', { 
      title: body.title,
      propertyType: body.propertyType,
      price: body.price,
      userId,
      organizationId: organization.id
    })
    
    // Validate the request body
    const validationResult = CreatePropertyDTOSchema.safeParse({
      ...body,
      ownerId: userId,
      organizationId: organization.id
    })

    if (!validationResult.success) {
      logger.warn('PropertiesAPI', 'Property validation failed', {
        errors: validationResult.error.issues,
        userId
      })
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
    logger.info('PropertiesAPI', 'Property created successfully', {
      propertyId: property.id,
      title: property.title,
      userId,
      organizationId: organization.id
    })

    // Auto-upgrade logic: upgrade regular users to agent when they publish their first property
    try {
      const clerk = await clerkClient()
      const user = await clerk.users.getUser(userId) // userId is the effective user from organizationContext
      
      if (user) {
        const metadata = user.publicMetadata as any
        const currentRole = metadata?.role
        
        // Only upgrade if user is not already an agent, agency, supplier, provider, or superadmin
        const eligibleForUpgrade = !currentRole || currentRole === 'user'
        
        if (eligibleForUpgrade) {
          console.log(`Auto-upgrading user ${userId} to agent role after publishing first property`)
          
          await clerk.users.updateUser(userId, {
            publicMetadata: {
              ...metadata,
              role: 'agent',
              isAgency: true,
              autoUpgraded: true,
              autoUpgradedAt: new Date().toISOString(),
              autoUpgradeReason: 'first_property_published'
            }
          })
        }
      }
    } catch (upgradeError) {
      // Log the error but don't fail the property creation
      console.error('Auto-upgrade failed, but property was created successfully:', upgradeError)
    }

    return NextResponse.json({
      success: true,
      data: property,
      message: property ? 'Property created successfully! You have been upgraded to agent status.' : 'Property created successfully!'
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