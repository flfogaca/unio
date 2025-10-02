import { Injectable } from '@nestjs/common';
import { UserRole, Specialty } from '@/shared/types';

@Injectable()
export class SpecialtyFilterService {
  /**
   * Get the specialty that a user role can access
   */
  getUserSpecialty(userRole: UserRole): Specialty | null {
    const roleToSpecialtyMap: Record<UserRole, Specialty | null> = {
      [UserRole.paciente]: null, // Patients can access any specialty
      [UserRole.psicologo]: Specialty.psicologo,
      [UserRole.dentista]: Specialty.dentista,
      [UserRole.medico]: Specialty.medico_clinico,
      [UserRole.admin]: null, // Admin can access all
    };

    return roleToSpecialtyMap[userRole] || null;
  }

  /**
   * Check if a user can access a specific specialty
   */
  canAccessSpecialty(userRole: UserRole, specialty: Specialty): boolean {
    // Admin can access all specialties
    if (userRole === UserRole.admin) {
      return true;
    }

    // Patients can access any specialty
    if (userRole === UserRole.paciente) {
      return true;
    }

    // Professionals can only access their own specialty
    const userSpecialty = this.getUserSpecialty(userRole);
    return userSpecialty === specialty;
  }

  /**
   * Filter consultations by user's specialty access
   */
  filterConsultationsBySpecialty(consultations: any[], userRole: UserRole, userSpecialty?: Specialty) {
    if (userRole === UserRole.admin || userRole === UserRole.paciente) {
      return consultations;
    }

    const allowedSpecialty = userSpecialty || this.getUserSpecialty(userRole);
    
    if (!allowedSpecialty) {
      return [];
    }

    return consultations.filter(consultation => consultation.specialty === allowedSpecialty);
  }

  /**
   * Filter users by specialty (for admin views)
   */
  filterUsersBySpecialty(users: any[], specialty: Specialty) {
    const specialtyToRoleMap: Record<Specialty, UserRole[]> = {
      [Specialty.psicologo]: [UserRole.psicologo],
      [Specialty.dentista]: [UserRole.dentista],
      [Specialty.medico_clinico]: [UserRole.medico],
    };

    const allowedRoles = specialtyToRoleMap[specialty] || [];
    return users.filter(user => allowedRoles.includes(user.role));
  }

  /**
   * Get specialty display name
   */
  getSpecialtyDisplayName(specialty: Specialty): string {
    const displayNames: Record<Specialty, string> = {
      [Specialty.psicologo]: 'Psicólogo',
      [Specialty.dentista]: 'Dentista',
      [Specialty.medico_clinico]: 'Médico Clínico',
    };

    return displayNames[specialty] || specialty;
  }

  /**
   * Get all specialties a user can access
   */
  getUserAccessibleSpecialties(userRole: UserRole): Specialty[] {
    if (userRole === UserRole.admin || userRole === UserRole.paciente) {
      return Object.values(Specialty);
    }

    const userSpecialty = this.getUserSpecialty(userRole);
    return userSpecialty ? [userSpecialty] : [];
  }

  /**
   * Validate specialty access for database queries
   */
  getSpecialtyFilterForQuery(userRole: UserRole, userSpecialty?: Specialty) {
    if (userRole === UserRole.admin || userRole === UserRole.paciente) {
      return {}; // No filter for admin or patients
    }

    const allowedSpecialty = userSpecialty || this.getUserSpecialty(userRole);
    
    if (!allowedSpecialty) {
      return { specialty: 'INVALID_SPECIALTY' }; // This will return no results
    }

    return { specialty: allowedSpecialty };
  }

  /**
   * Get role-specific statistics filter
   */
  getStatisticsFilter(userRole: UserRole, userSpecialty?: Specialty) {
    if (userRole === UserRole.admin) {
      return {}; // Admin sees all statistics
    }

    if (userRole === UserRole.paciente) {
      return { patientId: 'USER_ID' }; // Patients see their own data
    }

    const allowedSpecialty = userSpecialty || this.getUserSpecialty(userRole);
    
    if (!allowedSpecialty) {
      return { specialty: 'INVALID_SPECIALTY' };
    }

    return { 
      specialty: allowedSpecialty,
      professionalId: 'USER_ID' // Professionals see their own consultations
    };
  }
}
