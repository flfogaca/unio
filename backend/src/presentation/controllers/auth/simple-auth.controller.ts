import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { PrismaService } from '@/infrastructure/database/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { Public } from '@/shared/decorators/public.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from '@/shared/decorators/current-user.decorator';
import * as bcrypt from 'bcrypt';

@Controller('simple-auth')
export class SimpleAuthController {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
  ) {}

  @Public()
  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    try {
      const user = await this.prismaService.user.findUnique({
        where: { email: body.email },
      });

      if (!user) {
        return { success: false, message: 'Usuário não encontrado' };
      }

      const passwordMatch = await bcrypt.compare(body.password, user.password);
      
      if (!passwordMatch) {
        return { success: false, message: 'Senha incorreta' };
      }

      const payload = { email: user.email, sub: user.id, role: user.role };
      const token = this.jwtService.sign(payload);
      
      return {
        success: true,
        data: {
          token, // Mudando de access_token para token para compatibilidade com frontend
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            cpf: user.cpf,
          },
        },
      };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@CurrentUser() user: any) {
    try {
      console.log('User from JWT:', user); // Debug
      
      const userId = user.sub || user.id;
      if (!userId) {
        return { success: false, message: 'ID do usuário não encontrado no token' };
      }

      const userProfile = await this.prismaService.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          cpf: true,
          phone: true,
          birthDate: true,
          avatar: true,
          isOnline: true,
          cro: true,
          specialties: true,
        },
      });

      if (!userProfile) {
        return { success: false, message: 'Usuário não encontrado' };
      }

      return {
        success: true,
        data: userProfile,
      };
    } catch (error) {
      console.error('Profile error:', error); // Debug
      return { success: false, message: error.message };
    }
  }
}
