import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { useState } from 'react'
import { 
  X, 
  User, 
  Clock, 
  AlertTriangle, 
  FileText, 
  Phone, 
  Mail, 
  MapPin, 
  Heart, 
  Pill, 
  Camera, 
  MessageSquare, 
  Video, 
  Download,
  Eye,
  Thermometer,
  Activity,
  Shield,
  Stethoscope
} from 'lucide-react'
import type { QueueItem } from '@/stores/queue'

interface DetalhesProximaConsultaProps {
  consulta: QueueItem
  onClose: () => void
  onAssumeConsulta?: (consultaId: string) => void
}

// Mock de dados detalhados do paciente
const getDetalhesCompletos = (consulta: QueueItem) => {
  return {
    ...consulta,
    pacienteInfo: {
      nome: consulta.pacienteNome,
      idade: 34,
      telefone: '(11) 99999-9999',
      email: 'maria.santos@email.com',
      endereco: 'Rua das Flores, 123 - Vila Madalena, São Paulo - SP',
      cpf: '***.***.***-**',
      convenio: 'Particular',
      profissao: 'Professora'
    },
    historicoMedico: {
      alergias: ['Penicilina', 'Látex'],
      medicamentosUso: ['Losartana 50mg', 'Vitamina D'],
      condicoesMedicas: ['Hipertensão controlada'],
      cirurgiasAnteriores: ['Apendicectomia (2018)'],
      ultimaConsulta: new Date('2024-01-15'),
      totalConsultas: 8
    },
    sinaisVitais: {
      pressaoArterial: '130/85 mmHg',
      frequenciaCardiaca: '78 bpm',
      temperatura: '36.4°C',
      peso: '68 kg',
      altura: '1.65 m'
    },
    consultaAtual: {
      motivoConsulta: consulta.descricao,
      sintomas: ['Dor ao mastigar', 'Sensibilidade ao frio', 'Inchaço leve'],
      intensidadeDor: 7,
      duracaoSintomas: '3 dias',
      fatoresAgravantes: 'Alimentos duros e gelados',
      fatoresAliviantes: 'Analgésicos',
      expectativas: 'Alívio da dor e tratamento definitivo'
    },
    documentos: [
      { nome: 'RG', status: 'verificado', tipo: 'documento' },
      { nome: 'Cartão SUS', status: 'verificado', tipo: 'documento' },
      { nome: 'Exame panorâmico', status: 'pendente', tipo: 'exame', data: '2024-01-10' },
      { nome: 'Foto da região afetada', status: 'anexado', tipo: 'imagem' }
    ],
    avaliacaoRisco: {
      nivel: 'médio',
      fatores: ['Hipertensão', 'Alergia a medicamentos'],
      recomendacoes: ['Monitorar pressão', 'Evitar penicilina', 'Anestesia sem vasoconstritor']
    },
    preferencias: {
      horarioPreferido: 'Manhã',
      comunicacao: 'WhatsApp',
      idioma: 'Português',
      necessidadesEspeciais: 'Nenhuma'
    }
  }
}

export function DetalhesProximaConsulta({ consulta, onClose, onAssumeConsulta }: DetalhesProximaConsultaProps) {
  const [activeTab, setActiveTab] = useState('geral')
  const detalhes = getDetalhesCompletos(consulta)

  const tabs = [
    { id: 'geral', label: 'Informações Gerais', icon: User },
    { id: 'medico', label: 'Histórico Médico', icon: Heart },
    { id: 'consulta', label: 'Consulta Atual', icon: Stethoscope },
    { id: 'documentos', label: 'Documentos', icon: FileText }
  ]

  const handleAssumeConsulta = () => {
    if (onAssumeConsulta) {
      onAssumeConsulta(consulta.id)
    }
    onClose()
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'geral':
        return (
          <div className="space-y-6">
            {/* Informações Pessoais */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-accent" />
                  Dados Pessoais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Nome Completo</label>
                    <p className="font-medium">{detalhes.pacienteInfo.nome}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Idade</label>
                    <p className="font-medium">{detalhes.pacienteInfo.idade} anos</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">CPF</label>
                    <p className="font-medium">{detalhes.pacienteInfo.cpf}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Profissão</label>
                    <p className="font-medium">{detalhes.pacienteInfo.profissao}</p>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Endereço</label>
                  <div className="flex items-center gap-2 mt-1">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <p className="text-sm">{detalhes.pacienteInfo.endereco}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contato */}
            <Card>
              <CardHeader>
                <CardTitle>Informações de Contato</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">{detalhes.pacienteInfo.telefone}</span>
                  <Button size="sm" variant="secondary">
                    <MessageSquare className="h-3 w-3 mr-1" />
                    WhatsApp
                  </Button>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">{detalhes.pacienteInfo.email}</span>
                  <Button size="sm" variant="secondary">
                    <Mail className="h-3 w-3 mr-1" />
                    Enviar
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Sinais Vitais */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Thermometer className="h-5 w-5 text-accent" />
                  Sinais Vitais (Última Consulta)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Pressão Arterial</p>
                    <p className="font-semibold text-primaryDark">{detalhes.sinaisVitais.pressaoArterial}</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Freq. Cardíaca</p>
                    <p className="font-semibold text-primaryDark">{detalhes.sinaisVitais.frequenciaCardiaca}</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Temperatura</p>
                    <p className="font-semibold text-primaryDark">{detalhes.sinaisVitais.temperatura}</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Peso</p>
                    <p className="font-semibold text-primaryDark">{detalhes.sinaisVitais.peso}</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Altura</p>
                    <p className="font-semibold text-primaryDark">{detalhes.sinaisVitais.altura}</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">IMC</p>
                    <p className="font-semibold text-primaryDark">25.0</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Preferências */}
            <Card>
              <CardHeader>
                <CardTitle>Preferências do Paciente</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Horário Preferido</label>
                    <p className="text-sm">{detalhes.preferencias.horarioPreferido}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Comunicação</label>
                    <p className="text-sm">{detalhes.preferencias.comunicacao}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Idioma</label>
                    <p className="text-sm">{detalhes.preferencias.idioma}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Necessidades Especiais</label>
                    <p className="text-sm">{detalhes.preferencias.necessidadesEspeciais}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case 'medico':
        return (
          <div className="space-y-6">
            {/* Histórico de Consultas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-accent" />
                  Histórico de Consultas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Total de consultas realizadas</p>
                    <p className="text-2xl font-bold text-primaryDark">{detalhes.historicoMedico.totalConsultas}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Última consulta</p>
                    <p className="font-medium">{detalhes.historicoMedico.ultimaConsulta.toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>
                <Button size="sm" variant="secondary" className="w-full">
                  <Eye className="h-3 w-3 mr-2" />
                  Ver Histórico Completo
                </Button>
              </CardContent>
            </Card>

            {/* Alergias */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  Alergias e Restrições
                </CardTitle>
              </CardHeader>
              <CardContent>
                {detalhes.historicoMedico.alergias.length > 0 ? (
                  <div className="space-y-2">
                    {detalhes.historicoMedico.alergias.map((alergia, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded">
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                        <span className="text-red-800 font-medium">{alergia}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">Nenhuma alergia conhecida</p>
                )}
              </CardContent>
            </Card>

            {/* Medicamentos em Uso */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Pill className="h-5 w-5 text-accent" />
                  Medicamentos em Uso
                </CardTitle>
              </CardHeader>
              <CardContent>
                {detalhes.historicoMedico.medicamentosUso.length > 0 ? (
                  <div className="space-y-2">
                    {detalhes.historicoMedico.medicamentosUso.map((medicamento, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-blue-50 border border-blue-200 rounded">
                        <Pill className="h-4 w-4 text-blue-500" />
                        <span className="text-blue-800">{medicamento}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">Nenhum medicamento em uso</p>
                )}
              </CardContent>
            </Card>

            {/* Condições Médicas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-accent" />
                  Condições Médicas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Condições Atuais</label>
                    <div className="mt-1">
                      {detalhes.historicoMedico.condicoesMedicas.map((condicao, index) => (
                        <span key={index} className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full mr-1">
                          {condicao}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-600">Cirurgias Anteriores</label>
                    <div className="mt-1">
                      {detalhes.historicoMedico.cirurgiasAnteriores.map((cirurgia, index) => (
                        <span key={index} className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full mr-1">
                          {cirurgia}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Avaliação de Risco */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-accent" />
                  Avaliação de Risco
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Nível de Risco:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      detalhes.avaliacaoRisco.nivel === 'alto' ? 'bg-red-100 text-red-800' :
                      detalhes.avaliacaoRisco.nivel === 'médio' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {detalhes.avaliacaoRisco.nivel.charAt(0).toUpperCase() + detalhes.avaliacaoRisco.nivel.slice(1)}
                    </span>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-600">Fatores de Risco</label>
                    <ul className="mt-1 text-sm text-gray-700">
                      {detalhes.avaliacaoRisco.fatores.map((fator, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                          {fator}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-600">Recomendações</label>
                    <ul className="mt-1 text-sm text-gray-700">
                      {detalhes.avaliacaoRisco.recomendacoes.map((recomendacao, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <div className="w-1 h-1 bg-accent rounded-full"></div>
                          {recomendacao}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case 'consulta':
        return (
          <div className="space-y-6">
            {/* Motivo da Consulta */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Stethoscope className="h-5 w-5 text-accent" />
                  Motivo da Consulta
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Queixa Principal</label>
                    <p className="mt-1 p-3 bg-gray-50 rounded-lg">{detalhes.consultaAtual.motivoConsulta}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Duração dos Sintomas</label>
                      <p className="font-medium">{detalhes.consultaAtual.duracaoSintomas}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Intensidade da Dor (0-10)</label>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-lg text-red-600">{detalhes.consultaAtual.intensidadeDor}</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-red-500 h-2 rounded-full" 
                            style={{ width: `${(detalhes.consultaAtual.intensidadeDor / 10) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sintomas */}
            <Card>
              <CardHeader>
                <CardTitle>Sintomas Relatados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {detalhes.consultaAtual.sintomas.map((sintoma, index) => (
                    <span key={index} className="bg-accent/10 text-accent px-3 py-1 rounded-full text-sm">
                      {sintoma}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Fatores Agravantes e Aliviantes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Fatores Agravantes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700">{detalhes.consultaAtual.fatoresAgravantes}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Fatores Aliviantes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700">{detalhes.consultaAtual.fatoresAliviantes}</p>
                </CardContent>
              </Card>
            </div>

            {/* Expectativas */}
            <Card>
              <CardHeader>
                <CardTitle>Expectativas do Paciente</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700">{detalhes.consultaAtual.expectativas}</p>
              </CardContent>
            </Card>

            {/* Prioridade e Status */}
            <Card>
              <CardHeader>
                <CardTitle>Informações da Consulta</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Prioridade</label>
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
                    <label className="text-sm font-medium text-gray-600">Status</label>
                    <div className="mt-1">
                      <StatusBadge status={consulta.status} />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Especialidade</label>
                    <p className="font-medium">{consulta.especialidade}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case 'documentos':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-accent" />
                  Documentos do Paciente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {detalhes.documentos.map((doc, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          doc.tipo === 'documento' ? 'bg-blue-100' :
                          doc.tipo === 'exame' ? 'bg-purple-100' :
                          'bg-green-100'
                        }`}>
                          {doc.tipo === 'documento' ? <FileText className="h-4 w-4 text-blue-600" /> :
                           doc.tipo === 'exame' ? <Activity className="h-4 w-4 text-purple-600" /> :
                           <Camera className="h-4 w-4 text-green-600" />}
                        </div>
                        <div>
                          <h4 className="font-medium text-sm">{doc.nome}</h4>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              doc.status === 'verificado' ? 'bg-green-100 text-green-800' :
                              doc.status === 'pendente' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {doc.status}
                            </span>
                            {doc.data && (
                              <span className="text-xs text-gray-500">{doc.data}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="secondary">
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="secondary">
                          <Download className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Upload de Novos Documentos */}
            <Card>
              <CardHeader>
                <CardTitle>Solicitar Documentos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button size="sm" variant="secondary" className="w-full justify-start">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Solicitar Exame Panorâmico
                  </Button>
                  <Button size="sm" variant="secondary" className="w-full justify-start">
                    <Camera className="h-4 w-4 mr-2" />
                    Solicitar Fotos Adicionais
                  </Button>
                  <Button size="sm" variant="secondary" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Solicitar Exames Laboratoriais
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-primaryDark to-primary text-white">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <User className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">{detalhes.pacienteInfo.nome}</h2>
              <p className="text-sm opacity-90">{consulta.especialidade} • Próxima consulta</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm opacity-90">Posição na fila</p>
              <p className="text-lg font-bold">{consulta.posicao}º</p>
            </div>
            <Button variant="secondary" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 bg-gray-50">
          <nav className="flex space-x-8 px-6">
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

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {renderTabContent()}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">
                Tempo estimado: {consulta.tempoEstimado} minutos
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
          </div>
          
          <div className="flex gap-3">
            <Button variant="secondary" onClick={onClose}>
              Fechar
            </Button>
            <Button onClick={handleAssumeConsulta}>
              <Video className="h-4 w-4 mr-2" />
              Assumir Consulta
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}