/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
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
import { JwtAuthGuard } from './../auth/guards/jwt-auth.guard';
import { UploadService } from './../file/uploadService';
import { UserService } from './../user/user.service';
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
  constructor(
    private readonly uploadService: UploadService, // Inject the UploadService
    private readonly profileService: ProfileService,
    private readonly userService: UserService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getMyProfile(@Request() req) {
    const userId = req.user?.userId as number; // Passport joriy foydalanuvchi ma'lumotlarini `req.user`ga qo'yadi
    if (!userId) {
      throw new NotFoundException('Foydalanuvchi IDsi topilmadi');
    }
    return this.profileService.getProfile(userId);
  }
  @UseGuards(JwtAuthGuard)
  @Get('stats')
  async getProfileStats(@Req() req) {
    try {
      const id = req.user.userId as number;

      if (!id) {
        throw new BadRequestException('User ID is required');
      }
      // Call the service method to get profile stats
      return await this.profileService.getProfileStats(id);
    } catch (error) {
      // Handle errors (for example, user not found)
      throw new NotFoundException(`User not found: ${error}`);
    }
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
  @Get(':id')
  async getProfileById(@Param('id') id: number, @Req() req) {
    const profileId = parseInt(String(id), 10);
    const currentUser = req.user?.userId as number; // Joriy foydalanuvchi IDsi

    if (isNaN(profileId)) {
      throw new NotFoundException('Noto‘g‘ri profil IDsi');
    }

    const userProfile = await this.userService.findOne(profileId);

    if (!userProfile) {
      throw new NotFoundException(`Profil ${profileId} topilmadi`);
    }

    if (currentUser && userProfile.id !== currentUser) {
      await this.userService.incrementProfileViews(profileId);
    }

    return this.profileService.getProfile(id); // Parametrdan kelgan `id` stringligicha ishlatiladi
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

    // Avatar URL-ni yangilash
    return this.profileService.updateAvatar(profileId, avatarUrl);
  }
}
