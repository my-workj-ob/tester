import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UploadService } from './../file/uploadService';
import { Skill } from './../skill/entities/skill.entity';
import { ProfileStat } from './../user/entities/profile-stat.entity';
import { User } from './../user/entities/user.entity';
import { Profile } from './entities/profile.entity';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Profile, Skill, User, Profile, ProfileStat]),
  ],
  controllers: [ProfileController],
  providers: [ProfileService, UploadService],
  exports: [TypeOrmModule, ProfileService, UploadService], // Export qilish kerak
})
export class ProfileModule {}
