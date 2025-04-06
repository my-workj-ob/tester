import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { VerificationStatus } from '../entities/skill.entity';

export class UpdateSkillDto {
  @ApiProperty({ description: "Ko'nikma nomi (ixtiyoriy)" })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: "Ko'nikma haqida ma'lumot (ixtiyoriy)" })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Kategoriya IDsi (ixtiyoriy)' })
  @IsOptional()
  @IsNumber()
  categoryId?: number;

  @ApiProperty({ description: 'Foydalanuvchi IDsi (ixtiyoriy)' })
  @IsOptional()
  @IsNumber()
  userId?: number;

  @ApiProperty({
    enum: VerificationStatus,
    description: 'Tasdiqlash holati (ixtiyoriy)',
    required: false,
  })
  @IsOptional()
  @IsEnum(VerificationStatus)
  verificationStatus?: VerificationStatus;
}
