// Common types used across the application

export type UserRole = 'paciente' | 'dentista' | 'psicologo' | 'medico' | 'admin';

export type ConsultationStatus = 'em-fila' | 'em-atendimento' | 'finalizado' | 'cancelado';

export type ConsultationPriority = 'baixa' | 'media' | 'alta' | 'urgente';

export type Specialty = 'psicologo' | 'dentista' | 'medico-clinico';

export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  timestamp: string;
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export interface VideoCallRoom {
  roomId: string;
  consultationId: string;
  participants: {
    userId: string;
    role: UserRole;
    socketId: string;
  }[];
  createdAt: Date;
  expiresAt: Date;
}
