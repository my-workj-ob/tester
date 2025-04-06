import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
export enum SubmissionStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed',
}
export class CodingSubmissionDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  challengeId: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  code: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  passed?: boolean; // Backend tomonidan aniqlanadi
}
