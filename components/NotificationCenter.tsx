'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@clerk/nextjs'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell,
  X,
  Eye,
  EyeOff,
  Check,
  CheckCheck,
  AlertCircle,
  Info,
  Clock,
  User,
  Package,
  DollarSign,
  MessageSquare
} from 'lucide-react'

interface Notification {
  _id: string
  type: string
  title: string
  message: string
  status: 'unread' | 'read' | 'archived'
  metadata?: Record<string, any>
  actionUrl?: string
  createdAt: string
}

const NOTIFICATION_ICONS = {
  order_assigned: Package,
  order_updated: Clock,
  order_completed: Check,
  payment_received: DollarSign,
  message_received: MessageSquare,
  system_alert: AlertCircle,
  support_ticket: Info
}

const NOTIFICATION_COLORS = {
  order_assigned: 'from-blue-500 to-cyan-500',
  order_updated: 'from-orange-500 to-amber-500',
  order_completed: 'from-green-500 to-emerald-500',
  payment_received: 'from-green-500 to-emerald-500',
  message_received: 'from-purple-500 to-pink-500',
  system_alert: 'from-red-500 to-rose-500',
  support_ticket: 'from-indigo-500 to-blue-500'
}

export default function NotificationCenter() {
  const { userId, isLoaded } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isLoaded && userId) {
      fetchNotifications()
      fetchUnreadCount()

      // Poll for new notifications every 30 seconds
      const interval = setInterval(() => {
        fetchUnreadCount()
      }, 30000)

      return () => clearInterval(interval)
    }
  }, [isLoaded, userId])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchNotifications = async () => {
    if (!userId) return

    try {
      setLoading(true)
      const response = await fetch('/api/notifications?limit=20')
      const result = await response.json()

      if (result.success) {
        setNotifications(result.data || [])
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUnreadCount = async () => {
    if (!userId) return

    try {
      const response = await fetch('/api/notifications/unread-count')
      const result = await response.json()

      if (result.success) {
        setUnreadCount(result.data.count)
      }
    } catch (error) {
      console.error('Error fetching unread count:', error)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'mark_read',
          notificationId
        })
      })

      const result = await response.json()

      if (result.success) {
        setNotifications(prev =>
          prev.map(n =>
            n._id === notificationId ? { ...n, status: 'read' as const } : n
          )
        )
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'mark_all_read'
        })
      })

      const result = await response.json()

      if (result.success) {
        setNotifications(prev =>
          prev.map(n => ({ ...n, status: 'read' as const }))
        )
        setUnreadCount(0)
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  const handleNotificationClick = (notification: Notification) => {
    if (notification.status === 'unread') {
      markAsRead(notification._id)
    }

    if (notification.actionUrl) {
      window.location.href = notification.actionUrl
    }
  }

  const getRelativeTime = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return 'Ahora'
    if (diffInMinutes < 60) return `${diffInMinutes}m`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d`
    return date.toLocaleDateString('es-ES')
  }

  if (!isLoaded || !userId) {
    return null
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen)
          if (!isOpen) {
            fetchNotifications()
          }
        }}
        className="relative p-2 rounded-lg glass-icon-container text-gray-600 hover:text-gray-900 transition-colors"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </motion.span>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-96 glass-card rounded-2xl shadow-xl z-50 max-h-96 overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Notificaciones</h3>
                  <p className="text-sm text-gray-600">
                    {unreadCount > 0 ? `${unreadCount} sin leer` : 'Todo al día'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-primary hover:text-primary-dark transition-colors"
                    >
                      Marcar todo como leído
                    </button>
                  )}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-80 overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="w-6 h-6 border-2 border-gray-200 border-t-primary rounded-full animate-spin mx-auto"></div>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                  <h4 className="font-medium text-gray-900 mb-1">No hay notificaciones</h4>
                  <p className="text-sm text-gray-600">Te mantendremos informado cuando algo suceda</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {notifications.map((notification) => {
                    const IconComponent = NOTIFICATION_ICONS[notification.type as keyof typeof NOTIFICATION_ICONS] || Info
                    const colorClass = NOTIFICATION_COLORS[notification.type as keyof typeof NOTIFICATION_COLORS] || 'from-gray-500 to-gray-600'

                    return (
                      <motion.div
                        key={notification._id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                          notification.status === 'unread' ? 'bg-blue-50/50' : ''
                        }`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg bg-gradient-to-br ${colorClass} text-white flex-shrink-0`}>
                            <IconComponent className="h-4 w-4" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className={`font-medium text-sm ${
                                notification.status === 'unread' ? 'text-gray-900' : 'text-gray-700'
                              }`}>
                                {notification.title}
                              </h4>
                              <div className="flex items-center gap-1 flex-shrink-0">
                                <span className="text-xs text-gray-500">
                                  {getRelativeTime(notification.createdAt)}
                                </span>
                                {notification.status === 'unread' && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                )}
                              </div>
                            </div>

                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                              {notification.message}
                            </p>

                            {/* Metadata Display */}
                            {notification.metadata && (
                              <div className="mt-2 flex flex-wrap gap-1">
                                {notification.metadata.amount && (
                                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                                    <DollarSign className="h-3 w-3" />
                                    ${notification.metadata.amount} {notification.metadata.currency || 'MXN'}
                                  </span>
                                )}
                                {notification.metadata.serviceType && (
                                  <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                                    {notification.metadata.serviceType}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-gray-100 bg-gray-50/50">
              <button
                onClick={() => {
                  // Navigate to notifications page if exists
                  setIsOpen(false)
                }}
                className="w-full text-sm text-primary hover:text-primary-dark transition-colors text-center"
              >
                Ver todas las notificaciones
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}