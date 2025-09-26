'use client'

import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'

interface MetricCardProps {
  icon: LucideIcon
  iconGradient: string
  value: string | number
  label: string
  badge?: {
    text: string
    color: string
  }
  subtitle?: string
  delay?: number
  className?: string
}

export default function MetricCard({
  icon: Icon,
  iconGradient,
  value,
  label,
  badge,
  subtitle,
  delay = 0,
  className = ''
}: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`bg-white rounded-xl shadow-sm p-6 border border-gray-100 ${className}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl bg-gradient-to-br ${iconGradient}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        {badge && (
          <span className={`text-xs px-2 py-1 rounded-full ${badge.color}`}>
            {badge.text}
          </span>
        )}
      </div>

      <div className="text-3xl font-bold mb-1 text-gray-900">
        {value}
      </div>

      <div className="text-sm text-gray-600 mb-2">
        {label}
      </div>

      {subtitle && (
        <div className="text-xs text-gray-500">
          {subtitle}
        </div>
      )}
    </motion.div>
  )
}