'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Navigation from '@/components/Navigation'
import PropertyCard from '@/components/PropertyCard'
import { Search, SlidersHorizontal, MapPin, Home, DollarSign } from 'lucide-react'

interface Property {
  id: string
  title: string
  description?: string
  price: number
  location: {
    address: string
    city: string
    state: string
    country: string
  }
  propertyType: string
  status: 'sale' | 'rent'
  features: {
    bedrooms: number
    bathrooms: number
    parkingSpaces?: number
    totalArea?: number
    builtArea?: number
  }
  images: string[]
  highlighted?: boolean
}

// Mock data for fallback
const mockProperties: any[] = [
  {
    id: '1',
    title: 'Villa Moderna Costera',
    location: 'Barcelona, España',
    price: '2,500,000',
    beds: 4,
    baths: 3,
    sqft: 2500,
    image: 'https://images.unsplash.com/photo-1613977257592-4871e5fcd7c4?w=800',
    badge: 'Destacado',
    type: 'villa',
    status: 'venta'
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
    badge: 'Nuevo',
    type: 'penthouse',
    status: 'venta'
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
    badge: 'Exclusivo',
    type: 'casa',
    status: 'venta'
  },
  {
    id: '4',
    title: 'Apartamento Frente al Mar',
    location: 'San Sebastián, España',
    price: '3,500',
    beds: 3,
    baths: 2,
    sqft: 1500,
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
    badge: 'Popular',
    type: 'apartamento',
    status: 'renta'
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
    badge: null,
    type: 'casa',
    status: 'venta'
  },
  {
    id: '6',
    title: 'Loft Contemporáneo',
    location: 'Bilbao, España',
    price: '2,200',
    beds: 2,
    baths: 2,
    sqft: 1200,
    image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800',
    badge: 'Diseño',
    type: 'loft',
    status: 'renta'
  },
  {
    id: '7',
    title: 'Chalet de Montaña',
    location: 'Andorra',
    price: '1,200,000',
    beds: 6,
    baths: 4,
    sqft: 3800,
    image: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800',
    badge: null,
    type: 'chalet',
    status: 'venta'
  },
  {
    id: '8',
    title: 'Estudio Minimalista',
    location: 'Barcelona, España',
    price: '1,500',
    beds: 1,
    baths: 1,
    sqft: 600,
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
    badge: 'Económico',
    type: 'estudio',
    status: 'renta'
  },
  {
    id: '9',
    title: 'Casa de Campo',
    location: 'Mallorca, España',
    price: '2,800,000',
    beds: 5,
    baths: 5,
    sqft: 4200,
    image: 'https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=800',
    badge: 'Premium',
    type: 'casa',
    status: 'venta'
  }
]

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('todos')
  const [filterStatus, setFilterStatus] = useState('todos')
  const [priceRange, setPriceRange] = useState('todos')
  const [showFilters, setShowFilters] = useState(false)

  // Fetch properties from API
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/properties')
        const data = await response.json()
        
        console.log('API Response:', data) // Debug log
        
        if (data.success) {
          // Check different possible response structures
          const propertiesData = data.data?.properties || data.data || []
          console.log('Properties data:', propertiesData) // Debug log
          
          if (Array.isArray(propertiesData) && propertiesData.length > 0) {
            // Map the domain objects to our frontend format
            const mappedProperties = propertiesData.map((prop: any) => ({
              id: prop.id || prop._id,
              title: prop.title,
              description: prop.description,
              price: prop.price?.amount || prop.price,
              location: {
                address: prop.address?.street || '',
                city: prop.address?.city || '',
                state: prop.address?.state || '',
                country: prop.address?.country || ''
              },
              propertyType: prop.propertyType?.value || prop.propertyType,
              status: (prop.status === 'rent' ? 'rent' : 'sale') as 'sale' | 'rent',
              features: {
                bedrooms: prop.features?.bedrooms || 0,
                bathrooms: prop.features?.bathrooms || 0,
                parkingSpaces: prop.features?.parking || 0,
                totalArea: prop.features?.squareMeters || 0,
                builtArea: prop.features?.squareMeters || 0
              },
              images: prop.images || [],
              highlighted: false
            }))
            setProperties(mappedProperties)
          } else {
            console.log('No properties found in response')
            setProperties([])
            // Don't use mock data - show empty state instead
          }
        } else {
          throw new Error(data.error || 'Failed to fetch properties')
        }
      } catch (err) {
        console.error('Error fetching properties:', err)
        setError('No se pudieron cargar las propiedades')
        setProperties([])
      } finally {
        setLoading(false)
      }
    }

    fetchProperties()
  }, [])

  // Filter properties
  useEffect(() => {
    let filtered = properties

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(property => 
        property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.location.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.location.state.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Type filter
    if (filterType !== 'todos') {
      filtered = filtered.filter(property => property.propertyType === filterType)
    }

    // Status filter
    if (filterStatus !== 'todos') {
      filtered = filtered.filter(property => 
        filterStatus === 'venta' ? property.status === 'sale' : property.status === 'rent'
      )
    }

    // Price range filter
    if (priceRange !== 'todos') {
      filtered = filtered.filter(property => {
        const price = property.price
        switch(priceRange) {
          case 'bajo':
            return property.status === 'rent' ? price < 2000 : price < 500000
          case 'medio':
            return property.status === 'rent' ? (price >= 2000 && price < 4000) : (price >= 500000 && price < 1500000)
          case 'alto':
            return property.status === 'rent' ? price >= 4000 : price >= 1500000
          default:
            return true
        }
      })
    }

    setFilteredProperties(filtered)
  }, [searchTerm, filterType, filterStatus, priceRange, properties])

  return (
    <div className="min-h-screen" style={{ background: '#0a0a0a' }}>
      <Navigation />
      
      <main className="pt-20">
        <div className="section-container py-16">
          {/* Header */}
          <div className="text-center mb-12">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6"
              style={{ 
                background: 'rgba(255, 255, 255, 0.1)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            >
              <div className="w-1 h-1 rounded-full bg-white opacity-60"></div>
              Explora Nuestras Propiedades
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-light mb-6"
              style={{ color: '#ffffff' }}
            >
              Encuentra tu <span className="gradient-text">hogar ideal</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl max-w-3xl mx-auto"
              style={{ color: '#a3a3a3' }}
            >
              Descubre propiedades exclusivas en las mejores ubicaciones
            </motion.p>
          </div>

          {/* Search and Filters */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-6 mb-8"
          >
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search Bar */}
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: '#a3a3a3' }} />
                <input
                  type="text"
                  placeholder="Buscar por ubicación o título..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-lg transition-all duration-200"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#ffffff'
                  }}
                />
              </div>

              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-6 py-3 rounded-lg transition-all duration-200"
                style={{
                  background: showFilters ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#ffffff'
                }}
              >
                <SlidersHorizontal className="w-5 h-5" />
                Filtros
              </button>
            </div>

            {/* Expanded Filters */}
            {showFilters && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6"
                style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}
              >
                {/* Type Filter */}
                <div>
                  <label className="flex items-center gap-2 text-sm mb-2" style={{ color: '#a3a3a3' }}>
                    <Home className="w-4 h-4" />
                    Tipo de Propiedad
                  </label>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg"
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#ffffff'
                    }}
                  >
                    <option value="todos">Todos</option>
                    <option value="casa">Casa</option>
                    <option value="apartamento">Apartamento</option>
                    <option value="villa">Villa</option>
                    <option value="penthouse">Penthouse</option>
                    <option value="loft">Loft</option>
                    <option value="chalet">Chalet</option>
                    <option value="estudio">Estudio</option>
                  </select>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="flex items-center gap-2 text-sm mb-2" style={{ color: '#a3a3a3' }}>
                    <MapPin className="w-4 h-4" />
                    Estado
                  </label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg"
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#ffffff'
                    }}
                  >
                    <option value="todos">Todos</option>
                    <option value="venta">En Venta</option>
                    <option value="renta">En Renta</option>
                  </select>
                </div>

                {/* Price Range Filter */}
                <div>
                  <label className="flex items-center gap-2 text-sm mb-2" style={{ color: '#a3a3a3' }}>
                    <DollarSign className="w-4 h-4" />
                    Rango de Precio
                  </label>
                  <select
                    value={priceRange}
                    onChange={(e) => setPriceRange(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg"
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#ffffff'
                    }}
                  >
                    <option value="todos">Todos</option>
                    <option value="bajo">Económico</option>
                    <option value="medio">Medio</option>
                    <option value="alto">Premium</option>
                  </select>
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Results Count */}
          {!loading && (
            <div className="mb-8 text-center">
              <p style={{ color: '#a3a3a3' }}>
                {filteredProperties.length} {filteredProperties.length === 1 ? 'propiedad encontrada' : 'propiedades encontradas'}
              </p>
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-white border-opacity-20 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
                <p style={{ color: '#a3a3a3' }}>Cargando propiedades...</p>
              </div>
            </div>
          ) : error ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <div 
                className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                style={{ 
                  background: 'rgba(255, 59, 48, 0.1)',
                  border: '1px solid rgba(255, 59, 48, 0.2)'
                }}
              >
                <Home className="w-8 h-8" style={{ color: '#ff3b30' }} />
              </div>
              <h3 className="text-xl font-light mb-2" style={{ color: '#ffffff' }}>
                Error al cargar propiedades
              </h3>
              <p style={{ color: '#a3a3a3' }}>{error}</p>
            </motion.div>
          ) : filteredProperties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProperties.map((property, index) => (
                <PropertyCard
                  key={property.id}
                  id={property.id}
                  title={property.title}
                  location={`${property.location.city}, ${property.location.state}`}
                  price={property.price.toLocaleString()}
                  beds={property.features.bedrooms}
                  baths={property.features.bathrooms}
                  sqft={property.features.totalArea || 0}
                  image={property.images[0] || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800'}
                  badge={property.highlighted ? 'Destacado' : undefined}
                  index={index}
                />
              ))}
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <div 
                className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                style={{ 
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}
              >
                <Home className="w-8 h-8" style={{ color: '#a3a3a3' }} />
              </div>
              <h3 className="text-xl font-light mb-2" style={{ color: '#ffffff' }}>
                {searchTerm || filterType !== 'todos' || filterStatus !== 'todos' || priceRange !== 'todos'
                  ? 'No se encontraron propiedades'
                  : 'No hay propiedades disponibles'}
              </h3>
              <p className="mb-6" style={{ color: '#a3a3a3' }}>
                {searchTerm || filterType !== 'todos' || filterStatus !== 'todos' || priceRange !== 'todos'
                  ? 'Intenta ajustar tus filtros de búsqueda'
                  : 'Sé el primero en publicar una propiedad'}
              </p>
              {!(searchTerm || filterType !== 'todos' || filterStatus !== 'todos' || priceRange !== 'todos') && (
                <a
                  href="/publish"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg transition-all duration-200"
                  style={{
                    background: 'linear-gradient(135deg, #ffffff, #e5e5e5)',
                    color: '#000000',
                    textDecoration: 'none'
                  }}
                >
                  <div className="w-1 h-1 rounded-full bg-current opacity-60"></div>
                  Publicar Propiedad
                  <div className="w-1 h-1 rounded-full bg-current opacity-60"></div>
                </a>
              )}
            </motion.div>
          )}
        </div>
      </main>
    </div>
  )
}