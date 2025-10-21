import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ConfirmModal } from '@/components/ui/Modal';
import { ConsultationEndModal } from '@/components/ui/ConsultationEndModal';
import { useQueueStore } from '@/stores/queue';
import {
  useChatStore,
  initializeConsultationChat,
  disconnectChat,
} from '@/stores/chat';
import { useAuthStore } from '@/stores/auth';
import { useState, useEffect, useMemo } from 'react';
import { webrtcService } from '@/lib/webrtc';
import { queueSocketService } from '@/lib/queueSocket';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Phone,
  FileText,
  Camera,
  Share,
  MessageSquare,
  ArrowLeft,
  Clock,
} from 'lucide-react';

interface PacienteConsultaRoomProps {
  consultaId: string;
}

export function PacienteConsultaRoom({
  consultaId,
}: PacienteConsultaRoomProps) {
  const { items, fetchQueue, finalizarConsulta } = useQueueStore();
  const { user } = useAuthStore();
  const { sendMessage } = useChatStore();
  const messages = useChatStore(state => state.messages);
  const chatMessages = useMemo(() => {
    const consultationMessages = messages[consultaId] || [];
    console.log(
      '👤 Paciente - Store atualizado:',
      consultationMessages.length,
      'mensagens'
    );
    return consultationMessages;
  }, [messages, consultaId]);
  const [consulta, setConsulta] = useState(() =>
    items.find(item => item.id === consultaId)
  );

  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [startTime] = useState(new Date());
  const [currentTime, setCurrentTime] = useState(new Date());
  const [chatMessage, setChatMessage] = useState('');
  const [localVideoRef, setLocalVideoRef] = useState<HTMLVideoElement | null>(
    null
  );
  const [remoteVideoRef, setRemoteVideoRef] = useState<HTMLVideoElement | null>(
    null
  );
  const [webrtcInitialized, setWebrtcInitialized] = useState(false);

  // Estados dos modais
  const [showConfirmEndModal, setShowConfirmEndModal] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  const [endModalData, setEndModalData] = useState<{
    finishedBy: string;
    finishedByRole: 'paciente' | 'profissional';
    duration: string;
  } | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Inicializar chat WebSocket
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (user && token) {
      initializeConsultationChat(
        consultaId,
        user.id,
        user.name || 'Paciente',
        token
      ).catch(error => {
        console.error('❌ Erro ao inicializar chat:', error);
      });
    }

    // Cleanup ao desmontar
    return () => {
      disconnectChat(consultaId);
    };
  }, [consultaId, user]);

  // Inicializar WebRTC (vídeo e áudio)
  useEffect(() => {
    const initVideo = async () => {
      if (!user) return;

      try {
        console.log('🎥 Inicializando WebRTC...');
        const stream = await webrtcService.initialize(consultaId, user.id);

        // Configurar vídeo local
        if (localVideoRef) {
          localVideoRef.srcObject = stream;
          localVideoRef
            .play()
            .catch(e => console.error('Erro ao reproduzir vídeo local:', e));
        }

        setWebrtcInitialized(true);
        console.log('✅ WebRTC inicializado (paciente aguarda offer)');
      } catch (error: any) {
        console.error('❌ Erro ao inicializar vídeo:', error);
        alert(`Não foi possível acessar câmera/microfone: ${error.message}`);
      }
    };

    if (user) {
      initVideo();
    }

    return () => {
      webrtcService.cleanup();
    };
  }, [consultaId, user, localVideoRef]);

  // Monitorar vídeo remoto
  useEffect(() => {
    if (!webrtcInitialized || !remoteVideoRef) return;

    const interval = setInterval(() => {
      const remoteStream = webrtcService.getRemoteStream();
      if (
        remoteStream &&
        remoteStream.getTracks().length > 0 &&
        !remoteVideoRef.srcObject
      ) {
        console.log('📺 Conectando vídeo remoto');
        remoteVideoRef.srcObject = remoteStream;
        remoteVideoRef
          .play()
          .catch(e => console.error('Erro ao reproduzir vídeo remoto:', e));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [webrtcInitialized, remoteVideoRef]);

  useEffect(() => {
    const updated = items.find(item => item.id === consultaId);
    setConsulta(updated);
  }, [items, consultaId]);

  // Buscar dados atualizados periodicamente
  useEffect(() => {
    const interval = setInterval(() => {
      fetchQueue();
    }, 5000); // Atualiza a cada 5 segundos

    return () => clearInterval(interval);
  }, [fetchQueue]);

  // Conectar ao WebSocket de fila
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (user && token) {
      queueSocketService.connect(token);
      queueSocketService.joinUserRoom(user.id);
    }

    return () => {
      if (user) {
        queueSocketService.leaveUserRoom(user.id);
      }
    };
  }, [user]);

  // Escutar evento de consulta finalizada via WebSocket
  useEffect(() => {
    console.log(
      '🎯 Paciente: Configurando listener para consultation-finished'
    );

    const handleConsultationFinished = (data: any) => {
      console.log('🔔 Paciente: Consulta finalizada (WebSocket):', data);
      console.log(
        '🔔 Paciente: ConsultaId recebida:',
        data.consultationId,
        'vs atual:',
        consultaId
      );

      if (data.consultationId === consultaId) {
        console.log('✅ Paciente: Consulta corresponde, processando...');

        // Desconectar chat e vídeo imediatamente
        disconnectChat(consultaId);
        webrtcService.cleanup();

        // Mostrar modal informativo com redirecionamento automático
        setEndModalData({
          finishedBy: data.finishedBy || 'Usuário',
          finishedByRole: data.finishedByRole || 'profissional',
          duration: data.duration || '0min 0s',
        });
        setShowEndModal(true);

        // Redirecionamento automático sempre acontece
        if (data.redirectTo) {
          console.log(
            '🚀 Paciente: Redirecionando automaticamente para:',
            data.redirectTo
          );
          setTimeout(() => {
            console.log('🚀 Paciente: Executando redirecionamento...');
            window.location.href = data.redirectTo;
          }, 3000); // Aguardar 3 segundos para o usuário ver o modal
        } else {
          console.log('ℹ️ Paciente: Sem URL de redirecionamento');
        }
      } else {
        console.log('❌ Paciente: Consulta não corresponde');
      }
    };

    queueSocketService.on('consultation-finished', handleConsultationFinished);

    return () => {
      console.log('🧹 Paciente: Removendo listener consultation-finished');
      queueSocketService.off(
        'consultation-finished',
        handleConsultationFinished
      );
    };
  }, [consultaId]);

  if (!consulta) {
    return (
      <div className='max-w-4xl mx-auto'>
        <Card>
          <CardContent className='p-8 text-center'>
            <h2 className='text-2xl font-bold text-primaryDark mb-4'>
              Consulta não encontrada
            </h2>
            <Button onClick={() => (window.location.hash = '/paciente')}>
              <ArrowLeft className='h-4 w-4 mr-2' />
              Voltar para Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getDurationString = () => {
    const diff = Math.floor(
      (currentTime.getTime() - startTime.getTime()) / 1000
    );
    const minutes = Math.floor(diff / 60);
    const seconds = diff % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSendMessage = () => {
    if (chatMessage.trim() && user) {
      console.log('👤 Paciente enviando mensagem via WebSocket');

      try {
        sendMessage({
          consultationId: consultaId,
          senderId: user.id,
          senderName: user.name || 'Você',
          senderType: 'paciente',
          message: chatMessage.trim(),
        });
        setChatMessage('');
      } catch (error) {
        console.error('❌ Erro ao enviar mensagem:', error);
        alert('Erro ao enviar mensagem. Verifique a conexão.');
      }
    }
  };

  const handleConfirmEnd = async () => {
    console.log('🚪 Paciente finalizando consulta:', consultaId);

    try {
      // Emitir evento via WebSocket para notificar instantaneamente
      if (queueSocketService.isConnected() && user) {
        queueSocketService.emit('finish-consultation', {
          consultationId: consultaId,
          notes: 'Finalizado pelo paciente',
        });
      }

      // Finalizar a consulta via API
      await finalizarConsulta(consultaId);
      console.log('✅ Consulta finalizada pelo paciente');

      // Desconectar chat e vídeo imediatamente
      disconnectChat(consultaId);
      webrtcService.cleanup();

      // Mostrar modal de sucesso com redirecionamento automático
      setEndModalData({
        finishedBy: user?.name || 'Paciente',
        finishedByRole: 'paciente',
        duration: '0min 0s', // Será calculado pelo backend
      });
      setShowEndModal(true);

      // Redirecionamento automático após 3 segundos
      setTimeout(() => {
        console.log(
          '🚀 Paciente: Redirecionando automaticamente para dashboard'
        );
        window.location.href = '/paciente';
      }, 3000);
    } catch (error) {
      console.error('❌ Erro ao finalizar consulta:', error);
      alert('Erro ao finalizar consulta. Tente novamente.');
    }
  };

  const handleCloseEndModal = () => {
    setShowEndModal(false);
    // Limpar hash e usar pathname limpo
    window.location.href = '/paciente';
  };

  return (
    <div className='max-w-7xl mx-auto space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          <Button
            variant='secondary'
            onClick={() => (window.location.hash = '/paciente')}
            className='flex items-center gap-2'
          >
            <ArrowLeft className='h-4 w-4' />
            Voltar
          </Button>
          <div>
            <h1 className='text-2xl font-bold text-primaryDark'>
              Consulta em Andamento
            </h1>
            <p className='text-gray-600'>
              Conectado com {consulta.dentistaNome || 'Profissional'}
            </p>
          </div>
        </div>
        <div className='flex items-center gap-4'>
          <div className='flex items-center gap-2 bg-red-100 text-red-800 px-3 py-1 rounded-full'>
            <div className='w-2 h-2 bg-red-500 rounded-full animate-pulse'></div>
            <span className='text-sm font-medium'>
              AO VIVO {getDurationString()}
            </span>
          </div>
          <StatusBadge status={consulta.status as any} />
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-4 gap-6'>
        {/* Video Area - Principal */}
        <div className='lg:col-span-3'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Video className='h-5 w-5 text-accent' />
                Videchamada
              </CardTitle>
            </CardHeader>

            <Card>
              <CardContent className='p-0'>
                <div className='aspect-video bg-gray-900 rounded-lg relative overflow-hidden'>
                  {/* Vídeo Remoto (Profissional) */}
                  <video
                    ref={setRemoteVideoRef}
                    autoPlay
                    playsInline
                    className='w-full h-full object-cover'
                  />

                  {/* Fallback se não houver vídeo remoto */}
                  {!webrtcInitialized && (
                    <div className='absolute inset-0 bg-gradient-to-br from-green-600 to-green-700 flex items-center justify-center'>
                      <div className='text-center text-white'>
                        <Video className='h-16 w-16 mx-auto mb-4 opacity-50' />
                        <h3 className='text-xl font-semibold mb-2'>
                          Aguardando conexão...
                        </h3>
                        <p className='text-sm opacity-75'>
                          Iniciando chamada de vídeo
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Vídeo Local (Preview pequeno) */}
                  <div className='absolute bottom-4 right-4 w-32 h-24 bg-gray-900 rounded-lg border-2 border-white/20 overflow-hidden z-10'>
                    <video
                      ref={setLocalVideoRef}
                      autoPlay
                      playsInline
                      muted
                      className='w-full h-full object-cover transform scale-x-[-1]'
                    />
                  </div>

                  {/* Connection Status */}
                  <div className='absolute top-4 left-4 z-10'>
                    <div className='bg-green-500 text-white px-3 py-1 rounded-full flex items-center gap-2'>
                      <div className='w-2 h-2 bg-white rounded-full animate-pulse'></div>
                      <span className='text-sm font-medium'>Conectado</span>
                    </div>
                  </div>
                </div>

                {/* Controls */}
                <div className='p-4 bg-gray-50 flex justify-center gap-4'>
                  <Button
                    variant={videoEnabled ? 'primary' : 'secondary'}
                    size='sm'
                    onClick={() => {
                      const newState = !videoEnabled;
                      setVideoEnabled(newState);
                      webrtcService.toggleVideo(newState);
                    }}
                    className='flex items-center gap-2'
                    title={videoEnabled ? 'Desligar câmera' : 'Ligar câmera'}
                  >
                    {videoEnabled ? (
                      <Video className='h-4 w-4' />
                    ) : (
                      <VideoOff className='h-4 w-4' />
                    )}
                    {videoEnabled ? 'Vídeo' : 'Sem Vídeo'}
                  </Button>
                  <Button
                    variant={audioEnabled ? 'primary' : 'secondary'}
                    size='sm'
                    onClick={() => {
                      const newState = !audioEnabled;
                      setAudioEnabled(newState);
                      webrtcService.toggleAudio(newState);
                    }}
                    className='flex items-center gap-2'
                    title={
                      audioEnabled ? 'Desligar microfone' : 'Ligar microfone'
                    }
                  >
                    {audioEnabled ? (
                      <Mic className='h-4 w-4' />
                    ) : (
                      <MicOff className='h-4 w-4' />
                    )}
                    {audioEnabled ? 'Áudio' : 'Mudo'}
                  </Button>
                  <Button
                    variant='secondary'
                    size='sm'
                    onClick={() => setShowConfirmEndModal(true)}
                    className='flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white'
                    title='Finalizar consulta'
                  >
                    <Phone className='h-4 w-4' />
                    Finalizar Consulta
                  </Button>
                </div>
              </CardContent>
            </Card>
          </Card>
        </div>

        {/* Sidebar - Chat e Info */}
        <div className='space-y-6'>
          {/* Chat */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <MessageSquare className='h-5 w-5 text-accent' />
                  Chat
                </div>
                <span className='text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded'>
                  {chatMessages.length} mensagens
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-3 h-64 overflow-y-auto'>
                {chatMessages.length === 0 ? (
                  <div className='text-center text-gray-500 py-4'>
                    Nenhuma mensagem ainda
                  </div>
                ) : (
                  chatMessages.map(msg => (
                    <div
                      key={msg.id}
                      className={`p-2 rounded-lg ${
                        msg.senderType === 'paciente'
                          ? 'bg-accent/10 ml-4'
                          : msg.senderType === 'sistema'
                            ? 'bg-yellow-50 text-yellow-800 text-center'
                            : 'bg-gray-100 mr-4'
                      }`}
                    >
                      <div className='text-xs font-medium text-gray-600 mb-1'>
                        {msg.senderName} - {msg.timestamp.toLocaleTimeString()}
                      </div>
                      <div className='text-sm'>{msg.message}</div>
                    </div>
                  ))
                )}
              </div>
              <div className='flex gap-2 mt-3'>
                <input
                  type='text'
                  value={chatMessage}
                  onChange={e => setChatMessage(e.target.value)}
                  placeholder='Digite sua mensagem...'
                  className='flex-1 p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-accent focus:border-transparent'
                  onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
                />
                <Button size='sm' onClick={handleSendMessage}>
                  Enviar
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Consulta Info */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <FileText className='h-5 w-5 text-accent' />
                Informações
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-3'>
              <div className='flex justify-between'>
                <span className='text-sm font-medium'>Especialidade:</span>
                <span className='text-sm text-primary'>
                  {consulta.especialidade}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-sm font-medium'>Profissional:</span>
                <span className='text-sm text-primary'>
                  {consulta.dentistaNome || 'Aguarde...'}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-sm font-medium'>Duração:</span>
                <span className='text-sm text-primary'>
                  {getDurationString()}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-sm font-medium'>Status:</span>
                <StatusBadge status={consulta.status as any} />
              </div>
            </CardContent>
          </Card>

          {/* Ações Rápidas */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Clock className='h-5 w-5 text-accent' />
                Ações
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-2'>
              <Button
                size='sm'
                variant='secondary'
                className='w-full justify-start'
              >
                <FileText className='h-4 w-4 mr-2' />
                Ver Prontuário
              </Button>
              <Button
                size='sm'
                variant='secondary'
                className='w-full justify-start'
              >
                <Share className='h-4 w-4 mr-2' />
                Compartilhar Tela
              </Button>
              <Button
                size='sm'
                variant='secondary'
                className='w-full justify-start'
              >
                <Camera className='h-4 w-4 mr-2' />
                Tirar Foto
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal de Confirmação */}
      <ConfirmModal
        isOpen={showConfirmEndModal}
        onClose={() => setShowConfirmEndModal(false)}
        onConfirm={handleConfirmEnd}
        title='Finalizar Consulta'
        message='Tem certeza que deseja finalizar a consulta? O profissional também será notificado.'
        confirmText='Finalizar'
        cancelText='Cancelar'
        variant='danger'
      />

      {/* Modal de Consulta Finalizada */}
      {endModalData && (
        <ConsultationEndModal
          isOpen={showEndModal}
          onClose={handleCloseEndModal}
          finishedBy={endModalData.finishedBy}
          finishedByRole={endModalData.finishedByRole}
          duration={endModalData.duration}
          autoRedirect={true}
          redirectDelay={3000}
        />
      )}
    </div>
  );
}
