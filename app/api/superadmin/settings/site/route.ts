import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { connectToDatabase } from '@/lib/infrastructure/database/connection'
import SiteSettingsModel from '@/lib/infrastructure/database/models/SiteSettingsModel'
import { isSuperAdmin } from '@/lib/utils/superadmin'

export async function GET() {
  try {
    const { userId } = auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!await isSuperAdmin(userId)) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    await connectToDatabase()

    let siteSettings = await SiteSettingsModel.findOne({ _id: 'global' })

    // Create default settings if none exist
    if (!siteSettings) {
      siteSettings = new SiteSettingsModel({
        _id: 'global',
        companyName: 'Livinning',
        tagline: 'Tu hogar ideal te está esperando',
        description: 'La plataforma líder de bienes raíces en México. Encuentra tu hogar ideal con nosotros.',
        primaryColor: '#ff385c',
        secondaryColor: '#ff6b8a',
        contact: {
          email: 'contacto@livinning.com',
          phone: '+52 55 1234 5678',
          supportEmail: 'soporte@livinning.com',
          salesEmail: 'ventas@livinning.com'
        },
        social: {
          facebook: 'https://facebook.com/livinning',
          twitter: 'https://twitter.com/livinning',
          instagram: 'https://instagram.com/livinning',
          youtube: 'https://youtube.com/livinning'
        },
        seo: {
          metaTitle: 'Livinning - Bienes Raíces en México',
          metaDescription: 'Encuentra tu hogar ideal con Livinning, la plataforma líder de bienes raíces en México.',
          keywords: ['bienes raíces', 'propiedades', 'casas', 'departamentos', 'México']
        },
        features: {
          enableRegistration: true,
          enablePropertyPublishing: true,
          enableServices: true,
          enableBlog: false,
          enableNewsletter: false
        },
        legal: {
          copyrightNotice: '© 2025 Livinning. Todos los derechos reservados.'
        }
      })
      await siteSettings.save()
    }

    return NextResponse.json(siteSettings)
  } catch (error) {
    console.error('Error fetching site settings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId } = auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!await isSuperAdmin(userId)) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    const body = await request.json()

    await connectToDatabase()

    const siteSettings = await SiteSettingsModel.findOneAndUpdate(
      { _id: 'global' },
      {
        ...body,
        updatedAt: new Date()
      },
      {
        new: true,
        upsert: true,
        runValidators: true
      }
    )

    return NextResponse.json(siteSettings)
  } catch (error) {
    console.error('Error updating site settings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}