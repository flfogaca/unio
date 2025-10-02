import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/infrastructure/database/prisma.service';
import { RedisService } from '@/infrastructure/external-services/redis.service';
import { Specialty, PriorityLevel } from '@/shared/types';

interface WaitTimeCalculation {
  specialty: Specialty;
  estimatedWaitTime: number; // in minutes
  queueLength: number;
  onlineProfessionals: number;
  averageConsultationDuration: number;
  lastCalculated: Date;
  confidence: 'high' | 'medium' | 'low';
}

interface HistoricalData {
  averageWaitTime: number;
  averageDuration: number;
  consultationCount: number;
  peakHours: number[];
  offPeakHours: number[];
}

@Injectable()
export class WaitTimeService {
  private readonly logger = new Logger(WaitTimeService.name);
  
  // Cache duration for wait time calculations (5 minutes)
  private readonly CACHE_DURATION = 5 * 60;
  
  // Default consultation durations by specialty (in minutes)
  private readonly DEFAULT_DURATIONS: Record<Specialty, number> = {
    [Specialty.psicologo]: 45,
    [Specialty.dentista]: 30,
    [Specialty.medico_clinico]: 20,
  };

  constructor(
    private readonly prismaService: PrismaService,
    private readonly redisService: RedisService,
  ) {}

  /**
   * Calculate estimated wait time for a specialty
   */
  async calculateWaitTime(specialty: Specialty): Promise<WaitTimeCalculation> {
    const cacheKey = `wait-time:${specialty}`;
    
    // Try to get from cache first
    const cached = await this.redisService.get(cacheKey);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (error) {
        this.logger.warn(`Failed to parse cached wait time for ${specialty}:`, error);
      }
    }

    // Calculate new wait time
    const calculation = await this.performWaitTimeCalculation(specialty);
    
    // Cache the result
    await this.redisService.set(cacheKey, JSON.stringify(calculation), this.CACHE_DURATION);
    
    return calculation;
  }

  /**
   * Get wait time for multiple specialties
   */
  async getWaitTimesForSpecialties(specialties: Specialty[]): Promise<WaitTimeCalculation[]> {
    const calculations = await Promise.all(
      specialties.map(specialty => this.calculateWaitTime(specialty))
    );
    
    return calculations;
  }

  /**
   * Get real-time queue position and estimated wait time for a specific consultation
   */
  async getConsultationWaitTime(consultationId: string): Promise<{
    position: number;
    estimatedWaitTime: number;
    specialty: Specialty;
  }> {
    const consultation = await this.prismaService.consultation.findUnique({
      where: { id: consultationId },
      include: {
        specialty: true,
      },
    });

    if (!consultation) {
      throw new Error('Consultation not found');
    }

    // Get queue position
    const position = await this.getQueuePosition(consultationId, consultation.specialty as Specialty);
    
    // Calculate wait time based on position and specialty
    const specialtyWaitTime = await this.calculateWaitTime(consultation.specialty as Specialty);
    const estimatedWaitTime = Math.round((position - 1) * (specialtyWaitTime.averageConsultationDuration / specialtyWaitTime.onlineProfessionals));

    return {
      position,
      estimatedWaitTime,
      specialty: consultation.specialty as Specialty,
    };
  }

  /**
   * Update wait time when consultation status changes
   */
  async updateWaitTimeOnStatusChange(
    consultationId: string,
    oldStatus: string,
    newStatus: string,
    specialty: Specialty,
  ): Promise<void> {
    // Clear cache when queue changes
    const cacheKey = `wait-time:${specialty}`;
    await this.redisService.del(cacheKey);

    // Update queue statistics
    await this.updateQueueStatistics(specialty);

    // Log the change for analytics
    this.logger.log(`Consultation ${consultationId} status changed from ${oldStatus} to ${newStatus} for specialty ${specialty}`);
  }

  /**
   * Get historical wait time data for analytics
   */
  async getHistoricalData(specialty: Specialty, days: number = 7): Promise<HistoricalData> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const consultations = await this.prismaService.consultation.findMany({
      where: {
        specialty: specialty as any,
        createdAt: {
          gte: startDate,
        },
        status: 'finalizado',
      },
      select: {
        createdAt: true,
        startedAt: true,
        finishedAt: true,
      },
    });

    if (consultations.length === 0) {
      return {
        averageWaitTime: 0,
        averageDuration: this.DEFAULT_DURATIONS[specialty],
        consultationCount: 0,
        peakHours: [],
        offPeakHours: [],
      };
    }

    // Calculate average wait time (time between creation and start)
    const waitTimes = consultations
      .filter(c => c.startedAt)
      .map(c => {
        const waitTime = c.startedAt!.getTime() - c.createdAt.getTime();
        return Math.round(waitTime / (1000 * 60)); // Convert to minutes
      });

    // Calculate average duration
    const durations = consultations
      .filter(c => c.startedAt && c.finishedAt)
      .map(c => {
        const duration = c.finishedAt!.getTime() - c.startedAt!.getTime();
        return Math.round(duration / (1000 * 60)); // Convert to minutes
      });

    // Analyze peak hours
    const hourlyCounts = new Array(24).fill(0);
    consultations.forEach(c => {
      const hour = c.createdAt.getHours();
      hourlyCounts[hour]++;
    });

    const averageConsultations = consultations.length / 24;
    const peakHours = hourlyCounts
      .map((count, hour) => ({ hour, count }))
      .filter(item => item.count > averageConsultations * 1.5)
      .map(item => item.hour);

    const offPeakHours = hourlyCounts
      .map((count, hour) => ({ hour, count }))
      .filter(item => item.count < averageConsultations * 0.5)
      .map(item => item.hour);

    return {
      averageWaitTime: waitTimes.length > 0 ? Math.round(waitTimes.reduce((a, b) => a + b, 0) / waitTimes.length) : 0,
      averageDuration: durations.length > 0 ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : this.DEFAULT_DURATIONS[specialty],
      consultationCount: consultations.length,
      peakHours,
      offPeakHours,
    };
  }

  /**
   * Get queue statistics for dashboard
   */
  async getQueueStatistics(specialty: Specialty) {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [
      queueLength,
      inProgress,
      completedToday,
      onlineProfessionals,
    ] = await Promise.all([
      // Queue length
      this.prismaService.consultation.count({
        where: {
          specialty: specialty as any,
          status: 'em_fila',
        },
      }),
      
      // In progress
      this.prismaService.consultation.count({
        where: {
          specialty: specialty as any,
          status: 'em_atendimento',
        },
      }),
      
      // Completed today
      this.prismaService.consultation.count({
        where: {
          specialty: specialty as any,
          status: 'finalizado',
          finishedAt: {
            gte: todayStart,
          },
        },
      }),
      
      // Online professionals
      this.prismaService.user.count({
        where: {
          role: this.getRoleForSpecialty(specialty),
          isActive: true,
          isOnline: true,
        },
      }),
    ]);

    return {
      specialty,
      queueLength,
      inProgress,
      completedToday,
      onlineProfessionals,
      lastUpdated: now,
    };
  }

  /**
   * Perform the actual wait time calculation
   */
  private async performWaitTimeCalculation(specialty: Specialty): Promise<WaitTimeCalculation> {
    const [
      queueLength,
      onlineProfessionals,
      historicalData,
    ] = await Promise.all([
      this.getQueueLength(specialty),
      this.getOnlineProfessionalsCount(specialty),
      this.getHistoricalData(specialty, 7),
    ]);

    const averageConsultationDuration = historicalData.averageDuration || this.DEFAULT_DURATIONS[specialty];
    
    // Calculate estimated wait time
    let estimatedWaitTime = 0;
    let confidence: 'high' | 'medium' | 'low' = 'low';

    if (onlineProfessionals > 0) {
      // Base calculation: queue length * average duration / professionals
      const baseWaitTime = Math.round((queueLength * averageConsultationDuration) / onlineProfessionals);
      
      // Adjust based on historical data
      const historicalAdjustment = historicalData.averageWaitTime > 0 ? 
        (historicalData.averageWaitTime + baseWaitTime) / 2 : baseWaitTime;
      
      // Time of day adjustment
      const currentHour = new Date().getHours();
      const isPeakHour = historicalData.peakHours.includes(currentHour);
      const isOffPeakHour = historicalData.offPeakHours.includes(currentHour);
      
      if (isPeakHour) {
        estimatedWaitTime = Math.round(historicalAdjustment * 1.3);
        confidence = 'medium';
      } else if (isOffPeakHour) {
        estimatedWaitTime = Math.round(historicalAdjustment * 0.7);
        confidence = 'high';
      } else {
        estimatedWaitTime = Math.round(historicalAdjustment);
        confidence = historicalData.consultationCount > 10 ? 'high' : 'medium';
      }
    }

    return {
      specialty,
      estimatedWaitTime,
      queueLength,
      onlineProfessionals,
      averageConsultationDuration,
      lastCalculated: new Date(),
      confidence,
    };
  }

  /**
   * Get current queue length for a specialty
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
   * Get queue position for a specific consultation
   */
  private async getQueuePosition(consultationId: string, specialty: Specialty): Promise<number> {
    const consultation = await this.prismaService.consultation.findUnique({
      where: { id: consultationId },
    });

    if (!consultation) {
      throw new Error('Consultation not found');
    }

    const position = await this.prismaService.consultation.count({
      where: {
        specialty: specialty as any,
        status: 'em_fila',
        createdAt: {
          lte: consultation.createdAt,
        },
      },
    });

    return position;
  }

  /**
   * Update queue statistics in the database
   */
  private async updateQueueStatistics(specialty: Specialty): Promise<void> {
    const stats = await this.getQueueStatistics(specialty);
    
    await this.prismaService.queueStatistics.upsert({
      where: {
        specialty_date: {
          specialty: specialty as any,
          date: new Date(),
        },
      },
      update: {
        totalInQueue: stats.queueLength,
        totalInProgress: stats.inProgress,
        totalFinished: stats.completedToday,
        averageWaitTime: stats.queueLength > 0 ? 
          Math.round((stats.queueLength * this.DEFAULT_DURATIONS[specialty]) / Math.max(stats.onlineProfessionals, 1)) : 0,
        doctorsOnline: stats.onlineProfessionals,
      },
      create: {
        id: this.generateUUID(),
        specialty: specialty as any,
        date: new Date(),
        totalInQueue: stats.queueLength,
        totalInProgress: stats.inProgress,
        totalFinished: stats.completedToday,
        averageWaitTime: stats.queueLength > 0 ? 
          Math.round((stats.queueLength * this.DEFAULT_DURATIONS[specialty]) / Math.max(stats.onlineProfessionals, 1)) : 0,
        doctorsOnline: stats.onlineProfessionals,
        averageDuration: this.DEFAULT_DURATIONS[specialty],
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
