import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { SubmissionStatus } from '../entities/coding-submission.entity';

export class UpdateCodingSubmissionDto {
  @ApiProperty({ description: 'Kiritilgan kod (ixtiyoriy)' })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiProperty({ enum: SubmissionStatus, description: 'Status (ixtiyoriy)' })
  @IsOptional()
  @IsEnum(SubmissionStatus)
  status?: SubmissionStatus;

  @ApiProperty({ description: 'Natija (ixtiyoriy)' })
  @IsOptional()
  @IsString()
  result?: string;
}
