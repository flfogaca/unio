import { Controller, Post, Body, Get } from '@nestjs/common';
import { PrismaService } from '@/infrastructure/database/prisma.service';
import * as bcrypt from 'bcrypt';

@Controller('test')
export class TestController {
  constructor(private prismaService: PrismaService) {}

  @Post('login')
  async testLogin(@Body() body: { cpf: string; password: string }) {
    try {
      const user = await this.prismaService.user.findUnique({
        where: { cpf: body.cpf },
      });

      if (!user) {
        return { error: 'User not found' };
      }

      const passwordMatch = await bcrypt.compare(body.password, user.password);
      
      return {
        userFound: !!user,
        passwordMatch,
        user: {
          id: user.id,
          cpf: user.cpf,
          email: user.email,
          name: user.name,
          role: user.role
        }
      };
    } catch (error) {
      return { error: error.message };
    }
  }

  @Get('users')
  async getUsers() {
    return this.prismaService.user.findMany({
      select: {
        id: true,
        cpf: true,
        email: true,
        name: true,
        role: true
      }
    });
  }
}
