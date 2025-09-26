'use client'

import { ReactNode } from 'react'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface InfoCardProps {
  title?: string
  children: ReactNode
  icon?: LucideIcon
  variant?: 'default' | 'bordered' | 'elevated'
  className?: string
  headerClassName?: string
  contentClassName?: string
  actions?: ReactNode
}

const variantStyles = {
  default: 'bg-white border border-gray-100',
  bordered: 'bg-white border-2 border-gray-200',
  elevated: 'bg-white shadow-lg border border-gray-100'
}

export default function InfoCard({
  title,
  children,
  icon: Icon,
  variant = 'default',
  className,
  headerClassName,
  contentClassName,
  actions
}: InfoCardProps) {
  return (
    <div className={cn(
      'rounded-xl overflow-hidden',
      variantStyles[variant],
      className
    )}>
      {(title || Icon || actions) && (
        <div className={cn(
          'px-6 py-4 border-b border-gray-100',
          headerClassName
        )}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {Icon && (
                <div className="p-2 rounded-lg bg-gray-50">
                  <Icon size={20} className="text-gray-600" />
                </div>
              )}
              {title && (
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              )}
            </div>
            {actions && (
              <div className="flex items-center gap-2">
                {actions}
              </div>
            )}
          </div>
        </div>
      )}

      <div className={cn('p-6', contentClassName)}>
        {children}
      </div>
    </div>
  )
}

// Specialized info card variants
export const DetailCard = ({
  label,
  value,
  icon: Icon,
  className
}: {
  label: string
  value: ReactNode
  icon?: LucideIcon
  className?: string
}) => (
  <div className={cn('p-4 bg-gray-50 rounded-lg', className)}>
    <div className="flex items-center gap-2 mb-1">
      {Icon && <Icon size={16} className="text-gray-500" />}
      <span className="text-sm font-medium text-gray-700">{label}</span>
    </div>
    <div className="text-gray-900">{value}</div>
  </div>
)

export const AlertCard = ({
  type = 'info',
  title,
  children,
  icon: Icon
}: {
  type?: 'success' | 'warning' | 'danger' | 'info'
  title?: string
  children: ReactNode
  icon?: LucideIcon
}) => {
  const typeStyles = {
    success: 'bg-green-50 border-green-200 text-green-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    danger: 'bg-red-50 border-red-200 text-red-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800'
  }

  const iconStyles = {
    success: 'text-green-600',
    warning: 'text-yellow-600',
    danger: 'text-red-600',
    info: 'text-blue-600'
  }

  return (
    <div className={cn(
      'p-4 border rounded-lg',
      typeStyles[type]
    )}>
      <div className="flex items-start gap-3">
        {Icon && (
          <Icon size={20} className={cn('mt-0.5', iconStyles[type])} />
        )}
        <div className="flex-1">
          {title && (
            <div className="font-medium mb-1">{title}</div>
          )}
          <div className="text-sm">{children}</div>
        </div>
      </div>
    </div>
  )
}