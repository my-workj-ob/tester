import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  InternalServerErrorException,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from './../auth/guards/jwt-auth.guard';
import { TwoFactorAuthService } from './security.service';

class Verify2FADto {
  secret: string;
  token: string;
}

@ApiTags('2FA') // ✅ Swagger UI da "2FA" degan kategoriya ochiladi
@ApiBearerAuth()
@Controller('2fa')
export class TwoFactorAuthController {
  constructor(private readonly twoFactorAuthService: TwoFactorAuthService) {}

  @Post('generate')
  @UseGuards(JwtAuthGuard)
  async generate(@Body('userId') userId: number) {
    try {
      const result = this.twoFactorAuthService.generateSecret(userId);
      if (!result) {
        throw new BadRequestException('Error generating 2FA secret');
      }

      const { secret, qrCodeUrl } = result;
      const qrCode = await this.twoFactorAuthService.generateQRCode(qrCodeUrl);

      return { secret, qrCode };
    } catch (error) {
      console.error('Error in 2FA generation:', error);
      throw new InternalServerErrorException('Failed to generate 2FA secret');
    }
  }

  @Post('verify')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200) // ✅ 200 OK qaytaradi
  @ApiBody({ type: Verify2FADto })
  @ApiResponse({
    status: 200,
    description: 'Tasdiqlash muvaffaqiyatli',
    schema: { example: { success: true } },
  })
  @ApiResponse({
    status: 400,
    description: 'Secret yoki token noto‘g‘ri',
  })
  verify(@Body() body: Verify2FADto) {
    console.log('Received:', body.secret, body.token); // Debug

    if (!body.secret || !body.token) {
      throw new BadRequestException('Secret va token talab qilinadi');
    }

    const isValid = this.twoFactorAuthService.verifyToken(
      body.secret,
      body.token,
    );

    return { success: isValid };
  }
}
