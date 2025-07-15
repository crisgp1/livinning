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
            <div className="absolute top-4 left-4 text-white px-3 py-1 rounded-full text-sm font-semibold" style={{ backgroundColor: '#ff385c' }}>
              {badge}
            </div>
          )}
          
          <button className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white hover:scale-110">
            <Heart size={18} style={{ color: '#717171' }} />
          </button>
        </div>

        <div className="p-6">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-lg font-semibold" style={{ color: '#222222' }}>
              {title}
            </h3>
          </div>
          
          <div className="flex items-center gap-2 mb-4" style={{ color: '#717171' }}>
            <MapPin size={16} />
            <p className="text-sm">{location}</p>
          </div>

          <div className="flex items-center gap-4 text-sm mb-4" style={{ color: '#717171' }}>
            <div className="flex items-center gap-1">
              <Bed size={16} />
              <span>{beds} Hab</span>
            </div>
            <div className="flex items-center gap-1">
              <Bath size={16} />
              <span>{baths} Bañ</span>
            </div>
            <div className="flex items-center gap-1">
              <Square size={16} />
              <span>{sqft.toLocaleString()} m²</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: '#f0f0f0' }}>
            <div className="text-xl font-bold" style={{ color: '#222222' }}>
              €{price}
            </div>
            <motion.button
              className="btn-outline"
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