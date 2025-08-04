import { NextResponse } from 'next/server'
import connectDB from '@/lib/infrastructure/database/connection'
import { PropertyModel } from '@/lib/infrastructure/database/schemas/PropertySchema'

export async function GET() {
  try {
    // Test database connection
    await connectDB()
    
    // Test if we can query the properties collection
    const count = await PropertyModel.countDocuments()
    const properties = await PropertyModel.find().limit(5).lean()
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      data: {
        propertyCount: count,
        sampleProperties: properties,
        databaseName: PropertyModel.db.name
      }
    })
  } catch (error) {
    console.error('Database connection error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Database connection failed',
        details: error
      },
      { status: 500 }
    )
  }
}