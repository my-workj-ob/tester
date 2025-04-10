import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';

export type NotificationType =
  | 'NEW_CONNECTION'
  | 'MESSAGE'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'CONNECTION_REMOVED'
  | 'OTHER'
  | 'CONNECTION_REQUEST';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>,
  ) {}

  async createNotification(
    userId: number,
    type: NotificationType,
    message: string,
    relatedId?: number,
  ) {
    try {
      const notification = this.notificationRepo.create({
        userId,
        type,
        message,
        relatedId,
      });
      const savedNotification = await this.notificationRepo.save(notification);

      return savedNotification;
    } catch (error) {
      console.error(
        `[NotificationService] Bildirishnoma yaratishda xatolik:`,
        error,
      );
      throw error;
    }
  }

  async getUnreadCount(userId: number) {
    try {
      const count = await this.notificationRepo.count({
        where: { userId, isRead: false },
      });

      return count;
    } catch (error) {
      console.error(
        `[NotificationService] O'qilmagan bildirishnomalar sonini olishda xatolik (Foydalanuvchi ID: ${userId}):`,
        error instanceof Error ? error.message : error,
      );
      throw new Error(
        `O'qilmagan bildirishnomalar sonini olishda xatolik: ${error}`,
      );
    }
  }

  async markAsRead(notificationId: number) {
    try {
      await this.notificationRepo.update(notificationId, { isRead: true });
    } catch (error) {
      console.error(
        `[NotificationService] Bildirishnomani o'qilgan deb belgilashda xatolik (ID: ${notificationId}):`,
        error,
      );
      throw error;
    }
  }

  async markAllAsRead(userId: number) {
    try {
      await this.notificationRepo.update(
        { userId, isRead: false },
        { isRead: true },
      );
    } catch (error) {
      console.error(
        `[NotificationService] Barcha bildirishnomalarni o'qilgan deb belgilashda xatolik (Foydalanuvchi ID: ${userId}):`,
        error,
      );
      throw error;
    }
  }

  async getUserNotifications(userId: number) {
    try {
      const notifications = await this.notificationRepo.find({
        where: { userId },
        order: { createdAt: 'DESC' },
      });

      return notifications;
    } catch (error) {
      console.error(
        `[NotificationService] Foydalanuvchi bildirishnomalarini olishda xatolik (Foydalanuvchi ID: ${userId}):`,
        error,
      );
      throw error;
    }
  }
}
