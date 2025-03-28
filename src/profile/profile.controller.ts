/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Req,
  Request,
  UploadedFile,
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
  @Put()
  @ApiOperation({ summary: 'Profilni yangilash' })
  @ApiBody({ type: UpdateProfileDto })
  updateProfile(@Req() req, @Body() dto: UpdateProfileDto) {
    return this.profileService.updateProfile(req.user.id, dto);
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
  @Post('avatar')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Profil rasmini yuklash' })
  uploadAvatar(@Req() req, @UploadedFile() file: Express.Multer.File) {
    const avatarUrl = `uploads/${file.filename}`;
    return this.profileService.uploadAvatar(req.user.id, avatarUrl);
  }
}
