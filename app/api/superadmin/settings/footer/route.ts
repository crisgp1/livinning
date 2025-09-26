import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { connectToDatabase } from '@/lib/infrastructure/database/connection'
import FooterSettingsModel from '@/lib/infrastructure/database/models/FooterSettingsModel'
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

    let footerSettings = await FooterSettingsModel.findOne({ _id: 'global' })

    // Create default settings if none exist
    if (!footerSettings) {
      footerSettings = new FooterSettingsModel({
        _id: 'global',
        companyInfo: {
          name: 'Livinning',
          description: 'La plataforma líder de bienes raíces en México. Encuentra tu hogar ideal con nosotros.',
          showLogo: true
        },
        sections: [
          {
            id: 'company',
            title: 'Compañía',
            order: 1,
            isEnabled: true,
            links: [
              {
                id: 'about',
                label: 'Acerca de',
                href: '/about',
                order: 1,
                isEnabled: true,
                openInNewTab: false
              },
              {
                id: 'careers',
                label: 'Carreras',
                href: '/careers',
                order: 2,
                isEnabled: true,
                openInNewTab: false
              },
              {
                id: 'press',
                label: 'Prensa',
                href: '/press',
                order: 3,
                isEnabled: true,
                openInNewTab: false
              },
              {
                id: 'investors',
                label: 'Inversionistas',
                href: '/investors',
                order: 4,
                isEnabled: true,
                openInNewTab: false
              }
            ]
          },
          {
            id: 'services',
            title: 'Servicios',
            order: 2,
            isEnabled: true,
            links: [
              {
                id: 'buy',
                label: 'Comprar',
                href: '/propiedades',
                order: 1,
                isEnabled: true,
                openInNewTab: false
              },
              {
                id: 'rent',
                label: 'Rentar',
                href: '/rent',
                order: 2,
                isEnabled: true,
                openInNewTab: false
              },
              {
                id: 'sell',
                label: 'Vender',
                href: '/publish',
                order: 3,
                isEnabled: true,
                openInNewTab: false
              },
              {
                id: 'agents',
                label: 'Agentes',
                href: '/servicios',
                order: 4,
                isEnabled: true,
                openInNewTab: false
              }
            ]
          },
          {
            id: 'support',
            title: 'Soporte',
            order: 3,
            isEnabled: true,
            links: [
              {
                id: 'help',
                label: 'Centro de Ayuda',
                href: '/help',
                order: 1,
                isEnabled: true,
                openInNewTab: false
              },
              {
                id: 'contact',
                label: 'Contacto',
                href: '/contacto',
                order: 2,
                isEnabled: true,
                openInNewTab: false
              },
              {
                id: 'faq',
                label: 'Preguntas Frecuentes',
                href: '/faq',
                order: 3,
                isEnabled: true,
                openInNewTab: false
              },
              {
                id: 'guides',
                label: 'Guías',
                href: '/guides',
                order: 4,
                isEnabled: true,
                openInNewTab: false
              }
            ]
          }
        ],
        contactInfo: {
          showEmail: true,
          showPhone: true,
          showAddress: false,
          email: 'contacto@livinning.com',
          phone: '+52 55 1234 5678'
        },
        socialMedia: {
          showSocialLinks: true,
          facebook: 'https://facebook.com/livinning',
          twitter: 'https://twitter.com/livinning',
          instagram: 'https://instagram.com/livinning',
          youtube: 'https://youtube.com/livinning'
        },
        legalLinks: {
          privacyPolicyLabel: 'Privacidad',
          privacyPolicyUrl: '/privacy',
          termsLabel: 'Términos',
          termsUrl: '/terms',
          sitemapLabel: 'Mapa del Sitio',
          sitemapUrl: '/sitemap'
        },
        bottomBar: {
          showCopyright: true,
          copyrightText: '© 2025 Livinning. Todos los derechos reservados.',
          showLegalLinks: true,
          showSocialLinks: true
        },
        layout: {
          backgroundColor: '#f3f4f6',
          textColor: '#374151',
          linkColor: '#ff385c',
          maxColumns: 5,
          showDividers: true
        }
      })
      await footerSettings.save()
    }

    return NextResponse.json(footerSettings)
  } catch (error) {
    console.error('Error fetching footer settings:', error)
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

    const footerSettings = await FooterSettingsModel.findOneAndUpdate(
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

    return NextResponse.json(footerSettings)
  } catch (error) {
    console.error('Error updating footer settings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}