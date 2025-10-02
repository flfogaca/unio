import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/infrastructure/database/prisma.service';
import { RedisService } from '@/infrastructure/external-services/redis.service';
import { UserRole, Specialty, ConsultationStatus, ConsultationPriority } from '@/shared/types';
import { normalizePaginationParams, generateUUID } from '@/shared/utils';

interface FindAllConsultationsParams {
  page?: number;
  limit?: number;
  status?: string;
  specialty?: Specialty;
  user: any;
}

@Injectable()
export class ConsultationsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly redisService: RedisService,
  ) {}

  async create(createData: any) {
    const { patientId, specialty, description, priority = 'media', scheduledAt } = createData;

    // Get current queue position
    const queueLength = await this.prismaService.consultation.count({
      where: {
        specialty: specialty as any,
        status: { in: ['em_fila', 'em_atendimento'] },
      },
    });

    const position = queueLength + 1;
    const estimatedWaitTime = position * 10; // 10 minutes per position

    const consultation = await this.prismaService.consultation.create({
      data: {
        id: generateUUID(),
        patientId,
        specialty: specialty as any,
        description,
        priority: priority as any,
        position,
        estimatedWaitTime,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            cpf: true,
            phone: true,
          },
        },
      },
    });

    // Update queue statistics
    await this.updateQueueStatistics(specialty);

    // Create audit log
    await this.prismaService.createAuditLog({
      userId: patientId,
      action: 'create',
      entityType: 'Consultation',
      entityId: consultation.id,
      newData: {
        specialty,
        description,
        priority,
        position,
      },
    });

    return consultation;
  }

  async findAll(params: FindAllConsultationsParams) {
    const { page, limit, skip, sortBy, sortOrder } = normalizePaginationParams(params);
    const { status, specialty, user } = params;

    let where: any = {};

    // Apply filters based on user role
    if (user.role === UserRole.paciente) {
      where.patientId = user.id;
    } else if ([UserRole.dentista, UserRole.psicologo, UserRole.medico].includes(user.role)) {
      // Professionals can see consultations in their specialty
      const specialtyMapping = {
        [UserRole.psicologo]: Specialty.psicologo,
        [UserRole.dentista]: Specialty.dentista,
        [UserRole.medico]: Specialty.medico_clinico,
      };
      where.specialty = specialtyMapping[user.role];
    }

    if (status) {
      where.status = status as any;
    }

    if (specialty) {
      where.specialty = specialty as any;
    }

    const [consultations, total] = await Promise.all([
      this.prismaService.consultation.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { priority: 'desc' },
          { createdAt: 'asc' },
        ],
        include: {
          patient: {
            select: {
              id: true,
              name: true,
              cpf: true,
              phone: true,
            },
          },
          professional: {
            select: {
              id: true,
              name: true,
              specialties: true,
            },
          },
        },
      }),
      this.prismaService.consultation.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: consultations,
      meta: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  async findOne(id: string, user: any) {
    const consultation = await this.prismaService.consultation.findUnique({
      where: { id },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            cpf: true,
            phone: true,
            birthDate: true,
          },
        },
        professional: {
          select: {
            id: true,
            name: true,
            specialties: true,
            phone: true,
          },
        },
        medicalRecord: {
          select: {
            id: true,
            diagnosis: true,
            treatment: true,
            notes: true,
            createdAt: true,
          },
        },
      },
    });

    if (!consultation) {
      throw new NotFoundException('Consultação não encontrada');
    }

    // Check access permissions
    if (user.role === UserRole.paciente && consultation.patientId !== user.id) {
      throw new ForbiddenException('Acesso negado');
    }

    if ([UserRole.dentista, UserRole.psicologo, UserRole.medico].includes(user.role)) {
      const specialtyMapping = {
        [UserRole.psicologo]: Specialty.psicologo,
        [UserRole.dentista]: Specialty.dentista,
        [UserRole.medico]: Specialty.medico_clinico,
      };
      
      if (consultation.specialty !== specialtyMapping[user.role]) {
        throw new ForbiddenException('Acesso negado para esta especialidade');
      }
    }

    return consultation;
  }

  async getQueue(specialty: Specialty, user: any) {
    // Check if user can access this specialty
    if (user.role === UserRole.paciente) {
      // Patients can only see their own consultations
      return this.getMyQueue(user.id);
    }

    if ([UserRole.dentista, UserRole.psicologo, UserRole.medico].includes(user.role)) {
      const specialtyMapping = {
        [UserRole.psicologo]: Specialty.psicologo,
        [UserRole.dentista]: Specialty.dentista,
        [UserRole.medico]: Specialty.medico_clinico,
      };
      
      if (specialty !== specialtyMapping[user.role]) {
        throw new ForbiddenException('Acesso negado para esta especialidade');
      }
    }

    const consultations = await this.prismaService.findActiveConsultationsBySpecialty(specialty);
    
    // Update positions
    await this.prismaService.updateQueuePositions(specialty);

    return consultations;
  }

  async getMyQueue(patientId: string) {
    const consultations = await this.prismaService.consultation.findMany({
      where: {
        patientId,
        status: { in: ['em_fila', 'em_atendimento'] },
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'asc' },
      ],
      include: {
        professional: {
          select: {
            id: true,
            name: true,
            specialties: true,
          },
        },
      },
    });

    return consultations;
  }

  async getProfessionalQueue(user: any) {
    const specialtyMapping = {
      [UserRole.psicologo]: Specialty.psicologo,
      [UserRole.dentista]: Specialty.dentista,
      [UserRole.medico]: Specialty.medico_clinico,
    };

    const specialty = specialtyMapping[user.role];
    
    const queue = await this.getQueue(specialty, user);
    const myConsultations = await this.prismaService.consultation.findMany({
      where: {
        professionalId: user.id,
        status: 'em_atendimento',
      },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            cpf: true,
            phone: true,
          },
        },
      },
    });

    return {
      queue,
      myConsultations,
      specialty,
    };
  }

  async assume(id: string, professionalId: string) {
    const consultation = await this.prismaService.consultation.findUnique({
      where: { id },
    });

    if (!consultation) {
      throw new NotFoundException('Consultação não encontrada');
    }

    if (consultation.status !== 'em_fila') {
      throw new BadRequestException('Consultação não está na fila');
    }

    const updatedConsultation = await this.prismaService.consultation.update({
      where: { id },
      data: {
        professionalId,
        status: 'em_atendimento',
        startedAt: new Date(),
      },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            cpf: true,
            phone: true,
          },
        },
      },
    });

    // Update queue positions
    await this.prismaService.updateQueuePositions(consultation.specialty);

    // Create audit log
    await this.prismaService.createAuditLog({
      userId: professionalId,
      action: 'assume',
      entityType: 'Consultation',
      entityId: id,
      newData: {
        professionalId,
        status: 'em_atendimento',
        startedAt: new Date(),
      },
    });

    return updatedConsultation;
  }

  async start(id: string, professionalId: string) {
    const consultation = await this.prismaService.consultation.findUnique({
      where: { id },
    });

    if (!consultation) {
      throw new NotFoundException('Consultação não encontrada');
    }

    if (consultation.professionalId !== professionalId) {
      throw new ForbiddenException('Você não pode iniciar esta consulta');
    }

    if (consultation.status !== 'em_atendimento') {
      throw new BadRequestException('Consultação não está em andamento');
    }

    // Generate room ID for video call
    const roomId = generateUUID();

    const updatedConsultation = await this.prismaService.consultation.update({
      where: { id },
      data: {
        roomId,
        startedAt: new Date(),
      },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            cpf: true,
            phone: true,
          },
        },
      },
    });

    // Create video call room
    await this.prismaService.videoCallRoom.create({
      data: {
        id: generateUUID(),
        consultationId: id,
        roomId,
        expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours
      },
    });

    return updatedConsultation;
  }

  async finish(id: string, professionalId: string, finishData: any) {
    const consultation = await this.prismaService.consultation.findUnique({
      where: { id },
    });

    if (!consultation) {
      throw new NotFoundException('Consultação não encontrada');
    }

    if (consultation.professionalId !== professionalId) {
      throw new ForbiddenException('Você não pode finalizar esta consulta');
    }

    if (consultation.status !== 'em_atendimento') {
      throw new BadRequestException('Consultação não está em andamento');
    }

    const updatedConsultation = await this.prismaService.consultation.update({
      where: { id },
      data: {
        status: 'finalizado',
        finishedAt: new Date(),
        notes: finishData.notes,
        attachments: finishData.attachments || [],
      },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            cpf: true,
            phone: true,
          },
        },
      },
    });

    // Create medical record if provided
    if (finishData.diagnosis || finishData.treatment) {
      await this.prismaService.createMedicalRecord({
        consultationId: id,
        patientId: consultation.patientId,
        professionalId,
        specialty: consultation.specialty,
        diagnosis: finishData.diagnosis,
        treatment: finishData.treatment,
        prescription: finishData.prescription,
        notes: finishData.notes,
        vitalSigns: finishData.vitalSigns,
        attachments: finishData.attachments,
      });
    }

    // Update queue statistics
    await this.updateQueueStatistics(consultation.specialty);

    // Create audit log
    await this.prismaService.createAuditLog({
      userId: professionalId,
      action: 'finish',
      entityType: 'Consultation',
      entityId: id,
      newData: {
        status: 'finalizado',
        finishedAt: new Date(),
        notes: finishData.notes,
      },
    });

    return updatedConsultation;
  }

  async cancel(id: string, user: any, reason: string) {
    const consultation = await this.prismaService.consultation.findUnique({
      where: { id },
    });

    if (!consultation) {
      throw new NotFoundException('Consultação não encontrada');
    }

    // Check permissions
    if (user.role === UserRole.paciente && consultation.patientId !== user.id) {
      throw new ForbiddenException('Você não pode cancelar esta consulta');
    }

    if (consultation.status === 'finalizado') {
      throw new BadRequestException('Consultação já foi finalizada');
    }

    const updatedConsultation = await this.prismaService.consultation.update({
      where: { id },
      data: {
        status: 'cancelado',
        finishedAt: new Date(),
        notes: reason,
      },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            cpf: true,
            phone: true,
          },
        },
      },
    });

    // Update queue positions if it was in queue
    if (consultation.status === 'em_fila') {
      await this.prismaService.updateQueuePositions(consultation.specialty);
    }

    // Create audit log
    await this.prismaService.createAuditLog({
      userId: user.id,
      action: 'cancel',
      entityType: 'Consultation',
      entityId: id,
      newData: {
        status: 'cancelado',
        reason,
        cancelledAt: new Date(),
      },
    });

    return updatedConsultation;
  }

  async getQueueStatistics() {
    const statistics = await this.prismaService.getQueueStatistics();
    
    // Get real-time queue data
    const specialties = [Specialty.psicologo, Specialty.dentista, Specialty.medico_clinico];
    const realTimeData = [];

    for (const specialty of specialties) {
      const queueLength = await this.prismaService.consultation.count({
        where: {
          specialty: specialty as any,
          status: 'em_fila',
        },
      });

      const inProgress = await this.prismaService.consultation.count({
        where: {
          specialty: specialty as any,
          status: 'em_atendimento',
        },
      });

      realTimeData.push({
        specialty,
        queueLength,
        inProgress,
        totalActive: queueLength + inProgress,
      });
    }

    return {
      historical: statistics,
      realTime: realTimeData,
    };
  }

  async getPerformanceStatistics() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalConsultations,
      completedToday,
      averageWaitTime,
      averageDuration,
    ] = await Promise.all([
      this.prismaService.consultation.count(),
      this.prismaService.consultation.count({
        where: {
          status: 'finalizado',
          finishedAt: {
            gte: today,
          },
        },
      }),
      this.prismaService.consultation.aggregate({
        where: {
          status: 'finalizado',
          startedAt: { not: null },
        },
        _avg: {
          estimatedWaitTime: true,
        },
      }),
      this.prismaService.consultation.findMany({
        where: {
          status: 'finalizado',
          startedAt: { not: null },
          finishedAt: { not: null },
        },
        select: {
          startedAt: true,
          finishedAt: true,
        },
      }),
    ]);

    // Calculate average duration
    const durations = averageDuration.map(c => 
      c.finishedAt.getTime() - c.startedAt.getTime()
    );
    const avgDurationMs = durations.length > 0 
      ? durations.reduce((a, b) => a + b, 0) / durations.length 
      : 0;
    const avgDurationMinutes = Math.round(avgDurationMs / (1000 * 60));

    return {
      totalConsultations,
      completedToday,
      averageWaitTime: Math.round(averageWaitTime._avg.estimatedWaitTime || 0),
      averageDuration: avgDurationMinutes,
      completionRate: totalConsultations > 0 
        ? Math.round((completedToday / totalConsultations) * 100) 
        : 0,
    };
  }

  private async updateQueueStatistics(specialty: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const queueLength = await this.prismaService.consultation.count({
      where: {
        specialty: specialty as any,
        status: 'em_fila',
      },
    });

    const inProgress = await this.prismaService.consultation.count({
      where: {
        specialty: specialty as any,
        status: 'em_atendimento',
      },
    });

    const completed = await this.prismaService.consultation.count({
      where: {
        specialty: specialty as any,
        status: 'finalizado',
        finishedAt: {
          gte: today,
        },
      },
    });

    // Calculate average wait time for today
    const todayConsultations = await this.prismaService.consultation.findMany({
      where: {
        specialty: specialty as any,
        status: 'finalizado',
        startedAt: { not: null },
        finishedAt: {
          gte: today,
        },
      },
      select: {
        createdAt: true,
        startedAt: true,
      },
    });

    const waitTimes = todayConsultations.map(c => 
      c.startedAt.getTime() - c.createdAt.getTime()
    );
    const avgWaitTime = waitTimes.length > 0 
      ? Math.round(waitTimes.reduce((a, b) => a + b, 0) / waitTimes.length / (1000 * 60))
      : 0;

    await this.prismaService.queueStatistics.upsert({
      where: {
        specialty_date: {
          specialty: specialty as any,
          date: today,
        },
      },
      update: {
        totalInQueue: queueLength,
        totalInProgress: inProgress,
        totalFinished: completed,
        averageWaitTime: avgWaitTime,
      },
      create: {
        id: generateUUID(),
        specialty: specialty as any,
        date: today,
        totalInQueue: queueLength,
        totalInProgress: inProgress,
        totalFinished: completed,
        averageWaitTime: avgWaitTime,
        averageDuration: 0, // Will be calculated separately
      },
    });
  }
}
