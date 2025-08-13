'use client'

import { useUser } from '@clerk/nextjs'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Navigation from '@/components/Navigation'
import PropertyCard from '@/components/PropertyCard'
import {
  Heart,
  Trash2
} from 'lucide-react'

interface Property {
  id: string
  title: string
  description: string
  price: { amount: number; currency: string }
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
  isHighlighted?: boolean
  highlightExpiresAt?: string
  isHighlightActive?: boolean
  createdAt: string
  updatedAt: string
}

export default function FavoritesDashboard() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const pathname = usePathname()
  const [properties, setProperties] = useState<Property[]>([])
  const [favoritesCount, setFavoritesCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isAgent, setIsAgent] = useState(false)

  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/sign-in')
    } else if (isLoaded && user) {
      const metadata = user.publicMetadata as any
      const userRole = metadata?.role || (user as any).privateMetadata?.role
      const isAgency = metadata?.isAgency || metadata?.organizationId
      setIsAgent(userRole === 'agent' || isAgency)
      fetchFavoriteProperties()
    }
  }, [user, isLoaded, router])

  const fetchFavoriteProperties = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/favorites?includeProperties=true')
      if (response.ok) {
        const data = await response.json()
        setProperties(data.data.properties || [])
        setFavoritesCount(data.data.count || 0)
      }
    } catch (error) {
      console.error('Error fetching favorite properties:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const removeFavorite = async (propertyId: string) => {
    try {
      const response = await fetch(`/api/favorites?propertyId=${propertyId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setProperties(properties.filter(p => p.id !== propertyId))
        setFavoritesCount(favoritesCount - 1)
      } else {
        alert('Error al quitar de favoritos')
      }
    } catch (error) {
      console.error('Error removing favorite:', error)
      alert('Error al quitar de favoritos')
    }
  }

  if (!isLoaded || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-primary rounded-full animate-spin"></div>
      </div>
    )
  }


  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      <div className="pt-20 flex relative">
        {/* Enhanced Background decorations for glassmorphism */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-200 to-cyan-200 rounded-full filter blur-3xl opacity-60"></div>
          <div className="absolute top-80 -left-40 w-96 h-96 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full filter blur-3xl opacity-60"></div>
          <div className="absolute bottom-20 right-20 w-72 h-72 bg-gradient-to-br from-green-200 to-emerald-200 rounded-full filter blur-3xl opacity-40"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-indigo-100 to-blue-100 rounded-full filter blur-3xl opacity-30"></div>
        </div>


        {/* Main Content */}
        <div className="flex-1 relative z-10">
          <main className="pb-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              
          
              {/* Header */}
              <div className="mb-8 lg:mb-12 mt-6 lg:mt-8">
                <div className="hidden lg:block">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-flex items-center gap-2 mb-4"
                  >
                    <div className="p-2 rounded-lg glass">
                      <Heart className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-sm font-medium text-primary">Mis Favoritos</span>
                  </motion.div>
                  <h1 className="text-3xl lg:text-4xl font-light mb-2 text-gray-900">
                    Propiedades Favoritas
                  </h1>
                  <p className="text-lg text-gray-600">
                    {favoritesCount} {favoritesCount === 1 ? 'propiedad guardada' : 'propiedades guardadas'}
                  </p>
                </div>
              </div>

              {/* Favorites Grid */}
              <div className="mb-8 lg:mb-12">
                {isLoading ? (
                  <div className="flex justify-center py-12">
                    <div className="w-8 h-8 border-2 border-gray-200 border-t-primary rounded-full animate-spin"></div>
                  </div>
                ) : properties.length === 0 ? (
                  <div className="glass-icon-container rounded-2xl p-12 text-center">
                    <div className="w-16 h-16 mx-auto mb-6 glass rounded-2xl flex items-center justify-center">
                      <Heart className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium mb-2 text-gray-900">
                      No hay propiedades favoritas
                    </h3>
                    <p className="text-sm mb-6 text-gray-600">
                      Explora propiedades y guarda las que más te gusten
                    </p>
                    <button
                      onClick={() => router.push('/propiedades')}
                      className="btn-primary shadow-lg shadow-primary/20"
                    >
                      Explorar Propiedades
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {properties.map((property, index) => (
                        <div key={property.id} className="relative group">
                          <PropertyCard
                            id={property.id}
                            title={property.title}
                            location={`${property.address.city}, ${property.address.state}`}
                            price={`${property.price.amount.toLocaleString()}`}
                            beds={property.features.bedrooms}
                            baths={property.features.bathrooms}
                            sqft={property.features.squareMeters}
                            image={property.images[0] || '/placeholder-property.jpg'}
                            images={property.images}
                            index={index}
                            isHighlighted={property.isHighlighted}
                            isHighlightActive={property.isHighlightActive}
                          />
                          
                          {/* Remove from Favorites Button */}
                          <button
                            onClick={() => removeFavorite(property.id)}
                            className="absolute top-3 right-12 w-10 h-10 rounded-full bg-red-500/90 backdrop-blur-sm shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110 opacity-0 group-hover:opacity-100 z-10"
                            title="Quitar de favoritos"
                          >
                            <Trash2 size={16} className="text-white" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}