import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsDate,
  IsOptional,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProjectsDto {
  @ApiProperty({
    description: 'Title of the project',
    example: 'My Awesome Project',
  })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Category ID (numeric)',
    example: 2,
  })
  @IsNotEmpty()
  @IsNumber()
  categoryId: number;

  @ApiProperty({
    description: 'Short description of the project',
    example: 'A platform for connecting developers with ideas.',
  })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({
    description: 'GitHub repository URL',
    example: 'https://github.com/username/project-repo',
  })
  @IsNotEmpty()
  @IsString()
  githubUrl: string;

  @ApiProperty({
    description: 'Live demo URL of the project',
    example: 'https://project-demo.vercel.app',
  })
  @IsNotEmpty()
  @IsString()
  liveDemoUrl: string;

  @ApiProperty({
    description: 'List of technologies used in the project',
    example: ['React', 'Node.js', 'PostgreSQL'],
    type: [String],
  })
  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  technologies: string[];

  @ApiProperty({
    description: 'Project deadline (ISO 8601 format)',
    example: '2025-07-01T00:00:00.000Z',
  })
  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  deadline: Date;

  @ApiProperty({
    description: 'List of image URLs for the project',
    example: [
      'https://example.com/image1.jpg',
      'https://example.com/image2.jpg',
    ],
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiProperty({
    description: 'Number of people in the team',
    example: 5,
    required: false,
    default: 1,
  })
  @IsOptional()
  @IsNumber()
  teamSize?: number;

  @ApiProperty({
    description: 'List of open roles for collaboration',
    example: ['Frontend Developer', 'Backend Developer'],
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  openPositions?: string[];

  @ApiProperty({
    description: 'Current status of the project',
    enum: ['Planning', 'In Progress', 'Recruiting', 'Completed'],
    example: 'Recruiting',
    required: false,
  })
  @IsOptional()
  @IsString()
  status?: 'Planning' | 'In Progress' | 'Recruiting' | 'Completed';
}
