'use client'

import { useState, useEffect, Suspense } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle, Building2, Sparkles, ArrowRight } from 'lucide-react'
import Navigation from '@/components/Navigation'

interface OrganizationData {
  id: string
  name: string
  slug: string
  plan: string
}

function UpgradeSuccessContent() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isCreatingOrg, setIsCreatingOrg] = useState(true)
  const [organization, setOrganization] = useState<OrganizationData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isUpgrade, setIsUpgrade] = useState(false)

  const sessionId = searchParams.get('session_id')
  const planId = searchParams.get('plan')
  const isDemo = searchParams.get('demo') === 'true'

  const planNames = {
    starter: 'Starter',
    professional: 'Professional', 
    enterprise: 'Enterprise'
  }

  // Map payment plan IDs to database plan enums
  const mapPlanToDbEnum = (planId: string) => {
    switch (planId) {
      case 'starter':
        return 'basic'
      case 'professional':
        return 'premium'
      case 'enterprise':
        return 'enterprise'
      default:
        return 'basic' // fallback
    }
  }

  useEffect(() => {
    if (isLoaded && user) {
      if (sessionId) {
        // Get plan from Stripe session
        fetchSessionAndCreateOrganization()
      } else if (planId) {
        // Fallback for demo or direct plan access
        createOrganization(planId)
      } else {
        setError('No payment session or plan information found')
        setIsCreatingOrg(false)
      }
    }
  }, [isLoaded, user, sessionId, planId])

  const fetchSessionAndCreateOrganization = async () => {
    if (!user || !sessionId) return

    try {
      setIsCreatingOrg(true)

      // Retrieve session details from Stripe to get plan info
      const sessionResponse = await fetch(`/api/payments/get-session?session_id=${sessionId}`)
      const sessionData = await sessionResponse.json()

      if (!sessionData.success) {
        throw new Error('Failed to retrieve payment session')
      }

      const planFromSession = sessionData.session.metadata?.planId
      if (!planFromSession) {
        throw new Error('No plan information found in payment session')
      }

      await createOrganization(planFromSession)

    } catch (error) {
      console.error('Session fetch error:', error)
      // Fallback: try to create with professional plan if session fetch fails
      console.log('Falling back to professional plan')
      await createOrganization('professional')
    }
  }

  const createOrganization = async (plan: string) => {
    if (!user) return

    try {
      setIsCreatingOrg(true)

      // Set a timeout to prevent hanging
      const timeoutId = setTimeout(() => {
        setError('La operación está tomando más tiempo de lo esperado. Por favor, verifica tu dashboard o contáctanos.')
        setIsCreatingOrg(false)
      }, 30000) // 30 seconds timeout

      // Get user's name for organization
      const firstName = user.firstName || 'Usuario'
      const lastName = user.lastName || ''
      const fullName = `${firstName} ${lastName}`.trim()
      
      // Create organization name and slug
      const orgName = `${fullName} - Inmobiliaria`
      const baseSlug = `${firstName.toLowerCase()}-inmobiliaria`
      
      // Create organization via API
      const response = await fetch('/api/organizations/create-from-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: orgName,
          slug: baseSlug,
          ownerId: user.id,
          plan: mapPlanToDbEnum(plan),
          userEmail: user.emailAddresses?.[0]?.emailAddress,
          isPaymentUpgrade: true,
          sessionId: sessionId || undefined
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      console.log('Organization API response:', result)

      if (result.success) {
        clearTimeout(timeoutId)
        setOrganization(result.data)
        setIsUpgrade(result.message && result.message.includes('upgraded'))
        
        // Force user reload to get updated metadata
        if (user) {
          await user.reload()
        }
      } else {
        clearTimeout(timeoutId)
        console.error('Organization creation failed:', result)
        throw new Error(result.error || 'Error processing organization')
      }

    } catch (error) {
      console.error('Organization creation error:', error)
      setError('Hubo un problema creando tu organización. Contáctanos para resolverlo.')
    } finally {
      setIsCreatingOrg(false)
    }
  }

  const handleContinue = async () => {
    if (organization) {
      // Force user reload one more time before redirecting
      if (user) {
        await user.reload()
      }
      
      // Small delay to ensure metadata propagation
      setTimeout(() => {
        router.push('/dashboard')
      }, 500)
    } else {
      router.push('/upgrade-agency')
    }
  }

  if (!isLoaded) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff385c]"></div>
    </div>
  }

  if (!user) {
    router.push('/sign-in')
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="pt-20">
        <div className="section-container py-16">
          <div className="max-w-2xl mx-auto text-center">
            
            {isCreatingOrg && (
              <div className="bg-white rounded-2xl shadow-lg p-12">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <h1 className="text-3xl font-bold text-gray-800 mb-4">
                  Configurando tu agencia...
                </h1>
                <p className="text-gray-600">
                  Estamos creando tu organización y configurando todas las herramientas profesionales.
                  Esto tomará solo unos segundos.
                </p>
              </div>
            )}

            {!isCreatingOrg && organization && (
              <div className="bg-white rounded-2xl shadow-lg p-12">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-12 h-12 text-green-600" />
                </div>
                
                <div className="mb-8">
                  <h1 className="text-4xl font-bold text-gray-800 mb-4">
                    {isUpgrade ? '¡Tu agencia ha sido actualizada! 🚀' : '¡Bienvenido a tu nueva agencia! 🎉'}
                  </h1>
                  {isDemo && (
                    <div className="inline-block bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
                      Demo - Pago simulado
                    </div>
                  )}
                  <p className="text-xl text-gray-600">
                    Tu {isUpgrade ? 'actualización al' : 'suscripción al'} plan <strong>{planNames[planId as keyof typeof planNames]}</strong> está activa
                  </p>
                </div>

                <div className="bg-gradient-to-r from-[#ff385c] to-[#ff6b8a] rounded-xl p-8 text-white mb-8">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <Building2 className="w-8 h-8" />
                    <h2 className="text-2xl font-bold">{organization.name}</h2>
                  </div>
                  <p className="text-white/90">
                    Tu organización ha sido {isUpgrade ? 'actualizada' : 'creada'} exitosamente con todas las funcionalidades profesionales activadas
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-blue-50 rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <Sparkles className="w-6 h-6 text-blue-600" />
                      <h3 className="font-semibold text-blue-800">Funciones Activadas</h3>
                    </div>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Propiedades {planId === 'enterprise' ? 'ilimitadas' : planId === 'professional' ? '(hasta 100)' : '(hasta 25)'}</li>
                      <li>• Perfil de agencia personalizado</li>
                      <li>• Analytics avanzados</li>
                      <li>• Soporte prioritario</li>
                    </ul>
                  </div>

                  <div className="bg-green-50 rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                      <h3 className="font-semibold text-green-800">Próximos Pasos</h3>
                    </div>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>• Personaliza tu perfil de agencia</li>
                      <li>• Sube tu primera propiedad profesional</li>
                      <li>• Configura tu marca personalizada</li>
                      <li>• Explora el CRM integrado</li>
                    </ul>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={handleContinue}
                    className="flex items-center justify-center gap-2 px-8 py-4 bg-[#ff385c] text-white rounded-xl font-semibold hover:bg-[#e5315a] transition-colors"
                  >
                    Ir a mi Dashboard
                    <ArrowRight className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => router.push('/publish')}
                    className="flex items-center justify-center gap-2 px-8 py-4 border-2 border-[#ff385c] text-[#ff385c] rounded-xl font-semibold hover:bg-[#ff385c] hover:text-white transition-colors"
                  >
                    Publicar Primera Propiedad
                  </button>
                </div>
              </div>
            )}

            {!isCreatingOrg && error && (
              <div className="bg-white rounded-2xl shadow-lg p-12">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Building2 className="w-12 h-12 text-red-600" />
                </div>
                
                <h1 className="text-3xl font-bold text-gray-800 mb-4">
                  Hubo un problema
                </h1>
                <p className="text-gray-600 mb-8">
                  {error}
                </p>
                
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-3 bg-[#ff385c] text-white rounded-lg font-semibold hover:bg-[#e5315a] transition-colors"
                  >
                    Intentar de Nuevo
                  </button>
                  <button
                    onClick={() => router.push('/dashboard')}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Ir al Dashboard
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  )
}

export default function UpgradeSuccess() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff385c]"></div>
      </div>
    }>
      <UpgradeSuccessContent />
    </Suspense>
  )
}