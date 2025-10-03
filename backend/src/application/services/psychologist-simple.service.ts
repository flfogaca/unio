import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/infrastructure/database/prisma.service';
import { RedisService } from '@/infrastructure/external-services/redis.service';

export interface PsychologistConsultationRequest {
  patientId: string;
  consultationType: 'urgent' | 'scheduled';
  reason: string;
  symptoms?: string[];
  preferredTime?: Date;
  emergencyContact?: string;
  urgencyLevel?: 'low' | 'medium' | 'high' | 'crisis';
  previousTherapy?: boolean;
  currentMedication?: string[];
}

@Injectable()
export class PsychologistService {
  private readonly logger = new Logger(PsychologistService.name);

  constructor(
    private readonly prismaService: PrismaService,
    private readonly redisService: RedisService,
  ) {}

  /**
   * Create urgent psychologist consultation
   */
  async createUrgentConsultation(request: PsychologistConsultationRequest): Promise<any> {
    try {
      // Create consultation
      const consultation = await this.prismaService.consultation.create({
        data: {
          id: this.generateUUID(),
          patientId: request.patientId,
          specialty: 'psicologo' as any,
          status: 'em_fila',
          priority: 'urgente' as any,
          reason: request.reason,
          description: `ATENDIMENTO PSICOLÓGICO URGENTE: ${request.reason}`,
          startedAt: new Date(),
          attachments: [],
        },
        include: {
          patient: true,
        },
      });

      this.logger.log(`Created urgent psychologist consultation ${consultation.id}`);
      return consultation;
    } catch (error) {
      this.logger.error('Error creating urgent consultation:', error);
      throw error;
    }
  }

  /**
   * Create scheduled psychologist consultation
   */
  async createScheduledConsultation(request: PsychologistConsultationRequest): Promise<any> {
    try {
      // Create consultation
      const consultation = await this.prismaService.consultation.create({
        data: {
          id: this.generateUUID(),
          patientId: request.patientId,
          specialty: 'psicologo' as any,
          status: 'em_fila',
          priority: 'media' as any,
          reason: request.reason,
          description: `Consulta psicológica: ${request.reason}`,
          scheduledAt: request.preferredTime,
          attachments: [],
        },
        include: {
          patient: true,
        },
      });

      this.logger.log(`Created scheduled psychologist consultation ${consultation.id}`);
      return consultation;
    } catch (error) {
      this.logger.error('Error creating scheduled consultation:', error);
      throw error;
    }
  }

  /**
   * Get patient consultations
   */
  async getPatientConsultations(patientId: string): Promise<any[]> {
    try {
      return await this.prismaService.consultation.findMany({
        where: {
          patientId,
          specialty: 'psicologo' as any,
        },
        include: {
          patient: true,
          professional: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    } catch (error) {
      this.logger.error('Error getting patient consultations:', error);
      throw error;
    }
  }

  /**
   * Get professional consultations
   */
  async getProfessionalConsultations(professionalId: string): Promise<any[]> {
    try {
      return await this.prismaService.consultation.findMany({
        where: {
          professionalId,
          specialty: 'psicologo' as any,
        },
        include: {
          patient: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    } catch (error) {
      this.logger.error('Error getting professional consultations:', error);
      throw error;
    }
  }

  /**
   * Create consultation request
   */
  async createConsultationRequest(request: PsychologistConsultationRequest) {
    const consultation = await this.prismaService.consultation.create({
      data: {
        id: this.generateUUID(),
        patientId: request.patientId,
        specialty: 'psicologo',
        description: request.reason,
        reason: request.reason,
        status: request.consultationType === 'urgent' ? 'em_fila' : 'em_fila',
        priority: request.consultationType === 'urgent' ? 'alta' : 'media',
        scheduledAt: request.preferredTime,
        attachments: request.symptoms,
      },
      include: {
        patient: true,
        professional: true,
      },
    });

    return consultation;
  }

  /**
   * Create psychological assessment
   */
  async createAssessment(assessmentData: any) {
    const assessment = await this.prismaService.medicalRecord.create({
      data: {
        id: this.generateUUID(),
        consultationId: assessmentData.consultationId,
        patientId: assessmentData.patientId,
        professionalId: assessmentData.professionalId,
        specialty: 'psicologo',
        diagnosis: assessmentData.diagnosis,
        treatment: assessmentData.treatment,
        notes: assessmentData.notes,
        vitalSigns: assessmentData.vitalSigns,
      },
      include: {
        consultation: true,
        patient: true,
        professional: true,
      },
    });

    return assessment;
  }

  /**
   * Create session
   */
  async createSession(sessionData: any) {
    // This would typically create a session record
    return {
      id: this.generateUUID(),
      ...sessionData,
      createdAt: new Date(),
    };
  }

  /**
   * Get psychologist dashboard
   */
  async getPsychologistDashboard(psychologistId: string) {
    const [pendingConsultations, inProgressConsultations, completedToday] = await Promise.all([
      this.prismaService.consultation.count({
        where: {
          specialty: 'psicologo',
          status: 'em_fila',
        },
      }),
      this.prismaService.consultation.count({
        where: {
          specialty: 'psicologo',
          status: 'em_atendimento',
          professionalId: psychologistId,
        },
      }),
      this.prismaService.consultation.count({
        where: {
          specialty: 'psicologo',
          status: 'finalizado',
          professionalId: psychologistId,
          finishedAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
    ]);

    return {
      pendingConsultations,
      inProgressConsultations,
      completedToday,
      totalConsultations: pendingConsultations + inProgressConsultations + completedToday,
      crisisAlerts: 0, // Placeholder
      activeConsultations: inProgressConsultations,
      todaySessions: completedToday,
      weeklyStats: {
        consultations: completedToday,
        hours: completedToday * 0.5, // Assuming 30min per session
      },
    };
  }

  /**
   * Get patient psychological history
   */
  async getPatientPsychologicalHistory(patientId: string) {
    const consultations = await this.prismaService.consultation.findMany({
      where: {
        patientId,
        specialty: 'psicologo',
      },
      include: {
        medicalRecord: true,
        professional: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return consultations;
  }

  /**
   * Generate UUID
   */
  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}
