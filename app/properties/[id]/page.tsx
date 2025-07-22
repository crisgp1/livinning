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
        
        if (result.success && result.data) {
          // Map API response to expected format
          const apiProperty = result.data
          const mappedProperty = {
            id: apiProperty.id || apiProperty._id,
            title: apiProperty.title || 'Título no disponible',
            description: apiProperty.description || 'Descripción no disponible',
            price: apiProperty.price || { amount: 0, currency: 'EUR' },
            propertyType: apiProperty.propertyType || 'No especificado',
            address: apiProperty.address || {},
            features: apiProperty.features || {},
            images: apiProperty.images || [],
            amenities: apiProperty.amenities || [],
            // Backward compatibility fields
            location: apiProperty.address ? 
              `${apiProperty.address.city || ''}, ${apiProperty.address.state || ''}`.replace(/^,\s*|,\s*$/g, '') :
              'Ubicación no disponible',
            beds: apiProperty.features?.bedrooms || 0,
            baths: apiProperty.features?.bathrooms || 0,
            sqft: apiProperty.features?.squareMeters || 0,
            yearBuilt: apiProperty.features?.yearBuilt || new Date().getFullYear(),
            lotSize: apiProperty.features?.lotSize || `${apiProperty.features?.squareMeters || 0} m²`
          }
          setProperty(mappedProperty)
        } else {
          // Fallback to static data if API fails
          const staticProperty = propertyData[id as keyof typeof propertyData]
          if (staticProperty) {
            setProperty(staticProperty)
          } else {
            setProperty(null)
          }
        }
      } catch (error) {
        console.error('Error fetching property:', error)
        // Fallback to static data
        const staticProperty = propertyData[id as keyof typeof propertyData]
        if (staticProperty) {
          setProperty(staticProperty)
        } else {
          setProperty(null)
        }
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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-primary rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-light mb-4 text-gray-900">Propiedad No Encontrada</h1>
          <p className="text-gray-600 mb-6">La propiedad que buscas no existe o no está disponible</p>
          <Link href="/propiedades" className="btn-primary">
            Volver a Propiedades
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-200 to-cyan-200 rounded-full filter blur-3xl opacity-60"></div>
        <div className="absolute top-80 -left-40 w-96 h-96 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full filter blur-3xl opacity-60"></div>
        <div className="absolute bottom-20 right-20 w-72 h-72 bg-gradient-to-br from-green-200 to-emerald-200 rounded-full filter blur-3xl opacity-40"></div>
      </div>
      
      <main className="pt-20 relative z-10">
        <div className="section-container py-8">
          <Link href="/propiedades" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-6">
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
                    <h1 className="text-3xl md:text-4xl font-light mb-2 text-gray-900">
                      {property.title}
                    </h1>
                    <div className="flex items-center gap-2 text-gray-600">
                      <div className="w-1 h-1 rounded-full bg-primary opacity-60"></div>
                      <span className="text-lg">
                        {property.address ? 
                          `${property.address.city || ''}, ${property.address.state || ''}, ${property.address.country || ''}`.replace(/^,\s*|,\s*$/g, '').replace(/,\s*,/g, ',') :
                          property.location || 'Ubicación no disponible'
                        }
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <button className="p-3 rounded-lg glass-icon-container text-gray-600 hover:text-gray-900 transition-colors">
                      <Heart size={20} />
                    </button>
                    <button className="p-3 rounded-lg glass-icon-container text-gray-600 hover:text-gray-900 transition-colors">
                      <Share2 size={20} />
                    </button>
                  </div>
                </div>

                <div className="text-3xl font-light mb-8 text-gray-900">
                  €{typeof property.price === 'object' ? property.price?.amount?.toLocaleString() : property.price?.toLocaleString() || '0'}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8 p-6 rounded-xl glass-icon-container">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <div className="w-1 h-1 rounded-full bg-primary opacity-60"></div>
                      <span className="text-2xl font-light text-gray-900">{property.features?.bedrooms || property.beds}</span>
                    </div>
                    <p className="text-sm text-gray-600">Habitaciones</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <div className="w-1 h-1 rounded-full bg-primary opacity-60"></div>
                      <span className="text-2xl font-light text-gray-900">{property.features?.bathrooms || property.baths}</span>
                    </div>
                    <p className="text-sm text-gray-600">Baños</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <div className="w-1 h-1 rounded-full bg-primary opacity-60"></div>
                      <span className="text-2xl font-light text-gray-900">{(property.features?.squareMeters || property.sqft)?.toLocaleString() || 'N/A'}</span>
                    </div>
                    <p className="text-sm text-gray-600">m²</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <div className="w-1 h-1 rounded-full bg-primary opacity-60"></div>
                      <span className="text-2xl font-light text-gray-900">{property.features?.yearBuilt || property.yearBuilt}</span>
                    </div>
                    <p className="text-sm text-gray-600">Año Construcción</p>
                  </div>
                </div>

                <div className="mb-8">
                  <h2 className="text-2xl font-light mb-4 text-gray-900">Descripción</h2>
                  <p className="leading-relaxed text-lg text-gray-600">
                    {property.description}
                  </p>
                </div>

                <div className="mb-8">
                  <h2 className="text-2xl font-light mb-4 text-gray-900">Características</h2>
                  <div className="features-list grid grid-cols-1 md:grid-cols-2 gap-3">
                    {(() => {
                      // Handle different feature data structures
                      let features = [];
                      if (Array.isArray(property.amenities)) {
                        features = property.amenities;
                      } else if (Array.isArray(property.features)) {
                        features = property.features;
                      } else if (property.features && typeof property.features === 'object') {
                        // Convert features object to array of strings
                        features = Object.entries(property.features)
                          .filter(([key, value]) => value && typeof value !== 'object')
                          .map(([key, value]) => `${key}: ${value}`);
                      } else {
                        // Fallback basic features
                        features = [
                          `${property.features?.bedrooms || property.beds || 0} Habitaciones`,
                          `${property.features?.bathrooms || property.baths || 0} Baños`,
                          `${property.features?.squareMeters || property.sqft || 0} m²`,
                          property.features?.parking ? `${property.features.parking} Espacios de parking` : null
                        ].filter(Boolean);
                      }
                      
                      return features.map((feature: string, index: number) => (
                        <motion.div
                          key={index}
                          className="feature-item flex items-center gap-3 p-3 rounded-lg glass-icon-container"
                          whileHover={{ x: 5 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="w-1 h-1 rounded-full bg-primary opacity-60" />
                          <span className="text-gray-900">{feature}</span>
                        </motion.div>
                      ));
                    })()}
                  </div>
                </div>

              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <div className="glass-icon-container rounded-2xl p-6">
                  <h3 className="text-xl font-light mb-4 text-gray-900">
                    Programar Visita
                  </h3>
                  <form className="space-y-4">
                    <input
                      type="text"
                      placeholder="Tu Nombre"
                      className="w-full px-4 py-3 rounded-lg bg-white/50 backdrop-blur-sm border border-gray-200 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                    />
                    <input
                      type="email"
                      placeholder="Correo Electrónico"
                      className="w-full px-4 py-3 rounded-lg bg-white/50 backdrop-blur-sm border border-gray-200 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                    />
                    <input
                      type="tel"
                      placeholder="Número de Teléfono"
                      className="w-full px-4 py-3 rounded-lg bg-white/50 backdrop-blur-sm border border-gray-200 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                    />
                    <textarea
                      placeholder="Mensaje (Opcional)"
                      rows={4}
                      className="w-full px-4 py-3 rounded-lg bg-white/50 backdrop-blur-sm border border-gray-200 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 resize-none"
                    />
                    <button className="btn-primary w-full">
                      Solicitar Visita
                    </button>
                  </form>
                </div>

                <div className="mt-6 rounded-xl p-6 glass-icon-container">
                  <h3 className="text-lg font-light mb-4 text-gray-900">
                    Detalles de la Propiedad
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tipo de Propiedad:</span>
                      <span className="font-medium text-gray-900">
                        {property.propertyType?.value || property.propertyType || 'No especificado'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tamaño del Lote:</span>
                      <span className="font-medium text-gray-900">{property.features?.lotSize || property.lotSize}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Año de Construcción:</span>
                      <span className="font-medium text-gray-900">{property.features?.yearBuilt || property.yearBuilt}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">ID de Propiedad:</span>
                      <span className="font-medium text-gray-900">LV{id.padStart(4, '0')}</span>
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