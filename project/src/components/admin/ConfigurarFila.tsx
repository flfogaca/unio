import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useState } from 'react'
import { 
  Settings, 
  Clock, 
  AlertTriangle, 
  Star, 
  Activity, 
  Save, 
  RotateCcw, 
  Plus, 
  Edit, 
  ArrowUp, 
  ArrowDown, 
  Pause, 
  BarChart3, 
  Target, 
  Zap, 
  Bell, 
  ArrowLeft,
  CheckCircle,
  XCircle,
  Lightbulb
} from 'lucide-react'

interface ConfigurarFilaProps {
  onBack?: () => void
}

export function ConfigurarFila({ onBack }: ConfigurarFilaProps) {
  const [activeTab, setActiveTab] = useState('prioridades')
  const [hasChanges, setHasChanges] = useState(false)

  // Estados para configurações
  const [configuracoes, setConfiguracoes] = useState({
    prioridades: [
      { id: 1, nome: 'Emergência', cor: '#EF4444', peso: 100, descricao: 'Casos de emergência odontológica', ativo: true },
      { id: 2, nome: 'Urgente', cor: '#F59E0B', peso: 80, descricao: 'Dor intensa que requer atenção rápida', ativo: true },
      { id: 3, nome: 'Alta', cor: '#F97316', peso: 60, descricao: 'Casos importantes mas não urgentes', ativo: true },
      { id: 4, nome: 'Normal', cor: '#3B82F6', peso: 40, descricao: 'Consultas de rotina e check-ups', ativo: true },
      { id: 5, nome: 'Baixa', cor: '#10B981', peso: 20, descricao: 'Consultas preventivas e orientações', ativo: true }
    ],
    tempos: {
      tempoMedioConsulta: 25,
      tempoMaximoEspera: 120,
      intervaloBetweenConsultas: 5,
      horarioFuncionamento: {
        inicio: '08:00',
        fim: '18:00',
        almoco: { inicio: '12:00', fim: '13:00' }
      }
    },
    regras: {
      maxPacientesPorDentista: 5,
      redistribuicaoAutomatica: true,
      notificacaoEspera: 30,
      cancelamentoAutomatico: 60,
      permitirReagendamento: true
    },
    especialidades: [
      { id: 1, nome: 'Clínica Geral', tempoMedio: 25, cor: '#3B82F6', ativo: true },
      { id: 2, nome: 'Ortodontia', tempoMedio: 35, cor: '#8B5CF6', ativo: true },
      { id: 3, nome: 'Endodontia', tempoMedio: 45, cor: '#EF4444', ativo: true },
      { id: 4, nome: 'Periodontia', tempoMedio: 30, cor: '#10B981', ativo: true },
      { id: 5, nome: 'Cirurgia Oral', tempoMedio: 40, cor: '#F59E0B', ativo: true },
      { id: 6, nome: 'Implantodontia', tempoMedio: 60, cor: '#6366F1', ativo: true }
    ]
  })

  const tabs = [
    { id: 'prioridades', label: 'Prioridades', icon: AlertTriangle },
    { id: 'tempos', label: 'Tempos', icon: Clock },
    { id: 'regras', label: 'Regras', icon: Settings },
    { id: 'especialidades', label: 'Especialidades', icon: Star },
    { id: 'automacao', label: 'Automação', icon: Zap }
  ]

  const handleSaveChanges = () => {
    // Simular salvamento
    setHasChanges(false)
    alert('Configurações salvas com sucesso!')
  }

  const handleResetChanges = () => {
    if (window.confirm('Tem certeza que deseja desfazer todas as alterações?')) {
      // Reset para valores padrão
      setHasChanges(false)
    }
  }

  const updateConfig = (section: string, key: string, value: any) => {
    setConfiguracoes(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [key]: value
      }
    }))
    setHasChanges(true)
  }

  const renderPrioridadesTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-accent" />
            Níveis de Prioridade
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {configuracoes.prioridades.map((prioridade, index) => (
              <div key={prioridade.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-center gap-1">
                    <Button size="sm" variant="secondary" disabled={index === 0}>
                      <ArrowUp className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="secondary" disabled={index === configuracoes.prioridades.length - 1}>
                      <ArrowDown className="h-3 w-3" />
                    </Button>
                  </div>
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: prioridade.cor }}
                  ></div>
                </div>
                
                <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Nome</label>
                    <input
                      type="text"
                      value={prioridade.nome}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-accent focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Peso</label>
                    <input
                      type="number"
                      value={prioridade.peso}
                      min="0"
                      max="100"
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-accent focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Cor</label>
                    <input
                      type="color"
                      value={prioridade.cor}
                      className="w-full h-10 border border-gray-300 rounded focus:ring-2 focus:ring-accent focus:border-transparent"
                    />
                  </div>
                  <div className="flex items-end gap-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={prioridade.ativo}
                        className="rounded border-gray-300 text-accent focus:ring-accent"
                      />
                      <span className="text-sm">Ativo</span>
                    </label>
                    <Button size="sm" variant="secondary">
                      <Edit className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            
            <Button variant="secondary" className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Nova Prioridade
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Algoritmo de Priorização</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Método de Ordenação</label>
                <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent">
                  <option value="peso">Por Peso da Prioridade</option>
                  <option value="tempo">Por Tempo de Espera</option>
                  <option value="hibrido">Híbrido (Peso + Tempo)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fator Tempo (%)</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  defaultValue="30"
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Só Prioridade</span>
                  <span>30%</span>
                  <span>Só Tempo</span>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-start gap-2">
                <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-800">Como funciona</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    O algoritmo híbrido combina o peso da prioridade com o tempo de espera. 
                    Quanto maior o fator tempo, mais influência o tempo de espera terá na ordenação da fila.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderTemposTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-accent" />
            Configurações de Tempo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tempo Médio por Consulta (min)</label>
              <input
                type="number"
                value={configuracoes.tempos.tempoMedioConsulta}
                onChange={(e) => updateConfig('tempos', 'tempoMedioConsulta', parseInt(e.target.value))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                min="5"
                max="120"
              />
              <p className="text-xs text-gray-500 mt-1">Usado para calcular estimativas de tempo</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tempo Máximo de Espera (min)</label>
              <input
                type="number"
                value={configuracoes.tempos.tempoMaximoEspera}
                onChange={(e) => updateConfig('tempos', 'tempoMaximoEspera', parseInt(e.target.value))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                min="30"
                max="300"
              />
              <p className="text-xs text-gray-500 mt-1">Alerta será enviado se exceder este tempo</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Intervalo Entre Consultas (min)</label>
              <input
                type="number"
                value={configuracoes.tempos.intervaloBetweenConsultas}
                onChange={(e) => updateConfig('tempos', 'intervaloBetweenConsultas', parseInt(e.target.value))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                min="0"
                max="30"
              />
              <p className="text-xs text-gray-500 mt-1">Tempo de preparação entre consultas</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Horário de Funcionamento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Início</label>
              <input
                type="time"
                value={configuracoes.tempos.horarioFuncionamento.inicio}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fim</label>
              <input
                type="time"
                value={configuracoes.tempos.horarioFuncionamento.fim}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Almoço</label>
              <div className="flex gap-2">
                <input
                  type="time"
                  value={configuracoes.tempos.horarioFuncionamento.almoco.inicio}
                  className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-accent focus:border-transparent"
                />
                <input
                  type="time"
                  value={configuracoes.tempos.horarioFuncionamento.almoco.fim}
                  className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-accent focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Estimativas Inteligentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Aprendizado de Máquina</h4>
                <p className="text-sm text-gray-600">Ajustar estimativas baseado no histórico real</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Considerar Complexidade</h4>
                <p className="text-sm text-gray-600">Ajustar tempo baseado na descrição do caso</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderRegrasTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-accent" />
            Regras de Distribuição
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Máximo de Pacientes por Dentista
              </label>
              <input
                type="number"
                value={configuracoes.regras.maxPacientesPorDentista}
                onChange={(e) => updateConfig('regras', 'maxPacientesPorDentista', parseInt(e.target.value))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                min="1"
                max="20"
              />
              <p className="text-xs text-gray-500 mt-1">
                Número máximo de consultas simultâneas por profissional
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notificar Paciente Após (min)
                </label>
                <input
                  type="number"
                  value={configuracoes.regras.notificacaoEspera}
                  onChange={(e) => updateConfig('regras', 'notificacaoEspera', parseInt(e.target.value))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                  min="5"
                  max="120"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cancelamento Automático (min)
                </label>
                <input
                  type="number"
                  value={configuracoes.regras.cancelamentoAutomatico}
                  onChange={(e) => updateConfig('regras', 'cancelamentoAutomatico', parseInt(e.target.value))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                  min="30"
                  max="240"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Configurações Avançadas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h4 className="font-medium">Redistribuição Automática</h4>
                <p className="text-sm text-gray-600">
                  Redistribuir pacientes quando um dentista fica indisponível
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={configuracoes.regras.redistribuicaoAutomatica}
                  onChange={(e) => updateConfig('regras', 'redistribuicaoAutomatica', e.target.checked)}
                  className="sr-only" 
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h4 className="font-medium">Permitir Reagendamento</h4>
                <p className="text-sm text-gray-600">
                  Pacientes podem reagendar suas consultas
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={configuracoes.regras.permitirReagendamento}
                  onChange={(e) => updateConfig('regras', 'permitirReagendamento', e.target.checked)}
                  className="sr-only" 
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h4 className="font-medium">Prioridade por Histórico</h4>
                <p className="text-sm text-gray-600">
                  Dar prioridade a pacientes com histórico de cancelamentos
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderEspecialidadesTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-accent" />
            Configurações por Especialidade
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {configuracoes.especialidades.map((especialidade) => (
              <div key={especialidade.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                <div 
                  className="w-4 h-4 rounded-full" 
                  style={{ backgroundColor: especialidade.cor }}
                ></div>
                
                <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Especialidade</label>
                    <p className="font-medium">{especialidade.nome}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Tempo Médio (min)</label>
                    <input
                      type="number"
                      value={especialidade.tempoMedio}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-accent focus:border-transparent"
                      min="5"
                      max="120"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Cor</label>
                    <input
                      type="color"
                      value={especialidade.cor}
                      className="w-full h-10 border border-gray-300 rounded focus:ring-2 focus:ring-accent focus:border-transparent"
                    />
                  </div>
                  <div className="flex items-end gap-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={especialidade.ativo}
                        className="rounded border-gray-300 text-accent focus:ring-accent"
                      />
                      <span className="text-sm">Ativo</span>
                    </label>
                    <Button size="sm" variant="secondary">
                      <Edit className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Regras Especiais</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 border border-gray-200 rounded-lg">
              <h4 className="font-medium mb-2">Cirurgia Oral</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="text-gray-600">Tempo de preparação:</label>
                  <input type="number" defaultValue="15" className="w-full p-2 border rounded" />
                </div>
                <div>
                  <label className="text-gray-600">Intervalo pós-cirurgia:</label>
                  <input type="number" defaultValue="30" className="w-full p-2 border rounded" />
                </div>
              </div>
            </div>

            <div className="p-4 border border-gray-200 rounded-lg">
              <h4 className="font-medium mb-2">Endodontia</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="text-gray-600">Sessões múltiplas:</label>
                  <select className="w-full p-2 border rounded">
                    <option>Permitir</option>
                    <option>Não permitir</option>
                  </select>
                </div>
                <div>
                  <label className="text-gray-600">Prioridade retorno:</label>
                  <select className="w-full p-2 border rounded">
                    <option>Alta</option>
                    <option>Normal</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderAutomacaoTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-accent" />
            Automações Inteligentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h4 className="font-medium">Balanceamento Automático</h4>
                <p className="text-sm text-gray-600">
                  Distribuir pacientes automaticamente entre dentistas disponíveis
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-green-600">Ativo</span>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h4 className="font-medium">Notificações Inteligentes</h4>
                <p className="text-sm text-gray-600">
                  Enviar lembretes baseados no comportamento do paciente
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-green-600">Ativo</span>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h4 className="font-medium">Previsão de Demanda</h4>
                <p className="text-sm text-gray-600">
                  Prever picos de demanda e sugerir ajustes na equipe
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-yellow-600">Em Desenvolvimento</span>
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Triggers Automáticos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Bell className="h-4 w-4 text-blue-600" />
                <h4 className="font-medium text-blue-800">Tempo de Espera Excedido</h4>
              </div>
              <p className="text-sm text-blue-700 mb-3">
                Quando um paciente espera mais de 30 minutos
              </p>
              <div className="flex gap-2">
                <Button size="sm" variant="secondary">Configurar</Button>
                <Button size="sm" variant="secondary">Testar</Button>
              </div>
            </div>

            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <h4 className="font-medium text-green-800">Consulta Finalizada</h4>
              </div>
              <p className="text-sm text-green-700 mb-3">
                Enviar pesquisa de satisfação automaticamente
              </p>
              <div className="flex gap-2">
                <Button size="sm" variant="secondary">Configurar</Button>
                <Button size="sm" variant="secondary">Testar</Button>
              </div>
            </div>

            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="h-4 w-4 text-red-600" />
                <h4 className="font-medium text-red-800">Dentista Indisponível</h4>
              </div>
              <p className="text-sm text-red-700 mb-3">
                Redistribuir pacientes e notificar sobre atrasos
              </p>
              <div className="flex gap-2">
                <Button size="sm" variant="secondary">Configurar</Button>
                <Button size="sm" variant="secondary">Testar</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Otimizações Sugeridas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <Lightbulb className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-800">Reduzir Tempo de Espera</h4>
                <p className="text-sm text-yellow-700">
                  Considere aumentar o intervalo entre consultas de Endodontia para 10 minutos
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <Target className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-800">Melhorar Distribuição</h4>
                <p className="text-sm text-blue-700">
                  Dr. João Silva está com 40% mais consultas que a média. Considere redistribuir.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case 'prioridades':
        return renderPrioridadesTab()
      case 'tempos':
        return renderTemposTab()
      case 'regras':
        return renderRegrasTab()
      case 'especialidades':
        return renderEspecialidadesTab()
      case 'automacao':
        return renderAutomacaoTab()
      default:
        return renderPrioridadesTab()
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
            <h1 className="text-3xl font-bold text-primaryDark">Configurar Fila</h1>
            <p className="text-gray-600 mt-1">
              Configure regras, prioridades e automações da fila de atendimento
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          {hasChanges && (
            <Button variant="secondary" onClick={handleResetChanges}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Desfazer
            </Button>
          )}
          <Button onClick={handleSaveChanges} disabled={!hasChanges}>
            <Save className="h-4 w-4 mr-2" />
            Salvar Configurações
          </Button>
        </div>
      </div>

      {/* Status da Fila */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-primaryDark">Sistema de Fila</h3>
                <p className="text-sm text-gray-600">Status: Operacional • 5 pacientes na fila</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="secondary">
                <Pause className="h-3 w-3 mr-1" />
                Pausar
              </Button>
              <Button size="sm">
                <BarChart3 className="h-3 w-3 mr-1" />
                Monitorar
              </Button>
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