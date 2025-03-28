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
import { Profile } from 'src/profile/entities/profile.entity';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { UserService } from '../user/user.service';
import { Session } from './../security/entities/session.entity';
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
    return this.jwtService.sign({ id: user.id }, { expiresIn: '15m' });
  }

  async register(dto: RegisterDto) {
    // Check if the email is already taken
    const existingUser = await this.userService.findByEmail(dto.email);
    if (existingUser) throw new BadRequestException('Email already taken');

    // Hash the password
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // Create the user
    const user = await this.userService.create({
      ...dto,
      password: hashedPassword,
    });

    // ✅ Email maydonini qo‘shish kerak
    const profile = this.profileRepository.create({
      user: user,
      firstName: dto.firstName || '',
      lastName: dto.lastName || '',
      email: dto.email, // ✅ **Email maydonini qo‘shdik**
      jobTitle: dto.jobTitle || '',
      avatar: '',
    });

    await this.profileRepository.save(profile);

    return user;
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

    const payload = { id: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' }); // 15 daqiqa
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
