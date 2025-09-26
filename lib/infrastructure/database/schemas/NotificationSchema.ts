import mongoose, { Schema, Document } from 'mongoose'

export enum NotificationType {
  ORDER_ASSIGNED = 'order_assigned',
  ORDER_UPDATED = 'order_updated',
  ORDER_COMPLETED = 'order_completed',
  ORDER_CANCELLED = 'order_cancelled',
  PAYMENT_RECEIVED = 'payment_received',
  MESSAGE_RECEIVED = 'message_received',
  SYSTEM_ALERT = 'system_alert',
  SUPPORT_TICKET = 'support_ticket'
}

export enum NotificationStatus {
  UNREAD = 'unread',
  READ = 'read',
  ARCHIVED = 'archived'
}

export interface NotificationDocument extends Document {
  _id: string
  userId: string
  userRole: 'client' | 'provider' | 'admin' | 'superadmin'
  type: NotificationType
  title: string
  message: string
  status: NotificationStatus
  metadata?: {
    orderId?: string
    providerId?: string
    clientId?: string
    amount?: number
    serviceType?: string
    [key: string]: any
  }
  actionUrl?: string
  expiresAt?: Date
  createdAt: Date
  updatedAt: Date
}

const NotificationSchema = new Schema<NotificationDocument>({
  _id: { type: String, required: true },
  userId: { type: String, required: true, index: true },
  userRole: {
    type: String,
    enum: ['client', 'provider', 'admin', 'superadmin'],
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: Object.values(NotificationType),
    required: true,
    index: true
  },
  title: { type: String, required: true, trim: true },
  message: { type: String, required: true, trim: true },
  status: {
    type: String,
    enum: Object.values(NotificationStatus),
    default: NotificationStatus.UNREAD,
    index: true
  },
  metadata: {
    type: Schema.Types.Mixed,
    default: {}
  },
  actionUrl: { type: String, trim: true },
  expiresAt: { type: Date, index: true },
  createdAt: { type: Date, default: Date.now, index: true },
  updatedAt: { type: Date, default: Date.now }
})

// Indexes for performance
NotificationSchema.index({ userId: 1, status: 1, createdAt: -1 })
NotificationSchema.index({ userRole: 1, type: 1, createdAt: -1 })
NotificationSchema.index({ expiresAt: 1 }, { sparse: true })

// TTL index for expired notifications
NotificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

// Update timestamp on save
NotificationSchema.pre('save', function(next) {
  this.updatedAt = new Date()
  next()
})

export const NotificationModel = mongoose.models.Notification || mongoose.model<NotificationDocument>('Notification', NotificationSchema)