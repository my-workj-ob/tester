import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../user/user.module';
import { ProfileModule } from './../profile/profile.module';
import { Session } from './../security/entities/session.entity';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RefreshToken } from './entities/refresh-token.entity';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RefreshTokenService } from './refresh-token.service';
import { JwtStrategy } from './strategies/jwt.strategy';
//
@Module({
  imports: [
    TypeOrmModule.forFeature([RefreshToken, Session]),
    JwtModule.register({
      secret: 'baxtiyor08072006',
      signOptions: { expiresIn: '1h' },
    }),
    UserModule,
    ProfileModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, RefreshTokenService, JwtStrategy, JwtAuthGuard],
  exports: [AuthService, JwtAuthGuard],
})
export class AuthModule {}
