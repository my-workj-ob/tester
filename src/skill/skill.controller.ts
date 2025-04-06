/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Req,
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
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { Skill } from './entities/skill.entity';
import { SkillService } from './skill.service';
// import { AuthGuard } from '@nestjs/passport'; // Agar autentifikatsiya bo'lsa

@ApiTags('Skills')
@ApiBearerAuth() // Agar autentifikatsiya bo'lsa
@UseGuards(JwtAuthGuard) // Agar autentifikatsiya bo'lsa
@Controller('skills')
export class SkillController {
  constructor(private readonly skillService: SkillService) {}

  @Post('')
  @ApiCreatedResponse({
    description: "Ko'nikma muvaffaqiyatli yaratildi",
    type: Skill,
  })
  @Post()
  @ApiCreatedResponse({
    description: "Ko'nikma muvaffaqiyatli yaratildi",
    type: Skill,
  })
  async create(
    @Req() req: any,
    @Body() createSkillDto: CreateSkillDto,
  ): Promise<Skill> {
    const userId = req.user.userId as number;
    return this.skillService.create(userId, createSkillDto);
  }

  @Get('/grouped')
  @ApiOkResponse({
    description: "Skilllar kategoriyalar bo'yicha guruhlangan",
    type: 'object',
  })
  async getGroupedSkills(): Promise<{ [key: string]: Skill[] }> {
    return this.skillService.getSkillsGroupedByCategory();
  }

  @Get('')
  @ApiOkResponse({
    description: "Foydalanuvchining barcha ko'nikmalari",
    type: [Skill],
  })
  async findAllByUserId(@Req() req: any): Promise<Skill[]> {
    const userId = req.user.userId as number;
    return this.skillService.findAllByUserId(+userId);
  }

  @Get(':id')
  @ApiOkResponse({ description: "Ko'nikma", type: Skill })
  @ApiNotFoundResponse({ description: "Ko'nikma topilmadi" })
  async findOne(@Param('id') id: string): Promise<Skill> {
    const skill = await this.skillService.findOne(+id);
    if (!skill) {
      throw new NotFoundException(`Ko'nikma ${id} topilmadi`);
    }
    return skill;
  }

  @Put(':id')
  @ApiOkResponse({
    description: "Ko'nikma muvaffaqiyatli yangilandi",
    type: Skill,
  })
  @ApiNotFoundResponse({ description: "Ko'nikma topilmadi" })
  async update(
    @Param('id') id: number,
    @Body() updateSkillDto: UpdateSkillDto,
  ): Promise<Skill> {
    return this.skillService.update(id, updateSkillDto);
  }

  @Delete(':id')
  @ApiOkResponse({ description: "Ko'nikma muvaffaqiyatli o'chirildi" })
  @ApiNotFoundResponse({ description: "Ko'nikma topilmadi" })
  async remove(@Param('id') id: number): Promise<void> {
    return this.skillService.remove(id);
  }
}
