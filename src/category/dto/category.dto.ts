import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false, type: 'number' })
  @IsOptional()
  @IsNumber()
  parentId?: number | null;
  @ApiProperty({ required: false, type: 'number' })
  @IsNumber()
  categoryId?: number;
}
