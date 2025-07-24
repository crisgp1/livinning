'use client'

import { Camera, Scale, Video, Home, TrendingUp, FileText } from 'lucide-react'
import { useGlassIconStyles } from '@/lib/application/hooks/useGlassIconStyles'

export default function GlassIconDemo() {
  const glassStyles = useGlassIconStyles()

  const services = [
    {
      icon: <Camera className="w-8 h-8" />,
      title: 'Fotografía Profesional',
      description: 'Captura la esencia de tu propiedad con fotografías de alta calidad'
    },
    {
      icon: <Scale className="w-8 h-8" />,
      title: 'Servicios Legales',
      description: 'Asesoría jurídica especializada en transacciones inmobiliarias'
    },
    {
      icon: <Video className="w-8 h-8" />,
      title: 'Tour Virtual 360°',
      description: 'Experiencia inmersiva para mostrar tu propiedad'
    },
    {
      icon: <Home className="w-8 h-8" />,
      title: 'Home Staging',
      description: 'Decoración profesional para maximizar el atractivo'
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: 'Análisis de Mercado',
      description: 'Estudios detallados del mercado inmobiliario local'
    },
    {
      icon: <FileText className="w-8 h-8" />,
      title: 'Documentación',
      description: 'Gestión completa de documentos y trámites legales'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Demo de Estilos Glass Icon Container
          </h1>
          <p className="text-xl text-gray-600">
            Demostración del diseño DDD con estilos glass-icon-container
          </p>
        </div>

        {/* Ejemplo con clases CSS */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">Con Clases CSS</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <div
                key={index}
                className="glass-icon-container p-6 rounded-xl hover:scale-105 transition-all duration-300 cursor-pointer"
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4 text-blue-600">
                    {service.icon}
                  </div>
                  <h3 className="text-lg font-semibold">{service.title}</h3>
                </div>
                <p className="text-sm leading-relaxed">{service.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Ejemplo con estilos inline usando el hook */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">Con Estilos Inline (Hook)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <div
                key={index}
                className="p-6 rounded-xl hover:scale-105 transition-all duration-300 cursor-pointer"
                style={glassStyles.getContainerInlineStyles()}
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4 text-blue-600">
                    {service.icon}
                  </div>
                  <h3 
                    className="text-lg font-semibold"
                    style={glassStyles.getHeadingInlineStyles()}
                  >
                    {service.title}
                  </h3>
                </div>
                <p 
                  className="text-sm leading-relaxed"
                  style={glassStyles.getTextInlineStyles()}
                >
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Información sobre la implementación DDD */}
        <div className="glass-icon-container p-8 rounded-xl">
          <h2 className="text-2xl font-semibold mb-4">Implementación DDD</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Value Object: UIStyles</h3>
              <p className="text-sm">
                Encapsula la lógica de estilos para glass-icon-container con métodos para obtener 
                clases CSS y estilos inline.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2">Hook: useGlassIconStyles</h3>
              <p className="text-sm">
                Proporciona una interfaz limpia para acceder a los estilos desde los componentes React.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2">CSS Global</h3>
              <p className="text-sm">
                Los estilos están centralizados en globals.css para mantener consistencia en toda la aplicación.
              </p>
            </div>
          </div>
        </div>

        {/* CSS generado dinámicamente */}
        <div className="mt-8 bg-gray-900 text-green-400 p-6 rounded-xl font-mono text-sm">
          <h3 className="text-white mb-4 font-sans font-semibold">CSS Generado Dinámicamente:</h3>
          <pre className="whitespace-pre-wrap">{glassStyles.generateCSS()}</pre>
        </div>
      </div>
    </div>
  )
}