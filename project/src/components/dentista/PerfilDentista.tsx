import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/stores/auth'
import { useState } from 'react'
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Clock,
  Star, 
  Award, 
  Camera, 
  Edit, 
  Save, 
  X, 
  Plus, 
  Eye, 
  EyeOff, 
  Shield, 
  Bell, 
  Palette, 
  Settings, 
  Briefcase,
  GraduationCap,
  Heart,
  TrendingUp,
  Users,
  Download,
  Upload,
  Check,
  Info,
  Calendar,
  FileText
} from 'lucide-react'

export function PerfilDentista() {
  const { user, updateUser } = useAuthStore()
  const [activeTab, setActiveTab] = useState('perfil')
  const [isEditing, setIsEditing] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    telefone: '(11) 99999-9999',
    endereco: 'Rua das Flores, 123 - São Paulo, SP',
    cro: user?.cro || '',
    especialidades: user?.specialties || [],
    biografia: 'Dentista especializado em clínica geral e endodontia com mais de 10 anos de experiência. Formado pela USP, pós-graduado em Endodontia pela UNICAMP.',
    formacao: [
      { instituicao: 'Universidade de São Paulo (USP)', curso: 'Odontologia', ano: '2014' },
      { instituicao: 'UNICAMP', curso: 'Especialização em Endodontia', ano: '2016' }
    ],
    experiencia: [
      { local: 'Clínica OdontoVida', cargo: 'Dentista Clínico Geral', periodo: '2014 - 2018' },
      { local: 'Hospital São Camilo', cargo: 'Endodontista', periodo: '2018 - Atual' }
    ],
    certificacoes: [
      { nome: 'Certificação em Implantodontia', instituicao: 'ABO-SP', ano: '2019' },
      { nome: 'Curso Avançado de Endodontia', instituicao: 'APCD', ano: '2020' }
    ],
    horarios: {
      segunda: { inicio: '08:00', fim: '18:00', ativo: true },
      terca: { inicio: '08:00', fim: '18:00', ativo: true },
      quarta: { inicio: '08:00', fim: '18:00', ativo: true },
      quinta: { inicio: '08:00', fim: '18:00', ativo: true },
      sexta: { inicio: '08:00', fim: '17:00', ativo: true },
      sabado: { inicio: '08:00', fim: '12:00', ativo: false },
      domingo: { inicio: '08:00', fim: '12:00', ativo: false }
    },
    configuracoes: {
      notificacoes: {
        email: true,
        push: true,
        sms: false
      },
      privacidade: {
        perfilPublico: true,
        mostrarEstatisticas: true,
        permitirAvaliacoes: true
      },
      preferencias: {
        tema: 'claro',
        idioma: 'pt-BR',
        timezone: 'America/Sao_Paulo'
      }
    }
  })

  // Mock de estatísticas
  const estatisticas = {
    consultasRealizadas: 1247,
    avaliacaoMedia: 4.8,
    pacientesAtendidos: 892,
    tempoMedioConsulta: 28,
    taxaSatisfacao: 96,
    consultasEsteAno: 234
  }

  const tabs = [
    { id: 'perfil', label: 'Perfil Pessoal', icon: User },
    { id: 'profissional', label: 'Dados Profissionais', icon: Briefcase },
    { id: 'horarios', label: 'Horários', icon: Clock },
    { id: 'estatisticas', label: 'Estatísticas', icon: TrendingUp },
    { id: 'configuracoes', label: 'Configurações', icon: Settings }
  ]

  const handleSave = () => {
    // Simular salvamento
    updateUser({
      name: formData.name,
      email: formData.email,
      cro: formData.cro,
      specialties: formData.especialidades
    })
    setIsEditing(false)
    // Mostrar feedback de sucesso
  }

  const handleAddEspecialidade = () => {
    const novaEspecialidade = prompt('Digite a nova especialidade:')
    if (novaEspecialidade) {
      setFormData(prev => ({
        ...prev,
        especialidades: [...prev.especialidades, novaEspecialidade]
      }))
    }
  }

  const handleRemoveEspecialidade = (index: number) => {
    setFormData(prev => ({
      ...prev,
      especialidades: prev.especialidades.filter((_: any, i: number) => i !== index)
    }))
  }

  const renderPerfilTab = () => (
    <div className="space-y-6">
      {/* Header do Perfil */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Avatar */}
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="w-32 h-32 bg-gradient-to-br from-accent to-accentLight rounded-full flex items-center justify-center text-white text-4xl font-bold">
                  {formData.name.charAt(0)}
                </div>
                <button className="absolute bottom-2 right-2 w-8 h-8 bg-primaryDark rounded-full flex items-center justify-center text-white hover:bg-primary transition-colors">
                  <Camera className="h-4 w-4" />
                </button>
              </div>
              <Button variant="secondary" size="sm" className="mt-3">
                <Upload className="h-3 w-3 mr-2" />
                Alterar Foto
              </Button>
            </div>

            {/* Informações Básicas */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-primaryDark">{formData.name}</h2>
                  <p className="text-gray-600">{formData.cro}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium">{estatisticas.avaliacaoMedia}</span>
                    <span className="text-sm text-gray-500">({estatisticas.consultasRealizadas} consultas)</span>
                  </div>
                </div>
                <Button 
                  variant={isEditing ? "secondary" : "primary"}
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? (
                    <>
                      <X className="h-4 w-4 mr-2" />
                      Cancelar
                    </>
                  ) : (
                    <>
                      <Edit className="h-4 w-4 mr-2" />
                      Editar Perfil
                    </>
                  )}
                </Button>
              </div>

              {/* Especialidades */}
              <div className="mb-4">
                <label className="text-sm font-medium text-gray-600 mb-2 block">Especialidades</label>
                <div className="flex flex-wrap gap-2">
                  {formData.especialidades.map((esp: any, index: number) => (
                    <div key={index} className="flex items-center gap-1 bg-accent/10 text-accent px-3 py-1 rounded-full text-sm">
                      <span>{esp}</span>
                      {isEditing && (
                        <button 
                          onClick={() => handleRemoveEspecialidade(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  ))}
                  {isEditing && (
                    <button 
                      onClick={handleAddEspecialidade}
                      className="flex items-center gap-1 border-2 border-dashed border-gray-300 px-3 py-1 rounded-full text-sm text-gray-500 hover:border-accent hover:text-accent"
                    >
                      <Plus className="h-3 w-3" />
                      Adicionar
                    </button>
                  )}
                </div>
              </div>

              {/* Biografia */}
              <div>
                <label className="text-sm font-medium text-gray-600 mb-2 block">Biografia</label>
                {isEditing ? (
                  <textarea
                    value={formData.biografia}
                    onChange={(e) => setFormData(prev => ({ ...prev, biografia: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent resize-none"
                    rows={3}
                  />
                ) : (
                  <p className="text-gray-700 leading-relaxed">{formData.biografia}</p>
                )}
              </div>
            </div>
          </div>

          {isEditing && (
            <div className="flex justify-end gap-2 mt-6 pt-6 border-t border-gray-200">
              <Button variant="secondary" onClick={() => setIsEditing(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Salvar Alterações
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Informações de Contato */}
      <Card>
        <CardHeader>
          <CardTitle>Informações de Contato</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600 mb-2 block">E-mail</label>
              {isEditing ? (
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                />
              ) : (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span>{formData.email}</span>
                </div>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600 mb-2 block">Telefone</label>
              {isEditing ? (
                <input
                  type="tel"
                  value={formData.telefone}
                  onChange={(e) => setFormData(prev => ({ ...prev, telefone: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                />
              ) : (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span>{formData.telefone}</span>
                </div>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-600 mb-2 block">Endereço</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.endereco}
                  onChange={(e) => setFormData(prev => ({ ...prev, endereco: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                />
              ) : (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span>{formData.endereco}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderProfissionalTab = () => (
    <div className="space-y-6">
      {/* Formação Acadêmica */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-accent" />
            Formação Acadêmica
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {formData.formacao.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-primaryDark">{item.curso}</h4>
                  <p className="text-sm text-gray-600">{item.instituicao}</p>
                  <p className="text-xs text-gray-500">{item.ano}</p>
                </div>
                {isEditing && (
                  <Button variant="secondary" size="sm">
                    <Edit className="h-3 w-3" />
                  </Button>
                )}
              </div>
            ))}
            {isEditing && (
              <Button variant="secondary" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Formação
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Experiência Profissional */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-accent" />
            Experiência Profissional
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {formData.experiencia.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-primaryDark">{item.cargo}</h4>
                  <p className="text-sm text-gray-600">{item.local}</p>
                  <p className="text-xs text-gray-500">{item.periodo}</p>
                </div>
                {isEditing && (
                  <Button variant="secondary" size="sm">
                    <Edit className="h-3 w-3" />
                  </Button>
                )}
              </div>
            ))}
            {isEditing && (
              <Button variant="secondary" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Experiência
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Certificações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-accent" />
            Certificações e Cursos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {formData.certificacoes.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-primaryDark">{item.nome}</h4>
                  <p className="text-sm text-gray-600">{item.instituicao}</p>
                  <p className="text-xs text-gray-500">{item.ano}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm">
                    <Eye className="h-3 w-3" />
                  </Button>
                  {isEditing && (
                    <Button variant="secondary" size="sm">
                      <Edit className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
            {isEditing && (
              <Button variant="secondary" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Certificação
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Documentos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-accent" />
            Documentos Profissionais
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">Diploma de Odontologia</h4>
                <div className="flex items-center gap-1">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-xs text-green-600">Verificado</span>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-3">diploma_odontologia.pdf</p>
              <div className="flex gap-2">
                <Button size="sm" variant="secondary">
                  <Eye className="h-3 w-3 mr-1" />
                  Ver
                </Button>
                <Button size="sm" variant="secondary">
                  <Download className="h-3 w-3 mr-1" />
                  Baixar
                </Button>
              </div>
            </div>

            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">Registro CRO</h4>
                <div className="flex items-center gap-1">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-xs text-green-600">Verificado</span>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-3">registro_cro.pdf</p>
              <div className="flex gap-2">
                <Button size="sm" variant="secondary">
                  <Eye className="h-3 w-3 mr-1" />
                  Ver
                </Button>
                <Button size="sm" variant="secondary">
                  <Download className="h-3 w-3 mr-1" />
                  Baixar
                </Button>
              </div>
            </div>
          </div>

          <Button variant="secondary" className="w-full mt-4">
            <Upload className="h-4 w-4 mr-2" />
            Adicionar Documento
          </Button>
        </CardContent>
      </Card>
    </div>
  )

  const renderHorariosTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-accent" />
            Horários de Atendimento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(formData.horarios).map(([dia, horario]) => (
              <div key={dia} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-20">
                    <span className="font-medium capitalize">{dia}</span>
                  </div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={horario.ativo}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        horarios: {
                          ...prev.horarios,
                          [dia]: { ...horario, ativo: e.target.checked }
                        }
                      }))}
                      className="rounded border-gray-300 text-accent focus:ring-accent"
                    />
                    <span className="text-sm">Ativo</span>
                  </label>
                </div>
                
                {horario.ativo && (
                  <div className="flex items-center gap-2">
                    <input
                      type="time"
                      value={horario.inicio}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        horarios: {
                          ...prev.horarios,
                          [dia]: { ...horario, inicio: e.target.value }
                        }
                      }))}
                      className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-accent focus:border-transparent"
                    />
                    <span className="text-gray-500">às</span>
                    <input
                      type="time"
                      value={horario.fim}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        horarios: {
                          ...prev.horarios,
                          [dia]: { ...horario, fim: e.target.value }
                        }
                      }))}
                      className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-accent focus:border-transparent"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
            <div className="flex items-start gap-2">
              <Info className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-800">Informações sobre Horários</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Os horários definidos aqui serão usados para calcular sua disponibilidade na fila de atendimento. 
                  Você pode ajustar conforme sua agenda pessoal.
                </p>
              </div>
            </div>
          </div>

          <Button className="w-full">
            <Save className="h-4 w-4 mr-2" />
            Salvar Horários
          </Button>
        </CardContent>
      </Card>
    </div>
  )

  const renderEstatisticasTab = () => (
    <div className="space-y-6">
      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Consultas Realizadas</p>
                <p className="text-2xl font-bold text-primaryDark">{estatisticas.consultasRealizadas}</p>
                <p className="text-xs text-green-600">+12% este mês</p>
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
                <p className="text-2xl font-bold text-primaryDark">{estatisticas.avaliacaoMedia}</p>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star key={i} className={`h-3 w-3 ${i < Math.floor(estatisticas.avaliacaoMedia) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                  ))}
                </div>
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
                <p className="text-sm font-medium text-gray-600">Pacientes Únicos</p>
                <p className="text-2xl font-bold text-primaryDark">{estatisticas.pacientesAtendidos}</p>
                <p className="text-xs text-green-600">+8% este mês</p>
              </div>
              <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tempo Médio</p>
                <p className="text-2xl font-bold text-primaryDark">{estatisticas.tempoMedioConsulta}min</p>
                <p className="text-xs text-blue-600">-2min este mês</p>
              </div>
              <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Taxa de Satisfação</p>
                <p className="text-2xl font-bold text-primaryDark">{estatisticas.taxaSatisfacao}%</p>
                <p className="text-xs text-green-600">+3% este mês</p>
              </div>
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                <Heart className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Este Ano</p>
                <p className="text-2xl font-bold text-primaryDark">{estatisticas.consultasEsteAno}</p>
                <p className="text-xs text-green-600">Meta: 300</p>
              </div>
              <div className="w-12 h-12 bg-indigo-500 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos e Análises */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Consultas por Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <TrendingUp className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">Gráfico será implementado</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Avaliações Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { paciente: 'Maria S.', avaliacao: 5, comentario: 'Excelente atendimento!' },
                { paciente: 'João P.', avaliacao: 4, comentario: 'Muito profissional.' },
                { paciente: 'Ana C.', avaliacao: 5, comentario: 'Recomendo!' }
              ].map((item, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm">{item.paciente}</span>
                    <div className="flex gap-1">
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star key={i} className={`h-3 w-3 ${i < item.avaliacao ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-gray-600">{item.comentario}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const renderConfiguracoesTab = () => (
    <div className="space-y-6">
      {/* Notificações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-accent" />
            Notificações
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Notificações por E-mail</h4>
              <p className="text-sm text-gray-600">Receber notificações sobre consultas e mensagens</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.configuracoes.notificacoes.email}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  configuracoes: {
                    ...prev.configuracoes,
                    notificacoes: {
                      ...prev.configuracoes.notificacoes,
                      email: e.target.checked
                    }
                  }
                }))}
                className="sr-only"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Notificações Push</h4>
              <p className="text-sm text-gray-600">Receber notificações no navegador</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.configuracoes.notificacoes.push}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  configuracoes: {
                    ...prev.configuracoes,
                    notificacoes: {
                      ...prev.configuracoes.notificacoes,
                      push: e.target.checked
                    }
                  }
                }))}
                className="sr-only"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">SMS</h4>
              <p className="text-sm text-gray-600">Receber SMS para consultas urgentes</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.configuracoes.notificacoes.sms}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  configuracoes: {
                    ...prev.configuracoes,
                    notificacoes: {
                      ...prev.configuracoes.notificacoes,
                      sms: e.target.checked
                    }
                  }
                }))}
                className="sr-only"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Privacidade */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-accent" />
            Privacidade
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Perfil Público</h4>
              <p className="text-sm text-gray-600">Permitir que pacientes vejam seu perfil</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.configuracoes.privacidade.perfilPublico}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  configuracoes: {
                    ...prev.configuracoes,
                    privacidade: {
                      ...prev.configuracoes.privacidade,
                      perfilPublico: e.target.checked
                    }
                  }
                }))}
                className="sr-only"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Mostrar Estatísticas</h4>
              <p className="text-sm text-gray-600">Exibir estatísticas no perfil público</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.configuracoes.privacidade.mostrarEstatisticas}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  configuracoes: {
                    ...prev.configuracoes,
                    privacidade: {
                      ...prev.configuracoes.privacidade,
                      mostrarEstatisticas: e.target.checked
                    }
                  }
                }))}
                className="sr-only"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Permitir Avaliações</h4>
              <p className="text-sm text-gray-600">Pacientes podem avaliar suas consultas</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.configuracoes.privacidade.permitirAvaliacoes}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  configuracoes: {
                    ...prev.configuracoes,
                    privacidade: {
                      ...prev.configuracoes.privacidade,
                      permitirAvaliacoes: e.target.checked
                    }
                  }
                }))}
                className="sr-only"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Preferências */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-accent" />
            Preferências
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-600 mb-2 block">Tema</label>
            <select
              value={formData.configuracoes.preferencias.tema}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                configuracoes: {
                  ...prev.configuracoes,
                  preferencias: {
                    ...prev.configuracoes.preferencias,
                    tema: e.target.value
                  }
                }
              }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
            >
              <option value="claro">Claro</option>
              <option value="escuro">Escuro</option>
              <option value="auto">Automático</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600 mb-2 block">Idioma</label>
            <select
              value={formData.configuracoes.preferencias.idioma}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                configuracoes: {
                  ...prev.configuracoes,
                  preferencias: {
                    ...prev.configuracoes.preferencias,
                    idioma: e.target.value
                  }
                }
              }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
            >
              <option value="pt-BR">Português (Brasil)</option>
              <option value="en-US">English (US)</option>
              <option value="es-ES">Español</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600 mb-2 block">Fuso Horário</label>
            <select
              value={formData.configuracoes.preferencias.timezone}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                configuracoes: {
                  ...prev.configuracoes,
                  preferencias: {
                    ...prev.configuracoes.preferencias,
                    timezone: e.target.value
                  }
                }
              }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
            >
              <option value="America/Sao_Paulo">São Paulo (GMT-3)</option>
              <option value="America/New_York">New York (GMT-5)</option>
              <option value="Europe/London">London (GMT+0)</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Segurança */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-accent" />
            Segurança
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-600 mb-2 block">Alterar Senha</label>
            <div className="space-y-3">
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Senha atual"
                  className="w-full p-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <input
                type="password"
                placeholder="Nova senha"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
              />
              <input
                type="password"
                placeholder="Confirmar nova senha"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
              />
              <Button variant="secondary">
                Alterar Senha
              </Button>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <h4 className="font-medium text-gray-900 mb-2">Autenticação de Dois Fatores</h4>
            <p className="text-sm text-gray-600 mb-3">
              Adicione uma camada extra de segurança à sua conta
            </p>
            <Button variant="secondary">
              Configurar 2FA
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Salvar Configurações */}
      <div className="flex justify-end">
        <Button>
          <Save className="h-4 w-4 mr-2" />
          Salvar Todas as Configurações
        </Button>
      </div>
    </div>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case 'perfil':
        return renderPerfilTab()
      case 'profissional':
        return renderProfissionalTab()
      case 'horarios':
        return renderHorariosTab()
      case 'estatisticas':
        return renderEstatisticasTab()
      case 'configuracoes':
        return renderConfiguracoesTab()
      default:
        return renderPerfilTab()
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-primaryDark">Meu Perfil</h1>
        <p className="text-gray-600 mt-1">
          Gerencie suas informações pessoais e profissionais
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
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