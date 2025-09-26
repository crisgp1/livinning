import { NextRequest, NextResponse } from 'next/server'
import { FavoriteService } from '@/lib/application/services/FavoriteService'
import { MongoFavoriteRepository } from '@/lib/infrastructure/repositories/MongoFavoriteRepository'
import { getOrganizationContext } from '@/lib/utils/organizationContext'

const favoriteRepository = new MongoFavoriteRepository()
const favoriteService = new FavoriteService(favoriteRepository)

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

    const result = await favoriteService.toggleFavorite(userId, propertyId)

    return NextResponse.json({
      success: true,
      data: result,
      message: result.isFavorite ? 'Property added to favorites' : 'Property removed from favorites'
    })
  } catch (error) {
    console.error('Error toggling favorite:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to toggle favorite' 
      },
      { status: 500 }
    )
  }
}