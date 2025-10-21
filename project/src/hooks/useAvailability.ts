import { useState, useEffect, useCallback } from 'react';
import { Specialty } from '@/shared/types';

interface SystemAvailability {
  specialty: Specialty;
  isAvailable: boolean;
  onlineProfessionals: number;
  estimatedWaitTime: number;
  nextAvailableTime?: string;
  emergencyMode: boolean;
}

interface ProfessionalAvailability {
  userId: string;
  specialty: Specialty;
  isOnline: boolean;
  isAvailable: boolean;
  currentStatus: 'available' | 'busy' | 'away' | 'offline';
  lastActivity: string;
  workingHours: {
    start: string;
    end: string;
    days: number[];
  };
  timezone: string;
}

export const useAvailability = () => {
  const [availabilities, setAvailabilities] = useState<SystemAvailability[]>(
    []
  );
  const [professionalAvailability, setProfessionalAvailability] =
    useState<ProfessionalAvailability | null>(null);
  const [loading, setLoading] = useState(false);

  // Check specialty availability
  const checkSpecialtyAvailability = useCallback(
    async (specialty: Specialty): Promise<SystemAvailability> => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/availability/specialty/${specialty}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to check specialty availability');
        }

        const data = await response.json();
        return data.data;
      } catch (error) {
        console.error('Error checking specialty availability:', error);
        throw error;
      }
    },
    []
  );

  // Get all specialties availability
  const getAllSpecialtiesAvailability = useCallback(async (): Promise<
    SystemAvailability[]
  > => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/availability/specialties`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch specialties availability');
      }

      const data = await response.json();
      const availabilitiesData = data.data || [];

      setAvailabilities(availabilitiesData);
      return availabilitiesData;
    } catch (error) {
      console.error('Error fetching specialties availability:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get professional availability
  const getProfessionalAvailability =
    useCallback(async (): Promise<ProfessionalAvailability | null> => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/availability/professional`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          if (response.status === 404) {
            return null; // User is not a professional
          }
          throw new Error('Failed to fetch professional availability');
        }

        const data = await response.json();
        const professionalData = data.data;

        setProfessionalAvailability(professionalData);
        return professionalData;
      } catch (error) {
        console.error('Error fetching professional availability:', error);
        return null;
      }
    }, []);

  // Update professional availability
  const updateProfessionalAvailability = useCallback(
    async (
      isOnline: boolean,
      status: 'available' | 'busy' | 'away' | 'offline'
    ): Promise<void> => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/availability/professional`,
          {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              isOnline,
              status,
            }),
          }
        );

        if (!response.ok) {
          throw new Error('Failed to update professional availability');
        }

        // Refresh professional availability
        await getProfessionalAvailability();
      } catch (error) {
        console.error('Error updating professional availability:', error);
        throw error;
      }
    },
    [getProfessionalAvailability]
  );

  // Set 24/7 availability for a specialty
  const setSpecialty24hAvailability = useCallback(
    async (specialty: Specialty, enabled: boolean): Promise<void> => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/availability/specialty/${specialty}/24h`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              enabled,
            }),
          }
        );

        if (!response.ok) {
          throw new Error('Failed to set 24/7 availability');
        }

        // Refresh availabilities
        await getAllSpecialtiesAvailability();
      } catch (error) {
        console.error('Error setting 24/7 availability:', error);
        throw error;
      }
    },
    [getAllSpecialtiesAvailability]
  );

  // Get next available time for a specialty
  const getNextAvailableTime = useCallback(
    async (
      specialty: Specialty
    ): Promise<{
      nextAvailableTime: string | null;
      isAvailableNow: boolean;
    }> => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/availability/specialty/${specialty}/next-available`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to get next available time');
        }

        const data = await response.json();
        return data.data;
      } catch (error) {
        console.error('Error getting next available time:', error);
        throw error;
      }
    },
    []
  );

  // Format next available time
  const formatNextAvailableTime = useCallback(
    (nextAvailableTime: string | undefined): string => {
      if (!nextAvailableTime) {
        return 'Disponível agora';
      }

      const date = new Date(nextAvailableTime);
      const now = new Date();
      const diffMs = date.getTime() - now.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

      if (diffHours > 24) {
        return date.toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        });
      }

      if (diffHours > 0) {
        return `Em ${diffHours}h ${diffMinutes}min`;
      }

      if (diffMinutes > 0) {
        return `Em ${diffMinutes}min`;
      }

      return 'Disponível agora';
    },
    []
  );

  // Get availability status info
  const getAvailabilityStatusInfo = useCallback(
    (
      availability: SystemAvailability
    ): {
      status: 'available' | 'busy' | 'offline' | 'emergency';
      label: string;
      color: string;
      icon: string;
    } => {
      if (availability.emergencyMode) {
        return {
          status: 'emergency',
          label: 'Modo Emergência',
          color: 'bg-orange-500',
          icon: '🚨',
        };
      }

      if (!availability.isAvailable) {
        return {
          status: 'offline',
          label: 'Indisponível',
          color: 'bg-gray-500',
          icon: '⏸️',
        };
      }

      if (availability.onlineProfessionals === 0) {
        return {
          status: 'offline',
          label: 'Sem Profissionais',
          color: 'bg-red-500',
          icon: '❌',
        };
      }

      if (availability.estimatedWaitTime <= 5) {
        return {
          status: 'available',
          label: 'Disponível',
          color: 'bg-green-500',
          icon: '✅',
        };
      }

      if (availability.estimatedWaitTime <= 30) {
        return {
          status: 'busy',
          label: 'Ocupado',
          color: 'bg-yellow-500',
          icon: '⏳',
        };
      }

      return {
        status: 'busy',
        label: 'Fila Longa',
        color: 'bg-red-500',
        icon: '⏰',
      };
    },
    []
  );

  // Get professional status info
  const getProfessionalStatusInfo = useCallback(
    (
      status: string
    ): {
      label: string;
      color: string;
      icon: string;
    } => {
      switch (status) {
        case 'available':
          return {
            label: 'Disponível',
            color: 'bg-green-500',
            icon: '✅',
          };
        case 'busy':
          return {
            label: 'Ocupado',
            color: 'bg-yellow-500',
            icon: '🔄',
          };
        case 'away':
          return {
            label: 'Ausente',
            color: 'bg-orange-500',
            icon: '⏸️',
          };
        case 'offline':
        default:
          return {
            label: 'Offline',
            color: 'bg-gray-500',
            icon: '❌',
          };
      }
    },
    []
  );

  // Auto-refresh availabilities
  const startAutoRefresh = useCallback(
    (intervalMs: number = 60000) => {
      const interval = setInterval(() => {
        getAllSpecialtiesAvailability();
      }, intervalMs);

      return () => clearInterval(interval);
    },
    [getAllSpecialtiesAvailability]
  );

  return {
    availabilities,
    professionalAvailability,
    loading,
    checkSpecialtyAvailability,
    getAllSpecialtiesAvailability,
    getProfessionalAvailability,
    updateProfessionalAvailability,
    setSpecialty24hAvailability,
    getNextAvailableTime,
    formatNextAvailableTime,
    getAvailabilityStatusInfo,
    getProfessionalStatusInfo,
    startAutoRefresh,
  };
};
