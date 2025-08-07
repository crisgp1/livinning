import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { PropertyService } from '@/lib/application/services/PropertyService'
import { MongoPropertyRepository } from '@/lib/infrastructure/repositories/MongoPropertyRepository'
import { Price } from '@/lib/domain/value-objects/Price'
import { PropertyType } from '@/lib/domain/value-objects/PropertyType'
import { Address, Coordinates } from '@/lib/domain/value-objects/Address'
import { PropertyFeatures } from '@/lib/domain/value-objects/PropertyFeatures'
import { Property, PropertyStatus } from '@/lib/domain/entities/Property'
import { getOrganizationContext } from '@/lib/utils/organizationContext'

const propertyRepository = new MongoPropertyRepository()
const propertyService = new PropertyService(propertyRepository)

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const property = await propertyService.getPropertyById(resolvedParams.id)

    if (!property) {
      return NextResponse.json(
        { success: false, error: 'Property not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: property
    })
  } catch (error) {
    console.error('Error fetching property:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch property' 
      },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await getOrganizationContext()
    const resolvedParams = await params
    const property = await propertyService.getPropertyById(resolvedParams.id)

    if (!property) {
      return NextResponse.json(
        { success: false, error: 'Property not found' },
        { status: 404 }
      )
    }

    if (!property.isOwnedBy(userId)) {
      return NextResponse.json(
        { success: false, error: 'You are not authorized to update this property' },
        { status: 403 }
      )
    }

    const body = await request.json()
    
    // Create updated property with all fields
    const coordinates = body.address?.coordinates 
      ? new Coordinates(body.address.coordinates.latitude, body.address.coordinates.longitude)
      : property.address.coordinates

    const address = new Address(
      body.address?.street || property.address.street,
      body.address?.city || property.address.city,
      body.address?.state || property.address.state,
      body.address?.country || property.address.country,
      body.address?.postalCode || body.address?.zipCode || property.address.postalCode,
      coordinates
    )

    const price = body.price 
      ? new Price(body.price.amount, body.price.currency)
      : property.price

    const propertyType = body.propertyType 
      ? new PropertyType(typeof body.propertyType === 'string' ? body.propertyType : body.propertyType.value || body.propertyType)
      : property.propertyType

    const features = new PropertyFeatures(
      body.features?.bedrooms !== undefined ? body.features.bedrooms : property.features.bedrooms,
      body.features?.bathrooms !== undefined ? body.features.bathrooms : property.features.bathrooms,
      body.features?.squareMeters !== undefined ? body.features.squareMeters : property.features.squareMeters,
      body.features?.lotSize !== undefined ? body.features.lotSize : property.features.lotSize,
      body.features?.yearBuilt !== undefined ? body.features.yearBuilt : property.features.yearBuilt,
      body.features?.parking !== undefined ? body.features.parking : property.features.parking,
      body.amenities || property.features.amenities
    )

    // Create new property instance with updated data
    const updatedProperty = new Property(
      property.id,
      body.title || property.title,
      body.description || property.description,
      price,
      propertyType,
      address,
      features,
      body.images || property.images,
      property.ownerId,
      property.organizationId,
      (body.status as PropertyStatus) || property.status,
      property.isHighlighted,
      property.highlightExpiresAt,
      property.createdAt,
      new Date()
    )

    const result = await propertyService.updateProperty(updatedProperty)

    return NextResponse.json({
      success: true,
      data: {
        id: result.id,
        title: result.title,
        description: result.description,
        price: {
          amount: result.price.amount,
          currency: result.price.currency
        },
        propertyType: result.propertyType.value,
        status: result.status,
        address: {
          street: result.address?.street || '',
          city: result.address?.city || '',
          state: result.address?.state || '',
          country: result.address?.country || '',
          postalCode: result.address?.postalCode || '',
          coordinates: result.address?.coordinates ? {
            latitude: result.address.coordinates.latitude,
            longitude: result.address.coordinates.longitude
          } : undefined
        },
        features: {
          bedrooms: result.features.bedrooms,
          bathrooms: result.features.bathrooms,
          squareMeters: result.features.squareMeters,
          parking: result.features.parking
        },
        images: result.images,
        amenities: result.features.amenities,
        ownerId: result.ownerId,
        organizationId: result.organizationId,
        isHighlighted: result.isHighlighted,
        highlightExpiresAt: result.highlightExpiresAt,
        isHighlightActive: result.isHighlightActive(),
        createdAt: result.createdAt,
        updatedAt: result.updatedAt
      }
    })
  } catch (error) {
    console.error('Error updating property:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update property' 
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await getOrganizationContext()
    const resolvedParams = await params
    await propertyService.deleteProperty(resolvedParams.id, userId)

    return NextResponse.json({
      success: true,
      message: 'Property deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting property:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to delete property' 
      },
      { status: 500 }
    )
  }
}