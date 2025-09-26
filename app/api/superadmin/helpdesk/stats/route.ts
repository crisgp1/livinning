import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { isSuperAdminById } from '@/lib/utils/superadmin'
import connectDB from '@/lib/infrastructure/database/connection'
import ServiceOrderModel from '@/lib/infrastructure/database/models/ServiceOrderModel'

export async function GET() {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check superadmin status
    const isAdmin = await isSuperAdminById(userId)
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized: Superadmin access required' }, { status: 403 })
    }

    await connectDB()

    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const thisWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7)

    // Get transaction stats
    const [
      totalTransactions,
      todayTransactions,
      thisWeekTransactions,
      totalAmountAgg,
      statusStats,
      typeStats
    ] = await Promise.all([
      ServiceOrderModel.countDocuments(),
      ServiceOrderModel.countDocuments({ createdAt: { $gte: today } }),
      ServiceOrderModel.countDocuments({ createdAt: { $gte: thisWeek } }),
      ServiceOrderModel.aggregate([
        {
          $group: {
            _id: null,
            totalAmount: { $sum: '$amount' }
          }
        }
      ]),
      ServiceOrderModel.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]),
      ServiceOrderModel.aggregate([
        {
          $group: {
            _id: '$serviceType',
            count: { $sum: 1 }
          }
        }
      ])
    ])

    const totalAmount = totalAmountAgg[0]?.totalAmount || 0

    const byStatus = statusStats.reduce((acc: any, item: any) => {
      acc[item._id] = item.count
      return acc
    }, {})

    const byType = typeStats.reduce((acc: any, item: any) => {
      acc[item._id] = item.count
      return acc
    }, {})

    const stats = {
      transactions: {
        total: totalTransactions,
        today: todayTransactions,
        thisWeek: thisWeekTransactions,
        totalAmount,
        byStatus,
        byType
      },
      supportTickets: {
        total: 0,
        open: 0,
        inProgress: 0,
        resolved: 0,
        byPriority: { low: 0, medium: 0, high: 0, urgent: 0 },
        avgResolutionTime: 0
      },
      users: {
        totalClients: 0, // Would be fetched from Clerk API
        totalProviders: 0, // Would be fetched from provider collection
        activeToday: 0,
        newThisWeek: 0
      }
    }

    return NextResponse.json({
      success: true,
      data: stats
    })

  } catch (error) {
    console.error('Helpdesk stats error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch helpdesk stats' },
      { status: 500 }
    )
  }
}