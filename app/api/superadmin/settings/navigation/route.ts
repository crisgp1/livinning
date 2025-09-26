import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { connectToDatabase } from '@/lib/infrastructure/database/connection'
import NavigationSettingsModel from '@/lib/infrastructure/database/models/NavigationSettingsModel'
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

    let navigationSettings = await NavigationSettingsModel.findOne({ _id: 'global' })

    // Create default settings if none exist
    if (!navigationSettings) {
      navigationSettings = new NavigationSettingsModel({
        _id: 'global',
        primaryNavigation: [
          {
            id: 'comprar',
            label: 'Comprar',
            href: '/propiedades',
            icon: 'Home',
            order: 1,
            isEnabled: true,
            visibility: {
              public: true,
              authenticated: true,
              roles: []
            }
          },
          {
            id: 'servicios',
            label: 'Servicios',
            href: '/servicios',
            icon: 'User2',
            order: 2,
            isEnabled: true,
            visibility: {
              public: true,
              authenticated: true,
              roles: []
            }
          },
          {
            id: 'contacto',
            label: 'Contacto',
            href: '/contacto',
            icon: 'Phone',
            order: 3,
            isEnabled: true,
            visibility: {
              public: true,
              authenticated: true,
              roles: []
            }
          }
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
        mobileMenuSettings: {
          showUserInfo: true,
          showNotifications: true,
          collapseSubmenus: true
        },
        breadcrumbSettings: {
          showBreadcrumbs: true,
          homeLabel: 'Inicio',
          separator: '/'
        },
        publishButton: {
          label: 'Publicar Propiedad',
          isEnabled: true,
          visibility: {
            public: false,
            authenticated: true,
            roles: []
          }
        }
      })
      await navigationSettings.save()
    }

    return NextResponse.json(navigationSettings)
  } catch (error) {
    console.error('Error fetching navigation settings:', error)
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

    const navigationSettings = await NavigationSettingsModel.findOneAndUpdate(
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

    return NextResponse.json(navigationSettings)
  } catch (error) {
    console.error('Error updating navigation settings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}