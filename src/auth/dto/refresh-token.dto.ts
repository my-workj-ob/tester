import { ApiProperty } from '@nestjs/swagger';

export class RefreshTokenDto {
  @ApiProperty({ example: 'accessToken', description: 'new accessToken' })
  accessToken: string;
}
