'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { motion } from 'framer-motion'
import { Building2, Search, TrendingUp, Headphones, Home, Shield, Users, Sparkles } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

const services = [
  {
    icon: Building2,
    title: 'Gestión de Propiedades',
    description: 'Servicios completos de gestión para tu propiedad',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    icon: Search,
    title: 'Búsqueda Personalizada',
    description: 'Asistencia personalizada para encontrar tu hogar ideal',
    color: 'from-purple-500 to-pink-500'
  },
  {
    icon: TrendingUp,
    title: 'Asesoría de Inversión',
    description: 'Orientación experta en inversiones inmobiliarias',
    color: 'from-green-500 to-emerald-500'
  },
  {
    icon: Headphones,
    title: 'Servicio de Concierge',
    description: 'Soporte 24/7 para todas tus necesidades inmobiliarias',
    color: 'from-orange-500 to-red-500'
  }
]

export default function Services() {
  const sectionRef = useRef<HTMLElement>(null)
  const cardsRef = useRef<HTMLDivElement[]>([])

  useEffect(() => {
    const ctx = gsap.context(() => {
      cardsRef.current.forEach((card, index) => {
        gsap.from(card, {
          y: 60,
          opacity: 0,
          duration: 0.8,
          delay: index * 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: card,
            start: 'top bottom-=100'
          }
        })

        gsap.to(card, {
          y: -10,
          duration: 2,
          ease: 'power1.inOut',
          repeat: -1,
          yoyo: true,
          delay: index * 0.2
        })
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="py-20 relative overflow-hidden" style={{ background: 'var(--color-background-secondary)' }}>
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500 rounded-full filter blur-3xl"></div>
      </div>
      
      <div className="section-container relative z-10">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 mb-4"
          >
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium text-primary">Nuestros Servicios</span>
          </motion.div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
            Servicio Excepcional
          </h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--color-text-secondary)' }}>
            Experimenta el mejor servicio inmobiliario con nuestra completa gama de servicios premium
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => {
            return (
              <motion.div
                key={service.title}
                ref={(el) => {
                  if (el) cardsRef.current[index] = el
                }}
                className="relative group"
                whileHover={{ scale: 1.05, y: -8 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                {/* Glassmorphism card */}
                <div className="relative h-full p-8 rounded-2xl glass-icon-container glass-hover cursor-pointer overflow-hidden">
                  {/* Gradient background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-5 group-hover:opacity-10 transition-opacity duration-300`}></div>
                  
                  {/* Icon container with glassmorphism */}
                  <div className="relative mb-6">
                    <div className="inline-flex p-5 rounded-2xl glass group-hover:scale-110 transition-all duration-300">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${service.color}`}>
                        <service.icon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-semibold mb-3 text-gray-900">
                    {service.title}
                  </h3>
                  <p className="text-gray-600">
                    {service.description}
                  </p>
                  
                  {/* Hover effect indicator */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}