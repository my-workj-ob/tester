/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from './../auth/guards/jwt-auth.guard';
import { PortfolioFilterDto } from './dto/filter.dto';
import { CreatePortfolioDto } from './dto/portfolio.dto';
import { Project } from './entities/project.entity';
import { ProjectService } from './portfolio.service';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiTags('Portfolios')
@Controller('portfolios')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Get()
  @ApiOperation({ summary: 'Barcha loyihalarni olish' })
  @ApiResponse({
    status: 200,
    description: 'Loyihalar ro‘yxati.',
    type: [Project], // Massiv qaytishini bildiradi
  })
  findAll(): Promise<Project[]> {
    return this.projectService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Bitta loyihani olish' })
  @ApiResponse({
    status: 200,
    description: 'Bitta loyiha tafsilotlari.',
    type: Project,
  })
  @ApiResponse({ status: 404, description: 'Loyiha topilmadi.' })
  findOne(@Param('id') id: number): Promise<Project | any> {
    return this.projectService.findOne(id);
  }

  @Post('filtered-portfolios')
  async getFilteredPortfolios(@Body() filters: PortfolioFilterDto) {
    return this.projectService.getFilteredPortfolios(filters);
  }

  @Post()
  @ApiOperation({ summary: 'Yangi loyiha qo‘shish' })
  @ApiResponse({ status: 201, description: 'Loyiha muvaffaqiyatli qo‘shildi.' })
  @Post()
  async create(
    @Body() projectData: CreatePortfolioDto,
    @Req() res: any,
  ): Promise<Project> {
    const id = res.user.userId;
    console.log(id);

    return this.projectService.createPortfolio(projectData, String(id));
  }

  @Put(':id')
  @ApiOperation({ summary: 'Loyihani yangilash' })
  @ApiBody({ type: CreatePortfolioDto }) // ✅ Bu yerda body ko'rinadi
  @ApiResponse({
    status: 200,
    description: 'Loyiha muvaffaqiyatli yangilandi.',
    type: Project,
  })
  @ApiResponse({ status: 404, description: 'Loyiha topilmadi.' })
  update(@Param('id') id: number, @Body() projectData: CreatePortfolioDto) {
    return this.projectService.update(id, projectData);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Loyihani o‘chirish' })
  @ApiResponse({
    status: 200,
    description: 'Loyiha muvaffaqiyatli o‘chirildi.',
  })
  @ApiResponse({ status: 404, description: 'Loyiha topilmadi.' })
  delete(@Param('id') id: number) {
    return this.projectService.delete(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/like')
  async toggleLike(@Param('id') id: number, @Req() req) {
    const userId = req.user.userId;
    const isLiked = await this.projectService.toggleLike(Number(id), userId);

    const project = await this.projectService.findOne(Number(id));
    if (!project) {
      throw new NotFoundException('Project not found'); // ✅ Xatolikni oldini olish
    }

    return { liked: isLiked, likesCount: project.likesCount };
  }

  @Get(':id/like/status')
  async getLikeStatus(
    @Param('id') projectId: number,
    @Query('userId') userId: number,
  ) {
    const liked = await this.projectService.checkLikeStatus(projectId, userId);
    return { liked };
  }
}
