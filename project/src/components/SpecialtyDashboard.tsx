import React, { useState, useEffect } from 'react';
import { useSpecialtyAccess } from '../hooks/useSpecialtyAccess';
import { useAuthStore } from '../stores/auth';
import { Specialty } from '@/shared/types';
import {
  Brain,
  Smile,
  Stethoscope,
  Users,
  Clock,
  Activity,
  AlertCircle,
} from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { StatusBadge } from './ui/StatusBadge';
import { SpecialtyGuard } from './SpecialtyGuard';

interface SpecialtyStats {
  queueLength: number;
  inProgress: number;
  onlineProfessionals: number;
  estimatedWaitTime: number;
  averageDuration: number;
  completedToday: number;
}

interface SpecialtyDashboardProps {
  specialty: Specialty;
}

const specialtyInfo = {
  [Specialty.PSICOLOGO]: {
    name: 'Psicólogo',
    icon: Brain,
    color: '#8B5CF6',
    description: 'Atendimento psicológico',
    features: ['Consulta urgente', 'Consulta agendada', 'Acompanhamento'],
  },
  [Specialty.DENTISTA]: {
    name: 'Dentista',
    icon: Smile,
    color: '#06B6D4',
    description: 'Atendimento odontológico',
    features: ['Emergência dentária', 'Consulta odontológica', 'Prevenção'],
  },
  [Specialty.MEDICO_CLINICO]: {
    name: 'Médico Clínico',
    icon: Stethoscope,
    color: '#10B981',
    description: 'Atendimento médico geral',
    features: ['Consulta médica', 'Diagnóstico', 'Prescrição'],
  },
};

export const SpecialtyDashboard: React.FC<SpecialtyDashboardProps> = ({
  specialty,
}) => {
  const { user } = useAuthStore();
  // @ts-ignore
  const { getSpecialtyDisplayName, canAccessSpecialty } =
    useSpecialtyAccess(user);
  const [stats, setStats] = useState<SpecialtyStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Mock data for development
  const mockStats: SpecialtyStats = {
    queueLength: 3,
    inProgress: 2,
    onlineProfessionals: 4,
    estimatedWaitTime: 15,
    averageDuration: 30,
    completedToday: 12,
  };

  useEffect(() => {
    loadSpecialtyStats();
  }, [specialty]);

  const loadSpecialtyStats = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/v1/specialties/${specialty}/stats`);
      // const data = await response.json();

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setStats(mockStats);
    } catch (error) {
      console.error('Error loading specialty stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const info = specialtyInfo[specialty];
  const IconComponent = info.icon;

  const getStatusInfo = (queueLength: number, onlineProfessionals: number) => {
    if (onlineProfessionals === 0) {
      return {
        status: 'offline',
        label: 'Offline',
        color: 'bg-gray-500',
        icon: AlertCircle,
      };
    }

    if (queueLength === 0) {
      return {
        status: 'available',
        label: 'Disponível',
        color: 'bg-green-500',
        icon: Users,
      };
    }

    if (queueLength <= 2) {
      return {
        status: 'short',
        label: 'Fila Pequena',
        color: 'bg-green-400',
        icon: Clock,
      };
    }

    if (queueLength <= 5) {
      return {
        status: 'medium',
        label: 'Fila Média',
        color: 'bg-yellow-500',
        icon: Clock,
      };
    }

    return {
      status: 'long',
      label: 'Fila Longa',
      color: 'bg-red-500',
      icon: Clock,
    };
  };

  const formatWaitTime = (minutes: number) => {
    if (minutes === 0) return 'Imediato';
    if (minutes < 60) return `${minutes}min`;

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (remainingMinutes === 0) {
      return `${hours}h`;
    }

    return `${hours}h ${remainingMinutes}min`;
  };

  if (loading) {
    return (
      <Card className='p-6'>
        <div className='animate-pulse'>
          <div className='h-8 bg-gray-300 rounded w-1/3 mb-4'></div>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
            {[1, 2, 3, 4].map(i => (
              <div key={i} className='h-20 bg-gray-300 rounded'></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card className='p-6 text-center'>
        <AlertCircle className='w-12 h-12 mx-auto mb-4 text-gray-400' />
        <p className='text-gray-500'>Erro ao carregar estatísticas</p>
      </Card>
    );
  }

  const statusInfo = getStatusInfo(
    stats.queueLength,
    stats.onlineProfessionals
  );
  const StatusIcon = statusInfo.icon;

  return (
    <SpecialtyGuard specialty={specialty}>
      <div className='space-y-6'>
        {/* Header */}
        <Card className='p-6'>
          <div className='flex items-center justify-between mb-4'>
            <div className='flex items-center gap-4'>
              <div
                className='p-3 rounded-xl'
                style={{ backgroundColor: `${info.color}20` }}
              >
                <IconComponent
                  className='w-8 h-8'
                  style={{ color: info.color }}
                />
              </div>
              <div>
                <h1 className='text-2xl font-bold text-gray-900'>
                  Dashboard - {info.name}
                </h1>
                <p className='text-gray-600'>{info.description}</p>
              </div>
            </div>

            <StatusBadge
              status={statusInfo.status as any}
              className={`${statusInfo.color} text-white`}
            >
              <StatusIcon className='w-3 h-3 mr-1' />
              {statusInfo.label}
            </StatusBadge>
          </div>

          {/* Quick Stats */}
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
            <div className='text-center'>
              <div className='text-2xl font-bold text-gray-900'>
                {stats.queueLength}
              </div>
              <div className='text-sm text-gray-500'>Na Fila</div>
            </div>

            <div className='text-center'>
              <div className='text-2xl font-bold text-gray-900'>
                {stats.inProgress}
              </div>
              <div className='text-sm text-gray-500'>Em Atendimento</div>
            </div>

            <div className='text-center'>
              <div className='text-2xl font-bold text-gray-900'>
                {stats.onlineProfessionals}
              </div>
              <div className='text-sm text-gray-500'>Online</div>
            </div>

            <div className='text-center'>
              <div className='text-2xl font-bold' style={{ color: info.color }}>
                {formatWaitTime(stats.estimatedWaitTime)}
              </div>
              <div className='text-sm text-gray-500'>Tempo de Espera</div>
            </div>
          </div>
        </Card>

        {/* Detailed Stats */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <Card className='p-6'>
            <h3 className='text-lg font-semibold mb-4 flex items-center gap-2'>
              <Activity className='w-5 h-5' />
              Performance
            </h3>

            <div className='space-y-4'>
              <div className='flex justify-between items-center'>
                <span className='text-gray-600'>Consultas Hoje:</span>
                <span className='font-semibold'>{stats.completedToday}</span>
              </div>

              <div className='flex justify-between items-center'>
                <span className='text-gray-600'>Duração Média:</span>
                <span className='font-semibold'>
                  {stats.averageDuration}min
                </span>
              </div>

              <div className='flex justify-between items-center'>
                <span className='text-gray-600'>Profissionais Ativos:</span>
                <span className='font-semibold'>
                  {stats.onlineProfessionals}
                </span>
              </div>

              <div className='flex justify-between items-center'>
                <span className='text-gray-600'>Taxa de Ocupação:</span>
                <span className='font-semibold'>
                  {Math.round(
                    (stats.inProgress / stats.onlineProfessionals) * 100
                  )}
                  %
                </span>
              </div>
            </div>
          </Card>

          <Card className='p-6'>
            <h3 className='text-lg font-semibold mb-4 flex items-center gap-2'>
              <Users className='w-5 h-5' />
              Status da Fila
            </h3>

            <div className='space-y-4'>
              <div>
                <div className='flex justify-between items-center mb-2'>
                  <span className='text-gray-600'>Posições na Fila:</span>
                  <span className='font-semibold'>{stats.queueLength}</span>
                </div>
                <div className='w-full bg-gray-200 rounded-full h-2'>
                  <div
                    className='h-2 rounded-full transition-all duration-300'
                    style={{
                      backgroundColor: info.color,
                      width: `${Math.min((stats.queueLength / 10) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>

              <div className='flex justify-between items-center'>
                <span className='text-gray-600'>Tempo Estimado:</span>
                <span className='font-semibold' style={{ color: info.color }}>
                  {formatWaitTime(stats.estimatedWaitTime)}
                </span>
              </div>

              <div className='flex justify-between items-center'>
                <span className='text-gray-600'>Consultas Ativas:</span>
                <span className='font-semibold'>{stats.inProgress}</span>
              </div>

              <div className='flex justify-between items-center'>
                <span className='text-gray-600'>Disponibilidade:</span>
                <StatusBadge
                  className={
                    stats.onlineProfessionals > 0
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }
                >
                  {stats.onlineProfessionals > 0
                    ? 'Disponível'
                    : 'Indisponível'}
                </StatusBadge>
              </div>
            </div>
          </Card>
        </div>

        {/* Actions */}
        <Card className='p-6'>
          <h3 className='text-lg font-semibold mb-4'>Ações Rápidas</h3>

          <div className='flex flex-wrap gap-3'>
            <Button
              style={{ backgroundColor: info.color }}
              className='text-white'
            >
              Ver Fila de Atendimento
            </Button>

            <Button variant='outline'>Consultas Ativas</Button>

            <Button variant='outline'>Relatórios</Button>

            <Button variant='outline'>Configurações</Button>
          </div>
        </Card>
      </div>
    </SpecialtyGuard>
  );
};
