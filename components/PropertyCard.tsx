'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Bed, Bath, Square, Heart, MapPin, Camera } from 'lucide-react'

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
  images = []
}: PropertyCardProps) {
  const [isFavorite, setIsFavorite] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const allImages = [image, ...(images || [])]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group"
    >
      <Link href={`/properties/${id}`} className="block">
        <div className="relative overflow-hidden rounded-2xl glass-icon-container h-full">
          <div className="relative h-64 overflow-hidden rounded-t-xl">
          <Image
            src={allImages[currentImageIndex] || image}
            alt={title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          
          {badge && (
            <div className="absolute top-3 left-3 px-3 py-1.5 rounded-full text-xs font-semibold bg-white/90 backdrop-blur-sm text-primary shadow-lg">
              {badge}
            </div>
          )}
          
          {allImages.length > 1 && (
            <div className="absolute bottom-3 left-3 px-2.5 py-1.5 rounded-full text-xs flex items-center gap-1 bg-white/90 backdrop-blur-sm text-gray-700 shadow-lg">
              <Camera size={14} />
              <span>{allImages.length}</span>
            </div>
          )}
          
          <button 
            onClick={(e) => {
              e.preventDefault()
              setIsFavorite(!isFavorite)
            }}
            className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
          >
            <Heart 
              size={20} 
              className={`transition-all duration-200 ${
                isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400 hover:text-red-500'
              }`}
            />
          </button>

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

          <div className="p-6 bg-white/50 backdrop-blur-sm">
            <div className="mb-3">
              <h3 className="text-2xl font-light text-gray-900">
                ${price}
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

            <h4 className="font-medium text-gray-900 mb-2 line-clamp-1">
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