import { useMemo } from 'react';
import { UserRole, Specialty } from '@/shared/types';

interface User {
  id: string;
  role: UserRole;
  specialties?: string[];
}

interface SpecialtyAccess {
  canAccessSpecialty: (specialty: Specialty) => boolean;
  getUserSpecialty: () => Specialty | null;
  getAccessibleSpecialties: () => Specialty[];
  getSpecialtyDisplayName: (specialty: Specialty) => string;
  filterByAccess: <T>(items: T[], getSpecialty: (item: T) => Specialty) => T[];
}

export const useSpecialtyAccess = (user: User | null): SpecialtyAccess => {
  return useMemo(() => {
    const getUserSpecialty = (): Specialty | null => {
      if (!user) return null;

      const roleToSpecialtyMap: Record<UserRole, Specialty | null> = {
        [UserRole.paciente]: null, // Patients can access any specialty
        [UserRole.psicologo]: Specialty.psicologo,
        [UserRole.dentista]: Specialty.dentista,
        [UserRole.medico]: Specialty.medico_clinico,
        [UserRole.admin]: null, // Admin can access all
      };

      return roleToSpecialtyMap[user.role] || null;
    };

    const canAccessSpecialty = (specialty: Specialty): boolean => {
      if (!user) return false;

      // Admin can access all specialties
      if (user.role === UserRole.admin) {
        return true;
      }

      // Patients can access any specialty
      if (user.role === UserRole.paciente) {
        return true;
      }

      // Professionals can only access their own specialty
      const userSpecialty = getUserSpecialty();
      return userSpecialty === specialty;
    };

    const getAccessibleSpecialties = (): Specialty[] => {
      if (!user) return [];

      if (user.role === UserRole.admin || user.role === UserRole.paciente) {
        return Object.values(Specialty);
      }

      const userSpecialty = getUserSpecialty();
      return userSpecialty ? [userSpecialty] : [];
    };

    const getSpecialtyDisplayName = (specialty: Specialty): string => {
      const displayNames: Record<Specialty, string> = {
        [Specialty.psicologo]: 'Psicólogo',
        [Specialty.dentista]: 'Dentista',
        [Specialty.medico_clinico]: 'Médico Clínico',
      };

      return displayNames[specialty] || specialty;
    };

    const filterByAccess = <T>(
      items: T[],
      getSpecialty: (item: T) => Specialty
    ): T[] => {
      if (!user) return [];

      if (user.role === UserRole.admin || user.role === UserRole.paciente) {
        return items;
      }

      const userSpecialty = getUserSpecialty();
      if (!userSpecialty) return [];

      return items.filter(item => getSpecialty(item) === userSpecialty);
    };

    return {
      canAccessSpecialty,
      getUserSpecialty,
      getAccessibleSpecialties,
      getSpecialtyDisplayName,
      filterByAccess,
    };
  }, [user]);
};
