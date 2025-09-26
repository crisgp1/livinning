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

    const isFavorite = await favoriteService.isFavorite(userId, propertyId)

    return NextResponse.json({
      success: true,
      data: { isFavorite }
    })
  } catch (error) {
    console.error('Error checking favorite:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to check favorite' 
      },
      { status: 500 }
    )
  }
}