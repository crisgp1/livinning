'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { motion } from 'framer-motion'
import { Building, Search, TrendingUp, Headphones } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

const services = [
  {
    icon: Building,
    title: 'Gestión de Propiedades',
    description: 'Servicios completos de gestión para tu propiedad',
    color: '#ff385c'
  },
  {
    icon: Search,
    title: 'Búsqueda Personalizada',
    description: 'Asistencia personalizada para encontrar tu hogar ideal',
    color: '#00a699'
  },
  {
    icon: TrendingUp,
    title: 'Asesoría de Inversión',
    description: 'Orientación experta en inversiones inmobiliarias',
    color: '#ff5a5f'
  },
  {
    icon: Headphones,
    title: 'Servicio de Concierge',
    description: 'Soporte 24/7 para todas tus necesidades inmobiliarias',
    color: '#484848'
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
    <section ref={sectionRef} className="py-20 bg-white">
      <div className="section-container">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: '#222222' }}>
            Servicio Excepcional
          </h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: '#717171' }}>
            Experimenta el mejor servicio inmobiliario con nuestra completa gama de servicios premium
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => {
            const Icon = service.icon
            return (
              <motion.div
                key={service.title}
                ref={(el) => {
                  if (el) cardsRef.current[index] = el
                }}
                className="rounded-2xl p-8 text-center hover:shadow-xl transition-all duration-300 cursor-pointer group" style={{ backgroundColor: '#f7f7f7' }} onMouseEnter={(e) => e.target.style.backgroundColor = 'white'} onMouseLeave={(e) => e.target.style.backgroundColor = '#f7f7f7'}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="inline-flex p-4 rounded-full mb-6 group-hover:scale-110 transition-transform duration-300" style={{ backgroundColor: `${service.color}15` }}>
                  <Icon size={32} style={{ color: service.color }} />
                </div>
                <h3 className="text-lg font-semibold mb-3" style={{ color: '#222222' }}>
                  {service.title}
                </h3>
                <p style={{ color: '#717171' }}>
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