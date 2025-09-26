'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Save,
  Settings,
  Globe,
  Navigation,
  Layout,
  Briefcase,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown
} from 'lucide-react'
import { useToast } from '@/components/Toast'

interface SiteSettings {
  companyName: string
  tagline?: string
  description?: string
  logo?: { url?: string; alt?: string }
  primaryColor?: string
  secondaryColor?: string
  contact: {
    email: string
    phone?: string
    address?: string
    supportEmail?: string
    salesEmail?: string
  }
  social: {
    facebook?: string
    twitter?: string
    instagram?: string
    youtube?: string
    linkedin?: string
  }
  features: {
    enableRegistration: boolean
    enablePropertyPublishing: boolean
    enableServices: boolean
    enableBlog: boolean
    enableNewsletter: boolean
  }
  legal: {
    copyrightNotice?: string
  }
}

interface NavigationItem {
  id: string
  label: string
  href: string
  icon?: string
  order: number
  isEnabled: boolean
  visibility: {
    public: boolean
    authenticated: boolean
    roles: string[]
  }
}

interface NavigationSettings {
  primaryNavigation: NavigationItem[]
  authNavigation: {
    signInLabel: string
    signUpLabel: string
    signOutLabel: string
    profileLabel: string
  }
  dashboardNavigation: {
    userDashboardLabel: string
    adminDashboardLabel: string
    helpdeskLabel: string
    providerLabel: string
  }
  publishButton?: {
    label: string
    isEnabled: boolean
    visibility: {
      public: boolean
      authenticated: boolean
      roles: string[]
    }
  }
}

interface FooterSection {
  id: string
  title: string
  order: number
  isEnabled: boolean
  links: Array<{
    id: string
    label: string
    href: string
    order: number
    isEnabled: boolean
    openInNewTab: boolean
  }>
}

interface FooterSettings {
  companyInfo: {
    name: string
    description?: string
    showLogo: boolean
  }
  sections: FooterSection[]
  contactInfo: {
    showEmail: boolean
    showPhone: boolean
    showAddress: boolean
    email?: string
    phone?: string
    address?: string
  }
  socialMedia: {
    showSocialLinks: boolean
    facebook?: string
    twitter?: string
    instagram?: string
    youtube?: string
    linkedin?: string
  }
  bottomBar: {
    showCopyright: boolean
    copyrightText?: string
    showLegalLinks: boolean
    showSocialLinks: boolean
  }
}

interface AccountType {
  name: string
  description: string
  features: string[]
  buttonText: string
  isEnabled: boolean
  badge?: string
}

interface ServiceSettings {
  pageSettings: {
    title: string
    subtitle?: string
    description?: string
  }
  accountTypes: {
    owner: AccountType
    realEstate: AccountType
    provider: AccountType
    premium: AccountType
  }
  contactSettings: {
    showContactForm: boolean
    showConsultationBooking: boolean
    consultationLabel: string
    contactButtonText: string
    expertConsultationText: string
  }
}

export default function SettingsPage() {
  const { showToast } = useToast()
  const [activeTab, setActiveTab] = useState('site')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [siteSettings, setSiteSettings] = useState<SiteSettings>({
    companyName: '',
    contact: { email: '' },
    social: {},
    features: {
      enableRegistration: true,
      enablePropertyPublishing: true,
      enableServices: true,
      enableBlog: false,
      enableNewsletter: false
    },
    legal: {}
  })

  const [navigationSettings, setNavigationSettings] = useState<NavigationSettings>({
    primaryNavigation: [],
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
    }
  })

  const [footerSettings, setFooterSettings] = useState<FooterSettings>({
    companyInfo: { name: '', showLogo: true },
    sections: [],
    contactInfo: {
      showEmail: true,
      showPhone: true,
      showAddress: false
    },
    socialMedia: { showSocialLinks: true },
    bottomBar: {
      showCopyright: true,
      showLegalLinks: true,
      showSocialLinks: true
    }
  })

  const [serviceSettings, setServiceSettings] = useState<ServiceSettings>({
    pageSettings: { title: '' },
    accountTypes: {
      owner: { name: '', description: '', features: [], buttonText: '', isEnabled: true },
      realEstate: { name: '', description: '', features: [], buttonText: '', isEnabled: true },
      provider: { name: '', description: '', features: [], buttonText: '', isEnabled: true },
      premium: { name: '', description: '', features: [], buttonText: '', isEnabled: true }
    },
    contactSettings: {
      showContactForm: true,
      showConsultationBooking: true,
      consultationLabel: '',
      contactButtonText: '',
      expertConsultationText: ''
    }
  })

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setLoading(true)

      const [siteRes, navRes, footerRes, serviceRes] = await Promise.all([
        fetch('/api/superadmin/settings/site'),
        fetch('/api/superadmin/settings/navigation'),
        fetch('/api/superadmin/settings/footer'),
        fetch('/api/superadmin/settings/services')
      ])

      if (siteRes.ok) setSiteSettings(await siteRes.json())
      if (navRes.ok) setNavigationSettings(await navRes.json())
      if (footerRes.ok) setFooterSettings(await footerRes.json())
      if (serviceRes.ok) setServiceSettings(await serviceRes.json())

    } catch (error) {
      console.error('Error loading settings:', error)
      showToast('Error al cargar configuraciones', 'error')
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async (type: string) => {
    try {
      setSaving(true)

      let response
      let data

      switch (type) {
        case 'site':
          data = siteSettings
          response = await fetch('/api/superadmin/settings/site', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          })
          break
        case 'navigation':
          data = navigationSettings
          response = await fetch('/api/superadmin/settings/navigation', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          })
          break
        case 'footer':
          data = footerSettings
          response = await fetch('/api/superadmin/settings/footer', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          })
          break
        case 'services':
          data = serviceSettings
          response = await fetch('/api/superadmin/settings/services', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          })
          break
        default:
          throw new Error('Tipo de configuración no válido')
      }

      if (response && response.ok) {
        showToast('Configuraciones guardadas correctamente', 'success')
      } else {
        throw new Error('Error al guardar')
      }

    } catch (error) {
      console.error('Error saving settings:', error)
      showToast('Error al guardar configuraciones', 'error')
    } finally {
      setSaving(false)
    }
  }

  const addNavigationItem = () => {
    const newItem: NavigationItem = {
      id: `nav-${Date.now()}`,
      label: 'Nuevo Item',
      href: '/',
      icon: 'Home',
      order: navigationSettings.primaryNavigation.length + 1,
      isEnabled: true,
      visibility: {
        public: true,
        authenticated: true,
        roles: []
      }
    }
    setNavigationSettings({
      ...navigationSettings,
      primaryNavigation: [...navigationSettings.primaryNavigation, newItem]
    })
  }

  const removeNavigationItem = (id: string) => {
    setNavigationSettings({
      ...navigationSettings,
      primaryNavigation: navigationSettings.primaryNavigation.filter(item => item.id !== id)
    })
  }

  const moveNavigationItem = (index: number, direction: 'up' | 'down') => {
    const items = [...navigationSettings.primaryNavigation]
    const newIndex = direction === 'up' ? index - 1 : index + 1

    if (newIndex >= 0 && newIndex < items.length) {
      [items[index], items[newIndex]] = [items[newIndex], items[index]]
      // Update order numbers
      items.forEach((item, i) => { item.order = i + 1 })

      setNavigationSettings({
        ...navigationSettings,
        primaryNavigation: items
      })
    }
  }

  const tabs = [
    { id: 'site', label: 'Configuración del Sitio', icon: Globe },
    { id: 'navigation', label: 'Navegación', icon: Navigation },
    { id: 'footer', label: 'Footer', icon: Layout },
    { id: 'services', label: 'Servicios', icon: Briefcase }
  ]

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Settings className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">Configuración del Sitio</h1>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-8 bg-gray-100 p-1 rounded-lg">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Site Settings */}
        {activeTab === 'site' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Configuración General</h2>
              <button
                onClick={() => saveSettings('site')}
                disabled={saving}
                className="btn-primary flex items-center gap-2"
              >
                <Save size={16} />
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Nombre de la Empresa</label>
                  <input
                    type="text"
                    value={siteSettings.companyName}
                    onChange={(e) => setSiteSettings({
                      ...siteSettings,
                      companyName: e.target.value
                    })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    placeholder="Nombre de tu empresa"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Tagline</label>
                  <input
                    type="text"
                    value={siteSettings.tagline || ''}
                    onChange={(e) => setSiteSettings({
                      ...siteSettings,
                      tagline: e.target.value
                    })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    placeholder="Slogan de tu empresa"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Descripción</label>
                <textarea
                  value={siteSettings.description || ''}
                  onChange={(e) => setSiteSettings({
                    ...siteSettings,
                    description: e.target.value
                  })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                  rows={3}
                  placeholder="Descripción de tu empresa"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Color Primario</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={siteSettings.primaryColor || '#ff385c'}
                      onChange={(e) => setSiteSettings({
                        ...siteSettings,
                        primaryColor: e.target.value
                      })}
                      className="w-12 h-12 border border-gray-300 rounded-lg"
                    />
                    <input
                      type="text"
                      value={siteSettings.primaryColor || '#ff385c'}
                      onChange={(e) => setSiteSettings({
                        ...siteSettings,
                        primaryColor: e.target.value
                      })}
                      className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                      placeholder="#ff385c"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Color Secundario</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={siteSettings.secondaryColor || '#ff6b8a'}
                      onChange={(e) => setSiteSettings({
                        ...siteSettings,
                        secondaryColor: e.target.value
                      })}
                      className="w-12 h-12 border border-gray-300 rounded-lg"
                    />
                    <input
                      type="text"
                      value={siteSettings.secondaryColor || '#ff6b8a'}
                      onChange={(e) => setSiteSettings({
                        ...siteSettings,
                        secondaryColor: e.target.value
                      })}
                      className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                      placeholder="#ff6b8a"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Información de Contacto</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Email Principal</label>
                    <input
                      type="email"
                      value={siteSettings.contact.email}
                      onChange={(e) => setSiteSettings({
                        ...siteSettings,
                        contact: { ...siteSettings.contact, email: e.target.value }
                      })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                      placeholder="contacto@empresa.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Teléfono</label>
                    <input
                      type="tel"
                      value={siteSettings.contact.phone || ''}
                      onChange={(e) => setSiteSettings({
                        ...siteSettings,
                        contact: { ...siteSettings.contact, phone: e.target.value }
                      })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                      placeholder="+52 55 1234 5678"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Email de Soporte</label>
                    <input
                      type="email"
                      value={siteSettings.contact.supportEmail || ''}
                      onChange={(e) => setSiteSettings({
                        ...siteSettings,
                        contact: { ...siteSettings.contact, supportEmail: e.target.value }
                      })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                      placeholder="soporte@empresa.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Email de Ventas</label>
                    <input
                      type="email"
                      value={siteSettings.contact.salesEmail || ''}
                      onChange={(e) => setSiteSettings({
                        ...siteSettings,
                        contact: { ...siteSettings.contact, salesEmail: e.target.value }
                      })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                      placeholder="ventas@empresa.com"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Redes Sociales</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Facebook</label>
                    <input
                      type="url"
                      value={siteSettings.social.facebook || ''}
                      onChange={(e) => setSiteSettings({
                        ...siteSettings,
                        social: { ...siteSettings.social, facebook: e.target.value }
                      })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                      placeholder="https://facebook.com/empresa"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Twitter</label>
                    <input
                      type="url"
                      value={siteSettings.social.twitter || ''}
                      onChange={(e) => setSiteSettings({
                        ...siteSettings,
                        social: { ...siteSettings.social, twitter: e.target.value }
                      })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                      placeholder="https://twitter.com/empresa"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Instagram</label>
                    <input
                      type="url"
                      value={siteSettings.social.instagram || ''}
                      onChange={(e) => setSiteSettings({
                        ...siteSettings,
                        social: { ...siteSettings.social, instagram: e.target.value }
                      })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                      placeholder="https://instagram.com/empresa"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">YouTube</label>
                    <input
                      type="url"
                      value={siteSettings.social.youtube || ''}
                      onChange={(e) => setSiteSettings({
                        ...siteSettings,
                        social: { ...siteSettings.social, youtube: e.target.value }
                      })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                      placeholder="https://youtube.com/empresa"
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Navigation Settings */}
        {activeTab === 'navigation' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Configuración de Navegación</h2>
              <button
                onClick={() => saveSettings('navigation')}
                disabled={saving}
                className="btn-primary flex items-center gap-2"
              >
                <Save size={16} />
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Navegación Principal</h3>
                  <button
                    onClick={addNavigationItem}
                    className="btn-outline flex items-center gap-2"
                  >
                    <Plus size={16} />
                    Agregar Item
                  </button>
                </div>

                <div className="space-y-3">
                  {navigationSettings.primaryNavigation.map((item, index) => (
                    <div key={item.id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="flex gap-1">
                            <button
                              onClick={() => moveNavigationItem(index, 'up')}
                              disabled={index === 0}
                              className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                            >
                              <ArrowUp size={16} />
                            </button>
                            <button
                              onClick={() => moveNavigationItem(index, 'down')}
                              disabled={index === navigationSettings.primaryNavigation.length - 1}
                              className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                            >
                              <ArrowDown size={16} />
                            </button>
                          </div>
                          <span className="font-medium">{item.label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              const updated = [...navigationSettings.primaryNavigation]
                              updated[index] = { ...updated[index], isEnabled: !updated[index].isEnabled }
                              setNavigationSettings({
                                ...navigationSettings,
                                primaryNavigation: updated
                              })
                            }}
                            className="p-1 text-gray-400 hover:text-gray-600"
                          >
                            {item.isEnabled ? <Eye size={16} /> : <EyeOff size={16} />}
                          </button>
                          <button
                            onClick={() => removeNavigationItem(item.id)}
                            className="p-1 text-red-400 hover:text-red-600"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-4 gap-3">
                        <div>
                          <label className="block text-sm font-medium mb-1">Etiqueta</label>
                          <input
                            type="text"
                            value={item.label}
                            onChange={(e) => {
                              const updated = [...navigationSettings.primaryNavigation]
                              updated[index] = { ...updated[index], label: e.target.value }
                              setNavigationSettings({
                                ...navigationSettings,
                                primaryNavigation: updated
                              })
                            }}
                            className="w-full p-2 border border-gray-300 rounded focus:ring-primary focus:border-primary"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-1">URL</label>
                          <input
                            type="text"
                            value={item.href}
                            onChange={(e) => {
                              const updated = [...navigationSettings.primaryNavigation]
                              updated[index] = { ...updated[index], href: e.target.value }
                              setNavigationSettings({
                                ...navigationSettings,
                                primaryNavigation: updated
                              })
                            }}
                            className="w-full p-2 border border-gray-300 rounded focus:ring-primary focus:border-primary"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-1">Icono</label>
                          <input
                            type="text"
                            value={item.icon || ''}
                            onChange={(e) => {
                              const updated = [...navigationSettings.primaryNavigation]
                              updated[index] = { ...updated[index], icon: e.target.value }
                              setNavigationSettings({
                                ...navigationSettings,
                                primaryNavigation: updated
                              })
                            }}
                            className="w-full p-2 border border-gray-300 rounded focus:ring-primary focus:border-primary"
                            placeholder="Home, User2, Phone..."
                          />
                        </div>

                        <div className="flex items-center gap-4 pt-6">
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={item.visibility.public}
                              onChange={(e) => {
                                const updated = [...navigationSettings.primaryNavigation]
                                updated[index] = {
                                  ...updated[index],
                                  visibility: {
                                    ...updated[index].visibility,
                                    public: e.target.checked
                                  }
                                }
                                setNavigationSettings({
                                  ...navigationSettings,
                                  primaryNavigation: updated
                                })
                              }}
                              className="rounded"
                            />
                            <span className="text-sm">Público</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Etiquetas de Autenticación</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Iniciar Sesión</label>
                    <input
                      type="text"
                      value={navigationSettings.authNavigation.signInLabel}
                      onChange={(e) => setNavigationSettings({
                        ...navigationSettings,
                        authNavigation: {
                          ...navigationSettings.authNavigation,
                          signInLabel: e.target.value
                        }
                      })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Registrarse</label>
                    <input
                      type="text"
                      value={navigationSettings.authNavigation.signUpLabel}
                      onChange={(e) => setNavigationSettings({
                        ...navigationSettings,
                        authNavigation: {
                          ...navigationSettings.authNavigation,
                          signUpLabel: e.target.value
                        }
                      })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Etiquetas del Dashboard</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Dashboard de Usuario</label>
                    <input
                      type="text"
                      value={navigationSettings.dashboardNavigation.userDashboardLabel}
                      onChange={(e) => setNavigationSettings({
                        ...navigationSettings,
                        dashboardNavigation: {
                          ...navigationSettings.dashboardNavigation,
                          userDashboardLabel: e.target.value
                        }
                      })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Dashboard de Admin</label>
                    <input
                      type="text"
                      value={navigationSettings.dashboardNavigation.adminDashboardLabel}
                      onChange={(e) => setNavigationSettings({
                        ...navigationSettings,
                        dashboardNavigation: {
                          ...navigationSettings.dashboardNavigation,
                          adminDashboardLabel: e.target.value
                        }
                      })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Helpdesk</label>
                    <input
                      type="text"
                      value={navigationSettings.dashboardNavigation.helpdeskLabel}
                      onChange={(e) => setNavigationSettings({
                        ...navigationSettings,
                        dashboardNavigation: {
                          ...navigationSettings.dashboardNavigation,
                          helpdeskLabel: e.target.value
                        }
                      })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Proveedor</label>
                    <input
                      type="text"
                      value={navigationSettings.dashboardNavigation.providerLabel}
                      onChange={(e) => setNavigationSettings({
                        ...navigationSettings,
                        dashboardNavigation: {
                          ...navigationSettings.dashboardNavigation,
                          providerLabel: e.target.value
                        }
                      })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    />
                  </div>
                </div>
              </div>

              {navigationSettings.publishButton && (
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Botón de Publicar</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">Etiqueta del Botón</label>
                      <input
                        type="text"
                        value={navigationSettings.publishButton.label}
                        onChange={(e) => setNavigationSettings({
                          ...navigationSettings,
                          publishButton: {
                            ...navigationSettings.publishButton!,
                            label: e.target.value
                          }
                        })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                      />
                    </div>

                    <div className="flex items-center pt-8">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={navigationSettings.publishButton.isEnabled}
                          onChange={(e) => setNavigationSettings({
                            ...navigationSettings,
                            publishButton: {
                              ...navigationSettings.publishButton!,
                              isEnabled: e.target.checked
                            }
                          })}
                          className="rounded"
                        />
                        <span className="text-sm font-medium">Botón Habilitado</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Footer Settings Tab */}
        {activeTab === 'footer' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Configuración del Footer</h2>
              <button
                onClick={() => saveSettings('footer')}
                disabled={saving}
                className="btn-primary flex items-center gap-2"
              >
                <Save size={16} />
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Información de la Empresa</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Nombre de la Empresa</label>
                    <input
                      type="text"
                      value={footerSettings.companyInfo.name}
                      onChange={(e) => setFooterSettings({
                        ...footerSettings,
                        companyInfo: {
                          ...footerSettings.companyInfo,
                          name: e.target.value
                        }
                      })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    />
                  </div>

                  <div className="flex items-center pt-8">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={footerSettings.companyInfo.showLogo}
                        onChange={(e) => setFooterSettings({
                          ...footerSettings,
                          companyInfo: {
                            ...footerSettings.companyInfo,
                            showLogo: e.target.checked
                          }
                        })}
                        className="rounded"
                      />
                      <span className="text-sm font-medium">Mostrar Logo</span>
                    </label>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium mb-2">Descripción</label>
                  <textarea
                    value={footerSettings.companyInfo.description || ''}
                    onChange={(e) => setFooterSettings({
                      ...footerSettings,
                      companyInfo: {
                        ...footerSettings.companyInfo,
                        description: e.target.value
                      }
                    })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    rows={3}
                  />
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Información de Contacto</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <input
                      type="email"
                      value={footerSettings.contactInfo.email || ''}
                      onChange={(e) => setFooterSettings({
                        ...footerSettings,
                        contactInfo: {
                          ...footerSettings.contactInfo,
                          email: e.target.value
                        }
                      })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    />
                    <label className="flex items-center gap-2 mt-2">
                      <input
                        type="checkbox"
                        checked={footerSettings.contactInfo.showEmail}
                        onChange={(e) => setFooterSettings({
                          ...footerSettings,
                          contactInfo: {
                            ...footerSettings.contactInfo,
                            showEmail: e.target.checked
                          }
                        })}
                        className="rounded"
                      />
                      <span className="text-sm">Mostrar Email</span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Teléfono</label>
                    <input
                      type="tel"
                      value={footerSettings.contactInfo.phone || ''}
                      onChange={(e) => setFooterSettings({
                        ...footerSettings,
                        contactInfo: {
                          ...footerSettings.contactInfo,
                          phone: e.target.value
                        }
                      })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    />
                    <label className="flex items-center gap-2 mt-2">
                      <input
                        type="checkbox"
                        checked={footerSettings.contactInfo.showPhone}
                        onChange={(e) => setFooterSettings({
                          ...footerSettings,
                          contactInfo: {
                            ...footerSettings.contactInfo,
                            showPhone: e.target.checked
                          }
                        })}
                        className="rounded"
                      />
                      <span className="text-sm">Mostrar Teléfono</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Configuración de la Barra Inferior</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Texto de Copyright</label>
                    <input
                      type="text"
                      value={footerSettings.bottomBar.copyrightText || ''}
                      onChange={(e) => setFooterSettings({
                        ...footerSettings,
                        bottomBar: {
                          ...footerSettings.bottomBar,
                          copyrightText: e.target.value
                        }
                      })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                      placeholder="© 2025 Tu Empresa. Todos los derechos reservados."
                    />
                  </div>

                  <div className="flex gap-6">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={footerSettings.bottomBar.showCopyright}
                        onChange={(e) => setFooterSettings({
                          ...footerSettings,
                          bottomBar: {
                            ...footerSettings.bottomBar,
                            showCopyright: e.target.checked
                          }
                        })}
                        className="rounded"
                      />
                      <span className="text-sm">Mostrar Copyright</span>
                    </label>

                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={footerSettings.bottomBar.showLegalLinks}
                        onChange={(e) => setFooterSettings({
                          ...footerSettings,
                          bottomBar: {
                            ...footerSettings.bottomBar,
                            showLegalLinks: e.target.checked
                          }
                        })}
                        className="rounded"
                      />
                      <span className="text-sm">Mostrar Enlaces Legales</span>
                    </label>

                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={footerSettings.bottomBar.showSocialLinks}
                        onChange={(e) => setFooterSettings({
                          ...footerSettings,
                          bottomBar: {
                            ...footerSettings.bottomBar,
                            showSocialLinks: e.target.checked
                          }
                        })}
                        className="rounded"
                      />
                      <span className="text-sm">Mostrar Redes Sociales</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Services Settings Tab */}
        {activeTab === 'services' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Configuración de Servicios</h2>
              <button
                onClick={() => saveSettings('services')}
                disabled={saving}
                className="btn-primary flex items-center gap-2"
              >
                <Save size={16} />
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Configuración de la Página</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Título de la Página</label>
                    <input
                      type="text"
                      value={serviceSettings.pageSettings.title}
                      onChange={(e) => setServiceSettings({
                        ...serviceSettings,
                        pageSettings: {
                          ...serviceSettings.pageSettings,
                          title: e.target.value
                        }
                      })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Subtítulo</label>
                    <input
                      type="text"
                      value={serviceSettings.pageSettings.subtitle || ''}
                      onChange={(e) => setServiceSettings({
                        ...serviceSettings,
                        pageSettings: {
                          ...serviceSettings.pageSettings,
                          subtitle: e.target.value
                        }
                      })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Descripción</label>
                    <textarea
                      value={serviceSettings.pageSettings.description || ''}
                      onChange={(e) => setServiceSettings({
                        ...serviceSettings,
                        pageSettings: {
                          ...serviceSettings.pageSettings,
                          description: e.target.value
                        }
                      })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Tipos de Cuenta</h3>
                {Object.entries(serviceSettings.accountTypes).map(([key, accountType]) => (
                  <div key={key} className="mb-6 p-4 border border-gray-200 rounded-lg">
                    <h4 className="font-medium mb-3 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Nombre</label>
                        <input
                          type="text"
                          value={accountType.name}
                          onChange={(e) => setServiceSettings({
                            ...serviceSettings,
                            accountTypes: {
                              ...serviceSettings.accountTypes,
                              [key]: { ...accountType, name: e.target.value }
                            }
                          })}
                          className="w-full p-2 border border-gray-300 rounded focus:ring-primary focus:border-primary"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">Texto del Botón</label>
                        <input
                          type="text"
                          value={accountType.buttonText}
                          onChange={(e) => setServiceSettings({
                            ...serviceSettings,
                            accountTypes: {
                              ...serviceSettings.accountTypes,
                              [key]: { ...accountType, buttonText: e.target.value }
                            }
                          })}
                          className="w-full p-2 border border-gray-300 rounded focus:ring-primary focus:border-primary"
                        />
                      </div>
                    </div>

                    <div className="mt-3">
                      <label className="block text-sm font-medium mb-1">Descripción</label>
                      <textarea
                        value={accountType.description}
                        onChange={(e) => setServiceSettings({
                          ...serviceSettings,
                          accountTypes: {
                            ...serviceSettings.accountTypes,
                            [key]: { ...accountType, description: e.target.value }
                          }
                        })}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-primary focus:border-primary"
                        rows={2}
                      />
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex-1">
                        <label className="block text-sm font-medium mb-1">Características (una por línea)</label>
                        <textarea
                          value={accountType.features.join('\n')}
                          onChange={(e) => setServiceSettings({
                            ...serviceSettings,
                            accountTypes: {
                              ...serviceSettings.accountTypes,
                              [key]: {
                                ...accountType,
                                features: e.target.value.split('\n').filter(f => f.trim() !== '')
                              }
                            }
                          })}
                          className="w-full p-2 border border-gray-300 rounded focus:ring-primary focus:border-primary"
                          rows={3}
                        />
                      </div>

                      <div className="ml-4">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={accountType.isEnabled}
                            onChange={(e) => setServiceSettings({
                              ...serviceSettings,
                              accountTypes: {
                                ...serviceSettings.accountTypes,
                                [key]: { ...accountType, isEnabled: e.target.checked }
                              }
                            })}
                            className="rounded"
                          />
                          <span className="text-sm font-medium">Habilitado</span>
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}