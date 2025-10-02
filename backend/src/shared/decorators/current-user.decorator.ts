import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserRole } from '@/shared/types';

export interface CurrentUser {
  id: string;
  cpf: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  birthDate?: Date;
  avatar?: string;
  cro?: string;
  specialties?: string[];
  isActive: boolean;
  isOnline: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): CurrentUser => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
