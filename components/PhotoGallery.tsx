'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, X, ZoomIn, Grid3X3 } from 'lucide-react'
import { motion, AnimatePresence, useMotionValue } from 'framer-motion'

interface PhotoGalleryProps {
  images: string[]
  title: string
}

export default function PhotoGallery({ images, title }: PhotoGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isGridView, setIsGridView] = useState(false)

  // Animation variants for Framer Motion
  const mainImageVariants = {
    initial: { scale: 1.1, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.95, opacity: 0 }
  }

  const thumbnailVariants = {
    initial: { y: 20, opacity: 0 },
    animate: (i: number) => ({
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        delay: 0.3 + i * 0.1
      }
    })
  }

  const changeImage = (index: number) => {
    if (index === currentIndex) return
    setCurrentIndex(index)
  }

  const openModal = () => {
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
  }

  const toggleGridView = () => {
    setIsGridView(!isGridView)
  }

  const nextImage = () => {
    const nextIndex = (currentIndex + 1) % images.length
    changeImage(nextIndex)
  }

  const prevImage = () => {
    const prevIndex = (currentIndex - 1 + images.length) % images.length
    changeImage(prevIndex)
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isModalOpen) return
      
      if (e.key === 'Escape') closeModal()
      if (e.key === 'ArrowRight') nextImage()
      if (e.key === 'ArrowLeft') prevImage()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isModalOpen, currentIndex])

  return (
    <>
      <div className="space-y-4">
        {/* Main Image */}
        <div className="relative">
          <motion.div
            className="relative h-[70vh] rounded-xl overflow-hidden cursor-pointer group"
            variants={mainImageVariants}
            initial="initial"
            animate="animate"
            transition={{ duration: 1, ease: "easeOut" }}
            onClick={openModal}
          >
            <Image
              src={images[currentIndex]}
              alt={`${title} - Image ${currentIndex + 1}`}
              fill
              loading="lazy"
              sizes="(max-width: 768px) 100vw, 80vw"
              quality={90}
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bvKixzacqgAoqJccqgAoqJccqgAoqJccqgAoqJccqgAoqJccqgAoqJccqgAoqJccqgAoqJccqgAoqJccqgAoqJccqgAoqJccqgAoqJccqgAoqJccqgAoqJccqgAoqJccqgAoqJc="
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Zoom Overlay */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
                <ZoomIn size={32} className="text-white" />
              </div>
            </div>

            {/* Navigation Arrows */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                prevImage()
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm rounded-full p-3 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white/30"
            >
              <ChevronLeft size={24} className="text-white" />
            </button>
            
            <button
              onClick={(e) => {
                e.stopPropagation()
                nextImage()
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm rounded-full p-3 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white/30"
            >
              <ChevronRight size={24} className="text-white" />
            </button>

            {/* Image Counter */}
            <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-sm rounded-full px-4 py-2 text-white text-sm">
              {currentIndex + 1} / {images.length}
            </div>
          </motion.div>

          {/* Gallery Controls */}
          <div className="absolute top-4 right-4 flex gap-2">
            <button
              onClick={toggleGridView}
              className="bg-white/20 backdrop-blur-sm rounded-full p-3 text-white hover:bg-white/30 transition-colors duration-300"
            >
              <Grid3X3 size={20} />
            </button>
          </div>
        </div>

        {/* Thumbnails */}
        <AnimatePresence>
          {!isGridView && (
            <motion.div
              className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
            >
              {images.map((image, index) => (
                <motion.div
                  key={`thumb-${image}-${index}`}
                  custom={index}
                  variants={thumbnailVariants}
                  initial="initial"
                  animate="animate"
                  className={`relative h-20 w-32 flex-shrink-0 rounded-lg overflow-hidden cursor-pointer transition-all duration-300 ${
                    index === currentIndex
                      ? 'ring-2 ring-white scale-105'
                      : 'hover:scale-105 opacity-70 hover:opacity-100'
                  }`}
                  onClick={() => changeImage(index)}
                >
                <Image
                  src={image}
                  alt={`${title} thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Grid View */}
        <AnimatePresence>
          {isGridView && (
            <motion.div
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {images.map((image, index) => (
                <motion.div
                  key={`thumb-${image}-${index}`}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{
                    duration: 0.4,
                    delay: index * 0.05,
                    type: "spring",
                    stiffness: 400,
                    damping: 30
                  }}
                  className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group"
                  onClick={() => {
                    changeImage(index)
                    toggleGridView()
                  }}
                >
                <Image
                  src={image}
                  alt={`${title} grid ${index + 1}`}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            onClick={closeModal}
          >
            <motion.div
              className="relative max-w-7xl max-h-full"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{
                duration: 0.4,
                delay: 0.1,
                type: "spring",
                stiffness: 400,
                damping: 30
              }}
              onClick={(e) => e.stopPropagation()}
            >
            <Image
              src={images[currentIndex]}
              alt={`${title} - Full size ${currentIndex + 1}`}
              width={1200}
              height={800}
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />
            
            {/* Modal Navigation */}
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm rounded-full p-4 text-white hover:bg-white/30 transition-colors duration-300"
            >
              <ChevronLeft size={32} />
            </button>
            
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm rounded-full p-4 text-white hover:bg-white/30 transition-colors duration-300"
            >
              <ChevronRight size={32} />
            </button>

            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm rounded-full p-3 text-white hover:bg-white/30 transition-colors duration-300"
            >
              <X size={24} />
            </button>

            {/* Modal Counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm rounded-full px-6 py-3 text-white">
              {currentIndex + 1} / {images.length}
            </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}