import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Request,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
  ApiParam,
  ApiNotFoundResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Req } from '@nestjs/common';
import { Projects } from './entities/create-projecs.entity';
import { CreateProjectsDto } from './dto/create-projects-dto';
import { User } from './../user/entities/user.entity';
import { JwtAuthGuard } from './../auth/guards/jwt-auth.guard';

@ApiTags('Projects')
@ApiBearerAuth()
@Controller('projects')
@UseGuards(JwtAuthGuard) // Uncomment this line to protect the controller with authentication
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @ApiCreatedResponse({
    description: 'Project created successfully',
    type: Projects,
  })
  @ApiBody({ type: CreateProjectsDto })
  // @UseGuards(AuthGuard()) // Uncomment this line to protect this endpoint
  async create(
    @Body() createProjectsDto: CreateProjectsDto,
    @Req() req: any,
  ): Promise<Projects> {
    // Assuming you have some form of authentication middleware that populates the 'req.user' with the authenticated user
    const userId = req?.user?.userId as number;
    // Replace 'req.user' with the actual property where the user is stored

    return await this.projectsService.create(createProjectsDto, userId);
  }

  @Get()
  findAll(
    @Query('category') category?: string,
    @Query('status') status?: string,
    @Query('skills') skills?: string,
    @Query('search') search?: string,
  ) {
    return this.projectsService.findAll(category, status, skills, search);
  }

  @Get(':id')
  @ApiOkResponse({ description: 'Project found', type: Projects })
  @ApiNotFoundResponse({ description: 'Project not found' })
  @ApiParam({ name: 'id', type: 'number', description: 'ID of the project' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Projects> {
    return await this.projectsService.findOne(id);
  }

  @Patch(':id')
  @ApiOkResponse({
    description: 'Project updated successfully',
    type: Projects,
  })
  @ApiNotFoundResponse({ description: 'Project not found' })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'ID of the project to update',
  })
  @ApiBody({ type: () => CreateProjectsDto, isArray: false })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProjectsDto: Partial<CreateProjectsDto>,
  ): Promise<Projects> {
    return await this.projectsService.update(id, updateProjectsDto);
  }

  @Delete(':id')
  @ApiOkResponse({ description: 'Project deleted successfully' })
  @ApiNotFoundResponse({ description: 'Project not found' })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'ID of the project to delete',
  })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return await this.projectsService.remove(id);
  }
}
