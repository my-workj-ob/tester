/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// chat.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './.../../../user/entities/user.entity';
import { Message } from './entities/chat.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Message) private chatRepository: Repository<Message>,
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async sendMessage(
    body: { receiverId: number; message: string },
    senderId: number,
  ) {
    // Xabar bo'sh emasligini tekshirish
    if (!body.message || body.message.trim() === '') {
      throw new Error('Message cannot be empty');
    }

    // Sender va receiver olish
    const sender = await this.userRepository.findOne({
      where: { id: senderId },
    });
    const receiver = await this.userRepository.findOne({
      where: { id: body.receiverId },
    });

    // Agar sender yoki receiver topilmasa, xatolikni chiqarish
    if (!sender || !receiver) {
      throw new Error('Sender or receiver not found');
    }

    // Yangi message yaratish
    const message = this.chatRepository.create({
      sender, // sender objektini qo'shish
      receiver, // receiver objektini qo'shish
      message: body.message, // body.message ni text sifatida saqlash
      timestamp: new Date(), // Xabar yuborilgan vaqtni olish
    });

    // Ma'lumotlar bazasiga xabarni saqlash
    try {
      await this.chatRepository.save(message);
    } catch (error) {
      console.error('Error saving message to DB:', error);
      throw new Error('Error saving message');
    }

    // Yuborilgan xabarni qaytarish
    const messageData = {
      senderId: sender.id,
      receiverId: receiver.id,
      message: body.message,
      timestamp: message.timestamp.toISOString(),
    };

    return { success: true, message: messageData };
  }

  async incrementUnreadCount(receiverId: number) {
    await this.chatRepository
      .createQueryBuilder()
      .update(Message)
      .set({
        unreadCount: () => 'unreadCount + 1', // Increment unread count
      })
      .where('receiverId = :receiverId AND isRead = false', { receiverId })
      .execute();
  }

  async decrementUnreadCount(receiverId: number) {
    await this.chatRepository
      .createQueryBuilder()
      .update(Message)
      .set({
        unreadCount: () => 'unreadCount - 1', // Decrement unread count
      })
      .where('receiverId = :receiverId AND isRead = false', { receiverId })
      .execute();
  }

  async markMessagesAsRead(senderId: number, receiverId: number) {
    const result = await this.chatRepository.update(
      { sender: { id: senderId }, receiver: { id: receiverId }, isRead: false },
      { isRead: true },
    );

    if (result.affected) {
      // Decrement unread count for receiver after marking as read
      this.decrementUnreadCount(receiverId);
    }
  }

  async getUnreadCount(receiverId: number) {
    const unreadCount = await this.chatRepository
      .createQueryBuilder('message')
      .select('COUNT(message.id)', 'unreadCount')
      .where('message.receiverId = :receiverId AND message.isRead = false', {
        receiverId,
      })
      .getRawOne();

    return unreadCount ? unreadCount.unreadCount : 0;
  }
}
