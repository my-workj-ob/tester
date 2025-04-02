/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as jwt from 'jsonwebtoken';
import { Repository } from 'typeorm';
import { User } from './../user/entities/user.entity';
import { UserService } from './../user/user.service';
import { RefreshToken } from './entities/refresh-token.entity';
@Injectable()
export class RefreshTokenService {
  constructor(
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
    private jwtService: JwtService,
    private userService: UserService,
  ) {}

  async generateRefreshToken(user: User): Promise<string> {
    try {
      const refreshToken = this.jwtService.sign(
        { id: user.id },
        { expiresIn: '7d' },
      );

      const newToken = this.refreshTokenRepository.create({
        token: refreshToken,
        user: user,
      });

      await this.refreshTokenRepository.save(newToken);
      return refreshToken;
    } catch (error) {
      throw new Error('Error generating refresh token: ' + error.message);
    }
  }

  async saveRefreshToken(userId: number, token: string) {
    try {
      // Retrieve the user entity from the database
      const user = await this.userService.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Create the refresh token entity and associate it with the user
      const refreshTokenEntity = this.refreshTokenRepository.create({
        token: token,
        user: { id: userId },
      });

      await this.refreshTokenRepository.save(refreshTokenEntity);
    } catch (error) {
      throw new Error('Error saving refresh token: ' + error.message);
    }
  }

  async validateRefreshToken(token: string) {
    try {
      // Tokenni tekshirib ko‘rish
      const decoded = this.jwtService.verify(token, {
        secret: 'baxtiyor08072006', // secretni tekshirish
        ignoreExpiration: false, // Bu parametrni qo'shish, token muddati tugagan bo'lsa xatolikni qaytaradi
      });

      // Dekodlangan tokenni tekshirish
      if (!decoded || !decoded.id) {
        throw new Error('Invalid token');
      }

      // Tokenni bazadan tekshirish
      const refreshTokenEntity = await this.refreshTokenRepository.findOne({
        where: { token },
        relations: ['user'],
      });

      if (!refreshTokenEntity) {
        throw new Error('Refresh token not found in database');
      }

      return refreshTokenEntity.user;
    } catch (e) {
      // Agar token muddati tugagan bo'lsa, aniq xato xabari
      if (e instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedException('Refresh token has expired');
      }

      // Boshqa xatolarni umumiy xato bilan qaytarish
      throw new UnauthorizedException(
        'Refresh token validation error: ' + e.message,
      );
    }
  }

  async deleteRefreshToken(token: string): Promise<void> {
    try {
      await this.refreshTokenRepository.delete({ token });
    } catch (error) {
      throw new Error('Error deleting refresh token: ' + error.message);
    }
  }
}
