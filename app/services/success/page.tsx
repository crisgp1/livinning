'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'
import { CheckCircle2, Home, FileText } from 'lucide-react'
import Navigation from '@/components/Navigation'

function ServiceSuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(true)
  const [serviceName, setServiceName] = useState('')
  const [orderId, setOrderId] = useState<string | null>(null)

  useEffect(() => {
    const sessionId = searchParams.get('session_id')
    
    if (!sessionId) {
      router.push('/services')
      return
    }

    // Create service order from successful payment session
    const createServiceOrder = async () => {
      try {
        console.log('🔄 Processing successful payment...')
        
        // Get session details from Stripe
        const sessionResponse = await fetch(`/api/payments/get-session?session_id=${sessionId}`)
        
        if (sessionResponse.ok) {
          const sessionData = await sessionResponse.json()
          console.log('💳 Session data:', sessionData)
          
          if (sessionData.success && sessionData.session) {
            const session = sessionData.session
            
            // Set service name from session
            setServiceName(session.metadata?.serviceName || 'Servicio Profesional')
            
            // Create service order if it has serviceId metadata
            if (session.metadata?.serviceId) {
              // Wait a bit to let webhook process first
              await new Promise(resolve => setTimeout(resolve, 2000))
              
              const createOrderResponse = await fetch('/api/services/create-order-from-session', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  sessionId: session.id,
                  sessionData: session
                })
              })
              
              if (createOrderResponse.ok) {
                const orderData = await createOrderResponse.json()
                console.log('✅ Service order processed', orderData)
                if (orderData.data?.id) {
                  setOrderId(orderData.data.id)
                }
              } else {
                console.error('❌ Failed to process service order')
              }
            }
          }
        }
      } catch (error) {
        console.error('❌ Error processing service order:', error)
      } finally {
        setIsLoading(false)
      }
    }

    createServiceOrder()
  }, [searchParams, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-primary rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-200 to-cyan-200 rounded-full filter blur-3xl opacity-60"></div>
        <div className="absolute top-80 -left-40 w-96 h-96 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full filter blur-3xl opacity-60"></div>
        <div className="absolute bottom-20 right-20 w-72 h-72 bg-gradient-to-br from-green-200 to-emerald-200 rounded-full filter blur-3xl opacity-40"></div>
      </div>
      
      <main className="pt-20 flex items-center justify-center min-h-[calc(100vh-80px)] relative z-10">
        <div className="section-container">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-icon-container rounded-2xl p-8 md:p-12 max-w-2xl mx-auto text-center"
          >
            {/* Success Animation */}
            <div className="w-48 h-48 mx-auto mb-8">
              <DotLottieReact
                src="https://lottie.host/885ebccf-b560-4fff-bd08-05987d1f78d3/8u6DFd9tZz.lottie"
                loop={false}
                autoplay
              />
            </div>
            
            {/* Success Message */}
            <h1 className="text-3xl md:text-4xl font-light mb-4 text-gray-900">
              ¡Pago Exitoso!
            </h1>
            
            <p className="text-lg mb-8 text-gray-600">
              Tu solicitud de servicio ha sido procesada exitosamente. 
              Nuestro equipo de profesionales se pondrá en contacto contigo en las próximas 24 horas 
              para coordinar los detalles.
            </p>
            
            {/* Service Details */}
            <div className="glass rounded-xl p-6 mb-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                <CheckCircle2 className="w-6 h-6 text-green-500" />
                <span className="text-xl font-light text-gray-900">{serviceName} Confirmado</span>
              </div>
              
              <div className="text-sm space-y-2 text-gray-600">
                <p>• Te enviaremos un email con los detalles de tu solicitud</p>
                <p>• Un profesional certificado se asignará a tu servicio</p>
                <p>• Recibirás actualizaciones del progreso en tiempo real</p>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => router.push('/dashboard')}
                className="btn-primary inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium"
              >
                <Home size={20} />
                Ir al Dashboard
              </button>
              
              {orderId && (
                <button
                  onClick={() => router.push(`/services/invoice?orderId=${orderId}`)}
                  className="glass hover:bg-white/50 text-gray-700 hover:text-gray-900 border border-gray-200 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200"
                >
                  <FileText size={20} />
                  Descargar Factura
                </button>
              )}
              
              <button
                onClick={() => router.push('/services')}
                className="glass hover:bg-white/50 text-gray-700 hover:text-gray-900 border border-gray-200 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200"
              >
                Ver Más Servicios
              </button>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  )
}

export default function ServiceSuccess() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-primary rounded-full animate-spin"></div>
      </div>
    }>
      <ServiceSuccessContent />
    </Suspense>
  )
}