import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { PropertyService } from '@/lib/application/services/PropertyService'
import { MongoPropertyRepository } from '@/lib/infrastructure/repositories/MongoPropertyRepository'
import { getOrganizationContext } from '@/lib/utils/organizationContext'

const propertyRepository = new MongoPropertyRepository()
const propertyService = new PropertyService(propertyRepository)

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await getOrganizationContext()
    const resolvedParams = await params
    const publishedProperty = await propertyService.publishProperty(resolvedParams.id, userId)

    return NextResponse.json({
      success: true,
      data: publishedProperty,
      message: 'Property published successfully'
    })
  } catch (error) {
    console.error('Error publishing property:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to publish property' 
      },
      { status: 500 }
    )
  }
}