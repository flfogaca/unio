import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/infrastructure/database/prisma.service';
import { JwtPayload, UserRole } from '@/shared/types';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.prismaService.user.findUnique({
      where: { id: payload.sub },
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

    if (!user || !user.isActive) {
      return null;
    }

    return {
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
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
