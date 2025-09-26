import { NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import connectDB from '@/lib/infrastructure/database/connection'
import ServiceOrderModel from '@/lib/infrastructure/database/models/ServiceOrderModel'

export async function GET(request: Request) {
  try {
    const { userId } = await auth()
    const user = await currentUser()
    
    if (!userId || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user has provider access
    const metadata = user.publicMetadata as any
    const userRole = metadata?.role
    const hasProviderAccess = userRole === 'supplier' || userRole === 'provider'

    if (!hasProviderAccess) {
      return NextResponse.json(
        { error: 'Forbidden: Provider access required' },
        { status: 403 }
      )
    }

    await connectDB()

    // Get service orders assigned to this provider that need tracking
    const orders = await ServiceOrderModel
      .find({ 
        assignedProviderId: userId,
        status: { $in: ['confirmed', 'in_progress'] } // Only active orders need tracking
      })
      .sort({ createdAt: -1 })
      .lean()

    // Transform orders into tracking format
    const trackings = orders.map((order: any) => {
      // Map service order status to tracking status
      const getTrackingStatus = (orderStatus: string) => {
        switch (orderStatus) {
          case 'confirmed': return 'not_started'
          case 'in_progress': return 'in_progress'
          case 'completed': return 'completed'
          case 'cancelled': return 'cancelled'
          default: return 'not_started'
        }
      }

      // Determine phase based on status and progress
      const getPhase = (status: string) => {
        switch (status) {
          case 'not_started': return 'pre_service'
          case 'in_progress': return 'during_service'
          case 'completed': return 'post_service'
          default: return 'pre_service'
        }
      }

      // Calculate progress percentage based on status
      const getProgressPercentage = (status: string) => {
        switch (status) {
          case 'not_started': return 0
          case 'in_progress': return order.progressPercentage || 25 // Default to 25% if not set
          case 'completed': return 100
          case 'cancelled': return 0
          default: return 0
        }
      }

      // Calculate estimated completion date
      const getEstimatedCompletion = (createdAt: Date, serviceType: string) => {
        const created = new Date(createdAt)
        const daysToAdd = {
          'photography': 2,
          'legal': 7,
          'virtual-tour': 3,
          'home-staging': 5,
          'market-analysis': 3,
          'documentation': 4,
          'highlight': 1,
          'cleaning': 1,
          'maintenance': 3,
          'gardening': 2,
          'electrical': 2,
          'carpentry': 4,
          'plumbing': 1,
          'painting': 3,
          'air-conditioning': 2
        }
        created.setDate(created.getDate() + (daysToAdd[serviceType as keyof typeof daysToAdd] || 3))
        return created.toISOString()
      }

      const trackingStatus = getTrackingStatus(order.status)
      const progressPercentage = getProgressPercentage(order.status)

      return {
        _id: order._id,
        serviceOrderId: order._id,
        serviceName: order.serviceName || 'Servicio sin nombre',
        serviceType: order.serviceType,
        propertyAddress: order.propertyAddress || 'Dirección no especificada',
        clientName: order.customerName || order.customerEmail || 'Cliente sin nombre',
        status: trackingStatus,
        phase: getPhase(trackingStatus),
        progress: {
          percentage: progressPercentage,
          lastUpdated: order.updatedAt || order.createdAt
        },
        communications: {
          unreadByProvider: order.unreadMessages || 0,
          lastMessageAt: order.lastMessageAt || order.updatedAt
        },
        metadata: {
          lastActivityAt: order.updatedAt || order.createdAt,
          createdAt: order.createdAt
        },
        estimatedCompletionDate: getEstimatedCompletion(order.createdAt, order.serviceType),
        qualityMetrics: {
          totalIssues: order.qualityIssues?.length || 0,
          issuesResolved: order.qualityIssues?.filter((issue: any) => issue.resolved).length || 0
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: trackings
    })

  } catch (error) {
    console.error('Service tracking API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch service tracking'
      },
      { status: 500 }
    )
  }
}
