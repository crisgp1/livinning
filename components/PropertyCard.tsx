'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import gsap from 'gsap'
import { Bed, Bath, Square, Heart, MapPin } from 'lucide-react'

interface PropertyCardProps {
  id: string
  title: string
  location: string
  price: string
  beds: number
  baths: number
  sqft: number
  image: string
  badge?: string | null
  index: number
}

export default function PropertyCard({
  id,
  title,
  location,
  price,
  beds,
  baths,
  sqft,
  image,
  badge,
  index
}: PropertyCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(cardRef.current, {
        y: 50,
        opacity: 0,
        duration: 0.8,
        delay: index * 0.1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: cardRef.current,
          start: 'top bottom-=100',
          toggleActions: 'play none none reverse'
        }
      })

      const handleMouseMove = (e: MouseEvent) => {
        if (!cardRef.current || !imageRef.current) return
        const rect = cardRef.current.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        const centerX = rect.width / 2
        const centerY = rect.height / 2
        const rotateX = (y - centerY) / 20
        const rotateY = (centerX - x) / 20

        gsap.to(imageRef.current, {
          rotationY: rotateY,
          rotationX: rotateX,
          transformPerspective: 1000,
          duration: 0.5,
          ease: 'power2.out'
        })
      }

      const handleMouseLeave = () => {
        if (!imageRef.current) return
        gsap.to(imageRef.current, {
          rotationY: 0,
          rotationX: 0,
          duration: 0.5,
          ease: 'power2.out'
        })
      }

      if (cardRef.current) {
        cardRef.current.addEventListener('mousemove', handleMouseMove)
        cardRef.current.addEventListener('mouseleave', handleMouseLeave)
      }

      return () => {
        if (cardRef.current) {
          cardRef.current.removeEventListener('mousemove', handleMouseMove)
          cardRef.current.removeEventListener('mouseleave', handleMouseLeave)
        }
      }
    }, cardRef)

    return () => ctx.revert()
  }, [index])

  return (
    <motion.div
      ref={cardRef}
      className="property-card group cursor-pointer"
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
    >
      <Link href={`/properties/${id}`}>
        <div ref={imageRef} className="relative h-72 overflow-hidden">
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {badge && (
            <div className="absolute top-4 left-4 text-white px-3 py-1 rounded-full text-xs font-medium" style={{ 
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              {badge}
            </div>
          )}
          
          <button className="absolute top-4 right-4 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110" style={{ background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(8px)' }}>
            <div className="w-2 h-2 rounded-full bg-white opacity-60"></div>
          </button>
        </div>

        <div className="p-6">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-lg font-semibold" style={{ color: '#ffffff' }}>
              {title}
            </h3>
          </div>
          
          <div className="flex items-center gap-2 mb-4" style={{ color: '#a3a3a3' }}>
            <div className="w-1 h-1 rounded-full bg-current opacity-60"></div>
            <p className="text-sm">{location}</p>
          </div>

          <div className="flex items-center gap-4 text-sm mb-4" style={{ color: '#a3a3a3' }}>
            <div className="flex items-center gap-1">
              <div className="w-1 h-1 rounded-full bg-current opacity-60"></div>
              <span>{beds} Hab</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-1 h-1 rounded-full bg-current opacity-60"></div>
              <span>{baths} Bañ</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-1 h-1 rounded-full bg-current opacity-60"></div>
              <span>{sqft.toLocaleString()} m²</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
            <div className="text-xl font-bold" style={{ color: '#ffffff' }}>
              €{price}
            </div>
            <motion.button
              className="px-4 py-2 rounded-lg font-medium transition-all duration-300 text-sm"
              style={{ 
                background: 'transparent',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#a3a3a3'
              }}
              onMouseEnter={(e) => {
                const target = e.target as HTMLElement
                target.style.background = 'rgba(255, 255, 255, 0.1)'
                target.style.color = '#ffffff'
                target.style.borderColor = 'rgba(255, 255, 255, 0.3)'
              }}
              onMouseLeave={(e) => {
                const target = e.target as HTMLElement
                target.style.background = 'transparent'
                target.style.color = '#a3a3a3'
                target.style.borderColor = 'rgba(255, 255, 255, 0.2)'
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Ver Detalles
            </motion.button>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}