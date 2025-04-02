/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  Body,
  Controller,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenService } from './refresh-token.service';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly refreshTokenService: RefreshTokenService,
  ) {}
  @Post('register')
  @ApiOperation({ summary: 'Foydalanuvchini ro‘yxatdan o‘tkazish' })
  @ApiResponse({
    status: 201,
    description: 'Foydalanuvchi muvaffaqiyatli ro‘yxatdan o‘tdi',
  })
  //s
  @ApiResponse({ status: 400, description: 'Xato ma’lumotlar kiritildi' })
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Foydalanuvchini tizimga kiritish' })
  @ApiResponse({ status: 200, description: 'Muvaffaqiyatli login' })
  @ApiResponse({ status: 401, description: 'Noto‘g‘ri email yoki parol' })
  login(@Body() loginDto: LoginDto, @Req() req: Request) {
    const device = req.headers['user-agent'] || 'Unknown Device';
    const location = req.ip || req.socket.remoteAddress || 'Unknown Location';
    return this.authService.login(
      loginDto.email,
      loginDto.password,
      device,
      location,
    );
  }

  @Post('refresh-token')
  @ApiOperation({ summary: 'Refresh token orqali yangi access token olish' })
  @ApiBody({
    description: 'Foydalanuvchi tomonidan yuborilgan refresh token',
    type: RefreshTokenDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Yangi access token muvaffaqiyatli yaratildi',
    schema: {
      example: {
        accessToken: 'newAccessTokenHere',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Refresh token noto‘g‘ri yoki muddati o‘tgan',
    schema: {
      example: {
        message: 'Invalid refresh token',
        error: 'Unauthorized',
        statusCode: 401,
      },
    },
  })
  @Post('refresh-token')
  async refreshToken(@Body('refreshToken') token: string, @Res() res) {
    const user = await this.refreshTokenService.validateRefreshToken(token);
    console.log(user);

    if (!user) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const newAccessToken = await this.authService.generateAccessTokens(user);
    res.json({ accessToken: newAccessToken });
  }
}
