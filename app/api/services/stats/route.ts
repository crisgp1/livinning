import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import connectDB from '@/lib/infrastructure/database/connection'
import ServiceOrderModel from '@/lib/infrastructure/database/models/ServiceOrderModel'

export async function GET() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    // Get current date for this month calculations
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

    // Calculate stats
    const [
      activeServices,
      completedServices,
      totalInvestmentResult,
      thisMonthServicesCount
    ] = await Promise.all([
      // Active services (confirmed, in_progress)
      ServiceOrderModel.countDocuments({
        userId,
        status: { $in: ['confirmed', 'in_progress'] }
      }),
      
      // Completed services
      ServiceOrderModel.countDocuments({
        userId,
        status: 'completed'
      }),
      
      // Total investment (all non-cancelled orders)
      ServiceOrderModel.aggregate([
        {
          $match: {
            userId,
            status: { $ne: 'cancelled' }
          }
        },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: '$amount' }
          }
        }
      ]),
      
      // This month services
      ServiceOrderModel.countDocuments({
        userId,
        createdAt: {
          $gte: startOfMonth,
          $lte: endOfMonth
        }
      })
    ])

    const totalInvestment = totalInvestmentResult.length > 0 
      ? totalInvestmentResult[0].totalAmount 
      : 0

    const stats = {
      activeServices,
      completedServices,
      totalInvestment,
      thisMonthServices: thisMonthServicesCount
    }

    return NextResponse.json({
      success: true,
      data: stats
    })

  } catch (error) {
    console.error('Get service stats error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch service stats'
      },
      { status: 500 }
    )
  }
}