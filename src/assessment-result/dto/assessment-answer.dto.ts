import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

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
