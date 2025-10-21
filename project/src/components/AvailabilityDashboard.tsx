import React, { useState, useEffect } from 'react';
import { useAvailability } from '../hooks/useAvailability';
import { useAuthStore } from '../stores/auth';
import { Specialty } from '@/shared/types';
import {
  Clock,
  Users,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Settings,
  Power,
  Moon,
  Sun,
  RefreshCw,
} from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { StatusBadge } from './ui/StatusBadge';

interface AvailabilityDashboardProps {
  show24hControls?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export const AvailabilityDashboard: React.FC<AvailabilityDashboardProps> = ({
  show24hControls = true,
  autoRefresh = true,
  refreshInterval = 60000,
}) => {
  const { user } = useAuthStore();
  const {
    availabilities,
    professionalAvailability,
    loading,
    getAllSpecialtiesAvailability,
    getProfessionalAvailability,
    updateProfessionalAvailability,
    setSpecialty24hAvailability,
    formatNextAvailableTime,
    getAvailabilityStatusInfo,
    getProfessionalStatusInfo,
    startAutoRefresh,
  } = useAvailability();

  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [show24hSettings, setShow24hSettings] = useState(false);

  // Load data on mount
  useEffect(() => {
    loadAvailabilityData();
  }, []);

  // Auto-refresh
  useEffect(() => {
    if (autoRefresh) {
      const stopAutoRefresh = startAutoRefresh(refreshInterval);
      return stopAutoRefresh;
    }
  }, [autoRefresh, startAutoRefresh, refreshInterval]);

  const loadAvailabilityData = async () => {
    try {
      await Promise.all([
        getAllSpecialtiesAvailability(),
        getProfessionalAvailability(),
      ]);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error loading availability data:', error);
    }
  };

  const handleStatusChange = async (
    status: 'available' | 'busy' | 'away' | 'offline'
  ) => {
    try {
      const isOnline = status !== 'offline';
      await updateProfessionalAvailability(isOnline, status);
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handle24hToggle = async (specialty: Specialty, enabled: boolean) => {
    try {
      await setSpecialty24hAvailability(specialty, enabled);
    } catch (error) {
      console.error('Error toggling 24h availability:', error);
    }
  };

  const getSpecialtyIcon = (specialty: Specialty) => {
    const icons = {
      [Specialty.PSICOLOGO]: '🧠',
      [Specialty.DENTISTA]: '🦷',
      [Specialty.MEDICO_CLINICO]: '🩺',
    };
    return icons[specialty] || '🏥';
  };

  const getSpecialtyName = (specialty: Specialty) => {
    const names = {
      [Specialty.PSICOLOGO]: 'Psicólogo',
      [Specialty.DENTISTA]: 'Dentista',
      [Specialty.MEDICO_CLINICO]: 'Médico Clínico',
    };
    return names[specialty] || specialty;
  };

  const getCurrentTime = () => {
    return new Date().toLocaleString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getWorkingHoursStatus = () => {
    const hour = new Date().getHours();
    const isWorkingHours = hour >= 8 && hour < 18;
    const isWeekend = [0, 6].includes(new Date().getDay());

    if (isWeekend) {
      return {
        status: 'weekend',
        label: 'Fim de Semana',
        color: 'bg-blue-500',
      };
    }

    if (isWorkingHours) {
      return {
        status: 'working',
        label: 'Horário Comercial',
        color: 'bg-green-500',
      };
    }

    return {
      status: 'after-hours',
      label: 'Fora do Horário',
      color: 'bg-orange-500',
    };
  };

  if (loading && availabilities.length === 0) {
    return (
      <Card className='p-6'>
        <div className='animate-pulse'>
          <div className='h-6 bg-gray-300 rounded w-1/3 mb-4'></div>
          <div className='space-y-3'>
            {[1, 2, 3].map(i => (
              <div key={i} className='h-20 bg-gray-300 rounded'></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <Card className='p-6'>
        <div className='flex items-center justify-between mb-4'>
          <div className='flex items-center gap-3'>
            <Clock className='w-6 h-6 text-blue-600' />
            <div>
              <h2 className='text-xl font-bold text-gray-900'>
                Disponibilidade 24h
              </h2>
              <p className='text-sm text-gray-500'>{getCurrentTime()}</p>
            </div>
          </div>

          <div className='flex items-center gap-3'>
            <StatusBadge className={getWorkingHoursStatus().color}>
              {getWorkingHoursStatus().label}
            </StatusBadge>

            <Button
              onClick={loadAvailabilityData}
              variant='ghost'
              size='sm'
              loading={loading}
            >
              <RefreshCw className='w-4 h-4' />
            </Button>

            {show24hControls && user?.role !== 'paciente' && (
              <Button
                onClick={() => setShow24hSettings(!show24hSettings)}
                variant='outline'
                size='sm'
              >
                <Settings className='w-4 h-4 mr-2' />
                Configurar 24h
              </Button>
            )}
          </div>
        </div>

        <div className='text-xs text-gray-500'>
          Última atualização: {lastUpdated.toLocaleTimeString('pt-BR')}
        </div>
      </Card>

      {/* Professional Status Controls */}
      {professionalAvailability && (
        <Card className='p-6'>
          <h3 className='text-lg font-semibold mb-4 flex items-center gap-2'>
            <Users className='w-5 h-5' />
            Seu Status Profissional
          </h3>

          <div className='flex items-center justify-between mb-4'>
            <div className='flex items-center gap-3'>
              <span className='text-2xl'>
                {getSpecialtyIcon(professionalAvailability.specialty)}
              </span>
              <div>
                <p className='font-medium'>
                  {getSpecialtyName(professionalAvailability.specialty)}
                </p>
                <p className='text-sm text-gray-500'>
                  Última atividade:{' '}
                  {new Date(
                    professionalAvailability.lastActivity
                  ).toLocaleString('pt-BR')}
                </p>
              </div>
            </div>

            <StatusBadge
              className={
                getProfessionalStatusInfo(
                  professionalAvailability.currentStatus
                ).color
              }
            >
              {
                getProfessionalStatusInfo(
                  professionalAvailability.currentStatus
                ).label
              }
            </StatusBadge>
          </div>

          <div className='flex gap-2'>
            <Button
              onClick={() => handleStatusChange('available')}
              variant={
                professionalAvailability.currentStatus === 'available'
                  ? 'default'
                  : 'outline'
              }
              size='sm'
              className='bg-green-600 hover:bg-green-700'
            >
              <CheckCircle className='w-4 h-4 mr-2' />
              Disponível
            </Button>

            <Button
              onClick={() => handleStatusChange('busy')}
              variant={
                professionalAvailability.currentStatus === 'busy'
                  ? 'default'
                  : 'outline'
              }
              size='sm'
              className='bg-yellow-600 hover:bg-yellow-700'
            >
              <Users className='w-4 h-4 mr-2' />
              Ocupado
            </Button>

            <Button
              onClick={() => handleStatusChange('away')}
              variant={
                professionalAvailability.currentStatus === 'away'
                  ? 'default'
                  : 'outline'
              }
              size='sm'
              className='bg-orange-600 hover:bg-orange-700'
            >
              <Moon className='w-4 h-4 mr-2' />
              Ausente
            </Button>

            <Button
              onClick={() => handleStatusChange('offline')}
              variant={
                professionalAvailability.currentStatus === 'offline'
                  ? 'default'
                  : 'outline'
              }
              size='sm'
              className='bg-gray-600 hover:bg-gray-700'
            >
              <XCircle className='w-4 h-4 mr-2' />
              Offline
            </Button>
          </div>
        </Card>
      )}

      {/* 24h Settings */}
      {show24hSettings && (
        <Card className='p-6'>
          <h3 className='text-lg font-semibold mb-4 flex items-center gap-2'>
            <Power className='w-5 h-5' />
            Configurações 24h
          </h3>

          <div className='space-y-4'>
            <p className='text-sm text-gray-600'>
              Configure quais especialidades ficam disponíveis 24 horas por dia,
              7 dias por semana.
            </p>

            {availabilities.map(availability => (
              <div
                key={availability.specialty}
                className='flex items-center justify-between p-3 border border-gray-200 rounded-lg'
              >
                <div className='flex items-center gap-3'>
                  <span className='text-xl'>
                    {getSpecialtyIcon(availability.specialty)}
                  </span>
                  <div>
                    <p className='font-medium'>
                      {getSpecialtyName(availability.specialty)}
                    </p>
                    <p className='text-sm text-gray-500'>
                      {availability.onlineProfessionals} profissionais online
                    </p>
                  </div>
                </div>

                <Button
                  onClick={() =>
                    handle24hToggle(
                      availability.specialty,
                      !availability.emergencyMode
                    )
                  }
                  variant={availability.emergencyMode ? 'default' : 'outline'}
                  size='sm'
                  className={
                    availability.emergencyMode
                      ? 'bg-orange-600 hover:bg-orange-700'
                      : ''
                  }
                >
                  <Sun className='w-4 h-4 mr-2' />
                  24h
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Specialties Availability */}
      <Card className='p-6'>
        <h3 className='text-lg font-semibold mb-4 flex items-center gap-2'>
          <AlertTriangle className='w-5 h-5' />
          Status das Especialidades
        </h3>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          {availabilities.map(availability => {
            const statusInfo = getAvailabilityStatusInfo(availability);

            return (
              <div
                key={availability.specialty}
                className='p-4 border border-gray-200 rounded-lg'
              >
                <div className='flex items-center justify-between mb-3'>
                  <div className='flex items-center gap-2'>
                    <span className='text-2xl'>
                      {getSpecialtyIcon(availability.specialty)}
                    </span>
                    <div>
                      <h4 className='font-medium text-gray-900'>
                        {getSpecialtyName(availability.specialty)}
                      </h4>
                      <p className='text-sm text-gray-500'>
                        {availability.onlineProfessionals} profissionais
                      </p>
                    </div>
                  </div>

                  <StatusBadge className={statusInfo.color}>
                    {statusInfo.icon} {statusInfo.label}
                  </StatusBadge>
                </div>

                <div className='space-y-2'>
                  <div className='flex justify-between items-center text-sm'>
                    <span className='text-gray-600'>Tempo de Espera:</span>
                    <span className='font-medium'>
                      {availability.estimatedWaitTime === 999
                        ? 'N/A'
                        : `${availability.estimatedWaitTime}min`}
                    </span>
                  </div>

                  <div className='flex justify-between items-center text-sm'>
                    <span className='text-gray-600'>
                      Próxima Disponibilidade:
                    </span>
                    <span className='font-medium'>
                      {formatNextAvailableTime(availability.nextAvailableTime)}
                    </span>
                  </div>

                  {availability.emergencyMode && (
                    <div className='mt-2 p-2 bg-orange-100 rounded text-xs text-orange-800'>
                      🚨 Modo Emergência Ativo - Atendimento 24h
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* System Status */}
      <Card className='p-6 bg-blue-50 border-blue-200'>
        <div className='flex items-start gap-3'>
          <AlertTriangle className='w-5 h-5 text-blue-600 mt-0.5' />
          <div className='text-sm text-blue-800'>
            <p className='font-medium mb-1'>Sistema de Disponibilidade 24h</p>
            <p>
              O sistema monitora automaticamente a disponibilidade dos
              profissionais e ajusta os tempos de espera em tempo real. Durante
              o modo emergência (24h), as especialidades ficam disponíveis mesmo
              fora do horário comercial.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
