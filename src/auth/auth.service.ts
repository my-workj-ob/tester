/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/require-await */
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { UserService } from '../user/user.service';
import { Profile } from './../profile/entities/profile.entity';
import { Session } from './../security/entities/session.entity';
import { User } from './../user/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenService } from './refresh-token.service';

@Injectable()
export class AuthService {
  validateUser: any;
  generateAccessToken: any;

  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    @InjectRepository(Profile)
    private profileRepository: Repository<Profile>,
    @InjectRepository(Session)
    private sessionRepo: Repository<Session>,
    private readonly refreshTokenService: RefreshTokenService,
  ) {}

  async generateAccessTokens(user: User): Promise<string> {
    try {
      return this.jwtService.sign(
        { ...user, id: user.id },
        { expiresIn: '15m' },
      );
    } catch (error) {
      throw new BadRequestException(`Error generating access token ${error}`);
    }
  }

  async register(dto: RegisterDto) {
    try {
      // Email bandligini tekshirish
      const existingUser = await this.userService.findByEmail(dto.email);
      if (existingUser) throw new BadRequestException('Email already taken');

      // Parolni xeshlash
      const hashedPassword = await bcrypt.hash(dto.password, 10);

      // Foydalanuvchini yaratish
      const user = await this.userService.create({
        ...dto,
        password: hashedPassword,
      });

      // Profil yaratish
      const profile = this.profileRepository.create({
        user,
        firstName: dto.firstName || '',
        lastName: dto.lastName || '',
        email: dto.email,
        jobTitle: dto.jobTitle || '',
        avatar: '',
      });
      await this.profileRepository.save(profile);

      // **Avtomatik login qilish (JWT tokenlar yaratish)**
      const payload = { sub: user.id, email: user.email };
      const accessToken = this.jwtService.sign(payload, { expiresIn: '30m' });
      const refreshToken = this.jwtService.sign(payload, {
        secret: 'baxtiyor08072006',
        expiresIn: '7d',
      });

      // **Refresh tokenni saqlash**
      await this.refreshTokenService.saveRefreshToken(user.id, refreshToken);

      return {
        user,
        accessToken,
        refreshToken,
      };
    } catch (error) {
      throw new BadRequestException(`Error during registration ${error}`);
    }
  }

  async login(
    email: string,
    password: string,
    device: string,
    location: string,
  ) {
    try {
      const user = await this.userService.findByEmail(email);
      if (!user || !(await bcrypt.compare(password, user.password))) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const payload = { sub: user.id, email: user.email };
      const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });

      const refreshToken = this.jwtService.sign(payload, {
        secret: 'baxtiyor08072006',
        expiresIn: '7d',
      });

      // **Session yaratish va saqlash**
      const newSession = this.sessionRepo.create({
        user,
        device,
        location,
        lastActive: new Date(),
      });
      const savedSession = await this.sessionRepo.save(newSession);

      // **Saqlangan sessiyani user bilan qayta yuklash**
      const sessionWithUser = await this.sessionRepo.findOne({
        where: { id: savedSession.id },
        relations: ['user'],
      });

      // **Refresh tokenni saqlash**
      await this.refreshTokenService.saveRefreshToken(user.id, refreshToken);

      return {
        accessToken,
        refreshToken,
        sessionWithUser,
      };
    } catch (error) {
      console.error(error); // Xatolikni konsolga chiqarish
      throw new UnauthorizedException('Login failed');
    }
  }
}
