import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { useQueueStore } from '@/stores/queue'
import { useChatStore, initializeConsultationChat, disconnectChat } from '@/stores/chat'
import { useAuthStore } from '@/stores/auth'
import { useState, useEffect, useMemo, useCallback } from 'react'
import { webrtcService } from '@/lib/webrtc'
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
  MessageSquare
} from 'lucide-react'

interface ConsultaRoomProps {
  consultaId: string
}

export function ConsultaRoom({ consultaId }: ConsultaRoomProps) {
  const { items, finalizarConsulta } = useQueueStore()
  const { user } = useAuthStore()
  const { sendMessage } = useChatStore()
  const messages = useChatStore(state => state.messages)
  const chatMessages = useMemo(() => {
    const consultationMessages = messages[consultaId] || []
    console.log('🦷 Dentista - Store atualizado:', consultationMessages.length, 'mensagens')
    return consultationMessages
  }, [messages, consultaId])
  const [consulta, setConsulta] = useState(() => 
    items.find(item => item.id === consultaId)
  )
  
  const [videoEnabled, setVideoEnabled] = useState(true)
  const [audioEnabled, setAudioEnabled] = useState(true)
  const [anotacoes, setAnotacoes] = useState('')
  const [startTime] = useState(new Date())
  const [currentTime, setCurrentTime] = useState(new Date())
  const [chatMessage, setChatMessage] = useState('')
  const [localVideoRef, setLocalVideoRef] = useState<HTMLVideoElement | null>(null)
  const [remoteVideoRef, setRemoteVideoRef] = useState<HTMLVideoElement | null>(null)
  const [webrtcInitialized, setWebrtcInitialized] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    
    return () => clearInterval(interval)
  }, [])

  // Inicializar chat WebSocket
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (user && token) {
      initializeConsultationChat(
        consultaId,
        user.id,
        user.name || 'Profissional',
        token
      ).catch(error => {
        console.error('❌ Erro ao inicializar chat:', error)
      })
    }
    
    // Cleanup ao desmontar
    return () => {
      disconnectChat(consultaId)
    }
  }, [consultaId, user])

  // Inicializar WebRTC (vídeo e áudio)
  useEffect(() => {
    const initVideo = async () => {
      if (!user) return
      
      try {
        console.log('🎥 Inicializando WebRTC...')
        const stream = await webrtcService.initialize(consultaId, user.id)
        
        // Configurar vídeo local
        if (localVideoRef) {
          localVideoRef.srcObject = stream
          localVideoRef.play().catch(e => console.error('Erro ao reproduzir vídeo local:', e))
        }
        
        // Profissional cria offer (inicia conexão)
        if (user.role !== 'paciente') {
          console.log('👨‍⚕️ Profissional criando offer...')
          // Aguardar um pouco para garantir que o paciente entrou
          setTimeout(async () => {
            await webrtcService.createOffer()
          }, 2000)
        }
        
        setWebrtcInitialized(true)
        console.log('✅ WebRTC inicializado')
      } catch (error: any) {
        console.error('❌ Erro ao inicializar vídeo:', error)
        alert(`Não foi possível acessar câmera/microfone: ${error.message}`)
      }
    }
    
    if (user) {
      initVideo()
    }
    
    return () => {
      webrtcService.cleanup()
    }
  }, [consultaId, user, localVideoRef])

  // Monitorar vídeo remoto
  useEffect(() => {
    if (!webrtcInitialized || !remoteVideoRef) return
    
    const interval = setInterval(() => {
      const remoteStream = webrtcService.getRemoteStream()
      if (remoteStream && remoteStream.getTracks().length > 0 && !remoteVideoRef.srcObject) {
        console.log('📺 Conectando vídeo remoto')
        remoteVideoRef.srcObject = remoteStream
        remoteVideoRef.play().catch(e => console.error('Erro ao reproduzir vídeo remoto:', e))
      }
    }, 1000)
    
    return () => clearInterval(interval)
  }, [webrtcInitialized, remoteVideoRef])

  useEffect(() => {
    const updated = items.find(item => item.id === consultaId)
    setConsulta(updated)
  }, [items, consultaId])

  if (!consulta) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold text-primaryDark mb-4">Consulta não encontrada</h2>
            <Button onClick={() => window.location.hash = '/dentista'}>
              Voltar para Fila
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

  const handleFinalizarConsulta = async () => {
    if (window.confirm('Tem certeza que deseja finalizar esta consulta?')) {
      console.log('🏁 Finalizando consulta:', consultaId)
      
      try {
        // Finalizar consulta no backend
        await finalizarConsulta(consultaId)
        console.log('✅ Consulta finalizada no backend')
        
        // Desconectar chat
        disconnectChat(consultaId)
        console.log('🔌 Chat desconectado')
        
        alert('Consulta finalizada com sucesso!')
        window.location.hash = '/dentista'
      } catch (error) {
        console.error('❌ Erro ao finalizar consulta:', error)
        alert('Erro ao finalizar consulta. Tente novamente.')
      }
    }
  }

  const handleSendMessage = () => {
    if (chatMessage.trim() && user) {
      console.log('🦷 Dentista enviando mensagem via WebSocket')
      
      try {
        sendMessage({
          consultationId: consultaId,
          senderId: user.id,
          senderName: user.name || 'Dr. João Silva',
          senderType: 'profissional',
          message: chatMessage.trim()
        })
        setChatMessage('')
      } catch (error) {
        console.error('❌ Erro ao enviar mensagem:', error)
        alert('Erro ao enviar mensagem. Verifique a conexão.')
      }
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-primaryDark">Consulta em Andamento</h1>
          <p className="text-gray-600 mt-1">
            Paciente: {consulta.pacienteNome} • {consulta.especialidade}
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">Duração</div>
          <div className="text-2xl font-mono font-bold text-primary">
            {getDurationString()}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Video Area */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardContent className="p-0">
              <div className="aspect-video bg-gray-900 rounded-lg relative overflow-hidden">
                {/* Vídeo Remoto (Paciente) */}
                <video
                  ref={setRemoteVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />

                {/* Fallback se não houver vídeo remoto */}
                {!webrtcInitialized && (
                  <div className="absolute inset-0 bg-gradient-to-br from-primaryDark to-primary flex items-center justify-center">
                    <div className="text-center text-white">
                      <Video className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <h3 className="text-xl font-semibold mb-2">Aguardando conexão...</h3>
                      <p className="text-sm opacity-75">Iniciando chamada de vídeo</p>
                    </div>
                  </div>
                )}

                {/* Status Overlay */}
                <div className="absolute top-4 left-4 z-10">
                  <div className="bg-black/50 px-3 py-1 rounded-full flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-white text-sm">REC {getDurationString()}</span>
                  </div>
                </div>

                {/* Patient Info Overlay */}
                <div className="absolute top-4 right-4 z-10 bg-black/50 px-3 py-2 rounded-lg text-white">
                  <div className="text-sm">
                    <div className="font-medium">{consulta.pacienteNome}</div>
                    <div className="opacity-75">{consulta.especialidade}</div>
                  </div>
                </div>

                {/* Vídeo Local (Preview pequeno) */}
                <div className="absolute bottom-4 right-4 w-32 h-24 bg-gray-900 rounded-lg border-2 border-white/20 overflow-hidden z-10">
                  <video
                    ref={setLocalVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover transform scale-x-[-1]"
                  />
                </div>
              </div>

              {/* Controls */}
              <div className="p-4 bg-gray-50 flex justify-center gap-4">
                <Button
                  variant={audioEnabled ? "primary" : "secondary"}
                  size="icon"
                  onClick={() => {
                    const newState = !audioEnabled
                    setAudioEnabled(newState)
                    webrtcService.toggleAudio(newState)
                  }}
                  title={audioEnabled ? "Desligar microfone" : "Ligar microfone"}
                >
                  {audioEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                </Button>
                
                <Button
                  variant={videoEnabled ? "primary" : "secondary"}
                  size="icon"
                  onClick={() => {
                    const newState = !videoEnabled
                    setVideoEnabled(newState)
                    webrtcService.toggleVideo(newState)
                  }}
                  title={videoEnabled ? "Desligar câmera" : "Ligar câmera"}
                >
                  {videoEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                </Button>

                <Button 
                  variant="secondary" 
                  onClick={handleFinalizarConsulta}
                  className="bg-red-500 hover:bg-red-600 text-white"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Finalizar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Side Panel */}
        <div className="space-y-6">
          {/* Chat */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-accent" />
                  Chat
                </div>
                <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {chatMessages.length} mensagens
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 h-64 overflow-y-auto">
                {chatMessages.length === 0 ? (
                  <div className="text-center text-gray-500 py-4">
                    Nenhuma mensagem ainda
                  </div>
                ) : (
                  chatMessages.map((msg) => (
                    <div key={msg.id} className={`p-2 rounded-lg ${
                      msg.senderType === 'profissional' 
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
                  ))
                )}
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

          {/* Patient Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-accent" />
                Informações do Paciente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Nome:</label>
                  <p className="font-medium">{consulta.pacienteNome}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Especialidade:</label>
                  <p>{consulta.especialidade}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Prioridade:</label>
                  <div className="mt-1">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      consulta.prioridade === 'alta' ? 'bg-red-100 text-red-800' :
                      consulta.prioridade === 'media' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {consulta.prioridade.charAt(0).toUpperCase() + consulta.prioridade.slice(1)}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Status:</label>
                  <div className="mt-1">
                    <StatusBadge status={consulta.status} />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Descrição do caso:</label>
                  <p className="text-sm text-gray-700 mt-1 p-3 bg-gray-50 rounded">
                    {consulta.descricao}
                  </p>
                </div>
                {consulta.imagem && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Imagem anexada:</label>
                    <img 
                      src={consulta.imagem} 
                      alt="Anexo do paciente" 
                      className="mt-2 w-full h-32 object-cover rounded border cursor-pointer hover:opacity-90"
                      onClick={() => window.open(consulta.imagem!, '_blank')}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-accent" />
                Anotações da Consulta
              </CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                value={anotacoes}
                onChange={(e) => setAnotacoes(e.target.value)}
                className="w-full h-32 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-accent focus:border-transparent resize-none"
                placeholder="Digite suas anotações sobre a consulta..."
              />
              <div className="flex justify-between items-center mt-3">
                <span className="text-xs text-gray-500">
                  {anotacoes.length}/500 caracteres
                </span>
                <Button size="sm" variant="secondary">
                  Salvar Rascunho
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button variant="secondary" size="sm" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Prescrever Medicamento
                </Button>
                <Button variant="secondary" size="sm" className="w-full justify-start">
                  <Calendar className="h-4 w-4 mr-2" />
                  Agendar Retorno
                </Button>
                <Button variant="secondary" size="sm" className="w-full justify-start">
                  <Camera className="h-4 w-4 mr-2" />
                  Capturar Tela
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}