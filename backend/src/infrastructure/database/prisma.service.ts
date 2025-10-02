import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      log: ['query', 'info', 'warn', 'error'],
    });
  }

  async onModuleInit() {
    await this.$connect();
    console.log('🔗 Database connected successfully');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    console.log('🔌 Database disconnected');
  }

  // Utility methods for common operations
  async findUserByCPF(cpf: string) {
    return this.user.findUnique({
      where: { cpf },
      include: {
        consultationsAsPatient: {
          where: { status: { in: ['em_fila', 'em_atendimento'] } },
          orderBy: { createdAt: 'asc' },
        },
        consultationsAsProfessional: {
          where: { status: { in: ['em_atendimento'] } },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  }

  async findUserByEmail(email: string) {
    return this.user.findUnique({
      where: { email },
    });
  }

  async findActiveConsultationsBySpecialty(specialty: string) {
    return this.consultation.findMany({
      where: {
        specialty: specialty as any,
        status: { in: ['em_fila', 'em_atendimento'] },
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
        professional: {
          select: {
            id: true,
            name: true,
            specialties: true,
          },
        },
      },
      orderBy: [
        { priority: 'desc' }, // Urgent first
        { createdAt: 'asc' }, // Then by creation time
      ],
    });
  }

  async updateQueuePositions(specialty: string) {
    const consultations = await this.findActiveConsultationsBySpecialty(specialty);
    
    for (let i = 0; i < consultations.length; i++) {
      const consultation = consultations[i];
      const position = i + 1;
      const estimatedWaitTime = i * 10 + 5; // 5, 15, 25, 35... minutes

      await this.consultation.update({
        where: { id: consultation.id },
        data: {
          position,
          estimatedWaitTime,
        },
      });
    }

    return consultations.length;
  }

  async createMedicalRecord(data: {
    consultationId: string;
    patientId: string;
    professionalId: string;
    specialty: string;
    diagnosis?: string;
    treatment?: string;
    prescription?: string[];
    notes?: string;
    vitalSigns?: any;
    attachments?: string[];
  }) {
    return this.medicalRecord.create({
      data: {
        consultationId: data.consultationId,
        patientId: data.patientId,
        professionalId: data.professionalId,
        specialty: data.specialty as any,
        diagnosis: data.diagnosis,
        treatment: data.treatment,
        prescription: data.prescription || [],
        notes: data.notes,
        vitalSigns: data.vitalSigns,
        attachments: data.attachments || [],
      },
    });
  }

  async getQueueStatistics(specialty?: string, date?: Date) {
    const whereClause: any = {};
    
    if (specialty) {
      whereClause.specialty = specialty;
    }
    
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      whereClause.date = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    return this.queueStatistics.findMany({
      where: whereClause,
      orderBy: { date: 'desc' },
    });
  }

  async createAuditLog(data: {
    userId?: string;
    action: string;
    entityType: string;
    entityId?: string;
    oldData?: any;
    newData?: any;
    ipAddress?: string;
    userAgent?: string;
  }) {
    return this.auditLog.create({
      data: {
        userId: data.userId,
        action: data.action,
        entityType: data.entityType,
        entityId: data.entityId,
        oldData: data.oldData,
        newData: data.newData,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      },
    });
  }

  async getSystemConfig(key: string) {
    const config = await this.systemConfig.findUnique({
      where: { key },
    });
    
    if (!config) return null;
    
    // Parse value based on type
    switch (config.type) {
      case 'number':
        return Number(config.value);
      case 'boolean':
        return config.value === 'true';
      case 'json':
        return JSON.parse(config.value);
      default:
        return config.value;
    }
  }

  async setSystemConfig(key: string, value: any, type: string = 'string', category: string = 'general') {
    let stringValue: string;
    
    switch (type) {
      case 'number':
      case 'boolean':
        stringValue = String(value);
        break;
      case 'json':
        stringValue = JSON.stringify(value);
        break;
      default:
        stringValue = String(value);
    }

    return this.systemConfig.upsert({
      where: { key },
      update: { value: stringValue },
      create: {
        key,
        value: stringValue,
        type,
        category,
      },
    });
  }
}
