import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './../notification/entities/notification.entity';
import { NotificationModule } from './../notification/notification.module';
import { NotificationService } from './../notification/notification.service';
import { User } from './../user/entities/user.entity';
import { UserService } from './../user/user.service';
import { BlockModule } from './block.module';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ChatGateway } from './chatgateway';
import { Message } from './entities/chat.entity';
import { Conversation } from './entities/save-chat-user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Message, Notification, Conversation]),
    NotificationModule,
    BlockModule,
  ],
  providers: [ChatService, ChatGateway, UserService, NotificationService],
  exports: [
    ChatService,
    ChatGateway,
    UserService,
    TypeOrmModule,
    NotificationService,
  ],
  controllers: [ChatController],
})
export class ChatModule {}
