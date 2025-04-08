import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConnectionService } from 'src/connection/connection.service';
import { Connection } from 'src/connection/entity/connection.entity';
import { User } from 'src/user/entities/user.entity';
import { UserModule } from 'src/user/user.module';
import { ExploreController } from './explorer.controller';
import { ExploreService } from './explorer.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Connection]), UserModule],
  controllers: [ExploreController],
  providers: [ExploreService, ConnectionService],
})
export class ExplorerModule {}
