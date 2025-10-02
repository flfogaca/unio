import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { DetalhesConsulta } from './DetalhesConsulta'
import { useState } from 'react'
import { 
  Calendar, 
  Clock, 
  User, 
  FileText, 
  Download, 
  Star,
  Filter,
  Search,
  ChevronDown,
  Eye,
  MessageSquare,
  ArrowRight
} from 'lucide-react'

export function HistoricoConsultas() {
  const [filtroStatus, setFiltroStatus] = useState<string>('todos')
  const [filtroEspecialidade, setFiltroEspecialidade] = useState<string>('todas')
  const [busca, setBusca] = useState('')
  const [showFiltros, setShowFiltros] = useState(false)
  const [consultaSelecionada, setConsultaSelecionada] = useState<string | null>(null)

  // Se uma consulta está selecionada, mostrar os detalhes
  if (consultaSelecionada) {
    return (
      <DetalhesConsulta 
        consultaId={consultaSelecionada}
        onBack={() => setConsultaSelecionada(null)}
      />
    )
  }

  // Mock de dados mais completos para o histórico
  const consultasHistorico = [
    {
      id: 'h1',
      data: new Date('2024-01-15'),
      dentista: 'Dr. João Silva',
      especialidade: 'Clínica Geral',
      status: 'finalizado' as const,
      duracao: '25 min',
      descricao: 'Consulta de rotina - limpeza e avaliação geral',
      avaliacao: 5,
      prescricao: true,
      receita: 'Prescrição de analgésico para sensibilidade',
      observacoes: 'Paciente apresentou leve sensibilidade. Recomendado uso de pasta específica.',
      proximaConsulta: new Date('2024-04-15'),
      arquivos: ['receita_15012024.pdf', 'exame_panoramico.jpg'],
      valor: 430.00
    },
    {
      id: 'h2',
      data: new Date('2024-01-08'),
      dentista: 'Dra. Maria Santos',
      especialidade: 'Ortodontia',
      status: 'finalizado' as const,
      duracao: '30 min',
      descricao: 'Avaliação para aparelho ortodôntico',
      avaliacao: 4,
      prescricao: false,
      receita: null,
      observacoes: 'Necessário aparelho fixo. Orçamento enviado por email.',
      proximaConsulta: new Date('2024-02-08'),
      arquivos: ['orcamento_ortodontia.pdf', 'moldagem_digital.stl'],
      valor: 180.00
    },
    {
      id: 'h3',
      data: new Date('2023-12-20'),
      dentista: 'Dr. Carlos Oliveira',
      especialidade: 'Endodontia',
      status: 'finalizado' as const,
      duracao: '45 min',
      descricao: 'Tratamento de canal - dente 16',
      avaliacao: 5,
      prescricao: true,
      receita: 'Antibiótico e anti-inflamatório pós-procedimento',
      observacoes: 'Tratamento realizado com sucesso. Retorno em 7 dias para avaliação.',
      proximaConsulta: new Date('2023-12-27'),
      arquivos: ['receita_20122023.pdf', 'raio_x_pos_tratamento.jpg'],
      valor: 650.00
    },
    {
      id: 'h4',
      data: new Date('2023-11-10'),
      dentista: 'Dra. Ana Costa',
      especialidade: 'Periodontia',
      status: 'finalizado' as const,
      duracao: '35 min',
      descricao: 'Tratamento de gengivite',
      avaliacao: 4,
      prescricao: true,
      receita: 'Enxaguante bucal específico e orientações de higiene',
      observacoes: 'Melhora significativa da inflamação. Continuar cuidados em casa.',
      proximaConsulta: null,
      arquivos: ['orientacoes_higiene.pdf'],
      valor: 220.00
    },
    {
      id: 'h5',
      data: new Date('2023-10-05'),
      dentista: 'Dr. Pedro Lima',
      especialidade: 'Cirurgia Oral',
      status: 'finalizado' as const,
      duracao: '20 min',
      descricao: 'Extração de dente do siso',
      avaliacao: 3,
      prescricao: true,
      receita: 'Analgésico e anti-inflamatório pós-cirúrgico',
      observacoes: 'Procedimento sem complicações. Repouso recomendado por 48h.',
      proximaConsulta: new Date('2023-10-12'),
      arquivos: ['receita_05102023.pdf', 'orientacoes_pos_cirurgia.pdf'],
      valor: 380.00
    }
  ]

  // Filtrar consultas
  const consultasFiltradas = consultasHistorico.filter(consulta => {
    const matchStatus = filtroStatus === 'todos' || consulta.status === filtroStatus
    const matchEspecialidade = filtroEspecialidade === 'todas' || consulta.especialidade === filtroEspecialidade
    const matchBusca = busca === '' || 
      consulta.dentista.toLowerCase().includes(busca.toLowerCase()) ||
      consulta.especialidade.toLowerCase().includes(busca.toLowerCase()) ||
      consulta.descricao.toLowerCase().includes(busca.toLowerCase())
    
    return matchStatus && matchEspecialidade && matchBusca
  })

  const especialidades = [...new Set(consultasHistorico.map(c => c.especialidade))]

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
      />
    ))
  }

  const handleNavigateToSolicitar = () => {
    window.location.hash = '/paciente/solicitar'
  }

  const handleVerDetalhes = (consultaId: string) => {
    setConsultaSelecionada(consultaId)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-primaryDark">Histórico de Consultas</h1>
          <p className="text-gray-600 mt-1">
            Visualize todas as suas consultas realizadas e documentos
          </p>
        </div>
        <Button onClick={handleNavigateToSolicitar}>
          <MessageSquare className="h-4 w-4 mr-2" />
          Nova Consulta
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Consultas</p>
                <p className="text-2xl font-bold text-primaryDark">{consultasHistorico.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                <Calendar className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avaliação Média</p>
                <p className="text-2xl font-bold text-primaryDark">
                  {(consultasHistorico.reduce((acc, c) => acc + c.avaliacao, 0) / consultasHistorico.length).toFixed(1)}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center">
                <Star className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tempo Total</p>
                <p className="text-2xl font-bold text-primaryDark">
                  {consultasHistorico.reduce((acc, c) => acc + parseInt(c.duracao), 0)}min
                </p>
              </div>
              <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Valor Total</p>
                <p className="text-2xl font-bold text-primaryDark">
                  R$ {consultasHistorico.reduce((acc, c) => acc + c.valor, 0).toFixed(0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros e Busca */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Busca */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Buscar por dentista, especialidade ou descrição..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-accent focus:border-transparent"
                />
              </div>
            </div>

            {/* Botão Filtros */}
            <Button 
              variant="secondary" 
              onClick={() => setShowFiltros(!showFiltros)}
              className="lg:w-auto"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filtros
              <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${showFiltros ? 'rotate-180' : ''}`} />
            </Button>
          </div>

          {/* Filtros Expandidos */}
          {showFiltros && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={filtroStatus}
                    onChange={(e) => setFiltroStatus(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-accent focus:border-transparent"
                  >
                    <option value="todos">Todos os status</option>
                    <option value="finalizado">Finalizado</option>
                    <option value="em-atendimento">Em Atendimento</option>
                    <option value="em-fila">Em Fila</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Especialidade</label>
                  <select
                    value={filtroEspecialidade}
                    onChange={(e) => setFiltroEspecialidade(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-accent focus:border-transparent"
                  >
                    <option value="todas">Todas as especialidades</option>
                    {especialidades.map(esp => (
                      <option key={esp} value={esp}>{esp}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lista de Consultas */}
      <div className="space-y-4">
        {consultasFiltradas.length > 0 ? (
          consultasFiltradas.map((consulta) => (
            <Card key={consulta.id} className="hover:shadow-lg transition-shadow cursor-pointer group">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Informações Principais */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-primaryDark mb-1 group-hover:text-accent transition-colors">
                          {consulta.especialidade}
                        </h3>
                        <p className="text-gray-600 text-sm">{consulta.descricao}</p>
                      </div>
                      <StatusBadge status={consulta.status} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {consulta.data.toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{consulta.dentista}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{consulta.duracao}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">R$ {consulta.valor.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Avaliação */}
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-sm text-gray-600">Avaliação:</span>
                      <div className="flex gap-1">
                        {renderStars(consulta.avaliacao)}
                      </div>
                      <span className="text-sm text-gray-500">({consulta.avaliacao}/5)</span>
                    </div>

                    {/* Próxima Consulta */}
                    {consulta.proximaConsulta && (
                      <div className="bg-accent/5 p-3 rounded-lg mb-4">
                        <p className="text-sm text-accent">
                          <strong>Próxima consulta:</strong> {consulta.proximaConsulta.toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Ações */}
                  <div className="lg:w-48 flex flex-col justify-between">
                    <div className="space-y-2">
                      <Button 
                        size="sm" 
                        className="w-full"
                        onClick={() => handleVerDetalhes(consulta.id)}
                      >
                        <Eye className="h-3 w-3 mr-2" />
                        Ver Detalhes
                        <ArrowRight className="h-3 w-3 ml-2" />
                      </Button>
                      
                      <Button size="sm" variant="secondary" className="w-full">
                        <Download className="h-3 w-3 mr-2" />
                        Baixar Docs
                      </Button>
                      
                      <Button size="sm" variant="secondary" className="w-full">
                        <MessageSquare className="h-3 w-3 mr-2" />
                        Repetir Consulta
                      </Button>
                    </div>

                    {/* Documentos */}
                    {consulta.arquivos.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-xs text-gray-500 mb-2">
                          {consulta.arquivos.length} documento(s)
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {consulta.arquivos.slice(0, 3).map((arquivo, index) => (
                            <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                              {arquivo.split('.').pop()?.toUpperCase()}
                            </span>
                          ))}
                          {consulta.arquivos.length > 3 && (
                            <span className="text-xs text-gray-500">
                              +{consulta.arquivos.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-500 mb-2">
                Nenhuma consulta encontrada
              </h3>
              <p className="text-gray-400 mb-6">
                {busca || filtroStatus !== 'todos' || filtroEspecialidade !== 'todas'
                  ? 'Tente ajustar os filtros de busca'
                  : 'Você ainda não realizou nenhuma consulta'
                }
              </p>
              <Button onClick={handleNavigateToSolicitar}>
                <MessageSquare className="h-4 w-4 mr-2" />
                Solicitar Primeira Consulta
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}