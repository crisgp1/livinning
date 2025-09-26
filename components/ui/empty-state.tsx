'use client'

import { ReactNode } from 'react'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: ReactNode
  className?: string
  iconClassName?: string
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  iconClassName
}: EmptyStateProps) {
  return (
    <div className={cn("p-12 text-center", className)}>
      {Icon && (
        <Icon className={cn("w-16 h-16 mx-auto text-gray-300 mb-4", iconClassName)} />
      )}
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      {description && (
        <p className="text-gray-600 mb-6">{description}</p>
      )}
      {action && action}
    </div>
  )
}