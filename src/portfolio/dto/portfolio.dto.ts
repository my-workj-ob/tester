import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';

export class CreatePortfolioDto {
  @ApiProperty({ example: 'E-commerce Website', description: 'Loyiha nomi' })
  title: string;

  @ApiProperty({
    example: '0',
    description: 'views',
  })
  views: number;

  @ApiProperty({
    example: '0',
    description: 'likesCount',
  })
  likesCount: number;

  @ApiProperty({
    example: '0',
    description: 'commentsCount',
  })
  commentsCount: number;

  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  ownProduct?: boolean;

  @ApiProperty({
    example:
      'A fully responsive e-commerce platform built with Next.js and Tailwind CSS',
    description: 'Loyiha tavsifi',
  })
  description: string;

  @ApiProperty({
    example: ['Next.js', 'React', 'Tailwind CSS'],
    description: 'Loyihaga tegishli texnologiyalar',
  })
  tags: string[];

  @ApiProperty({
    example: 'https://example.com/image.jpg',
    description: 'Loyiha rasmi uchun URL',
  })
  imageUrl: string;

  @ApiProperty({ example: 1, description: 'Foydalanuvchi ID raqami' })
  userId: number;

  @ApiProperty({ example: true, description: 'Own project' })
  @IsOptional()
  ownProject: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUrl()
  liveDemoUrl?: string;

  @ApiProperty({
    type: [String],
    example: [
      'https://example.com/image1.jpg',
      'https://example.com/image2.jpg',
    ],
    description: 'Loyihaga tegishli rasmlar URL ro‘yxati',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiProperty({
    example: '0',
    description: 'categoryId',
  })
  categoryId: number;
}

export class UpdatePortfolioDto {
  @ApiProperty({
    example: 'Updated Portfolio',
    description: 'Portfolio nomi',
    required: false,
  })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({
    example: 'Updated description of the portfolio.',
    description: 'Portfolio haqida ma’lumot',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: ['React', 'Node.js', 'GraphQL'],
    description: 'Yangilangan texnologiyalar',
    required: false,
  })
  @IsArray()
  @IsOptional()
  tags?: string[];

  @ApiProperty({
    example: 'https://example.com/updated-image.jpg',
    description: 'Yangilangan portfolio rasmi URL',
    required: false,
  })
  @IsUrl()
  @IsOptional()
  imageUrl?: string;

  @ApiProperty({
    example: 1,
    description: 'User ID of the owner of the portfolio',
  })
  userId: number;
}
