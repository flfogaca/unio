import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/infrastructure/database/prisma.service';
import { Specialty } from '@/shared/types';

@Injectable()
export class SpecialtiesService {
  private readonly logger = new Logger(SpecialtiesService.name);

  constructor(private readonly prismaService: PrismaService) {}

  async findAll() {
    return this.prismaService.specialtyConfig.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    return this.prismaService.specialtyConfig.findUnique({
      where: { id },
    });
  }

  async getSpecialtyByName(name: string) {
    return this.prismaService.specialtyConfig.findUnique({
      where: { name },
    });
  }

  async getSpecialtyStats() {
    const specialties = await this.prismaService.specialtyConfig.findMany();

    const stats = await Promise.all(
      specialties.map(async specialty => {
        const [totalConsultations, activeConsultations, onlineProfessionals] =
          await Promise.all([
            this.prismaService.consultation.count({
              where: { specialty: specialty.name as Specialty },
            }),
            this.prismaService.consultation.count({
              where: {
                specialty: specialty.name as Specialty,
                status: 'em_fila',
              },
            }),
            this.prismaService.user.count({
              where: {
                isOnline: true,
                isActive: true,
                specialties: {
                  has: specialty.name,
                },
              },
            }),
          ]);

        return {
          ...specialty,
          totalConsultations,
          activeConsultations,
          onlineProfessionals,
        };
      })
    );

    return stats;
  }

  getSpecialtyDisplayName(specialty: Specialty): string {
    const displayNames = {
      [Specialty.psicologo]: 'Psicólogo',
      [Specialty.dentista]: 'Dentista',
      [Specialty.medico_clinico]: 'Médico Clínico',
    };

    return displayNames[specialty] || specialty;
  }

  getSpecialtyDescription(specialty: Specialty): string {
    const descriptions = {
      [Specialty.psicologo]:
        'Atendimento psicológico online com profissionais qualificados',
      [Specialty.dentista]: 'Consultas odontológicas e emergências dentárias',
      [Specialty.medico_clinico]:
        'Consultas médicas gerais e diagnósticos clínicos',
    };

    return descriptions[specialty] || '';
  }

  getSpecialtyIcon(specialty: Specialty): string {
    const icons = {
      [Specialty.psicologo]: 'brain',
      [Specialty.dentista]: 'tooth',
      [Specialty.medico_clinico]: 'stethoscope',
    };

    return icons[specialty] || 'user';
  }

  async getWaitTimes() {
    const specialties = await this.findAll();

    const waitTimes = await Promise.all(
      specialties.map(async specialty => {
        const queueLength = await this.prismaService.consultation.count({
          where: { specialty: specialty.name as any, status: 'em_fila' },
        });

        const onlineProfessionals = await this.prismaService.user.count({
          where: {
            role: this.getRoleForSpecialty(specialty.name as any) as any,
            isOnline: true,
            isActive: true,
          },
        });

        const estimatedWaitTime =
          onlineProfessionals > 0
            ? Math.round((queueLength * 15) / onlineProfessionals)
            : queueLength * 30;

        return {
          specialty: specialty.name,
          queueLength,
          onlineProfessionals,
          estimatedWaitTime,
        };
      })
    );

    return waitTimes;
  }

  async getStatistics() {
    const specialties = await this.findAll();

    const statistics = await Promise.all(
      specialties.map(async specialty => {
        const [
          totalConsultations,
          activeConsultations,
          completedToday,
          onlineProfessionals,
        ] = await Promise.all([
          this.prismaService.consultation.count({
            where: { specialty: specialty.name as any },
          }),
          this.prismaService.consultation.count({
            where: {
              specialty: specialty.name as any,
              status: { in: ['em_fila', 'em_atendimento'] },
            },
          }),
          this.prismaService.consultation.count({
            where: {
              specialty: specialty.name as any,
              status: 'finalizado',
              finishedAt: {
                gte: new Date(new Date().setHours(0, 0, 0, 0)),
              },
            },
          }),
          this.prismaService.user.count({
            where: {
              role: this.getRoleForSpecialty(specialty.name as any) as any,
              isOnline: true,
              isActive: true,
            },
          }),
        ]);

        return {
          specialty: specialty.name,
          totalConsultations,
          activeConsultations,
          completedToday,
          onlineProfessionals,
        };
      })
    );

    return statistics;
  }

  private getRoleForSpecialty(specialty: string): string {
    const mapping = {
      psicologo: 'psicologo',
      dentista: 'dentista',
      medico_clinico: 'medico',
    };
    return mapping[specialty] || 'psicologo';
  }
}
