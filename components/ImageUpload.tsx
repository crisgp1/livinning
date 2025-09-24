'use client'

import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import Image from 'next/image'
import logger from '@/lib/utils/logger'

interface ImageUploadProps {
  onImagesChange: (images: string[]) => void
  maxImages?: number
  existingImages?: string[]
}

export default function ImageUpload({
  onImagesChange,
  maxImages = 10,
  existingImages = []
}: ImageUploadProps) {
  const [images, setImages] = useState<string[]>(existingImages)
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)

  // Framer Motion values for drag interactions
  const scale = useMotionValue(1)
  const borderColorOpacity = useMotionValue(0)

  const uploadFiles = async (files: File[]) => {
    if (files.length === 0) return

    setUploading(true)
    
    const uploadTimer = logger.startTimer('Image Upload')
    logger.info('ImageUpload', 'Starting file upload', {
      fileCount: files.length,
      totalSize: files.reduce((sum, file) => sum + file.size, 0),
      fileTypes: files.map(file => file.type),
      maxImages
    })

    try {
      const formData = new FormData()
      files.forEach((file, index) => {
        formData.append('files', file)
        logger.debug('ImageUpload', `Added file ${index}`, {
          name: file.name,
          size: file.size,
          type: file.type
        })
      })

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()
      uploadTimer()

      if (result.success) {
        const newImages = [...images, ...result.data.files].slice(0, maxImages)
        setImages(newImages)
        onImagesChange(newImages)

        logger.info('ImageUpload', 'Upload successful', {
          uploadedCount: result.data.files.length,
          totalImages: newImages.length,
          uploadedFiles: result.data.files
        })
      } else {
        logger.error('ImageUpload', 'Upload failed', { error: result.error })
        throw new Error(result.error || 'Upload failed')
      }
    } catch (error) {
      uploadTimer()
      logger.error('ImageUpload', 'Upload error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        fileCount: files.length
      })
      alert('Failed to upload images. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(true)
    scale.set(1.02)
    borderColorOpacity.set(1)
  }, [scale, borderColorOpacity])

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    scale.set(1)
    borderColorOpacity.set(0)
  }, [scale, borderColorOpacity])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    scale.set(1)
    borderColorOpacity.set(0)

    const files = Array.from(e.dataTransfer.files).filter(file =>
      file.type.startsWith('image/')
    )

    if (files.length > 0) {
      uploadFiles(files)
    }
  }, [scale, borderColorOpacity])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      uploadFiles(files)
    }
  }

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    setImages(newImages)
    onImagesChange(newImages)
  }

  return (
    <div className="space-y-4">
      <motion.div
        className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer"
        style={{
          scale,
          borderColor: useTransform(borderColorOpacity, [0, 1], ['rgb(229 231 235)', 'rgb(59 130 246)']),
          backgroundColor: useTransform(borderColorOpacity, [0, 1], ['rgb(248 250 252)', 'rgb(239 246 255)'])
        }}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg" style={{ background: 'var(--color-primary)' }}>
            {uploading ? (
              <div className="loading-spinner" />
            ) : (
              <Upload size={24} style={{ color: '#ffffff' }} />
            )}
          </div>
          
          <div>
            <h3 className="text-lg font-semibold" style={{ color: 'var(--color-text)' }}>
              {uploading ? 'Subiendo imágenes...' : 'Sube las fotos de tu propiedad'}
            </h3>
            <p className="mt-1" style={{ color: 'var(--color-text-secondary)' }}>
              Arrastra y suelta las imágenes aquí o haz clic para seleccionar
            </p>
            <p className="text-sm mt-2" style={{ color: 'var(--color-text-muted)' }}>
              Máximo {maxImages} imágenes • PNG, JPG, WebP • Máximo 10MB cada una
            </p>
          </div>
        </div>
      </motion.div>

      {images.length > 0 && (
        <div>
          <h4 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text)' }}>
            Imágenes subidas ({images.length}/{maxImages})
          </h4>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <AnimatePresence>
              {images.map((image, index) => (
                <motion.div
                  key={image}
                  layout
                  initial={{ scale: 0, opacity: 0, rotate: 10 }}
                  animate={{ scale: 1, opacity: 1, rotate: 0 }}
                  exit={{ scale: 0, opacity: 0, rotate: -10 }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 30,
                    delay: index * 0.1
                  }}
                  className="relative group aspect-square rounded-lg overflow-hidden bg-gray-900"
                >
                <Image
                  src={image}
                  alt={`Property image ${index + 1}`}
                  fill
                  loading="lazy"
                  quality={75}
                  sizes="(max-width: 768px) 25vw, 150px"
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bvKixzacqgAoqJccqgAoqJccqgAoqJccqgAoqJccqgAoqJccqgAoqJccqgAoqJccqgAoqJccqgAoqJccqgAoqJccqgAoqJccqgAoqJccqgAoqJccqgAoqJccqgAoqJccqgAoqJc="
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                />
                
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      removeImage(index)
                    }}
                    className="rounded-full p-2 transition-colors duration-200" style={{ background: 'rgba(255, 255, 255, 0.9)', color: '#000000' }}
                  >
                    <X size={16} />
                  </button>
                </div>

                {index === 0 && (
                  <div className="absolute top-2 left-2 text-xs px-2 py-1 rounded-full font-medium" style={{ background: 'rgba(255, 255, 255, 0.9)', color: '#000000' }}>
                    Principal
                  </div>
                )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {images.length === 0 && (
        <div className="text-center py-8">
          <ImageIcon size={48} className="mx-auto mb-4" style={{ color: '#666666' }} />
          <p style={{ color: '#a3a3a3' }}>No hay imágenes subidas aún</p>
        </div>
      )}
    </div>
  )
}