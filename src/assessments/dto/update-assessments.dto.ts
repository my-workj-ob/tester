import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateAssessmentDto {
  @ApiProperty({ description: 'Baholash nomi (ixtiyoriy)' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ description: "Baholash haqida ma'lumot (ixtiyoriy)" })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Baholash davomiyligi (daqiqalarda, ixtiyoriy)' })
  @IsOptional()
  @IsNumber()
  duration?: number;

  @ApiProperty({ description: "O'tish balli (foizda, ixtiyoriy)" })
  @IsOptional()
  @IsNumber()
  passingScore?: number;

  @ApiProperty({
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    description: 'Qiyinlik darajasi (ixtiyoriy)',
  })
  @IsOptional()
  @IsEnum(['Beginner', 'Intermediate', 'Advanced'])
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';

  @ApiProperty({ description: "Ko'nikma IDsi (ixtiyoriy)" })
  @IsOptional()
  @IsNumber()
  skillId?: number;

  @ApiProperty({
    description: 'Savollar IDlari (ixtiyoriy)',
    type: 'number',
    isArray: true,
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  questionIds?: number[];

  @ApiProperty({
    description: 'Kod topshiriqlari IDlari (ixtiyoriy)',
    type: 'number',
    isArray: true,
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  codingChallengeIds?: number[];
}
