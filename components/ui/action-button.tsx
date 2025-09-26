'use client'

import { ReactNode } from 'react'
import { LucideIcon, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

type ButtonVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'ghost'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ActionButtonProps {
  children: ReactNode
  onClick?: () => void
  variant?: ButtonVariant
  size?: ButtonSize
  icon?: LucideIcon
  iconPosition?: 'left' | 'right'
  loading?: boolean
  disabled?: boolean
  className?: string
  type?: 'button' | 'submit' | 'reset'
  title?: string
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-white hover:bg-primary-dark border-primary',
  secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200',
  success: 'bg-green-600 text-white hover:bg-green-700 border-green-600',
  warning: 'bg-orange-600 text-white hover:bg-orange-700 border-orange-600',
  danger: 'bg-red-600 text-white hover:bg-red-700 border-red-600',
  info: 'bg-blue-600 text-white hover:bg-blue-700 border-blue-600',
  ghost: 'bg-transparent text-gray-600 hover:bg-gray-50 border-transparent'
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base'
}

export default function ActionButton({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  className,
  type = 'button',
  title
}: ActionButtonProps) {
  const isDisabled = disabled || loading

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      title={title}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-medium rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {loading && (
        <Loader2 size={16} className="animate-spin" />
      )}

      {!loading && Icon && iconPosition === 'left' && (
        <Icon size={16} />
      )}

      {children}

      {!loading && Icon && iconPosition === 'right' && (
        <Icon size={16} />
      )}
    </button>
  )
}