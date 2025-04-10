import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConnectionService } from './../connection/connection.service';
import { Connection } from './../connection/entity/connection.entity';
import { Notification } from './../notification/entities/notification.entity';
import { NotificationModule } from './../notification/notification.module';
import { NotificationService } from './../notification/notification.service';
import { User } from './../user/entities/user.entity';
import { UserModule } from './../user/user.module';
import { ExploreController } from './explorer.controller';
import { ExploreService } from './explorer.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Connection, Notification]),
    UserModule,
    NotificationModule,
  ],
  controllers: [ExploreController],
  providers: [ExploreService, ConnectionService, NotificationService],
})
export class ExplorerModule {}
