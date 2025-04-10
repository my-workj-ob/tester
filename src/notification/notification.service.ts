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
    console.log(userId);

    console.log(
      `[NotificationService] Bildirishnoma yaratishga urinish: Foydalanuvchi ID: ${userId}, Turi: ${type}, Xabar: ${message}, Aloqador ID: ${relatedId}`,
    );
    try {
      const notification = this.notificationRepo.create({
        userId,
        type,
        message,
        relatedId,
      });
      const savedNotification = await this.notificationRepo.save(notification);
      console.log(
        `[NotificationService] Bildirishnoma yaratildi. ID: ${savedNotification.id}`,
      );
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

      console.log(
        `[NotificationService] O'qilmagan bildirishnomalar soni (Foydalanuvchi ID: ${userId}): ${count}`,
      );

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
    console.log(
      `[NotificationService] Bildirishnoma o'qilgan deb belgilash. ID: ${notificationId}`,
    );
    try {
      await this.notificationRepo.update(notificationId, { isRead: true });
      console.log(
        `[NotificationService] Bildirishnoma ${notificationId} o'qilgan deb belgilandi.`,
      );
    } catch (error) {
      console.error(
        `[NotificationService] Bildirishnomani o'qilgan deb belgilashda xatolik (ID: ${notificationId}):`,
        error,
      );
      throw error;
    }
  }

  async markAllAsRead(userId: number) {
    console.log(
      `[NotificationService] Barcha bildirishnomalarni o'qilgan deb belgilash. Foydalanuvchi ID: ${userId}`,
    );
    try {
      const updateResult = await this.notificationRepo.update(
        { userId, isRead: false },
        { isRead: true },
      );
      console.log(
        `[NotificationService] ${updateResult.affected} ta bildirishnoma o'qilgan deb belgilandi (Foydalanuvchi ID: ${userId}).`,
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
    console.log(
      `[NotificationService] Foydalanuvchi bildirishnomalarini olish. Foydalanuvchi ID: ${userId}`,
    );
    try {
      const notifications = await this.notificationRepo.find({
        where: { userId },
        order: { createdAt: 'DESC' },
      });
      console.log(
        `[NotificationService] ${notifications.length} ta bildirishnoma topildi (Foydalanuvchi ID: ${userId}).`,
      );
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
