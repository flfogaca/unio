import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '@/infrastructure/database/prisma.service';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.prismaService.user.findUnique({
      where: { email },
    });

    if (user && await bcrypt.compare(password, user.password)) {
      const { password: _, ...result } = user;
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  async register(registerDto: RegisterDto) {
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    
    const user = await this.prismaService.user.create({
      data: {
        cpf: registerDto.cpf,
        email: registerDto.email,
        password: hashedPassword,
        name: registerDto.name,
        phone: registerDto.phone,
        birthDate: registerDto.birthDate ? new Date(registerDto.birthDate) : null,
        role: 'paciente',
      },
    });

    const { password: _, ...result } = user;
    return result;
  }

  async refreshToken(refreshToken: string) {
    // Implementação básica - em produção usar refresh token real
    throw new UnauthorizedException('Refresh token not implemented');
  }

  async logout(userId: string) {
    // Implementação básica - em produção invalidar tokens
    return { message: 'Logged out successfully' };
  }

  async getProfile(userId: string) {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        birthDate: true,
        avatar: true,
        cro: true,
        specialties: true,
        isActive: true,
        isOnline: true,
        lastLoginAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }
}