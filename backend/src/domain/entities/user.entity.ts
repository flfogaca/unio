import { BaseEntity, UserRole } from '@/shared/types';

export interface User extends BaseEntity {
  cpf: string;
  email: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  phone?: string;
  birthDate?: Date;
  avatar?: string;
  cro?: string; // Para dentistas
  specialties?: string[]; // Para profissionais
  isOnline?: boolean;
  lastLoginAt?: Date;
}

