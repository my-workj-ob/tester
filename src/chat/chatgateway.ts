import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { InjectRepository } from '@nestjs/typeorm';
import { Server, Socket } from 'socket.io';
import { Repository } from 'typeorm';
import { NotificationGateway } from '../notification/notificationGateway';
import { User } from '../user/entities/user.entity';
import { ChatService } from './chat.service';
import { Message } from './entities/chat.entity';

// Define types for message data
interface MessageData {
  senderId: number;
  receiverId: number;
  message: string;
  audioUrl?: string;
  fileUrls?: string[];
}

interface TypingData {
  senderId: number;
  receiverId: number;
  isTyping: boolean;
}

interface BlockData {
  blockerId: number;
  blockedId: number;
}

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:8888', 'https://tester-ajuz.onrender.com'],
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  },
  namespace: '/chat',
  transports: ['websocket', 'polling'],
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  public server: Server;

  private connectedUsers: Map<string, number> = new Map(); // Socket ID to user ID
  private processedMessages: Map<string, number> = new Map(); // Track processed message IDs with timestamps
  // Track last typing state for each sender-receiver pair
  private typingStates: Map<string, boolean> = new Map();
  // Track last emission time for throttling
  private lastEmissionTimes: Map<string, number> = new Map();
  constructor(
    @InjectRepository(Message)
    private readonly chatRepository: Repository<Message>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly notificationGateway: NotificationGateway,
    private readonly chatService: ChatService,
  ) {}

  // Handle new socket connections
  handleConnection(client: Socket): void {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket): void {
    const userId = this.connectedUsers.get(client.id);
    if (userId) {
      // Clean up typing states for this user
      const keysToDelete: string[] = [];
      this.typingStates.forEach((value, key) => {
        if (key.startsWith(`${userId}-`) || key.endsWith(`-${userId}`)) {
          keysToDelete.push(key);
        }
      });
      keysToDelete.forEach((key) => {
        this.typingStates.delete(key);
        this.lastEmissionTimes.delete(key);
      });

      this.connectedUsers.delete(client.id);
      this.server.emit('userOffline', userId);
    }
    console.log(`Client disconnected: ${client.id}`);
  }
  // Handle user joining chat
  @SubscribeMessage('joinChat')
  async handleJoinChat(
    @MessageBody() userId: number,
    @ConnectedSocket() client: Socket,
  ): Promise<{ success: boolean; message?: string }> {
    if (!userId || typeof userId !== 'number') {
      return { success: false, message: 'Invalid user ID' };
    }

    // Leave all existing rooms except the default client room
    const rooms = Array.from(client.rooms).filter((room) => room !== client.id);
    rooms.forEach((room) => client.leave(room));

    // Join user-specific room
    client.join(`user-${userId}`);
    this.connectedUsers.set(client.id, userId);

    // Verify user exists
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      client.leave(`user-${userId}`);
      this.connectedUsers.delete(client.id);
      return { success: false, message: 'User not found' };
    }

    // Broadcast user online status
    this.server.emit('userOnline', userId);

    return { success: true, message: `Joined chat as user ${userId}` };
  }

  // Handle request for online users
  @SubscribeMessage('getOnlineUsers')
  handleGetOnlineUsers(@ConnectedSocket() client: Socket): number[] {
    const onlineUserIds = Array.from(this.connectedUsers.values());
    client.emit('onlineUsers', onlineUserIds);
    return onlineUserIds;
  }

  // Handle sending messages
  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody() body: MessageData,
    @ConnectedSocket() client: Socket,
  ): Promise<{ success: boolean; message?: any; error?: string }> {
    const {
      senderId,
      receiverId,
      message,
      audioUrl = '',
      fileUrls = [],
    } = body;

    // Validate input
    if (
      !senderId ||
      !receiverId ||
      typeof senderId !== 'number' ||
      typeof receiverId !== 'number'
    ) {
      return { success: false, error: 'Invalid sender or receiver ID' };
    }

    const trimmedMessage = message?.trim();
    if (!trimmedMessage && !audioUrl && fileUrls.length === 0) {
      return { success: false, error: 'Message cannot be empty' };
    }

    try {
      const [sender, receiver] = await Promise.all([
        this.userRepository.findOne({ where: { id: senderId } }),
        this.userRepository.findOne({ where: { id: receiverId } }),
      ]);

      if (!sender || !receiver) {
        return { success: false, error: 'Sender or receiver not found' };
      }

      // Create a unique key for deduplication
      const messageKey = `${senderId}-${receiverId}-${trimmedMessage}-${audioUrl}-${fileUrls.join(',')}`;
      const now = Date.now();
      const deduplicationWindow = 1000; // 1-second window to detect duplicates

      // Check for duplicate within the deduplication window
      const lastProcessed = this.processedMessages.get(messageKey) || 0;
      if (lastProcessed && now - lastProcessed < deduplicationWindow) {
        console.warn(`Duplicate message detected: ${messageKey}`);
        return { success: true, message: { id: lastProcessed, ...body } }; // Return the last processed message
      }

      // Save conversation
      await this.chatService.saveConversation(receiverId, senderId);

      // Create and save message
      const chatMessage = this.chatRepository.create({
        sender,
        receiver,
        message: trimmedMessage || '',
        isRead: false,
        timestamp: new Date(),
      });

      const savedMessage = await this.chatRepository.save(chatMessage);

      // Update processed messages
      this.processedMessages.set(messageKey, savedMessage.id);
      // Clean up old processed messages (e.g., keep last 1000 entries)
      if (this.processedMessages.size > 1000) {
        const keys = Array.from(this.processedMessages.keys()).slice(0, 500);
        keys.forEach((key) => this.processedMessages.delete(key));
      }

      // Prepare message data for emission
      const messageData = {
        id: savedMessage.id,
        sender: { id: sender.id, email: sender.email },
        receiver: { id: receiver.id, email: receiver.email },
        message: savedMessage.message,
        isRead: savedMessage.isRead,
        timestamp: savedMessage.timestamp.toISOString(),
      };

      // Emit to receiver
      this.server.to(`user-${receiverId}`).emit('newMessage', messageData);

      // Notify via notification gateway
      await this.notificationGateway.pushAndSave(
        receiverId,
        'MESSAGE',
        messageData.message,
      );

      console.log(`Message sent: ${messageKey}`);
      return { success: true, message: messageData };
    } catch (error) {
      console.error('Error sending message:', error);
      return {
        success: false,
        error: error.message || 'Failed to send message',
      };
    }
  }

  // Handle marking messages as read
  @SubscribeMessage('markMessagesAsRead')
  async markMessagesAsRead(
    @MessageBody() data: { senderId: number; receiverId: number },
    @ConnectedSocket() client: Socket,
  ): Promise<{ success: boolean; error?: string }> {
    const { senderId, receiverId } = data;

    if (
      !senderId ||
      !receiverId ||
      typeof senderId !== 'number' ||
      typeof receiverId !== 'number'
    ) {
      return { success: false, error: 'Invalid sender or receiver ID' };
    }

    try {
      // Update unread messages
      await this.chatRepository.update(
        {
          sender: { id: senderId },
          receiver: { id: receiverId },
          isRead: false,
        },
        { isRead: true },
      );

      // Notify both users
      const eventData = { senderId, receiverId };
      this.server
        .to(`user-${senderId}`)
        .emit('messagesMarkedAsRead', eventData);
      this.server
        .to(`user-${receiverId}`)
        .emit('messagesMarkedAsRead', eventData);

      return { success: true };
    } catch (error) {
      console.error('Error marking messages as read:', error);
      return {
        success: false,
        error: error.message || 'Failed to mark messages as read',
      };
    }
  }

  // Handle fetching unread message counts
  @SubscribeMessage('getUnreadCounts')
  async getUnreadCounts(
    @MessageBody() userId: number,
    @ConnectedSocket() client: Socket,
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    if (!userId || typeof userId !== 'number') {
      return { success: false, error: 'Invalid user ID' };
    }

    try {
      const unreadCounts = await this.chatRepository
        .createQueryBuilder('message')
        .select('message.sender.id', 'userId')
        .addSelect('COUNT(message.id)', 'unreadCount')
        .where('message.receiver.id = :userId', { userId })
        .andWhere('message.isRead = :isRead', { isRead: false })
        .groupBy('message.sender.id')
        .getRawMany();

      client.emit('unreadCounts', unreadCounts);
      return { success: true, data: unreadCounts };
    } catch (error) {
      console.error('Error fetching unread counts:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch unread counts',
      };
    }
  }

  // Handle typing events
  @SubscribeMessage('typing')
  handleTyping(
    @MessageBody() data: TypingData,
    @ConnectedSocket() client: Socket,
  ): void {
    const { senderId, receiverId, isTyping } = data;

    // Validate input
    if (!senderId || !receiverId || typeof isTyping !== 'boolean') {
      console.warn('Invalid typing event data:', data);
      return;
    }

    // Create a unique key for the sender-receiver pair
    const key = `${senderId}-${receiverId}`;

    // Check if the typing state has changed
    const lastState = this.typingStates.get(key);
    if (lastState === isTyping) {
      // No state change; skip emission to avoid duplicates
      return;
    }

    // Throttle emissions (e.g., emit at most once every 500ms)
    const now = Date.now();
    const lastEmissionTime = this.lastEmissionTimes.get(key) || 0;
    const throttleInterval = 500; // 500ms throttle

    if (now - lastEmissionTime < throttleInterval) {
      // Too soon to emit again; skip
      return;
    }

    // Update state and emission time
    this.typingStates.set(key, isTyping);
    this.lastEmissionTimes.set(key, now);

    // Emit the typing event to the receiver
    this.server
      .to(`user-${receiverId}`)
      .emit('userTyping', { senderId, isTyping });

    console.log(`Typing event emitted: ${key}, isTyping: ${isTyping}`);
  }

  // Handle user blocked event
  @SubscribeMessage('userBlocked')
  async handleUserBlocked(
    @MessageBody() data: BlockData,
  ): Promise<{ success: boolean; error?: string }> {
    const { blockerId, blockedId } = data;

    if (
      !blockerId ||
      !blockedId ||
      typeof blockerId !== 'number' ||
      typeof blockedId !== 'number'
    ) {
      return { success: false, error: 'Invalid blocker or blocked ID' };
    }

    try {
      // Verify users exist
      const [blocker, blocked] = await Promise.all([
        this.userRepository.findOne({ where: { id: blockerId } }),
        this.userRepository.findOne({ where: { id: blockedId } }),
      ]);

      if (!blocker || !blocked) {
        return { success: false, error: 'Blocker or blocked user not found' };
      }

      this.server
        .to(`user-${blockedId}`)
        .emit('blocked', { blockerId, blockedId });
      return { success: true };
    } catch (error) {
      console.error('Error handling user blocked:', error);
      return { success: false, error: error.message || 'Failed to block user' };
    }
  }

  // Handle user unblocked event
  @SubscribeMessage('userUnblocked')
  async handleUserUnblocked(
    @MessageBody() data: BlockData,
  ): Promise<{ success: boolean; error?: string }> {
    const { blockerId, blockedId } = data;

    if (
      !blockerId ||
      !blockedId ||
      typeof blockerId !== 'number' ||
      typeof blockedId !== 'number'
    ) {
      return { success: false, error: 'Invalid blocker or blocked ID' };
    }

    try {
      // Verify users exist
      const [blocker, blocked] = await Promise.all([
        this.userRepository.findOne({ where: { id: blockerId } }),
        this.userRepository.findOne({ where: { id: blockedId } }),
      ]);

      if (!blocker || !blocked) {
        return { success: false, error: 'Blocker or blocked user not found' };
      }

      this.server
        .to(`user-${blockedId}`)
        .emit('unblocked', { blockerId, blockedId });
      return { success: true };
    } catch (error) {
      console.error('Error handling user unblocked:', error);
      return {
        success: false,
        error: error.message || 'Failed to unblock user',
      };
    }
  }
}
