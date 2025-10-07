import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { useQueueStore } from '@/stores/queue'
import { useChatStore, initializeConsultationChat } from '@/stores/chat'
import { useAuthStore } from '@/stores/auth'
import { useState, useEffect } from 'react'
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Phone, 
  FileText, 
  User,
  Camera,
  Share,
  Calendar,
  MessageSquare,
  ArrowLeft,
  Clock
} from 'lucide-react'

interface PacienteConsultaRoomProps {
  consultaId: string
}

export function PacienteConsultaRoom({ consultaId }: PacienteConsultaRoomProps) {
  const { items, fetchQueue } = useQueueStore()
  const { user } = useAuthStore()
  const { addMessage, getMessages } = useChatStore()
  const [consulta, setConsulta] = useState(() => 
    items.find(item => item.id === consultaId)
  )
  
  const [videoEnabled, setVideoEnabled] = useState(true)
  const [audioEnabled, setAudioEnabled] = useState(true)
  const [startTime] = useState(new Date())
  const [currentTime, setCurrentTime] = useState(new Date())
  const [chatMessage, setChatMessage] = useState('')
  const [chatMessages, setChatMessages] = useState(getMessages(consultaId))

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    
    return () => clearInterval(interval)
  }, [])

  // Inicializar chat da consulta
  useEffect(() => {
    initializeConsultationChat(consultaId)
    setChatMessages(getMessages(consultaId))
  }, [consultaId, getMessages])

  // Sincronizar mensagens do chat
  useEffect(() => {
    const interval = setInterval(() => {
      const messages = getMessages(consultaId)
      console.log('🔄 Paciente sincronizando mensagens:', messages.length, 'mensagens')
      setChatMessages(messages)
    }, 1000) // Atualiza a cada segundo
    
    return () => clearInterval(interval)
  }, [consultaId, getMessages])

  useEffect(() => {
    const updated = items.find(item => item.id === consultaId)
    setConsulta(updated)
  }, [items, consultaId])

  // Buscar dados atualizados periodicamente
  useEffect(() => {
    const interval = setInterval(() => {
      fetchQueue()
    }, 5000) // Atualiza a cada 5 segundos
    
    return () => clearInterval(interval)
  }, [fetchQueue])

  if (!consulta) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold text-primaryDark mb-4">Consulta não encontrada</h2>
            <Button onClick={() => window.location.hash = '/paciente'}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const getDurationString = () => {
    const diff = Math.floor((currentTime.getTime() - startTime.getTime()) / 1000)
    const minutes = Math.floor(diff / 60)
    const seconds = diff % 60
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  const handleSendMessage = () => {
    if (chatMessage.trim() && user) {
      console.log('👤 Paciente enviando mensagem:', {
        consultationId: consultaId,
        senderId: user.id,
        senderName: user.name || 'Você',
        message: chatMessage.trim()
      })
      addMessage({
        consultationId: consultaId,
        senderId: user.id,
        senderName: user.name || 'Você',
        senderType: 'paciente',
        message: chatMessage.trim()
      })
      setChatMessage('')
    } else {
      console.log('❌ Erro ao enviar mensagem:', { chatMessage: chatMessage.trim(), user: !!user })
    }
  }

  const handleEndCall = () => {
    if (window.confirm('Tem certeza que deseja sair da consulta?')) {
      alert('Você saiu da consulta. Aguarde o profissional finalizar.')
      window.location.hash = '/paciente'
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="secondary" 
            onClick={() => window.location.hash = '/paciente'}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-primaryDark">Consulta em Andamento</h1>
            <p className="text-gray-600">Conectado com {consulta.dentistaNome || 'Profissional'}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-red-100 text-red-800 px-3 py-1 rounded-full">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">AO VIVO {getDurationString()}</span>
          </div>
          <StatusBadge status={consulta.status} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Video Area - Principal */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5 text-accent" />
                Videchamada
              </CardTitle>
            </CardHeader>

            <Card>
              <CardContent className="p-0">
                <div className="aspect-video bg-gray-900 rounded-lg relative overflow-hidden">
                  {/* Video Placeholder */}
                  <div className="absolute inset-0 bg-gradient-to-br from-green-600 to-green-700 flex items-center justify-center">
                    <div className="text-center text-white">
                      <Video className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <h3 className="text-xl font-semibold mb-2">Videchamada Ativa</h3>
                      <p className="text-sm opacity-75">Conectado com {consulta.dentistaNome || 'Profissional'}</p>
                      <div className="mt-4 flex justify-center gap-4">
                        <div className="text-center">
                          <div className="w-16 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-2">
                            <User className="h-6 w-6" />
                          </div>
                          <p className="text-xs">Profissional</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Self Video */}
                  <div className="absolute bottom-4 right-4 w-32 h-24 bg-gray-700 rounded-lg border-2 border-white/20 flex items-center justify-center">
                    <User className="h-8 w-8 text-white/50" />
                  </div>

                  {/* Connection Status */}
                  <div className="absolute top-4 left-4">
                    <div className="bg-green-500 text-white px-3 py-1 rounded-full flex items-center gap-2">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium">Conectado</span>
                    </div>
                  </div>
                </div>

                {/* Controls */}
                <div className="p-4 bg-gray-50 flex justify-center gap-4">
                  <Button
                    variant={videoEnabled ? "default" : "secondary"}
                    size="sm"
                    onClick={() => setVideoEnabled(!videoEnabled)}
                    className="flex items-center gap-2"
                  >
                    {videoEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                    {videoEnabled ? 'Vídeo' : 'Sem Vídeo'}
                  </Button>
                  <Button
                    variant={audioEnabled ? "default" : "secondary"}
                    size="sm"
                    onClick={() => setAudioEnabled(!audioEnabled)}
                    className="flex items-center gap-2"
                  >
                    {audioEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                    {audioEnabled ? 'Áudio' : 'Mudo'}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleEndCall}
                    className="flex items-center gap-2"
                  >
                    <Phone className="h-4 w-4" />
                    Encerrar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </Card>
        </div>

        {/* Sidebar - Chat e Info */}
        <div className="space-y-6">
          {/* Chat */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-accent" />
                Chat
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 h-64 overflow-y-auto">
                {chatMessages.map((msg) => (
                  <div key={msg.id} className={`p-2 rounded-lg ${
                    msg.senderType === 'paciente' 
                      ? 'bg-accent/10 ml-4' 
                      : msg.senderType === 'sistema'
                      ? 'bg-yellow-50 text-yellow-800 text-center'
                      : 'bg-gray-100 mr-4'
                  }`}>
                    <div className="text-xs font-medium text-gray-600 mb-1">
                      {msg.senderName} - {msg.timestamp.toLocaleTimeString()}
                    </div>
                    <div className="text-sm">{msg.message}</div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-3">
                <input
                  type="text"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  placeholder="Digite sua mensagem..."
                  className="flex-1 p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-accent focus:border-transparent"
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <Button size="sm" onClick={handleSendMessage}>
                  Enviar
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Consulta Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-accent" />
                Informações
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Especialidade:</span>
                <span className="text-sm text-primary">{consulta.especialidade}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Profissional:</span>
                <span className="text-sm text-primary">{consulta.dentistaNome || 'Aguarde...'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Duração:</span>
                <span className="text-sm text-primary">{getDurationString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Status:</span>
                <StatusBadge status={consulta.status} />
              </div>
            </CardContent>
          </Card>

          {/* Ações Rápidas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-accent" />
                Ações
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button size="sm" variant="secondary" className="w-full justify-start">
                <FileText className="h-4 w-4 mr-2" />
                Ver Prontuário
              </Button>
              <Button size="sm" variant="secondary" className="w-full justify-start">
                <Share className="h-4 w-4 mr-2" />
                Compartilhar Tela
              </Button>
              <Button size="sm" variant="secondary" className="w-full justify-start">
                <Camera className="h-4 w-4 mr-2" />
                Tirar Foto
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
