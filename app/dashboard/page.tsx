'use client'

import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Home, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  TrendingUp, 
  Users, 
  MapPin,
  Calendar,
  Badge,
  Settings
} from 'lucide-react'
import Navigation from '@/components/Navigation'

interface Property {
  id: string
  title: string
  price: { amount: number; currency: string }
  propertyType: string
  address: { city: string; state: string }
  images: string[]
  status: string
  createdAt: string
  features: {
    bedrooms: number
    bathrooms: number
    squareMeters: number
  }
}

interface UserStats {
  totalProperties: number
  publishedProperties: number
  draftProperties: number
  totalViews: number
  totalInquiries: number
}

export default function Dashboard() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [properties, setProperties] = useState<Property[]>([])
  const [stats, setStats] = useState<UserStats>({
    totalProperties: 0,
    publishedProperties: 0,
    draftProperties: 0,
    totalViews: 0,
    totalInquiries: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isAgent, setIsAgent] = useState(false)
  const [organization, setOrganization] = useState<any>(null)

  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/sign-in')
    }
  }, [user, isLoaded, router])

  useEffect(() => {
    if (user) {
      // Check if user is an agent from metadata
      const userRole = user.publicMetadata?.role || user.privateMetadata?.role
      setIsAgent(userRole === 'agent')
      
      // Fetch user's properties and stats
      fetchDashboardData()
    }
  }, [user])

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true)
      
      // Fetch user's properties
      const propertiesResponse = await fetch('/api/dashboard/properties')
      if (propertiesResponse.ok) {
        const propertiesData = await propertiesResponse.json()
        setProperties(propertiesData.data || [])
      }

      // Fetch user stats  
      const statsResponse = await fetch('/api/dashboard/stats')
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData.data || stats)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteProperty = async (propertyId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta propiedad?')) return

    try {
      const response = await fetch(`/api/properties/${propertyId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setProperties(properties.filter(p => p.id !== propertyId))
        // Refresh stats
        fetchDashboardData()
      } else {
        alert('Error al eliminar la propiedad')
      }
    } catch (error) {
      console.error('Error deleting property:', error)
      alert('Error al eliminar la propiedad')
    }
  }

  if (!isLoaded || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff385c]"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="pt-20">
        <div className="section-container py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">
                  Dashboard
                </h1>
                <p className="text-gray-600 mt-1">
                  Bienvenido, {user.firstName || 'Usuario'}
                  {isAgent && (
                    <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      <Badge size={12} className="mr-1" />
                      Agente
                    </span>
                  )}
                </p>
                {organization && (
                  <p className="text-sm text-gray-500 mt-1">
                    Organización: {organization.name}
                  </p>
                )}
              </div>
              <button
                onClick={() => router.push('/publish')}
                className="flex items-center gap-2 px-4 py-2 bg-[#ff385c] text-white rounded-lg hover:bg-[#e5315a] transition-colors"
              >
                <Plus size={20} />
                Publicar Propiedad
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <motion.div
              className="bg-white rounded-lg p-6 shadow-sm"
              whileHover={{ y: -2 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Propiedades</p>
                  <p className="text-2xl font-bold text-gray-800">{stats.totalProperties}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Home size={24} className="text-blue-600" />
                </div>
              </div>
            </motion.div>

            <motion.div
              className="bg-white rounded-lg p-6 shadow-sm"
              whileHover={{ y: -2 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Publicadas</p>
                  <p className="text-2xl font-bold text-green-600">{stats.publishedProperties}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <TrendingUp size={24} className="text-green-600" />
                </div>
              </div>
            </motion.div>

            <motion.div
              className="bg-white rounded-lg p-6 shadow-sm"
              whileHover={{ y: -2 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Borradores</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.draftProperties}</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <Edit size={24} className="text-yellow-600" />
                </div>
              </div>
            </motion.div>

            {isAgent && (
              <>
                <motion.div
                  className="bg-white rounded-lg p-6 shadow-sm"
                  whileHover={{ y: -2 }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Visualizaciones</p>
                      <p className="text-2xl font-bold text-purple-600">{stats.totalViews}</p>
                    </div>
                    <div className="p-3 bg-purple-100 rounded-full">
                      <Eye size={24} className="text-purple-600" />
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  className="bg-white rounded-lg p-6 shadow-sm"
                  whileHover={{ y: -2 }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Consultas</p>
                      <p className="text-2xl font-bold text-indigo-600">{stats.totalInquiries}</p>
                    </div>
                    <div className="p-3 bg-indigo-100 rounded-full">
                      <Users size={24} className="text-indigo-600" />
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </div>

          {/* Properties Section */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-800">
                Mis Propiedades
              </h2>
            </div>

            <div className="p-6">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ff385c]"></div>
                </div>
              ) : properties.length === 0 ? (
                <div className="text-center py-12">
                  <Home size={48} className="text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-800 mb-2">
                    No tienes propiedades publicadas
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Comienza publicando tu primera propiedad
                  </p>
                  <button
                    onClick={() => router.push('/publish')}
                    className="px-4 py-2 bg-[#ff385c] text-white rounded-lg hover:bg-[#e5315a] transition-colors"
                  >
                    Publicar Propiedad
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {properties.map((property) => (
                    <motion.div
                      key={property.id}
                      className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                      whileHover={{ y: -2 }}
                    >
                      <div className="aspect-video bg-gray-200 relative">
                        {property.images.length > 0 ? (
                          <img
                            src={property.images[0]}
                            alt={property.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Home size={48} className="text-gray-400" />
                          </div>
                        )}
                        <div className="absolute top-2 right-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            property.status === 'published' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {property.status === 'published' ? 'Publicada' : 'Borrador'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-800 mb-2 line-clamp-1">
                          {property.title}
                        </h3>
                        
                        <div className="flex items-center text-sm text-gray-500 mb-2">
                          <MapPin size={16} className="mr-1" />
                          {property.address.city}, {property.address.state}
                        </div>
                        
                        <div className="flex items-center justify-between mb-3">
                          <div className="text-lg font-bold text-[#ff385c]">
                            €{property.price.amount.toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-500">
                            {property.features.bedrooms} hab • {property.features.bathrooms} baños • {property.features.squareMeters} m²
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-sm text-gray-500">
                            <Calendar size={16} className="mr-1" />
                            {new Date(property.createdAt).toLocaleDateString()}
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => router.push(`/properties/${property.id}`)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Ver propiedad"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              onClick={() => router.push(`/properties/${property.id}/edit`)}
                              className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                              title="Editar propiedad"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteProperty(property.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Eliminar propiedad"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}