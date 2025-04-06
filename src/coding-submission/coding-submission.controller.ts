import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CodingSubmissionService } from './coding-submission.service';
import { CreateCodingSubmissionDto } from './dto/create-coding-submission.dto';
import { UpdateCodingSubmissionDto } from './dto/update-coding-submission.dto';
import { CodingSubmission } from './entities/coding-submission.entity';

@ApiTags('Coding Submissions')
@Controller('coding-submissions')
export class CodingSubmissionController {
  constructor(
    private readonly codingSubmissionService: CodingSubmissionService,
  ) {}

  @Post()
  @ApiCreatedResponse({
    description: "Kod topshirig'i muvaffaqiyatli yaratildi",
    type: CodingSubmission,
  })
  @UsePipes(new ValidationPipe())
  async create(
    @Body() createCodingSubmissionDto: CreateCodingSubmissionDto,
  ): Promise<CodingSubmission> {
    return this.codingSubmissionService.create(createCodingSubmissionDto);
  }

  @Get()
  @ApiOkResponse({
    description: "Barcha kod topshirig'i ro'yxati",
    type: [CodingSubmission],
  })
  async findAll(): Promise<CodingSubmission[]> {
    return this.codingSubmissionService.findAll();
  }

  @Get(':id')
  @ApiOkResponse({
    description: "Berilgan ID bo'yicha kod topshirig'i javobi",
    type: CodingSubmission,
  })
  @ApiNotFoundResponse({ description: "Kod topshirig'i javobi topilmadi" })
  async findOne(@Param('id') id: number): Promise<CodingSubmission> {
    return this.codingSubmissionService.findOne(id);
  }

  @Put(':id')
  @ApiOkResponse({
    description: "Kod topshirig'i muvaffaqiyatli yangilandi",
    type: CodingSubmission,
  })
  @ApiNotFoundResponse({ description: "Kod topshirig'i javobi topilmadi" })
  @UsePipes(new ValidationPipe())
  async update(
    @Param('id') id: number,
    @Body() updateCodingSubmissionDto: UpdateCodingSubmissionDto,
  ): Promise<CodingSubmission> {
    return this.codingSubmissionService.update(id, updateCodingSubmissionDto);
  }

  @Delete(':id')
  @ApiOkResponse({ description: "Kod topshirig'i muvaffaqiyatli o'chirildi" })
  @ApiNotFoundResponse({ description: "Kod topshirig'i javobi topilmadi" })
  async remove(@Param('id') id: number): Promise<void> {
    return this.codingSubmissionService.remove(id);
  }
}
