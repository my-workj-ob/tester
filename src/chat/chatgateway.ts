/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { InjectRepository } from '@nestjs/typeorm';
import {
  ConnectedSocket,
  MessageBody,
  type OnGatewayConnection,
  type OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import type { Server, Socket } from 'socket.io';
import type { Repository } from 'typeorm';
import { User } from './../user/entities/user.entity';
import { Message } from './entities/chat.entity';

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3030', 'https://tester-nu-two.vercel.app'],
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  },
  namespace: '/',
  transports: ['websocket', 'polling'],
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  // Store connected users
  private connectedUsers: Map<string, number> = new Map();

  constructor(
    @InjectRepository(Message)
    private readonly chatRepository: Repository<Message>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // Handle new connections
  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  // Handle disconnections
  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);

    // Get the user ID associated with this socket
    const userId = this.connectedUsers.get(client.id);

    if (userId) {
      // Remove from connected users map
      this.connectedUsers.delete(client.id);

      // Broadcast that user is offline
      this.server.emit('userOffline', userId);

      console.log(`User ${userId} is now offline`);
    }
  }

  @SubscribeMessage('joinChat')
  handleJoinChat(
    @MessageBody() userId: number,
    @ConnectedSocket() client: Socket,
  ) {
    console.log(`User ${userId} joining chat with socket ${client.id}`);

    // Join user's room for private messages
    client.join(`user-${userId}`);

    // Store the user ID with this socket connection
    this.connectedUsers.set(client.id, userId);

    // Broadcast that user is online
    this.server.emit('userOnline', userId);

    // Log all connected users
    console.log('Connected users:', Array.from(this.connectedUsers.entries()));

    return { success: true, message: `Joined chat as user ${userId}` };
  }

  @SubscribeMessage('getOnlineUsers')
  handleGetOnlineUsers(@ConnectedSocket() client: Socket) {
    // Get all online user IDs
    const onlineUserIds = Array.from(this.connectedUsers.values());

    // Send the list to the requesting client
    client.emit('onlineUsers', onlineUserIds);

    console.log('Sent online users list:', onlineUserIds);
    return onlineUserIds;
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody()
    body: { senderId: number; receiverId: number; message: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { senderId, receiverId, message } = body;
    console.log('Received message:', body);

    if (!message || message.trim() === '') {
      return { success: false, message: 'Message cannot be empty' };
    }

    try {
      const sender = await this.userRepository.findOne({
        where: { id: senderId },
      });
      const receiver = await this.userRepository.findOne({
        where: { id: receiverId },
      });

      if (!sender || !receiver) {
        console.error('Sender or receiver not found:', {
          senderId,
          receiverId,
        });
        return { success: false, message: 'Sender or receiver not found' };
      }

      const chatMessage = this.chatRepository.create({
        sender,
        receiver,
        message,
        isRead: false,
        timestamp: new Date(),
      });

      const savedMessage = await this.chatRepository.save(chatMessage);

      const messageData = {
        id: savedMessage.id,
        sender: {
          id: sender.id,
          email: sender.email,
        },
        receiver: {
          id: receiver.id,
          email: receiver.email,
        },
        message: savedMessage.message,
        isRead: savedMessage.isRead,
        timestamp: savedMessage.timestamp.toISOString(),
      };

      console.log(
        'Emitting message to rooms:',
        `user-${receiverId}`,
        `user-${senderId}`,
      );

      // Socket.io orqali xabarni yetkazish
      this.server.to(`user-${receiverId}`).emit('newMessage', messageData);
      this.server.to(`user-${senderId}`).emit('newMessage', messageData);

      return { success: true, message: messageData };
    } catch (error) {
      console.error('Error sending message:', error);
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('markMessagesAsRead')
  async markMessagesAsRead(
    @MessageBody() data: { senderId: number; receiverId: number },
    @ConnectedSocket() client: Socket,
  ) {
    const { senderId, receiverId } = data;

    console.log('Marking messages as read:', data);

    try {
      // Обновить сообщения в базе данных
      await this.chatRepository.update(
        {
          sender: { id: senderId },
          receiver: { id: receiverId },
          isRead: false,
        },
        { isRead: true },
      );

      // Отправить уведомление обоим пользователям
      this.server
        .to(`user-${senderId}`)
        .emit('messagesMarkedAsRead', { senderId, receiverId });
      this.server
        .to(`user-${receiverId}`)
        .emit('messagesMarkedAsRead', { senderId, receiverId });

      return { success: true };
    } catch (error) {
      console.error('Error marking messages as read:', error);
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('getUnreadCounts')
  async getUnreadCounts(
    @MessageBody() userId: number,
    @ConnectedSocket() client: Socket,
  ) {
    console.log('Getting unread counts for user:', userId);

    try {
      // Получить количество непрочитанных сообщений для каждого отправителя
      const unreadCounts = await this.chatRepository
        .createQueryBuilder('message')
        .select('message.sender.id', 'userId')
        .addSelect('COUNT(message.id)', 'unreadCount')
        .where('message.receiver.id = :userId', { userId })
        .andWhere('message.isRead = :isRead', { isRead: false })
        .groupBy('message.sender.id')
        .getRawMany();

      console.log('Unread counts:', unreadCounts);

      // Отправить результат клиенту
      client.emit('unreadCounts', unreadCounts);

      return unreadCounts;
    } catch (error) {
      console.error('Error getting unread counts:', error);
      return { success: false, error: error.message };
    }
  }
}
