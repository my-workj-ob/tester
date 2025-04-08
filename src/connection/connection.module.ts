import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';
import { ConnectionController } from './connection.controller';
import { ConnectionService } from './connection.service';
import { Connection } from './entity/connection.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Connection, User])],
  controllers: [ConnectionController],
  providers: [ConnectionService, UserService],
  exports: [ConnectionService],
})
export class ConnectionModule {}
