<<<<<<< HEAD
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { PropertyService } from '@/lib/application/services/PropertyService'
import { MongoPropertyRepository } from '@/lib/infrastructure/repositories/MongoPropertyRepository'
import { getOrganizationContext } from '@/lib/utils/organizationContext'

const propertyRepository = new MongoPropertyRepository()
const propertyService = new PropertyService(propertyRepository)

async function getPropertyViews(userId: string): Promise<number> {
  // TODO: Query analytics table for property views
  return 0
}

async function getPropertyInquiries(userId: string): Promise<number> {
  // TODO: Query inquiries/messages table for property inquiries
  return 0
}

export async function GET(request: NextRequest) {
  try {
    const { userId, organization } = await getOrganizationContext()

    // Get all properties by the user within their organization
    const allProperties = await propertyService.getProperties({
      filters: { 
        ownerId: userId, 
        organizationId: organization.id 
      },
      page: 1,
      limit: 1000 // Large limit to get all properties
    })

    // Calculate stats
    const totalProperties = allProperties.total
    const publishedProperties = allProperties.properties.filter(p => p.status === 'published').length
    const draftProperties = allProperties.properties.filter(p => p.status === 'draft').length
    
    // TODO: Implement proper analytics tracking in future iterations
    const totalViews = await getPropertyViews(userId) || 0
    const totalInquiries = await getPropertyInquiries(userId) || 0

    const stats = {
      totalProperties,
      publishedProperties,
      draftProperties,
      totalViews,
      totalInquiries
    }

    return NextResponse.json({
      success: true,
      data: stats
    })
  } catch (error) {
    console.error('Error fetching user stats:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch stats' 
      },
      { status: 500 }
    )
  }
=======
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

    // Get all properties by the user within their organization
    const allProperties = await propertyService.getProperties({
      filters: { 
        ownerId: userId, 
        organizationId: organization.id 
      },
      page: 1,
      limit: 1000 // Large limit to get all properties
    })

    // Calculate stats
    const totalProperties = allProperties.total
    const publishedProperties = allProperties.properties.filter(p => p.status === 'published').length
    const draftProperties = allProperties.properties.filter(p => p.status === 'draft').length
    
    // For now, we'll use mock data for views and inquiries
    // In a real app, you'd track these in separate collections
    const totalViews = Math.floor(Math.random() * 1000) + publishedProperties * 50
    const totalInquiries = Math.floor(Math.random() * 50) + publishedProperties * 3

    const stats = {
      totalProperties,
      publishedProperties,
      draftProperties,
      totalViews,
      totalInquiries
    }

    return NextResponse.json({
      success: true,
      data: stats
    })
  } catch (error) {
    console.error('Error fetching user stats:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch stats' 
      },
      { status: 500 }
    )
  }
>>>>>>> 58f1e799c779b3a7fa2d1b6374712fd44597bda3
}