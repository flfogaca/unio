import { BaseEntity } from '@/shared/types';

export interface VitalSigns {
  bloodPressure?: string;
  heartRate?: number;
  temperature?: number;
  oxygenSaturation?: number;
  weight?: number;
  height?: number;
}

export interface MedicalRecordData {
  diagnosis: string;
  treatment: string;
  notes?: string;
  vitalSigns?: VitalSigns;
  attachments?: string[];
}

export interface MedicalRecord extends BaseEntity {
  consultationId: string;
  patientId: string;
  professionalId: string;
  data: MedicalRecordData;
  isPrivate: boolean;
  sharedWith?: string[];
}
