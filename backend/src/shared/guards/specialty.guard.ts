import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole, Specialty } from '@/shared/types';

export interface SpecialtyRequirement {
  specialty: Specialty;
  roles: UserRole[];
}

export const SPECIALTY_KEY = 'specialty';

@Injectable()
export class SpecialtyGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const specialtyRequirements = this.reflector.getAllAndOverride<SpecialtyRequirement[]>(
      SPECIALTY_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!specialtyRequirements || specialtyRequirements.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Admin can access all specialties
    if (user.role === UserRole.admin) {
      return true;
    }

    // Check if user role is allowed for any of the required specialties
    const userSpecialty = this.getUserSpecialty(user.role);
    
    if (!userSpecialty) {
      throw new ForbiddenException('User role does not have a specialty');
    }

    const hasAccess = specialtyRequirements.some(requirement => 
      requirement.specialty === userSpecialty && 
      requirement.roles.includes(user.role)
    );

    if (!hasAccess) {
      throw new ForbiddenException(`Access denied for specialty: ${userSpecialty}`);
    }

    return true;
  }

  private getUserSpecialty(userRole: UserRole): Specialty | null {
    const roleToSpecialtyMap: Record<UserRole, Specialty | null> = {
      [UserRole.paciente]: null, // Patients can access any specialty
      [UserRole.psicologo]: Specialty.psicologo,
      [UserRole.dentista]: Specialty.dentista,
      [UserRole.medico]: Specialty.medico_clinico,
      [UserRole.admin]: null, // Admin can access all
    };

    return roleToSpecialtyMap[userRole] || null;
  }
}
