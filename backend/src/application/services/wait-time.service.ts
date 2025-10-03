import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/infrastructure/database/prisma.service';
import { RedisService } from '@/infrastructure/external-services/redis.service';
import { Specialty } from '@/shared/types';

@Injectable()
export class WaitTimeService {
  private readonly logger = new Logger(WaitTimeService.name);

  // Default consultation durations in minutes
  private readonly DEFAULT_DURATIONS: Record<Specialty, number> = {
    [Specialty.psicologo]: 45,
    [Specialty.dentista]: 30,
    [Specialty.medico_clinico]: 20,
  };

  // Default average wait times in minutes
  private readonly DEFAULT_WAIT_TIMES: Record<Specialty, number> = {
    [Specialty.psicologo]: 10,
    [Specialty.dentista]: 15,
    [Specialty.medico_clinico]: 20,
  };

  constructor(
    private readonly prismaService: PrismaService,
    private readonly redisService: RedisService,
  ) {}

  async calculateWaitTime(specialty: Specialty): Promise<number> {
    try {
      // Try to get from cache first
      const cachedWaitTime = await this.getCachedWaitTime(specialty);
      if (cachedWaitTime !== null) {
        return cachedWaitTime;
      }

      // Calculate based on current queue and historical data
      const queueLength = await this.getQueueLength(specialty);
      const onlineProfessionals = await this.getOnlineProfessionals(specialty);
      
      if (onlineProfessionals === 0) {
        return this.DEFAULT_WAIT_TIMES[specialty];
      }

      const averageDuration = await this.getAverageDuration(specialty);
      const calculatedWaitTime = (queueLength * averageDuration) / onlineProfessionals;

      // Cache the result for 5 minutes
      await this.cacheWaitTime(specialty, calculatedWaitTime);

      return Math.round(calculatedWaitTime);
    } catch (error) {
      this.logger.error('Error calculating wait time:', error);
      return this.DEFAULT_WAIT_TIMES[specialty];
    }
  }

  async getQueueLength(specialty: Specialty): Promise<number> {
    return this.prismaService.consultation.count({
      where: {
        specialty,
        status: 'em_fila',
      },
    });
  }

  async getOnlineProfessionals(specialty: Specialty): Promise<number> {
    const role = this.getRoleForSpecialty(specialty);
    
    return this.prismaService.user.count({
      where: {
        role: role as any,
        isOnline: true,
        isActive: true,
      },
    });
  }

  async getAverageDuration(specialty: Specialty): Promise<number> {
    try {
      // Get recent consultations for this specialty
      const recentConsultations = await this.prismaService.consultation.findMany({
        where: {
          specialty,
          status: 'finalizado',
          startedAt: { not: null },
          finishedAt: { not: null },
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
          },
        },
        select: {
          startedAt: true,
          finishedAt: true,
        },
      });

      if (recentConsultations.length === 0) {
        return this.DEFAULT_DURATIONS[specialty];
      }

      // Calculate average duration
      const totalDuration = recentConsultations.reduce((sum, consultation) => {
        const duration = consultation.finishedAt.getTime() - consultation.startedAt.getTime();
        return sum + duration;
      }, 0);

      const averageDurationMs = totalDuration / recentConsultations.length;
      const averageDurationMinutes = Math.round(averageDurationMs / (1000 * 60));

      return Math.max(averageDurationMinutes, 15); // Minimum 15 minutes
    } catch (error) {
      this.logger.error('Error calculating average duration:', error);
      return this.DEFAULT_DURATIONS[specialty];
    }
  }

  async updateQueueStatistics(specialty: Specialty): Promise<void> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [
        totalInQueue,
        totalInProgress,
        totalFinished,
        averageWaitTime,
        averageDuration,
      ] = await Promise.all([
        this.getQueueLength(specialty),
        this.prismaService.consultation.count({
          where: {
            specialty,
            status: 'em_atendimento',
            createdAt: {
              gte: today,
            },
          },
        }),
        this.prismaService.consultation.count({
          where: {
            specialty,
            status: 'finalizado',
            createdAt: {
              gte: today,
            },
          },
        }),
        this.calculateWaitTime(specialty),
        this.getAverageDuration(specialty),
      ]);

      const onlineProfessionals = await this.getOnlineProfessionals(specialty);

      // Update or create queue statistics
      await this.prismaService.queueStatistics.upsert({
        where: {
          id: `stats-${specialty}-${today.toISOString().split('T')[0]}`,
        },
        update: {
          totalInQueue,
          totalInProgress,
          totalFinished,
          averageWaitTime,
          averageDuration,
        },
        create: {
          id: `stats-${specialty}-${today.toISOString().split('T')[0]}`,
          specialty,
          date: today,
          totalInQueue,
          totalInProgress,
          totalFinished,
          averageWaitTime,
          averageDuration,
        },
      });

      this.logger.log(`Updated queue statistics for ${specialty}`);
    } catch (error) {
      this.logger.error('Error updating queue statistics:', error);
    }
  }

  async getQueueStatistics(specialty: Specialty, date?: Date) {
    const targetDate = date || new Date();
    targetDate.setHours(0, 0, 0, 0);

    return this.prismaService.queueStatistics.findFirst({
      where: {
        specialty,
        date: targetDate,
      },
    });
  }

  async getAllQueueStatistics(date?: Date) {
    const targetDate = date || new Date();
    targetDate.setHours(0, 0, 0, 0);

    return this.prismaService.queueStatistics.findMany({
      where: {
        date: targetDate,
      },
      orderBy: {
        specialty: 'asc',
      },
    });
  }

  private async getCachedWaitTime(specialty: Specialty): Promise<number | null> {
    try {
      const cached = await this.redisService.get(`wait_time:${specialty}`);
      return cached ? parseInt(cached) : null;
    } catch (error) {
      this.logger.warn('Error getting cached wait time:', error);
      return null;
    }
  }

  private async cacheWaitTime(specialty: Specialty, waitTime: number): Promise<void> {
    try {
      await this.redisService.set(`wait_time:${specialty}`, waitTime.toString(), 300); // 5 minutes
    } catch (error) {
      this.logger.warn('Error caching wait time:', error);
    }
  }

  private getRoleForSpecialty(specialty: Specialty): string {
    const roleMapping = {
      [Specialty.psicologo]: 'psicologo',
      [Specialty.dentista]: 'dentista',
      [Specialty.medico_clinico]: 'medico',
    };

    return roleMapping[specialty];
  }

  async getWaitTimesForSpecialties(specialtyList: Specialty[]) {
    const waitTimes = await Promise.all(
      specialtyList.map(specialty => this.calculateWaitTime(specialty))
    );

    return specialtyList.map((specialty, index) => ({
      specialty,
      estimatedWaitTime: waitTimes[index],
    }));
  }

  async getConsultationWaitTime(consultationId: string) {
    const consultation = await this.prismaService.consultation.findUnique({
      where: { id: consultationId },
    });

    if (!consultation) {
      throw new Error('Consultation not found');
    }

    const estimatedWaitTime = await this.calculateWaitTime(consultation.specialty as Specialty);
    
    return {
      consultationId,
      specialty: consultation.specialty,
      position: consultation.position,
      estimatedWaitTime,
    };
  }

  async getHistoricalData(specialty: Specialty, daysCount: number) {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - daysCount * 24 * 60 * 60 * 1000);

    const statistics = await this.prismaService.queueStatistics.findMany({
      where: {
        specialty,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    return statistics.map(stat => ({
      date: stat.date,
      totalInQueue: stat.totalInQueue,
      totalInProgress: stat.totalInProgress,
      totalFinished: stat.totalFinished,
      averageWaitTime: stat.averageWaitTime,
      averageDuration: stat.averageDuration,
    }));
  }
}