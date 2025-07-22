'use client'

import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Navigation from '@/components/Navigation'
import { 
  Settings, 
  User,
  Bell,
  Lock,
  CreditCard,
  Eye,
  EyeOff,
  Camera,
  Save,
  Sparkles
} from 'lucide-react'

interface UserSettings {
  firstName: string
  lastName: string
  email: string
  phone: string
  notifications: {
    email: boolean
    sms: boolean
    push: boolean
  }
  privacy: {
    profileVisible: boolean
    contactVisible: boolean
  }
}

export default function DashboardSettings() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [settings, setSettings] = useState<UserSettings>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    notifications: {
      email: true,
      sms: false,
      push: true
    },
    privacy: {
      profileVisible: true,
      contactVisible: false
    }
  })
  const [activeTab, setActiveTab] = useState('profile')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: ''
  })

  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/sign-in')
    } else if (isLoaded && user) {
      setSettings(prev => ({
        ...prev,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.emailAddresses?.[0]?.emailAddress || '',
        phone: user.phoneNumbers?.[0]?.phoneNumber || ''
      }))
    }
  }, [user, isLoaded, router])

  const handleSaveProfile = async () => {
    setIsLoading(true)
    try {
      // Mock save - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      console.log('Settings saved:', settings)
    } catch (error) {
      console.error('Error saving settings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordChange = async () => {
    if (passwordData.new !== passwordData.confirm) {
      alert('Las contraseñas no coinciden')
      return
    }
    
    setIsLoading(true)
    try {
      // Mock password change - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      setPasswordData({ current: '', new: '', confirm: '' })
      alert('Contraseña actualizada correctamente')
    } catch (error) {
      console.error('Error changing password:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const tabs = [
    { id: 'profile', label: 'Perfil', icon: User },
    { id: 'notifications', label: 'Notificaciones', icon: Bell },
    { id: 'security', label: 'Seguridad', icon: Lock },
    { id: 'billing', label: 'Facturación', icon: CreditCard }
  ]

  if (!isLoaded || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-primary rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      <div className="pt-20 relative">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-200 to-cyan-200 rounded-full filter blur-3xl opacity-60"></div>
          <div className="absolute top-80 -left-40 w-96 h-96 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full filter blur-3xl opacity-60"></div>
          <div className="absolute bottom-20 right-20 w-72 h-72 bg-gradient-to-br from-green-200 to-emerald-200 rounded-full filter blur-3xl opacity-40"></div>
        </div>

        <main className="relative z-10 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* Header */}
            <div className="mb-8 lg:mb-12 mt-6 lg:mt-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 mb-4"
              >
                <div className="p-2 rounded-lg glass">
                  <Settings className="w-5 h-5 text-primary" />
                </div>
                <span className="text-sm font-medium text-primary">Configuración</span>
              </motion.div>
              
              <div>
                <h1 className="text-3xl lg:text-4xl font-light mb-2 text-gray-900">
                  Configuración de la cuenta
                </h1>
                <p className="text-lg text-gray-600">
                  Gestiona tu perfil, preferencias y configuración de seguridad
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Sidebar */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="glass-icon-container rounded-2xl p-6 h-fit"
              >
                <nav className="space-y-2">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                        activeTab === tab.id
                          ? 'bg-primary text-white shadow-lg shadow-primary/20'
                          : 'text-gray-600 hover:bg-white/50 hover:text-gray-900'
                      }`}
                    >
                      <tab.icon size={20} />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  ))}
                </nav>
              </motion.div>

              {/* Content */}
              <div className="lg:col-span-3">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-icon-container rounded-2xl p-8"
                >
                  {activeTab === 'profile' && (
                    <div>
                      <h2 className="text-2xl font-light mb-6 text-gray-900">Información del perfil</h2>
                      
                      {/* Avatar */}
                      <div className="flex items-center gap-6 mb-8">
                        <div className="relative">
                          <div className="w-20 h-20 rounded-full overflow-hidden ring-4 ring-white shadow-lg">
                            {user?.imageUrl ? (
                              <img src={user.imageUrl} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary to-blue-600">
                                <span className="text-white font-medium text-2xl">
                                  {user?.firstName?.[0] || 'U'}
                                </span>
                              </div>
                            )}
                          </div>
                          <button className="absolute bottom-0 right-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center shadow-lg hover:bg-primary-hover transition-colors">
                            <Camera size={16} />
                          </button>
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{user?.firstName} {user?.lastName}</h3>
                          <p className="text-sm text-gray-500">{user?.emailAddresses?.[0]?.emailAddress}</p>
                        </div>
                      </div>

                      {/* Form */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium mb-2 text-gray-700">Nombre</label>
                          <input
                            type="text"
                            value={settings.firstName}
                            onChange={(e) => setSettings({...settings, firstName: e.target.value})}
                            className="w-full px-4 py-3 rounded-xl bg-white/50 backdrop-blur-sm border border-gray-200 text-gray-800 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-2 text-gray-700">Apellido</label>
                          <input
                            type="text"
                            value={settings.lastName}
                            onChange={(e) => setSettings({...settings, lastName: e.target.value})}
                            className="w-full px-4 py-3 rounded-xl bg-white/50 backdrop-blur-sm border border-gray-200 text-gray-800 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-2 text-gray-700">Email</label>
                          <input
                            type="email"
                            value={settings.email}
                            onChange={(e) => setSettings({...settings, email: e.target.value})}
                            className="w-full px-4 py-3 rounded-xl bg-white/50 backdrop-blur-sm border border-gray-200 text-gray-800 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-2 text-gray-700">Teléfono</label>
                          <input
                            type="tel"
                            value={settings.phone}
                            onChange={(e) => setSettings({...settings, phone: e.target.value})}
                            className="w-full px-4 py-3 rounded-xl bg-white/50 backdrop-blur-sm border border-gray-200 text-gray-800 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                            placeholder="+34 000 000 000"
                          />
                        </div>
                      </div>

                      <div className="mt-8">
                        <button
                          onClick={handleSaveProfile}
                          disabled={isLoading}
                          className="btn-primary flex items-center gap-2"
                        >
                          <Save size={20} />
                          {isLoading ? 'Guardando...' : 'Guardar cambios'}
                        </button>
                      </div>
                    </div>
                  )}

                  {activeTab === 'notifications' && (
                    <div>
                      <h2 className="text-2xl font-light mb-6 text-gray-900">Preferencias de notificaciones</h2>
                      
                      <div className="space-y-6">
                        <div className="flex items-center justify-between p-4 rounded-xl bg-white/50 backdrop-blur-sm border border-gray-200">
                          <div>
                            <h3 className="font-medium text-gray-900">Notificaciones por email</h3>
                            <p className="text-sm text-gray-600">Recibe actualizaciones importantes por correo</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={settings.notifications.email}
                              onChange={(e) => setSettings({
                                ...settings,
                                notifications: { ...settings.notifications, email: e.target.checked }
                              })}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                          </label>
                        </div>

                        <div className="flex items-center justify-between p-4 rounded-xl bg-white/50 backdrop-blur-sm border border-gray-200">
                          <div>
                            <h3 className="font-medium text-gray-900">Notificaciones SMS</h3>
                            <p className="text-sm text-gray-600">Recibe alertas urgentes por mensaje de texto</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={settings.notifications.sms}
                              onChange={(e) => setSettings({
                                ...settings,
                                notifications: { ...settings.notifications, sms: e.target.checked }
                              })}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                          </label>
                        </div>

                        <div className="flex items-center justify-between p-4 rounded-xl bg-white/50 backdrop-blur-sm border border-gray-200">
                          <div>
                            <h3 className="font-medium text-gray-900">Notificaciones push</h3>
                            <p className="text-sm text-gray-600">Recibe notificaciones en tiempo real</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={settings.notifications.push}
                              onChange={(e) => setSettings({
                                ...settings,
                                notifications: { ...settings.notifications, push: e.target.checked }
                              })}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                          </label>
                        </div>
                      </div>

                      <div className="mt-8">
                        <button
                          onClick={handleSaveProfile}
                          disabled={isLoading}
                          className="btn-primary flex items-center gap-2"
                        >
                          <Save size={20} />
                          {isLoading ? 'Guardando...' : 'Guardar preferencias'}
                        </button>
                      </div>
                    </div>
                  )}

                  {activeTab === 'security' && (
                    <div>
                      <h2 className="text-2xl font-light mb-6 text-gray-900">Configuración de seguridad</h2>
                      
                      <div className="space-y-8">
                        {/* Password Change */}
                        <div>
                          <h3 className="text-lg font-medium mb-4 text-gray-900">Cambiar contraseña</h3>
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium mb-2 text-gray-700">Contraseña actual</label>
                              <div className="relative">
                                <input
                                  type={showPassword ? 'text' : 'password'}
                                  value={passwordData.current}
                                  onChange={(e) => setPasswordData({...passwordData, current: e.target.value})}
                                  className="w-full px-4 py-3 pr-12 rounded-xl bg-white/50 backdrop-blur-sm border border-gray-200 text-gray-800 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowPassword(!showPassword)}
                                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                              </div>
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium mb-2 text-gray-700">Nueva contraseña</label>
                              <input
                                type="password"
                                value={passwordData.new}
                                onChange={(e) => setPasswordData({...passwordData, new: e.target.value})}
                                className="w-full px-4 py-3 rounded-xl bg-white/50 backdrop-blur-sm border border-gray-200 text-gray-800 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium mb-2 text-gray-700">Confirmar nueva contraseña</label>
                              <input
                                type="password"
                                value={passwordData.confirm}
                                onChange={(e) => setPasswordData({...passwordData, confirm: e.target.value})}
                                className="w-full px-4 py-3 rounded-xl bg-white/50 backdrop-blur-sm border border-gray-200 text-gray-800 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                              />
                            </div>
                            
                            <button
                              onClick={handlePasswordChange}
                              disabled={isLoading || !passwordData.current || !passwordData.new || !passwordData.confirm}
                              className="btn-primary flex items-center gap-2"
                            >
                              <Lock size={20} />
                              {isLoading ? 'Actualizando...' : 'Actualizar contraseña'}
                            </button>
                          </div>
                        </div>

                        {/* Privacy Settings */}
                        <div>
                          <h3 className="text-lg font-medium mb-4 text-gray-900">Configuración de privacidad</h3>
                          <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 rounded-xl bg-white/50 backdrop-blur-sm border border-gray-200">
                              <div>
                                <h4 className="font-medium text-gray-900">Perfil público</h4>
                                <p className="text-sm text-gray-600">Permite que otros usuarios vean tu perfil</p>
                              </div>
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={settings.privacy.profileVisible}
                                  onChange={(e) => setSettings({
                                    ...settings,
                                    privacy: { ...settings.privacy, profileVisible: e.target.checked }
                                  })}
                                  className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                              </label>
                            </div>

                            <div className="flex items-center justify-between p-4 rounded-xl bg-white/50 backdrop-blur-sm border border-gray-200">
                              <div>
                                <h4 className="font-medium text-gray-900">Información de contacto visible</h4>
                                <p className="text-sm text-gray-600">Muestra tu información de contacto en tu perfil</p>
                              </div>
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={settings.privacy.contactVisible}
                                  onChange={(e) => setSettings({
                                    ...settings,
                                    privacy: { ...settings.privacy, contactVisible: e.target.checked }
                                  })}
                                  className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'billing' && (
                    <div>
                      <h2 className="text-2xl font-light mb-6 text-gray-900">Facturación y suscripción</h2>
                      
                      <div className="space-y-6">
                        {/* Current Plan */}
                        <div className="p-6 rounded-xl bg-gradient-to-br from-primary/5 to-blue-50 border border-primary/20">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h3 className="text-lg font-medium text-gray-900">Plan actual</h3>
                              <p className="text-sm text-gray-600">Tu suscripción actual y detalles de facturación</p>
                            </div>
                            <div className="px-4 py-2 rounded-full bg-primary text-white text-sm font-medium">
                              Free
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Propiedades:</span>
                              <div className="font-medium text-gray-900">5 / 5</div>
                            </div>
                            <div>
                              <span className="text-gray-600">Próxima facturación:</span>
                              <div className="font-medium text-gray-900">-</div>
                            </div>
                            <div>
                              <span className="text-gray-600">Precio:</span>
                              <div className="font-medium text-gray-900">€0/mes</div>
                            </div>
                          </div>
                        </div>

                        {/* Upgrade Options */}
                        <div>
                          <h3 className="text-lg font-medium mb-4 text-gray-900">Planes disponibles</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-6 rounded-xl bg-white/50 backdrop-blur-sm border border-gray-200">
                              <h4 className="font-medium text-gray-900 mb-2">Basic</h4>
                              <div className="text-2xl font-light text-gray-900 mb-4">€29<span className="text-sm text-gray-600">/mes</span></div>
                              <ul className="space-y-2 text-sm text-gray-600 mb-6">
                                <li>• Hasta 25 propiedades</li>
                                <li>• Soporte por email</li>
                                <li>• Dashboard básico</li>
                              </ul>
                              <button className="w-full btn-secondary">Actualizar</button>
                            </div>

                            <div className="p-6 rounded-xl bg-gradient-to-br from-primary/10 to-blue-50 border border-primary/30 relative">
                              <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-primary text-white text-xs font-medium">
                                Popular
                              </div>
                              <h4 className="font-medium text-gray-900 mb-2">Premium</h4>
                              <div className="text-2xl font-light text-gray-900 mb-4">€79<span className="text-sm text-gray-600">/mes</span></div>
                              <ul className="space-y-2 text-sm text-gray-600 mb-6">
                                <li>• Propiedades ilimitadas</li>
                                <li>• Soporte prioritario</li>
                                <li>• Analytics avanzados</li>
                                <li>• Gestión de equipos</li>
                              </ul>
                              <button className="w-full btn-primary">Actualizar</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}