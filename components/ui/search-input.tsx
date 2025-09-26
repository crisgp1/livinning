'use client'

import { useState, useRef, useEffect } from 'react'
import { Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SearchInputProps {
  value?: string
  onChange?: (value: string) => void
  onSearch?: (value: string) => void
  placeholder?: string
  className?: string
  debounceMs?: number
  showClearButton?: boolean
  disabled?: boolean
  autoFocus?: boolean
}

export default function SearchInput({
  value = '',
  onChange,
  onSearch,
  placeholder = 'Buscar...',
  className,
  debounceMs = 300,
  showClearButton = true,
  disabled = false,
  autoFocus = false
}: SearchInputProps) {
  const [internalValue, setInternalValue] = useState(value)
  const debounceRef = useRef<NodeJS.Timeout>()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setInternalValue(value)
  }, [value])

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus()
    }
  }, [autoFocus])

  const handleInputChange = (newValue: string) => {
    setInternalValue(newValue)
    onChange?.(newValue)

    if (onSearch && debounceMs > 0) {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }

      debounceRef.current = setTimeout(() => {
        onSearch(newValue)
      }, debounceMs)
    } else if (onSearch) {
      onSearch(newValue)
    }
  }

  const handleClear = () => {
    handleInputChange('')
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && onSearch) {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
      onSearch(internalValue)
    }

    if (e.key === 'Escape') {
      handleClear()
    }
  }

  return (
    <div className={cn('relative', className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <input
          ref={inputRef}
          type="text"
          value={internalValue}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            'w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary transition-colors',
            showClearButton && internalValue && 'pr-10',
            disabled && 'bg-gray-50 cursor-not-allowed'
          )}
        />
        {showClearButton && internalValue && !disabled && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            type="button"
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  )
}

// Quick search variant with instant search
export const QuickSearch = ({
  onSearch,
  placeholder = 'Búsqueda rápida...',
  className
}: {
  onSearch: (value: string) => void
  placeholder?: string
  className?: string
}) => (
  <SearchInput
    onSearch={onSearch}
    placeholder={placeholder}
    debounceMs={150}
    className={className}
    autoFocus
  />
)

// Search with suggestions
interface SearchWithSuggestionsProps extends SearchInputProps {
  suggestions?: string[]
  onSuggestionClick?: (suggestion: string) => void
  showSuggestions?: boolean
}

export const SearchWithSuggestions = ({
  suggestions = [],
  onSuggestionClick,
  showSuggestions = true,
  ...searchProps
}: SearchWithSuggestionsProps) => {
  const [showDropdown, setShowDropdown] = useState(false)
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([])

  useEffect(() => {
    if (searchProps.value && suggestions.length > 0) {
      const filtered = suggestions.filter(suggestion =>
        suggestion.toLowerCase().includes(searchProps.value!.toLowerCase())
      )
      setFilteredSuggestions(filtered)
      setShowDropdown(showSuggestions && filtered.length > 0)
    } else {
      setShowDropdown(false)
    }
  }, [searchProps.value, suggestions, showSuggestions])

  const handleSuggestionClick = (suggestion: string) => {
    onSuggestionClick?.(suggestion)
    setShowDropdown(false)
  }

  return (
    <div className="relative">
      <SearchInput
        {...searchProps}
        onFocus={() => setShowDropdown(showSuggestions && filteredSuggestions.length > 0)}
        onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
      />

      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
          {filteredSuggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}