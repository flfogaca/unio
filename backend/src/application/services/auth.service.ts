import { Injectable, UnauthorizedException, ConflictException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '@/infrastructure/database/prisma.service';
import { RedisService } from '@/infrastructure/external-services/redis.service';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { JwtPayload, UserRole } from '@/shared/types';
import { User, Prisma } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
  ) {}

  async validateUser(cpf: string, password: string): Promise<any> {
    const user = await this.prismaService.findUserByCPF(cpf);
    
    if (!user) {
      throw new UnauthorizedException('CPF ou senha incorretos');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Usuário inativo');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      throw new UnauthorizedException('CPF ou senha incorretos');
    }

    // Update last login
    await this.prismaService.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Set user as online in Redis
    await this.redisService.setUserOnline(user.id);

    // Create audit log
    await this.prismaService.createAuditLog({
      userId: user.id,
      action: 'login',
      entityType: 'User',
      entityId: user.id,
      newData: { loginTime: new Date() },
    });

    const { password: _, ...result } = user;
    return result;
  }

  async login(user: any) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    // Store refresh token in Redis
    await this.redisService.set(`refresh_token:${user.id}`, refreshToken, 7 * 24 * 60 * 60);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: user.id,
        cpf: user.cpf,
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone,
        birthDate: user.birthDate,
        avatar: user.avatar,
        cro: user.cro,
        specialties: user.specialties,
        isActive: user.isActive,
        isOnline: user.isOnline,
      },
    };
  }

  async register(registerDto: RegisterDto): Promise<any> {
    const { password, ...userData } = registerDto;

    // Check if user already exists
    const existingUserByCPF = await this.prismaService.findUserByCPF(registerDto.cpf);
    if (existingUserByCPF) {
      throw new ConflictException('CPF já cadastrado');
    }

    const existingUserByEmail = await this.prismaService.findUserByEmail(registerDto.email);
    if (existingUserByEmail) {
      throw new ConflictException('Email já cadastrado');
    }

    // Validate CPF
    if (!this.isValidCPF(registerDto.cpf)) {
      throw new ConflictException('CPF inválido');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await this.prismaService.user.create({
      data: {
        ...userData,
        password: hashedPassword,
        birthDate: registerDto.birthDate ? new Date(registerDto.birthDate) : null,
      },
    });

    // Create audit log
    await this.prismaService.createAuditLog({
      action: 'create',
      entityType: 'User',
      entityId: user.id,
      newData: {
        cpf: user.cpf,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });

    const { password: _, ...result } = user;
    return result;
  }

  async refreshToken(refreshToken: string): Promise<any> {
    try {
      const payload = this.jwtService.verify(refreshToken) as JwtPayload;
      
      // Check if refresh token exists in Redis
      const storedToken = await this.redisService.get(`refresh_token:${payload.sub}`);
      if (!storedToken || storedToken !== refreshToken) {
        throw new UnauthorizedException('Refresh token inválido');
      }

      // Get user
      const user = await this.prismaService.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user || !user.isActive) {
        throw new UnauthorizedException('Usuário não encontrado ou inativo');
      }

      // Generate new tokens
      const newPayload: JwtPayload = {
        sub: user.id,
        email: user.email,
        role: user.role,
      };

      const newAccessToken = this.jwtService.sign(newPayload);
      const newRefreshToken = this.jwtService.sign(newPayload, { expiresIn: '7d' });

      // Update refresh token in Redis
      await this.redisService.set(`refresh_token:${user.id}`, newRefreshToken, 7 * 24 * 60 * 60);

      return {
        access_token: newAccessToken,
        refresh_token: newRefreshToken,
      };
    } catch (error) {
      throw new UnauthorizedException('Refresh token inválido');
    }
  }

  async logout(userId: string): Promise<void> {
    // Remove refresh token from Redis
    await this.redisService.del(`refresh_token:${userId}`);
    
    // Set user as offline
    await this.redisService.setUserOffline(userId);

    // Update user status in database
    await this.prismaService.user.update({
      where: { id: userId },
      data: { isOnline: false },
    });

    // Create audit log
    await this.prismaService.createAuditLog({
      userId,
      action: 'logout',
      entityType: 'User',
      entityId: userId,
      newData: { logoutTime: new Date() },
    });
  }

  async getProfile(userId: string): Promise<any> {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        cpf: true,
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
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return user;
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Senha atual incorreta');
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    await this.prismaService.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });

    // Create audit log
    await this.prismaService.createAuditLog({
      userId,
      action: 'change_password',
      entityType: 'User',
      entityId: userId,
      oldData: { action: 'password_changed' },
    });
  }

  private isValidCPF(cpf: string): boolean {
    // Remove non-numeric characters
    const cleanCPF = cpf.replace(/\D/g, '');
    
    if (cleanCPF.length !== 11 || /^(\d)\1{10}$/.test(cleanCPF)) {
      return false;
    }

    // Validate first digit
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
    }
    let remainder = 11 - (sum % 11);
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleanCPF.charAt(9))) return false;

    // Validate second digit
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
    }
    remainder = 11 - (sum % 11);
    if (remainder === 10 || remainder === 11) remainder = 0;
    return remainder === parseInt(cleanCPF.charAt(10));
  }
}
