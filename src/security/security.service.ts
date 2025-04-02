/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { Injectable } from '@nestjs/common';
import * as QRCode from 'qrcode';
import * as speakeasy from 'speakeasy';

@Injectable()
export class TwoFactorAuthService {
  generateSecret(userId: number): { secret: string; qrCodeUrl: string } | null {
    try {
      const secret = speakeasy?.generateSecret({
        name: `MyApp (${userId})`,
      });

      if (!secret?.base32 || !secret?.otpauth_url) {
        throw new Error('Failed to generate 2FA secret');
      }

      return {
        secret: secret.base32,
        qrCodeUrl: secret.otpauth_url,
      };
    } catch (error) {
      throw new Error(`Error generating 2FA secret: ${error.message}`);
    }
  }

  async generateQRCode(otpAuthUrl: string): Promise<string> {
    try {
      return await QRCode.toDataURL(otpAuthUrl);
    } catch (error) {
      throw new Error(`Error generating QR Code: ${error.message}`);
    }
  }

  verifyToken(secret: string, token: string): boolean {
    try {
      return speakeasy.totp.verify({
        secret,
        encoding: 'base32',
        token,
      });
    } catch (error) {
      throw new Error(`Error verifying token: ${error.message}`);
    }
  }
}
