import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdatePrivacyDto {
  @ApiProperty({ example: false, description: 'Profil ommaviymi yoki yo‘qmi' })
  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;

  @ApiProperty({
    example: false,
    description: 'Email boshqalarga ko‘rinadimi yoki yo‘qmi',
  })
  @IsBoolean()
  @IsOptional()
  showEmail?: boolean;
}
