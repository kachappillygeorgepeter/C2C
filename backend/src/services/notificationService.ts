import { prisma } from '../lib/prisma'
import { NotificationType } from '@prisma/client'

export class NotificationService {
  async notifyUser(userId: string, type: NotificationType, title: string, message: string, link?: string) {
    return prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        link
      }
    })
  }

  async getUserNotifications(userId: string, unreadOnly = false) {
    return prisma.notification.findMany({
      where: {
        userId,
        ...(unreadOnly ? { isRead: false } : {})
      },
      orderBy: { createdAt: 'desc' }
    })
  }

  async markAsRead(id: string, userId: string) {
    return prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true }
    })
  }

  async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true }
    })
  }
}

export const notificationService = new NotificationService()
