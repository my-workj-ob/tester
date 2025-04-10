/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import * as jwt from 'jsonwebtoken';
import { Server } from 'socket.io';
import { NotificationService } from './notification.service';

@WebSocketGateway({
  cors: {
    origin: ['https://tester-ajuz.onrender.com'],
    credentials: true,
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  },
  namespace: '/notifications',
  transports: ['websocket', 'polling'],
})
export class NotificationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private userSockets: Map<number, any> = new Map();

  constructor(private readonly notificationService: NotificationService) {}

  handleConnection(client: any, ...args: any[]) {
    try {
      const token = client.handshake.auth?.token;
      if (!token) {
        client.disconnect();
        return;
      }

      const payload = jwt.verify(
        token,
        process.env.JWT_SECRET || 'baxtiyor08072006',
      ) as unknown as {
        sub: number;
        email: string;
      };

      const userId = payload.sub;
      client.data.userId = userId; // socketda saqlab qo‘yamiz
      client.join(`user-${userId}`);
      this.userSockets.set(userId, client);

      console.log(`[SOCKET] User connected: ${userId}`);
    } catch (error) {
      console.error('[SOCKET] Token verification failed:', error);
      client.disconnect();
    }
  }

  handleDisconnect(client: any) {
    const userId = client.data?.userId;
    if (userId) {
      this.userSockets.delete(userId);
      console.log(`[SOCKET] User disconnected: ${userId}`);
    }
  }

  async pushAndSave(
    userId: number,
    type:
      | 'NEW_CONNECTION'
      | 'MESSAGE'
      | 'ACCEPTED'
      | 'REJECTED'
      | 'CONNECTION_REMOVED'
      | 'OTHER'
      | 'CONNECTION_REQUEST',
    message: string,
  ) {
    const saved = await this.notificationService.createNotification(
      userId,
      type,
      message,
    );
    const count = await this.notificationService.getUnreadCount(userId);

    // Ensure the user is in the socket room before sending a notification
    if (this.userSockets.has(userId)) {
      this.server.to(`user-${userId}`).emit('notification', {
        id: saved.id,
        type,
        message,
        createdAt: saved.createdAt,
        unreadCount: count,
      });
    }
  }
}
