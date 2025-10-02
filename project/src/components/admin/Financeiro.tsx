import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useState } from 'react'
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  CreditCard, 
  Receipt, 
  PieChart, 
  BarChart3, 
  Download, 
  Filter, 
  Search, 
  Eye, 
  Edit, 
  MoreVertical, 
  ArrowLeft,
  Wallet,
  Target,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  FileText,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Banknote,
  Building,
  Calculator,
  Settings,
  Bell,
  Zap,
  Activity,
  Lightbulb
} from 'lucide-react'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, LineElement, PointElement } from 'chart.js'
import { Doughnut, Line } from 'react-chartjs-2'

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, LineElement, PointElement)

interface FinanceiroProps {
  onBack?: () => void
}

export function Financeiro({ onBack }: FinanceiroProps) {
  const [activeTab, setActiveTab] = useState('visao-geral')
  const [dateRange, setDateRange] = useState('30-dias')

  // Mock de dados financeiros
  const dadosFinanceiros = {
    resumo: {
      receitaTotal: 187350.00,
      receitaMes: 45280.00,
      crescimentoMensal: 12.5,
      consultasFinalizadas: 1189,
      ticketMedio: 157.50,
      receitaPorDentista: 15612.50,
      margemLucro: 68.5,
      custoOperacional: 58920.00
    },
    transacoes: [
      {
        id: 'TXN001',
        tipo: 'receita',
        descricao: 'Consulta - Dr. João Silva',
        paciente: 'Maria Santos',
        valor: 180.00,
        data: new Date('2024-01-20T14:30:00'),
        status: 'aprovado',
        metodo: 'cartao_credito',
        especialidade: 'Clínica Geral'
      },
      {
        id: 'TXN002',
        tipo: 'receita',
        descricao: 'Tratamento Ortodôntico - Dra. Maria Santos',
        paciente: 'Carlos Oliveira',
        valor: 450.00,
        data: new Date('2024-01-20T16:15:00'),
        status: 'aprovado',
        metodo: 'pix',
        especialidade: 'Ortodontia'
      },
      {
        id: 'TXN003',
        tipo: 'despesa',
        descricao: 'Licença Software - Sistema de Gestão',
        fornecedor: 'TechSoft Solutions',
        valor: -299.00,
        data: new Date('2024-01-20T10:00:00'),
        status: 'pago',
        metodo: 'transferencia',
        categoria: 'Software'
      },
      {
        id: 'TXN004',
        tipo: 'receita',
        descricao: 'Endodontia - Dr. Carlos Oliveira',
        paciente: 'Ana Costa',
        valor: 650.00,
        data: new Date('2024-01-19T15:45:00'),
        status: 'pendente',
        metodo: 'boleto',
        especialidade: 'Endodontia'
      },
      {
        id: 'TXN005',
        tipo: 'despesa',
        descricao: 'Comissão Plataforma de Pagamento',
        fornecedor: 'PaymentGateway',
        valor: -89.50,
        data: new Date('2024-01-19T23:59:00'),
        status: 'pago',
        metodo: 'debito_automatico',
        categoria: 'Taxas'
      }
    ],
    receitaPorEspecialidade: {
      labels: ['Clínica Geral', 'Ortodontia', 'Endodontia', 'Periodontia', 'Cirurgia Oral', 'Implantodontia'],
      datasets: [{
        data: [45280, 38950, 32100, 28400, 24200, 18420],
        backgroundColor: ['#3B82F6', '#8B5CF6', '#EF4444', '#10B981', '#F59E0B', '#6366F1'],
        borderWidth: 0
      }]
    },
    receitaMensal: {
      labels: ['Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez', 'Jan'],
      datasets: [{
        label: 'Receita',
        data: [38200, 42100, 39800, 44500, 41200, 47800, 45280],
        borderColor: '#5FE2B6',
        backgroundColor: 'rgba(95, 226, 182, 0.1)',
        tension: 0.4,
        fill: true
      }, {
        label: 'Despesas',
        data: [12800, 14200, 13500, 15100, 14800, 16200, 15900],
        borderColor: '#EF4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
        fill: true
      }]
    },
    metodosPagamento: {
      labels: ['Cartão de Crédito', 'PIX', 'Boleto', 'Cartão de Débito', 'Transferência'],
      datasets: [{
        data: [42, 28, 15, 10, 5],
        backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444'],
        borderWidth: 0
      }]
    }
  }

  const tabs = [
    { id: 'visao-geral', label: 'Visão Geral', icon: BarChart3 },
    { id: 'transacoes', label: 'Transações', icon: Receipt },
    { id: 'receitas', label: 'Receitas', icon: TrendingUp },
    { id: 'despesas', label: 'Despesas', icon: TrendingDown },
    { id: 'relatorios', label: 'Relatórios', icon: FileText },
    { id: 'configuracoes', label: 'Configurações', icon: Settings }
  ]

  const kpis = [
    {
      titulo: 'Receita Total',
      valor: `R$ ${(dadosFinanceiros.resumo.receitaTotal / 1000).toFixed(0)}k`,
      variacao: `+${dadosFinanceiros.resumo.crescimentoMensal}%`,
      tipo: 'positivo',
      icon: DollarSign,
      cor: 'bg-green-500',
      descricao: 'Últimos 30 dias'
    },
    {
      titulo: 'Receita do Mês',
      valor: `R$ ${(dadosFinanceiros.resumo.receitaMes / 1000).toFixed(1)}k`,
      variacao: '+8.2%',
      tipo: 'positivo',
      icon: TrendingUp,
      cor: 'bg-accent',
      descricao: 'Janeiro 2024'
    },
    {
      titulo: 'Ticket Médio',
      valor: `R$ ${dadosFinanceiros.resumo.ticketMedio.toFixed(0)}`,
      variacao: '+R$ 12',
      tipo: 'positivo',
      icon: Target,
      cor: 'bg-blue-500',
      descricao: 'Por consulta'
    },
    {
      titulo: 'Margem de Lucro',
      valor: `${dadosFinanceiros.resumo.margemLucro}%`,
      variacao: '+2.1%',
      tipo: 'positivo',
      icon: PieChart,
      cor: 'bg-purple-500',
      descricao: 'Margem líquida'
    },
    {
      titulo: 'Receita/Dentista',
      valor: `R$ ${(dadosFinanceiros.resumo.receitaPorDentista / 1000).toFixed(1)}k`,
      variacao: '+5.8%',
      tipo: 'positivo',
      icon: Activity,
      cor: 'bg-indigo-500',
      descricao: 'Média mensal'
    },
    {
      titulo: 'Custo Operacional',
      valor: `R$ ${(dadosFinanceiros.resumo.custoOperacional / 1000).toFixed(0)}k`,
      variacao: '+3.2%',
      tipo: 'neutro',
      icon: Building,
      cor: 'bg-orange-500',
      descricao: 'Despesas totais'
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'aprovado':
      case 'pago':
        return 'bg-green-100 text-green-800'
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelado':
      case 'rejeitado':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getMetodoIcon = (metodo: string) => {
    switch (metodo) {
      case 'cartao_credito':
      case 'cartao_debito':
        return CreditCard
      case 'pix':
        return Zap
      case 'boleto':
        return Receipt
      case 'transferencia':
      case 'debito_automatico':
        return Banknote
      default:
        return DollarSign
    }
  }

  const renderVisaoGeralTab = () => (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {kpis.map((kpi) => {
          const Icon = kpi.icon
          return (
            <Card key={kpi.titulo} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600">{kpi.titulo}</p>
                    <p className="text-2xl font-bold text-primaryDark mt-1">{kpi.valor}</p>
                    <div className="flex items-center justify-between mt-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        kpi.tipo === 'positivo' ? 'bg-green-100 text-green-800' :
                        kpi.tipo === 'negativo' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {kpi.variacao}
                      </span>
                      <span className="text-xs text-gray-500">{kpi.descricao}</span>
                    </div>
                  </div>
                  <div className={`w-12 h-12 ${kpi.cor} rounded-lg flex items-center justify-center ml-4`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Gráficos Principais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-accent" />
              Receita vs Despesas (Últimos 7 meses)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <Line data={dadosFinanceiros.receitaMensal} options={chartOptions} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-accent" />
              Receita por Especialidade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <Doughnut data={dadosFinanceiros.receitaPorEspecialidade} options={chartOptions} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resumo Financeiro e Métodos de Pagamento */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Resumo Financeiro Detalhado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium text-primaryDark">Receitas</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Consultas Realizadas</span>
                    <span className="font-medium">R$ 142.850</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Tratamentos Especiais</span>
                    <span className="font-medium">R$ 28.420</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Procedimentos Cirúrgicos</span>
                    <span className="font-medium">R$ 16.080</span>
                  </div>
                  <hr />
                  <div className="flex justify-between items-center font-semibold">
                    <span>Total de Receitas</span>
                    <span className="text-green-600">R$ 187.350</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-primaryDark">Despesas</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Salários e Encargos</span>
                    <span className="font-medium">R$ 35.200</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Infraestrutura e TI</span>
                    <span className="font-medium">R$ 12.800</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Taxas e Comissões</span>
                    <span className="font-medium">R$ 8.920</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Marketing e Publicidade</span>
                    <span className="font-medium">R$ 2.000</span>
                  </div>
                  <hr />
                  <div className="flex justify-between items-center font-semibold">
                    <span>Total de Despesas</span>
                    <span className="text-red-600">R$ 58.920</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-accent/5 rounded-lg border-l-4 border-accent">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-primaryDark">Lucro Líquido</h4>
                  <p className="text-sm text-gray-600">Receitas - Despesas</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-accent">R$ 128.430</p>
                  <p className="text-sm text-green-600">+12.5% vs mês anterior</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-accent" />
              Métodos de Pagamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 mb-4">
              <Doughnut data={dadosFinanceiros.metodosPagamento} options={chartOptions} />
            </div>
            <div className="space-y-2">
              {[
                { metodo: 'Cartão de Crédito', porcentagem: 42, valor: 'R$ 78.687' },
                { metodo: 'PIX', porcentagem: 28, valor: 'R$ 52.458' },
                { metodo: 'Boleto', porcentagem: 15, valor: 'R$ 28.103' },
                { metodo: 'Cartão de Débito', porcentagem: 10, valor: 'R$ 18.735' },
                { metodo: 'Transferência', porcentagem: 5, valor: 'R$ 9.367' }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{item.metodo}</span>
                  <div className="text-right">
                    <span className="font-medium">{item.porcentagem}%</span>
                    <p className="text-xs text-gray-500">{item.valor}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertas e Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-accent" />
              Alertas Financeiros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-green-800">Meta Mensal Atingida</h4>
                  <p className="text-sm text-green-700">
                    Receita de janeiro superou a meta em 8.2% (R$ 3.420 acima do esperado)
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-800">Pagamentos Pendentes</h4>
                  <p className="text-sm text-yellow-700">
                    R$ 2.850 em pagamentos pendentes há mais de 7 dias
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <Activity className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-800">Crescimento Consistente</h4>
                  <p className="text-sm text-blue-700">
                    Receita cresceu por 4 meses consecutivos, média de +10.2%
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-accent" />
              Metas e Projeções
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Meta Mensal</span>
                  <span className="text-sm text-green-600">108.2%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '100%' }}></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>R$ 45.280</span>
                  <span>Meta: R$ 42.000</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Meta Trimestral</span>
                  <span className="text-sm text-blue-600">76.4%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '76%' }}></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>R$ 95.680</span>
                  <span>Meta: R$ 125.000</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Meta Anual</span>
                  <span className="text-sm text-purple-600">31.2%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-500 h-2 rounded-full" style={{ width: '31%' }}></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>R$ 187.350</span>
                  <span>Meta: R$ 600.000</span>
                </div>
              </div>

              <div className="mt-4 p-3 bg-accent/5 rounded-lg">
                <h4 className="font-medium text-accent mb-1">Projeção para Fevereiro</h4>
                <p className="text-sm text-gray-600">
                  Com base no crescimento atual, estimamos R$ 48.200 (+6.4%)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const renderTransacoesTab = () => (
    <div className="space-y-6">
      {/* Filtros */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Buscar por paciente, dentista ou ID da transação..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <select className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent">
                <option value="">Todos os tipos</option>
                <option value="receita">Receitas</option>
                <option value="despesa">Despesas</option>
              </select>
              
              <select className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent">
                <option value="">Todos os status</option>
                <option value="aprovado">Aprovado</option>
                <option value="pendente">Pendente</option>
                <option value="cancelado">Cancelado</option>
              </select>
              
              <Button variant="secondary">
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Transações */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Transações Recentes</CardTitle>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Nova Transação
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left p-4 font-medium text-gray-600">ID / Descrição</th>
                  <th className="text-left p-4 font-medium text-gray-600">Tipo</th>
                  <th className="text-left p-4 font-medium text-gray-600">Valor</th>
                  <th className="text-left p-4 font-medium text-gray-600">Método</th>
                  <th className="text-left p-4 font-medium text-gray-600">Status</th>
                  <th className="text-left p-4 font-medium text-gray-600">Data</th>
                  <th className="text-left p-4 font-medium text-gray-600">Ações</th>
                </tr>
              </thead>
              <tbody>
                {dadosFinanceiros.transacoes.map((transacao) => {
                  const MetodoIcon = getMetodoIcon(transacao.metodo)
                  return (
                    <tr key={transacao.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-4">
                        <div>
                          <p className="font-medium text-primaryDark">{transacao.id}</p>
                          <p className="text-sm text-gray-600">{transacao.descricao}</p>
                          {transacao.paciente && (
                            <p className="text-xs text-gray-500">Paciente: {transacao.paciente}</p>
                          )}
                          {transacao.fornecedor && (
                            <p className="text-xs text-gray-500">Fornecedor: {transacao.fornecedor}</p>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {transacao.tipo === 'receita' ? (
                            <ArrowUpRight className="h-4 w-4 text-green-500" />
                          ) : (
                            <ArrowDownRight className="h-4 w-4 text-red-500" />
                          )}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            transacao.tipo === 'receita' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {transacao.tipo.charAt(0).toUpperCase() + transacao.tipo.slice(1)}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`font-semibold ${
                          transacao.tipo === 'receita' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          R$ {Math.abs(transacao.valor).toFixed(2)}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <MetodoIcon className="h-4 w-4 text-gray-400" />
                          <span className="text-sm capitalize">
                            {transacao.metodo.replace('_', ' ')}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transacao.status)}`}>
                          {transacao.status.charAt(0).toUpperCase() + transacao.status.slice(1)}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="text-sm">
                          <p>{transacao.data.toLocaleDateString('pt-BR')}</p>
                          <p className="text-gray-500">{transacao.data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="secondary">
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="secondary">
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="secondary">
                            <MoreVertical className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Resumo das Transações */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <h3 className="font-semibold text-primaryDark mb-1">Total de Receitas</h3>
            <p className="text-2xl font-bold text-green-600">R$ 1.280,00</p>
            <p className="text-xs text-gray-500">Hoje</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center mx-auto mb-3">
              <TrendingDown className="h-6 w-6 text-white" />
            </div>
            <h3 className="font-semibold text-primaryDark mb-1">Total de Despesas</h3>
            <p className="text-2xl font-bold text-red-600">R$ 388,50</p>
            <p className="text-xs text-gray-500">Hoje</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center mx-auto mb-3">
              <Calculator className="h-6 w-6 text-white" />
            </div>
            <h3 className="font-semibold text-primaryDark mb-1">Saldo Líquido</h3>
            <p className="text-2xl font-bold text-accent">R$ 891,50</p>
            <p className="text-xs text-gray-500">Hoje</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case 'visao-geral':
        return renderVisaoGeralTab()
      case 'transacoes':
        return renderTransacoesTab()
      case 'receitas':
        return <div className="text-center py-12 text-gray-500">Módulo de receitas em desenvolvimento</div>
      case 'despesas':
        return <div className="text-center py-12 text-gray-500">Módulo de despesas em desenvolvimento</div>
      case 'relatorios':
        return <div className="text-center py-12 text-gray-500">Relatórios financeiros em desenvolvimento</div>
      case 'configuracoes':
        return <div className="text-center py-12 text-gray-500">Configurações financeiras em desenvolvimento</div>
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
            <h1 className="text-3xl font-bold text-primaryDark">Gestão Financeira</h1>
            <p className="text-gray-600 mt-1">
              Controle completo das finanças da plataforma
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
            <option value="1-ano">Último ano</option>
          </select>
          <Button variant="secondary">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Exportar Relatório
          </Button>
        </div>
      </div>

      {/* Status Financeiro */}
      <Card className="border-l-4 border-l-accent">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center">
                <Wallet className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-primaryDark">Sistema Financeiro</h3>
                <p className="text-sm text-gray-600">
                  Status: Operacional • Última sincronização: {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Saldo em Conta</p>
                <p className="text-xl font-bold text-accent">R$ 45.280,00</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="secondary">
                  <Lightbulb className="h-3 w-3 mr-1" />
                  Segurança
                </Button>
                <Button size="sm">
                  <Activity className="h-3 w-3 mr-1" />
                  Monitorar
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

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