'use client'

import { useState, useRef, useEffect } from 'react'
import { MapPin, Search, Loader2 } from 'lucide-react'
import Radar from 'radar-sdk-js'
import { gsap } from 'gsap'

interface LocationAutocompleteProps {
  onLocationSelect: (location: {
    street: string
    city: string
    state: string
    country: string
    postalCode: string
    coordinates: { latitude: number; longitude: number }
  }) => void
  defaultValue?: string
  placeholder?: string
}

export default function LocationAutocomplete({ 
  onLocationSelect, 
  defaultValue = '',
  placeholder = 'Buscar dirección...'
}: LocationAutocompleteProps) {
  const [query, setQuery] = useState(defaultValue)
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Initialize Radar with the test key (use live key in production)
    Radar.initialize(process.env.NEXT_PUBLIC_RADAR_TEST_PUBLISHABLE_KEY || '')
  }, [])

  useEffect(() => {
    if (showSuggestions && suggestionsRef.current) {
      gsap.fromTo(suggestionsRef.current,
        { opacity: 0, y: -10 },
        { opacity: 1, y: 0, duration: 0.2, ease: "power2.out" }
      )
    }
  }, [showSuggestions])

  const searchLocation = async (searchQuery: string) => {
    if (searchQuery.length < 3) {
      setSuggestions([])
      return
    }

    setLoading(true)
    
    try {
      // Use Radar autocomplete API focused on Mexico
      const response = await Radar.autocomplete({
        query: searchQuery,
        limit: 5
      })

      setSuggestions(response.addresses || [])
      setShowSuggestions(true)
    } catch (error) {
      console.error('Error searching location:', error)
      setSuggestions([])
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    setSelectedIndex(-1)

    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Debounce search
    timeoutRef.current = setTimeout(() => {
      searchLocation(value)
    }, 300)
  }

  const selectLocation = (address: any) => {
    const location = {
      street: address.addressLabel || address.formattedAddress || '',
      city: address.city || address.locality || '',
      state: address.state || address.region || '',
      country: address.country || 'México',
      postalCode: address.postalCode || '',
      coordinates: {
        latitude: address.latitude || 0,
        longitude: address.longitude || 0
      }
    }

    setQuery(address.formattedAddress || '')
    setShowSuggestions(false)
    onLocationSelect(location)

    // Animate selection
    if (inputRef.current) {
      gsap.to(inputRef.current, {
        borderColor: '#10b981',
        duration: 0.3,
        onComplete: () => {
          gsap.to(inputRef.current, {
            borderColor: '#d1d5db',
            duration: 0.3,
            delay: 0.5
          })
        }
      })
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1)
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          selectLocation(suggestions[selectedIndex])
        }
        break
      case 'Escape':
        setShowSuggestions(false)
        setSelectedIndex(-1)
        break
    }
  }

  const handleBlur = () => {
    // Delay to allow click on suggestion
    setTimeout(() => setShowSuggestions(false), 200)
  }

  return (
    <div className="relative">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" style={{ color: 'var(--color-text-muted)' }} />
          ) : (
            <Search className="h-5 w-5" style={{ color: 'var(--color-text-muted)' }} />
          )}
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (query.length >= 3 && suggestions.length > 0) setShowSuggestions(true)
          }}
          onBlur={handleBlur}
          className="input pl-10"
          placeholder={placeholder}
          autoComplete="off"
        />
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div 
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-2 rounded-lg shadow-lg overflow-hidden"
          className="card"
          style={{ 
            backdropFilter: 'blur(12px)'
          }}
        >
          {suggestions.map((address, index) => (
            <button
              key={index}
              type="button"
              onClick={() => selectLocation(address)}
              className={`w-full px-4 py-3 text-left transition-colors duration-150 border-b last:border-b-0 ${
                index === selectedIndex ? '' : ''
              }`}
              style={{ 
                borderColor: 'var(--color-border)',
                background: index === selectedIndex ? 'var(--color-surface-hover)' : 'transparent'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--color-surface-hover)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = index === selectedIndex ? 'var(--color-surface-hover)' : 'transparent'
              }}
            >
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 mt-0.5 flex-shrink-0" style={{ color: 'var(--color-text-muted)' }} />
                <div className="flex-1">
                  <div className="font-medium" style={{ color: 'var(--color-text)' }}>
                    {address.formattedAddress || address.addressLabel}
                  </div>
                  {address.neighborhood && (
                    <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                      {address.neighborhood}, {address.city || address.locality}
                    </div>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {showSuggestions && suggestions.length === 0 && query.length >= 3 && !loading && (
        <div 
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-2 rounded-lg shadow-lg p-4 text-center"
          className="card"
          style={{ 
            backdropFilter: 'blur(12px)',
            color: 'var(--color-text-muted)'
          }}
        >
          No se encontraron resultados
        </div>
      )}
    </div>
  )
}