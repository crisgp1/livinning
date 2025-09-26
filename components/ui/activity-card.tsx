'use client'

import { LucideIcon, Clock, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'

interface ActivityItem {
  _id: string
  type: 'property' | 'ticket' | 'order' | 'user'
  action: string
  description: string
  timestamp: string
  userId?: string
  userEmail?: string
}

interface ActivityCardProps {
  activities: ActivityItem[]
  title?: string
  maxItems?: number
  delay?: number
  onViewAll?: () => void
  viewAllText?: string
  emptyStateIcon?: LucideIcon
  emptyStateTitle?: string
  emptyStateDescription?: string
  className?: string
}

const ACTIVITY_TYPE_STYLES = {
  property: 'bg-orange-100 text-orange-600',
  ticket: 'bg-blue-100 text-blue-600',
  order: 'bg-purple-100 text-purple-600',
  user: 'bg-green-100 text-green-600'
}

const ACTIVITY_ICONS = {
  property: 'Building2',
  ticket: 'MessageSquare',
  order: 'Package',
  user: 'Users'
}

export default function ActivityCard({
  activities,
  title = 'Actividad Reciente',
  maxItems = 10,
  delay = 0,
  onViewAll,
  viewAllText = 'Ver Todos los Logs',
  emptyStateIcon,
  emptyStateTitle = 'No hay actividad reciente',
  emptyStateDescription = 'La actividad del sistema aparecerá aquí cuando haya eventos.',
  className = ''
}: ActivityCardProps) {
  const EmptyStateIcon = emptyStateIcon || Clock

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
          <Clock className="w-5 h-5 text-gray-400" />
        </div>
      </div>

      <div className="divide-y divide-gray-100">
        {activities.length > 0 ? (
          activities.slice(0, maxItems).map((activity) => (
            <ActivityRow key={activity._id} activity={activity} />
          ))
        ) : (
          <EmptyActivityState
            icon={EmptyStateIcon}
            title={emptyStateTitle}
            description={emptyStateDescription}
          />
        )}
      </div>

      {activities.length > maxItems && onViewAll && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
          <button
            onClick={onViewAll}
            className="flex items-center gap-2 text-sm text-primary hover:text-primary-dark font-medium transition-colors"
          >
            {viewAllText}
            <ArrowRight size={16} />
          </button>
        </div>
      )}
    </motion.div>
  )
}

function ActivityRow({ activity }: { activity: ActivityItem }) {
  return (
    <div className="p-6 hover:bg-gray-50 transition-colors">
      <div className="flex items-start space-x-4">
        <div className={`p-2 rounded-lg ${ACTIVITY_TYPE_STYLES[activity.type]}`}>
          <ActivityTypeIcon type={activity.type} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-900 truncate">
              {activity.action}
            </p>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <Clock size={12} />
              {new Date(activity.timestamp).toLocaleTimeString('es-ES')}
            </p>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            {activity.description}
          </p>
          {activity.userEmail && (
            <p className="text-xs text-gray-500 mt-1">
              Por: {activity.userEmail}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

function ActivityTypeIcon({ type }: { type: ActivityItem['type'] }) {
  // Dynamic import for icons based on type
  const iconMap = {
    property: '🏠',
    ticket: '🎫',
    order: '📦',
    user: '👤'
  }

  return <span className="text-sm">{iconMap[type]}</span>
}

function EmptyActivityState({
  icon: Icon,
  title,
  description
}: {
  icon: LucideIcon
  title: string
  description: string
}) {
  return (
    <div className="p-12 text-center">
      <Icon className="w-12 h-12 mx-auto text-gray-300 mb-4" />
      <h4 className="text-lg font-medium text-gray-900 mb-2">{title}</h4>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}