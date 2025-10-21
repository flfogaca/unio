export enum Specialty {
  DENTISTA = 'dentista',
  PSICOLOGO = 'psicologo',
  MEDICO_CLINICO = 'medico_clinico',
}

export enum UserRole {
  PACIENTE = 'paciente',
  DENTISTA = 'dentista',
  PSICOLOGO = 'psicologo',
  MEDICO = 'medico',
  ADMIN = 'admin',
}

export enum ConsultationStatus {
  EM_FILA = 'em-fila',
  EM_ATENDIMENTO = 'em-atendimento',
  FINALIZADO = 'finalizado',
  CANCELADO = 'cancelado',
}

export enum ConsultationPriority {
  BAIXA = 'baixa',
  MEDIA = 'media',
  ALTA = 'alta',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  specialties?: string[];
  createdAt?: string;
  updatedAt?: string;
  cpf?: string;
  phone?: string;
  birthDate?: string;
  cro?: string;
  isOnline?: boolean;
  avatar?: string;
}

export interface Consultation {
  id: string;
  patientId: string;
  professionalId?: string;
  specialty: Specialty;
  description: string;
  priority: ConsultationPriority;
  status: ConsultationStatus;
  createdAt: string;
  updatedAt?: string;
  startedAt?: string;
  finishedAt?: string;
  notes?: string;
  attachments?: string[];
  position?: number;
  estimatedWaitTime?: number;
}

export interface Availability {
  id: string;
  professionalId: string;
  specialty: Specialty;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
  emergencyMode: boolean;
}

export interface WaitTime {
  specialty: Specialty;
  averageWaitTime: number;
  currentQueueLength: number;
  estimatedWaitTime: number;
  confidence: 'low' | 'medium' | 'high';
}

export interface ChatMessage {
  id: string;
  consultationId: string;
  senderId: string;
  senderName: string;
  senderType: 'paciente' | 'profissional' | 'sistema';
  message: string;
  timestamp: Date;
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  professionalId: string;
  consultationId?: string;
  title: string;
  description: string;
  diagnosis?: string;
  treatment?: string;
  medications?: string[];
  isPrivate: boolean;
  createdAt: string;
  updatedAt?: string;
}
