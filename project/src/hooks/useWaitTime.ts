import { useState, useEffect, useCallback } from 'react';
import { Specialty } from '@/shared/types';

interface WaitTimeData {
  specialty: Specialty;
  estimatedWaitTime: number;
  queueLength: number;
  onlineProfessionals: number;
  averageConsultationDuration: number;
  lastCalculated: string;
  confidence: 'high' | 'medium' | 'low';
}

interface ConsultationWaitTime {
  position: number;
  estimatedWaitTime: number;
  specialty: Specialty;
}

interface QueueStatistics {
  specialty: Specialty;
  queueLength: number;
  inProgress: number;
  completedToday: number;
  onlineProfessionals: number;
  lastUpdated: string;
}

interface HistoricalData {
  averageWaitTime: number;
  averageDuration: number;
  consultationCount: number;
  peakHours: number[];
  offPeakHours: number[];
}

export const useWaitTime = () => {
  const [waitTimes, setWaitTimes] = useState<WaitTimeData[]>([]);
  const [loading, setLoading] = useState(false);

  // Get wait time for a single specialty
  const getSpecialtyWaitTime = useCallback(async (specialty: Specialty): Promise<WaitTimeData> => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/wait-time/specialty/${specialty}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch wait time');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching specialty wait time:', error);
      throw error;
    }
  }, []);

  // Get wait times for multiple specialties
  const getSpecialtiesWaitTimes = useCallback(async (specialties: Specialty[]): Promise<WaitTimeData[]> => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const specialtiesParam = specialties.join(',');
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/wait-time/specialties?specialties=${specialtiesParam}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch wait times');
      }

      const data = await response.json();
      const waitTimesData = data.data || [];
      
      setWaitTimes(waitTimesData);
      return waitTimesData;
    } catch (error) {
      console.error('Error fetching specialties wait times:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get wait time for a specific consultation
  const getConsultationWaitTime = useCallback(async (consultationId: string): Promise<ConsultationWaitTime> => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/wait-time/consultation/${consultationId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch consultation wait time');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching consultation wait time:', error);
      throw error;
    }
  }, []);

  // Get queue statistics for a specialty
  const getQueueStatistics = useCallback(async (specialty: Specialty): Promise<QueueStatistics> => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/wait-time/statistics/${specialty}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch queue statistics');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching queue statistics:', error);
      throw error;
    }
  }, []);

  // Get historical data for analytics
  const getHistoricalData = useCallback(async (specialty: Specialty, days: number = 7): Promise<HistoricalData> => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/wait-time/historical/${specialty}?days=${days}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch historical data');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching historical data:', error);
      throw error;
    }
  }, []);

  // Format wait time for display
  const formatWaitTime = useCallback((minutes: number): string => {
    if (minutes === 0) return 'Imediato';
    if (minutes < 60) return `${minutes}min`;
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (remainingMinutes === 0) {
      return `${hours}h`;
    }
    
    return `${hours}h ${remainingMinutes}min`;
  }, []);

  // Get confidence color for display
  const getConfidenceColor = useCallback((confidence: 'high' | 'medium' | 'low'): string => {
    switch (confidence) {
      case 'high':
        return 'text-green-600 bg-green-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'low':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  }, []);

  // Get confidence label
  const getConfidenceLabel = useCallback((confidence: 'high' | 'medium' | 'low'): string => {
    switch (confidence) {
      case 'high':
        return 'Alta Precisão';
      case 'medium':
        return 'Média Precisão';
      case 'low':
        return 'Baixa Precisão';
      default:
        return 'Desconhecido';
    }
  }, []);

  // Get wait time status based on queue length and professionals
  const getWaitTimeStatus = useCallback((queueLength: number, onlineProfessionals: number): {
    status: 'available' | 'short' | 'medium' | 'long' | 'offline';
    label: string;
    color: string;
  } => {
    if (onlineProfessionals === 0) {
      return {
        status: 'offline',
        label: 'Indisponível',
        color: 'bg-gray-500',
      };
    }
    
    if (queueLength === 0) {
      return {
        status: 'available',
        label: 'Disponível',
        color: 'bg-green-500',
      };
    }
    
    const ratio = queueLength / onlineProfessionals;
    
    if (ratio <= 1) {
      return {
        status: 'short',
        label: 'Fila Pequena',
        color: 'bg-green-400',
      };
    }
    
    if (ratio <= 2) {
      return {
        status: 'medium',
        label: 'Fila Média',
        color: 'bg-yellow-500',
      };
    }
    
    return {
      status: 'long',
      label: 'Fila Longa',
      color: 'bg-red-500',
    };
  }, []);

  // Auto-refresh wait times
  const startAutoRefresh = useCallback((specialties: Specialty[], intervalMs: number = 30000) => {
    const interval = setInterval(() => {
      getSpecialtiesWaitTimes(specialties);
    }, intervalMs);

    return () => clearInterval(interval);
  }, [getSpecialtiesWaitTimes]);

  return {
    waitTimes,
    loading,
    getSpecialtyWaitTime,
    getSpecialtiesWaitTimes,
    getConsultationWaitTime,
    getQueueStatistics,
    getHistoricalData,
    formatWaitTime,
    getConfidenceColor,
    getConfidenceLabel,
    getWaitTimeStatus,
    startAutoRefresh,
  };
};
