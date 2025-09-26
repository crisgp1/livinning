'use client'

import { LucideIcon } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface StatCardProps {
  icon: LucideIcon
  iconGradient?: string
  value: string | number
  label: string
  delay?: number
  className?: string
}

export default function StatCard({
  icon: Icon,
  iconGradient = "from-blue-500 to-cyan-500",
  value,
  label,
  delay = 0,
  className
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={cn(
        "bg-white rounded-xl shadow-sm p-6 border border-gray-100",
        className
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={cn(
          "p-3 rounded-xl bg-gradient-to-br",
          iconGradient
        )}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
      <div className="text-2xl font-bold mb-1 text-gray-900">
        {value}
      </div>
      <div className="text-sm text-gray-600">{label}</div>
    </motion.div>
  )
}