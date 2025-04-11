import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './../chat/entities/chat.entity';
import { ConnectionService } from './../connection/connection.service';
import { Connection } from './../connection/entity/connection.entity';
import { UploadService } from './../file/uploadService';
import { Notification } from './../notification/entities/notification.entity';
import { NotificationService } from './../notification/notification.service';
import { NotificationGateway } from './../notification/notificationGateway';
import { Skill } from './../skill/entities/skill.entity';
import { ProfileStat } from './../user/entities/profile-stat.entity';
import { User } from './../user/entities/user.entity';
import { UserService } from './../user/user.service';
import { Profile } from './entities/profile.entity';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Profile,
      Skill,
      User,
      Profile,
      ProfileStat,
      Connection,
      Notification,
      Message,
    ]),
  ],
  controllers: [ProfileController],
  providers: [
    ProfileService,
    UploadService,
    UserService,
    ConnectionService,
    NotificationGateway,
    NotificationService,
  ],
  exports: [TypeOrmModule, ProfileService, UploadService], // Export qilish kerak
})
export class ProfileModule {}
