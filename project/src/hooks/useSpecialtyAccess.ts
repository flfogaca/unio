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
        [UserRole.PACIENTE]: null, // Patients can access any specialty
        [UserRole.PSICOLOGO]: Specialty.PSICOLOGO,
        [UserRole.DENTISTA]: Specialty.DENTISTA,
        [UserRole.MEDICO]: Specialty.MEDICO_CLINICO,
        [UserRole.ADMIN]: null, // Admin can access all
      };

      return roleToSpecialtyMap[user.role] || null;
    };

    const canAccessSpecialty = (specialty: Specialty): boolean => {
      if (!user) return false;

      // Admin can access all specialties
      if (user.role === UserRole.ADMIN) {
        return true;
      }

      // Patients can access any specialty
      if (user.role === UserRole.PACIENTE) {
        return true;
      }

      // Professionals can only access their own specialty
      const userSpecialty = getUserSpecialty();
      return userSpecialty === specialty;
    };

    const getAccessibleSpecialties = (): Specialty[] => {
      if (!user) return [];

      if (user.role === UserRole.ADMIN || user.role === UserRole.PACIENTE) {
        return Object.values(Specialty);
      }

      const userSpecialty = getUserSpecialty();
      return userSpecialty ? [userSpecialty] : [];
    };

    const getSpecialtyDisplayName = (specialty: Specialty): string => {
      const displayNames: Record<Specialty, string> = {
        [Specialty.PSICOLOGO]: 'Psicólogo',
        [Specialty.DENTISTA]: 'Dentista',
        [Specialty.MEDICO_CLINICO]: 'Médico Clínico',
      };

      return displayNames[specialty] || specialty;
    };

    const filterByAccess = <T>(
      items: T[],
      getSpecialty: (item: T) => Specialty
    ): T[] => {
      if (!user) return [];

      if (user.role === UserRole.ADMIN || user.role === UserRole.PACIENTE) {
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
