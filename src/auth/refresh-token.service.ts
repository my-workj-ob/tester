/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';
import { Repository } from 'typeorm';
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
  }
  async saveRefreshToken(userId: number, token: string) {
    console.log(`🔄 Bazaga saqlanayotgan refresh token: ${token}`);

    // Retrieve the user entity from the database
    const user = await this.userService.findById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    // Create the refresh token entity and associate it with the user
    const refreshTokenEntity = this.refreshTokenRepository.create({
      token: token, // Tokenni saqlaymiz
      user: { id: userId },
    });

    console.log(`💾 Bazaga saqlash uchun entity:`, refreshTokenEntity);

    await this.refreshTokenRepository.save(refreshTokenEntity);
    console.log(`✅ Refresh token bazaga saqlandi`);
  }

  async validateRefreshToken(token: string) {
    console.log('Tekshirilayotgan refresh token:', token);

    try {
      // Tokenni tekshirib ko‘rish
      const decoded = this.jwtService.verify(token, {
        secret: 'baxtiyor08072006', // secretni tekshirish
      });
      console.log('Decoded token:', decoded);
    } catch (e) {
      console.error('Refresh token tekshirishda xato:', e.message);
      return null;
    }

    // Tokenni bazadan tekshirish
    const refreshTokenEntity = await this.refreshTokenRepository.findOne({
      where: { token },
      relations: ['user'],
    });

    if (!refreshTokenEntity) {
      console.error('⚠️ Refresh token bazada topilmadi!');
      return null;
    }

    console.log('✅ Foydalanuvchi topildi:', refreshTokenEntity.user);
    return refreshTokenEntity.user;
  }

  async deleteRefreshToken(token: string): Promise<void> {
    await this.refreshTokenRepository.delete({ token });
  }
}
