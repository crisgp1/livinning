'use client'

import { useState } from 'react'
import { X, Eye, EyeOff } from 'lucide-react'
import { useGlassIconStyles } from '@/lib/application/hooks/useGlassIconStyles'
import ServiceModal from './ServiceModal'
import { ServiceType } from '@/lib/domain/entities/ServiceOrder'

export default function OverlayDemo() {
  const [showGlassmorphismModal, setShowGlassmorphismModal] = useState(false)
  const [showDarkModal, setShowDarkModal] = useState(false)
  const [showInlineStyleModal, setShowInlineStyleModal] = useState(false)
  const glassStyles = useGlassIconStyles()

  const handleContinuePayment = (serviceType: ServiceType) => {
    console.log('Payment for:', serviceType)
    setShowGlassmorphismModal(false)
    setShowDarkModal(false)
    setShowInlineStyleModal(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Demo de Overlays Glassmorphism
          </h1>
          <p className="text-xl text-gray-600">
            Comparación entre overlay tradicional y glassmorphism
          </p>
        </div>

        {/* Control Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="glass-icon-container p-6 rounded-xl text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Eye className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Glassmorphism Overlay</h3>
            <p className="text-sm mb-4">
              Overlay con efecto glassmorphism usando clases CSS automáticas
            </p>
            <button
              onClick={() => setShowGlassmorphismModal(true)}
              className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Ver Modal
            </button>
          </div>

          <div className="glass-icon-container p-6 rounded-xl text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-gray-600 to-gray-800 rounded-xl flex items-center justify-center mx-auto mb-4">
              <EyeOff className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Dark Overlay</h3>
            <p className="text-sm mb-4">
              Overlay tradicional oscuro usando estilos inline
            </p>
            <button
              onClick={() => setShowDarkModal(true)}
              className="w-full py-2 px-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Ver Modal
            </button>
          </div>

          <div className="glass-icon-container p-6 rounded-xl text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Eye className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Inline Glassmorphism</h3>
            <p className="text-sm mb-4">
              Glassmorphism usando estilos inline desde el hook
            </p>
            <button
              onClick={() => setShowInlineStyleModal(true)}
              className="w-full py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Ver Modal
            </button>
          </div>
        </div>

        {/* Implementation Details */}
        <div className="glass-icon-container p-8 rounded-xl mb-8">
          <h2 className="text-2xl font-semibold mb-6">Implementación DDD</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-3">Value Objects</h3>
              <ul className="space-y-2 text-sm">
                <li>• <code className="bg-gray-100 px-2 py-1 rounded">OverlayStyles</code> - Encapsula estilos de overlay</li>
                <li>• <code className="bg-gray-100 px-2 py-1 rounded">UIStyles</code> - Integra todos los estilos UI</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-3">Application Layer</h3>
              <ul className="space-y-2 text-sm">
                <li>• <code className="bg-gray-100 px-2 py-1 rounded">useGlassIconStyles</code> - Hook actualizado</li>
                <li>• Métodos para overlay glassmorphism y tradicional</li>
              </ul>
            </div>
          </div>
        </div>

        {/* CSS Generated */}
        <div className="bg-gray-900 text-green-400 p-6 rounded-xl font-mono text-sm">
          <h3 className="text-white mb-4 font-sans font-semibold">CSS Generado para Overlays:</h3>
          <pre className="whitespace-pre-wrap overflow-x-auto">
            {glassStyles.generateOverlayCSS()}
          </pre>
        </div>

        {/* Modals */}
        {/* Glassmorphism Modal - Uses automatic CSS override */}
        <ServiceModal
          isOpen={showGlassmorphismModal}
          onClose={() => setShowGlassmorphismModal(false)}
          onContinuePayment={handleContinuePayment}
          serviceType={ServiceType.PHOTOGRAPHY}
        />

        {/* Dark Modal - Uses inline styles */}
        {showDarkModal && (
          <div style={glassStyles.getDarkOverlayInlineStyles()}>
            <div className="flex items-center justify-center min-h-screen p-5">
              <div className="bg-white rounded-2xl max-w-md w-full relative shadow-xl">
                <button
                  onClick={() => setShowDarkModal(false)}
                  className="absolute top-4 right-4 w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-200"
                >
                  <X size={16} />
                </button>
                <div className="p-8 text-center">
                  <h2 className="text-2xl font-bold mb-4">Overlay Tradicional</h2>
                  <p className="text-gray-600 mb-6">
                    Este modal usa un overlay oscuro tradicional aplicado con estilos inline.
                  </p>
                  <button
                    onClick={() => setShowDarkModal(false)}
                    className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Inline Glassmorphism Modal */}
        {showInlineStyleModal && (
          <div style={glassStyles.getGlassmorphismOverlayInlineStyles()}>
            <div className="flex items-center justify-center min-h-screen p-5">
              <div className="bg-white rounded-2xl max-w-md w-full relative shadow-xl">
                <button
                  onClick={() => setShowInlineStyleModal(false)}
                  className="absolute top-4 right-4 w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-200"
                >
                  <X size={16} />
                </button>
                <div className="p-8 text-center">
                  <h2 className="text-2xl font-bold mb-4">Glassmorphism Inline</h2>
                  <p className="text-gray-600 mb-6">
                    Este modal usa glassmorphism aplicado con estilos inline desde el hook de DDD.
                  </p>
                  <button
                    onClick={() => setShowInlineStyleModal(false)}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}