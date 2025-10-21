import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/infrastructure/database/prisma.service';

export interface CreateMedicalRecordDto {
  consultationId: string;
  patientId: string;
  professionalId: string;
  specialty: string;
  diagnosis?: string;
  treatment?: string;
  notes?: string;
  vitalSigns?: any;
  prescription?: string[];
  attachments?: string[];
  isPrivate?: boolean;
}

@Injectable()
export class MedicalRecordsService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createMedicalRecordDto: CreateMedicalRecordDto) {
    return this.prismaService.medicalRecord.create({
      data: {
        id: this.generateUUID(),
        consultationId: createMedicalRecordDto.consultationId,
        patientId: createMedicalRecordDto.patientId,
        professionalId: createMedicalRecordDto.professionalId,
        specialty: createMedicalRecordDto.specialty as any,
        diagnosis: createMedicalRecordDto.diagnosis,
        treatment: createMedicalRecordDto.treatment,
        notes: createMedicalRecordDto.notes,
        vitalSigns: createMedicalRecordDto.vitalSigns,
        prescription: createMedicalRecordDto.prescription || [],
        attachments: createMedicalRecordDto.attachments || [],
        isPrivate: createMedicalRecordDto.isPrivate || true,
      },
      include: {
        consultation: true,
        patient: true,
        professional: true,
      },
    });
  }

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

  async findAll(options: { patientId?: string; professionalId?: string } = {}) {
    const where: any = {};
    if (options.patientId) where.patientId = options.patientId;
    if (options.professionalId) where.professionalId = options.professionalId;

    return this.prismaService.medicalRecord.findMany({
      where,
      include: {
        consultation: true,
        patient: true,
        professional: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const medicalRecord = await this.prismaService.medicalRecord.findUnique({
      where: { id },
      include: {
        consultation: true,
        patient: true,
        professional: true,
      },
    });

    if (!medicalRecord) {
      throw new NotFoundException('Prontuário não encontrado');
    }

    return medicalRecord;
  }

  async update(id: string, updateData: any) {
    return this.prismaService.medicalRecord.update({
      where: { id },
      data: updateData,
      include: {
        consultation: true,
        patient: true,
        professional: true,
      },
    });
  }

  async remove(id: string) {
    return this.prismaService.medicalRecord.delete({
      where: { id },
    });
  }

  async findByConsultation(consultationId: string) {
    return this.prismaService.medicalRecord.findFirst({
      where: { consultationId },
      include: {
        consultation: true,
        patient: true,
        professional: true,
      },
    });
  }

  async share(recordId: string, professionalId: string) {
    const record = await this.prismaService.medicalRecord.findUnique({
      where: { id: recordId },
    });

    if (!record) {
      throw new NotFoundException(
        `Medical record with ID ${recordId} not found`
      );
    }

    const updatedSharedWith = [...record.sharedWith, professionalId];

    return this.prismaService.medicalRecord.update({
      where: { id: recordId },
      data: { sharedWith: updatedSharedWith },
      include: {
        consultation: true,
        patient: true,
        professional: true,
      },
    });
  }

  async unshare(recordId: string, professionalId: string) {
    const record = await this.prismaService.medicalRecord.findUnique({
      where: { id: recordId },
    });

    if (!record) {
      throw new NotFoundException(
        `Medical record with ID ${recordId} not found`
      );
    }

    const updatedSharedWith = record.sharedWith.filter(
      id => id !== professionalId
    );

    return this.prismaService.medicalRecord.update({
      where: { id: recordId },
      data: { sharedWith: updatedSharedWith },
      include: {
        consultation: true,
        patient: true,
        professional: true,
      },
    });
  }
}
