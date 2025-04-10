/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AssessmentService } from './../assessments/assessments.service';
import { CodingSubmissionService } from './../coding-submission/coding-submission.service'; // Import CodingSubmissionService
import { SubmissionStatus } from './../coding-submission/entities/coding-submission.entity';
import { QuestionService } from './../questions/questions.service';
import { UserService } from './../user/user.service';
import { CreateAssessmentResultDto } from './dto/create-assessment-result.dto';
import { AssessmentResult } from './entities/assements-result.entity';

@Injectable()
export class AssessmentResultService {
  constructor(
    @InjectRepository(AssessmentResult)
    private readonly assessmentResultRepository: Repository<AssessmentResult>,

    @Inject(forwardRef(() => AssessmentService))
    private readonly assessmentService: AssessmentService,
    private readonly userService: UserService,
    private readonly questionService: QuestionService, // Inject QuestionService
    private readonly codingSubmissionService: CodingSubmissionService, // Inject CodingSubmissionService
  ) {}

  async create(
    createAssessmentResultDto: CreateAssessmentResultDto,
  ): Promise<AssessmentResult> {
    try {
      // Baholashni topish
      const assessment = await this.assessmentService.findOne(
        createAssessmentResultDto.assessmentId,
      );
      if (!assessment) {
        throw new NotFoundException(
          `Baholash ${createAssessmentResultDto.assessmentId} topilmadi`,
        );
      }

      // Foydalanuvchini topish
      const user = await this.userService.findById(
        createAssessmentResultDto.userId,
      );
      if (!user) {
        throw new NotFoundException(
          `Foydalanuvchi ${createAssessmentResultDto.userId} topilmadi`,
        );
      }

      // Ball hisoblash
      let score = 0;

      // Savollarni baholash
      const evaluatedAnswers =
        createAssessmentResultDto.answers?.map(async (answer) => {
          const question = await this.questionService.findOne(
            answer.questionId,
          );
          const isCorrect =
            question && question.correctAnswer === answer.selectedOption;
          if (isCorrect) {
            score++;
          }
          return { ...answer, isCorrect };
        }) || [];

      // Kod topshiriqlarini baholash
      if (!Array.isArray(createAssessmentResultDto.codingSubmissions)) {
        throw new BadRequestException('codingSubmissions array bo‘lishi kerak');
      }
      const evaluatedSubmissions =
        createAssessmentResultDto.codingSubmissions.map(
          async (submissionDto) => {
            const submission = await this.codingSubmissionService.create({
              userId: createAssessmentResultDto.userId,
              assessmentId: createAssessmentResultDto.assessmentId,
              code: submissionDto.code,
            });

            const passed = true; // To'g'ri kodlashni tekshirish lozim
            const updateDto = {
              status: passed
                ? SubmissionStatus.SUCCESS
                : SubmissionStatus.FAILED,
              result: "Natija bu yerda bo'ladi",
            };
            await this.codingSubmissionService.update(submission.id, updateDto);

            const updatedSubmission =
              await this.codingSubmissionService.findOne(submission.id);

            return { ...submission, passed };
          },
        ) || [];

      // Barcha javoblarni va topshiriqlarni to‘plash
      const resolvedEvaluatedAnswers = await Promise.all(evaluatedAnswers);
      const resolvedEvaluatedSubmissions =
        await Promise.all(evaluatedSubmissions);

      // Umumiy ballni hisoblash
      const totalQuestions = assessment.questionIds?.length || 0;
      const totalCodingChallenges = assessment.codingChallengeIds?.length || 0;
      const totalItems = totalQuestions + totalCodingChallenges;
      const calculatedScore =
        totalItems > 0
          ? Math.round(
              ((score +
                resolvedEvaluatedSubmissions.filter((s) => s.passed).length) /
                totalItems) *
                100,
            )
          : 0;

      // O‘tkazilganligini tekshirish
      const passed = calculatedScore >= assessment.passingScore;

      // Natijani yaratish
      const result = this.assessmentResultRepository.create({
        assessmentId: createAssessmentResultDto.assessmentId,
        score: calculatedScore,
        passed,
        completedAt: new Date(),
        answers: resolvedEvaluatedAnswers,
        user: user,
        assessment: assessment,
        submissions: resolvedEvaluatedSubmissions,
      });

      return this.assessmentResultRepository.save(result);
    } catch (error) {
      throw new InternalServerErrorException(`Xatolik: ${error.message}`);
    }
  }

  async findByUserId(userId: number): Promise<AssessmentResult[]> {
    return this.assessmentResultRepository.find({
      where: { user: { id: userId } },
      relations: ['assessment', 'assessment.skill'], // Baholash ma'lumotlarini ham olish uchun
    });
  }

  async findOne(id: number): Promise<AssessmentResult | undefined | null> {
    return this.assessmentResultRepository.findOne({
      where: { id },
      relations: ['assessment', 'user', 'assessment.skill'],
    });
  }
}
