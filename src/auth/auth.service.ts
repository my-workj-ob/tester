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
    return this.jwtService.sign({ ...user, id: user.id }, { expiresIn: '15m' });
  }

  async register(dto: RegisterDto) {
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
  }

  async login(
    email: string,
    password: string,
    device: string,
    location: string,
  ) {
    const user = await this.userService.findByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' }); // 15 daqiqa
    console.log('user payload: ', payload);

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
    console.log(savedSession); // **Saqlangan sessiyani ko'rish**

    // **Saqlangan sessiyani user bilan qayta yuklash**
    const sessionWithUser = await this.sessionRepo.findOne({
      where: { id: savedSession.id }, // **To'g'ri ID ishlatilmoqda**
      relations: ['user'],
    });
    console.log(sessionWithUser);

    // **Refresh tokenni saqlash**
    await this.refreshTokenService.saveRefreshToken(user.id, refreshToken);

    return {
      accessToken,
      refreshToken,
    };
  }
}
