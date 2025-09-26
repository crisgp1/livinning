'use client'

import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FilterOption {
  value: string
  label: string
}

interface FilterBarProps {
  searchValue?: string
  onSearchChange?: (value: string) => void
  searchPlaceholder?: string
  filters?: {
    label: string
    value: string
    onChange: (value: string) => void
    options: FilterOption[]
  }[]
  onClearFilters?: () => void
  totalCount?: number
  currentCount?: number
  currentPage?: number
  totalPages?: number
  className?: string
}

export default function FilterBar({
  searchValue = '',
  onSearchChange,
  searchPlaceholder = "Buscar...",
  filters = [],
  onClearFilters,
  totalCount,
  currentCount,
  currentPage,
  totalPages,
  className
}: FilterBarProps) {
  return (
    <div className={cn(
      "bg-white rounded-xl shadow-sm border border-gray-100 p-6",
      className
    )}>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search Input */}
        {onSearchChange && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buscar
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
              />
            </div>
          </div>
        )}

        {/* Dynamic Filters */}
        {filters.map((filter, index) => (
          <div key={index}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {filter.label}
            </label>
            <select
              value={filter.value}
              onChange={(e) => filter.onChange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary"
            >
              {filter.options.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        ))}

        {/* Clear Filters Button */}
        {onClearFilters && (
          <div className="flex items-end">
            <button
              onClick={onClearFilters}
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Limpiar Filtros
            </button>
          </div>
        )}
      </div>

      {/* Count and Pagination Info */}
      {(totalCount !== undefined || totalPages !== undefined) && (
        <div className="mt-4 flex justify-between items-center">
          {totalCount !== undefined && currentCount !== undefined && (
            <span className="text-sm text-gray-600">
              Mostrando {currentCount} de {totalCount}
            </span>
          )}
          {totalPages !== undefined && currentPage !== undefined && (
            <div className="text-sm text-gray-500">
              Página {currentPage} de {totalPages}
            </div>
          )}
        </div>
      )}
    </div>
  )
}