'use client'

import { useEffect, useRef, useState } from 'react'
import PropertyCard from './PropertyCard'
import PropertyCardSkeleton from './skeletons/PropertyCardSkeleton'
import { ArrowRight, Sparkles, Home } from 'lucide-react'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils/formatPrice'

interface Property {
  id: string
  title: string
  description?: string
  price: {
    amount: number
    currency: string
  }
  propertyType: string
  status: string
  address: {
    street: string
    city: string
    state: string
    country: string
    postalCode: string
    coordinates?: {
      latitude: number
      longitude: number
    }
  }
  features: {
    bedrooms: number
    bathrooms: number
    squareMeters: number
    parking: number
    amenities: string[]
  }
  images: string[]
  ownerId: string
  organizationId: string
  createdAt: string
  updatedAt: string
}


export default function FeaturedProperties() {
  const sectionRef = useRef<HTMLElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const [properties, setProperties] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchFeaturedProperties = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/properties/featured')
        const data = await response.json()
        
        console.log('Featured Properties API Response:', data)
        
        if (data.success && data.data?.properties?.length > 0) {
          // Map the domain objects to PropertyCard format
          const mappedProperties = data.data.properties.map((prop: Property) => ({
            id: prop.id,
            title: prop.title,
            location: `${prop.address.city}, ${prop.address.state}`,
            price: formatPrice(prop.price),
            beds: prop.features.bedrooms,
            baths: prop.features.bathrooms,
            sqft: prop.features.squareMeters,
            image: prop.images[0] || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800',
            badge: prop.status === 'published' ? 'Destacado' : 'Nuevo'
          }))
          setProperties(mappedProperties)
        } else {
          console.log('No featured properties found')
          setProperties([])
        }
      } catch (err) {
        console.error('Error fetching featured properties:', err)
        setError('Error loading featured properties')
        setProperties([])
      } finally {
        setLoading(false)
      }
    }

    fetchFeaturedProperties()
  }, [])

  useEffect(() => {
    if (!titleRef.current) return
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          titleRef.current?.classList.add('animate-fadeInUp')
        }
      },
      { threshold: 0.1 }
    )
    
    observer.observe(titleRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section ref={sectionRef} className="py-20 bg-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary rounded-full filter blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl"></div>
      </div>
      
      <div className="section-container relative z-10">
        <div className="flex flex-col md:flex-row items-end justify-between mb-12">
          <div>
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg glass">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <span className="text-sm font-medium text-primary">Propiedades Premium</span>
            </div>
            <h2 ref={titleRef} className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              Propiedades Destacadas
            </h2>
            <p className="text-lg text-gray-600">
              Propiedades cuidadosamente seleccionadas para compradores exigentes
            </p>
          </div>
          
          <Link href="/propiedades">
            <button className="flex items-center gap-2 font-medium mt-6 md:mt-0 text-primary hover:text-primary-hover transition-transform duration-200 hover:translate-x-1">
              Ver Todas las Propiedades
              <ArrowRight size={20} />
            </button>
          </Link>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <PropertyCardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 bg-red-50 border border-red-200">
              <Home className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-xl font-light mb-2 text-gray-900">
              Error al cargar propiedades
            </h3>
            <p className="text-gray-600">{error}</p>
          </div>
        ) : properties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {properties.slice(0, 6).map((property, index) => (
              <PropertyCard
                key={property.id}
                {...property}
                index={index}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 bg-gray-50 border border-gray-200">
              <Home className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-light mb-2 text-gray-900">
              No hay propiedades destacadas
            </h3>
            <p className="text-gray-600">Las propiedades aparecerán aquí cuando estén disponibles</p>
          </div>
        )}
      </div>
    </section>
  )
}