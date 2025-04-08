import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  // ✅ Barcha foydalanuvchilarni olish
  async getAllUsers() {
    try {
      return await this.userRepository.find({
        relations: ['profile'],
      });
    } catch (error) {
      throw new InternalServerErrorException(
        `Error fetching all users: ${error}`,
      );
    }
  }

  // ✅ Foydalanuvchi ID bo‘yicha izlash
  async getUserById(id: number) {
    try {
      const user = await this.userRepository.findOne({ where: { id } });
      if (!user) throw new NotFoundException(`User with ID ${id} not found`);
      return user;
    } catch (error) {
      throw new InternalServerErrorException(
        `Error fetching user with ID ${id}: ${error}`,
      );
    }
  }
  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async incrementProfileViews(userId: number): Promise<void> {
    console.log(userId);

    const user = await this.findOne(userId);
    if (user) {
      user.profileViews += 1;
      console.log(
        `Profil ko'rishlari oshirildi. User ID: ${userId}, Yangi ko'rishlar soni: ${user.profileViews}`,
      );
      await this.userRepository.save(user);
    } else {
      console.log(
        `Foydalanuvchi ${userId} topilmadi, profil ko'rishlari oshirilmadi.`,
      );
    }
  }
  // ✅ Email bo‘yicha foydalanuvchi izlash
  async findByEmail(email: string): Promise<User | null> {
    try {
      return await this.userRepository.findOne({ where: { email } });
    } catch (error) {
      throw new InternalServerErrorException(
        `Error fetching user with email ${email}: ${error}`,
      );
    }
  }

  // ✅ Yangi foydalanuvchi yaratish
  async create(userData: Partial<User>): Promise<User> {
    try {
      const user = this.userRepository.create(userData);
      return await this.userRepository.save(user);
    } catch (error) {
      throw new InternalServerErrorException(`Error creating user: ${error}`);
    }
  }

  // ✅ ID bo‘yicha foydalanuvchi topish
  async findById(userId: number): Promise<User | null> {
    try {
      return await this.userRepository.findOne({ where: { id: userId } });
    } catch (error) {
      throw new InternalServerErrorException(
        `Error fetching user with ID ${userId}: ${error}`,
      );
    }
  }

  // ✅ Yangi foydalanuvchi yaratish (email, password)
  async createUser(email: string, password: string) {
    try {
      const user = this.userRepository.create({ email, password });
      return await this.userRepository.save(user);
    } catch (error) {
      throw new InternalServerErrorException(
        `Error creating user with email ${email}: ${error}`,
      );
    }
  }

  // ✅ Foydalanuvchi ma'lumotlarini yangilash
  async updateUser(id: number, email: string) {
    try {
      const user = await this.getUserById(id);
      if (!user) throw new NotFoundException(`User with ID ${id} not found`);

      user.email = email;
      return await this.userRepository.save(user);
    } catch (error) {
      throw new InternalServerErrorException(
        `Error updating user with ID ${id}: ${error}`,
      );
    }
  }

  // ✅ Foydalanuvchini o'chirish
  async deleteUser(id: number) {
    try {
      const result = await this.userRepository.delete(id);
      if (result.affected === 0) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      return result;
    } catch (error) {
      throw new InternalServerErrorException(
        `Error deleting user with ID ${id}: ${error}`,
      );
    }
  }
}
