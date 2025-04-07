import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateJobDto {
  @ApiProperty({
    description: 'Title of the job',
    example: 'Software Engineer',
  })
  @IsNotEmpty()
  @IsString()
  jobTitle: string;

  @ApiProperty({
    description: 'Company name offering the job',
    example: 'Tech Corp',
  })
  @IsNotEmpty()
  @IsString()
  companyName: string;

  @ApiProperty({
    description: 'Website of the company',
    example: 'https://techcorp.com',
    required: false,
  })
  @IsOptional()
  @IsString()
  companyWebsite?: string;

  @ApiProperty({
    description: 'Type of the job (e.g., Full-time, Part-time)',
    example: 'Full-time',
  })
  @IsNotEmpty()
  @IsEnum(['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship'])
  jobType: string;

  @ApiProperty({
    description: 'Experience level required',
    example: 'Mid-level',
  })
  @IsNotEmpty()
  @IsString()
  experienceLevel: string;

  @ApiProperty({
    description: 'Location type (Remote, On-site, Hybrid)',
    example: 'Remote',
  })
  @IsNotEmpty()
  @IsEnum(['Remote', 'On-site', 'Hybrid'])
  locationType: string;

  @ApiProperty({ description: 'Job location', example: 'New York, USA' })
  @IsNotEmpty()
  @IsString()
  location: string;

  @ApiProperty({
    description: 'Minimum salary for the job',
    example: 50000,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  salaryMin?: number;

  @ApiProperty({
    description: 'Maximum salary for the job',
    example: 100000,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  salaryMax?: number;

  @ApiProperty({
    description: 'Salary period (e.g., monthly, yearly)',
    example: 'yearly',
    required: false,
  })
  @IsOptional()
  @IsString()
  salaryPeriod?: string;

  @ApiProperty({
    description: 'Deadline for job applications',
    example: '2025-12-31T18:59:59-05:00', // ISO 8601 formatidagi misol
    required: false,
  })
  @IsOptional()
  @IsDateString()
  applicationDeadline?: Date;

  @ApiProperty({
    description: 'Skills required for the job',
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  requiredSkills?: string[];

  @ApiProperty({
    description: 'Detailed description of the job',
    example: 'We are looking for a skilled software engineer to join our team.',
  })
  @IsNotEmpty()
  @IsString()
  jobDescription: string;

  @ApiProperty({
    description: 'Instructions for applying to the job',
    example: 'Send your resume to hr@techcorp.com',
    required: false,
  })
  @IsOptional()
  @IsString()
  applicationInstructions?: string;

  @ApiProperty({
    description: 'Whether Easy Apply is enabled',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  enableEasyApply?: boolean;
}

export class FindAllJobsQueryDto {
  @ApiProperty({ description: 'Filter by company name', required: false })
  @IsOptional()
  @IsString()
  company?: string;

  @ApiProperty({ description: 'Filter by job title', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: 'Filter by skills required', required: false })
  @IsOptional()
  @IsString()
  skills?: string;

  @ApiProperty({ description: 'Filter by minimum salary', required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  minPrice?: number;

  @ApiProperty({ description: 'Filter by maximum salary', required: false })
  @IsOptional()
  @IsInt()
  @Min(0) // ✅ Max o'rniga Min(0) qoldiring, chunki maksimal narx ham kamida 0 bo'lishi kerak
  maxPrice?: number;

  @ApiProperty({ description: 'Filter by job tags', required: false })
  @IsOptional()
  @IsString()
  tags?: string;

  @ApiProperty({ description: 'Filter by easy apply status', required: false })
  @IsOptional()
  @IsBoolean()
  easyApply?: boolean;

  @ApiProperty({
    description: 'Pagination: page number',
    default: 1,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    description: 'Pagination: number of results per page',
    default: 10,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @ApiProperty({ description: 'Filter by user skills', required: false })
  @IsOptional()
  @IsString()
  userSkills?: string;
}
