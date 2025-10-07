import React, { useState, useEffect } from 'react';
import { Clock, Users, Activity, RefreshCw } from 'lucide-react';
import { SpecialtyCard } from './SpecialtyCard';
import { Card } from './ui/Card';
import apiClient from '@/lib/api';

interface Specialty {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  features: string[];
  queueLength: number;
  inProgress: number;
  onlineProfessionals: number;
  estimatedWaitTime: number;
}

interface SpecialtiesDashboardProps {
  onSelectSpecialty: (specialtyId: string) => void;
}

export const SpecialtiesDashboard: React.FC<SpecialtiesDashboardProps> = ({ onSelectSpecialty }) => {
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Especialidades disponíveis no sistema
  const defaultSpecialties: Specialty[] = [
    {
      id: 'psicologo',
      name: 'Psicólogo',
      description: 'Atendimento psicológico com opções de consulta urgente ou agendada',
      icon: 'brain',
      color: '#8B5CF6',
      features: [
        'Consulta urgente disponível',
        'Consulta agendada',
        'Acompanhamento psicológico',
        'Suporte em crises',
      ],
      queueLength: 0,
      inProgress: 0,
      onlineProfessionals: 0,
      estimatedWaitTime: 0,
    },
    {
      id: 'dentista',
      name: 'Dentista',
      description: 'Atendimento odontológico completo',
      icon: 'tooth',
      color: '#06B6D4',
      features: [
        'Consultas odontológicas',
        'Emergências dentárias',
        'Prevenção e higiene',
        'Tratamentos especializados',
      ],
      queueLength: 0,
      inProgress: 0,
      onlineProfessionals: 0,
      estimatedWaitTime: 0,
    },
    {
      id: 'medico-clinico',
      name: 'Médico Clínico',
      description: 'Atendimento médico geral',
      icon: 'stethoscope',
      color: '#10B981',
      features: [
        'Consultas médicas gerais',
        'Diagnósticos',
        'Prescrições',
        'Encaminhamentos',
      ],
      queueLength: 0,
      inProgress: 0,
      onlineProfessionals: 0,
      estimatedWaitTime: 0,
    },
  ];

  const fetchSpecialties = async () => {
    try {
      setLoading(true);
      
      // Usar dados mockados por enquanto
      const mockSpecialties: Specialty[] = [
        {
          id: 'dentista',
          name: 'Dentista',
          description: 'Atendimento odontológico completo',
          icon: 'smile',
          color: '#06B6D4',
          features: ['Emergência dentária', 'Consulta odontológica', 'Prevenção'],
          queueLength: 0,
          inProgress: 0,
          onlineProfessionals: 2,
          estimatedWaitTime: 0,
        },
        {
          id: 'psicologo',
          name: 'Psicólogo',
          description: 'Atendimento psicológico com opções de consulta urgente ou agendada',
          icon: 'brain',
          color: '#8B5CF6',
          features: ['Consulta urgente', 'Consulta agendada', 'Acompanhamento'],
          queueLength: 0,
          inProgress: 0,
          onlineProfessionals: 2,
          estimatedWaitTime: 0,
        },
        {
          id: 'medico-clinico',
          name: 'Médico Clínico',
          description: 'Atendimento médico geral',
          icon: 'stethoscope',
          color: '#10B981',
          features: ['Consulta médica', 'Diagnóstico', 'Prescrição'],
          queueLength: 0,
          inProgress: 0,
          onlineProfessionals: 2,
          estimatedWaitTime: 0,
        },
      ];
      
      setSpecialties(mockSpecialties);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Erro ao carregar especialidades:', error);
      setSpecialties([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSpecialties();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchSpecialties, 30000);
    return () => clearInterval(interval);
  }, []);

  const getOverallStats = () => {
    const totalQueue = specialties.reduce((sum, s) => sum + s.queueLength, 0);
    const totalOnline = specialties.reduce((sum, s) => sum + s.onlineProfessionals, 0);
    const totalInProgress = specialties.reduce((sum, s) => sum + s.inProgress, 0);
    
    return { totalQueue, totalOnline, totalInProgress };
  };

  const stats = getOverallStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/3 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-96 bg-gray-300 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Escolha sua Especialidade
              </h1>
              <p className="text-gray-600">
                Selecione a especialidade médica para iniciar seu atendimento
              </p>
            </div>
            
            <button
              onClick={fetchSpecialties}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </button>
          </div>

          {/* Overall Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Clock className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {stats.totalQueue}
                  </div>
                  <div className="text-sm text-gray-500">
                    Na Fila
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Users className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {stats.totalOnline}
                  </div>
                  <div className="text-sm text-gray-500">
                    Profissionais Online
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Activity className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {stats.totalInProgress}
                  </div>
                  <div className="text-sm text-gray-500">
                    Em Atendimento
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Last Updated */}
          <div className="text-sm text-gray-500">
            Última atualização: {lastUpdated.toLocaleTimeString('pt-BR')}
          </div>
        </div>

        {/* Specialties Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {specialties.map((specialty) => (
            <SpecialtyCard
              key={specialty.id}
              specialty={specialty}
              onSelect={onSelectSpecialty}
            />
          ))}
        </div>

        {/* Footer Info */}
        <div className="mt-12 text-center">
          <Card className="p-6 bg-blue-50 border-blue-200">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              Atendimento 24h
            </h3>
            <p className="text-blue-700">
              Nossa plataforma está disponível 24 horas por dia, 7 dias por semana. 
              Profissionais estão sempre disponíveis para atendê-lo.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};