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
    <section ref={heroRef} className="relative h-screen overflow-hidden" style={{ background: '#0a0a0a' }}>
      {/* Mysterious geometric background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0" style={{ 
          background: 'radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.02) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(255, 255, 255, 0.03) 0%, transparent 50%), linear-gradient(135deg, #0a0a0a 0%, #111111 100%)'
        }} />
        {/* Floating geometric shapes */}
        <div className="absolute top-20 left-10 w-32 h-32 border border-white/10 rounded-full animate-pulse" />
        <div className="absolute top-1/3 right-20 w-24 h-24 border border-white/5 rotate-45" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-1/4 left-1/4 w-16 h-16 bg-gradient-to-r from-white/5 to-white/10 rounded-lg rotate-12" />
      </div>

      <div className="relative z-10 h-full flex items-center">
        <div className="section-container w-full">
          <div className="max-w-3xl">
            <h1 className="hero-text text-4xl md:text-6xl font-bold text-white mb-6">
              Encuentra tu
              <span className="block gradient-text">Hogar Perfecto</span>
            </h1>
            <p className="hero-text text-lg md:text-xl text-white/90 mb-12">
              Descubre propiedades excepcionales en las ubicaciones más deseadas del mundo
            </p>

            <motion.div 
              className="search-container glass-card p-6"
              whileHover={{ scale: 1.02, y: -4 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 relative">
                  <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#a3a3a3' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Ubicación"
                    className="w-full pl-12 pr-4 py-4 rounded-lg focus:outline-none transition-all duration-300"
                    style={{ 
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#ffffff'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#ffffff'
                      e.target.style.boxShadow = '0 0 0 2px rgba(255, 255, 255, 0.1)'
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                      e.target.style.boxShadow = 'none'
                    }}
                  />
                </div>
                
                <div className="flex-1 relative">
                  <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#a3a3a3' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  <select className="w-full pl-12 pr-4 py-4 rounded-lg focus:outline-none transition-all duration-300 appearance-none" style={{ 
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#ffffff'
                  }} onFocus={(e) => {
                    e.target.style.borderColor = '#ffffff'
                    e.target.style.boxShadow = '0 0 0 2px rgba(255, 255, 255, 0.1)'
                  }} onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                    e.target.style.boxShadow = 'none'
                  }}>
                    <option>Todos los Tipos</option>
                    <option>Villa</option>
                    <option>Penthouse</option>
                    <option>Casa</option>
                    <option>Apartamento</option>
                  </select>
                </div>

                <div className="flex-1">
                  <select className="w-full px-4 py-4 rounded-lg focus:outline-none transition-all duration-300 appearance-none" style={{ 
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#ffffff'
                  }} onFocus={(e) => {
                    e.target.style.borderColor = '#ffffff'
                    e.target.style.boxShadow = '0 0 0 2px rgba(255, 255, 255, 0.1)'
                  }} onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                    e.target.style.boxShadow = 'none'
                  }}>
                    <option>Rango de Precio</option>
                    <option>$500K - $1M</option>
                    <option>$1M - $3M</option>
                    <option>$3M - $10M</option>
                    <option>$10M+</option>
                  </select>
                </div>

                <button className="btn-primary flex items-center justify-center gap-2 px-8">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
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