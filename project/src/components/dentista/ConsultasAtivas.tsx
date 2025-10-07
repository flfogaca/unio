import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { DetalhesProximaConsulta } from './DetalhesProximaConsulta'
import { useQueueStore } from '@/stores/queue'
import { useAuthStore } from '@/stores/auth'
import { useState, useEffect } from 'react'
import { 
  Video, 
  Clock, 
  User, 
  Calendar, 
  MessageSquare, 
  FileText, 
  Activity,
  Users,
  CheckCircle,
  AlertTriangle,
  MoreVertical,
  Eye,
  Star,
  Timer,
  Stethoscope
} from 'lucide-react'

export function ConsultasAtivas() {
  const { items, fetchQueue, assumeConsulta } = useQueueStore()
  const { user } = useAuthStore()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [showDetalhes, setShowDetalhes] = useState(false)
  const [consultaSelecionada, setConsultaSelecionada] = useState<any>(null)

  // Buscar dados do backend ao montar o componente
  useEffect(() => {
    fetchQueue()
  }, [fetchQueue])

  // Atualizar tempo periodicamente
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000) // Atualiza a cada segundo
    
    return () => clearInterval(interval)
  }, [])

  // Filtrar consultas do dentista logado
  const minhasConsultasAtivas = items.filter(item => 
    item.status === 'em-atendimento' && item.dentistaId === user?.id
  )

  const consultasFinalizadasHoje = items.filter(item => 
    item.status === 'finalizado' && 
    item.dentistaId === user?.id &&
    new Date(item.criadoEm).toDateString() === new Date().toDateString()
  )

  const tempoTotalHoje = consultasFinalizadasHoje.reduce((acc) => {
    // Simular duração de consulta (15-45 min)
    return acc + (Math.random() * 30 + 15)
  }, 0)

  const proximaConsulta = items.find(item => 
    item.status === 'em-fila' && 
    // Simular que a próxima consulta seria para este dentista
    Math.random() > 0.5
  )

  const stats = [
    {
      title: 'Consultas Ativas',
      value: minhasConsultasAtivas.length,
      change: minhasConsultasAtivas.length > 0 ? 'Em andamento' : 'Nenhuma ativa',
      changeType: minhasConsultasAtivas.length > 0 ? 'positive' : 'neutral',
      icon: Video,
      color: 'bg-accent'
    },
    {
      title: 'Finalizadas Hoje',
      value: consultasFinalizadasHoje.length,
      change: '+2 desde ontem',
      changeType: 'positive',
      icon: CheckCircle,
      color: 'bg-green-500'
    },
    {
      title: 'Tempo Total Hoje',
      value: `${Math.round(tempoTotalHoje)}min`,
      change: 'Meta: 480min',
      changeType: 'neutral',
      icon: Clock,
      color: 'bg-blue-500'
    },
    {
      title: 'Próxima Consulta',
      value: proximaConsulta ? '5min' : '---',
      change: proximaConsulta ? 'Estimativa' : 'Nenhuma agendada',
      changeType: proximaConsulta ? 'positive' : 'neutral',
      icon: Calendar,
      color: 'bg-purple-500'
    }
  ]

  const handleNavigateToConsulta = (consultaId: string) => {
    window.location.hash = `/dentista/consulta/${consultaId}`
  }

  const handleNavigateToFila = () => {
    window.location.hash = '/dentista'
  }

  const handleVerDetalhes = (consulta: any) => {
    setConsultaSelecionada(consulta)
    setShowDetalhes(true)
  }

  const handleAssumeConsulta = (consultaId: string) => {
    if (user?.id) {
      assumeConsulta(consultaId, user.id)
      setShowDetalhes(false)
      // Redirecionar para a consulta
      window.location.hash = `/dentista/consulta/${consultaId}`
    }
  }

  const getDurationString = (startTime: Date) => {
    const diff = Math.floor((currentTime.getTime() - startTime.getTime()) / 1000)
    const minutes = Math.floor(diff / 60)
    const seconds = diff % 60
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-primaryDark">Consultas Ativas</h1>
          <p className="text-gray-600 mt-1">
            Gerencie suas consultas em andamento e acompanhe seu desempenho
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">Atualizado às</div>
          <div className="text-primary font-medium">
            {currentTime.toLocaleTimeString('pt-BR', { 
              hour: '2-digit', 
              minute: '2-digit',
              second: '2-digit'
            })}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-primaryDark">{stat.value}</p>
                    <div className="flex items-center mt-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        stat.changeType === 'positive' ? 'bg-green-100 text-green-800' :
                        stat.changeType === 'negative' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {stat.change}
                      </span>
                    </div>
                  </div>
                  <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Consultas em Andamento */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5 text-accent" />
                Consultas em Andamento ({minhasConsultasAtivas.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {minhasConsultasAtivas.length > 0 ? (
                <div className="space-y-4">
                  {minhasConsultasAtivas.map((consulta) => (
                    <div key={consulta.id} className="border border-accent/20 bg-accent/5 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-primaryDark">{consulta.pacienteNome}</h4>
                            <p className="text-sm text-gray-600">{consulta.especialidade}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 bg-red-100 text-red-800 px-2 py-1 rounded-full">
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                            <span className="text-xs font-medium">AO VIVO</span>
                          </div>
                          <StatusBadge status={consulta.status} />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          <Timer className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            Duração: {getDurationString(consulta.criadoEm)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-gray-400" />
                          <span className={`text-sm capitalize ${
                            consulta.prioridade === 'alta' ? 'text-red-600' :
                            consulta.prioridade === 'media' ? 'text-yellow-600' :
                            'text-green-600'
                          }`}>
                            Prioridade {consulta.prioridade}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {consulta.criadoEm.toLocaleTimeString('pt-BR', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                        </div>
                      </div>

                      <p className="text-sm text-gray-700 mb-4">{consulta.descricao}</p>

                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => handleNavigateToConsulta(consulta.id)}
                          className="flex-1"
                        >
                          <Video className="h-3 w-3 mr-2" />
                          Entrar na Consulta
                        </Button>
                        <Button size="sm" variant="secondary">
                          <FileText className="h-3 w-3 mr-2" />
                          Anotações
                        </Button>
                        <Button size="sm" variant="secondary">
                          <MoreVertical className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Video className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-500 mb-2">Nenhuma consulta ativa</h3>
                  <p className="text-gray-400 mb-6">
                    Você não possui consultas em andamento no momento
                  </p>
                  <Button onClick={handleNavigateToFila}>
                    <Users className="h-4 w-4 mr-2" />
                    Ver Fila de Atendimento
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status do Dentista */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Stethoscope className="h-5 w-5 text-accent" />
                Meu Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Status:</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-green-600">Disponível</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Consultas hoje:</span>
                  <span className="text-sm text-gray-600">{consultasFinalizadasHoje.length + minhasConsultasAtivas.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Tempo trabalhado:</span>
                  <span className="text-sm text-gray-600">{Math.round(tempoTotalHoje)}min</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Avaliação média:</span>
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 text-yellow-400 fill-current" />
                    <span className="text-sm text-gray-600">4.8</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Próxima Consulta */}
          {proximaConsulta && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-accent" />
                  Próxima Consulta
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h4 className="font-medium text-primaryDark">{proximaConsulta.pacienteNome}</h4>
                      <p className="text-sm text-gray-600">{proximaConsulta.especialidade}</p>
                    </div>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Estimativa:</strong> 5 minutos
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      {proximaConsulta.descricao}
                    </p>
                  </div>
                  <Button 
                    size="sm" 
                    variant="secondary" 
                    className="w-full"
                    onClick={() => handleVerDetalhes(proximaConsulta)}
                  >
                    <Eye className="h-3 w-3 mr-2" />
                    Ver Detalhes
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Resumo do Dia */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-accent" />
                Resumo do Dia
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Consultas finalizadas:</span>
                  <span className="text-sm font-medium">{consultasFinalizadasHoje.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Em andamento:</span>
                  <span className="text-sm font-medium">{minhasConsultasAtivas.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Tempo médio:</span>
                  <span className="text-sm font-medium">
                    {consultasFinalizadasHoje.length > 0 
                      ? Math.round(tempoTotalHoje / consultasFinalizadasHoje.length) 
                      : 0}min
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Receita estimada:</span>
                  <span className="text-sm font-medium text-green-600">
                    R$ {((consultasFinalizadasHoje.length + minhasConsultasAtivas.length) * 150).toFixed(0)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ações Rápidas */}
          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button size="sm" variant="secondary" className="w-full justify-start" onClick={handleNavigateToFila}>
                  <Users className="h-4 w-4 mr-2" />
                  Ver Fila de Atendimento
                </Button>
                <Button size="sm" variant="secondary" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Relatório do Dia
                </Button>
                <Button size="sm" variant="secondary" className="w-full justify-start">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Mensagens
                </Button>
                <Button size="sm" variant="secondary" className="w-full justify-start">
                  <Calendar className="h-4 w-4 mr-2" />
                  Agenda
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal de Detalhes */}
      {showDetalhes && consultaSelecionada && (
        <DetalhesProximaConsulta
          consulta={consultaSelecionada}
          onClose={() => setShowDetalhes(false)}
          onAssumeConsulta={handleAssumeConsulta}
        />
      )}
    </div>
  )
}