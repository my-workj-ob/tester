import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateNotificationDto {
  @ApiProperty({
    example: true,
    description: 'Email orqali bildirishnomalar olish',
  })
  @IsBoolean()
  @IsOptional()
  emailNotifications?: boolean;

  @ApiProperty({ example: true, description: 'Push bildirishnomalar olish' })
  @IsBoolean()
  @IsOptional()
  pushNotifications?: boolean;
}
