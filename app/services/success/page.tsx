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

  useEffect(() => {
    const sessionId = searchParams.get('session_id')
    
    if (!sessionId) {
      router.push('/services')
      return
    }

    // Extract service name from URL or session data
    // In a real implementation, you might fetch this from your API
    setServiceName('Servicio Profesional')
    setIsLoading(false)
  }, [searchParams, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0a0a' }}>
        <div className="loading-spinner"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: '#0a0a0a' }}>
      <Navigation />
      
      <main className="pt-20 flex items-center justify-center min-h-[calc(100vh-80px)]">
        <div className="section-container">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-8 md:p-12 max-w-2xl mx-auto text-center"
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
            <h1 className="text-3xl md:text-4xl font-light mb-4" style={{ color: '#ffffff' }}>
              ¡Pago Exitoso!
            </h1>
            
            <p className="text-lg mb-8" style={{ color: '#a3a3a3' }}>
              Tu solicitud de servicio ha sido procesada exitosamente. 
              Nuestro equipo de profesionales se pondrá en contacto contigo en las próximas 24 horas 
              para coordinar los detalles.
            </p>
            
            {/* Service Details */}
            <div className="rounded-xl p-6 mb-8" style={{ 
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <div className="flex items-center justify-center gap-3 mb-4" style={{ color: '#ffffff' }}>
                <div className="w-1 h-1 rounded-full bg-current opacity-60"></div>
                <span className="text-xl font-light">{serviceName} Confirmado</span>
              </div>
              
              <div className="text-sm space-y-2" style={{ color: '#a3a3a3' }}>
                <p>• Te enviaremos un email con los detalles de tu solicitud</p>
                <p>• Un profesional certificado se asignará a tu servicio</p>
                <p>• Recibirás actualizaciones del progreso en tiempo real</p>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => router.push('/dashboard')}
                className="btn-primary inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-light"
              >
                <div className="w-1 h-1 rounded-full bg-current opacity-60"></div>
                Ir al Dashboard
              </button>
              
              <button
                onClick={() => router.push('/services')}
                className="btn-secondary inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-light"
              >
                <div className="w-1 h-1 rounded-full bg-current opacity-60"></div>
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
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0a0a' }}>
        <div className="loading-spinner"></div>
      </div>
    }>
      <ServiceSuccessContent />
    </Suspense>
  )
}