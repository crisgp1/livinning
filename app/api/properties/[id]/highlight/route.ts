import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { PropertyService } from '@/lib/application/services/PropertyService'
import { MongoPropertyRepository } from '@/lib/infrastructure/repositories/MongoPropertyRepository'
import { getOrganizationContext } from '@/lib/utils/organizationContext'

const propertyRepository = new MongoPropertyRepository()
const propertyService = new PropertyService(propertyRepository)

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await getOrganizationContext()
    const body = await request.json()
    const { durationInDays = 30 } = body

    if (typeof durationInDays !== 'number' || durationInDays <= 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Duration must be a positive number' 
        },
        { status: 400 }
      )
    }

    const property = await propertyService.highlightProperty(
      params.id, 
      userId, 
      durationInDays
    )

    return NextResponse.json({
      success: true,
      data: {
        id: property.id,
        isHighlighted: property.isHighlighted,
        highlightExpiresAt: property.highlightExpiresAt,
        isHighlightActive: property.isHighlightActive()
      }
    })
  } catch (error) {
    console.error('Error highlighting property:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to highlight property' 
      },
      { status: error instanceof Error && error.message.includes('not found') ? 404 : 
         error instanceof Error && error.message.includes('not authorized') ? 403 : 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await getOrganizationContext()

    const property = await propertyService.removeHighlight(params.id, userId)

    return NextResponse.json({
      success: true,
      data: {
        id: property.id,
        isHighlighted: property.isHighlighted,
        highlightExpiresAt: property.highlightExpiresAt,
        isHighlightActive: property.isHighlightActive()
      }
    })
  } catch (error) {
    console.error('Error removing highlight:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to remove highlight' 
      },
      { status: error instanceof Error && error.message.includes('not found') ? 404 : 
         error instanceof Error && error.message.includes('not authorized') ? 403 : 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await getOrganizationContext()
    const body = await request.json()
    const { additionalDays } = body

    if (typeof additionalDays !== 'number' || additionalDays <= 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Additional days must be a positive number' 
        },
        { status: 400 }
      )
    }

    const property = await propertyService.extendHighlight(
      params.id, 
      userId, 
      additionalDays
    )

    return NextResponse.json({
      success: true,
      data: {
        id: property.id,
        isHighlighted: property.isHighlighted,
        highlightExpiresAt: property.highlightExpiresAt,
        isHighlightActive: property.isHighlightActive()
      }
    })
  } catch (error) {
    console.error('Error extending highlight:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to extend highlight' 
      },
      { status: error instanceof Error && error.message.includes('not found') ? 404 : 
         error instanceof Error && error.message.includes('not authorized') ? 403 : 500 }
    )
  }
}