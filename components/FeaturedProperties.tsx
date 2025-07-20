'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import PropertyCard from './PropertyCard'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

gsap.registerPlugin(ScrollTrigger)

const properties = [
  {
    id: '1',
    title: 'Villa Moderna Costera',
    location: 'Barcelona, España',
    price: '2,500,000',
    beds: 4,
    baths: 3,
    sqft: 2500,
    image: 'https://images.unsplash.com/photo-1613977257592-4871e5fcd7c4?w=800',
    badge: 'Destacado'
  },
  {
    id: '2',
    title: 'Penthouse en el Centro',
    location: 'Madrid, España',
    price: '1,750,000',
    beds: 3,
    baths: 2,
    sqft: 1800,
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
    badge: 'Nuevo'
  },
  {
    id: '3',
    title: 'Casa Mediterránea',
    location: 'Valencia, España',
    price: '980,000',
    beds: 5,
    baths: 4,
    sqft: 3200,
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
    badge: 'Exclusivo'
  },
  {
    id: '4',
    title: 'Apartamento Frente al Mar',
    location: 'San Sebastián, España',
    price: '1,200,000',
    beds: 3,
    baths: 2,
    sqft: 1500,
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
    badge: 'Popular'
  },
  {
    id: '5',
    title: 'Casa Histórica',
    location: 'Sevilla, España',
    price: '850,000',
    beds: 4,
    baths: 3,
    sqft: 2800,
    image: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800',
    badge: null
  },
  {
    id: '6',
    title: 'Loft Contemporáneo',
    location: 'Bilbao, España',
    price: '675,000',
    beds: 2,
    baths: 2,
    sqft: 1200,
    image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800',
    badge: 'Diseño'
  }
]

export default function FeaturedProperties() {
  const sectionRef = useRef<HTMLElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(titleRef.current, {
        y: 30,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: titleRef.current,
          start: 'top bottom-=100'
        }
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="py-20" style={{ background: 'linear-gradient(135deg, #111111 0%, #1a1a1a 100%)' }}>
      <div className="section-container">
        <div className="flex flex-col md:flex-row items-end justify-between mb-12">
          <div>
            <h2 ref={titleRef} className="text-3xl md:text-4xl font-bold mb-4 gradient-text">
              Propiedades Destacadas
            </h2>
            <p className="text-lg" style={{ color: '#e5e5e5' }}>
              Propiedades cuidadosamente seleccionadas para compradores exigentes
            </p>
          </div>
          
          <Link href="/propiedades">
            <motion.button
              className="flex items-center gap-2 font-medium mt-6 md:mt-0"
              style={{ color: '#a3a3a3' }}
              whileHover={{ x: 5 }}
              transition={{ duration: 0.2 }}
            >
              Ver Todas las Propiedades
              <div className="w-1 h-1 rounded-full bg-current opacity-60"></div>
            </motion.button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {properties.map((property, index) => (
            <PropertyCard
              key={property.id}
              {...property}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  )
}