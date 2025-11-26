import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/infrastructure/database/prisma.service';
import { UserRole } from '@/shared/types';
import * as bcrypt from 'bcrypt';

interface CreateUserDto {
  email: string;
  name: string;
  password: string;
  role: UserRole;
  phone?: string;
  cpf: string;
  cro?: string;
}

interface UpdateUserDto {
  email?: string;
  name?: string;
  password?: string;
  role?: UserRole;
  phone?: string;
  cpf?: string;
  cro?: string;
  isActive?: boolean;
}

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const userData = {
      email: createUserDto.email,
      name: createUserDto.name,
      password: hashedPassword,
      role: createUserDto.role,
      phone: createUserDto.phone || null,
      isActive: true,
      cpf: createUserDto.cpf,
      ...(createUserDto.cro && { cro: createUserDto.cro }),
    };

    return this.prismaService.user.create({
      data: userData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        isActive: true,
        createdAt: true,
      },
    });
  }

  async findAll() {
    return this.prismaService.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });
  }

  async findOne(id: string) {
    return this.prismaService.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        birthDate: true,
        isActive: true,
        createdAt: true,
      },
    });
  }

  async findById(id: string) {
    return this.findOne(id);
  }

  async update(id: string, updateData: UpdateUserDto) {
    return this.prismaService.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        birthDate: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async remove(id: string) {
    await this.prismaService.user.delete({
      where: { id },
    });
    return { message: `User with ID ${id} deleted successfully` };
  }

  async toggleActive(id: string) {
    const user = await this.prismaService.user.findUnique({
      where: { id },
      select: { isActive: true },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return this.update(id, { isActive: !user.isActive });
  }
}
