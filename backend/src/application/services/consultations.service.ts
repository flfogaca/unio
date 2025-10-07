import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/infrastructure/database/prisma.service';
import { Specialty, ConsultationStatus, ConsultationPriority } from '@/shared/types';

export interface CreateConsultationDto {
  patientId: string;
  specialty: Specialty;
  description: string;
  priority?: ConsultationPriority;
  scheduledAt?: Date;
  attachments?: string[];
}

export interface FindConsultationsOptions {
  page?: number;
  limit?: number;
  status?: string;
  specialty?: Specialty;
  patientId?: string;
  professionalId?: string;
  userId?: string;
  userRole?: string;
}

@Injectable()
export class ConsultationsService {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll(options: FindConsultationsOptions = {}) {
    const { page = 1, limit = 10, status, specialty, patientId, professionalId } = options;
    
    const where: any = {};
    if (status) where.status = status;
    if (specialty) where.specialty = specialty;
    if (patientId) where.patientId = patientId;
    if (professionalId) where.professionalId = professionalId;

    const [consultations, total] = await Promise.all([
      this.prismaService.consultation.findMany({
        where,
        include: {
          patient: true,
          professional: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prismaService.consultation.count({ where }),
    ]);

    return {
      data: consultations,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const consultation = await this.prismaService.consultation.findUnique({
      where: { id },
      include: {
        patient: true,
        professional: true,
        medicalRecord: true,
      },
    });

    if (!consultation) {
      throw new NotFoundException('Consulta não encontrada');
    }

    return consultation;
  }

  async create(createConsultationDto: CreateConsultationDto) {
    const consultation = await this.prismaService.consultation.create({
      data: {
        ...createConsultationDto,
        status: 'em_fila',
        position: 1,
        estimatedWaitTime: 0,
      },
      include: {
        patient: true,
      },
    });

    // Atualizar posições na fila após criar nova consulta
    await this.prismaService.updateQueuePositions(createConsultationDto.specialty);

    return consultation;
  }

  async update(id: string, updateData: any) {
    return this.prismaService.consultation.update({
      where: { id },
      data: updateData,
      include: {
        patient: true,
        professional: true,
      },
    });
  }

  async remove(id: string) {
    return this.prismaService.consultation.delete({
      where: { id },
    });
  }

  async assignProfessional(consultationId: string, professionalId: string) {
    return this.prismaService.consultation.update({
      where: { id: consultationId },
      data: {
        professionalId,
        status: 'em_atendimento',
        startedAt: new Date(),
      },
      include: {
        patient: true,
        professional: true,
      },
    });
  }

  async finishConsultation(consultationId: string, notes?: string) {
    return this.prismaService.consultation.update({
      where: { id: consultationId },
      data: {
        status: 'finalizado',
        finishedAt: new Date(),
        endedAt: new Date(),
        notes,
      },
      include: {
        patient: true,
        professional: true,
      },
    });
  }

  async getQueue(specialty: Specialty) {
    return this.prismaService.consultation.findMany({
      where: {
        specialty,
        status: 'em_fila',
      },
      include: {
        patient: true,
        professional: true,
      },
      orderBy: {
        position: 'asc',
      },
    });
  }

  async getMyQueue(userId: string, specialty: Specialty) {
    return this.prismaService.consultation.findMany({
      where: {
        specialty,
        status: 'em_fila',
        patientId: userId,
      },
      include: {
        patient: true,
        professional: true,
      },
      orderBy: {
        position: 'asc',
      },
    });
  }

  async getProfessionalQueue(userId: string, specialty: Specialty) {
    return this.prismaService.consultation.findMany({
      where: {
        specialty,
        status: { in: ['em_fila', 'em_atendimento'] },
        OR: [
          { professionalId: userId },
          { professionalId: null },
        ],
      },
      include: {
        patient: true,
        professional: true,
      },
      orderBy: {
        position: 'asc',
      },
    });
  }

  async assume(consultationId: string, professionalId: string) {
    return this.prismaService.consultation.update({
      where: { id: consultationId },
      data: {
        professionalId,
        status: 'em_atendimento',
        startedAt: new Date(),
      },
      include: {
        patient: true,
        professional: true,
      },
    });
  }

  async start(consultationId: string) {
    return this.prismaService.consultation.update({
      where: { id: consultationId },
      data: {
        status: 'em_atendimento',
        startedAt: new Date(),
      },
      include: {
        patient: true,
        professional: true,
      },
    });
  }

  async finish(consultationId: string, notes?: string) {
    return this.finishConsultation(consultationId, notes);
  }

  async cancel(consultationId: string, reason?: string) {
    return this.prismaService.consultation.update({
      where: { id: consultationId },
      data: {
        status: 'cancelado',
        endedAt: new Date(),
        notes: reason,
      },
      include: {
        patient: true,
        professional: true,
      },
    });
  }

  async assumeConsultation(consultationId: string, professionalId: string) {
    return this.assume(consultationId, professionalId);
  }

  async finishConsultationById(consultationId: string, professionalId?: string) {
    return this.prismaService.consultation.update({
      where: { id: consultationId },
      data: {
        status: 'finalizado',
        finishedAt: new Date(),
        endedAt: new Date(),
      },
      include: {
        patient: true,
        professional: true,
      },
    });
  }

  async cancelConsultation(consultationId: string, userId: string, userRole: string) {
    return this.cancel(consultationId, `Cancelled by ${userRole}`);
  }

  async getQueueStatistics(specialty?: Specialty) {
    const where: any = {};
    if (specialty) {
      where.specialty = specialty;
    }

    const stats = await this.prismaService.consultation.groupBy({
      by: ['status'],
      where,
      _count: {
        id: true,
      },
    });

    return stats.map(stat => ({
      status: stat.status,
      count: stat._count.id,
    }));
  }

  async getPerformanceStatistics(specialty?: Specialty) {
    const where: any = {};
    if (specialty) {
      where.specialty = specialty;
    }

    const avgDuration = await this.prismaService.consultation.aggregate({
      where: {
        ...where,
        status: 'finalizado',
        startedAt: { not: null },
        finishedAt: { not: null },
      },
      _avg: {
        // This would need a computed field for duration
        // For now, we'll return a placeholder
      },
    });

    return {
      averageDuration: 0, // Placeholder
      totalConsultations: await this.prismaService.consultation.count({ where }),
      completedConsultations: await this.prismaService.consultation.count({
        where: { ...where, status: 'finalizado' },
      }),
    };
  }
}