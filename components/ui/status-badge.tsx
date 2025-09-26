'use client'

import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

type StatusVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'primary'
type StatusSize = 'sm' | 'md' | 'lg'

interface StatusBadgeProps {
  children: React.ReactNode
  variant?: StatusVariant
  size?: StatusSize
  icon?: LucideIcon
  className?: string
  dot?: boolean
}

const variantStyles: Record<StatusVariant, string> = {
  success: 'bg-green-100 text-green-800 border-green-200',
  warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  danger: 'bg-red-100 text-red-800 border-red-200',
  info: 'bg-blue-100 text-blue-800 border-blue-200',
  neutral: 'bg-gray-100 text-gray-800 border-gray-200',
  primary: 'bg-primary/10 text-primary border-primary/20'
}

const sizeStyles: Record<StatusSize, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2 py-1 text-xs',
  lg: 'px-3 py-1 text-sm'
}

const dotStyles: Record<StatusVariant, string> = {
  success: 'bg-green-500',
  warning: 'bg-yellow-500',
  danger: 'bg-red-500',
  info: 'bg-blue-500',
  neutral: 'bg-gray-500',
  primary: 'bg-primary'
}

export default function StatusBadge({
  children,
  variant = 'neutral',
  size = 'md',
  icon: Icon,
  className,
  dot = false
}: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-medium rounded-full border',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {dot && (
        <span
          className={cn(
            'w-1.5 h-1.5 rounded-full',
            dotStyles[variant]
          )}
        />
      )}

      {Icon && !dot && (
        <Icon size={size === 'sm' ? 12 : size === 'md' ? 14 : 16} />
      )}

      {children}
    </span>
  )
}

// Predefined status badges for common use cases
export const OrderStatusBadge = ({ status }: { status: string }) => {
  const statusConfig: Record<string, { variant: StatusVariant; label: string }> = {
    pending: { variant: 'warning', label: 'Pendiente' },
    confirmed: { variant: 'info', label: 'Confirmado' },
    in_progress: { variant: 'primary', label: 'En Progreso' },
    completed: { variant: 'success', label: 'Completado' },
    cancelled: { variant: 'danger', label: 'Cancelado' },
    refund_pending: { variant: 'warning', label: 'Reembolso Pendiente' }
  }

  const config = statusConfig[status] || { variant: 'neutral' as StatusVariant, label: status }

  return (
    <StatusBadge variant={config.variant} dot>
      {config.label}
    </StatusBadge>
  )
}

export const PriorityBadge = ({ priority }: { priority: string }) => {
  const priorityConfig: Record<string, { variant: StatusVariant; label: string }> = {
    low: { variant: 'neutral', label: 'Baja' },
    medium: { variant: 'warning', label: 'Media' },
    high: { variant: 'danger', label: 'Alta' },
    urgent: { variant: 'danger', label: 'Urgente' }
  }

  const config = priorityConfig[priority] || { variant: 'neutral' as StatusVariant, label: priority }

  return (
    <StatusBadge variant={config.variant} dot>
      {config.label}
    </StatusBadge>
  )
}