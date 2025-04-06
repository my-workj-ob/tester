import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { VerificationStatus } from '../entities/skill.entity';

export class CreateSkillDto {
  @ApiProperty({ description: "Ko'nikma nomi" })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: "Ko'nikma haqida ma'lumot", required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Kategoriya IDsi' })
  @IsNotEmpty()
  @IsNumber()
  categoryId: number;

  @ApiProperty({ description: 'Foydalanuvchi IDsi', required: false })
  @IsOptional()
  @IsNumber()
  userId?: number;

  @ApiProperty({
    enum: VerificationStatus,
    description: 'Tasdiqlash holati (ixtiyoriy)',
    required: false,
    default: VerificationStatus.NOT_VERIFIED,
  })
  @IsOptional()
  @IsEnum(VerificationStatus)
  verificationStatus?: VerificationStatus;
}
