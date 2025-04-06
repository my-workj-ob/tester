import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './../user/entities/user.entity';
import { UserService } from './../user/user.service';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ChatGateway } from './chatgateway';
import { Message } from './entities/chat.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Message])],
  providers: [ChatService, ChatGateway, UserService], // PusherService qo‘shildi
  exports: [ChatService, ChatGateway, UserService, TypeOrmModule], // Eksport qilish ham muhim bo‘lishi mumkin
  controllers: [ChatController],
})
export class ChatModule {}
