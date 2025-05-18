import { Module } from '@nestjs/common';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Projects } from './entities/create-projecs.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Projects])], // <-- BU MUHIM
  controllers: [ProjectsController],
  providers: [ProjectsService],
})
export class ProjectsModule {}
