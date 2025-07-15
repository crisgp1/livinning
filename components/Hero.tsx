'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import gsap from 'gsap'
import { Search, MapPin, Home } from 'lucide-react'
import Image from 'next/image'

export default function Hero() {
  const heroRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.hero-text', {
        y: 50,
        opacity: 0,
        duration: 1,
        stagger: 0.2,
        ease: 'power3.out'
      })

      gsap.from('.search-container', {
        y: 30,
        opacity: 0,
        duration: 1,
        delay: 0.8,
        ease: 'power3.out'
      })

      gsap.to(imageRef.current, {
        yPercent: -10,
        ease: 'none',
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true
        }
      })
    }, heroRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={heroRef} className="relative h-screen overflow-hidden">
      <div ref={imageRef} className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=2000"
          alt="Luxury Estate"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/40" />
      </div>

      <div className="relative z-10 h-full flex items-center">
        <div className="section-container w-full">
          <div className="max-w-3xl">
            <h1 className="hero-text text-4xl md:text-6xl font-bold text-white mb-6">
              Encuentra tu
              <span className="block" style={{ color: '#ff385c' }}>Hogar Perfecto</span>
            </h1>
            <p className="hero-text text-lg md:text-xl text-white/90 mb-12">
              Descubre propiedades excepcionales en las ubicaciones más deseadas del mundo
            </p>

            <motion.div 
              className="search-container bg-white/95 backdrop-blur-md rounded-2xl p-6 shadow-2xl"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#717171' }} size={20} />
                  <input
                    type="text"
                    placeholder="Ubicación"
                    className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-lg focus:outline-none transition-colors"
                    onFocus={(e) => e.target.style.borderColor = '#ff385c'}
                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                  />
                </div>
                
                <div className="flex-1 relative">
                  <Home className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#717171' }} size={20} />
                  <select className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-lg focus:outline-none transition-colors appearance-none bg-white" onFocus={(e) => e.target.style.borderColor = '#c9a961'} onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}>
                    <option>Todos los Tipos</option>
                    <option>Villa</option>
                    <option>Penthouse</option>
                    <option>Casa</option>
                    <option>Apartamento</option>
                  </select>
                </div>

                <div className="flex-1">
                  <select className="w-full px-4 py-4 border border-gray-200 rounded-lg focus:outline-none transition-colors appearance-none bg-white" onFocus={(e) => e.target.style.borderColor = '#c9a961'} onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}>
                    <option>Rango de Precio</option>
                    <option>$500K - $1M</option>
                    <option>$1M - $3M</option>
                    <option>$3M - $10M</option>
                    <option>$10M+</option>
                  </select>
                </div>

                <button className="btn-primary flex items-center justify-center gap-2 px-8">
                  <Search size={20} />
                  Buscar
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <motion.div 
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/50 rounded-full mt-2" />
        </div>
      </motion.div>
    </section>
  )
}