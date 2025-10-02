import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/infrastructure/database/prisma.service';
import { Specialty } from '@/shared/types';

@Injectable()
export class SpecialtiesService {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll() {
    const specialties = [
      {
        id: Specialty.psicologo,
        name: 'Psicólogo',
        description: 'Atendimento psicológico com opções de consulta urgente ou agendada',
        icon: 'brain',
        color: '#8B5CF6',
        features: [
          'Consulta urgente disponível',
          'Consulta agendada',
          'Acompanhamento psicológico',
          'Suporte em crises',
        ],
      },
      {
        id: Specialty.dentista,
        name: 'Dentista',
        description: 'Atendimento odontológico completo',
        icon: 'tooth',
        color: '#06B6D4',
        features: [
          'Consultas odontológicas',
          'Emergências dentárias',
          'Prevenção e higiene',
          'Tratamentos especializados',
        ],
      },
      {
        id: Specialty.medico_clinico,
        name: 'Médico Clínico',
        description: 'Atendimento médico geral',
        icon: 'stethoscope',
        color: '#10B981',
        features: [
          'Consultas médicas gerais',
          'Diagnósticos',
          'Prescrições',
          'Encaminhamentos',
        ],
      },
    ];

    // Get current queue data for each specialty
    const queueData = await Promise.all(
      specialties.map(async (specialty) => {
        const queueLength = await this.prismaService.consultation.count({
          where: {
            specialty: specialty.id as any,
            status: { in: ['em_fila', 'em_atendimento'] },
          },
        });

        const inProgress = await this.prismaService.consultation.count({
          where: {
            specialty: specialty.id as any,
            status: 'em_atendimento',
          },
        });

        const onlineProfessionals = await this.prismaService.user.count({
          where: {
            role: this.getRoleForSpecialty(specialty.id),
            isOnline: true,
            isActive: true,
          },
        });

        return {
          ...specialty,
          queueLength,
          inProgress,
          onlineProfessionals,
          estimatedWaitTime: this.calculateEstimatedWaitTime(queueLength, onlineProfessionals),
        };
      })
    );

    return queueData;
  }

  async getWaitTimes() {
    const specialties = await this.findAll();
    
    return specialties.map(specialty => ({
      id: specialty.id,
      name: specialty.name,
      estimatedWaitTime: specialty.estimatedWaitTime,
      queueLength: specialty.queueLength,
      onlineProfessionals: specialty.onlineProfessionals,
      status: this.getQueueStatus(specialty.queueLength, specialty.onlineProfessionals),
    }));
  }

  async getStatistics() {
    const specialties = [Specialty.psicologo, Specialty.dentista, Specialty.medico_clinico];
    
    const statistics = await Promise.all(
      specialties.map(async (specialty) => {
        const [
          totalConsultations,
          completedToday,
          averageWaitTime,
          averageDuration,
          onlineProfessionals,
        ] = await Promise.all([
          this.prismaService.consultation.count({
            where: { specialty: specialty as any },
          }),
          this.prismaService.consultation.count({
            where: {
              specialty: specialty as any,
              status: 'finalizado',
              finishedAt: {
                gte: new Date(new Date().setHours(0, 0, 0, 0)),
              },
            },
          }),
          this.getAverageWaitTime(specialty),
          this.getAverageDuration(specialty),
          this.prismaService.user.count({
            where: {
              role: this.getRoleForSpecialty(specialty),
              isOnline: true,
              isActive: true,
            },
          }),
        ]);

        return {
          specialty,
          name: this.getSpecialtyName(specialty),
          totalConsultations,
          completedToday,
          averageWaitTime,
          averageDuration,
          onlineProfessionals,
          efficiency: this.calculateEfficiency(completedToday, averageWaitTime, averageDuration),
        };
      })
    );

    return statistics;
  }

  private getRoleForSpecialty(specialty: Specialty): string {
    const mapping = {
      [Specialty.psicologo]: 'psicologo',
      [Specialty.dentista]: 'dentista',
      [Specialty.medico_clinico]: 'medico',
    };
    return mapping[specialty];
  }

  private getSpecialtyName(specialty: Specialty): string {
    const mapping = {
      [Specialty.psicologo]: 'Psicólogo',
      [Specialty.dentista]: 'Dentista',
      [Specialty.medico_clinico]: 'Médico Clínico',
    };
    return mapping[specialty];
  }

  private calculateEstimatedWaitTime(queueLength: number, onlineProfessionals: number): number {
    if (onlineProfessionals === 0) return 0;
    
    // Base time per consultation: 30 minutes
    // Adjust based on queue length and available professionals
    const baseTime = 30;
    const timePerPerson = baseTime / Math.max(onlineProfessionals, 1);
    
    return Math.round(queueLength * timePerPerson);
  }

  private getQueueStatus(queueLength: number, onlineProfessionals: number): string {
    if (onlineProfessionals === 0) return 'offline';
    if (queueLength === 0) return 'available';
    if (queueLength <= 2) return 'short';
    if (queueLength <= 5) return 'medium';
    return 'long';
  }

  private async getAverageWaitTime(specialty: Specialty): Promise<number> {
    const consultations = await this.prismaService.consultation.findMany({
      where: {
        specialty: specialty as any,
        status: 'finalizado',
        startedAt: { not: null },
      },
      select: {
        createdAt: true,
        startedAt: true,
      },
    });

    if (consultations.length === 0) return 0;

    const waitTimes = consultations.map(c => 
      c.startedAt.getTime() - c.createdAt.getTime()
    );

    const averageWaitTimeMs = waitTimes.reduce((a, b) => a + b, 0) / waitTimes.length;
    return Math.round(averageWaitTimeMs / (1000 * 60)); // Convert to minutes
  }

  private async getAverageDuration(specialty: Specialty): Promise<number> {
    const consultations = await this.prismaService.consultation.findMany({
      where: {
        specialty: specialty as any,
        status: 'finalizado',
        startedAt: { not: null },
        finishedAt: { not: null },
      },
      select: {
        startedAt: true,
        finishedAt: true,
      },
    });

    if (consultations.length === 0) return 0;

    const durations = consultations.map(c => 
      c.finishedAt.getTime() - c.startedAt.getTime()
    );

    const averageDurationMs = durations.reduce((a, b) => a + b, 0) / durations.length;
    return Math.round(averageDurationMs / (1000 * 60)); // Convert to minutes
  }

  private calculateEfficiency(completedToday: number, averageWaitTime: number, averageDuration: number): number {
    // Simple efficiency calculation based on completion rate and times
    const completionScore = Math.min(completedToday * 10, 100);
    const waitTimeScore = Math.max(0, 100 - averageWaitTime);
    const durationScore = Math.max(0, 100 - (averageDuration - 30));
    
    return Math.round((completionScore + waitTimeScore + durationScore) / 3);
  }
}
