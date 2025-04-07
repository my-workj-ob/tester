import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from '../user/user.service'; // Agar UserService kerak bo'lsa
import { User } from './../user/entities/user.entity';
import { Job } from './entity/jobs.entity';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';

@Module({
  imports: [TypeOrmModule.forFeature([Job, User])], // Job entityni import qilamiz
  controllers: [JobsController],
  providers: [JobsService, UserService],
  exports: [JobsService],
})
export class JobsModule {}
