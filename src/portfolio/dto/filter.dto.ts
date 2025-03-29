/* eslint-disable @typescript-eslint/no-unsafe-return */
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class PortfolioFilterDto {
  @ApiPropertyOptional({ type: Number, description: 'User ID' })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  userId?: number;

  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.split(',') : value,
  )
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ type: Boolean, description: 'Own product filter' })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  ownProduct?: boolean;

  @ApiPropertyOptional({ type: Number, description: 'Minimum likes count' })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  likesCount?: number;

  @ApiPropertyOptional({ type: Number, description: 'Minimum views count' })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  views?: number;

  @ApiPropertyOptional({ type: String, description: 'Category filter' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Sorting: trending, newest, most_liked, most_viewed',
  })
  @IsOptional()
  @IsString()
  sortBy?: 'trending' | 'newest' | 'most_liked' | 'most_viewed' | 'category';
}
