import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional, // 👈 Qo'shish
  IsString,
} from 'class-validator';

export class UpdateQuestionDto {
  @ApiProperty({ description: 'Savol matni' })
  @IsNotEmpty()
  @IsString()
  text: string;

  @ApiProperty({ description: 'Javob variantlari' })
  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  options: string[];

  @ApiProperty({ description: "To'g'ri javob indeksi (0-based)" })
  @IsNotEmpty()
  @IsNumber()
  correctAnswer: number;

  @ApiProperty({ description: "Ko'nikma IDsi", required: false }) // required: false qo'shish
  @IsOptional() // 👈 Qo'shish
  @IsNumber()
  skillId?: number;

  @ApiProperty({ description: 'Kategoriya IDsi' })
  @IsNotEmpty()
  @IsNumber()
  categoryId: number;
}
