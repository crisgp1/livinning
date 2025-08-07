'use client'

import { useUser } from '@clerk/nextjs'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Navigation from '@/components/Navigation'
import PropertyCard from '@/components/PropertyCard'
import { 
  Home, 
  Building, 
  PlusCircle, 
  BarChart3, 
  Settings, 
  Users, 
  Menu, 
  X,
  Wrench,
  TrendingUp,
  Eye,
  MessageSquare,
  Sparkles,
  FileText,
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
  const [sidebarOpen, setSidebarOpen] = useState(false)

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

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, href: '/dashboard' },
    { id: 'publish', label: 'Publicar', icon: PlusCircle, href: '/publish' },
    { id: 'properties', label: 'Propiedades', icon: Building, href: '/dashboard/properties' },
    { id: 'favorites', label: 'Favoritos', icon: Heart, href: '/dashboard/favorites' },
    { id: 'services', label: 'Servicios', icon: Wrench, href: '/services' },
    { id: 'my-services', label: 'Servicios Contratados', icon: FileText, href: '/dashboard/services' },
    { id: 'settings', label: 'Configuración', icon: Settings, href: '/dashboard/settings' },
    { id: 'home', label: 'Ir al Inicio', icon: Home, href: '/' },
  ]

  if (isAgent) {
    sidebarItems.splice(5, 0, { id: 'team', label: 'Equipo', icon: Users, href: '/dashboard/team' })
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

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-white bg-opacity-50 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div className={`fixed left-0 top-20 h-[calc(100vh-5rem)] w-64 z-50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <div className="m-4 p-6 h-full overflow-y-auto glass-sidebar rounded-2xl">
            {/* User Info */}
            <div className="border-b border-gray-100 pb-6 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-white shadow-lg">
                  {user?.imageUrl ? (
                    <img src={user.imageUrl} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary to-blue-600">
                      <span className="text-white font-medium text-lg">
                        {user?.firstName?.[0] || 'U'}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate text-gray-900">
                    {user?.firstName || 'Usuario'}
                  </p>
                  <p className="text-xs truncate text-gray-500">
                    {user?.emailAddresses?.[0]?.emailAddress}
                  </p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="space-y-2">
              {sidebarItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      router.push(item.href)
                      setSidebarOpen(false)
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                      isActive 
                        ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                        : 'text-gray-600 hover:bg-white/50 hover:text-gray-900'
                    }`}
                  >
                    <div className={`p-2 rounded-lg transition-colors ${
                      isActive ? 'bg-white/20' : 'bg-gray-50'
                    }`}>
                      <item.icon size={18} className={isActive ? 'text-white' : ''} />
                    </div>
                    <span className="font-medium text-sm leading-tight">{item.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 lg:ml-0 relative z-10">
          <main className="pb-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              
              {/* Mobile Header */}
              <div className="lg:hidden flex items-center justify-between py-6 border-b border-gray-100">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="p-2 rounded-lg glass-icon-container"
                >
                  <Menu size={20} className="text-gray-700" />
                </button>
                <h1 className="text-xl font-medium text-gray-900">
                  Favoritos
                </h1>
                <div className="w-10"></div>
              </div>
          
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