import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/infrastructure/database/prisma.service';
import { RedisService } from '@/infrastructure/external-services/redis.service';
import { Specialty } from '@/shared/types';

interface PsychologistConsultationRequest {
  patientId: string;
  consultationType: 'urgent' | 'scheduled';
  reason: string;
  urgencyLevel: 'low' | 'medium' | 'high' | 'crisis';
  preferredTime?: Date;
  symptoms?: string[];
  previousTherapy?: boolean;
  currentMedication?: string[];
}

interface PsychologistAssessment {
  consultationId: string;
  assessmentType: 'initial' | 'follow_up' | 'crisis_intervention';
  mentalState: {
    mood: string;
    anxiety: number; // 1-10 scale
    depression: number; // 1-10 scale
    stress: number; // 1-10 scale
    sleep: string;
    appetite: string;
  };
  riskAssessment: {
    selfHarm: 'none' | 'low' | 'medium' | 'high';
    suicide: 'none' | 'low' | 'medium' | 'high';
    violence: 'none' | 'low' | 'medium' | 'high';
    notes: string;
  };
  therapeuticPlan: {
    approach: string;
    goals: string[];
    techniques: string[];
    frequency: string;
    duration: string;
  };
  recommendations: {
    medication: string[];
    lifestyle: string[];
    emergency: string[];
  };
}

interface PsychologistSession {
  sessionId: string;
  consultationId: string;
  sessionNumber: number;
  sessionType: 'individual' | 'group' | 'family' | 'couple';
  duration: number; // in minutes
  topics: string[];
  techniques: string[];
  homework: string[];
  progress: {
    goal: string;
    progress: number; // 1-10 scale
    notes: string;
  }[];
  nextSession?: Date;
}

@Injectable()
export class PsychologistService {
  private readonly logger = new Logger(PsychologistService.name);

  constructor(
    private readonly prismaService: PrismaService,
    private readonly redisService: RedisService,
  ) {}

  /**
   * Create a psychologist consultation request
   */
  async createConsultationRequest(request: PsychologistConsultationRequest): Promise<any> {
    try {
      // Determine priority based on urgency level
      const priorityMapping = {
        'crisis': 'urgente',
        'high': 'alta',
        'medium': 'media',
        'low': 'baixa',
      };

      const priority = priorityMapping[request.urgencyLevel] || 'media';

      // For crisis situations, bypass normal queue
      if (request.urgencyLevel === 'crisis') {
        return this.handleCrisisIntervention(request);
      }

      // Create consultation
      const consultation = await this.prismaService.consultation.create({
        data: {
          id: this.generateUUID(),
          patientId: request.patientId,
          specialtyId: (await this.getSpecialtyId('psicologo')),
          specialty: 'psicologo' as any,
          status: request.consultationType === 'urgent' ? 'em_fila' : 'agendado',
          priority: priority as any,
          reason: request.reason,
          description: this.buildConsultationDescription(request),
          scheduledAt: request.preferredTime,
          attachments: [],
        },
        include: {
          patient: {
            include: {
              user: true,
            },
          },
        },
      });

      // Store additional psychologist-specific data
      await this.storePsychologistData(consultation.id, request);

      // If urgent, try to find available psychologist
      if (request.consultationType === 'urgent') {
        await this.tryAssignUrgentConsultation(consultation.id);
      }

      this.logger.log(`Created psychologist consultation ${consultation.id} for patient ${request.patientId}`);
      
      return consultation;
    } catch (error) {
      this.logger.error('Error creating psychologist consultation:', error);
      throw error;
    }
  }

  /**
   * Handle crisis intervention
   */
  private async handleCrisisIntervention(request: PsychologistConsultationRequest): Promise<any> {
    // Find available psychologist immediately
    const availablePsychologist = await this.findAvailablePsychologist();
    
    if (!availablePsychologist) {
      // No psychologist available - create urgent consultation with highest priority
      return this.createConsultationRequest({
        ...request,
        urgencyLevel: 'high',
      });
    }

    // Create immediate consultation
    const consultation = await this.prismaService.consultation.create({
      data: {
        id: this.generateUUID(),
        patientId: request.patientId,
        professionalId: availablePsychologist.userId,
        specialtyId: availablePsychologist.specialtyId,
        specialty: 'psicologo' as any,
        status: 'em_atendimento',
        priority: 'urgente' as any,
        reason: request.reason,
        description: `CRISE: ${request.reason}`,
        startedAt: new Date(),
        attachments: [],
      },
      include: {
        patient: {
          include: {
            user: true,
          },
        },
        professional: {
          include: {
            user: true,
          },
        },
      },
    });

    // Store crisis data
    await this.storePsychologistData(consultation.id, request);

    // Notify psychologist immediately
    await this.notifyCrisisIntervention(availablePsychologist.userId, consultation.id);

    return consultation;
  }

  /**
   * Create psychological assessment
   */
  async createAssessment(assessment: PsychologistAssessment): Promise<any> {
    try {
      // Create medical record with psychological assessment
      const medicalRecord = await this.prismaService.medicalRecord.create({
        data: {
          id: this.generateUUID(),
          patientId: (await this.getConsultationPatientId(assessment.consultationId)),
          consultationId: assessment.consultationId,
          diagnosis: this.buildDiagnosisFromAssessment(assessment),
          treatment: this.buildTreatmentFromAssessment(assessment),
          notes: this.buildNotesFromAssessment(assessment),
        },
      });

      // Store detailed assessment data
      await this.storeAssessmentData(assessment);

      // Update consultation status if needed
      await this.updateConsultationStatus(assessment.consultationId, 'assessment_completed');

      this.logger.log(`Created psychological assessment for consultation ${assessment.consultationId}`);
      
      return medicalRecord;
    } catch (error) {
      this.logger.error('Error creating psychological assessment:', error);
      throw error;
    }
  }

  /**
   * Create therapy session record
   */
  async createSession(session: PsychologistSession): Promise<any> {
    try {
      // Create session record
      const sessionRecord = await this.prismaService.consultation.create({
        data: {
          id: session.sessionId,
          patientId: (await this.getConsultationPatientId(session.consultationId)),
          professionalId: (await this.getConsultationProfessionalId(session.consultationId)),
          specialtyId: (await this.getSpecialtyId('psicologo')),
          specialty: 'psicologo' as any,
          status: 'em_atendimento',
          priority: 'media' as any,
          reason: `Sessão ${session.sessionNumber} - ${session.sessionType}`,
          description: this.buildSessionDescription(session),
          startedAt: new Date(),
          attachments: [],
        },
      });

      // Store session data
      await this.storeSessionData(session);

      this.logger.log(`Created therapy session ${session.sessionId}`);
      
      return sessionRecord;
    } catch (error) {
      this.logger.error('Error creating therapy session:', error);
      throw error;
    }
  }

  /**
   * Get psychologist dashboard data
   */
  async getPsychologistDashboard(psychologistId: string): Promise<any> {
    try {
      const [
        activeConsultations,
        todaySessions,
        weeklyStats,
        crisisAlerts,
      ] = await Promise.all([
        this.getActiveConsultations(psychologistId),
        this.getTodaySessions(psychologistId),
        this.getWeeklyStats(psychologistId),
        this.getCrisisAlerts(),
      ]);

      return {
        activeConsultations,
        todaySessions,
        weeklyStats,
        crisisAlerts,
        lastUpdated: new Date(),
      };
    } catch (error) {
      this.logger.error('Error getting psychologist dashboard:', error);
      throw error;
    }
  }

  /**
   * Get patient psychological history
   */
  async getPatientPsychologicalHistory(patientId: string): Promise<any> {
    try {
      const consultations = await this.prismaService.consultation.findMany({
        where: {
          patientId,
          specialty: 'psicologo' as any,
        },
        include: {
          medicalRecord: true,
          professional: {
            include: {
              user: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      // Get psychological assessments
      const assessments = await this.getPatientAssessments(patientId);

      return {
        consultations,
        assessments,
        totalSessions: consultations.length,
        lastSession: consultations[0]?.createdAt,
      };
    } catch (error) {
      this.logger.error('Error getting patient psychological history:', error);
      throw error;
    }
  }

  /**
   * Find available psychologist
   */
  private async findAvailablePsychologist(): Promise<any> {
    return this.prismaService.doctor.findFirst({
      where: {
        specialty: {
          name: 'Psicólogo',
        },
        isAvailable: true,
        user: {
          isOnline: true,
          isActive: true,
        },
      },
      include: {
        user: true,
        specialty: true,
      },
    });
  }

  /**
   * Try to assign urgent consultation
   */
  private async tryAssignUrgentConsultation(consultationId: string): Promise<void> {
    const availablePsychologist = await this.findAvailablePsychologist();
    
    if (availablePsychologist) {
      await this.prismaService.consultation.update({
        where: { id: consultationId },
        data: {
          professionalId: availablePsychologist.userId,
          status: 'em_atendimento',
          startedAt: new Date(),
        },
      });
    }
  }

  /**
   * Store psychologist-specific data
   */
  private async storePsychologistData(consultationId: string, request: PsychologistConsultationRequest): Promise<void> {
    const data = {
      consultationType: request.consultationType,
      urgencyLevel: request.urgencyLevel,
      symptoms: request.symptoms || [],
      previousTherapy: request.previousTherapy || false,
      currentMedication: request.currentMedication || [],
      timestamp: new Date(),
    };

    await this.redisService.set(
      `psychologist:consultation:${consultationId}`,
      JSON.stringify(data),
      86400 // 24 hours
    );
  }

  /**
   * Store assessment data
   */
  private async storeAssessmentData(assessment: PsychologistAssessment): Promise<void> {
    await this.redisService.set(
      `psychologist:assessment:${assessment.consultationId}`,
      JSON.stringify(assessment),
      86400 * 30 // 30 days
    );
  }

  /**
   * Store session data
   */
  private async storeSessionData(session: PsychologistSession): Promise<void> {
    await this.redisService.set(
      `psychologist:session:${session.sessionId}`,
      JSON.stringify(session),
      86400 * 30 // 30 days
    );
  }

  /**
   * Get active consultations for psychologist
   */
  private async getActiveConsultations(psychologistId: string): Promise<any[]> {
    return this.prismaService.consultation.findMany({
      where: {
        professionalId: psychologistId,
        status: {
          in: ['em_atendimento', 'em_fila'],
        },
        specialty: 'psicologo' as any,
      },
      include: {
        patient: {
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        priority: 'desc',
      },
    });
  }

  /**
   * Get today's sessions for psychologist
   */
  private async getTodaySessions(psychologistId: string): Promise<any[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.prismaService.consultation.findMany({
      where: {
        professionalId: psychologistId,
        specialty: 'psicologo' as any,
        createdAt: {
          gte: today,
          lt: tomorrow,
        },
      },
      include: {
        patient: {
          include: {
            user: true,
          },
        },
      },
    });
  }

  /**
   * Get weekly statistics
   */
  private async getWeeklyStats(psychologistId: string): Promise<any> {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const stats = await this.prismaService.consultation.groupBy({
      by: ['status'],
      where: {
        professionalId: psychologistId,
        specialty: 'psicologo' as any,
        createdAt: {
          gte: weekAgo,
        },
      },
      _count: true,
    });

    return {
      total: stats.reduce((sum, stat) => sum + stat._count, 0),
      byStatus: stats.reduce((acc, stat) => {
        acc[stat.status] = stat._count;
        return acc;
      }, {}),
    };
  }

  /**
   * Get crisis alerts
   */
  private async getCrisisAlerts(): Promise<any[]> {
    return this.prismaService.consultation.findMany({
      where: {
        specialty: 'psicologo' as any,
        priority: 'urgente' as any,
        status: {
          in: ['em_fila', 'em_atendimento'],
        },
      },
      include: {
        patient: {
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 5,
    });
  }

  /**
   * Get patient assessments
   */
  private async getPatientAssessments(patientId: string): Promise<any[]> {
    // Get from Redis cache
    const keys = await this.redisService.getClient()?.keys(`psychologist:assessment:*`) || [];
    const assessments = [];

    for (const key of keys) {
      const data = await this.redisService.get(key);
      if (data) {
        try {
          const assessment = JSON.parse(data);
          // Check if assessment belongs to patient's consultations
          const consultation = await this.prismaService.consultation.findUnique({
            where: { id: assessment.consultationId },
          });
          
          if (consultation?.patientId === patientId) {
            assessments.push(assessment);
          }
        } catch (error) {
          this.logger.warn(`Failed to parse assessment data from key ${key}:`, error);
        }
      }
    }

    return assessments;
  }

  /**
   * Helper methods
   */
  private async getSpecialtyId(specialtyName: string): Promise<string> {
    const specialty = await this.prismaService.specialty.findUnique({
      where: { name: specialtyName },
    });
    return specialty?.id || '';
  }

  private async getConsultationPatientId(consultationId: string): Promise<string> {
    const consultation = await this.prismaService.consultation.findUnique({
      where: { id: consultationId },
    });
    return consultation?.patientId || '';
  }

  private async getConsultationProfessionalId(consultationId: string): Promise<string> {
    const consultation = await this.prismaService.consultation.findUnique({
      where: { id: consultationId },
    });
    return consultation?.professionalId || '';
  }

  private buildConsultationDescription(request: PsychologistConsultationRequest): string {
    let description = `${request.consultationType === 'urgent' ? 'Consulta Urgente' : 'Consulta Agendada'}: ${request.reason}`;
    
    if (request.symptoms && request.symptoms.length > 0) {
      description += `\nSintomas: ${request.symptoms.join(', ')}`;
    }
    
    if (request.urgencyLevel === 'crisis') {
      description += '\n🚨 SITUAÇÃO DE CRISE - ATENDIMENTO IMEDIATO NECESSÁRIO';
    }
    
    return description;
  }

  private buildDiagnosisFromAssessment(assessment: PsychologistAssessment): string {
    return `Avaliação Psicológica - ${assessment.assessmentType}`;
  }

  private buildTreatmentFromAssessment(assessment: PsychologistAssessment): string {
    return `Plano Terapêutico: ${assessment.therapeuticPlan.approach}`;
  }

  private buildNotesFromAssessment(assessment: PsychologistAssessment): string {
    return `Estado Mental: Humor ${assessment.mentalState.mood}, Ansiedade ${assessment.mentalState.anxiety}/10, Depressão ${assessment.mentalState.depression}/10`;
  }

  private buildSessionDescription(session: PsychologistSession): string {
    return `Sessão ${session.sessionNumber} - ${session.sessionType} (${session.duration}min)`;
  }

  private async notifyCrisisIntervention(psychologistId: string, consultationId: string): Promise<void> {
    // Store notification in Redis for real-time delivery
    await this.redisService.set(
      `notification:crisis:${psychologistId}`,
      JSON.stringify({
        consultationId,
        message: 'Nova situação de crise requer atendimento imediato',
        timestamp: new Date(),
      }),
      300 // 5 minutes
    );
  }

  private async updateConsultationStatus(consultationId: string, status: string): Promise<void> {
    // Implementation for updating consultation status
  }

  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}
