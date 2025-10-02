import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { useQueueStore } from '@/stores/queue'
import { 
  Users, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  TrendingUp,
  Calendar,
  UserCheck,
  Activity
} from 'lucide-react'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js'
import { Doughnut, Bar } from 'react-chartjs-2'

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title)

export function AdminDashboard() {
  const { items } = useQueueStore()

  // Calcular métricas
  const totalConsultas = items.length
  const consultasFinalizadas = items.filter(item => item.status === 'finalizado').length
  const consultasEmAndamento = items.filter(item => item.status === 'em-atendimento').length
  const consultasNaFila = items.filter(item => item.status === 'em-fila').length
  const consultasUrgentes = items.filter(item => item.prioridade === 'alta').length

  // Tempo médio de espera (simulado)
  const tempoMedioEspera = items
    .filter(item => item.status === 'finalizado')
    .reduce((acc, _) => acc + Math.random() * 30 + 5, 0) / (consultasFinalizadas || 1)

  // Taxa de satisfação (simulada)
  const npsScore = 8.4

  const stats = [
    {
      title: 'Total de Consultas',
      value: totalConsultas,
      change: '+12%',
      changeType: 'positive',
      icon: Users,
      color: 'bg-blue-500'
    },
    {
      title: 'Consultas Finalizadas',
      value: consultasFinalizadas,
      change: '+8%',
      changeType: 'positive',
      icon: CheckCircle,
      color: 'bg-green-500'
    },
    {
      title: 'Tempo Médio (min)',
      value: Math.round(tempoMedioEspera),
      change: '-3min',
      changeType: 'positive',
      icon: Clock,
      color: 'bg-yellow-500'
    },
    {
      title: 'NPS Score',
      value: npsScore.toFixed(1),
      change: '+0.2',
      changeType: 'positive',
      icon: TrendingUp,
      color: 'bg-purple-500'
    },
    {
      title: 'Consultas Urgentes',
      value: consultasUrgentes,
      change: consultasUrgentes > 5 ? 'Alto' : 'Normal',
      changeType: consultasUrgentes > 5 ? 'negative' : 'neutral',
      icon: AlertTriangle,
      color: 'bg-red-500'
    },
    {
      title: 'Dentistas Online',
      value: 3,
      change: 'de 5 total',
      changeType: 'neutral',
      icon: UserCheck,
      color: 'bg-accent'
    }
  ]

  // Dados para gráficos
  const statusData = {
    labels: ['Finalizadas', 'Em Andamento', 'Na Fila'],
    datasets: [{
      data: [consultasFinalizadas, consultasEmAndamento, consultasNaFila],
      backgroundColor: ['#10B981', '#F59E0B', '#3B82F6'],
      borderWidth: 0
    }]
  }

  const dailyData = {
    labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
    datasets: [{
      label: 'Consultas por Dia',
      data: [12, 19, 15, 25, 22, 8, 5],
      backgroundColor: '#5FE2B6',
      borderColor: '#5FE2B6',
      borderWidth: 1
    }]
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
  }

  const barOptions = {
    ...chartOptions,
    plugins: {
      ...chartOptions.plugins,
      title: {
        display: true,
        text: 'Consultas por Dia da Semana'
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primaryDark">Dashboard Administrativo</h1>
        <p className="text-gray-600 mt-1">
          Visão geral das operações e métricas do sistema
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-primaryDark mt-1">{stat.value}</p>
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
                  <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center ml-4`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status das Consultas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-accent" />
              Status das Consultas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <Doughnut data={statusData} options={chartOptions} />
            </div>
          </CardContent>
        </Card>

        {/* Consultas por Dia */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-accent" />
              Consultas Semanais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <Bar data={dailyData} options={barOptions} />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Fila Atual */}
        <Card>
          <CardHeader>
            <CardTitle>Fila Atual</CardTitle>
          </CardHeader>
          <CardContent>
            {consultasNaFila > 0 ? (
              <div className="space-y-3">
                {items
                  .filter(item => item.status === 'em-fila')
                  .slice(0, 5)
                  .map((item, index) => (
                    <div key={item.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">{index + 1}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium">{item.pacienteNome}</p>
                          <p className="text-xs text-gray-500">{item.especialidade}</p>
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        item.prioridade === 'alta' ? 'bg-red-100 text-red-800' :
                        item.prioridade === 'media' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {item.prioridade}
                      </span>
                    </div>
                  ))}
                {consultasNaFila > 5 && (
                  <p className="text-xs text-gray-500 text-center pt-2">
                    +{consultasNaFila - 5} mais na fila
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">Nenhum paciente na fila</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Alertas do Sistema */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Alertas do Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {consultasUrgentes > 0 && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    <span className="text-sm font-medium text-red-800">
                      {consultasUrgentes} consulta(s) urgente(s)
                    </span>
                  </div>
                </div>
              )}
              
              {tempoMedioEspera > 20 && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm font-medium text-yellow-800">
                      Tempo de espera elevado
                    </span>
                  </div>
                </div>
              )}

              {consultasNaFila === 0 && consultasEmAndamento === 0 && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium text-green-800">
                      Sistema funcionando normalmente
                    </span>
                  </div>
                </div>
              )}
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
              <button className="w-full p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="font-medium text-sm">Gerenciar Usuários</div>
                <div className="text-xs text-gray-500">Adicionar/remover pacientes e dentistas</div>
              </button>
              <button className="w-full p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="font-medium text-sm">Configurar Fila</div>
                <div className="text-xs text-gray-500">Ajustar regras e prioridades</div>
              </button>
              <button className="w-full p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="font-medium text-sm">Relatórios</div>
                <div className="text-xs text-gray-500">Ver relatórios detalhados</div>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}