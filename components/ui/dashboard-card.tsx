'use client'

import { motion } from 'framer-motion'
import { LucideIcon, ArrowRight } from 'lucide-react'
import { Button } from './button'

interface DashboardCardProps {
  title: string
  icon: LucideIcon
  children: React.ReactNode
  actions?: React.ReactNode
  delay?: number
  className?: string
  onViewMore?: () => void
  viewMoreText?: string
}

export default function DashboardCard({
  title,
  icon: Icon,
  children,
  actions,
  delay = 0,
  className = '',
  onViewMore,
  viewMoreText = 'Ver Más'
}: DashboardCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`bg-white rounded-xl shadow-sm border border-gray-100 ${className}`}
    >
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <div className="flex items-center gap-3">
            <Icon className="w-5 h-5 text-gray-400" />
            {actions}
          </div>
        </div>
      </div>

      <div className="p-6">
        {children}
      </div>

      {onViewMore && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
          <button
            onClick={onViewMore}
            className="flex items-center gap-2 text-sm text-primary hover:text-primary-dark font-medium transition-colors"
          >
            {viewMoreText}
            <ArrowRight size={16} />
          </button>
        </div>
      )}
    </motion.div>
  )
}

// Metric Row Component for consistent data display
interface MetricRowProps {
  label: string
  value: string | number
  valueColor?: string
}

export function MetricRow({ label, value, valueColor = 'text-gray-900' }: MetricRowProps) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-600">{label}</span>
      <span className={`font-semibold ${valueColor}`}>{value}</span>
    </div>
  )
}