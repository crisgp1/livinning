'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { motion } from 'framer-motion'
import { ArrowLeft, Bed, Bath, Square, MapPin, Calendar, Heart, Share2 } from 'lucide-react'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import PhotoGallery from '@/components/PhotoGallery'

gsap.registerPlugin(ScrollTrigger)

const propertyData = {
  '1': {
    title: 'Villa Moderna Costera',
    location: 'Barcelona, España',
    price: '2,500,000',
    beds: 4,
    baths: 3,
    sqft: 2500,
    yearBuilt: 2021,
    lotSize: '1200 m²',
    propertyType: 'Villa',
    images: [
      'https://images.unsplash.com/photo-1613977257592-4871e5fcd7c4?w=1200',
      'https://images.unsplash.com/photo-1600566753151-384129cf4e3e?w=1200',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200',
      'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=1200',
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200'
    ],
    description: 'Experimenta el lujo costero en su máxima expresión en esta impresionante villa moderna con vistas al Mediterráneo. Esta obra maestra arquitectónica cuenta con ventanales de suelo a techo, acabados premium y espacios de vida interior-exterior perfectamente integrados.',
    features: [
      'Vistas al mar desde todas las habitaciones',
      'Piscina infinita y spa',
      'Cine en casa y bodega',
      'Cocina gourmet del chef',
      'Acceso privado a la playa',
      'Domótica inteligente',
      'Terraza con barbacoa',
      'Garaje para 3 coches'
    ]
  },
  '2': {
    title: 'Penthouse en el Centro',
    location: 'Madrid, España',
    price: '1,750,000',
    beds: 3,
    baths: 2,
    sqft: 1800,
    yearBuilt: 2023,
    lotSize: '180 m²',
    propertyType: 'Penthouse',
    images: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200',
      'https://images.unsplash.com/photo-1600566753151-384129cf4e3e?w=1200',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200'
    ],
    description: 'Penthouse de lujo en el corazón de Madrid con impresionantes vistas panorámicas de la ciudad. Diseño contemporáneo con acabados de alta calidad y una terraza privada espectacular.',
    features: [
      'Vistas panorámicas de Madrid',
      'Terraza privada de 50 m²',
      'Cocina italiana de diseño',
      'Suelos de mármol italiano',
      'Sistema de climatización inteligente',
      'Ventanas inteligentes automáticas',
      'Conserje 24/7',
      'Plaza de garaje incluida'
    ]
  },
  '3': {
    title: 'Casa Mediterránea',
    location: 'Valencia, España',
    price: '980,000',
    beds: 5,
    baths: 4,
    sqft: 3200,
    yearBuilt: 2020,
    lotSize: '800 m²',
    propertyType: 'Casa',
    images: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200',
      'https://images.unsplash.com/photo-1613977257592-4871e5fcd7c4?w=1200',
      'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=1200',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200'
    ],
    description: 'Hermosa casa de estilo mediterráneo en Valencia, perfecta para familias grandes. Diseño tradicional con toques modernos, jardín privado y piscina.',
    features: [
      'Jardín mediterráneo privado',
      'Piscina con zona chill-out',
      'Bodega tradicional',
      'Chimenea de leña',
      'Cocina rústica moderna',
      'Parking cubierto para 2 coches',
      'Trastero amplio',
      'Zona de barbacoa'
    ]
  },
  '4': {
    title: 'Apartamento Frente al Mar',
    location: 'San Sebastián, España',
    price: '1,200,000',
    beds: 3,
    baths: 2,
    sqft: 1500,
    yearBuilt: 2022,
    lotSize: '150 m²',
    propertyType: 'Apartamento',
    images: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200',
      'https://images.unsplash.com/photo-1613977257592-4871e5fcd7c4?w=1200',
      'https://images.unsplash.com/photo-1600566753151-384129cf4e3e?w=1200',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200'
    ],
    description: 'Espectacular apartamento con vistas directas al mar Cantábrico en San Sebastián. Ubicación privilegiada cerca de la playa de La Concha con acabados de lujo y diseño contemporáneo.',
    features: [
      'Vistas directas al mar Cantábrico',
      'Balcón con vista panorámica',
      'A 2 minutos de la playa',
      'Cocina equipada de alta gama',
      'Suelos de parquet noble',
      'Aire acondicionado centralizado',
      'Comunidad con piscina',
      'Plaza de garaje en el edificio'
    ]
  },
  '5': {
    title: 'Casa Histórica',
    location: 'Sevilla, España',
    price: '850,000',
    beds: 4,
    baths: 3,
    sqft: 2800,
    yearBuilt: 1890,
    lotSize: '300 m²',
    propertyType: 'Casa histórica',
    images: [
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1200',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200',
      'https://images.unsplash.com/photo-1600566753151-384129cf4e3e?w=1200',
      'https://images.unsplash.com/photo-1613977257592-4871e5fcd7c4?w=1200',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200'
    ],
    description: 'Casa histórica completamente renovada en el centro de Sevilla. Arquitectura tradicional andaluza con patio interior, preservando el encanto original mientras incorpora todas las comodidades modernas.',
    features: [
      'Patio andaluz tradicional',
      'Azulejos originales restaurados',
      'Techos con vigas de madera',
      'Renovación completa 2023',
      'Calefacción y A/A modernos',
      'Cocina totalmente equipada',
      'En el centro histórico',
      'Cerca de todos los servicios'
    ]
  },
  '6': {
    title: 'Loft Contemporáneo',
    location: 'Bilbao, España',
    price: '675,000',
    beds: 2,
    baths: 2,
    sqft: 1200,
    yearBuilt: 2023,
    lotSize: '120 m²',
    propertyType: 'Loft',
    images: [
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200',
      'https://images.unsplash.com/photo-1600566753151-384129cf4e3e?w=1200',
      'https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=1200',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200'
    ],
    description: 'Loft de diseño contemporáneo en Bilbao con techos altos y espacios abiertos. Perfecto para profesionales jóvenes que buscan un hogar moderno y funcional en el corazón de la ciudad.',
    features: [
      'Techos altos de 4 metros',
      'Espacios abiertos tipo loft',
      'Ventanales de suelo a techo',
      'Cocina americana de diseño',
      'Suelos de hormigón pulido',
      'Iluminación LED integrada',
      'Zona de trabajo incorporada',
      'Cerca del Guggenheim'
    ]
  }
}

export default function PropertyDetail() {
  const params = useParams()
  const id = params.id as string
  const [property, setProperty] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const galleryRef = useRef<HTMLDivElement>(null)
  const detailsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const response = await fetch(`/api/properties/${id}`)
        const result = await response.json()
        
        if (result.success) {
          setProperty(result.data)
        } else {
          // Fallback to static data if API fails
          const staticProperty = propertyData[id as keyof typeof propertyData]
          setProperty(staticProperty)
        }
      } catch (error) {
        console.error('Error fetching property:', error)
        // Fallback to static data
        const staticProperty = propertyData[id as keyof typeof propertyData]
        setProperty(staticProperty)
      } finally {
        setLoading(false)
      }
    }

    fetchProperty()
  }, [id])

  useEffect(() => {
    if (!property) return

    const ctx = gsap.context(() => {
      gsap.from('.property-info > *', {
        y: 30,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power3.out',
        delay: 0.5
      })

      gsap.from('.feature-item', {
        x: -20,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        scrollTrigger: {
          trigger: '.features-list',
          start: 'top bottom-=100'
        }
      })
    })

    return () => ctx.revert()
  }, [property])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff385c]"></div>
      </div>
    )
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4" style={{ color: '#222222' }}>Propiedad No Encontrada</h1>
          <Link href="/" className="btn-primary">
            Volver al Inicio
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <main className="pt-20">
        <div className="section-container py-8">
          <Link href="/" className="inline-flex items-center gap-2 transition-colors mb-6" style={{ color: '#717171' }} 
            onMouseEnter={(e) => {
              const target = e.target as HTMLElement;
              target.style.setProperty('color', '#ff385c');
            }} 
            onMouseLeave={(e) => {
              const target = e.target as HTMLElement;
              target.style.setProperty('color', '#717171');
            }}>
            <ArrowLeft size={20} />
            Volver a Propiedades
          </Link>
        </div>

        <div className="section-container">
          <div ref={galleryRef} className="property-gallery">
            <PhotoGallery 
              images={property.images} 
              title={property.title}
            />
          </div>
        </div>

        <div className="section-container py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <div ref={detailsRef} className="property-info">
                <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ color: '#222222' }}>
                      {property.title}
                    </h1>
                    <div className="flex items-center gap-2" style={{ color: '#717171' }}>
                      <MapPin size={20} />
                      <span className="text-lg">{property.address?.getFullAddress?.() || property.location}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <button className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                      <Heart size={20} />
                    </button>
                    <button className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                      <Share2 size={20} />
                    </button>
                  </div>
                </div>

                <div className="text-3xl font-bold mb-8" style={{ color: '#ff385c' }}>
                  €{property.price?.amount || 0}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8 p-6 rounded-xl" style={{ backgroundColor: '#f7f7f7' }}>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Bed size={20} style={{ color: '#717171' }} />
                      <span className="text-2xl font-semibold">{property.features?.bedrooms || property.beds}</span>
                    </div>
                    <p className="text-sm" style={{ color: '#717171' }}>Habitaciones</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Bath size={20} style={{ color: '#717171' }} />
                      <span className="text-2xl font-semibold">{property.features?.bathrooms || property.baths}</span>
                    </div>
                    <p className="text-sm" style={{ color: '#717171' }}>Baños</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Square size={20} style={{ color: '#717171' }} />
                      <span className="text-2xl font-semibold">{(property.features?.squareMeters || property.sqft)?.toLocaleString() || 'N/A'}</span>
                    </div>
                    <p className="text-sm" style={{ color: '#717171' }}>m²</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Calendar size={20} style={{ color: '#717171' }} />
                      <span className="text-2xl font-semibold">{property.features?.yearBuilt || property.yearBuilt}</span>
                    </div>
                    <p className="text-sm" style={{ color: '#717171' }}>Año Construcción</p>
                  </div>
                </div>

                <div className="mb-8">
                  <h2 className="text-2xl font-bold mb-4" style={{ color: '#222222' }}>Descripción</h2>
                  <p className="leading-relaxed text-lg" style={{ color: '#717171' }}>
                    {property.description}
                  </p>
                </div>

                <div className="mb-8">
                  <h2 className="text-2xl font-bold mb-4" style={{ color: '#222222' }}>Características</h2>
                  <div className="features-list grid grid-cols-1 md:grid-cols-2 gap-3">
                    {(property.features?.amenities || []).map((feature: string, index: number) => (
                      <motion.div
                        key={index}
                        className="feature-item flex items-center gap-3 p-3 bg-white rounded-lg border"
                        style={{ borderColor: '#f0f0f0' }}
                        whileHover={{ x: 5 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#ff385c' }} />
                        <span>{feature}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>

              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg">
                  <h3 className="text-xl font-bold mb-4" style={{ color: '#222222' }}>
                    Programar Visita
                  </h3>
                  <form className="space-y-4">
                    <input
                      type="text"
                      placeholder="Tu Nombre"
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none transition-colors"
                      onFocus={(e) => {
                        const target = e.target as HTMLElement;
                        target.style.setProperty('border-color', '#ff385c');
                      }}
                      onBlur={(e) => {
                        const target = e.target as HTMLElement;
                        target.style.setProperty('border-color', '#e5e7eb');
                      }}
                    />
                    <input
                      type="email"
                      placeholder="Correo Electrónico"
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none transition-colors"
                      onFocus={(e) => {
                        const target = e.target as HTMLElement;
                        target.style.setProperty('border-color', '#ff385c');
                      }}
                      onBlur={(e) => {
                        const target = e.target as HTMLElement;
                        target.style.setProperty('border-color', '#e5e7eb');
                      }}
                    />
                    <input
                      type="tel"
                      placeholder="Número de Teléfono"
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none transition-colors"
                      onFocus={(e) => {
                        const target = e.target as HTMLElement;
                        target.style.setProperty('border-color', '#ff385c');
                      }}
                      onBlur={(e) => {
                        const target = e.target as HTMLElement;
                        target.style.setProperty('border-color', '#e5e7eb');
                      }}
                    />
                    <textarea
                      placeholder="Mensaje (Opcional)"
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none resize-none transition-colors"
                      onFocus={(e) => {
                        const target = e.target as HTMLElement;
                        target.style.setProperty('border-color', '#ff385c');
                      }}
                      onBlur={(e) => {
                        const target = e.target as HTMLElement;
                        target.style.setProperty('border-color', '#e5e7eb');
                      }}
                    />
                    <button className="btn-primary w-full">
                      Solicitar Visita
                    </button>
                  </form>
                </div>

                <div className="mt-6 rounded-xl p-6" style={{ backgroundColor: '#f7f7f7' }}>
                  <h3 className="text-lg font-semibold mb-4" style={{ color: '#222222' }}>
                    Detalles de la Propiedad
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span style={{ color: '#717171' }}>Tipo de Propiedad:</span>
                      <span className="font-medium">{property.propertyType?.getDisplayName?.() || property.propertyType?.value || property.propertyType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: '#717171' }}>Tamaño del Lote:</span>
                      <span className="font-medium">{property.features?.lotSize || property.lotSize}</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: '#717171' }}>Año de Construcción:</span>
                      <span className="font-medium">{property.features?.yearBuilt || property.yearBuilt}</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: '#717171' }}>ID de Propiedad:</span>
                      <span className="font-medium">LV{id.padStart(4, '0')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}