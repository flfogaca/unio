import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Button } from '@/components/ui/Button'
import { Suporte } from './Suporte'
import { useQueueStore } from '@/stores/queue'
import { useAuthStore } from '@/stores/auth'
import { Clock, Users, MessageSquare, Calendar, FileText } from 'lucide-react'
import { useEffect, useState } from 'react'

export function PacienteDashboard() {
  const { items, fetchQueue } = useQueueStore()
  const { user } = useAuthStore()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [showSupporte, setShowSupporte] = useState(false)
  
  // Buscar consultas ao montar o componente
  useEffect(() => {
    fetchQueue()
  }, [fetchQueue])
  
  // Simula atualização em tempo real
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000) // Atualiza a cada minuto
    
    return () => clearInterval(interval)
  }, [])

  // Polling automático para verificar mudanças de status
  useEffect(() => {
    const interval = setInterval(() => {
      fetchQueue() // Atualiza dados da fila a cada 5 segundos
    }, 5000)
    
    return () => clearInterval(interval)
  }, [fetchQueue])

  // Se está mostrando suporte, renderizar a tela de suporte
  if (showSupporte) {
    return <Suporte onBack={() => setShowSupporte(false)} />
  }

  // Filtra consultas do paciente logado
  const minhasConsultas = items.filter(item => item.pacienteId === user?.id)
  const consultaAtiva = minhasConsultas.find(item => item.status === 'em-fila' || item.status === 'em-atendimento')
  const historicoConsultas = minhasConsultas.filter(item => item.status === 'finalizado')

  const stats = [
    {
      title: 'Posição na Fila',
      value: consultaAtiva?.posicao || 0,
      icon: Users,
      description: consultaAtiva ? 'Consultas à sua frente' : 'Você não está na fila'
    },
    {
      title: 'Tempo Estimado',
      value: consultaAtiva?.tempoEstimado || 0,
      icon: Clock,
      description: 'Minutos aproximados',
      suffix: 'min'
    },
    {
      title: 'Consultas Realizadas',
      value: historicoConsultas.length,
      icon: Calendar,
      description: 'Total de atendimentos'
    },
    {
      title: 'Próxima Consulta',
      value: consultaAtiva ? 'Hoje' : '---',
      icon: MessageSquare,
      description: consultaAtiva ? 'Em andamento' : 'Nenhuma agendada'
    }
  ]

  const handleNavigateToSolicitar = () => {
    window.location.hash = '/paciente/solicitar'
  }

  const handleNavigateToHistorico = () => {
    window.location.hash = '/paciente/historico'
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-primaryDark">Dashboard do Paciente</h1>
          <p className="text-gray-600 mt-1">
            Acompanhe sua posição na fila e histórico de consultas
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">Última atualização</div>
          <div className="text-primary font-medium">
            {currentTime.toLocaleTimeString('pt-BR', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-primaryDark">
                      {stat.value}{stat.suffix && ` ${stat.suffix}`}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
                  </div>
                  <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                    <Icon className="h-6 w-6 text-accent" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Atual */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-accent" />
              Status Atual
            </CardTitle>
          </CardHeader>
          <CardContent>
            {consultaAtiva ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Especialidade:</span>
                  <span className="text-primary">{consultaAtiva.especialidade}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Status:</span>
                  <StatusBadge status={consultaAtiva.status} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Descrição:</span>
                  <span className="text-gray-600 text-sm">{consultaAtiva.descricao}</span>
                </div>
                {consultaAtiva.status === 'em-fila' ? (
                  <div className="bg-accent/5 p-4 rounded-lg">
                    <p className="text-sm text-center">
                      Você está na posição {consultaAtiva.posicao} da fila
                    </p>
                    <p className="text-xs text-gray-500 text-center mt-1">
                      Tempo estimado: {consultaAtiva.tempoEstimado} minutos
                    </p>
                  </div>
                ) : (
                  <div className="bg-green-50 border-2 border-green-200 p-4 rounded-lg animate-pulse">
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-ping mr-2"></div>
                        <span className="text-green-800 font-semibold text-sm">
                          🚨 SUA CONSULTA FOI INICIADA!
                        </span>
                      </div>
                      <p className="text-green-700 text-sm mb-3">
                        {consultaAtiva.dentistaNome || 'Profissional'} está te aguardando
                      </p>
                      <Button 
                        className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-200 transform hover:scale-105"
                        onClick={() => {
                          console.log('👤 Paciente entrando na consulta:', consultaAtiva.id)
                          window.location.hash = `/paciente/consulta/${consultaAtiva.id}`
                        }}
                      >
                        🎥 ENTRAR NA CONSULTA
                      </Button>
                      <p className="text-xs text-green-600 mt-2">
                        Clique para iniciar a videchamada
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">Você não possui consultas ativas</p>
                <Button onClick={handleNavigateToSolicitar}>
                  Solicitar Atendimento
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Histórico Recente */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-accent" />
              Histórico Recente
            </CardTitle>
          </CardHeader>
          <CardContent>
            {historicoConsultas.length > 0 ? (
              <div className="space-y-3">
                {historicoConsultas.slice(-3).map((consulta) => (
                  <div key={consulta.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{consulta.especialidade}</p>
                      <p className="text-xs text-gray-500">
                        {consulta.criadoEm.toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <StatusBadge status={consulta.status} />
                  </div>
                ))}
                <div className="text-center pt-2">
                  <Button variant="link" size="sm" onClick={handleNavigateToHistorico}>
                    Ver histórico completo
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Nenhuma consulta realizada ainda</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Ações Rápidas */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button className="h-auto p-4" onClick={handleNavigateToSolicitar}>
              <div className="flex flex-col items-center space-y-2">
                <MessageSquare className="h-6 w-6" />
                <span>Nova Consulta</span>
              </div>
            </Button>
            <Button variant="secondary" className="h-auto p-4" onClick={handleNavigateToHistorico}>
              <div className="flex flex-col items-center space-y-2">
                <Calendar className="h-6 w-6" />
                <span>Ver Histórico</span>
              </div>
            </Button>
            <Button variant="secondary" className="h-auto p-4" onClick={() => setShowSupporte(true)}>
              <div className="flex flex-col items-center space-y-2">
                <MessageSquare className="h-6 w-6" />
                <span>Suporte</span>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}