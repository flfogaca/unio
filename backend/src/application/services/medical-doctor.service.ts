import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/infrastructure/database/prisma.service';
import { RedisService } from '@/infrastructure/external-services/redis.service';
import { Specialty } from '@/shared/types';

interface MedicalConsultationRequest {
  patientId: string;
  consultationType: 'urgent' | 'scheduled' | 'follow_up';
  reason: string;
  urgencyLevel: 'low' | 'medium' | 'high' | 'emergency';
  symptoms: string[];
  duration: string;
  severity: 'mild' | 'moderate' | 'severe';
  previousDiagnosis?: string[];
  currentMedications?: string[];
  allergies?: string[];
  preferredTime?: Date;
}

interface MedicalAssessment {
  consultationId: string;
  assessmentType: 'initial' | 'follow_up' | 'emergency';
  vitalSigns: {
    bloodPressure: string;
    heartRate: number;
    temperature: number;
    oxygenSaturation: number;
    weight?: number;
    height?: number;
  };
  physicalExamination: {
    generalAppearance: string;
    cardiovascular: string;
    respiratory: string;
    gastrointestinal: string;
    neurological: string;
    musculoskeletal: string;
    skin: string;
    notes: string;
  };
  diagnosis: {
    primary: string;
    secondary: string[];
    differential: string[];
    icd10: string[];
  };
  treatment: {
    medications: {
      name: string;
      dosage: string;
      frequency: string;
      duration: string;
      instructions: string;
    }[];
    procedures: string[];
    lifestyle: string[];
    followUp: string;
  };
  recommendations: {
    imaging?: string[];
    laboratory?: string[];
    specialist?: string[];
    emergency?: string;
  };
}

interface Prescription {
  prescriptionId: string;
  consultationId: string;
  medications: {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
    quantity: number;
    refills?: number;
  }[];
  issuedAt: Date;
  validUntil: Date;
  notes?: string;
}

interface MedicalCertificate {
  certificateId: string;
  consultationId: string;
  type: 'sick_leave' | 'medical_certificate' | 'fitness_certificate';
  reason: string;
  duration: number; // in days
  restrictions?: string[];
  issuedAt: Date;
  validFrom: Date;
  validUntil: Date;
}

@Injectable()
export class MedicalDoctorService {
  private readonly logger = new Logger(MedicalDoctorService.name);

  constructor(
    private readonly prismaService: PrismaService,
    private readonly redisService: RedisService,
  ) {}

  /**
   * Create a medical consultation request
   */
  async createConsultationRequest(request: MedicalConsultationRequest): Promise<any> {
    try {
      // Determine priority based on urgency level
      const priorityMapping = {
        'emergency': 'urgente',
        'high': 'alta',
        'medium': 'media',
        'low': 'baixa',
      };

      const priority = priorityMapping[request.urgencyLevel] || 'media';

      // For emergency situations, bypass normal queue
      if (request.urgencyLevel === 'emergency') {
        return this.handleEmergencyConsultation(request);
      }

      // Create consultation
      const consultation = await this.prismaService.consultation.create({
        data: {
          id: this.generateUUID(),
          patientId: request.patientId,
          specialtyId: (await this.getSpecialtyId('medico_clinico')),
          specialty: 'medico_clinico' as any,
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

      // Store additional medical data
      await this.storeMedicalData(consultation.id, request);

      // If urgent, try to find available doctor
      if (request.consultationType === 'urgent') {
        await this.tryAssignUrgentConsultation(consultation.id);
      }

      this.logger.log(`Created medical consultation ${consultation.id} for patient ${request.patientId}`);
      
      return consultation;
    } catch (error) {
      this.logger.error('Error creating medical consultation:', error);
      throw error;
    }
  }

  /**
   * Handle emergency consultation
   */
  private async handleEmergencyConsultation(request: MedicalConsultationRequest): Promise<any> {
    // Find available doctor immediately
    const availableDoctor = await this.findAvailableDoctor();
    
    if (!availableDoctor) {
      // No doctor available - create urgent consultation with highest priority
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
        professionalId: availableDoctor.userId,
        specialtyId: availableDoctor.specialtyId,
        specialty: 'medico_clinico' as any,
        status: 'em_atendimento',
        priority: 'urgente' as any,
        reason: request.reason,
        description: `EMERGÊNCIA MÉDICA: ${request.reason}`,
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

    // Store emergency data
    await this.storeMedicalData(consultation.id, request);

    // Notify doctor immediately
    await this.notifyEmergencyConsultation(availableDoctor.userId, consultation.id);

    return consultation;
  }

  /**
   * Create medical assessment
   */
  async createAssessment(assessment: MedicalAssessment): Promise<any> {
    try {
      // Create medical record with assessment
      const medicalRecord = await this.prismaService.medicalRecord.create({
        data: {
          id: this.generateUUID(),
          patientId: (await this.getConsultationPatientId(assessment.consultationId)),
          consultationId: assessment.consultationId,
          diagnosis: assessment.diagnosis.primary,
          treatment: this.buildTreatmentSummary(assessment.treatment),
          notes: this.buildAssessmentNotes(assessment),
        },
      });

      // Store detailed assessment data
      await this.storeAssessmentData(assessment);

      // Create prescriptions if any
      if (assessment.treatment.medications.length > 0) {
        await this.createPrescription({
          prescriptionId: this.generateUUID(),
          consultationId: assessment.consultationId,
          medications: assessment.treatment.medications,
          issuedAt: new Date(),
          validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        });
      }

      // Update consultation status
      await this.updateConsultationStatus(assessment.consultationId, 'assessment_completed');

      this.logger.log(`Created medical assessment for consultation ${assessment.consultationId}`);
      
      return medicalRecord;
    } catch (error) {
      this.logger.error('Error creating medical assessment:', error);
      throw error;
    }
  }

  /**
   * Create prescription
   */
  async createPrescription(prescription: Prescription): Promise<any> {
    try {
      // Create prescription record
      const prescriptionRecord = await this.prismaService.prescription.create({
        data: {
          id: prescription.prescriptionId,
          medicalRecordId: (await this.getMedicalRecordId(prescription.consultationId)),
          medication: prescription.medications.map(med => 
            `${med.name} ${med.dosage} - ${med.frequency} por ${med.duration}`
          ).join('; '),
          dosage: prescription.medications.map(med => med.dosage).join('; '),
          instructions: prescription.medications.map(med => med.instructions).join('; '),
          issuedAt: prescription.issuedAt,
        },
      });

      // Store detailed prescription data
      await this.storePrescriptionData(prescription);

      this.logger.log(`Created prescription ${prescription.prescriptionId}`);
      
      return prescriptionRecord;
    } catch (error) {
      this.logger.error('Error creating prescription:', error);
      throw error;
    }
  }

  /**
   * Create medical certificate
   */
  async createCertificate(certificate: MedicalCertificate): Promise<any> {
    try {
      // Create certificate record
      const certificateRecord = await this.prismaService.certificate.create({
        data: {
          id: certificate.certificateId,
          medicalRecordId: (await this.getMedicalRecordId(certificate.consultationId)),
          type: this.mapCertificateType(certificate.type),
          description: certificate.reason,
          issuedAt: certificate.issuedAt,
        },
      });

      // Store detailed certificate data
      await this.storeCertificateData(certificate);

      this.logger.log(`Created certificate ${certificate.certificateId}`);
      
      return certificateRecord;
    } catch (error) {
      this.logger.error('Error creating certificate:', error);
      throw error;
    }
  }

  /**
   * Get medical doctor dashboard data
   */
  async getMedicalDoctorDashboard(doctorId: string): Promise<any> {
    try {
      const [
        activeConsultations,
        todayConsultations,
        weeklyStats,
        emergencyAlerts,
      ] = await Promise.all([
        this.getActiveConsultations(doctorId),
        this.getTodayConsultations(doctorId),
        this.getWeeklyStats(doctorId),
        this.getEmergencyAlerts(),
      ]);

      return {
        activeConsultations,
        todayConsultations,
        weeklyStats,
        emergencyAlerts,
        lastUpdated: new Date(),
      };
    } catch (error) {
      this.logger.error('Error getting medical doctor dashboard:', error);
      throw error;
    }
  }

  /**
   * Get patient medical history
   */
  async getPatientMedicalHistory(patientId: string): Promise<any> {
    try {
      const consultations = await this.prismaService.consultation.findMany({
        where: {
          patientId,
          specialty: 'medico_clinico' as any,
        },
        include: {
          medicalRecord: {
            include: {
              prescriptions: true,
              certificates: true,
            },
          },
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

      // Get medical assessments
      const assessments = await this.getPatientAssessments(patientId);

      return {
        consultations,
        assessments,
        totalConsultations: consultations.length,
        lastConsultation: consultations[0]?.createdAt,
        chronicConditions: this.extractChronicConditions(assessments),
        allergies: this.extractAllergies(assessments),
      };
    } catch (error) {
      this.logger.error('Error getting patient medical history:', error);
      throw error;
    }
  }

  /**
   * Get drug interactions
   */
  async checkDrugInteractions(medications: string[]): Promise<any> {
    try {
      // Mock drug interaction check - in real implementation, integrate with drug database
      const interactions = [];
      
      // Simple interaction check
      const commonInteractions = {
        'Warfarina': ['Aspirina', 'Ibuprofeno', 'Paracetamol'],
        'Digoxina': ['Furosemida', 'Hidroclorotiazida'],
        'Metformina': ['Insulina', 'Glibenclamida'],
      };

      for (const medication of medications) {
        for (const [drug, interactionsList] of Object.entries(commonInteractions)) {
          if (interactionsList.includes(medication)) {
            interactions.push({
              drug1: medication,
              drug2: drug,
              severity: 'moderate',
              description: `Possível interação entre ${medication} e ${drug}`,
            });
          }
        }
      }

      return {
        hasInteractions: interactions.length > 0,
        interactions,
        recommendations: interactions.length > 0 ? 
          ['Consulte farmacêutico', 'Monitorar efeitos colaterais', 'Considerar ajuste de dose'] :
          [],
      };
    } catch (error) {
      this.logger.error('Error checking drug interactions:', error);
      throw error;
    }
  }

  /**
   * Get ICD-10 codes for diagnosis
   */
  async getICD10Codes(searchTerm?: string): Promise<any[]> {
    try {
      // Mock ICD-10 codes - in real implementation, use actual ICD-10 database
      const icd10Codes = [
        { code: 'J06.9', description: 'Infecção aguda das vias aéreas superiores não especificada' },
        { code: 'K59.00', description: 'Constipação não especificada' },
        { code: 'M79.3', description: 'Paniculite não especificada' },
        { code: 'R50.9', description: 'Febre não especificada' },
        { code: 'R06.02', description: 'Tosse' },
        { code: 'R10.4', description: 'Outras dores abdominais e as não especificadas' },
        { code: 'R51', description: 'Cefaleia' },
        { code: 'R52', description: 'Dor não classificada em outra parte' },
        { code: 'Z00.00', description: 'Exame médico geral sem anamnese e exame físico anormais' },
        { code: 'Z51.1', description: 'Sessão de quimioterapia antineoplásica' },
      ];

      if (searchTerm) {
        return icd10Codes.filter(code => 
          code.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
          code.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      return icd10Codes;
    } catch (error) {
      this.logger.error('Error getting ICD-10 codes:', error);
      throw error;
    }
  }

  /**
   * Find available doctor
   */
  private async findAvailableDoctor(): Promise<any> {
    return this.prismaService.doctor.findFirst({
      where: {
        specialty: {
          name: 'Médico Clínico',
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
    const availableDoctor = await this.findAvailableDoctor();
    
    if (availableDoctor) {
      await this.prismaService.consultation.update({
        where: { id: consultationId },
        data: {
          professionalId: availableDoctor.userId,
          status: 'em_atendimento',
          startedAt: new Date(),
        },
      });
    }
  }

  /**
   * Store medical-specific data
   */
  private async storeMedicalData(consultationId: string, request: MedicalConsultationRequest): Promise<void> {
    const data = {
      consultationType: request.consultationType,
      urgencyLevel: request.urgencyLevel,
      symptoms: request.symptoms,
      duration: request.duration,
      severity: request.severity,
      previousDiagnosis: request.previousDiagnosis || [],
      currentMedications: request.currentMedications || [],
      allergies: request.allergies || [],
      timestamp: new Date(),
    };

    await this.redisService.set(
      `medical:consultation:${consultationId}`,
      JSON.stringify(data),
      86400 // 24 hours
    );
  }

  /**
   * Store assessment data
   */
  private async storeAssessmentData(assessment: MedicalAssessment): Promise<void> {
    await this.redisService.set(
      `medical:assessment:${assessment.consultationId}`,
      JSON.stringify(assessment),
      86400 * 30 // 30 days
    );
  }

  /**
   * Store prescription data
   */
  private async storePrescriptionData(prescription: Prescription): Promise<void> {
    await this.redisService.set(
      `medical:prescription:${prescription.prescriptionId}`,
      JSON.stringify(prescription),
      86400 * 30 // 30 days
    );
  }

  /**
   * Store certificate data
   */
  private async storeCertificateData(certificate: MedicalCertificate): Promise<void> {
    await this.redisService.set(
      `medical:certificate:${certificate.certificateId}`,
      JSON.stringify(certificate),
      86400 * 365 // 1 year
    );
  }

  /**
   * Get active consultations for doctor
   */
  private async getActiveConsultations(doctorId: string): Promise<any[]> {
    return this.prismaService.consultation.findMany({
      where: {
        professionalId: doctorId,
        status: {
          in: ['em_atendimento', 'em_fila'],
        },
        specialty: 'medico_clinico' as any,
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
   * Get today's consultations for doctor
   */
  private async getTodayConsultations(doctorId: string): Promise<any[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.prismaService.consultation.findMany({
      where: {
        professionalId: doctorId,
        specialty: 'medico_clinico' as any,
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
  private async getWeeklyStats(doctorId: string): Promise<any> {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const stats = await this.prismaService.consultation.groupBy({
      by: ['status'],
      where: {
        professionalId: doctorId,
        specialty: 'medico_clinico' as any,
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
   * Get emergency alerts
   */
  private async getEmergencyAlerts(): Promise<any[]> {
    return this.prismaService.consultation.findMany({
      where: {
        specialty: 'medico_clinico' as any,
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
    const keys = await this.redisService.getClient()?.keys(`medical:assessment:*`) || [];
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

  private async getMedicalRecordId(consultationId: string): Promise<string> {
    const medicalRecord = await this.prismaService.medicalRecord.findUnique({
      where: { consultationId },
    });
    return medicalRecord?.id || '';
  }

  private buildConsultationDescription(request: MedicalConsultationRequest): string {
    let description = `${request.consultationType === 'urgent' ? 'Consulta Urgente' : 'Consulta Médica'}: ${request.reason}`;
    
    if (request.symptoms && request.symptoms.length > 0) {
      description += `\nSintomas: ${request.symptoms.join(', ')}`;
    }
    
    if (request.urgencyLevel === 'emergency') {
      description += '\n🚨 EMERGÊNCIA MÉDICA - ATENDIMENTO IMEDIATO NECESSÁRIO';
    }
    
    return description;
  }

  private buildTreatmentSummary(treatment: MedicalAssessment['treatment']): string {
    return `Medicamentos: ${treatment.medications.map(m => m.name).join(', ')}`;
  }

  private buildAssessmentNotes(assessment: MedicalAssessment): string {
    return `PA: ${assessment.vitalSigns.bloodPressure}, FC: ${assessment.vitalSigns.heartRate}bpm, Temp: ${assessment.vitalSigns.temperature}°C`;
  }

  private mapCertificateType(type: MedicalCertificate['type']): string {
    const mapping = {
      'sick_leave': 'Atestado Médico',
      'medical_certificate': 'Declaração Médica',
      'fitness_certificate': 'Atestado de Saúde',
    };
    return mapping[type] || type;
  }

  private extractChronicConditions(assessments: any[]): string[] {
    const conditions = new Set<string>();
    assessments.forEach(assessment => {
      if (assessment.diagnosis?.primary) {
        conditions.add(assessment.diagnosis.primary);
      }
      assessment.diagnosis?.secondary?.forEach((condition: string) => {
        conditions.add(condition);
      });
    });
    return Array.from(conditions);
  }

  private extractAllergies(assessments: any[]): string[] {
    const allergies = new Set<string>();
    assessments.forEach(assessment => {
      if (assessment.allergies) {
        assessment.allergies.forEach((allergy: string) => {
          allergies.add(allergy);
        });
      }
    });
    return Array.from(allergies);
  }

  private async notifyEmergencyConsultation(doctorId: string, consultationId: string): Promise<void> {
    // Store notification in Redis for real-time delivery
    await this.redisService.set(
      `notification:emergency:${doctorId}`,
      JSON.stringify({
        consultationId,
        message: 'Nova emergência médica requer atendimento imediato',
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
