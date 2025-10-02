import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '@/infrastructure/database/prisma.service';
import { UserRole } from '@/shared/types';
import { generateUUID } from '@/shared/utils';

@Injectable()
export class MedicalRecordsService {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll(user: any) {
    let where: any = {};

    if (user.role === UserRole.paciente) {
      where.patientId = user.id;
    } else if ([UserRole.dentista, UserRole.psicologo, UserRole.medico].includes(user.role)) {
      where.OR = [
        { professionalId: user.id },
        { sharedWith: { has: user.id } },
      ];
    }

    const medicalRecords = await this.prismaService.medicalRecord.findMany({
      where,
      include: {
        consultation: {
          select: {
            id: true,
            specialty: true,
            createdAt: true,
          },
        },
        patient: {
          select: {
            id: true,
            name: true,
            cpf: true,
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
      orderBy: { createdAt: 'desc' },
    });

    return medicalRecords;
  }

  async findOne(id: string, user: any) {
    const medicalRecord = await this.prismaService.medicalRecord.findUnique({
      where: { id },
      include: {
        consultation: {
          select: {
            id: true,
            specialty: true,
            description: true,
            createdAt: true,
            finishedAt: true,
          },
        },
        patient: {
          select: {
            id: true,
            name: true,
            cpf: true,
            birthDate: true,
          },
        },
        professional: {
          select: {
            id: true,
            name: true,
            specialties: true,
            cro: true,
          },
        },
      },
    });

    if (!medicalRecord) {
      throw new NotFoundException('Prontuário não encontrado');
    }

    // Check access permissions
    if (!this.canAccess(medicalRecord, user)) {
      throw new ForbiddenException('Acesso negado ao prontuário');
    }

    return medicalRecord;
  }

  async create(createData: any, user: any) {
    const {
      consultationId,
      patientId,
      specialty,
      diagnosis,
      treatment,
      prescription,
      notes,
      vitalSigns,
      attachments,
    } = createData;

    // Verify consultation exists and user has permission
    const consultation = await this.prismaService.consultation.findUnique({
      where: { id: consultationId },
    });

    if (!consultation) {
      throw new NotFoundException('Consultação não encontrada');
    }

    if (consultation.professionalId !== user.id) {
      throw new ForbiddenException('Você não pode criar prontuário para esta consulta');
    }

    const medicalRecord = await this.prismaService.medicalRecord.create({
      data: {
        id: generateUUID(),
        consultationId,
        patientId,
        professionalId: user.id,
        specialty: specialty as any,
        diagnosis,
        treatment,
        prescription: prescription || [],
        notes,
        vitalSigns,
        attachments: attachments || [],
      },
      include: {
        consultation: {
          select: {
            id: true,
            specialty: true,
            createdAt: true,
          },
        },
        patient: {
          select: {
            id: true,
            name: true,
            cpf: true,
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
    });

    // Create audit log
    await this.prismaService.createAuditLog({
      userId: user.id,
      action: 'create',
      entityType: 'MedicalRecord',
      entityId: medicalRecord.id,
      newData: {
        consultationId,
        patientId,
        diagnosis,
        treatment,
      },
    });

    return medicalRecord;
  }

  async update(id: string, updateData: any, user: any) {
    const existingRecord = await this.prismaService.medicalRecord.findUnique({
      where: { id },
    });

    if (!existingRecord) {
      throw new NotFoundException('Prontuário não encontrado');
    }

    if (!this.canModify(existingRecord, user)) {
      throw new ForbiddenException('Você não pode modificar este prontuário');
    }

    const updatedRecord = await this.prismaService.medicalRecord.update({
      where: { id },
      data: {
        ...updateData,
        prescription: updateData.prescription || existingRecord.prescription,
        attachments: updateData.attachments || existingRecord.attachments,
      },
      include: {
        consultation: {
          select: {
            id: true,
            specialty: true,
            createdAt: true,
          },
        },
        patient: {
          select: {
            id: true,
            name: true,
            cpf: true,
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
    });

    // Create audit log
    await this.prismaService.createAuditLog({
      userId: user.id,
      action: 'update',
      entityType: 'MedicalRecord',
      entityId: id,
      oldData: existingRecord,
      newData: updatedRecord,
    });

    return updatedRecord;
  }

  async share(id: string, professionalId: string, user: any) {
    const medicalRecord = await this.prismaService.medicalRecord.findUnique({
      where: { id },
    });

    if (!medicalRecord) {
      throw new NotFoundException('Prontuário não encontrado');
    }

    if (!this.canModify(medicalRecord, user)) {
      throw new ForbiddenException('Você não pode compartilhar este prontuário');
    }

    // Verify professional exists
    const professional = await this.prismaService.user.findUnique({
      where: { id: professionalId },
    });

    if (!professional || ![UserRole.dentista, UserRole.psicologo, UserRole.medico].includes(professional.role)) {
      throw new NotFoundException('Profissional não encontrado');
    }

    const updatedRecord = await this.prismaService.medicalRecord.update({
      where: { id },
      data: {
        sharedWith: [...(medicalRecord.sharedWith || []), professionalId],
      },
    });

    // Create audit log
    await this.prismaService.createAuditLog({
      userId: user.id,
      action: 'share',
      entityType: 'MedicalRecord',
      entityId: id,
      newData: {
        sharedWith: professionalId,
        sharedBy: user.id,
      },
    });

    return updatedRecord;
  }

  async unshare(id: string, professionalId: string, user: any) {
    const medicalRecord = await this.prismaService.medicalRecord.findUnique({
      where: { id },
    });

    if (!medicalRecord) {
      throw new NotFoundException('Prontuário não encontrado');
    }

    if (!this.canModify(medicalRecord, user)) {
      throw new ForbiddenException('Você não pode modificar este prontuário');
    }

    const updatedSharedWith = (medicalRecord.sharedWith || []).filter(
      id => id !== professionalId
    );

    const updatedRecord = await this.prismaService.medicalRecord.update({
      where: { id },
      data: {
        sharedWith: updatedSharedWith,
      },
    });

    // Create audit log
    await this.prismaService.createAuditLog({
      userId: user.id,
      action: 'unshare',
      entityType: 'MedicalRecord',
      entityId: id,
      oldData: { sharedWith: medicalRecord.sharedWith },
      newData: { sharedWith: updatedSharedWith },
    });

    return updatedRecord;
  }

  private canAccess(medicalRecord: any, user: any): boolean {
    // Patient can access their own records
    if (user.role === UserRole.paciente && medicalRecord.patientId === user.id) {
      return true;
    }

    // Admin can access all records
    if (user.role === UserRole.admin) {
      return true;
    }

    // Professional who created the record can access it
    if (medicalRecord.professionalId === user.id) {
      return true;
    }

    // Professional who was granted access can access it
    if (medicalRecord.sharedWith?.includes(user.id)) {
      return true;
    }

    return false;
  }

  private canModify(medicalRecord: any, user: any): boolean {
    // Only the professional who created the record can modify it
    if (medicalRecord.professionalId === user.id) {
      return true;
    }

    // Admin can modify all records
    if (user.role === UserRole.admin) {
      return true;
    }

    return false;
  }
}
