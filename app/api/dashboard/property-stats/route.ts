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

    // Get all properties for the user/organization
    const allPropertiesResult = await propertyService.getProperties({
      filters: {
        ownerId: userId,
        organizationId: organization.id
      },
      page: 1,
      limit: 1000 // Get all properties for stats calculation
    })

    const properties = allPropertiesResult.properties

    // Calculate stats
    const stats = {
      totalProperties: properties.length,
      activeProperties: properties.filter(p => p.status === 'published').length,
      draftProperties: properties.filter(p => p.status === 'draft').length,
      suspendedProperties: properties.filter(p => p.status === 'suspended').length,
      featuredProperties: properties.filter(p => p.isHighlightActive()).length,
      totalViews: properties.reduce((sum, p) => {
        // You'll need to implement view tracking in your property model
        // For now, return a placeholder value
        return sum + Math.floor(Math.random() * 100)
      }, 0),
      totalInquiries: properties.reduce((sum, p) => {
        // You'll need to implement inquiry tracking in your property model
        // For now, return a placeholder value
        return sum + Math.floor(Math.random() * 20)
      }, 0)
    }

    return NextResponse.json({
      success: true,
      data: stats
    })
  } catch (error) {
    console.error('Error fetching property stats:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch property stats'
      },
      { status: 500 }
    )
  }
}