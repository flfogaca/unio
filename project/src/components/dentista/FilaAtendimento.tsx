import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { useQueueStore } from '@/stores/queue'
import { useAuthStore } from '@/stores/auth'
import { Clock, User, Stethoscope, AlertTriangle, Users } from 'lucide-react'
import { useState, useEffect } from 'react'

export function FilaAtendimento() {
  const { items, fetchQueue, assumeConsulta } = useQueueStore()
  const { user } = useAuthStore()
  const [currentTime, setCurrentTime] = useState(new Date())

  // Buscar dados do backend ao montar o componente
  useEffect(() => {
    fetchQueue()
  }, [fetchQueue])

  // Atualizar tempo periodicamente
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 30000) // Atualiza a cada 30 segundos
    
    return () => clearInterval(interval)
  }, [])

  // Mapear role para especialidade
  const roleToSpecialtyMap: { [key: string]: string } = {
    'dentista': 'dentista',
    'psicologo': 'psicologo',
    'medico': 'medico_clinico'
  }

  const especialidadeProfissional = user?.role ? roleToSpecialtyMap[user.role] : null

  const filaItems = items
    .filter(item => 
      item.status === 'em-fila' && 
      (!especialidadeProfissional || item.especialidade === especialidadeProfissional)
    )
    .sort((a, b) => {
      // Prioridade alta primeiro
      if (a.prioridade === 'alta' && b.prioridade !== 'alta') return -1
      if (b.prioridade === 'alta' && a.prioridade !== 'alta') return 1
      
      // Depois por ordem de chegada
      return a.criadoEm.getTime() - b.criadoEm.getTime()
    })

  const minhasConsultas = items.filter(item => 
    item.status === 'em-atendimento' && item.dentistaId === user?.id
  )

  const stats = [
    {
      title: 'Total na Fila',
      value: filaItems.length,
      icon: Users,
      color: 'bg-blue-500'
    },
    {
      title: 'Minhas Consultas Ativas',
      value: minhasConsultas.length,
      icon: Stethoscope,
      color: 'bg-accent'
    },
    {
      title: 'Urgentes',
      value: filaItems.filter(item => item.prioridade === 'alta').length,
      icon: AlertTriangle,
      color: 'bg-red-500'
    },
    {
      title: 'Tempo Médio',
      value: '12min',
      icon: Clock,
      color: 'bg-purple-500'
    }
  ]

  const handleAssumeConsulta = (itemId: string) => {
    if (user?.id) {
      assumeConsulta(itemId, user.id)
      // Redirecionar para a consulta
      window.location.hash = `/dentista/consulta/${itemId}`
    }
  }

  const getPriorityColor = (prioridade: string) => {
    switch (prioridade) {
      case 'alta': return 'border-l-red-500 bg-red-50'
      case 'media': return 'border-l-yellow-500 bg-yellow-50'
      case 'baixa': return 'border-l-green-500 bg-green-50'
      default: return 'border-l-gray-500 bg-gray-50'
    }
  }

  const getTempoEspera = (criadoEm: Date) => {
    const diff = Math.floor((currentTime.getTime() - criadoEm.getTime()) / (1000 * 60))
    if (diff < 60) return `${diff}min`
    const hours = Math.floor(diff / 60)
    const minutes = diff % 60
    return `${hours}h ${minutes}min`
  }

  const handleNavigateToConsulta = (consultaId: string) => {
    window.location.hash = `/dentista/consulta/${consultaId}`
  }

  const handleNavigateToPerfil = () => {
    window.location.hash = '/dentista/perfil'
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-primaryDark">Fila de Atendimento</h1>
          <p className="text-gray-600 mt-1">
            Gerencie a fila de pacientes aguardando atendimento
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">Atualizado às</div>
          <div className="text-primary font-medium">
            {currentTime.toLocaleTimeString('pt-BR', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>
        </div>
      </div>

      {/* Stats */}
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
        {/* Fila Principal */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-accent" />
                Fila de Pacientes ({filaItems.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filaItems.length > 0 ? (
                <div className="space-y-4">
                  {filaItems.map((item, index) => (
                    <div 
                      key={item.id} 
                      className={`border-l-4 p-4 rounded-lg ${getPriorityColor(item.prioridade)}`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                              <span className="text-white text-sm font-bold">{index + 1}</span>
                            </div>
                            <div>
                              <h3 className="font-semibold text-primaryDark">{item.pacienteNome}</h3>
                              <p className="text-sm text-gray-600">{item.especialidade}</p>
                            </div>
                          </div>
                          
                          <p className="text-sm text-gray-700 mb-3">{item.descricao}</p>
                          
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Aguardando {getTempoEspera(item.criadoEm)}
                            </span>
                            <span className="capitalize">
                              Prioridade {item.prioridade}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-end gap-2">
                          <StatusBadge status={item.status} />
                          <Button 
                            size="sm"
                            onClick={() => handleAssumeConsulta(item.id)}
                            className="whitespace-nowrap"
                          >
                            Assumir Consulta
                          </Button>
                        </div>
                      </div>
                      
                      {item.imagem && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <p className="text-xs text-gray-500 mb-2">Imagem anexada:</p>
                          <img 
                            src={item.imagem} 
                            alt="Anexo do paciente" 
                            className="w-20 h-20 object-cover rounded border"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-500 mb-2">Nenhum paciente na fila</h3>
                  <p className="text-gray-400">Novos pacientes aparecerão aqui automaticamente</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Consultas Ativas */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Stethoscope className="h-5 w-5 text-accent" />
                Minhas Consultas Ativas
              </CardTitle>
            </CardHeader>
            <CardContent>
              {minhasConsultas.length > 0 ? (
                <div className="space-y-3">
                  {minhasConsultas.map((consulta) => (
                    <div key={consulta.id} className="p-3 bg-accent/5 border border-accent/20 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-primaryDark">{consulta.pacienteNome}</h4>
                        <StatusBadge status={consulta.status} />
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{consulta.especialidade}</p>
                      <Button 
                        size="sm" 
                        className="w-full"
                        onClick={() => handleNavigateToConsulta(consulta.id)}
                      >
                        Continuar Consulta
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Stethoscope className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-sm">Nenhuma consulta ativa</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Status do Dentista */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-accent" />
                Meu Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Status:</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-green-600">Online</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Especialidades:</span>
                  <div className="text-right">
                    {user?.especialidades?.map((esp, index) => (
                      <div key={index} className="text-xs text-gray-600">{esp}</div>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">CRO:</span>
                  <span className="text-sm text-gray-600">{user?.cro}</span>
                </div>
                <Button 
                  variant="secondary" 
                  size="sm" 
                  className="w-full"
                  onClick={handleNavigateToPerfil}
                >
                  Editar Perfil
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}