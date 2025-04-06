import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { Question } from './entities/question.entity';
import { QuestionService } from './questions.service';

@ApiTags('Questions')
@Controller('questions')
export class QuestionController {
  constructor(private readonly questionService: QuestionService) {}

  @Post()
  @ApiCreatedResponse({
    description: 'Savol muvaffaqiyatli yaratildi',
    type: Question,
  })
  @UsePipes(new ValidationPipe())
  async create(
    @Body() createQuestionDto: CreateQuestionDto,
  ): Promise<Question> {
    return this.questionService.create(createQuestionDto);
  }

  @Get('category/:categoryId')
  @ApiOkResponse({
    description: "Kategoriya bo'yicha savollar",
    type: [Question],
  })
  async findByCategoryId(
    @Param('categoryId') categoryId: string,
  ): Promise<Question[]> {
    return this.questionService.findByCategoryId(+categoryId);
  }

  @Get('skill/:skillId')
  @ApiOkResponse({
    description: "Ko'nikma bo'yicha savollar",
    type: [Question],
  })
  async findBySkillId(@Param('skillId') skillId: string): Promise<Question[]> {
    return this.questionService.findBySkillId(+skillId);
  }

  @Get()
  @ApiOkResponse({ description: "Barcha savollar ro'yxati", type: [Question] })
  async findAll(): Promise<Question[]> {
    return this.questionService.findAll();
  }

  @Get('search')
  @ApiOkResponse({
    description: "Kalit so'z bo'yicha savollar",
    type: [Question],
  })
  async searchQuestions(
    @Query('keyword') keyword: string,
  ): Promise<Question[]> {
    if (!keyword) {
      return this.questionService.findAll(); // Agar kalit so'z berilmasa, barcha savollarni qaytarish
    }
    return this.questionService.search(keyword);
  }

  @Get(':id')
  @ApiOkResponse({ description: "Berilgan ID bo'yicha savol", type: Question })
  @ApiNotFoundResponse({ description: 'Savol topilmadi' })
  async findOne(@Param('id') id: number): Promise<Question> {
    return this.questionService.findOne(id);
  }

  @Put(':id')
  @ApiOkResponse({
    description: 'Savol muvaffaqiyatli yangilandi',
    type: Question,
  })
  @ApiNotFoundResponse({ description: 'Savol topilmadi' })
  @UsePipes(new ValidationPipe())
  async update(
    @Param('id') id: number,
    @Body() updateQuestionDto: UpdateQuestionDto,
  ): Promise<Question> {
    return this.questionService.update(id, updateQuestionDto);
  }

  @Delete(':id')
  @ApiOkResponse({ description: "Savol muvaffaqiyatli o'chirildi" })
  @ApiNotFoundResponse({ description: 'Savol topilmadi' })
  async remove(@Param('id') id: number): Promise<void> {
    return this.questionService.remove(id);
  }
}
