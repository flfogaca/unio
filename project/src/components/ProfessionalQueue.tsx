import React, { useState, useEffect } from 'react';
import {
  Users,
  Clock,
  Play,
  CheckCircle,
  RefreshCw,
  Video,
  User,
  Calendar,
} from 'lucide-react';
import { useQueue } from '../hooks/useQueue';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { StatusBadge } from './ui/StatusBadge';

interface ProfessionalQueueProps {
  specialty: string;
  userRole: string;
}

const specialtyNames = {
  psicologo: 'Psicólogo',
  dentista: 'Dentista',
  medico_clinico: 'Médico Clínico',
};

const priorityColors = {
  baixa: 'bg-green-100 text-green-800',
  media: 'bg-yellow-100 text-yellow-800',
  alta: 'bg-orange-100 text-orange-800',
  urgente: 'bg-red-100 text-red-800',
};

export const ProfessionalQueue: React.FC<ProfessionalQueueProps> = ({
  specialty,
}) => {
  const {
    state,
    joinSpecialtyQueue,
    leaveSpecialtyQueue,
    assumeConsultation,
    finishConsultation,
    refreshQueue,
  } = useQueue();

  const [selectedConsultation, setSelectedConsultation] = useState<any>(null);
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [finishNotes, setFinishNotes] = useState('');

  // Join specialty queue on mount
  useEffect(() => {
    joinSpecialtyQueue(specialty);

    return () => {
      leaveSpecialtyQueue();
    };
  }, [specialty]);

  // Auto-refresh queue every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refreshQueue();
    }, 30000);

    return () => clearInterval(interval);
  }, [refreshQueue]);

  const handleAssumeConsultation = (consultation: any) => {
    assumeConsultation(consultation.id);
  };

  const handleFinishConsultation = (consultation: any) => {
    setSelectedConsultation(consultation);
    setShowFinishModal(true);
  };

  const confirmFinishConsultation = () => {
    if (selectedConsultation) {
      finishConsultation(selectedConsultation.id, finishNotes);
      setShowFinishModal(false);
      setFinishNotes('');
      setSelectedConsultation(null);
    }
  };

  const getEstimatedWaitTime = (position: number) => {
    return position * 10; // 10 minutes per position
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getPriorityLabel = (priority: string) => {
    const labels = {
      baixa: 'Baixa',
      media: 'Média',
      alta: 'Alta',
      urgente: 'Urgente',
    };
    return labels[priority as keyof typeof labels] || priority;
  };

  return (
    <div className='p-6 bg-gray-50 min-h-screen'>
      <div className='max-w-7xl mx-auto'>
        {/* Header */}
        <div className='mb-6'>
          <div className='flex items-center justify-between mb-4'>
            <div>
              <h1 className='text-2xl font-bold text-gray-900 mb-2'>
                Fila de Atendimento -{' '}
                {specialtyNames[specialty as keyof typeof specialtyNames]}
              </h1>
              <p className='text-gray-600'>
                Gerencie consultas e assuma atendimentos em tempo real
              </p>
            </div>

            <Button
              onClick={refreshQueue}
              className='flex items-center gap-2'
              disabled={!state.isConnected}
            >
              <RefreshCw className='w-4 h-4' />
              Atualizar
            </Button>
          </div>

          {/* Stats Cards */}
          <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-6'>
            <Card className='p-4'>
              <div className='flex items-center gap-3'>
                <div className='p-2 bg-blue-100 rounded-lg'>
                  <Users className='w-5 h-5 text-blue-600' />
                </div>
                <div>
                  <div className='text-2xl font-bold text-gray-900'>
                    {state.queueLength}
                  </div>
                  <div className='text-sm text-gray-500'>Na Fila</div>
                </div>
              </div>
            </Card>

            <Card className='p-4'>
              <div className='flex items-center gap-3'>
                <div className='p-2 bg-green-100 rounded-lg'>
                  <Play className='w-5 h-5 text-green-600' />
                </div>
                <div>
                  <div className='text-2xl font-bold text-gray-900'>
                    {state.inProgress}
                  </div>
                  <div className='text-sm text-gray-500'>Em Atendimento</div>
                </div>
              </div>
            </Card>

            <Card className='p-4'>
              <div className='flex items-center gap-3'>
                <div className='p-2 bg-purple-100 rounded-lg'>
                  <User className='w-5 h-5 text-purple-600' />
                </div>
                <div>
                  <div className='text-2xl font-bold text-gray-900'>
                    {state.onlineProfessionals}
                  </div>
                  <div className='text-sm text-gray-500'>Online</div>
                </div>
              </div>
            </Card>

            <Card className='p-4'>
              <div className='flex items-center gap-3'>
                <div className='p-2 bg-orange-100 rounded-lg'>
                  <CheckCircle className='w-5 h-5 text-orange-600' />
                </div>
                <div>
                  <div className='text-2xl font-bold text-gray-900'>
                    {state.myConsultations.length}
                  </div>
                  <div className='text-sm text-gray-500'>Minhas Consultas</div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          {/* Queue List */}
          <div>
            <Card className='p-6'>
              <h3 className='text-lg font-semibold mb-4 flex items-center gap-2'>
                <Users className='w-5 h-5' />
                Fila de Espera
              </h3>

              {state.consultations.length === 0 ? (
                <div className='text-center py-8 text-gray-500'>
                  <Users className='w-12 h-12 mx-auto mb-4 opacity-50' />
                  <p>Nenhuma consulta na fila</p>
                </div>
              ) : (
                <div className='space-y-3'>
                  {state.consultations.map(consultation => (
                    <div
                      key={consultation.id}
                      className='p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors'
                    >
                      <div className='flex items-start justify-between mb-3'>
                        <div className='flex-1'>
                          <div className='flex items-center gap-2 mb-2'>
                            <span className='text-sm font-medium text-gray-500'>
                              #{consultation.position}
                            </span>
                            <StatusBadge
                              className={`${priorityColors[consultation.priority as keyof typeof priorityColors]}`}
                            >
                              {getPriorityLabel(consultation.priority)}
                            </StatusBadge>
                          </div>

                          <h4 className='font-medium text-gray-900 mb-1'>
                            {consultation.patient?.name}
                          </h4>

                          <p className='text-sm text-gray-600 mb-2'>
                            {consultation.description}
                          </p>

                          <div className='flex items-center gap-4 text-xs text-gray-500'>
                            <span className='flex items-center gap-1'>
                              <Clock className='w-3 h-3' />~
                              {getEstimatedWaitTime(consultation.position)}min
                            </span>
                            <span className='flex items-center gap-1'>
                              <Calendar className='w-3 h-3' />
                              {formatTime(consultation.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <Button
                        onClick={() => handleAssumeConsultation(consultation)}
                        className='w-full'
                        size='sm'
                      >
                        <Play className='w-4 h-4 mr-2' />
                        Assumir Consulta
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* My Consultations */}
          <div>
            <Card className='p-6'>
              <h3 className='text-lg font-semibold mb-4 flex items-center gap-2'>
                <CheckCircle className='w-5 h-5' />
                Minhas Consultas Ativas
              </h3>

              {state.myConsultations.length === 0 ? (
                <div className='text-center py-8 text-gray-500'>
                  <CheckCircle className='w-12 h-12 mx-auto mb-4 opacity-50' />
                  <p>Nenhuma consulta ativa</p>
                </div>
              ) : (
                <div className='space-y-3'>
                  {state.myConsultations.map(consultation => (
                    <div
                      key={consultation.id}
                      className='p-4 border border-gray-200 rounded-lg'
                    >
                      <div className='flex items-start justify-between mb-3'>
                        <div className='flex-1'>
                          <h4 className='font-medium text-gray-900 mb-1'>
                            {consultation.patient?.name}
                          </h4>

                          <p className='text-sm text-gray-600 mb-2'>
                            {consultation.description}
                          </p>

                          <div className='flex items-center gap-2 text-xs text-gray-500'>
                            <span className='flex items-center gap-1'>
                              <Calendar className='w-3 h-3' />
                              Iniciada às {formatTime(consultation.startedAt)}
                            </span>
                          </div>
                        </div>

                        <StatusBadge className='bg-green-100 text-green-800'>
                          Em Atendimento
                        </StatusBadge>
                      </div>

                      <div className='flex gap-2'>
                        <Button
                          onClick={() => {
                            // TODO: Start video call
                            console.log(
                              'Start video call for consultation:',
                              consultation.id
                            );
                          }}
                          className='flex-1'
                          size='sm'
                        >
                          <Video className='w-4 h-4 mr-2' />
                          Iniciar Vídeo
                        </Button>

                        <Button
                          onClick={() => handleFinishConsultation(consultation)}
                          variant='outline'
                          size='sm'
                        >
                          <CheckCircle className='w-4 h-4 mr-2' />
                          Finalizar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>

      {/* Finish Consultation Modal */}
      {showFinishModal && selectedConsultation && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <Card className='w-full max-w-md p-6'>
            <h3 className='text-lg font-semibold mb-4'>Finalizar Consulta</h3>

            <div className='mb-4'>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Observações (opcional)
              </label>
              <textarea
                value={finishNotes}
                onChange={e => setFinishNotes(e.target.value)}
                placeholder='Digite observações sobre a consulta...'
                className='w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                rows={4}
              />
            </div>

            <div className='flex gap-3'>
              <Button
                onClick={() => setShowFinishModal(false)}
                variant='outline'
                className='flex-1'
              >
                Cancelar
              </Button>
              <Button onClick={confirmFinishConsultation} className='flex-1'>
                <CheckCircle className='w-4 h-4 mr-2' />
                Finalizar
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
