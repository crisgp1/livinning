import { NextRequest, NextResponse } from 'next/server'
import { PropertyModel } from '@/lib/infrastructure/database/schemas/PropertySchema'
import connectDB from '@/lib/infrastructure/database/connection'

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    // Actualizar todas las propiedades draft a published
    const result = await PropertyModel.updateMany(
      { status: 'draft' },
      { $set: { status: 'published', updatedAt: new Date() } }
    )
    
    return NextResponse.json({
      success: true,
      message: `${result.modifiedCount} propiedades actualizadas a estado published`,
      modifiedCount: result.modifiedCount
    })
    
  } catch (error) {
    console.error('Error updating properties:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update properties' 
      },
      { status: 500 }
    )
  }
}