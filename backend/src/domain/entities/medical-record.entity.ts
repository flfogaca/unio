import { BaseEntity, UserRole } from '@/shared/types';

export interface MedicalRecordData {
  diagnosis?: string;
  treatment?: string;
  prescription?: string[];
  notes?: string;
  vitalSigns?: {
    bloodPressure?: string;
    heartRate?: number;
    temperature?: number;
    weight?: number;
    height?: number;
  };
  attachments?: string[];
}

export class MedicalRecord extends BaseEntity {
  constructor(
    public readonly id: string,
    public readonly consultationId: string,
    public readonly patientId: string,
    public readonly professionalId: string,
    public readonly specialty: string,
    public readonly data: MedicalRecordData,
    public readonly isPrivate: boolean = true,
    public readonly sharedWith?: string[], // IDs de outros profissionais
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date(),
  ) {
    super();
  }

  // Business rules
  public canBeAccessedBy(userId: string, userRole: UserRole): boolean {
    // Paciente pode ver seus próprios registros
    if (this.patientId === userId) return true;
    
    // Admin pode ver todos
    if (userRole === 'admin') return true;
    
    // Profissional que criou o registro pode sempre acessar
    if (this.professionalId === userId) return true;
    
    // Profissional que foi autorizado a compartilhar
    if (this.sharedWith?.includes(userId)) return true;
    
    return false;
  }

  public canBeModifiedBy(userId: string, userRole: UserRole): boolean {
    // Apenas o profissional que criou pode modificar
    if (this.professionalId === userId) return true;
    
    // Admin pode modificar
    if (userRole === 'admin') return true;
    
    return false;
  }

  public shareWith(professionalId: string): MedicalRecord {
    if (!this.sharedWith) {
      return new MedicalRecord(
        this.id,
        this.consultationId,
        this.patientId,
        this.professionalId,
        this.specialty,
        this.data,
        this.isPrivate,
        [professionalId],
        this.createdAt,
        new Date(),
      );
    }

    if (this.sharedWith.includes(professionalId)) {
      return this; // Já está compartilhado
    }

    return new MedicalRecord(
      this.id,
      this.consultationId,
      this.patientId,
      this.professionalId,
      this.specialty,
      this.data,
      this.isPrivate,
      [...this.sharedWith, professionalId],
      this.createdAt,
      new Date(),
    );
  }

  public unshareWith(professionalId: string): MedicalRecord {
    if (!this.sharedWith || !this.sharedWith.includes(professionalId)) {
      return this;
    }

    return new MedicalRecord(
      this.id,
      this.consultationId,
      this.patientId,
      this.professionalId,
      this.specialty,
      this.data,
      this.isPrivate,
      this.sharedWith.filter(id => id !== professionalId),
      this.createdAt,
      new Date(),
    );
  }

  public updateData(newData: Partial<MedicalRecordData>): MedicalRecord {
    return new MedicalRecord(
      this.id,
      this.consultationId,
      this.patientId,
      this.professionalId,
      this.specialty,
      { ...this.data, ...newData },
      this.isPrivate,
      this.sharedWith,
      this.createdAt,
      new Date(),
    );
  }

  public setPrivate(isPrivate: boolean): MedicalRecord {
    return new MedicalRecord(
      this.id,
      this.consultationId,
      this.patientId,
      this.professionalId,
      this.specialty,
      this.data,
      isPrivate,
      isPrivate ? undefined : this.sharedWith,
      this.createdAt,
      new Date(),
    );
  }

  public hasPrescription(): boolean {
    return !!(this.data.prescription && this.data.prescription.length > 0);
  }

  public hasVitalSigns(): boolean {
    return !!(this.data.vitalSigns && Object.keys(this.data.vitalSigns).length > 0);
  }

  public getFormattedData(): MedicalRecordData {
    return {
      ...this.data,
      vitalSigns: this.data.vitalSigns ? {
        ...this.data.vitalSigns,
        bloodPressure: this.data.vitalSigns.bloodPressure,
      } : undefined,
    };
  }
}
