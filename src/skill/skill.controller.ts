import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateSkillDto } from './create-skill.dto';
import { Skill } from './entities/skill.entity';
import { SkillService } from './skill.service';

@ApiTags('Skills') // ✅ Swagger kategoriyasi
@Controller('profiles/:profileId/skills')
export class SkillController {
  constructor(private readonly skillService: SkillService) {}

  @Get()
  @ApiOperation({ summary: 'Get all skills for a profile' })
  @ApiResponse({ status: 200, description: 'List of skills', type: [Skill] })
  async getProfileSkills(
    @Param('profileId') profileId: number,
    @Query('isPublic') isPublic: string, // `@Query()` orqali olish
  ): Promise<Skill[]> {
    return this.skillService.findAllByProfile(profileId, isPublic === 'true');
  }

  @Post()
  @ApiOperation({ summary: 'Add a new skill to a profile' })
  @ApiResponse({ status: 201, description: 'New skill created', type: Skill })
  @ApiBody({ type: CreateSkillDto })
  async addSkill(
    @Param('profileId') profileId: number,
    @Body() skillData: CreateSkillDto,
  ): Promise<Skill> {
    return this.skillService.create(profileId, skillData);
  }
  @Post(':profileId')
  async create(
    @Param('profileId') profileId: number,
    @Body() skillData: CreateSkillDto,
  ) {
    return this.skillService.create(profileId, skillData);
  }
  @Patch(':skillId/endorse')
  @ApiOperation({ summary: 'Endorse a skill' })
  @ApiResponse({
    status: 200,
    description: 'Skill endorsed successfully',
    type: Skill,
  })
  @ApiParam({ name: 'profileId', description: 'Profile ID' })
  @ApiParam({ name: 'skillId', description: 'Skill ID' })
  async endorseSkill(
    @Param('profileId') profileId: number,
    @Param('skillId') skillId: number,
  ): Promise<Skill> {
    return this.skillService.endorseSkill(profileId, skillId);
  }
}
