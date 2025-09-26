'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { motion } from 'framer-motion'
import { Home, Building2, Check, Loader2 } from 'lucide-react'

export default function OnboardingPage() {
  const router = useRouter()
  const { user } = useUser()
  const [selectedRole, setSelectedRole] = useState<'agent' | 'user' | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleRoleSelection = async () => {
    if (!selectedRole || !user) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/user/update-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role: selectedRole,
          onboardingCompleted: true
        }),
      })

      if (response.ok) {
        // Refresh user data
        await user.reload()
        // Redirect to dashboard
        router.push('/dashboard')
      } else {
        console.error('Failed to update user role')
      }
    } catch (error) {
      console.error('Error updating user role:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#ff385c]" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            ¡Bienvenido a Livinning!
          </h1>
          <p className="text-gray-600">
            Para personalizar tu experiencia, cuéntanos un poco sobre ti
          </p>
        </div>

        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            ¿Cómo planeas usar Livinning?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedRole('agent')}
              className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all ${
                selectedRole === 'agent'
                  ? 'border-[#ff385c] bg-red-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex flex-col items-center text-center space-y-3">
                <div className={`p-3 rounded-full ${
                  selectedRole === 'agent' ? 'bg-[#ff385c]' : 'bg-gray-100'
                }`}>
                  <Building2 className={`w-8 h-8 ${
                    selectedRole === 'agent' ? 'text-white' : 'text-gray-600'
                  }`} />
                </div>
                <h3 className="font-semibold text-gray-800">Soy un agente</h3>
                <p className="text-sm text-gray-600">
                  Soy un profesional inmobiliario que busca publicar y gestionar propiedades
                </p>
              </div>
              {selectedRole === 'agent' && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-2 right-2"
                >
                  <Check className="w-6 h-6 text-[#ff385c]" />
                </motion.div>
              )}
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedRole('user')}
              className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all ${
                selectedRole === 'user'
                  ? 'border-[#ff385c] bg-red-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex flex-col items-center text-center space-y-3">
                <div className={`p-3 rounded-full ${
                  selectedRole === 'user' ? 'bg-[#ff385c]' : 'bg-gray-100'
                }`}>
                  <Home className={`w-8 h-8 ${
                    selectedRole === 'user' ? 'text-white' : 'text-gray-600'
                  }`} />
                </div>
                <h3 className="font-semibold text-gray-800">Busco una propiedad</h3>
                <p className="text-sm text-gray-600">
                  Estoy buscando comprar o rentar una propiedad para mí
                </p>
              </div>
              {selectedRole === 'user' && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-2 right-2"
                >
                  <Check className="w-6 h-6 text-[#ff385c]" />
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>

        {selectedRole === 'agent' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-6 p-4 bg-amber-50 rounded-lg border border-amber-200"
          >
            <p className="text-sm text-amber-800">
              <strong>Importante:</strong> Para aparecer como agente verificado y obtener el distintivo de verificación, 
              necesitas actualizar a un plan de agencia. Los agentes con plan gratuito no aparecen como verificados.
            </p>
          </motion.div>
        )}

        <button
          onClick={handleRoleSelection}
          disabled={!selectedRole || isLoading}
          className={`w-full py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
            selectedRole && !isLoading
              ? 'bg-[#ff385c] text-white hover:bg-[#e5315a]'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Configurando tu cuenta...
            </>
          ) : (
            'Continuar'
          )}
        </button>
      </motion.div>
    </div>
  )
}