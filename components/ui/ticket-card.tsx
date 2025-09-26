'use client'

import { LucideIcon, User, Mail, Tag, UserCheck, MessageSquare } from 'lucide-react'
import { motion } from 'framer-motion'
import { StatusBadge, PriorityBadge } from './status-badge'

interface SupportTicket {
  _id: string
  userId: string
  userEmail: string
  userName: string
  userRole: 'client' | 'provider' | 'admin'
  subject: string
  description: string
  category: 'technical' | 'billing' | 'service' | 'account' | 'other'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  assignedTo?: string
  assignedToName?: string
  tags: string[]
  messages: Array<{
    id: string
    senderId: string
    senderName: string
    senderRole: string
    message: string
    createdAt: string
  }>
  createdAt: string
  updatedAt: string
  resolvedAt?: string
  closedAt?: string
}

interface TicketCardProps {
  ticket: SupportTicket
  onViewDetails: (ticket: SupportTicket) => void
  getTimeAgo: (dateString: string) => string
  index?: number
}

const PRIORITY_COLORS = {
  low: 'bg-gray-100 text-gray-800 border-gray-200',
  medium: 'bg-blue-100 text-blue-800 border-blue-200',
  high: 'bg-orange-100 text-orange-800 border-orange-200',
  urgent: 'bg-red-100 text-red-800 border-red-200'
}

const STATUS_COLORS = {
  open: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  in_progress: 'bg-blue-100 text-blue-800 border-blue-200',
  resolved: 'bg-green-100 text-green-800 border-green-200',
  closed: 'bg-gray-100 text-gray-800 border-gray-200'
}

export default function TicketCard({
  ticket,
  onViewDetails,
  getTimeAgo,
  index = 0
}: TicketCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
      onClick={() => onViewDetails(ticket)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {ticket.subject}
            </h3>
            <div className="flex items-center gap-2">
              <PriorityBadge priority={ticket.priority} />
              <StatusBadge
                status={ticket.status}
                variant={
                  ticket.status === 'open' ? 'warning' :
                  ticket.status === 'in_progress' ? 'info' :
                  ticket.status === 'resolved' ? 'success' :
                  'secondary'
                }
              />
            </div>
          </div>

          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {ticket.description}
          </p>

          <TicketMeta ticket={ticket} />
        </div>

        <TicketSideInfo ticket={ticket} getTimeAgo={getTimeAgo} />
      </div>
    </motion.div>
  )
}

function TicketMeta({ ticket }: { ticket: SupportTicket }) {
  return (
    <div className="flex items-center gap-4 text-sm text-gray-500">
      <div className="flex items-center gap-1">
        <User className="w-4 h-4" />
        <span>{ticket.userName}</span>
      </div>
      <div className="flex items-center gap-1">
        <Mail className="w-4 h-4" />
        <span>{ticket.userEmail}</span>
      </div>
      <div className="flex items-center gap-1">
        <Tag className="w-4 h-4" />
        <span>{ticket.category}</span>
      </div>
      {ticket.assignedToName && (
        <div className="flex items-center gap-1">
          <UserCheck className="w-4 h-4" />
          <span>Asignado a: {ticket.assignedToName}</span>
        </div>
      )}
    </div>
  )
}

function TicketSideInfo({
  ticket,
  getTimeAgo
}: {
  ticket: SupportTicket
  getTimeAgo: (dateString: string) => string
}) {
  return (
    <div className="flex flex-col items-end gap-2">
      <div className="text-sm text-gray-500">
        {getTimeAgo(ticket.createdAt)}
      </div>
      <div className="flex items-center gap-1 text-sm text-gray-500">
        <MessageSquare className="w-4 h-4" />
        <span>{ticket.messages.length}</span>
      </div>
    </div>
  )
}

// Priority Badge Component
export function TicketPriorityBadge({ priority }: { priority: string }) {
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
      PRIORITY_COLORS[priority as keyof typeof PRIORITY_COLORS] || PRIORITY_COLORS.medium
    }`}>
      {priority}
    </span>
  )
}

// Status Badge Component
export function TicketStatusBadge({ status }: { status: string }) {
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
      STATUS_COLORS[status as keyof typeof STATUS_COLORS] || STATUS_COLORS.open
    }`}>
      {status}
    </span>
  )
}