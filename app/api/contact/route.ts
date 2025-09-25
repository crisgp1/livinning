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

    // Simulate email sending based on plan level
    const emailData = {
      to: supportEmail,
      from: 'noreply@livinning.com',
      subject: `[${priority.toUpperCase()}] ${subject}`,
      html: generateEmailTemplate({
        name,
        email,
        subject,
        message,
        priority,
        userPlan,
        isAgency,
        userId: userId || undefined
      })
    }

    // TODO: Replace with actual email service (SendGrid, Mailgun, etc.)
    console.log('Would send email:', emailData)

    // Send confirmation email to user
    const confirmationEmail = {
      to: email,
      from: 'noreply@livinning.com',
      subject: 'Confirmación de contacto - Livinning',
      html: generateConfirmationTemplate({
        name,
        subject,
        userPlan,
        supportEmail,
        responseTime: getResponseTime(userPlan)
      })
    }

    console.log('Would send confirmation email:', confirmationEmail)

    return NextResponse.json({
      success: true,
      message: 'Mensaje enviado correctamente',
      ticketId: generateTicketId()
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

function generateTicketId(): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substr(2, 5)
  return `LIV-${timestamp}-${random}`.toUpperCase()
}

function getResponseTime(userPlan: string): string {
  switch (userPlan) {
    case 'enterprise': return '2-4 horas'
    case 'premium': return '4-8 horas'
    case 'basic': return '12-24 horas'
    default: return '24-48 horas'
  }
}

function generateEmailTemplate({
  name,
  email,
  subject,
  message,
  priority,
  userPlan,
  isAgency,
  userId
}: {
  name: string
  email: string
  subject: string
  message: string
  priority: string
  userPlan: string
  isAgency: boolean
  userId?: string
}): string {
  const priorityColor = {
    urgent: '#dc2626',
    high: '#ea580c',
    normal: '#2563eb',
    low: '#6b7280'
  }[priority] || '#6b7280'

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Nuevo Mensaje de Contacto</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <header style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #ff385c; margin: 0;">Livinning</h1>
          <p style="margin: 5px 0; color: #666;">Nuevo mensaje de contacto</p>
        </header>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="margin-top: 0; color: #333;">Detalles del Contacto</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; font-weight: bold; width: 120px;">Nombre:</td>
              <td style="padding: 8px 0;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Email:</td>
              <td style="padding: 8px 0;">${email}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Plan:</td>
              <td style="padding: 8px 0;">${userPlan}${isAgency ? ' (Agencia)' : ''}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Prioridad:</td>
              <td style="padding: 8px 0;">
                <span style="background: ${priorityColor}; color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px;">
                  ${priority.toUpperCase()}
                </span>
              </td>
            </tr>
            ${userId ? `
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">User ID:</td>
              <td style="padding: 8px 0; font-family: monospace;">${userId}</td>
            </tr>
            ` : ''}
          </table>
        </div>
        
        <div style="background: white; padding: 20px; border-left: 4px solid #ff385c; margin-bottom: 20px;">
          <h3 style="margin-top: 0; color: #333;">Asunto: ${subject}</h3>
          <div style="white-space: pre-wrap; line-height: 1.6;">${message}</div>
        </div>
        
        <footer style="text-align: center; color: #666; font-size: 12px; margin-top: 30px;">
          <p>Este mensaje fue enviado desde el formulario de contacto de Livinning.com</p>
          <p>Timestamp: ${new Date().toLocaleString('es-MX')}</p>
        </footer>
      </div>
    </body>
    </html>
  `
}

function generateConfirmationTemplate({
  name,
  subject,
  userPlan,
  supportEmail,
  responseTime
}: {
  name: string
  subject: string
  userPlan: string
  supportEmail: string
  responseTime: string
}): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Confirmación de Contacto - Livinning</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <header style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #ff385c; margin: 0;">Livinning</h1>
          <p style="margin: 5px 0; color: #666;">Confirmación de mensaje recibido</p>
        </header>
        
        <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; border-left: 4px solid #0ea5e9;">
          <h2 style="margin-top: 0; color: #0ea5e9;">¡Mensaje recibido correctamente!</h2>
          <p>Hola <strong>${name}</strong>,</p>
          <p>Hemos recibido tu mensaje con el asunto "<strong>${subject}</strong>" y lo hemos enviado a nuestro equipo de soporte.</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #333;">Detalles de tu consulta</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; font-weight: bold; width: 150px;">Plan actual:</td>
              <td style="padding: 8px 0;">${userPlan}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Email de soporte:</td>
              <td style="padding: 8px 0;">${supportEmail}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Tiempo de respuesta:</td>
              <td style="padding: 8px 0;">${responseTime}</td>
            </tr>
          </table>
        </div>
        
        <div style="background: #fefce8; padding: 20px; border-radius: 8px; border-left: 4px solid #eab308;">
          <h3 style="margin-top: 0; color: #a16207;">Próximos pasos</h3>
          <ul style="margin: 0; padding-left: 20px;">
            <li>Revisaremos tu mensaje según la prioridad de tu plan</li>
            <li>Recibirás una respuesta en un plazo de <strong>${responseTime}</strong></li>
            <li>Si es urgente, puedes responder a este email</li>
          </ul>
        </div>
        
        <footer style="text-align: center; color: #666; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p><strong>Equipo de Soporte de Livinning</strong></p>
          <p>¿Necesitas ayuda inmediata? Visita nuestro <a href="http://localhost:3000/contacto" style="color: #ff385c;">centro de soporte</a></p>
        </footer>
      </div>
    </body>
    </html>
  `
}