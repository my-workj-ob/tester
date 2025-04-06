import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateAssessmentDto {
  @ApiProperty({ description: 'Baholash nomi' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ description: "Baholash haqida ma'lumot" })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({ description: 'Baholash davomiyligi (daqiqalarda)' })
  @IsNotEmpty()
  @IsNumber()
  duration: number;

  @ApiProperty({ description: "O'tish balli (foizda)" })
  @IsNotEmpty()
  @IsNumber()
  passingScore: number;

  @ApiProperty({
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    description: 'Qiyinlik darajasi',
  })
  @IsNotEmpty()
  @IsEnum(['Beginner', 'Intermediate', 'Advanced'])
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';

  @ApiProperty({ description: "Ko'nikma IDsi" })
  @IsNotEmpty()
  @IsNumber()
  skillId: number;

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
export class AssessmentAnswerDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  questionId: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  selectedOption: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isCorrect?: boolean; // Backend tomonidan aniqlanadi
}
