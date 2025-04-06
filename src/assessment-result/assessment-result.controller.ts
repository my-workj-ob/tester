import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from './../auth/guards/jwt-auth.guard';
import { AssessmentResultService } from './assessment-result.service';
import { CreateAssessmentResultDto } from './dto/create-assessment-result.dto';
import { AssessmentResult } from './entities/assements-result.entity';

@ApiTags('Assessment Results')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('assessment-results')
export class AssessmentResultController {
  constructor(
    private readonly assessmentResultService: AssessmentResultService,
  ) {}

  @Post()
  @ApiCreatedResponse({
    description: 'Baholash natijalari muvaffaqiyatli qabul qilindi',
    type: AssessmentResult,
  })
  async create(
    @Body() createAssessmentResultDto: CreateAssessmentResultDto,
  ): Promise<AssessmentResult> {
    return this.assessmentResultService.create(createAssessmentResultDto);
  }

  @Get('users/:userId')
  @ApiOkResponse({
    description: 'Foydalanuvchining baholash natijalari tarixi',
    type: [AssessmentResult],
  })
  async findByUserId(
    @Param('userId') userId: string,
  ): Promise<AssessmentResult[]> {
    return this.assessmentResultService.findByUserId(+userId);
  }

  @Get(':id')
  @ApiOkResponse({ description: 'Baholash natijasi', type: AssessmentResult })
  @ApiNotFoundResponse({ description: 'Baholash natijasi topilmadi' })
  async findOne(@Param('id') id: string): Promise<AssessmentResult> {
    const result = await this.assessmentResultService.findOne(+id);
    if (!result) {
      throw new NotFoundException(`Baholash natijasi ${id} topilmadi`);
    }
    return result;
  }
}
