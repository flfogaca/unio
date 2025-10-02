import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useState } from 'react'
import { 
  BarChart3, 
  Download, 
  TrendingUp, 
  Users, 
  Star, 
  DollarSign, 
  Activity, 
  FileText, 
  RefreshCw, 
  Eye, 
  ArrowLeft,
  PieChart,
  LineChart,
  Target,
  Zap,
  AlertTriangle,
  CheckCircle,
  Timer,
  Stethoscope,
  Plus,
  Settings
} from 'lucide-react'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, LineElement, PointElement } from 'chart.js'
import { Doughnut, Bar, Line } from 'react-chartjs-2'

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, LineElement, PointElement)

interface RelatoriosProps {
  onBack?: () => void
}

export function Relatorios({ onBack }: RelatoriosProps) {
  const [activeTab, setActiveTab] = useState('visao-geral')
  const [dateRange, setDateRange] = useState('30-dias')

  // Mock de dados para relatórios
  const relatoriosData = {
    visaoGeral: {
      totalConsultas: 1247,
      consultasFinalizadas: 1189,
      tempoMedioEspera: 18,
      satisfacaoMedia: 4.7,
      receita: 187350,
      crescimento: 12.5
    },
    consultasPorDia: {
      labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
      datasets: [{
        label: 'Consultas',
        data: [45, 52, 48, 61, 55, 23, 12],
        backgroundColor: '#5FE2B6',
        borderColor: '#5FE2B6',
        borderWidth: 1
      }]
    },
    especialidades: {
      labels: ['Clínica Geral', 'Ortodontia', 'Endodontia', 'Periodontia', 'Cirurgia'],
      datasets: [{
        data: [35, 25, 20, 12, 8],
        backgroundColor: ['#3B82F6', '#8B5CF6', '#EF4444', '#10B981', '#F59E0B'],
        borderWidth: 0
      }]
    },
    satisfacao: {
      labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
      datasets: [{
        label: 'Satisfação Média',
        data: [4.2, 4.3, 4.5, 4.6, 4.7, 4.7],
        borderColor: '#5FE2B6',
        backgroundColor: 'rgba(95, 226, 182, 0.1)',
        tension: 0.4,
        fill: true
      }]
    }
  }

  const tabs = [
    { id: 'visao-geral', label: 'Visão Geral', icon: BarChart3 },
    { id: 'operacional', label: 'Operacional', icon: Activity },
    { id: 'financeiro', label: 'Financeiro', icon: DollarSign },
    { id: 'qualidade', label: 'Qualidade', icon: Star },
    { id: 'customizados', label: 'Customizados', icon: Settings }
  ]

  const relatoriosDisponiveis = [
    {
      id: 'consultas-mes',
      titulo: 'Consultas por Mês',
      descricao: 'Análise detalhada das consultas realizadas mensalmente',
      categoria: 'operacional',
      formato: ['PDF', 'Excel', 'CSV'],
      ultimaAtualizacao: '2 horas atrás',
      tamanho: '2.3 MB',
      downloads: 45
    },
    {
      id: 'satisfacao-pacientes',
      titulo: 'Satisfação dos Pacientes',
      descricao: 'Relatório de avaliações e feedback dos pacientes',
      categoria: 'qualidade',
      formato: ['PDF', 'PowerPoint'],
      ultimaAtualizacao: '1 dia atrás',
      tamanho: '1.8 MB',
      downloads: 23
    },
    {
      id: 'receita-especialidade',
      titulo: 'Receita por Especialidade',
      descricao: 'Análise financeira segmentada por área de atuação',
      categoria: 'financeiro',
      formato: ['Excel', 'PDF'],
      ultimaAtualizacao: '3 horas atrás',
      tamanho: '1.2 MB',
      downloads: 67
    },
    {
      id: 'performance-dentistas',
      titulo: 'Performance dos Dentistas',
      descricao: 'Métricas individuais de produtividade e qualidade',
      categoria: 'operacional',
      formato: ['PDF', 'Excel'],
      ultimaAtualizacao: '5 horas atrás',
      tamanho: '3.1 MB',
      downloads: 34
    },
    {
      id: 'tempo-espera',
      titulo: 'Análise de Tempo de Espera',
      descricao: 'Estudo detalhado dos tempos de fila e atendimento',
      categoria: 'operacional',
      formato: ['PDF', 'CSV'],
      ultimaAtualizacao: '1 hora atrás',
      tamanho: '890 KB',
      downloads: 56
    },
    {
      id: 'cancelamentos',
      titulo: 'Relatório de Cancelamentos',
      descricao: 'Análise de padrões e motivos de cancelamento',
      categoria: 'operacional',
      formato: ['Excel', 'PDF'],
      ultimaAtualizacao: '4 horas atrás',
      tamanho: '1.5 MB',
      downloads: 28
    }
  ]

  const kpis = [
    {
      titulo: 'Total de Consultas',
      valor: relatoriosData.visaoGeral.totalConsultas,
      variacao: '+12%',
      tipo: 'positivo',
      icon: Users,
      cor: 'bg-blue-500'
    },
    {
      titulo: 'Taxa de Conclusão',
      valor: `${Math.round((relatoriosData.visaoGeral.consultasFinalizadas / relatoriosData.visaoGeral.totalConsultas) * 100)}%`,
      variacao: '+3%',
      tipo: 'positivo',
      icon: CheckCircle,
      cor: 'bg-green-500'
    },
    {
      titulo: 'Tempo Médio de Espera',
      valor: `${relatoriosData.visaoGeral.tempoMedioEspera}min`,
      variacao: '-5min',
      tipo: 'positivo',
      icon: Timer,
      cor: 'bg-yellow-500'
    },
    {
      titulo: 'Satisfação Média',
      valor: relatoriosData.visaoGeral.satisfacaoMedia,
      variacao: '+0.2',
      tipo: 'positivo',
      icon: Star,
      cor: 'bg-purple-500'
    },
    {
      titulo: 'Receita Total',
      valor: `R$ ${(relatoriosData.visaoGeral.receita / 1000).toFixed(0)}k`,
      variacao: '+15%',
      tipo: 'positivo',
      icon: DollarSign,
      cor: 'bg-accent'
    },
    {
      titulo: 'Crescimento',
      valor: `${relatoriosData.visaoGeral.crescimento}%`,
      variacao: '+2%',
      tipo: 'positivo',
      icon: TrendingUp,
      cor: 'bg-indigo-500'
    }
  ]

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
  }

  const renderVisaoGeralTab = () => (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {kpis.map((kpi) => {
          const Icon = kpi.icon
          return (
            <Card key={kpi.titulo}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{kpi.titulo}</p>
                    <p className="text-2xl font-bold text-primaryDark">{kpi.valor}</p>
                    <div className="flex items-center mt-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        kpi.tipo === 'positivo' ? 'bg-green-100 text-green-800' :
                        kpi.tipo === 'negativo' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {kpi.variacao}
                      </span>
                    </div>
                  </div>
                  <div className={`w-12 h-12 ${kpi.cor} rounded-lg flex items-center justify-center`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-accent" />
              Consultas por Dia da Semana
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <Bar data={relatoriosData.consultasPorDia} options={chartOptions} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-accent" />
              Distribuição por Especialidade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <Doughnut data={relatoriosData.especialidades} options={chartOptions} />
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LineChart className="h-5 w-5 text-accent" />
              Evolução da Satisfação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <Line data={relatoriosData.satisfacao} options={chartOptions} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-accent" />
            Insights Automáticos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
              <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-green-800">Crescimento Positivo</h4>
                <p className="text-sm text-green-700">
                  As consultas aumentaram 12% em relação ao mês anterior, com destaque para Ortodontia (+25%).
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <Timer className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-800">Otimização de Tempo</h4>
                <p className="text-sm text-blue-700">
                  O tempo médio de espera diminuiu 5 minutos após as últimas otimizações na fila.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-800">Atenção Necessária</h4>
                <p className="text-sm text-yellow-700">
                  Quinta-feira apresenta maior volume de consultas. Considere ajustar a equipe.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderOperacionalTab = () => (
    <div className="space-y-6">
      {/* Métricas Operacionais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Users className="h-6 w-6 text-white" />
            </div>
            <h3 className="font-semibold text-primaryDark mb-1">Pacientes Ativos</h3>
            <p className="text-2xl font-bold text-blue-600">892</p>
            <p className="text-xs text-gray-500">+8% este mês</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center mx-auto mb-3">
              <Stethoscope className="h-6 w-6 text-white" />
            </div>
            <h3 className="font-semibold text-primaryDark mb-1">Dentistas Online</h3>
            <p className="text-2xl font-bold text-accent">12</p>
            <p className="text-xs text-gray-500">de 15 total</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Timer className="h-6 w-6 text-white" />
            </div>
            <h3 className="font-semibold text-primaryDark mb-1">Tempo Médio</h3>
            <p className="text-2xl font-bold text-yellow-600">23min</p>
            <p className="text-xs text-gray-500">-2min vs. meta</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Target className="h-6 w-6 text-white" />
            </div>
            <h3 className="font-semibold text-primaryDark mb-1">Taxa de Sucesso</h3>
            <p className="text-2xl font-bold text-green-600">96%</p>
            <p className="text-xs text-gray-500">+1% este mês</p>
          </CardContent>
        </Card>
      </div>

      {/* Performance por Dentista */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Individual dos Dentistas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-3 font-medium text-gray-600">Dentista</th>
                  <th className="text-left p-3 font-medium text-gray-600">Consultas</th>
                  <th className="text-left p-3 font-medium text-gray-600">Tempo Médio</th>
                  <th className="text-left p-3 font-medium text-gray-600">Avaliação</th>
                  <th className="text-left p-3 font-medium text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { nome: 'Dr. João Silva', consultas: 45, tempo: '22min', avaliacao: 4.8, status: 'online' },
                  { nome: 'Dra. Maria Santos', consultas: 38, tempo: '25min', avaliacao: 4.9, status: 'online' },
                  { nome: 'Dr. Carlos Oliveira', consultas: 42, tempo: '20min', avaliacao: 4.7, status: 'ocupado' },
                  { nome: 'Dra. Ana Costa', consultas: 35, tempo: '28min', avaliacao: 4.6, status: 'offline' }
                ].map((dentista, index) => (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-medium">
                            {dentista.nome.split(' ')[1].charAt(0)}
                          </span>
                        </div>
                        <span className="font-medium">{dentista.nome}</span>
                      </div>
                    </td>
                    <td className="p-3">{dentista.consultas}</td>
                    <td className="p-3">{dentista.tempo}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span>{dentista.avaliacao}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        dentista.status === 'online' ? 'bg-green-100 text-green-800' :
                        dentista.status === 'ocupado' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {dentista.status.charAt(0).toUpperCase() + dentista.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Análise de Fila */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Análise da Fila por Horário</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { horario: '08:00 - 10:00', pacientes: 12, tempo: '15min', cor: 'bg-green-500' },
                { horario: '10:00 - 12:00', pacientes: 18, tempo: '22min', cor: 'bg-yellow-500' },
                { horario: '14:00 - 16:00', pacientes: 25, tempo: '28min', cor: 'bg-red-500' },
                { horario: '16:00 - 18:00', pacientes: 15, tempo: '18min', cor: 'bg-blue-500' }
              ].map((periodo, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 ${periodo.cor} rounded-full`}></div>
                    <span className="font-medium">{periodo.horario}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{periodo.pacientes} pacientes</p>
                    <p className="text-sm text-gray-600">{periodo.tempo} médio</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Motivos de Cancelamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { motivo: 'Conflito de horário', quantidade: 15, porcentagem: 35 },
                { motivo: 'Problema de saúde', quantidade: 8, porcentagem: 19 },
                { motivo: 'Emergência pessoal', quantidade: 7, porcentagem: 16 },
                { motivo: 'Tempo de espera', quantidade: 6, porcentagem: 14 },
                { motivo: 'Outros', quantidade: 7, porcentagem: 16 }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm">{item.motivo}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-accent h-2 rounded-full" 
                        style={{ width: `${item.porcentagem}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium w-8">{item.quantidade}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const renderCustomizadosTab = () => (
    <div className="space-y-6">
      {/* Relatórios Disponíveis */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {relatoriosDisponiveis.map((relatorio) => (
          <Card key={relatorio.id} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-primaryDark mb-2">{relatorio.titulo}</h3>
                  <p className="text-sm text-gray-600 mb-3">{relatorio.descricao}</p>
                  
                  <div className="flex flex-wrap gap-1 mb-3">
                    {relatorio.formato.map((formato, index) => (
                      <span key={index} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                        {formato}
                      </span>
                    ))}
                  </div>
                  
                  <div className="text-xs text-gray-500 space-y-1">
                    <p>Atualizado: {relatorio.ultimaAtualizacao}</p>
                    <p>Tamanho: {relatorio.tamanho} • {relatorio.downloads} downloads</p>
                  </div>
                </div>
                
                <div className="flex flex-col gap-2 ml-4">
                  <Button size="sm">
                    <Download className="h-3 w-3 mr-1" />
                    Baixar
                  </Button>
                  <Button size="sm" variant="secondary">
                    <Eye className="h-3 w-3 mr-1" />
                    Visualizar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Criar Novo Relatório */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-accent" />
            Criar Relatório Personalizado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nome do Relatório</label>
              <input
                type="text"
                placeholder="Ex: Análise Mensal de Performance"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
              <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent">
                <option value="">Selecione uma categoria</option>
                <option value="operacional">Operacional</option>
                <option value="financeiro">Financeiro</option>
                <option value="qualidade">Qualidade</option>
                <option value="customizado">Customizado</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Período</label>
              <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent">
                <option value="7-dias">Últimos 7 dias</option>
                <option value="30-dias">Últimos 30 dias</option>
                <option value="3-meses">Últimos 3 meses</option>
                <option value="6-meses">Últimos 6 meses</option>
                <option value="1-ano">Último ano</option>
                <option value="customizado">Período customizado</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Formato de Saída</label>
              <div className="flex gap-2">
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked className="rounded border-gray-300 text-accent focus:ring-accent" />
                  <span className="text-sm">PDF</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded border-gray-300 text-accent focus:ring-accent" />
                  <span className="text-sm">Excel</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded border-gray-300 text-accent focus:ring-accent" />
                  <span className="text-sm">CSV</span>
                </label>
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Métricas a Incluir</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                'Total de Consultas',
                'Tempo de Espera',
                'Satisfação do Cliente',
                'Receita Gerada',
                'Taxa de Cancelamento',
                'Performance por Dentista',
                'Distribuição por Especialidade',
                'Horários de Pico'
              ].map((metrica, index) => (
                <label key={index} className="flex items-center gap-2">
                  <input type="checkbox" className="rounded border-gray-300 text-accent focus:ring-accent" />
                  <span className="text-sm">{metrica}</span>
                </label>
              ))}
            </div>
          </div>
          
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="secondary">
              Salvar como Template
            </Button>
            <Button>
              <FileText className="h-4 w-4 mr-2" />
              Gerar Relatório
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Agendamento Automático */}
      <Card>
        <CardHeader>
          <CardTitle>Relatórios Agendados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { nome: 'Relatório Semanal de Operações', frequencia: 'Toda segunda-feira', proximo: '25/01/2024', ativo: true },
              { nome: 'Análise Mensal Financeira', frequencia: 'Todo dia 1º do mês', proximo: '01/02/2024', ativo: true },
              { nome: 'Satisfação Trimestral', frequencia: 'A cada 3 meses', proximo: '01/04/2024', ativo: false }
            ].map((agendamento, index) => (
              <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h4 className="font-medium text-primaryDark">{agendamento.nome}</h4>
                  <p className="text-sm text-gray-600">{agendamento.frequencia}</p>
                  <p className="text-xs text-gray-500">Próximo: {agendamento.proximo}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    agendamento.ativo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {agendamento.ativo ? 'Ativo' : 'Pausado'}
                  </span>
                  <Button size="sm" variant="secondary">
                    <Settings className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
            
            <Button variant="secondary" className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Agendar Novo Relatório
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case 'visao-geral':
        return renderVisaoGeralTab()
      case 'operacional':
        return renderOperacionalTab()
      case 'financeiro':
        return <div className="text-center py-12 text-gray-500">Relatórios financeiros em desenvolvimento</div>
      case 'qualidade':
        return <div className="text-center py-12 text-gray-500">Relatórios de qualidade em desenvolvimento</div>
      case 'customizados':
        return renderCustomizadosTab()
      default:
        return renderVisaoGeralTab()
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {onBack && (
            <Button variant="secondary" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          )}
          <div>
            <h1 className="text-3xl font-bold text-primaryDark">Relatórios</h1>
            <p className="text-gray-600 mt-1">
              Análises detalhadas e insights sobre o desempenho da plataforma
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
          >
            <option value="7-dias">Últimos 7 dias</option>
            <option value="30-dias">Últimos 30 dias</option>
            <option value="3-meses">Últimos 3 meses</option>
            <option value="6-meses">Últimos 6 meses</option>
          </select>
          <Button variant="secondary">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Exportar Tudo
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-accent text-accent'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {renderTabContent()}
    </div>
  )
}