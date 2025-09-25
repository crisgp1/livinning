'use client'

import { SignedIn, SignedOut } from '@clerk/nextjs'
import { motion } from 'framer-motion'
import { Home, Heart, Search, Bell } from 'lucide-react'

export default function AuthenticatedContent() {
  return (
    <>
      <SignedIn>
        <section className="py-16 relative overflow-hidden bg-gradient-to-br from-gray-50 via-white to-blue-50">
          {/* Background decoration */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-20 w-72 h-72 bg-blue-400 rounded-full filter blur-3xl"></div>
            <div className="absolute bottom-20 right-20 w-72 h-72 bg-purple-400 rounded-full filter blur-3xl"></div>
          </div>
          
          <div className="section-container relative z-10">
            <div className="text-center mb-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
                  Tu Panel Personal
                </h2>
                <p className="text-lg text-gray-600">
                  Gestiona tus propiedades favoritas y búsquedas guardadas
                </p>
              </motion.div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <motion.div
                className="relative group"
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
              >
                <div className="h-full p-6 text-center glass-icon-container glass-hover rounded-2xl">
                  <div className="inline-flex p-4 rounded-full mb-4 glass">
                    <div className="p-3 rounded-full bg-gradient-to-br from-red-500 to-pink-500">
                      <Heart className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-900">
                    Favoritos
                  </h3>
                  <p className="text-2xl font-bold text-gray-900">0</p>
                  <p className="text-sm text-gray-600">Propiedades guardadas</p>
                </div>
              </motion.div>

              <motion.div
                className="relative group"
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
              >
                <div className="h-full p-6 text-center glass-icon-container glass-hover rounded-2xl">
                  <div className="inline-flex p-4 rounded-full mb-4 glass">
                    <div className="p-3 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500">
                      <Search className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-900">
                    Búsquedas
                  </h3>
                  <p className="text-2xl font-bold text-gray-900">0</p>
                  <p className="text-sm text-gray-600">Búsquedas guardadas</p>
                </div>
              </motion.div>

              <motion.div
                className="relative group"
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
              >
                <div className="h-full p-6 text-center glass-icon-container glass-hover rounded-2xl">
                  <div className="inline-flex p-4 rounded-full mb-4 glass">
                    <div className="p-3 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500">
                      <Home className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-900">
                    Mis Propiedades
                  </h3>
                  <p className="text-2xl font-bold text-gray-900">0</p>
                  <p className="text-sm text-gray-600">Propiedades publicadas</p>
                </div>
              </motion.div>

              <motion.div
                className="relative group"
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
              >
                <div className="h-full p-6 text-center glass-icon-container glass-hover rounded-2xl">
                  <div className="inline-flex p-4 rounded-full mb-4 glass">
                    <div className="p-3 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500">
                      <Bell className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-900">
                    Alertas
                  </h3>
                  <p className="text-2xl font-bold text-gray-900">0</p>
                  <p className="text-sm text-gray-600">Notificaciones nuevas</p>
                </div>
              </motion.div>
            </div>

            <div className="text-center mt-8">
              <motion.button
                className="btn-primary"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.location.href = '/dashboard'}
              >
                Ver Panel Completo
              </motion.button>
            </div>
          </div>
        </section>
      </SignedIn>

      <SignedOut>
        <section className="py-16 bg-gray-50">
          <div className="section-container text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              Únete a Livinning
            </h2>
            <p className="text-lg mb-8 text-gray-600">
              Crea tu cuenta gratuita y accede a funciones exclusivas para encontrar tu hogar ideal
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-12">
              <div className="text-center">
                <div className="inline-flex p-4 rounded-full mb-4" style={{ backgroundColor: '#ff385c15' }}>
                  <Heart size={32} style={{ color: '#ff385c' }} />
                </div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: '#222222' }}>
                  Guarda Favoritos
                </h3>
                <p style={{ color: '#717171' }}>
                  Marca las propiedades que te gusten y accede a ellas fácilmente
                </p>
              </div>
              
              <div className="text-center">
                <div className="inline-flex p-4 rounded-full mb-4" style={{ backgroundColor: '#00a69915' }}>
                  <Bell size={32} style={{ color: '#00a699' }} />
                </div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: '#222222' }}>
                  Alertas Personalizadas
                </h3>
                <p style={{ color: '#717171' }}>
                  Recibe notificaciones de nuevas propiedades que coincidan con tus criterios
                </p>
              </div>
              
              <div className="text-center">
                <div className="inline-flex p-4 rounded-full mb-4" style={{ backgroundColor: '#ff5a5f15' }}>
                  <Home size={32} style={{ color: '#ff5a5f' }} />
                </div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: '#222222' }}>
                  Publica Gratis
                </h3>
                <p style={{ color: '#717171' }}>
                  Lista tu propiedad sin coste y llega a miles de compradores potenciales
                </p>
              </div>
            </div>
          </div>
        </section>
      </SignedOut>
    </>
  )
}