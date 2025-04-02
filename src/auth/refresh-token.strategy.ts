/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { RefreshTokenService } from './refresh-token.service';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(private refreshTokenService: RefreshTokenService) {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'), // Body'dan olish
      secretOrKey: 'baxtiyor08072006',
      passReqToCallback: true, // Request obyektini callbackga o'tkazish
    });
  }

  async validate(req, payload) {
    const refreshToken = req.body.refreshToken; // Body'dan refresh tokenni olish
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is missing');
    }

    // Refresh tokenni tekshirish
    const user =
      await this.refreshTokenService.validateRefreshToken(refreshToken);

    if (!user) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    return user;
  }
}
