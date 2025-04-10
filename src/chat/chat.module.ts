import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './../notification/entities/notification.entity';
import { NotificationModule } from './../notification/notification.module';
import { NotificationService } from './../notification/notification.service';
import { User } from './../user/entities/user.entity';
import { UserService } from './../user/user.service';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ChatGateway } from './chatgateway';
import { Message } from './entities/chat.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Message, Notification]),
    NotificationModule,
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
