'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Bed, Bath, Square, Heart, MapPin, Camera, Star } from 'lucide-react'
import { debounce } from '@/lib/utils/dynamic-imports'

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
  images?: string[]
  isHighlighted?: boolean
  isHighlightActive?: boolean
  showFavoriteButton?: boolean
  isFavorite?: boolean
  onFavoriteChange?: (isFavorite: boolean) => void
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
  index,
  images = [],
  isHighlighted = false,
  isHighlightActive = false,
  showFavoriteButton = true,
  isFavorite = false,
  onFavoriteChange
}: PropertyCardProps) {
  const [favoriteState, setFavoriteState] = useState(isFavorite)
  const [favoriteLoading, setFavoriteLoading] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const allImages = [image, ...(images || [])]

  useEffect(() => {
    setFavoriteState(isFavorite)
  }, [isFavorite])

  const toggleFavorite = useCallback(
    debounce(async (propertyId: string) => {
      setFavoriteLoading(true)
      try {
        const response = await fetch('/api/favorites/toggle', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ propertyId })
        })
        if (response.ok) {
          const data = await response.json()
          setFavoriteState(data.data.isFavorite)
          onFavoriteChange?.(data.data.isFavorite)
        }
      } catch (error) {
        console.error('Error toggling favorite:', error)
      } finally {
        setFavoriteLoading(false)
      }
    }, 300),
    [onFavoriteChange]
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group"
    >
      <Link href={`/properties/${id}`} className="block">
        <div className={`relative overflow-hidden rounded-2xl glass-icon-container h-full transition-all duration-300 ${
          isHighlightActive ? 'ring-4 ring-yellow-400 shadow-xl shadow-yellow-400/40 bg-gradient-to-br from-yellow-50/40 to-white/90' : ''
        }`}>
          <div className="relative h-48 md:h-64 overflow-hidden rounded-t-xl">
          <Image
            src={allImages[currentImageIndex] || image}
            alt={title}
            fill
            priority={index === 0}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            quality={85}
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bvKixzacqgAoqJccqgAoqJccqgAoqJccqgAoqJccqgAoqJccqgAoqJccqgAoqJccqgAoqJccqgAoqJccqgAoqJccqgAoqJccqgAoqJccqgAoqJccqgAoqJccqgAoqJccqgAoqJc="
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          
          {badge && (
            <div className="absolute top-3 left-3 px-3 py-1.5 rounded-full text-xs font-semibold bg-white/90 backdrop-blur-sm text-primary shadow-lg">
              {badge}
            </div>
          )}
          
          {isHighlightActive && (
            <div className={`absolute top-3 ${badge ? 'left-28' : 'left-3'} px-2.5 py-1.5 rounded-full text-xs font-semibold bg-yellow-400/90 backdrop-blur-sm text-yellow-900 shadow-lg flex items-center gap-1`}>
              <Star size={12} className="fill-yellow-900" />
              <span>Destacado</span>
            </div>
          )}
          
          {allImages.length > 1 && (
            <div className="absolute bottom-3 left-3 px-2.5 py-1.5 rounded-full text-xs flex items-center gap-1 bg-white/90 backdrop-blur-sm text-gray-700 shadow-lg">
              <Camera size={14} />
              <span>{allImages.length}</span>
            </div>
          )}
          
          {showFavoriteButton && (
            <button 
              onClick={(e) => {
                e.preventDefault()
                if (favoriteLoading) return
                toggleFavorite(id)
              }}
              className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110 disabled:opacity-50"
              disabled={favoriteLoading}
            >
              <Heart 
                size={20} 
                className={`transition-all duration-200 ${
                  favoriteState ? 'fill-red-500 text-red-500' : 'text-gray-400 hover:text-red-500'
                }`}
              />
            </button>
          )}

          {/* Image Navigation Dots */}
          {allImages.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
              {allImages.slice(0, 5).map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.preventDefault()
                    setCurrentImageIndex(idx)
                  }}
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${
                    idx === currentImageIndex 
                      ? 'bg-white w-4' 
                      : 'bg-white/60'
                  }`}
                />
              ))}
            </div>
          )}
          </div>

          <div className="p-4 md:p-6 bg-white/50 backdrop-blur-sm">
            <div className="mb-3">
              <h3 className="text-xl md:text-2xl font-light text-gray-900">
                {price}
              </h3>
            </div>
            
            <div className="flex items-center gap-4 text-sm mb-3">
              <div className="flex items-center gap-1.5">
                <div className="p-1.5 rounded-lg bg-gray-50">
                  <Bed size={14} className="text-gray-600" />
                </div>
                <span className="font-medium text-gray-700">{beds}</span>
                <span className="text-gray-500">rec</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="p-1.5 rounded-lg bg-gray-50">
                  <Bath size={14} className="text-gray-600" />
                </div>
                <span className="font-medium text-gray-700">{baths}</span>
                <span className="text-gray-500">baños</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="p-1.5 rounded-lg bg-gray-50">
                  <Square size={14} className="text-gray-600" />
                </div>
                <span className="font-medium text-gray-700">{sqft.toLocaleString()}</span>
                <span className="text-gray-500">m²</span>
              </div>
            </div>

            <h4 className="text-sm md:text-base font-medium text-gray-900 mb-2 line-clamp-1">
              {title}
            </h4>
            
            <div className="flex items-center gap-1.5 text-sm text-gray-500">
              <MapPin size={14} />
              <p className="line-clamp-1">{location}</p>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}