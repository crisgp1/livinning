import { NextResponse } from 'next/server'
import { withHighlightApiAuth } from '@/lib/utils/highlight-api-wrapper'

async function contactHandler(request: Request) {
  try {
    // Note: auth() is handled by the wrapper, but we can get it again if needed
    const { auth } = await import('@clerk/nextjs/server');
    const { userId } = await auth();

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

// Export the wrapped handler
export const POST = withHighlightApiAuth(contactHandler, {
  operationName: 'contact_form_submission',
  requireAuth: false // Contact form doesn't require authentication
});