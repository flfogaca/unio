import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/infrastructure/database/prisma.service';
import { RedisService } from '@/infrastructure/external-services/redis.service';

export interface MedicalConsultationRequest {
  patientId: string;
  consultationType: 'urgent' | 'scheduled';
  reason: string;
  symptoms: string[];
  preferredTime?: Date;
  emergencyContact?: string;
}

@Injectable()
export class MedicalDoctorService {
  private readonly logger = new Logger(MedicalDoctorService.name);

  constructor(
    private readonly prismaService: PrismaService,
    private readonly redisService: RedisService
  ) {}

  /**
   * Create urgent medical consultation
   */
  async createUrgentConsultation(
    request: MedicalConsultationRequest
  ): Promise<any> {
    try {
      // Create consultation
      const consultation = await this.prismaService.consultation.create({
        data: {
          id: this.generateUUID(),
          patientId: request.patientId,
          specialty: 'medico_clinico' as any,
          status: 'em_fila',
          priority: 'urgente' as any,
          reason: request.reason,
          description: `EMERGÊNCIA MÉDICA: ${request.reason}`,
          startedAt: new Date(),
          attachments: [],
        },
        include: {
          patient: true,
        },
      });

      this.logger.log(`Created urgent consultation ${consultation.id}`);
      return consultation;
    } catch (error) {
      this.logger.error('Error creating urgent consultation:', error);
      throw error;
    }
  }

  /**
   * Create scheduled medical consultation
   */
  async createScheduledConsultation(
    request: MedicalConsultationRequest
  ): Promise<any> {
    try {
      // Create consultation
      const consultation = await this.prismaService.consultation.create({
        data: {
          id: this.generateUUID(),
          patientId: request.patientId,
          specialty: 'medico_clinico' as any,
          status: 'em_fila',
          priority: 'media' as any,
          reason: request.reason,
          description: `Consulta médica: ${request.reason}`,
          scheduledAt: request.preferredTime,
          attachments: [],
        },
        include: {
          patient: true,
        },
      });

      this.logger.log(`Created scheduled consultation ${consultation.id}`);
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
          specialty: 'medico_clinico' as any,
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
          specialty: 'medico_clinico' as any,
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
   * Find available doctor
   */
  private async findAvailableDoctor(): Promise<any> {
    return this.prismaService.user.findFirst({
      where: {
        role: 'medico',
        isOnline: true,
        isActive: true,
      },
    });
  }

  /**
   * Generate UUID
   */
  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
      /[xy]/g,
      function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c == 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }
    );
  }
}
