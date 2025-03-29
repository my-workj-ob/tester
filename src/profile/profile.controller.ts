/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  Request,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ChangePasswordDto } from './dto/change-password.dto';
import { SkillDto } from './dto/skill.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { UpdatePrivacyDto } from './dto/update-privacy.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ProfileService } from './profile.service';

@ApiTags('Profile')
@ApiBearerAuth() // Swaggerda token qo'shish uchun
@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getProfile(@Request() req) {
    console.log('user: ', req.user);
    return this.profileService.getProfile(req.user?.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch()
  @ApiOperation({ summary: 'Profilni yangilash' })
  @ApiBody({ type: UpdateProfileDto })
  updateProfile(@Req() req, @Body() dto: UpdateProfileDto) {
    if (!req.user || !req.user.userId) {
      throw new Error('User ID not found in request');
    }
    return this.profileService.updateProfile(req.user.userId, dto);
  }
  @UseGuards(JwtAuthGuard)
  @Patch('password')
  @ApiOperation({ summary: 'Parolni o‘zgartirish' })
  @ApiResponse({ status: 200, description: 'Parol muvaffaqiyatli yangilandi' })
  @ApiResponse({ status: 400, description: 'Joriy parol noto‘g‘ri' })
  @ApiResponse({ status: 404, description: 'Foydalanuvchi topilmadi' })
  @ApiBearerAuth() // Swaggerda "Authorize" tugmasini chiqarish uchun
  @UseGuards(JwtAuthGuard)
  @Patch('password')
  async changePassword(@Request() req, @Body() dto: ChangePasswordDto) {
    return this.profileService.changePassword(req.user.id, dto);
  }
  @UseGuards(JwtAuthGuard)
  @Post('skills')
  @ApiOperation({ summary: 'Ko‘nikma qo‘shish' })
  @ApiBody({ type: SkillDto })
  addSkill(@Request() req, @Body() dto: SkillDto) {
    return this.profileService.addSkill(req.user.userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('skills/:skillId')
  @ApiOperation({ summary: 'Ko‘nikmani o‘chirish' })
  removeSkill(@Param('skillId') skillId: number) {
    return this.profileService.removeSkill(skillId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('notifications')
  async updateNotifications(
    @Request() req,
    @Body() dto: UpdateNotificationDto,
  ) {
    return this.profileService.updateNotifications(req.user.id, dto);
  }
  @UseGuards(JwtAuthGuard)
  @Patch('privacy')
  async updatePrivacy(@Request() req, @Body() dto: UpdatePrivacyDto) {
    return this.profileService.updatePrivacy(req.user.id, dto);
  }
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Profil rasmini yuklash' })
  @Patch('avatar/:profileId')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(
            null,
            file.fieldname + '-' + uniqueSuffix + extname(file.originalname),
          );
        },
      }),
    }),
  )
  async updateAvatar(
    @Param('profileId') profileId: number,
    @Body('avatar') avatarUrl: string,
  ) {
    if (!avatarUrl) {
      throw new BadRequestException('Avatar URL is required');
    }

    return this.profileService.updateAvatar(profileId, avatarUrl);
  }
}
