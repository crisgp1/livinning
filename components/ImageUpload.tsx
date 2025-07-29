'use client'

import { useState, useRef, useCallback } from 'react'
import { gsap } from 'gsap'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import Image from 'next/image'

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
  
  const dropRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  const uploadFiles = async (files: File[]) => {
    if (files.length === 0) return

    setUploading(true)

    try {
      const formData = new FormData()
      files.forEach(file => formData.append('files', file))

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (result.success) {
        const newImages = [...images, ...result.data.files].slice(0, maxImages)
        setImages(newImages)
        onImagesChange(newImages)

        // Animate new images
        const newImageElements = gridRef.current?.querySelectorAll('.image-item:nth-last-child(-n+' + result.data.files.length + ')')
        if (newImageElements) {
          gsap.fromTo(newImageElements,
            { scale: 0, opacity: 0, rotation: 10 },
            { scale: 1, opacity: 1, rotation: 0, duration: 0.5, stagger: 0.1, ease: "back.out(1.7)" }
          )
        }
      } else {
        throw new Error(result.error || 'Upload failed')
      }
    } catch (error) {
      console.error('Upload error:', error)
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

    if (dropRef.current) {
      gsap.to(dropRef.current, {
        scale: 1.02,
        borderColor: 'var(--color-primary)',
        backgroundColor: 'var(--color-surface-hover)',
        duration: 0.2,
        ease: "power2.out"
      })
    }
  }, [])

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (dropRef.current) {
      gsap.to(dropRef.current, {
        scale: 1,
        borderColor: 'var(--color-border)',
        backgroundColor: 'var(--color-surface)',
        duration: 0.2,
        ease: "power2.out"
      })
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (dropRef.current) {
      gsap.to(dropRef.current, {
        scale: 1,
        borderColor: 'var(--color-border)',
        backgroundColor: 'var(--color-surface)',
        duration: 0.2,
        ease: "power2.out"
      })
    }

    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/')
    )

    if (files.length > 0) {
      uploadFiles(files)
    }
  }, [images, maxImages])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      uploadFiles(files)
    }
  }

  const removeImage = (index: number) => {
    const imageElement = gridRef.current?.children[index] as HTMLElement
    
    if (imageElement) {
      gsap.to(imageElement, {
        scale: 0,
        opacity: 0,
        rotation: -10,
        duration: 0.3,
        ease: "power2.in",
        onComplete: () => {
          const newImages = images.filter((_, i) => i !== index)
          setImages(newImages)
          onImagesChange(newImages)
        }
      })
    }
  }

  return (
    <div className="space-y-4">
      <div
        ref={dropRef}
        className="border-2 border-dashed rounded-xl p-8 text-center transition-colors duration-200 cursor-pointer"
        style={{ 
          borderColor: 'var(--color-border)',
          background: 'var(--color-surface)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'var(--color-primary)'
          e.currentTarget.style.background = 'var(--color-surface-hover)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'var(--color-border)'
          e.currentTarget.style.background = 'var(--color-surface)'
        }}
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
      </div>

      {images.length > 0 && (
        <div>
          <h4 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text)' }}>
            Imágenes subidas ({images.length}/{maxImages})
          </h4>
          
          <div 
            ref={gridRef}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
          >
            {images.map((image, index) => (
              <div
                key={index}
                className="image-item relative group aspect-square rounded-lg overflow-hidden" style={{ background: 'rgba(17, 17, 17, 0.8)' }}
              >
                <Image
                  src={image}
                  alt={`Property image ${index + 1}`}
                  fill
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
              </div>
            ))}
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