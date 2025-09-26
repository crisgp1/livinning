import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

export async function POST(request: Request) {
  try {
    const { userId } = await auth()

    const {
      name,
      email,
      subject,
      message,
      priority,
      userPlan,
      isAgency,
      supportEmail
    } = await request.json()

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Here you would typically:
    // 1. Save to database
    // 2. Send email to appropriate support team
    // 3. Create ticket in support system
    // 4. Send confirmation email to user

    console.log('Contact form submission:', {
      name,
      email,
      subject,
      message,
      priority,
      userPlan,
      isAgency,
      supportEmail,
      userId,
      timestamp: new Date().toISOString()
    })

    return NextResponse.json({
      success: true,
      message: 'Mensaje enviado correctamente',
      ticketId: crypto.randomUUID()
    })

  } catch (error) {
    console.error('Contact form error:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send message'
      },
      { status: 500 }
    )
  }
}