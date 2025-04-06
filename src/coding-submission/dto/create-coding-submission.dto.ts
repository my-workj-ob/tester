import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateCodingSubmissionDto {
  @ApiProperty({ description: 'Foydalanuvchi IDsi' })
  @IsNotEmpty()
  @IsNumber()
  userId: number;

  @ApiProperty({ description: 'Baholash IDsi' })
  @IsNotEmpty()
  @IsNumber()
  assessmentId: number;

  @ApiProperty({ description: 'Kiritilgan kod' })
  @IsNotEmpty()
  @IsString()
  code: string;
}
