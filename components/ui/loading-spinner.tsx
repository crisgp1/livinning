'use client'

import { LucideIcon, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

type SpinnerSize = 'sm' | 'md' | 'lg' | 'xl'
type SpinnerVariant = 'default' | 'primary' | 'white'

interface LoadingSpinnerProps {
  size?: SpinnerSize
  variant?: SpinnerVariant
  className?: string
  text?: string
  fullScreen?: boolean
  overlay?: boolean
}

const sizeStyles: Record<SpinnerSize, string> = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12'
}

const variantStyles: Record<SpinnerVariant, string> = {
  default: 'text-gray-400',
  primary: 'text-primary',
  white: 'text-white'
}

export default function LoadingSpinner({
  size = 'md',
  variant = 'default',
  className,
  text,
  fullScreen = false,
  overlay = false
}: LoadingSpinnerProps) {
  const spinnerContent = (
    <div className="flex flex-col items-center gap-3">
      <Loader2
        className={cn(
          'animate-spin',
          sizeStyles[size],
          variantStyles[variant],
          className
        )}
      />
      {text && (
        <p className={cn(
          'text-sm',
          variant === 'white' ? 'text-white' : 'text-gray-600'
        )}>
          {text}
        </p>
      )}
    </div>
  )

  if (fullScreen) {
    return (
      <div className={cn(
        'fixed inset-0 flex items-center justify-center z-50',
        overlay ? 'bg-white/80 backdrop-blur-sm' : 'bg-white'
      )}>
        {spinnerContent}
      </div>
    )
  }

  return spinnerContent
}

// Specialized loading components
export const PageLoader = ({ text = 'Cargando...' }: { text?: string }) => (
  <LoadingSpinner
    size="lg"
    variant="primary"
    text={text}
    fullScreen
    overlay
  />
)

export const ButtonLoader = ({ size = 'sm' }: { size?: SpinnerSize }) => (
  <Loader2 className={cn('animate-spin', sizeStyles[size])} />
)

export const CardLoader = ({
  text = 'Cargando...',
  className
}: {
  text?: string
  className?: string
}) => (
  <div className={cn('flex flex-col items-center justify-center p-12', className)}>
    <LoadingSpinner size="lg" variant="primary" text={text} />
  </div>
)

export const InlineLoader = ({
  text,
  size = 'sm'
}: {
  text?: string
  size?: SpinnerSize
}) => (
  <div className="flex items-center gap-2">
    <Loader2 className={cn('animate-spin', sizeStyles[size], 'text-gray-400')} />
    {text && <span className="text-sm text-gray-600">{text}</span>}
  </div>
)

// Loading overlay for existing content
export const LoadingOverlay = ({
  loading,
  children,
  text = 'Cargando...'
}: {
  loading: boolean
  children: React.ReactNode
  text?: string
}) => (
  <div className="relative">
    {children}
    {loading && (
      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10">
        <LoadingSpinner size="lg" variant="primary" text={text} />
      </div>
    )}
  </div>
)

// Skeleton loader components
export const SkeletonLoader = ({
  lines = 3,
  className
}: {
  lines?: number
  className?: string
}) => (
  <div className={cn('space-y-3', className)}>
    {Array.from({ length: lines }).map((_, i) => (
      <div
        key={i}
        className={cn(
          'h-4 bg-gray-200 rounded animate-pulse',
          i === lines - 1 && 'w-3/4'
        )}
      />
    ))}
  </div>
)

export const SkeletonCard = ({ className }: { className?: string }) => (
  <div className={cn('p-6 bg-white rounded-xl border border-gray-100', className)}>
    <div className="space-y-4">
      <div className="h-6 bg-gray-200 rounded animate-pulse w-1/3" />
      <SkeletonLoader lines={2} />
      <div className="flex gap-2">
        <div className="h-8 bg-gray-200 rounded animate-pulse w-20" />
        <div className="h-8 bg-gray-200 rounded animate-pulse w-16" />
      </div>
    </div>
  </div>
)

export const SkeletonTable = ({
  rows = 5,
  columns = 4
}: {
  rows?: number
  columns?: number
}) => (
  <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
    {/* Header */}
    <div className="bg-gray-50 p-4 border-b border-gray-100">
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, i) => (
          <div key={i} className="h-4 bg-gray-200 rounded animate-pulse" />
        ))}
      </div>
    </div>

    {/* Rows */}
    <div className="divide-y divide-gray-100">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="p-4">
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
            {Array.from({ length: columns }).map((_, colIndex) => (
              <div key={colIndex} className="h-4 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
)