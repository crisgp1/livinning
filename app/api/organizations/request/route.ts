import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import connectDB from '@/lib/infrastructure/database/connection'

// User requests organization creation
export async function POST(request: Request) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { organizationName, description, businessType } = await request.json()

    await connectDB()

    // Store organization request (pending approval)
    // You could create a separate OrganizationRequest model
    const organizationRequest = {
      userId,
      organizationName,
      description,
      businessType,
      status: 'pending',
      requestedAt: new Date()
    }

    // TODO: Save to database and notify superadmin
    
    return NextResponse.json({
      success: true,
      message: 'Solicitud de organización enviada. Te notificaremos cuando sea aprobada.'
    })

  } catch (error) {
    console.error('Organization request error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to submit request' },
      { status: 500 }
    )
  }
}