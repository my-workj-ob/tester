/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Body, // Tanadagi ma'lumotlarni olish uchun
  Controller, // Kontroller ekanligini belgilash uchun
  Get, // GET so'rovlarini boshqarish uchun
  NotFoundException, // Topilmagan resurs uchun xato
  Param, // Marshrut parametrlarini olish uchun
  Post, // POST so'rovlarini boshqarish uchun
  Put,
  Req,
  UnauthorizedException,
  UseGuards, // PUT so'rovlarini boshqarish uchun
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse, // Swagger uchun yaratilganlik javobi
  ApiNotFoundResponse, // Swagger uchun topilmagan javob
  ApiOkResponse, // Swagger uchun muvaffaqiyatli javob
  ApiTags, // Swagger uchun teg qo'shish
} from '@nestjs/swagger';
import { AssessmentResultService } from './../assessment-result/assessment-result.service'; // Baholash natijalari servisi
import { AssessmentResult } from './../assessment-result/entities/assements-result.entity';
import { JwtAuthGuard } from './../auth/guards/jwt-auth.guard';
import { AssessmentService } from './assessments.service'; // Baholash servisi
import { CreateAssessmentDto } from './dto/assessments.dto'; // Baholashni yaratish DTOsi
import { UpdateAssessmentDto } from './dto/update-assessments.dto'; // Baholashni yangilash DTOsi
import { Assessment } from './entities/assessments.entity'; // Baholash entitysi

@ApiTags('Assessments') // Swaggerda 'Assessments' tegi ostida guruhlash
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('assessments') // Ushbu kontroller uchun asosiy marshrut '/assessments'
export class AssessmentController {
  constructor(
    private readonly assessmentService: AssessmentService, // Baholash servisini inyeksiya qilish
    private readonly assessmentResultService: AssessmentResultService, // Baholash natijalari servisini inyeksiya qilish
  ) {}

  @Post() // POST /assessments marshrutini boshqaradi
  @ApiCreatedResponse({
    description: 'Baholash muvaffaqiyatli yaratildi',
    type: Assessment, // Swaggerda javob tipi sifatida Assessment ko'rsatiladi
  })
  async create(
    @Body() createAssessmentDto: CreateAssessmentDto, // So'rov tanasidan baholashni yaratish uchun ma'lumotlarni oladi
  ): Promise<Assessment> {
    return this.assessmentService.create(createAssessmentDto); // Baholashni yaratish uchun servis metodini chaqiradi
  }

  @Get() // GET /assessments marshrutini boshqaradi
  @ApiOkResponse({
    description: "Barcha baholashlar ro'yxati",
    type: [Assessment], // Swaggerda javob tipi sifatida Assessment massivi ko'rsatiladi
  })
  async findAll(): Promise<Assessment[]> {
    return this.assessmentService.findAll(); // Barcha baholashlarni olish uchun servis metodini chaqiradi
  }

  @Get(':id') // GET /assessments/:id marshrutini boshqaradi, :id - marshrut parametri
  @ApiOkResponse({
    description: "Berilgan ID bo'yicha baholash",
    type: Assessment, // Swaggerda javob tipi sifatida Assessment ko'rsatiladi
  })
  @ApiNotFoundResponse({ description: 'Baholash topilmadi' }) // Swaggerda topilmaganlik javobi
  async findOne(@Param('id') id: string): Promise<Assessment> {
    const assessment = await this.assessmentService.findOne(+id); // ID bo'yicha baholashni olish uchun servis metodini chaqiradi
    if (!assessment) {
      throw new NotFoundException(`Baholash ${id} topilmadi`); // Agar baholash topilmasa, xato qaytaradi
    }
    return assessment; // Topilgan baholashni qaytaradi
  }

  @Get('available')
  @ApiOkResponse({
    description: 'Foydalanuvchi uchun mavjud baholashlar',
    type: [Assessment],
  })
  async getAvailableAssessments(@Req() req): Promise<Assessment[]> {
    console.log('req.user:', req.user); // Qo'shish
    const userId = req.user?.userId; // Taxminiy maydon nomi
    console.log('userId raw:', userId); // Qo'shish

    const numericUserId = Number(userId);
    console.log('userId numeric:', numericUserId); // Qo'shish

    if (isNaN(numericUserId)) {
      console.error("Noto'g'ri foydalanuvchi IDsi:", userId);
      throw new UnauthorizedException(
        "Foydalanuvchi IDsi topilmadi yoki noto'g'ri formatda.",
      );
    }

    return await this.assessmentService.findAvailable(numericUserId);
  }
  @Get('completed/users/:userId')
  @ApiOkResponse({
    description: 'Foydalanuvchi tomonidan tugallangan baholashlar',
    type: [AssessmentResult],
    isArray: true,
  })
  @Get('completed/users/:userId')
  @ApiOkResponse({
    description: 'Foydalanuvchi tomonidan tugallangan baholashlar',
    type: [AssessmentResult],
    isArray: true,
  })
  async getCompletedAssessments(
    @Param('userId') userId: string,
  ): Promise<AssessmentResult[]> {
    return await this.assessmentService.findCompletedByUserId(+userId);
  }

  @Put(':id') // PUT /assessments/:id marshrutini boshqaradi, :id - marshrut parametri
  async update(
    @Param('id') id: string, // Marshrutdan baholash ID sini oladi
    @Body() updateAssessmentDto: UpdateAssessmentDto, // So'rov tanasidan yangilash uchun ma'lumotlarni oladi
  ): Promise<Assessment> {
    const updatedAssessment = await this.assessmentService.update(
      +id,
      updateAssessmentDto, // Baholashni yangilash uchun servis metodini chaqiradi
    );
    if (!updatedAssessment) {
      throw new NotFoundException(`Baholash ${id} topilmadi`); // Agar baholash topilmasa, xato qaytaradi
    }
    return updatedAssessment; // Yangilangan baholashni qaytaradi
  }
}
