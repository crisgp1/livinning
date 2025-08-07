import { useState, useEffect, useCallback } from 'react'

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

interface UseFavoritesReturn {
  favoriteProperties: Property[]
  favoritesCount: number
  favoriteIds: Set<string>
  isLoading: boolean
  addFavorite: (propertyId: string) => Promise<boolean>
  removeFavorite: (propertyId: string) => Promise<boolean>
  toggleFavorite: (propertyId: string) => Promise<boolean>
  isFavorite: (propertyId: string) => boolean
  refreshFavorites: () => Promise<void>
}

export function useFavorites(): UseFavoritesReturn {
  const [favoriteProperties, setFavoriteProperties] = useState<Property[]>([])
  const [favoritesCount, setFavoritesCount] = useState(0)
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(true)

  const fetchFavorites = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/favorites?includeProperties=true')
      if (response.ok) {
        const data = await response.json()
        const properties = data.data.properties || []
        const count = data.data.count || 0
        
        setFavoriteProperties(properties)
        setFavoritesCount(count)
        setFavoriteIds(new Set(properties.map((p: Property) => p.id)))
      }
    } catch (error) {
      console.error('Error fetching favorites:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const addFavorite = useCallback(async (propertyId: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ propertyId })
      })

      if (response.ok) {
        setFavoriteIds(prev => new Set([...prev, propertyId]))
        setFavoritesCount(prev => prev + 1)
        await fetchFavorites() // Refresh to get full property data
        return true
      }
      return false
    } catch (error) {
      console.error('Error adding favorite:', error)
      return false
    }
  }, [fetchFavorites])

  const removeFavorite = useCallback(async (propertyId: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/favorites?propertyId=${propertyId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setFavoriteIds(prev => {
          const newSet = new Set(prev)
          newSet.delete(propertyId)
          return newSet
        })
        setFavoritesCount(prev => Math.max(0, prev - 1))
        setFavoriteProperties(prev => prev.filter(p => p.id !== propertyId))
        return true
      }
      return false
    } catch (error) {
      console.error('Error removing favorite:', error)
      return false
    }
  }, [])

  const toggleFavorite = useCallback(async (propertyId: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/favorites/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ propertyId })
      })

      if (response.ok) {
        const data = await response.json()
        const isFavorite = data.data.isFavorite

        if (isFavorite) {
          setFavoriteIds(prev => new Set([...prev, propertyId]))
          setFavoritesCount(prev => prev + 1)
        } else {
          setFavoriteIds(prev => {
            const newSet = new Set(prev)
            newSet.delete(propertyId)
            return newSet
          })
          setFavoritesCount(prev => Math.max(0, prev - 1))
          setFavoriteProperties(prev => prev.filter(p => p.id !== propertyId))
        }

        // Refresh to get updated property data if it was added
        if (isFavorite) {
          await fetchFavorites()
        }

        return isFavorite
      }
      return favoriteIds.has(propertyId) // Return current state if API failed
    } catch (error) {
      console.error('Error toggling favorite:', error)
      return favoriteIds.has(propertyId) // Return current state if API failed
    }
  }, [favoriteIds, fetchFavorites])

  const isFavorite = useCallback((propertyId: string): boolean => {
    return favoriteIds.has(propertyId)
  }, [favoriteIds])

  const refreshFavorites = useCallback(async (): Promise<void> => {
    await fetchFavorites()
  }, [fetchFavorites])

  useEffect(() => {
    fetchFavorites()
  }, [fetchFavorites])

  return {
    favoriteProperties,
    favoritesCount,
    favoriteIds,
    isLoading,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
    refreshFavorites
  }
}