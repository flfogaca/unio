import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
} from '@nestjs/common';
import { PrismaService } from '@/infrastructure/database/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { Public } from '@/shared/decorators/public.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UserRole } from '@/shared/types';
import * as bcrypt from 'bcrypt';

@Controller('simple-auth')
export class SimpleAuthController {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService
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
      console.log('🔐 Generating token with payload:', payload);
      const token = this.jwtService.sign(payload);
      console.log('✅ Token generated:', token.substring(0, 30) + '...');

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

  @Public()
  @Post('validate-external-token')
  async validateExternalToken(@Body() body: { token: string }) {
    try {
      const token = body.token;
      if (!token) {
        return { success: false, message: 'Token não fornecido' };
      }

      const parts = token.split('.');
      if (parts.length !== 3) {
        return { success: false, message: 'Token inválido' };
      }

      const payload = JSON.parse(
        Buffer.from(parts[1], 'base64').toString('utf-8')
      );

      const externalUserId = payload.Id;
      const perfilId = payload.PerfilId || '2';

      if (!externalUserId) {
        return {
          success: false,
          message: 'ID do usuário não encontrado no token',
        };
      }

      const now = Math.floor(Date.now() / 1000);
      if (payload.exp && payload.exp < now) {
        return { success: false, message: 'Token expirado' };
      }

      let user = await this.prismaService.user.findFirst({
        where: {
          OR: [{ id: externalUserId }, { cpf: externalUserId }],
        },
      });

      if (!user) {
        const roleMap: Record<string, string> = {
          '1': 'admin',
          '2': 'paciente',
          '3': 'dentista',
          '4': 'medico',
          '5': 'psicologo',
        };

        const role = roleMap[perfilId] || 'paciente';

        user = await this.prismaService.user.create({
          data: {
            id: externalUserId,
            email: `user_${externalUserId}@unio.com`,
            cpf: externalUserId,
            name: `Usuário ${externalUserId}`,
            password: await bcrypt.hash('temp_password', 10),
            role: role as UserRole,
            isActive: true,
          },
        });
      }

      const localPayload = {
        email: user.email,
        sub: user.id,
        role: user.role,
      };

      const localToken = this.jwtService.sign(localPayload);

      return {
        success: true,
        data: {
          token: localToken,
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
      return { success: false, message: (error as Error).message };
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req: any) {
    try {
      let userId: string | undefined;

      if (req.user) {
        userId = req.user.id || req.user.sub;
      }

      if (!userId) {
        const authHeader = req.headers.authorization;
        if (authHeader) {
          const token = authHeader.replace('Bearer ', '');
          try {
            const payload = this.jwtService.decode(token) as {
              sub?: string;
              id?: string;
            };
            userId = payload.sub || payload.id;
          } catch {
            return {
              success: false,
              message: 'Token inválido',
            };
          }
        }
      }

      if (!userId) {
        return {
          success: false,
          message: 'ID do usuário não encontrado no token',
        };
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
      return { success: false, message: (error as Error).message };
    }
  }
}
