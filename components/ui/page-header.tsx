'use client'

import { ReactNode } from 'react'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PageHeaderProps {
  title: string
  description?: string
  icon?: LucideIcon
  actions?: ReactNode
  className?: string
  containerClassName?: string
}

export default function PageHeader({
  title,
  description,
  icon: Icon,
  actions,
  className,
  containerClassName
}: PageHeaderProps) {
  return (
    <div className={cn("bg-white shadow-sm border-b border-gray-200", className)}>
      <div className={cn("max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", containerClassName)}>
        <div className="flex justify-between items-center py-6">
          <div className="flex items-center gap-4">
            {Icon && (
              <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-blue-600">
                <Icon className="h-6 w-6 text-white" />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
              {description && (
                <p className="text-gray-600 mt-1">{description}</p>
              )}
            </div>
          </div>
          {actions && (
            <div className="flex items-center gap-3">
              {actions}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}