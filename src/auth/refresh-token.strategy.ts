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
      jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
      secretOrKey: 'baxtiyor08072006',
      passReqToCallback: true,
    });
  }

  async validate(req, payload) {
    const refreshToken = req.body.refreshToken;
    const user =
      await this.refreshTokenService.validateRefreshToken(refreshToken);

    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
