'use client'

import { useState } from 'react'
import { Star, Clock } from 'lucide-react'
import { motion } from 'framer-motion'

interface HighlightPropertyButtonProps {
  propertyId: string
  isHighlighted?: boolean
  isHighlightActive?: boolean
  highlightExpiresAt?: string
  onHighlightChange?: (highlighted: boolean) => void
}

export default function HighlightPropertyButton({
  propertyId,
  isHighlighted = false,
  isHighlightActive = false,
  highlightExpiresAt,
  onHighlightChange
}: HighlightPropertyButtonProps) {
  const [loading, setLoading] = useState(false)
  const [showDurationOptions, setShowDurationOptions] = useState(false)

  const handleHighlight = async (durationInDays: number) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/properties/${propertyId}/highlight`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ durationInDays }),
      })

      if (response.ok) {
        const data = await response.json()
        onHighlightChange?.(data.data.isHighlightActive)
        setShowDurationOptions(false)
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to highlight property')
      }
    } catch (error) {
      alert('Failed to highlight property')
    }
    setLoading(false)
  }

  const handleRemoveHighlight = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/properties/${propertyId}/highlight`, {
        method: 'DELETE',
      })

      if (response.ok) {
        onHighlightChange?.(false)
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to remove highlight')
      }
    } catch (error) {
      alert('Failed to remove highlight')
    }
    setLoading(false)
  }

  const handleExtendHighlight = async (additionalDays: number) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/properties/${propertyId}/highlight`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ additionalDays }),
      })

      if (response.ok) {
        const data = await response.json()
        onHighlightChange?.(data.data.isHighlightActive)
        setShowDurationOptions(false)
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to extend highlight')
      }
    } catch (error) {
      alert('Failed to extend highlight')
    }
    setLoading(false)
  }

  const formatExpiryDate = (dateString?: string) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const getDaysUntilExpiry = (dateString?: string) => {
    if (!dateString) return 0
    const expiry = new Date(dateString)
    const now = new Date()
    const diffTime = expiry.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const daysUntilExpiry = getDaysUntilExpiry(highlightExpiresAt)

  if (isHighlightActive) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
          <div className="p-2 bg-yellow-100 rounded-lg">
            <Star className="w-5 h-5 text-yellow-600 fill-yellow-600" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-yellow-800">Propiedad destacada</p>
            <div className="flex items-center gap-2 text-sm text-yellow-700">
              <Clock className="w-4 h-4" />
              <span>
                {daysUntilExpiry > 0 
                  ? `${daysUntilExpiry} días restantes`
                  : 'Expira hoy'
                }
              </span>
            </div>
            <p className="text-xs text-yellow-600 mt-1">
              Expira el {formatExpiryDate(highlightExpiresAt)}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowDurationOptions(!showDurationOptions)}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Procesando...' : 'Extender'}
          </button>
          <button
            onClick={handleRemoveHighlight}
            disabled={loading}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Procesando...' : 'Quitar'}
          </button>
        </div>

        {showDurationOptions && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="grid grid-cols-2 gap-2 p-3 bg-gray-50 rounded-lg"
          >
            <button
              onClick={() => handleExtendHighlight(7)}
              disabled={loading}
              className="px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg hover:bg-yellow-50 hover:border-yellow-300 transition-colors"
            >
              +7 días
            </button>
            <button
              onClick={() => handleExtendHighlight(15)}
              disabled={loading}
              className="px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg hover:bg-yellow-50 hover:border-yellow-300 transition-colors"
            >
              +15 días
            </button>
            <button
              onClick={() => handleExtendHighlight(30)}
              disabled={loading}
              className="px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg hover:bg-yellow-50 hover:border-yellow-300 transition-colors"
            >
              +30 días
            </button>
            <button
              onClick={() => handleExtendHighlight(60)}
              disabled={loading}
              className="px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg hover:bg-yellow-50 hover:border-yellow-300 transition-colors"
            >
              +60 días
            </button>
          </motion.div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 p-4 bg-gray-50 border border-gray-200 rounded-xl">
        <div className="p-2 bg-gray-100 rounded-lg">
          <Star className="w-5 h-5 text-gray-400" />
        </div>
        <div className="flex-1">
          <p className="font-medium text-gray-800">Destacar propiedad</p>
          <p className="text-sm text-gray-600">
            Aumenta la visibilidad de tu propiedad
          </p>
        </div>
      </div>

      <button
        onClick={() => setShowDurationOptions(!showDurationOptions)}
        disabled={loading}
        className="w-full px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 transition-colors"
      >
        {loading ? 'Procesando...' : 'Destacar propiedad'}
      </button>

      {showDurationOptions && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="grid grid-cols-2 gap-2 p-3 bg-gray-50 rounded-lg"
        >
          <button
            onClick={() => handleHighlight(7)}
            disabled={loading}
            className="px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg hover:bg-yellow-50 hover:border-yellow-300 transition-colors"
          >
            7 días
          </button>
          <button
            onClick={() => handleHighlight(15)}
            disabled={loading}
            className="px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg hover:bg-yellow-50 hover:border-yellow-300 transition-colors"
          >
            15 días
          </button>
          <button
            onClick={() => handleHighlight(30)}
            disabled={loading}
            className="px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg hover:bg-yellow-50 hover:border-yellow-300 transition-colors"
          >
            30 días
          </button>
          <button
            onClick={() => handleHighlight(60)}
            disabled={loading}
            className="px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg hover:bg-yellow-50 hover:border-yellow-300 transition-colors"
          >
            60 días
          </button>
        </motion.div>
      )}
    </div>
  )
}