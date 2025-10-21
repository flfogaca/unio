import {
  BaseEntity,
  ConsultationStatus,
  ConsultationPriority,
} from '@/shared/types';

export interface Consultation extends BaseEntity {
  patientId: string;
  specialty: string;
  description: string;
  status: ConsultationStatus;
  priority: ConsultationPriority;
  professionalId?: string;
  position?: number;
  estimatedWaitTime?: number;
  scheduledAt?: Date;
  startedAt?: Date;
  finishedAt?: Date;
  notes?: string;
  attachments?: string[];
  roomId?: string;
}
