import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/infrastructure/database/prisma.service';
import { RedisService } from '@/infrastructure/external-services/redis.service';
import { Specialty } from '@/shared/types';

@Injectable()
export class AvailabilityService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly redisService: RedisService,
  ) {}

  async getAvailability(specialty: Specialty) {
    const role = this.getRoleForSpecialty(specialty);
    
    const professionals = await this.prismaService.user.findMany({
      where: {
        role: role as any,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        isOnline: true,
        lastLoginAt: true,
      },
    });

    const onlineProfessionals = professionals.filter(p => p.isOnline);
    const totalProfessionals = professionals.length;

    return {
      specialty,
      totalProfessionals,
      onlineProfessionals: onlineProfessionals.length,
      availabilityPercentage: totalProfessionals > 0 ? (onlineProfessionals.length / totalProfessionals) * 100 : 0,
      professionals: onlineProfessionals,
    };
  }

  async setOnlineStatus(userId: string, isOnline: boolean) {
    await this.prismaService.user.update({
      where: { id: userId },
      data: {
        isOnline,
        lastLoginAt: isOnline ? new Date() : undefined,
      },
    });

    // Update Redis cache
    if (isOnline) {
      await this.redisService.setUserOnline(userId);
    } else {
      await this.redisService.setUserOffline(userId);
    }
  }

  async getEmergencyMode() {
    const emergencyData = await this.redisService.get('emergency_mode');
    return emergencyData ? JSON.parse(emergencyData) : { isActive: false };
  }

  async setEmergencyMode(isActive: boolean, specialty?: Specialty) {
    const emergencyData = {
      isActive,
      specialty,
      activatedAt: new Date().toISOString(),
    };

    await this.redisService.set('emergency_mode', JSON.stringify(emergencyData), 24 * 60 * 60); // 24 hours
    return emergencyData;
  }

  private getRoleForSpecialty(specialty: Specialty): string {
    const roleMap = {
      'psicologo': 'psicologo',
      'dentista': 'dentista',
      'medico_clinico': 'medico',
    };
    return roleMap[specialty] || 'medico';
  }

  async checkSpecialtyAvailability(specialty: Specialty) {
    const availability = await this.getAvailability(specialty);
    return {
      specialty,
      hasAvailableProfessionals: availability.onlineProfessionals > 0,
      onlineProfessionals: availability.onlineProfessionals,
      totalProfessionals: availability.totalProfessionals,
    };
  }

  async getAllSpecialtiesAvailability() {
    const specialties = Object.values(Specialty);
    const results = await Promise.all(
      specialties.map(specialty => this.checkSpecialtyAvailability(specialty))
    );
    return results;
  }

  async getProfessionalAvailability(userId: string) {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        role: true,
        specialties: true,
        isOnline: true,
        isActive: true,
      },
    });

    if (!user) {
      throw new Error('Professional not found');
    }

    return {
      id: user.id,
      name: user.name,
      role: user.role,
      specialties: user.specialties,
      isOnline: user.isOnline,
      isActive: user.isActive,
    };
  }

  async updateProfessionalAvailability(userId: string, isOnline: boolean) {
    const updatedUser = await this.prismaService.user.update({
      where: { id: userId },
      data: { isOnline },
      select: {
        id: true,
        name: true,
        role: true,
        isOnline: true,
        isActive: true,
      },
    });

    // Update Redis cache
    if (isOnline) {
      await this.redisService.setUserOnline(userId);
    } else {
      await this.redisService.setUserOffline(userId);
    }

    return updatedUser;
  }

  async setSpecialty24hAvailability(specialty: Specialty, is24h: boolean) {
    // This would typically update a configuration table
    // For now, we'll just return the current state
    const availability = await this.getAvailability(specialty);
    return {
      specialty,
      is24h,
      message: `24h availability for ${specialty} ${is24h ? 'enabled' : 'disabled'}`,
    };
  }

  async getNextAvailableTime(specialty: Specialty) {
    const availability = await this.getAvailability(specialty);
    
    if (availability.onlineProfessionals > 0) {
      return {
        specialty,
        nextAvailableTime: new Date(),
        estimatedWaitTime: 0,
        message: 'Available now',
      };
    }

    // Calculate next available time based on historical data
    const nextAvailableTime = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes from now
    
    return {
      specialty,
      nextAvailableTime,
      estimatedWaitTime: 30,
      message: 'Next available in approximately 30 minutes',
    };
  }
}