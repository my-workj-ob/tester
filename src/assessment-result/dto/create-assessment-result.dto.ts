import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
} from 'class-validator';

export class CreateAssessmentResultDto {
  @ApiProperty({ description: 'Foydalanuvchi IDsi' })
  @IsNotEmpty()
  @IsNumber()
  userId: number;

  @ApiProperty({ description: 'Baholash IDsi' })
  @IsNotEmpty()
  @IsNumber()
  assessmentId: number;

  @ApiProperty({ description: 'Olingan ball' })
  @IsNotEmpty()
  @IsNumber()
  score: number;

  @ApiProperty({
    description: "Baholashdan o'tdimi yoki yo'q",
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  passed?: boolean;

  @ApiProperty({
    description: 'Foydalanuvchi javoblari (savol IDsi -> javob indeksi)',
    required: false,
  })
  @IsOptional()
  @IsArray()
  answers?: any[];

  @ApiProperty({
    description:
      "Kod topshiriqlari javoblari (kod topshirig'i IDsi -> kiritilgan kod)",
    required: false,
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  codingSubmissions?: { codingChallengeId: number; code: string }[];

  @ApiProperty({ nullable: true })
  completedAt?: Date;
}
