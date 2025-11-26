import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { UsersService } from '@/application/services/users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '@/shared/decorators/roles.decorator';
import { CurrentUser } from '@/shared/decorators/current-user.decorator';
import { UserRole } from '@/shared/types';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles(UserRole.admin)
  @ApiOperation({ summary: 'Create new user (Admin only)' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async create(
    @Body()
    createUserDto: {
      email: string;
      name: string;
      password: string;
      role: UserRole;
      phone?: string;
      cpf: string;
      cro?: string;
    }
  ) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @Roles(UserRole.admin)
  @ApiOperation({ summary: 'Get all users (Admin only)' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'role', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  async findAll() {
    return this.usersService.findAll();
  }

  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Profile retrieved successfully' })
  async getProfile(@CurrentUser() user: { id: string; role: UserRole }) {
    return this.usersService.findById(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'User retrieved successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findOne(
    @Param('id') id: string,
    @CurrentUser() currentUser: { id: string; role: UserRole }
  ) {
    if (currentUser.role !== UserRole.admin && currentUser.id !== id) {
      throw new Error('Forbidden');
    }
    return this.usersService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateUserDto: Record<string, unknown>,
    @CurrentUser() currentUser: { id: string; role: UserRole }
  ) {
    if (currentUser.role !== UserRole.admin && currentUser.id !== id) {
      throw new Error('Forbidden');
    }
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @Roles(UserRole.admin)
  @ApiOperation({ summary: 'Delete user (Admin only)' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @Patch(':id/activate')
  @Roles(UserRole.admin)
  @ApiOperation({ summary: 'Activate/deactivate user (Admin only)' })
  @ApiResponse({ status: 200, description: 'User status updated successfully' })
  async toggleActive(@Param('id') id: string) {
    return this.usersService.toggleActive(id);
  }
}
