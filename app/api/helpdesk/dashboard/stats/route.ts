import { NextRequest } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import connectDB from '@/lib/infrastructure/database/connection'
import logger from '@/lib/utils/logger'
import { createSuccessResponse, createErrorResponse } from '@/lib/utils/api-response'

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return createErrorResponse('No autenticado', 401)
    }

    // Check if user has helpdesk or superadmin role
    const user = await clerkClient.users.getUser(userId)
    const metadata = user.publicMetadata as any

    const isHelpdesk = metadata?.role === 'helpdesk'
    const isSuperAdmin = metadata?.isSuperAdmin === true ||
      metadata?.role === 'superadmin' ||
      user.emailAddresses?.some(email => email.emailAddress === 'cristiangp2001@gmail.com')

    if (!isHelpdesk && !isSuperAdmin) {
      return createErrorResponse('No autorizado', 403)
    }

    await connectDB()
    const db = (await import('mongoose')).connection.db

    // Get current date boundaries for filtering
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const thisWeekStart = new Date(today)
    thisWeekStart.setDate(today.getDate() - today.getDay())

    const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1)

    // Parallel queries for better performance
    const [
      propertyStats,
      ticketStats,
      serviceOrderStats,
      userStats
    ] = await Promise.all([
      // Property stats
      db.collection('properties').aggregate([
        {
          $group: {
            _id: null,
            totalProperties: { $sum: 1 },
            pendingModeration: {
              $sum: {
                $cond: [
                  { $in: ['$status', ['pending', 'under_review']] },
                  1,
                  0
                ]
              }
            },
            approvedToday: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $eq: ['$status', 'active'] },
                      { $gte: ['$approvedAt', today] }
                    ]
                  },
                  1,
                  0
                ]
              }
            },
            rejectedToday: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $eq: ['$status', 'rejected'] },
                      { $gte: ['$rejectedAt', today] }
                    ]
                  },
                  1,
                  0
                ]
              }
            }
          }
        }
      ]).toArray(),

      // Support ticket stats
      db.collection('support_tickets').aggregate([
        {
          $group: {
            _id: null,
            totalTickets: { $sum: 1 },
            openTickets: {
              $sum: {
                $cond: [
                  { $eq: ['$status', 'open'] },
                  1,
                  0
                ]
              }
            },
            inProgressTickets: {
              $sum: {
                $cond: [
                  { $eq: ['$status', 'in_progress'] },
                  1,
                  0
                ]
              }
            },
            resolvedTickets: {
              $sum: {
                $cond: [
                  { $eq: ['$status', 'resolved'] },
                  1,
                  0
                ]
              }
            },
            urgentTickets: {
              $sum: {
                $cond: [
                  { $eq: ['$priority', 'urgent'] },
                  1,
                  0
                ]
              }
            },
            ticketsToday: {
              $sum: {
                $cond: [
                  { $gte: ['$createdAt', today] },
                  1,
                  0
                ]
              }
            },
            resolvedToday: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $eq: ['$status', 'resolved'] },
                      { $gte: ['$resolvedAt', today] }
                    ]
                  },
                  1,
                  0
                ]
              }
            },
            avgResolutionTime: {
              $avg: {
                $cond: [
                  { $and: [{ $ne: ['$resolvedAt', null] }, { $ne: ['$createdAt', null] }] },
                  {
                    $divide: [
                      { $subtract: ['$resolvedAt', '$createdAt'] },
                      1000 * 60 * 60 // Convert to hours
                    ]
                  },
                  null
                ]
              }
            }
          }
        }
      ]).toArray(),

      // Service order stats
      db.collection('service_orders').aggregate([
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            totalRevenue: { $sum: '$amount' },
            pendingOrders: {
              $sum: {
                $cond: [
                  { $eq: ['$status', 'pending'] },
                  1,
                  0
                ]
              }
            },
            inProgressOrders: {
              $sum: {
                $cond: [
                  { $eq: ['$status', 'in_progress'] },
                  1,
                  0
                ]
              }
            },
            completedOrders: {
              $sum: {
                $cond: [
                  { $eq: ['$status', 'completed'] },
                  1,
                  0
                ]
              }
            },
            escalatedOrders: {
              $sum: {
                $cond: [
                  { $eq: ['$escalated', true] },
                  1,
                  0
                ]
              }
            },
            ordersToday: {
              $sum: {
                $cond: [
                  { $gte: ['$createdAt', today] },
                  1,
                  0
                ]
              }
            },
            revenueToday: {
              $sum: {
                $cond: [
                  { $gte: ['$createdAt', today] },
                  '$amount',
                  0
                ]
              }
            },
            avgOrderValue: { $avg: '$amount' }
          }
        }
      ]).toArray(),

      // User stats (from Clerk - simplified for demo)
      Promise.resolve([{
        totalUsers: 0, // Would need to call Clerk API
        activeUsers: 0,
        newUsersToday: 0,
        providerUsers: 0,
        clientUsers: 0
      }])
    ])

    // Format the response
    const dashboardStats = {
      properties: {
        total: propertyStats[0]?.totalProperties || 0,
        pendingModeration: propertyStats[0]?.pendingModeration || 0,
        approvedToday: propertyStats[0]?.approvedToday || 0,
        rejectedToday: propertyStats[0]?.rejectedToday || 0
      },
      supportTickets: {
        total: ticketStats[0]?.totalTickets || 0,
        open: ticketStats[0]?.openTickets || 0,
        inProgress: ticketStats[0]?.inProgressTickets || 0,
        resolved: ticketStats[0]?.resolvedTickets || 0,
        urgent: ticketStats[0]?.urgentTickets || 0,
        createdToday: ticketStats[0]?.ticketsToday || 0,
        resolvedToday: ticketStats[0]?.resolvedToday || 0,
        avgResolutionTime: Math.round(ticketStats[0]?.avgResolutionTime || 0)
      },
      serviceOrders: {
        total: serviceOrderStats[0]?.totalOrders || 0,
        totalRevenue: serviceOrderStats[0]?.totalRevenue || 0,
        pending: serviceOrderStats[0]?.pendingOrders || 0,
        inProgress: serviceOrderStats[0]?.inProgressOrders || 0,
        completed: serviceOrderStats[0]?.completedOrders || 0,
        escalated: serviceOrderStats[0]?.escalatedOrders || 0,
        ordersToday: serviceOrderStats[0]?.ordersToday || 0,
        revenueToday: serviceOrderStats[0]?.revenueToday || 0,
        avgOrderValue: Math.round(serviceOrderStats[0]?.avgOrderValue || 0)
      },
      users: userStats[0]
    }

    // Recent activity (last 10 items across all types)
    const recentActivity = await db.collection('activity_log').find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray()

    const formattedActivity = recentActivity.map(activity => ({
      ...activity,
      _id: activity._id.toString()
    }))

    logger.info('Helpdesk', 'Dashboard stats retrieved', {
      requesterId: userId,
      statsDate: today.toISOString()
    })

    return createSuccessResponse({
      stats: dashboardStats,
      recentActivity: formattedActivity,
      lastUpdated: new Date().toISOString()
    })

  } catch (error: any) {
    logger.error('Helpdesk', 'Error fetching dashboard stats', error)
    return createErrorResponse('Error interno del servidor', 500)
  }
}