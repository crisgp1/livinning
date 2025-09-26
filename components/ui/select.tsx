'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Option {
  value: string
  label: string
  disabled?: boolean
}

interface SelectProps {
  options: Option[]
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  clearable?: boolean
  searchable?: boolean
  multiple?: boolean
  values?: string[]
  onMultiChange?: (values: string[]) => void
}

export default function Select({
  options,
  value = '',
  onChange,
  placeholder = 'Seleccionar...',
  className,
  disabled = false,
  clearable = false,
  searchable = false,
  multiple = false,
  values = [],
  onMultiChange
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const selectRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const filteredOptions = searchable && searchTerm
    ? options.filter(option =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options

  const selectedOption = options.find(opt => opt.value === value)
  const selectedOptions = options.filter(opt => values.includes(opt.value))

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearchTerm('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isOpen, searchable])

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen)
      setSearchTerm('')
    }
  }

  const handleOptionClick = (optionValue: string) => {
    if (multiple && onMultiChange) {
      const newValues = values.includes(optionValue)
        ? values.filter(v => v !== optionValue)
        : [...values, optionValue]
      onMultiChange(newValues)
    } else {
      onChange?.(optionValue)
      setIsOpen(false)
    }
    setSearchTerm('')
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (multiple && onMultiChange) {
      onMultiChange([])
    } else {
      onChange?.('')
    }
  }

  const getDisplayValue = () => {
    if (multiple) {
      if (values.length === 0) return placeholder
      if (values.length === 1) return selectedOptions[0]?.label
      return `${values.length} seleccionados`
    }
    return selectedOption?.label || placeholder
  }

  const hasValue = multiple ? values.length > 0 : !!value

  return (
    <div ref={selectRef} className={cn('relative', className)}>
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={cn(
          'w-full flex items-center justify-between px-4 py-2 border border-gray-200 rounded-lg bg-white text-left transition-colors focus:outline-none focus:border-primary',
          disabled && 'bg-gray-50 cursor-not-allowed',
          !hasValue && 'text-gray-500'
        )}
      >
        <span className="truncate">{getDisplayValue()}</span>
        <div className="flex items-center gap-1">
          {clearable && hasValue && !disabled && (
            <X
              size={16}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              onClick={handleClear}
            />
          )}
          <ChevronDown
            size={16}
            className={cn(
              'text-gray-400 transition-transform',
              isOpen && 'rotate-180'
            )}
          />
        </div>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-hidden">
          {searchable && (
            <div className="p-2 border-b border-gray-100">
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar..."
                className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:border-primary text-sm"
              />
            </div>
          )}

          <div className="max-h-48 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-500 text-center">
                {searchTerm ? 'No se encontraron opciones' : 'No hay opciones disponibles'}
              </div>
            ) : (
              filteredOptions.map((option) => {
                const isSelected = multiple
                  ? values.includes(option.value)
                  : value === option.value

                return (
                  <button
                    key={option.value}
                    onClick={() => !option.disabled && handleOptionClick(option.value)}
                    disabled={option.disabled}
                    className={cn(
                      'w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors',
                      isSelected && 'bg-primary/5 text-primary',
                      option.disabled && 'text-gray-400 cursor-not-allowed hover:bg-transparent'
                    )}
                  >
                    <span className="truncate">{option.label}</span>
                    {isSelected && (
                      <Check size={16} className="text-primary" />
                    )}
                  </button>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// Simple select without advanced features
export const SimpleSelect = ({
  options,
  value,
  onChange,
  placeholder,
  className
}: {
  options: Option[]
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  className?: string
}) => (
  <select
    value={value}
    onChange={(e) => onChange?.(e.target.value)}
    className={cn(
      'w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary transition-colors',
      className
    )}
  >
    {placeholder && (
      <option value="" disabled>
        {placeholder}
      </option>
    )}
    {options.map(option => (
      <option
        key={option.value}
        value={option.value}
        disabled={option.disabled}
      >
        {option.label}
      </option>
    ))}
  </select>
)