import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/infrastructure/database/connection'
import SiteSettingsModel from '@/lib/infrastructure/database/models/SiteSettingsModel'
import NavigationSettingsModel from '@/lib/infrastructure/database/models/NavigationSettingsModel'
import FooterSettingsModel from '@/lib/infrastructure/database/models/FooterSettingsModel'
import ServiceSettingsModel from '@/lib/infrastructure/database/models/ServiceSettingsModel'

export async function GET() {
  try {
    await connectToDatabase()

    // Fetch all settings in parallel
    const [siteSettings, navigationSettings, footerSettings, serviceSettings] = await Promise.all([
      SiteSettingsModel.findOne({ _id: 'global' }),
      NavigationSettingsModel.findOne({ _id: 'global' }),
      FooterSettingsModel.findOne({ _id: 'global' }),
      ServiceSettingsModel.findOne({ _id: 'global' })
    ])

    // Return combined settings or defaults if none exist
    return NextResponse.json({
      site: siteSettings || {
        companyName: 'Livinning',
        tagline: 'Tu hogar ideal te está esperando',
        primaryColor: '#ff385c',
        secondaryColor: '#ff6b8a',
        contact: {
          email: 'contacto@livinning.com',
          phone: '+52 55 1234 5678'
        }
      },
      navigation: navigationSettings || {
        primaryNavigation: [
          { id: 'comprar', label: 'Comprar', href: '/propiedades', icon: 'Home', order: 1, isEnabled: true, visibility: { public: true, authenticated: true, roles: [] } },
          { id: 'servicios', label: 'Servicios', href: '/servicios', icon: 'User2', order: 2, isEnabled: true, visibility: { public: true, authenticated: true, roles: [] } },
          { id: 'contacto', label: 'Contacto', href: '/contacto', icon: 'Phone', order: 3, isEnabled: true, visibility: { public: true, authenticated: true, roles: [] } }
        ],
        authNavigation: {
          signInLabel: 'Iniciar Sesión',
          signUpLabel: 'Registrarse',
          signOutLabel: 'Cerrar Sesión',
          profileLabel: 'Perfil'
        },
        dashboardNavigation: {
          userDashboardLabel: 'Dashboard',
          adminDashboardLabel: 'Admin',
          helpdeskLabel: 'Helpdesk',
          providerLabel: 'Proveedor'
        },
        publishButton: {
          label: 'Publicar Propiedad',
          isEnabled: true
        }
      },
      footer: footerSettings || {
        companyInfo: { name: 'Livinning', description: 'La plataforma líder de bienes raíces en México.' },
        contactInfo: { email: 'contacto@livinning.com', phone: '+52 55 1234 5678' },
        bottomBar: { copyrightText: '© 2025 Livinning. Todos los derechos reservados.' }
      },
      services: serviceSettings || {
        pageSettings: { title: 'Servicios Digitales de Livinning' },
        accountTypes: {
          owner: { name: 'Propietario', buttonText: 'Crear Cuenta Propietario' },
          realEstate: { name: 'Inmobiliaria', buttonText: 'Crear Cuenta Inmobiliaria' },
          provider: { name: 'Proveedor de Servicios', buttonText: 'Crear Cuenta Proveedor' },
          premium: { name: 'Agencia Premium', buttonText: 'Crear Cuenta Premium' }
        }
      }
    })
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}