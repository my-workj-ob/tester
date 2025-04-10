import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './../notification/entities/notification.entity';
import { NotificationModule } from './../notification/notification.module';
import { NotificationService } from './../notification/notification.service';
import { User } from './../user/entities/user.entity';
import { UserService } from './../user/user.service';
import { ConnectionController } from './connection.controller';
import { ConnectionService } from './connection.service';
import { Connection } from './entity/connection.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Connection, User, Notification]),
    NotificationModule,
  ],
  controllers: [ConnectionController],
  providers: [ConnectionService, UserService, NotificationService],
  exports: [ConnectionService, NotificationService],
})
export class ConnectionModule {}
