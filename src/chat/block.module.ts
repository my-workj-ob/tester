import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from 'src/notification/entities/notification.entity';
import { NotificationService } from 'src/notification/notification.service';
import { NotificationGateway } from 'src/notification/notificationGateway';
import { User } from '../user/entities/user.entity';
import { BlockController } from './block.controller';
import { BlockService } from './block.service';
import { ChatService } from './chat.service';
import { ChatGateway } from './chatgateway';
import { Block } from './entities/block-user.entity';
import { Message } from './entities/chat.entity';
import { Conversation } from './entities/save-chat-user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Block,
      User,
      Notification,
      Message,
      Conversation,
    ]),
  ],
  providers: [
    BlockService,
    ChatGateway,
    NotificationGateway,
    ChatService,
    NotificationService,
  ],
  controllers: [BlockController],
  exports: [BlockService],
})
export class BlockModule {}
