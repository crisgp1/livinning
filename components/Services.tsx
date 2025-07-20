'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { motion } from 'framer-motion'
import { Building, Search, TrendingUp, Headphones } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

const services = [
  {
    title: 'Gestión de Propiedades',
    description: 'Servicios completos de gestión para tu propiedad'
  },
  {
    title: 'Búsqueda Personalizada',
    description: 'Asistencia personalizada para encontrar tu hogar ideal'
  },
  {
    title: 'Asesoría de Inversión',
    description: 'Orientación experta en inversiones inmobiliarias'
  },
  {
    title: 'Servicio de Concierge',
    description: 'Soporte 24/7 para todas tus necesidades inmobiliarias'
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
    <section ref={sectionRef} className="py-20" style={{ background: 'var(--color-background-secondary)' }}>
      <div className="section-container">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 gradient-text">
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
                className="glass-card p-8 text-center cursor-pointer group"
                whileHover={{ scale: 1.05, y: -8 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <div className="inline-flex p-4 rounded-full mb-6 group-hover:scale-110 transition-transform duration-300" style={{ background: 'rgba(255, 255, 255, 0.1)' }}>
                  <div className="w-3 h-3 rounded-full bg-white opacity-60"></div>
                </div>
                <h3 className="text-lg font-semibold mb-3" style={{ color: '#ffffff' }}>
                  {service.title}
                </h3>
                <p style={{ color: '#a3a3a3' }}>
                  {service.description}
                </p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}