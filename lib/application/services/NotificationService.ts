import { v4 as uuidv4 } from 'uuid'
import connectDB from '@/lib/infrastructure/database/connection'
import NotificationModel, {
  NotificationType,
  NotificationStatus,
  NotificationDocument
} from '@/lib/infrastructure/database/models/NotificationModel'
import logger from '@/lib/utils/logger'

export interface CreateNotificationData {
  userId: string
  userRole: 'client' | 'provider' | 'admin' | 'superadmin'
  type: NotificationType
  title: string
  message: string
  metadata?: Record<string, any>
  actionUrl?: string
  expiresAt?: Date
}

export class NotificationService {
  static async createNotification(data: CreateNotificationData): Promise<NotificationDocument | null> {
    try {
      await connectDB()

      const notification = new NotificationModel({
        _id: uuidv4(),
        userId: data.userId,
        userRole: data.userRole,
        type: data.type,
        title: data.title,
        message: data.message,
        status: NotificationStatus.UNREAD,
        metadata: data.metadata || {},
        actionUrl: data.actionUrl,
        expiresAt: data.expiresAt,
        createdAt: new Date(),
        updatedAt: new Date()
      })

      await notification.save()

      logger.info('NotificationService', `Created notification ${notification._id} for user ${data.userId}`, {
        type: data.type,
        userId: data.userId,
        userRole: data.userRole
      })

      return notification

    } catch (error) {
      logger.error('NotificationService', 'Failed to create notification', error, { data })
      return null
    }
  }

  static async getUserNotifications(
    userId: string,
    status?: NotificationStatus,
    limit: number = 20,
    offset: number = 0
  ): Promise<{ notifications: NotificationDocument[]; total: number }> {
    try {
      await connectDB()

      const filter: any = { userId }
      if (status) {
        filter.status = status
      }

      const [notifications, total] = await Promise.all([
        NotificationModel
          .find(filter)
          .sort({ createdAt: -1 })
          .limit(limit)
          .skip(offset)
          .lean(),
        NotificationModel.countDocuments(filter)
      ])

      return { notifications: notifications as NotificationDocument[], total }

    } catch (error) {
      logger.error('NotificationService', 'Failed to fetch user notifications', error, { userId })
      return { notifications: [], total: 0 }
    }
  }

  static async markAsRead(notificationId: string, userId: string): Promise<boolean> {
    try {
      await connectDB()

      const result = await NotificationModel.updateOne(
        { _id: notificationId, userId },
        {
          status: NotificationStatus.READ,
          updatedAt: new Date()
        }
      )

      return result.matchedCount > 0

    } catch (error) {
      logger.error('NotificationService', 'Failed to mark notification as read', error, {
        notificationId,
        userId
      })
      return false
    }
  }

  static async markAllAsRead(userId: string): Promise<boolean> {
    try {
      await connectDB()

      await NotificationModel.updateMany(
        { userId, status: NotificationStatus.UNREAD },
        {
          status: NotificationStatus.READ,
          updatedAt: new Date()
        }
      )

      return true

    } catch (error) {
      logger.error('NotificationService', 'Failed to mark all notifications as read', error, { userId })
      return false
    }
  }

  static async getUnreadCount(userId: string): Promise<number> {
    try {
      await connectDB()

      const count = await NotificationModel.countDocuments({
        userId,
        status: NotificationStatus.UNREAD
      })

      return count

    } catch (error) {
      logger.error('NotificationService', 'Failed to get unread count', error, { userId })
      return 0
    }
  }

  // Specific notification creators for different scenarios
  static async notifyProviderOfNewOrder(
    providerId: string,
    orderId: string,
    clientName: string,
    serviceType: string,
    amount: number,
    currency: string
  ): Promise<void> {
    await this.createNotification({
      userId: providerId,
      userRole: 'provider',
      type: NotificationType.ORDER_ASSIGNED,
      title: '¡Nueva orden asignada!',
      message: `${clientName} ha solicitado un servicio de ${serviceType} por $${amount} ${currency}. Revisa los detalles y comienza el trabajo.`,
      metadata: {
        orderId,
        clientName,
        serviceType,
        amount,
        currency
      },
      actionUrl: `/provider-dashboard/orders/${orderId}`
    })
  }

  static async notifyClientOfOrderUpdate(
    clientId: string,
    orderId: string,
    providerName: string,
    status: string,
    message: string
  ): Promise<void> {
    await this.createNotification({
      userId: clientId,
      userRole: 'client',
      type: NotificationType.ORDER_UPDATED,
      title: 'Actualización de tu orden',
      message: `${providerName} ha actualizado tu orden: ${message}`,
      metadata: {
        orderId,
        providerName,
        status
      },
      actionUrl: `/dashboard/orders/${orderId}`
    })
  }

  static async notifyAdminOfNewOrder(
    orderId: string,
    clientName: string,
    serviceType: string,
    amount: number
  ): Promise<void> {
    // Get all admin users - you may need to implement this based on your user management
    // For now, we'll create a placeholder that can be extended
    await this.createNotification({
      userId: 'admin-system', // This would be replaced with actual admin user IDs
      userRole: 'admin',
      type: NotificationType.SYSTEM_ALERT,
      title: 'Nueva orden en el sistema',
      message: `${clientName} ha creado una nueva orden de ${serviceType} por $${amount}. Orden ID: ${orderId}`,
      metadata: {
        orderId,
        clientName,
        serviceType,
        amount
      },
      actionUrl: `/superadmin/orders/${orderId}`
    })
  }

  static async notifyProviderOfPaymentReceived(
    providerId: string,
    orderId: string,
    amount: number,
    currency: string
  ): Promise<void> {
    await this.createNotification({
      userId: providerId,
      userRole: 'provider',
      type: NotificationType.PAYMENT_RECEIVED,
      title: 'Pago confirmado',
      message: `Se ha confirmado el pago de $${amount} ${currency} para la orden ${orderId}. Puedes comenzar el trabajo.`,
      metadata: {
        orderId,
        amount,
        currency
      },
      actionUrl: `/provider-dashboard/orders/${orderId}`
    })
  }

  static async cleanupExpiredNotifications(): Promise<void> {
    try {
      await connectDB()

      const result = await NotificationModel.deleteMany({
        expiresAt: { $lte: new Date() }
      })

      logger.info('NotificationService', `Cleaned up ${result.deletedCount} expired notifications`)

    } catch (error) {
      logger.error('NotificationService', 'Failed to cleanup expired notifications', error)
    }
  }
}