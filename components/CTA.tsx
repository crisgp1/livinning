'use client'

import { motion } from 'framer-motion'
import { Calendar, Home, Users, Headphones } from 'lucide-react'
import { SignInButton, SignUpButton, SignedIn, SignedOut } from '@clerk/nextjs'

export default function CTA() {

  return (
    <motion.section
      className="relative py-24"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.8 }}
    >
      <motion.div
        className="absolute inset-0 z-0"
        initial={{ y: 50 }}
        whileInView={{ y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 1, ease: "easeOut" }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary to-blue-600" />
        <div className="absolute inset-0 opacity-10">
          <div className="h-full w-full" style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23c9a961" fill-opacity="0.4"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            backgroundSize: '60px 60px'
          }} />
        </div>
      </motion.div>

      <div className="relative z-10 section-container">
        <motion.div
          className="text-center max-w-3xl mx-auto"
          initial={{ scale: 0.9, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            ¿Listo para Encontrar tu <span className="text-white">Hogar Ideal</span>?
          </h2>
          <p className="text-lg text-white/90 mb-10">
            Deja que nuestros expertos te guíen hacia la propiedad perfecta adaptada a tu estilo de vida
          </p>
          
          <SignedOut>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <SignUpButton mode="modal">
                <motion.button
                  className="px-10 py-4 rounded-lg font-semibold text-lg flex items-center gap-3 mx-auto transition-all duration-300"
                  style={{ backgroundColor: 'white', color: '#ff385c' }}
                  onMouseEnter={(e) => {
                    const target = e.target as HTMLElement;
                    target.style.setProperty('background-color', '#f8f8f8');
                    target.style.setProperty('transform', 'translateY(-2px)');
                  }}
                  onMouseLeave={(e) => {
                    const target = e.target as HTMLElement;
                    target.style.setProperty('background-color', 'white');
                    target.style.setProperty('transform', 'translateY(0px)');
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Crear Cuenta Gratis
                </motion.button>
              </SignUpButton>
              <SignInButton mode="modal">
                <motion.button
                  className="px-10 py-4 rounded-lg font-semibold text-lg border-2 border-white text-white transition-all duration-300"
                  onMouseEnter={(e) => {
                    const target = e.target as HTMLElement;
                    target.style.setProperty('background-color', 'white');
                    target.style.setProperty('color', '#ff385c');
                    target.style.setProperty('transform', 'translateY(-2px)');
                  }}
                  onMouseLeave={(e) => {
                    const target = e.target as HTMLElement;
                    target.style.setProperty('background-color', 'transparent');
                    target.style.setProperty('color', 'white');
                    target.style.setProperty('transform', 'translateY(0px)');
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Iniciar Sesión
                </motion.button>
              </SignInButton>
            </div>
          </SignedOut>
          
          <SignedIn>
            <motion.button
              className="px-10 py-4 rounded-lg font-semibold text-lg flex items-center gap-3 mx-auto transition-all duration-300"
              style={{ backgroundColor: 'white', color: '#ff385c' }}
              onMouseEnter={(e) => {
                const target = e.target as HTMLElement;
                target.style.setProperty('background-color', '#f8f8f8');
                target.style.setProperty('transform', 'translateY(-2px)');
              }}
              onMouseLeave={(e) => {
                const target = e.target as HTMLElement;
                target.style.setProperty('background-color', 'white');
                target.style.setProperty('transform', 'translateY(0px)');
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Calendar size={24} />
              Programar Consulta
            </motion.button>
          </SignedIn>

          {/* Stats eliminados - eran datos falsos */}
        </motion.div>
      </div>
    </motion.section>
  )
}