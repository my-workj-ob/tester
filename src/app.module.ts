import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { RefreshToken } from './auth/entities/refresh-token.entity';
import { CategoryModule } from './category/category.module';
import { CategoryService } from './category/category.service';
import { Category } from './category/entities/category.entity';
import configuration from './config/configuration';
import { Mentor } from './mentors/entities/mentor.entity';
import { MentorsModule } from './mentors/mentors.module';
import { Project } from './portfolio/entities/project.entity';
import { ProjectController } from './portfolio/portfolio.controller';
import { PortfolioModule } from './portfolio/portfolio.module';
import { Profile } from './profile/entities/profile.entity';
import { ProfileModule } from './profile/profile.module';
import { TwoFactorAuthController } from './security/security.controller';
import { SecurityModule } from './security/security.module';
import { Skill } from './skill/entities/skill.entity';
import { SkillController } from './skill/skill.controller';
import { SkillModule } from './skill/skill.module';
import { SkillService } from './skill/skill.service';
import { User } from './user/entities/user.entity';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      autoLoadEntities: true,
      synchronize: true, // ❗ Production uchun false qo‘ying
      entities: [User, RefreshToken, Profile, Project, Mentor, Category, Skill],
    }),
    AuthModule,
    UserModule,
    ProfileModule,
    PortfolioModule,
    MentorsModule,
    MentorsModule,
    SecurityModule,
    SkillModule,
    CategoryModule,
  ],
  controllers: [
    AppController,
    ProjectController,
    TwoFactorAuthController,
    SkillController,
  ],
  providers: [AppService, SkillService, CategoryService],
})
export class AppModule {}
