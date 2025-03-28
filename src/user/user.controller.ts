import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserService } from './user.service';

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiOperation({ summary: 'Foydalanuvchilar ro‘yxatini olish' })
  @ApiResponse({ status: 200, description: 'Foydalanuvchilar ro‘yxati' })
  getAllUsers() {
    return this.userService.getAllUsers();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Bitta userni olish' })
  @ApiResponse({ status: 200, description: 'User topildi' })
  @ApiResponse({ status: 404, description: 'User topilmadi' })
  getUserById(@Param('id') id: number) {
    return this.userService.getUserById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Yangi user qo‘shish' })
  @ApiResponse({ status: 201, description: 'User yaratildi' })
  createUser(@Body() body: { email: string; password: string }) {
    return this.userService.createUser(body.email, body.password);
  }

  @Put(':id')
  @ApiOperation({ summary: 'User ma’lumotlarini yangilash' })
  @ApiResponse({ status: 200, description: 'User yangilandi' })
  updateUser(@Param('id') id: number, @Body('email') email: string) {
    return this.userService.updateUser(id, email);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Userni o‘chirish' })
  @ApiResponse({ status: 200, description: 'User o‘chirildi' })
  deleteUser(@Param('id') id: number) {
    return this.userService.deleteUser(id);
  }
}
