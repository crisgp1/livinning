'use client'

import { SignedIn, SignedOut } from '@clerk/nextjs'
import { motion } from 'framer-motion'
import { Home, Heart, Search, Bell } from 'lucide-react'

export default function AuthenticatedContent() {
  return (
    <>
      <SignedIn>
        <section className="py-16" style={{ backgroundColor: '#f7f7f7' }}>
          <div className="section-container">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: '#222222' }}>
                Tu Panel Personal
              </h2>
              <p className="text-lg" style={{ color: '#717171' }}>
                Gestiona tus propiedades favoritas y búsquedas guardadas
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <motion.div
                className="property-card p-6 text-center"
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
              >
                <div className="inline-flex p-4 rounded-full mb-4" style={{ backgroundColor: '#ff385c15' }}>
                  <Heart size={32} style={{ color: '#ff385c' }} />
                </div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: '#222222' }}>
                  Favoritos
                </h3>
                <p className="text-2xl font-bold" style={{ color: '#ff385c' }}>12</p>
                <p className="text-sm" style={{ color: '#717171' }}>Propiedades guardadas</p>
              </motion.div>

              <motion.div
                className="property-card p-6 text-center"
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
              >
                <div className="inline-flex p-4 rounded-full mb-4" style={{ backgroundColor: '#00a69915' }}>
                  <Search size={32} style={{ color: '#00a699' }} />
                </div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: '#222222' }}>
                  Búsquedas
                </h3>
                <p className="text-2xl font-bold" style={{ color: '#00a699' }}>5</p>
                <p className="text-sm" style={{ color: '#717171' }}>Búsquedas guardadas</p>
              </motion.div>

              <motion.div
                className="property-card p-6 text-center"
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
              >
                <div className="inline-flex p-4 rounded-full mb-4" style={{ backgroundColor: '#ff5a5f15' }}>
                  <Home size={32} style={{ color: '#ff5a5f' }} />
                </div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: '#222222' }}>
                  Mis Propiedades
                </h3>
                <p className="text-2xl font-bold" style={{ color: '#ff5a5f' }}>2</p>
                <p className="text-sm" style={{ color: '#717171' }}>Propiedades publicadas</p>
              </motion.div>

              <motion.div
                className="property-card p-6 text-center"
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
              >
                <div className="inline-flex p-4 rounded-full mb-4" style={{ backgroundColor: '#48484815' }}>
                  <Bell size={32} style={{ color: '#484848' }} />
                </div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: '#222222' }}>
                  Alertas
                </h3>
                <p className="text-2xl font-bold" style={{ color: '#484848' }}>8</p>
                <p className="text-sm" style={{ color: '#717171' }}>Notificaciones nuevas</p>
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
        <section className="py-16" style={{ backgroundColor: '#f7f7f7' }}>
          <div className="section-container text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: '#222222' }}>
              Únete a Livinning
            </h2>
            <p className="text-lg mb-8" style={{ color: '#717171' }}>
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