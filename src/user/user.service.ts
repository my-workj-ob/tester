import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async getAllUsers() {
    return this.userRepository.find({
      relations: ['profile'],
    });
  }

  async getUserById(id: number) {
    return this.userRepository.findOne({ where: { id } });
  }
  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }
  async create(userData: Partial<User>): Promise<User> {
    const user = this.userRepository.create(userData);
    return this.userRepository.save(user);
  }
  async findById(userId: number): Promise<User | null> {
    return this.userRepository.findOne({ where: { id: userId } });
  }

  async createUser(email: string, password: string) {
    const user = this.userRepository.create({ email, password });
    return this.userRepository.save(user);
  }

  async updateUser(id: number, email: string) {
    const user = await this.getUserById(id);
    if (!user) throw new Error('User not found');

    user.email = email;
    return this.userRepository.save(user);
  }

  async deleteUser(id: number) {
    return this.userRepository.delete(id);
  }
}
