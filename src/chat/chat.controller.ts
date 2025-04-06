/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtAuthGuard } from './../auth/guards/jwt-auth.guard';
import { User } from './../user/entities/user.entity';
import { ChatService } from './chat.service';
import { ChatGateway } from './chatgateway';
import { Message } from './entities/chat.entity';

@Controller('chat')
export class ChatController {
  constructor(
    private readonly chatGateway: ChatGateway,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Message)
    private readonly chatRepository: Repository<Message>,
    private readonly chatService: ChatService,
  ) {}
  @UseGuards(JwtAuthGuard)
  @Post('send')
  async sendMessage(
    @Req() req,
    @Body() body: { receiverId: number; message: string },
  ) {
    if (!body.message || body.message.trim() === '') {
      throw new Error('Message cannot be empty');
    }

    const sender = await this.userRepository.findOne({
      where: { id: req.user.userId },
    });

    const receiver = await this.userRepository.findOne({
      where: { id: body.receiverId },
    });

    if (!sender || !receiver) {
      throw new Error('Sender or receiver not found');
    }

    const chatMessage = this.chatRepository.create({
      sender,
      receiver,
      message: body.message,
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

    // **Xabarni `ChatGateway` orqali socket.io ga jo'natish**
    this.chatGateway.server
      .to(`user-${receiver.id}`)
      .emit('newMessage', messageData);
    this.chatGateway.server
      .to(`user-${sender.id}`)
      .emit('newMessage', messageData);

    return { success: true, message: messageData };
  }
  @Get('history/:userId/:receiverId')
  async getChatWithUser(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('receiverId', ParseIntPipe) receiverId: number,
  ) {
    console.log('Fetching chat history for:', { userId, receiverId });

    const chatHistory = await this.chatRepository.find({
      where: [
        { sender: { id: userId }, receiver: { id: receiverId } },
        { sender: { id: receiverId }, receiver: { id: userId } },
      ],
      relations: ['sender', 'receiver'],
      order: { timestamp: 'ASC' },
    });

    console.log('Chat history:', chatHistory);

    return { success: true, chatHistory };
  }

  @Get('unread-count/:userId')
  async getUnreadCount(@Param('userId', ParseIntPipe) userId: number) {
    const unreadCount = await this.chatService.getUnreadCount(userId);
    return { success: true, unreadCount };
  }
}
