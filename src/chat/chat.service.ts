/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './.../../../user/entities/user.entity';
import { NotificationGateway } from './../notification/notificationGateway';
import { Message } from './entities/chat.entity';
import { Conversation } from './entities/save-chat-user.entity';
@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Message) private chatRepository: Repository<Message>,
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Conversation)
    private conversationRepository: Repository<Conversation>, // Yangi repository qo'shamiz
    private readonly notificationGateway: NotificationGateway,
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
      sender,
      receiver,
      message: body.message,
      timestamp: new Date(),
    });

    // Ma'lumotlar bazasiga xabarni saqlash
    try {
      await this.chatRepository.save(message);

      // Bildirishnoma yuborish

      // Yuborilgan xabarni qaytarish
      const messageData = {
        senderId: sender.id,
        receiverId: receiver.id,
        message: body.message,
        timestamp: message.timestamp.toISOString(),
      };

      return { success: true, message: messageData };
    } catch (error) {
      console.error('Error saving message to DB:', error);
      throw new Error('Error saving message');
    }
  }

  async saveConversation(user1Id: number, user2Id: number) {
    const user1 = await this.userRepository.findOne({
      where: { id: user1Id },
      relations: ['profile'],
    });
    const user2 = await this.userRepository.findOne({
      where: { id: user2Id },
      relations: ['profile'],
    });

    if (!user1 || !user2) {
      throw new Error('User not found');
    }

    const conversation = this.conversationRepository.create({
      user1,
      user2,
    });

    return this.conversationRepository.save(conversation);
  }
  async getConversations(userId: number) {
    const conversations = await this.conversationRepository
      .createQueryBuilder('conversation')
      .leftJoinAndSelect('conversation.user1', 'user1')
      .leftJoinAndSelect('conversation.user2', 'user2')
      .where(
        'conversation.user1_id = :userId OR conversation.user2_id = :userId',
        { userId },
      )
      .getMany();

    return conversations.map((conversation) => {
      const otherUser =
        conversation.user1.id === userId
          ? conversation.user2
          : conversation.user1;
      return {
        conversationId: conversation.id,
        otherUserId: otherUser.id,
        otherUserName: otherUser.email,
        createdAt: conversation.createdAt,
      };
    });
  }
  async incrementUnreadCount(receiverId: number) {
    await this.chatRepository
      .createQueryBuilder()
      .update(Message)
      .set({
        unreadCount: () => 'unreadCount + 1',
      })
      .where('receiverId = :receiverId AND isRead = false', { receiverId })
      .execute();
  }

  async decrementUnreadCount(receiverId: number) {
    await this.chatRepository
      .createQueryBuilder()
      .update(Message)
      .set({
        unreadCount: () => 'unreadCount - 1',
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
