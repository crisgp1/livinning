'use client'

import { useAuth, useUser } from '@clerk/nextjs'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { canAccessProviderDashboard, getProviderDisplayName } from '@/lib/utils/provider-helpers'
import Navigation from '@/components/Navigation'
import {
  Home,
  BarChart3,
  Settings,
  Menu,
  X,
  Wrench,
  Sparkles,
  FileText,
  Users,
  Package,
  TrendingUp,
  History,
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  User,
  Phone,
  Mail,
  Star,
  CheckCircle2,
  Save,
  Edit3,
  Camera,
  Bell,
  Shield,
  CreditCard,
  Globe,
  Smartphone,
  MessageSquare,
  Eye,
  EyeOff,
  Palette,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  Store
} from 'lucide-react'
import Image from 'next/image'

interface ProviderSettings {
  // Personal Information
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  bio: string
  
  // Professional Information
  specialties: string[]
  experienceYears: number
  hourlyRate: number
  serviceRadius: number
  
  // Availability
  workingDays: string[]
  workingHours: {
    start: string
    end: string
  }
  
  // Notifications
  emailNotifications: boolean
  smsNotifications: boolean
  pushNotifications: boolean
  marketingEmails: boolean
  
  // Privacy
  showPhone: boolean
  showEmail: boolean
  showAddress: boolean
  
  // Preferences
  language: string
  currency: string
  darkMode: boolean
  soundEnabled: boolean
}

export default function SettingsPage() {
  const { isLoaded, userId } = useAuth()
  const { user } = useUser()
  const router = useRouter()
  const [hasAccess, setHasAccess] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('personal')
  const [settings, setSettings] = useState<ProviderSettings>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    bio: '',
    specialties: [],
    experienceYears: 0,
    hourlyRate: 0,
    serviceRadius: 10,
    workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    workingHours: {
      start: '09:00',
      end: '18:00'
    },
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    marketingEmails: false,
    showPhone: true,
    showEmail: false,
    showAddress: false,
    language: 'es',
    currency: 'MXN',
    darkMode: false,
    soundEnabled: true
  })

  useEffect(() => {
    const checkProviderAccess = async () => {
      if (!isLoaded) return

      if (!userId) {
        router.push('/')
        return
      }

      try {
        const metadata = user?.publicMetadata as any
        const userRole = metadata?.role
        const providerAccess = canAccessProviderDashboard(user)
        
        const hasRoleAccess = userRole === 'supplier' || userRole === 'provider' || providerAccess
        
        if (!hasRoleAccess) {
          router.push('/dashboard')
          return
        }

        setHasAccess(true)
        loadSettings()
      } catch (error) {
        console.error('Error checking provider access:', error)
        router.push('/dashboard')
      } finally {
        setLoading(false)
      }
    }

    checkProviderAccess()
  }, [isLoaded, userId, user, router])

  const loadSettings = async () => {
    try {
      // In real app, load from API
      if (user) {
        setSettings(prev => ({
          ...prev,
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.primaryEmailAddress?.emailAddress || '',
          bio: '',
          phone: '',
          address: '',
          specialties: [],
          experienceYears: 0,
          hourlyRate: 0
        }))
      }
    } catch (error) {
      console.error('Error loading settings:', error)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      // In real app, save to API
      await new Promise(resolve => setTimeout(resolve, 1000))
      console.log('Settings saved:', settings)
    } catch (error) {
      console.error('Error saving settings:', error)
    } finally {
      setSaving(false)
    }
  }

  const toggleWorkingDay = (day: string) => {
    setSettings(prev => ({
      ...prev,
      workingDays: prev.workingDays.includes(day)
        ? prev.workingDays.filter(d => d !== day)
        : [...prev.workingDays, day]
    }))
  }

  const weekDays = [
    { id: 'monday', name: 'Lunes' },
    { id: 'tuesday', name: 'Martes' },
    { id: 'wednesday', name: 'Miércoles' },
    { id: 'thursday', name: 'Jueves' },
    { id: 'friday', name: 'Viernes' },
    { id: 'saturday', name: 'Sábado' },
    { id: 'sunday', name: 'Domingo' }
  ]

  const availableSpecialties = [
    'Limpieza', 'Plomería', 'Electricidad', 'Jardinería', 
    'Pintura', 'Carpintería', 'Mantenimiento', 'Reparaciones'
  ]

  if (loading || !isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Acceso Denegado</h1>
          <p className="text-gray-600 mb-6">No tienes permisos para acceder al dashboard de proveedores.</p>
        </div>
      </div>
    )
  }

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, href: '/provider-dashboard' },
    { id: 'assigned-services', label: 'Asignados', icon: Wrench, href: '/provider-dashboard/assigned' },
    { id: 'work-orders', label: 'Órdenes', icon: FileText, href: '/provider-dashboard/orders' },
    { id: 'completed', label: 'Completados', icon: Package, href: '/provider-dashboard/completed' },
    { id: 'clients', label: 'Clientes', icon: Users, href: '/provider-dashboard/clients' },
    { id: 'earnings', label: 'Ganancias', icon: TrendingUp, href: '/provider-dashboard/earnings' },
    { id: 'vendor-services', label: 'Mis Servicios', icon: Store, href: '/provider-dashboard/vendor-services' },
    { id: 'historial', label: 'Historial', icon: History, href: '/provider-dashboard/historial' },
    { id: 'settings', label: 'Ajustes', icon: Settings, href: '/provider-dashboard/settings' },
    { id: 'home', label: 'Inicio', icon: Home, href: '/' },
  ]

  const tabs = [
    { id: 'personal', label: 'Información Personal', icon: User },
    { id: 'professional', label: 'Información Profesional', icon: Wrench },
    { id: 'availability', label: 'Disponibilidad', icon: Calendar },
    { id: 'notifications', label: 'Notificaciones', icon: Bell },
    { id: 'privacy', label: 'Privacidad', icon: Shield },
    { id: 'preferences', label: 'Preferencias', icon: Settings }
  ]

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      <div className="pt-20 flex relative">
        {/* Enhanced Background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-indigo-200 to-purple-200 rounded-full filter blur-3xl opacity-60"></div>
          <div className="absolute top-80 -left-40 w-96 h-96 bg-gradient-to-br from-blue-200 to-cyan-200 rounded-full filter blur-3xl opacity-60"></div>
          <div className="absolute bottom-20 right-20 w-72 h-72 bg-gradient-to-br from-pink-200 to-rose-200 rounded-full filter blur-3xl opacity-40"></div>
        </div>

        {/* Sidebar */}
        <div className="w-64 flex-shrink-0">
          <div className="fixed left-0 top-20 h-[calc(100vh-5rem)] w-64 m-4 p-6 overflow-y-auto glass-sidebar rounded-2xl">
            {/* User Info */}
            <div className="border-b border-gray-100 pb-6 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-white shadow-lg">
                  {user?.imageUrl ? (
                    <Image src={user.imageUrl} alt="Profile" width={60} height={60} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-500">
                      <span className="text-white font-medium text-lg">
                        {user?.firstName?.[0] || 'P'}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate text-gray-900">
                    {getProviderDisplayName(user)}
                  </p>
                  <p className="text-xs truncate text-gray-500">
                    Proveedor de Servicios
                  </p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="space-y-2">
              {sidebarItems.map((item) => {
                const isActive = item.href === '/provider-dashboard/settings'
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      router.push(item.href)
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                      isActive
                        ? 'bg-primary text-white shadow-lg shadow-primary/20'
                        : 'text-gray-600 hover:bg-white/50 hover:text-gray-900'
                    }`}
                  >
                    <div className={`p-2 rounded-lg transition-colors ${
                      isActive ? 'bg-white/20' : 'bg-gray-50'
                    }`}>
                      <item.icon size={18} className={isActive ? 'text-white' : ''} />
                    </div>
                    <span className="font-medium text-sm leading-tight">{item.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 relative z-10">
          <main className="pb-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              
          
              {/* Header */}
              <div className="mb-8 lg:mb-12 mt-6 lg:mt-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="hidden lg:block"
                >
                  <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium mb-6 glass-icon-container">
                    <div className="w-4 h-4 rounded-full bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center">
                      <Settings className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-gray-700">Configuración</span>
                  </div>
                  <h1 className="text-4xl md:text-6xl font-light mb-6 text-gray-900">
                    <span className="text-indigo-600 font-medium">Configuración</span> del Perfil
                  </h1>
                  <p className="text-xl max-w-3xl text-gray-600 mb-8">
                    Personaliza tu perfil, configuraciones de trabajo y preferencias 
                    para brindar la mejor experiencia a tus clientes.
                  </p>
                </motion.div>
              </div>

              <div className="flex flex-col lg:flex-row gap-8">
                {/* Tabs Navigation */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="lg:w-64"
                >
                  <div className="glass-icon-container rounded-2xl p-4">
                    <nav className="space-y-2">
                      {tabs.map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                            activeTab === tab.id
                              ? 'bg-primary text-white shadow-lg shadow-primary/20'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                          }`}
                        >
                          <tab.icon size={18} className={activeTab === tab.id ? 'text-white' : 'text-gray-500'} />
                          <span className="font-medium text-sm">{tab.label}</span>
                        </button>
                      ))}
                    </nav>
                  </div>
                </motion.div>

                {/* Tab Content */}
                <div className="flex-1">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="glass-icon-container rounded-2xl p-6"
                  >
                    {/* Personal Information Tab */}
                    {activeTab === 'personal' && (
                      <div className="space-y-6">
                        <div className="flex items-center gap-4 pb-6 border-b border-gray-100">
                          <User className="w-6 h-6 text-gray-600" />
                          <h2 className="text-xl font-semibold text-gray-900">Información Personal</h2>
                        </div>

                        <div className="flex flex-col items-center gap-4 mb-6">
                          <div className="relative">
                            <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                              {user?.imageUrl ? (
                                <Image src={user.imageUrl} alt="Profile" width={60} height={60} className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-white font-medium text-2xl">
                                  {user?.firstName?.[0] || 'P'}
                                </span>
                              )}
                            </div>
                            <button className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg border-2 border-gray-100 hover:bg-gray-50">
                              <Camera className="w-4 h-4 text-gray-600" />
                            </button>
                          </div>
                          <p className="text-sm text-gray-600">Haz clic para cambiar tu foto de perfil</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
                            <input
                              type="text"
                              value={settings.firstName}
                              onChange={(e) => setSettings(prev => ({...prev, firstName: e.target.value}))}
                              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Apellidos</label>
                            <input
                              type="text"
                              value={settings.lastName}
                              onChange={(e) => setSettings(prev => ({...prev, lastName: e.target.value}))}
                              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                            <input
                              type="email"
                              value={settings.email}
                              onChange={(e) => setSettings(prev => ({...prev, email: e.target.value}))}
                              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
                            <input
                              type="tel"
                              value={settings.phone}
                              onChange={(e) => setSettings(prev => ({...prev, phone: e.target.value}))}
                              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Dirección</label>
                          <input
                            type="text"
                            value={settings.address}
                            onChange={(e) => setSettings(prev => ({...prev, address: e.target.value}))}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Biografía</label>
                          <textarea
                            value={settings.bio}
                            onChange={(e) => setSettings(prev => ({...prev, bio: e.target.value}))}
                            rows={4}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            placeholder="Describe tu experiencia y servicios..."
                          />
                        </div>
                      </div>
                    )}

                    {/* Professional Information Tab */}
                    {activeTab === 'professional' && (
                      <div className="space-y-6">
                        <div className="flex items-center gap-4 pb-6 border-b border-gray-100">
                          <Wrench className="w-6 h-6 text-gray-600" />
                          <h2 className="text-xl font-semibold text-gray-900">Información Profesional</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Años de Experiencia</label>
                            <input
                              type="number"
                              value={settings.experienceYears}
                              onChange={(e) => setSettings(prev => ({...prev, experienceYears: parseInt(e.target.value) || 0}))}
                              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                              min="0"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Tarifa por Hora (MXN)</label>
                            <input
                              type="number"
                              value={settings.hourlyRate}
                              onChange={(e) => setSettings(prev => ({...prev, hourlyRate: parseInt(e.target.value) || 0}))}
                              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                              min="0"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Radio de Servicio (km)</label>
                          <input
                            type="range"
                            min="1"
                            max="50"
                            value={settings.serviceRadius}
                            onChange={(e) => setSettings(prev => ({...prev, serviceRadius: parseInt(e.target.value)}))}
                            className="w-full"
                          />
                          <div className="flex justify-between text-sm text-gray-600 mt-2">
                            <span>1 km</span>
                            <span className="font-medium">{settings.serviceRadius} km</span>
                            <span>50 km</span>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-4">Especialidades</label>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {availableSpecialties.map((specialty) => (
                              <label key={specialty} className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={settings.specialties.includes(specialty)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSettings(prev => ({
                                        ...prev,
                                        specialties: [...prev.specialties, specialty]
                                      }))
                                    } else {
                                      setSettings(prev => ({
                                        ...prev,
                                        specialties: prev.specialties.filter(s => s !== specialty)
                                      }))
                                    }
                                  }}
                                  className="rounded border-gray-300 text-primary focus:ring-primary"
                                />
                                <span className="text-sm text-gray-700">{specialty}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Availability Tab */}
                    {activeTab === 'availability' && (
                      <div className="space-y-6">
                        <div className="flex items-center gap-4 pb-6 border-b border-gray-100">
                          <Calendar className="w-6 h-6 text-gray-600" />
                          <h2 className="text-xl font-semibold text-gray-900">Disponibilidad</h2>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-4">Días de Trabajo</label>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {weekDays.map((day) => (
                              <button
                                key={day.id}
                                onClick={() => toggleWorkingDay(day.id)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                  settings.workingDays.includes(day.id)
                                    ? 'bg-primary text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                              >
                                {day.name}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Hora de Inicio</label>
                            <input
                              type="time"
                              value={settings.workingHours.start}
                              onChange={(e) => setSettings(prev => ({
                                ...prev,
                                workingHours: { ...prev.workingHours, start: e.target.value }
                              }))}
                              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Hora de Fin</label>
                            <input
                              type="time"
                              value={settings.workingHours.end}
                              onChange={(e) => setSettings(prev => ({
                                ...prev,
                                workingHours: { ...prev.workingHours, end: e.target.value }
                              }))}
                              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Notifications Tab */}
                    {activeTab === 'notifications' && (
                      <div className="space-y-6">
                        <div className="flex items-center gap-4 pb-6 border-b border-gray-100">
                          <Bell className="w-6 h-6 text-gray-600" />
                          <h2 className="text-xl font-semibold text-gray-900">Notificaciones</h2>
                        </div>

                        <div className="space-y-4">
                          {[
                            { key: 'emailNotifications', label: 'Notificaciones por Email', icon: Mail },
                            { key: 'smsNotifications', label: 'Notificaciones por SMS', icon: MessageSquare },
                            { key: 'pushNotifications', label: 'Notificaciones Push', icon: Smartphone },
                            { key: 'marketingEmails', label: 'Emails de Marketing', icon: Sparkles }
                          ].map((notification) => (
                            <div key={notification.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                              <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-white">
                                  <notification.icon className="w-5 h-5 text-gray-600" />
                                </div>
                                <span className="font-medium text-gray-900">{notification.label}</span>
                              </div>
                              <button
                                onClick={() => setSettings(prev => ({
                                  ...prev,
                                  [notification.key]: !prev[notification.key as keyof ProviderSettings]
                                }))}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                  settings[notification.key as keyof ProviderSettings]
                                    ? 'bg-primary'
                                    : 'bg-gray-200'
                                }`}
                              >
                                <span
                                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                    settings[notification.key as keyof ProviderSettings]
                                      ? 'translate-x-6'
                                      : 'translate-x-1'
                                  }`}
                                />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Privacy Tab */}
                    {activeTab === 'privacy' && (
                      <div className="space-y-6">
                        <div className="flex items-center gap-4 pb-6 border-b border-gray-100">
                          <Shield className="w-6 h-6 text-gray-600" />
                          <h2 className="text-xl font-semibold text-gray-900">Privacidad</h2>
                        </div>

                        <div className="space-y-4">
                          {[
                            { key: 'showPhone', label: 'Mostrar Teléfono en Perfil', icon: Phone },
                            { key: 'showEmail', label: 'Mostrar Email en Perfil', icon: Mail },
                            { key: 'showAddress', label: 'Mostrar Dirección en Perfil', icon: MapPin }
                          ].map((privacy) => (
                            <div key={privacy.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                              <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-white">
                                  <privacy.icon className="w-5 h-5 text-gray-600" />
                                </div>
                                <span className="font-medium text-gray-900">{privacy.label}</span>
                              </div>
                              <button
                                onClick={() => setSettings(prev => ({
                                  ...prev,
                                  [privacy.key]: !prev[privacy.key as keyof ProviderSettings]
                                }))}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                  settings[privacy.key as keyof ProviderSettings]
                                    ? 'bg-primary'
                                    : 'bg-gray-200'
                                }`}
                              >
                                <span
                                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                    settings[privacy.key as keyof ProviderSettings]
                                      ? 'translate-x-6'
                                      : 'translate-x-1'
                                  }`}
                                />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Preferences Tab */}
                    {activeTab === 'preferences' && (
                      <div className="space-y-6">
                        <div className="flex items-center gap-4 pb-6 border-b border-gray-100">
                          <Settings className="w-6 h-6 text-gray-600" />
                          <h2 className="text-xl font-semibold text-gray-900">Preferencias</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Idioma</label>
                            <select
                              value={settings.language}
                              onChange={(e) => setSettings(prev => ({...prev, language: e.target.value}))}
                              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            >
                              <option value="es">Español</option>
                              <option value="en">English</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Moneda</label>
                            <select
                              value={settings.currency}
                              onChange={(e) => setSettings(prev => ({...prev, currency: e.target.value}))}
                              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            >
                              <option value="MXN">Peso Mexicano (MXN)</option>
                              <option value="USD">Dólar Estadounidense (USD)</option>
                            </select>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-white">
                                {settings.darkMode ? <Moon className="w-5 h-5 text-gray-600" /> : <Sun className="w-5 h-5 text-gray-600" />}
                              </div>
                              <span className="font-medium text-gray-900">Modo Oscuro</span>
                            </div>
                            <button
                              onClick={() => setSettings(prev => ({...prev, darkMode: !prev.darkMode}))}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                settings.darkMode ? 'bg-primary' : 'bg-gray-200'
                              }`}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                  settings.darkMode ? 'translate-x-6' : 'translate-x-1'
                                }`}
                              />
                            </button>
                          </div>

                          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-white">
                                {settings.soundEnabled ? <Volume2 className="w-5 h-5 text-gray-600" /> : <VolumeX className="w-5 h-5 text-gray-600" />}
                              </div>
                              <span className="font-medium text-gray-900">Sonidos Habilitados</span>
                            </div>
                            <button
                              onClick={() => setSettings(prev => ({...prev, soundEnabled: !prev.soundEnabled}))}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                settings.soundEnabled ? 'bg-primary' : 'bg-gray-200'
                              }`}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                  settings.soundEnabled ? 'translate-x-6' : 'translate-x-1'
                                }`}
                              />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Save Button */}
                    <div className="flex justify-end pt-6 border-t border-gray-100 mt-8">
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
                      >
                        {saving ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Guardando...
                          </>
                        ) : (
                          <>
                            <Save size={18} />
                            Guardar Cambios
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}