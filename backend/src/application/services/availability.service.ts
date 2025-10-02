import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/infrastructure/database/prisma.service';
import { RedisService } from '@/infrastructure/external-services/redis.service';
import { Specialty, UserRole } from '@/shared/types';

interface AvailabilitySchedule {
  specialty: Specialty;
  is24h: boolean;
  workingHours: {
    start: string; // HH:MM format
    end: string;   // HH:MM format
    days: number[]; // 0-6 (Sunday to Saturday)
  };
  emergencyHours?: {
    start: string;
    end: string;
    days: number[];
  };
  timezone: string;
}

interface ProfessionalAvailability {
  userId: string;
  specialty: Specialty;
  isOnline: boolean;
  isAvailable: boolean;
  currentStatus: 'available' | 'busy' | 'away' | 'offline';
  lastActivity: Date;
  workingHours: AvailabilitySchedule['workingHours'];
  timezone: string;
}

interface SystemAvailability {
  specialty: Specialty;
  isAvailable: boolean;
  onlineProfessionals: number;
  estimatedWaitTime: number;
  nextAvailableTime?: Date;
  emergencyMode: boolean;
}

@Injectable()
export class AvailabilityService {
  private readonly logger = new Logger(AvailabilityService.name);
  
  // Cache duration for availability data (2 minutes)
  private readonly CACHE_DURATION = 2 * 60;

  constructor(
    private readonly prismaService: PrismaService,
    private readonly redisService: RedisService,
  ) {}

  /**
   * Check if a specialty is available right now
   */
  async checkSpecialtyAvailability(specialty: Specialty): Promise<SystemAvailability> {
    const cacheKey = `availability:${specialty}`;
    
    // Try cache first
    const cached = await this.redisService.get(cacheKey);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (error) {
        this.logger.warn(`Failed to parse cached availability for ${specialty}:`, error);
      }
    }

    const availability = await this.calculateSpecialtyAvailability(specialty);
    
    // Cache the result
    await this.redisService.set(cacheKey, JSON.stringify(availability), this.CACHE_DURATION);
    
    return availability;
  }

  /**
   * Get all specialties availability
   */
  async getAllSpecialtiesAvailability(): Promise<SystemAvailability[]> {
    const specialties = Object.values(Specialty);
    const availabilities = await Promise.all(
      specialties.map(specialty => this.checkSpecialtyAvailability(specialty))
    );
    
    return availabilities;
  }

  /**
   * Update professional availability status
   */
  async updateProfessionalAvailability(
    userId: string,
    isOnline: boolean,
    status: 'available' | 'busy' | 'away' | 'offline' = 'available'
  ): Promise<void> {
    try {
      // Update database
      await this.prismaService.user.update({
        where: { id: userId },
        data: {
          isOnline,
          lastLogin: isOnline ? new Date() : undefined,
        },
      });

      // Update professional-specific availability if user is a professional
      const user = await this.prismaService.user.findUnique({
        where: { id: userId },
        include: {
          doctor: true,
        },
      });

      if (user?.doctor) {
        await this.prismaService.doctor.update({
          where: { userId },
          data: {
            isAvailable: isOnline && status === 'available',
          },
        });
      }

      // Clear availability cache for the specialty
      if (user?.doctor) {
        const specialty = user.doctor.specialtyId;
        await this.redisService.del(`availability:${specialty}`);
      }

      // Update Redis with current status
      await this.redisService.set(
        `professional:${userId}:status`,
        JSON.stringify({
          isOnline,
          status,
          lastActivity: new Date(),
        }),
        300 // 5 minutes
      );

      this.logger.log(`Updated availability for professional ${userId}: ${status}`);
    } catch (error) {
      this.logger.error(`Failed to update professional availability for ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Get professional availability status
   */
  async getProfessionalAvailability(userId: string): Promise<ProfessionalAvailability | null> {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      include: {
        doctor: {
          include: {
            specialty: true,
          },
        },
      },
    });

    if (!user || !user.doctor) {
      return null;
    }

    // Get cached status from Redis
    const cachedStatus = await this.redisService.get(`professional:${userId}:status`);
    let status = 'available' as const;
    let lastActivity = user.lastLogin || new Date();

    if (cachedStatus) {
      try {
        const parsed = JSON.parse(cachedStatus);
        status = parsed.status;
        lastActivity = new Date(parsed.lastActivity);
      } catch (error) {
        this.logger.warn(`Failed to parse cached status for ${userId}:`, error);
      }
    }

    return {
      userId: user.id,
      specialty: user.doctor.specialtyId as Specialty,
      isOnline: user.isOnline || false,
      isAvailable: user.doctor.isAvailable && user.isOnline,
      currentStatus: status as any,
      lastActivity,
      workingHours: {
        start: '08:00',
        end: '18:00',
        days: [1, 2, 3, 4, 5], // Monday to Friday
      },
      timezone: 'America/Sao_Paulo',
    };
  }

  /**
   * Set 24/7 availability for a specialty
   */
  async setSpecialty24hAvailability(specialty: Specialty, enabled: boolean): Promise<void> {
    // Update system configuration
    await this.prismaService.systemConfig.upsert({
      where: { key: `24H_${specialty.toUpperCase()}` },
      update: { value: enabled ? 'true' : 'false' },
      create: {
        id: this.generateUUID(),
        key: `24H_${specialty.toUpperCase()}`,
        value: enabled ? 'true' : 'false',
        description: `24/7 availability for ${specialty}`,
      },
    });

    // Clear cache
    await this.redisService.del(`availability:${specialty}`);
    
    this.logger.log(`Set 24/7 availability for ${specialty}: ${enabled}`);
  }

  /**
   * Check if specialty has 24/7 availability enabled
   */
  async isSpecialty24hEnabled(specialty: Specialty): Promise<boolean> {
    const config = await this.prismaService.systemConfig.findUnique({
      where: { key: `24H_${specialty.toUpperCase()}` },
    });

    return config?.value === 'true';
  }

  /**
   * Get next available time for a specialty
   */
  async getNextAvailableTime(specialty: Specialty): Promise<Date | null> {
    const availability = await this.checkSpecialtyAvailability(specialty);
    
    if (availability.isAvailable) {
      return new Date(); // Available now
    }

    const is24h = await this.isSpecialty24hEnabled(specialty);
    if (is24h) {
      // For 24/7 specialties, next available time is when a professional comes online
      const onlineProfessionals = await this.getOnlineProfessionalsCount(specialty);
      if (onlineProfessionals === 0) {
        // Estimate based on historical data when professionals usually come online
        const nextHour = new Date();
        nextHour.setHours(nextHour.getHours() + 1, 0, 0, 0);
        return nextHour;
      }
    }

    // Calculate based on working hours
    const workingHours = await this.getWorkingHours(specialty);
    const now = new Date();
    const currentHour = now.getHours();
    const currentDay = now.getDay();

    // Check if it's within working hours
    const startHour = parseInt(workingHours.start.split(':')[0]);
    const endHour = parseInt(workingHours.end.split(':')[0]);

    if (workingHours.days.includes(currentDay) && currentHour >= startHour && currentHour < endHour) {
      // Should be available during working hours, but no professionals online
      // Next available time is when a professional comes online (estimate)
      const nextHour = new Date();
      nextHour.setHours(nextHour.getHours() + 1, 0, 0, 0);
      return nextHour;
    }

    // Next available time is start of next working day
    const nextWorkingDay = this.getNextWorkingDay(workingHours, now);
    const nextAvailable = new Date(nextWorkingDay);
    nextAvailable.setHours(startHour, 0, 0, 0);
    
    return nextAvailable;
  }

  /**
   * Calculate specialty availability
   */
  private async calculateSpecialtyAvailability(specialty: Specialty): Promise<SystemAvailability> {
    const [
      onlineProfessionals,
      is24hEnabled,
      workingHours,
      queueLength,
    ] = await Promise.all([
      this.getOnlineProfessionalsCount(specialty),
      this.isSpecialty24hEnabled(specialty),
      this.getWorkingHours(specialty),
      this.getQueueLength(specialty),
    ]);

    const now = new Date();
    const isWithinWorkingHours = this.isWithinWorkingHours(now, workingHours);
    const isAvailable = (is24hEnabled || isWithinWorkingHours) && onlineProfessionals > 0;
    
    // Calculate estimated wait time
    const estimatedWaitTime = onlineProfessionals > 0 ? 
      Math.round((queueLength * 30) / onlineProfessionals) : 999;

    // Emergency mode: available even outside working hours if 24h enabled
    const emergencyMode = is24hEnabled && !isWithinWorkingHours && onlineProfessionals > 0;

    // Get next available time if not available
    let nextAvailableTime: Date | undefined;
    if (!isAvailable) {
      nextAvailableTime = await this.getNextAvailableTime(specialty);
    }

    return {
      specialty,
      isAvailable,
      onlineProfessionals,
      estimatedWaitTime,
      nextAvailableTime,
      emergencyMode,
    };
  }

  /**
   * Get working hours for a specialty
   */
  private async getWorkingHours(specialty: Specialty): Promise<AvailabilitySchedule['workingHours']> {
    // Default working hours
    const defaultHours = {
      start: '08:00',
      end: '18:00',
      days: [1, 2, 3, 4, 5], // Monday to Friday
    };

    // Try to get from system config
    const config = await this.prismaService.systemConfig.findUnique({
      where: { key: `WORKING_HOURS_${specialty.toUpperCase()}` },
    });

    if (config) {
      try {
        return JSON.parse(config.value);
      } catch (error) {
        this.logger.warn(`Failed to parse working hours for ${specialty}:`, error);
      }
    }

    return defaultHours;
  }

  /**
   * Check if current time is within working hours
   */
  private isWithinWorkingHours(now: Date, workingHours: AvailabilitySchedule['workingHours']): boolean {
    const currentDay = now.getDay();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = currentHour * 60 + currentMinute;

    // Check if it's a working day
    if (!workingHours.days.includes(currentDay)) {
      return false;
    }

    // Parse working hours
    const [startHour, startMinute] = workingHours.start.split(':').map(Number);
    const [endHour, endMinute] = workingHours.end.split(':').map(Number);
    const startTime = startHour * 60 + startMinute;
    const endTime = endHour * 60 + endMinute;

    return currentTime >= startTime && currentTime < endTime;
  }

  /**
   * Get next working day
   */
  private getNextWorkingDay(workingHours: AvailabilitySchedule['workingHours'], from: Date): Date {
    const nextDay = new Date(from);
    nextDay.setDate(nextDay.getDate() + 1);

    // Find next working day
    while (!workingHours.days.includes(nextDay.getDay())) {
      nextDay.setDate(nextDay.getDate() + 1);
    }

    return nextDay;
  }

  /**
   * Get count of online professionals for a specialty
   */
  private async getOnlineProfessionalsCount(specialty: Specialty): Promise<number> {
    const role = this.getRoleForSpecialty(specialty);
    
    return this.prismaService.user.count({
      where: {
        role,
        isActive: true,
        isOnline: true,
      },
    });
  }

  /**
   * Get queue length for a specialty
   */
  private async getQueueLength(specialty: Specialty): Promise<number> {
    return this.prismaService.consultation.count({
      where: {
        specialty: specialty as any,
        status: 'em_fila',
      },
    });
  }

  /**
   * Get role for specialty
   */
  private getRoleForSpecialty(specialty: Specialty): string {
    const mapping = {
      [Specialty.psicologo]: 'psicologo',
      [Specialty.dentista]: 'dentista',
      [Specialty.medico_clinico]: 'medico',
    };
    return mapping[specialty] || specialty;
  }

  /**
   * Generate UUID
   */
  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}
