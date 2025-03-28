import { Module } from '@nestjs/common';
import { TwoFactorAuthController } from './security.controller';
import { TwoFactorAuthService } from './security.service';

@Module({
  providers: [TwoFactorAuthService],
  controllers: [TwoFactorAuthController],
  exports: [TwoFactorAuthService],
})
export class SecurityModule {}
