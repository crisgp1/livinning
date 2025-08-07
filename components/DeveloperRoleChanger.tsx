'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Settings, X, Check, AlertCircle, User, UserCheck, Eye, EyeOff } from 'lucide-react'
import { useUser } from '@clerk/nextjs'

interface ImpersonationData {
  originalUserId: string
  originalUserName: string
  targetUserId: string
  targetUserName: string
  targetUserEmail: string
  targetUserRole: string
  impersonatedAt: string
}

export default function DeveloperRoleChanger() {
  const { user } = useUser()
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'roles' | 'impersonate'>('roles')
  const [updateLoading, setUpdateLoading] = useState(false)
  const [impersonateLoading, setImpersonateLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [impersonationData, setImpersonationData] = useState<ImpersonationData | null>(null)
  const [targetEmail, setTargetEmail] = useState('')

  // Check for existing impersonation on mount
  useEffect(() => {
    const checkImpersonation = () => {
      try {
        const impersonationCookie = document.cookie
          .split('; ')
          .find(row => row.startsWith('impersonation='))
          ?.split('=')[1]
        
        if (impersonationCookie) {
          const data = JSON.parse(decodeURIComponent(impersonationCookie))
          setImpersonationData(data)
        }
      } catch (error) {
        console.error('Error parsing impersonation data:', error)
      }
    }

    checkImpersonation()
  }, [])

  // Show to all authenticated users for development purposes
  if (!user) {
    return null
  }

  // Get current user's role from metadata or impersonation
  const currentUserRole = impersonationData?.targetUserRole || (user.publicMetadata?.role as string) || 'user'
  const displayUser = impersonationData ? {
    firstName: impersonationData.targetUserName.split(' ')[0],
    lastName: impersonationData.targetUserName.split(' ').slice(1).join(' '),
    emailAddress: impersonationData.targetUserEmail
  } : {
    firstName: user.firstName,
    lastName: user.lastName,
    emailAddress: user.emailAddresses[0]?.emailAddress
  }
  
  // Available roles
  const availableRoles = [
    { value: 'user', label: 'Usuario', color: 'bg-blue-100 text-blue-800 hover:bg-blue-200' },
    { value: 'agent', label: 'Agente', color: 'bg-purple-100 text-purple-800 hover:bg-purple-200' },
    { value: 'agency', label: 'Agencia', color: 'bg-green-100 text-green-800 hover:bg-green-200' },
    { value: 'supplier', label: 'Proveedor', color: 'bg-orange-100 text-orange-800 hover:bg-orange-200' },
    { value: 'superadmin', label: 'Super Administrador', color: 'bg-red-100 text-red-800 hover:bg-red-200' }
  ]

  const updateUserRole = async (newRole: string) => {
    setUpdateLoading(true)
    try {
      const response = await fetch('/api/admin/update-user-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId: user.id, role: newRole })
      })

      if (response.ok) {
        showMessage('success', `Rol actualizado a ${availableRoles.find(r => r.value === newRole)?.label || newRole}`)
        // Reload the page to update the user context
        setTimeout(() => window.location.reload(), 1500)
      } else {
        const data = await response.json()
        showMessage('error', data.error || 'Error al actualizar rol')
      }
    } catch (error) {
      console.error('Error updating role:', error)
      showMessage('error', 'Error al actualizar rol')
    } finally {
      setUpdateLoading(false)
    }
  }

  const startImpersonation = async () => {
    if (!targetEmail.trim()) {
      showMessage('error', 'Por favor ingresa una dirección de correo')
      return
    }

    setImpersonateLoading(true)
    try {
      const response = await fetch('/api/admin/impersonate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ targetEmail: targetEmail.trim() })
      })

      if (response.ok) {
        const data = await response.json()
        setImpersonationData(data.impersonationData)
        showMessage('success', data.message)
        setTargetEmail('')
        // Refresh the page to apply impersonation
        setTimeout(() => window.location.reload(), 1500)
      } else {
        const data = await response.json()
        showMessage('error', data.error || 'Error al iniciar impersonación')
      }
    } catch (error) {
      console.error('Error starting impersonation:', error)
      showMessage('error', 'Error al iniciar impersonación')
    } finally {
      setImpersonateLoading(false)
    }
  }

  const stopImpersonation = async () => {
    setImpersonateLoading(true)
    try {
      const response = await fetch('/api/admin/impersonate', {
        method: 'DELETE'
      })

      if (response.ok) {
        setImpersonationData(null)
        showMessage('success', 'Impersonación finalizada')
        // Refresh the page to remove impersonation
        setTimeout(() => window.location.reload(), 1500)
      } else {
        const data = await response.json()
        showMessage('error', data.error || 'Error al finalizar impersonación')
      }
    } catch (error) {
      console.error('Error stopping impersonation:', error)
      showMessage('error', 'Error al finalizar impersonación')
    } finally {
      setImpersonateLoading(false)
    }
  }

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 3000)
  }

  const handleToggle = () => {
    setIsOpen(!isOpen)
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Message Toast */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`absolute bottom-20 right-0 px-4 py-2 rounded-lg shadow-lg text-white text-sm font-medium ${
              message.type === 'success' ? 'bg-green-500' : 'bg-red-500'
            }`}
          >
            <div className="flex items-center space-x-2">
              {message.type === 'success' ? (
                <Check size={16} />
              ) : (
                <AlertCircle size={16} />
              )}
              <span>{message.text}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="absolute bottom-16 right-0 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden w-96"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {impersonationData ? <Eye size={20} /> : <User size={20} />}
                  <h3 className="font-semibold">
                    {impersonationData ? 'Impersonando Usuario' : 'Herramientas de Desarrollador'}
                  </h3>
                </div>
                <span className="text-xs bg-white/20 px-2 py-1 rounded-full capitalize">
                  {currentUserRole}
                </span>
              </div>
              
              {/* Tabs */}
              <div className="flex mt-3 bg-white/10 rounded-lg p-1">
                <button
                  onClick={() => setActiveTab('roles')}
                  className={`flex-1 px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    activeTab === 'roles' ? 'bg-white/20 text-white' : 'text-white/70 hover:text-white'
                  }`}
                >
                  Roles
                </button>
                <button
                  onClick={() => setActiveTab('impersonate')}
                  className={`flex-1 px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    activeTab === 'impersonate' ? 'bg-white/20 text-white' : 'text-white/70 hover:text-white'
                  }`}
                >
                  Impersonar
                </button>
              </div>
            </div>

            {/* Current User Info */}
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  impersonationData
                    ? 'bg-gradient-to-r from-orange-400 to-red-500'
                    : 'bg-gradient-to-r from-blue-400 to-purple-500'
                }`}>
                  <span className="text-white font-semibold text-sm">
                    {displayUser.firstName?.[0]}{displayUser.lastName?.[0]}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">
                    {displayUser.firstName} {displayUser.lastName}
                    {impersonationData && (
                      <span className="ml-2 text-xs bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full">
                        Impersonando
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-gray-500">
                    {displayUser.emailAddress}
                  </p>
                </div>
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'roles' && (
              <div className="p-4">
                <p className="text-sm text-gray-600 mb-3">
                  {impersonationData ? 'Cambiar rol del usuario impersonado:' : 'Selecciona tu rol:'}
                </p>
                <div className="space-y-2">
                  {availableRoles.map((role) => (
                    <button
                      key={role.value}
                      onClick={() => updateUserRole(role.value)}
                      disabled={updateLoading || currentUserRole === role.value}
                      className={`w-full px-3 py-2 text-sm rounded-lg font-medium transition-colors ${
                        currentUserRole === role.value
                          ? role.color
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {updateLoading && currentUserRole !== role.value ? (
                        <div className="flex items-center justify-center">
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <span>{role.label}</span>
                          {currentUserRole === role.value && (
                            <Check size={16} />
                          )}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Impersonation Tab */}
            {activeTab === 'impersonate' && (
              <div className="p-4">
                {impersonationData ? (
                  <div className="space-y-4">
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-2">
                        <Eye size={16} className="text-orange-600" />
                        <span className="text-sm font-medium text-orange-800">
                          Impersonando Usuario
                        </span>
                      </div>
                      <p className="text-sm text-orange-700">
                        Usuario original: {impersonationData.originalUserName}
                      </p>
                      <p className="text-xs text-orange-600 mt-1">
                        Iniciado: {new Date(impersonationData.impersonatedAt).toLocaleString()}
                      </p>
                    </div>
                    
                    <button
                      onClick={stopImpersonation}
                      disabled={impersonateLoading}
                      className="w-full px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
                    >
                      {impersonateLoading ? (
                        <div className="flex items-center justify-center">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center space-x-2">
                          <EyeOff size={16} />
                          <span>Finalizar Impersonación</span>
                        </div>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Correo del Usuario a Impersonar
                      </label>
                      <input
                        type="email"
                        value={targetEmail}
                        onChange={(e) => setTargetEmail(e.target.value)}
                        placeholder="Ingresa el correo del usuario..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        disabled={impersonateLoading}
                      />
                    </div>
                    
                    <button
                      onClick={startImpersonation}
                      disabled={impersonateLoading || !targetEmail.trim()}
                      className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {impersonateLoading ? (
                        <div className="flex items-center justify-center">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center space-x-2">
                          <UserCheck size={16} />
                          <span>Iniciar Impersonación</span>
                        </div>
                      )}
                    </button>
                    
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-xs text-blue-700">
                        <strong>Nota:</strong> La impersonación te permite acceder al sistema como otro usuario.
                        <br />
                        <strong>Ejemplo:</strong> Si impersonas a "juan@empresa.com", verás el dashboard y datos como si fueras Juan,
                        permitiéndote probar funciones específicas de su rol sin cambiar tu cuenta.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleToggle}
        className="w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group"
        title={`Cambiar Rol - Actual: ${availableRoles.find(r => r.value === currentUserRole)?.label || currentUserRole}`}
      >
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          {isOpen ? <X size={24} /> : <Settings size={24} />}
        </motion.div>
        
        {/* Pulse animation for better visibility */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full opacity-0 group-hover:opacity-30"
          animate={isOpen ? {} : { scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </motion.button>
    </div>
  )
}