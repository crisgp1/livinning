import { NextRequest, NextResponse } from 'next/server'
import { FavoriteService } from '@/lib/application/services/FavoriteService'
import { MongoFavoriteRepository } from '@/lib/infrastructure/repositories/MongoFavoriteRepository'
import { getOrganizationContext } from '@/lib/utils/organizationContext'

const favoriteRepository = new MongoFavoriteRepository()
const favoriteService = new FavoriteService(favoriteRepository)

export async function GET(request: NextRequest) {
  try {
    const { userId } = await getOrganizationContext()
    const { searchParams } = new URL(request.url)
    const includeProperties = searchParams.get('includeProperties') === 'true'

    if (includeProperties) {
      const properties = await favoriteService.getFavoritePropertiesByUser(userId)
      
      // Serialize the properties to plain objects
      const serializedProperties = properties.map(property => ({
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

      const count = await favoriteService.getFavoritesCount(userId)

      return NextResponse.json({
        success: true,
        data: {
          properties: serializedProperties,
          count
        }
      })
    } else {
      const favorites = await favoriteService.getFavoritesByUser(userId)
      const count = await favoriteService.getFavoritesCount(userId)

      return NextResponse.json({
        success: true,
        data: {
          favorites,
          count
        }
      })
    }
  } catch (error) {
    console.error('Error fetching favorites:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch favorites' 
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await getOrganizationContext()
    const body = await request.json()
    const { propertyId } = body

    if (!propertyId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Property ID is required' 
        },
        { status: 400 }
      )
    }

    const favorite = await favoriteService.addFavorite(userId, propertyId)

    return NextResponse.json({
      success: true,
      data: favorite,
      message: 'Property added to favorites'
    })
  } catch (error) {
    console.error('Error adding favorite:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to add favorite' 
      },
      { status: error instanceof Error && error.message.includes('already in favorites') ? 409 : 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await getOrganizationContext()
    const { searchParams } = new URL(request.url)
    const propertyId = searchParams.get('propertyId')

    if (!propertyId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Property ID is required' 
        },
        { status: 400 }
      )
    }

    await favoriteService.removeFavorite(userId, propertyId)

    return NextResponse.json({
      success: true,
      message: 'Property removed from favorites'
    })
  } catch (error) {
    console.error('Error removing favorite:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to remove favorite' 
      },
      { status: error instanceof Error && error.message.includes('not found') ? 404 : 500 }
    )
  }
}