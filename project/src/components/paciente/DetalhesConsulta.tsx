import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useState } from 'react';
import {
  ArrowLeft,
  Calendar,
  User,
  FileText,
  Download,
  Star,
  Eye,
  MessageSquare,
  Pill,
  Camera,
  Phone,
  Mail,
  Share,
  Printer as Print,
  Edit,
  AlertCircle,
  CheckCircle,
  Heart,
  Thermometer,
} from 'lucide-react';

interface DetalhesConsultaProps {
  consultaId: string;
  onBack: () => void;
}

// Mock de dados detalhados da consulta
const getConsultaDetalhes = (id: string) => {
  const consultas = {
    h1: {
      id: 'h1',
      data: new Date('2024-01-15'),
      horaInicio: '14:30',
      horaFim: '14:55',
      dentista: {
        nome: 'Dr. João Silva',
        cro: 'CRO-SP 12345',
        especialidade: 'Clínica Geral',
        telefone: '(11) 99999-9999',
        email: 'joao.silva@unio.com',
        avatar:
          'https://images.pexels.com/photos/5215024/pexels-photo-5215024.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
      },
      especialidade: 'Clínica Geral',
      status: 'finalizado' as const,
      duracao: '25 min',
      descricaoInicial: 'Consulta de rotina - limpeza e avaliação geral',
      queixaPrincipal:
        'Dor leve no dente molar direito ao mastigar alimentos duros',
      historiaDoenca:
        'Paciente relata dor intermitente há aproximadamente 1 semana, sem irradiação, que piora com alimentos gelados.',
      exameClinico:
        'Dente 16 com restauração antiga em amálgama apresentando infiltração marginal. Gengivas com leve inflamação generalizada. Demais dentes sem alterações significativas.',
      diagnostico: 'Cárie secundária em dente 16. Gengivite leve generalizada.',
      tratamentoRealizado:
        'Remoção da restauração antiga, limpeza da cavidade, aplicação de base protetora e nova restauração em resina composta. Profilaxia e orientações de higiene oral.',
      avaliacao: 5,
      prescricao: true,
      receita:
        'Ibuprofeno 600mg - 1 comprimido a cada 8 horas por 3 dias (apenas se houver dor)',
      observacoes:
        'Paciente apresentou leve sensibilidade durante o procedimento. Recomendado uso de pasta específica para dentes sensíveis. Retorno em 6 meses para consulta de rotina.',
      proximaConsulta: new Date('2024-07-15'),
      sinaisVitais: {
        pressaoArterial: '120/80 mmHg',
        frequenciaCardiaca: '72 bpm',
        temperatura: '36.5°C',
      },
      alergias: ['Penicilina'],
      medicamentosUso: ['Losartana 50mg (hipertensão)'],
      arquivos: [
        { nome: 'receita_15012024.pdf', tipo: 'receita', tamanho: '245 KB' },
        { nome: 'exame_panoramico.jpg', tipo: 'exame', tamanho: '1.2 MB' },
        { nome: 'foto_antes_tratamento.jpg', tipo: 'foto', tamanho: '890 KB' },
        { nome: 'foto_depois_tratamento.jpg', tipo: 'foto', tamanho: '920 KB' },
      ],
      custos: {
        consulta: 150.0,
        procedimentos: 280.0,
        total: 430.0,
        formaPagamento: 'Cartão de Crédito',
        parcelas: '3x sem juros',
      },
      feedback: {
        pontualidade: 5,
        atendimento: 5,
        explicacoes: 4,
        ambiente: 5,
        recomendaria: true,
        comentario:
          'Excelente atendimento! Dr. João foi muito atencioso e explicou todo o procedimento. Ambiente muito limpo e organizado.',
      },
    },
  };

  return consultas[id as keyof typeof consultas] || null;
};

export function DetalhesConsulta({
  consultaId,
  onBack,
}: DetalhesConsultaProps) {
  const [activeTab, setActiveTab] = useState('geral');
  const consulta = getConsultaDetalhes(consultaId);

  if (!consulta) {
    return (
      <div className='max-w-4xl mx-auto'>
        <Card>
          <CardContent className='p-8 text-center'>
            <AlertCircle className='h-16 w-16 text-gray-300 mx-auto mb-4' />
            <h2 className='text-2xl font-bold text-primaryDark mb-4'>
              Consulta não encontrada
            </h2>
            <Button onClick={onBack}>
              <ArrowLeft className='h-4 w-4 mr-2' />
              Voltar ao Histórico
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  const tabs = [
    { id: 'geral', label: 'Informações Gerais', icon: FileText },
    { id: 'clinico', label: 'Dados Clínicos', icon: Heart },
    { id: 'arquivos', label: 'Documentos', icon: Camera },
    { id: 'financeiro', label: 'Financeiro', icon: Pill },
    { id: 'avaliacao', label: 'Avaliação', icon: Star },
  ];

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          <Button variant='secondary' onClick={onBack}>
            <ArrowLeft className='h-4 w-4 mr-2' />
            Voltar
          </Button>
          <div>
            <h1 className='text-3xl font-bold text-primaryDark'>
              Detalhes da Consulta
            </h1>
            <p className='text-gray-600 mt-1'>
              {consulta.data.toLocaleDateString('pt-BR')} •{' '}
              {consulta.especialidade}
            </p>
          </div>
        </div>
        <div className='flex gap-2'>
          <Button variant='secondary' size='sm'>
            <Share className='h-4 w-4 mr-2' />
            Compartilhar
          </Button>
          <Button variant='secondary' size='sm'>
            <Print className='h-4 w-4 mr-2' />
            Imprimir
          </Button>
        </div>
      </div>

      {/* Status Card */}
      <Card className='border-l-4 border-l-accent'>
        <CardContent className='p-6'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-4'>
              <div className='w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center'>
                <CheckCircle className='h-6 w-6 text-accent' />
              </div>
              <div>
                <h3 className='font-semibold text-primaryDark'>
                  Consulta Finalizada
                </h3>
                <p className='text-sm text-gray-600'>
                  {consulta.data.toLocaleDateString('pt-BR')} das{' '}
                  {consulta.horaInicio} às {consulta.horaFim}
                </p>
              </div>
            </div>
            <StatusBadge status={consulta.status} />
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className='border-b border-gray-200'>
        <nav className='flex space-x-8'>
          {tabs.map(tab => {
            const Icon = tab.icon;
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
                <Icon className='h-4 w-4' />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Main Content */}
        <div className='lg:col-span-2'>
          {activeTab === 'geral' && (
            <div className='space-y-6'>
              <Card>
                <CardHeader>
                  <CardTitle>Informações da Consulta</CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div>
                      <label className='text-sm font-medium text-gray-600'>
                        Data e Hora
                      </label>
                      <p className='font-medium'>
                        {consulta.data.toLocaleDateString('pt-BR')} •{' '}
                        {consulta.horaInicio} - {consulta.horaFim}
                      </p>
                    </div>
                    <div>
                      <label className='text-sm font-medium text-gray-600'>
                        Duração
                      </label>
                      <p className='font-medium'>{consulta.duracao}</p>
                    </div>
                    <div>
                      <label className='text-sm font-medium text-gray-600'>
                        Especialidade
                      </label>
                      <p className='font-medium'>{consulta.especialidade}</p>
                    </div>
                    <div>
                      <label className='text-sm font-medium text-gray-600'>
                        Status
                      </label>
                      <div className='mt-1'>
                        <StatusBadge status={consulta.status} />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className='text-sm font-medium text-gray-600'>
                      Queixa Principal
                    </label>
                    <p className='mt-1 p-3 bg-gray-50 rounded-lg'>
                      {consulta.queixaPrincipal}
                    </p>
                  </div>

                  <div>
                    <label className='text-sm font-medium text-gray-600'>
                      Descrição Inicial
                    </label>
                    <p className='mt-1 p-3 bg-gray-50 rounded-lg'>
                      {consulta.descricaoInicial}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {consulta.proximaConsulta && (
                <Card className='border-accent/20 bg-accent/5'>
                  <CardContent className='p-6'>
                    <div className='flex items-center gap-3'>
                      <Calendar className='h-5 w-5 text-accent' />
                      <div>
                        <h4 className='font-medium text-accent'>
                          Próxima Consulta Agendada
                        </h4>
                        <p className='text-sm text-gray-600'>
                          {consulta.proximaConsulta.toLocaleDateString('pt-BR')}{' '}
                          - Consulta de retorno
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {activeTab === 'clinico' && (
            <div className='space-y-6'>
              <Card>
                <CardHeader>
                  <CardTitle>História da Doença</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className='text-gray-700 leading-relaxed'>
                    {consulta.historiaDoenca}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Exame Clínico</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className='text-gray-700 leading-relaxed'>
                    {consulta.exameClinico}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Diagnóstico</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400'>
                    <p className='text-blue-800 font-medium'>
                      {consulta.diagnostico}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Tratamento Realizado</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className='text-gray-700 leading-relaxed'>
                    {consulta.tratamentoRealizado}
                  </p>
                </CardContent>
              </Card>

              {consulta.prescricao && (
                <Card>
                  <CardHeader>
                    <CardTitle className='flex items-center gap-2'>
                      <Pill className='h-5 w-5 text-accent' />
                      Prescrição Médica
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className='bg-green-50 p-4 rounded-lg border-l-4 border-green-400'>
                      <p className='text-green-800'>{consulta.receita}</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>Observações e Recomendações</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className='text-gray-700 leading-relaxed'>
                    {consulta.observacoes}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'arquivos' && (
            <Card>
              <CardHeader>
                <CardTitle>Documentos e Imagens</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  {consulta.arquivos.map((arquivo, index) => (
                    <div
                      key={index}
                      className='border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow'
                    >
                      <div className='flex items-center justify-between mb-3'>
                        <div className='flex items-center gap-2'>
                          {arquivo.tipo === 'foto' ? (
                            <Camera className='h-5 w-5 text-blue-500' />
                          ) : arquivo.tipo === 'exame' ? (
                            <Eye className='h-5 w-5 text-purple-500' />
                          ) : (
                            <FileText className='h-5 w-5 text-green-500' />
                          )}
                          <span className='font-medium text-sm'>
                            {arquivo.nome}
                          </span>
                        </div>
                        <span className='text-xs text-gray-500'>
                          {arquivo.tamanho}
                        </span>
                      </div>

                      {arquivo.tipo === 'foto' && (
                        <div className='mb-3'>
                          <img
                            src={`https://images.pexels.com/photos/305568/pexels-photo-305568.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&dpr=2`}
                            alt={arquivo.nome}
                            className='w-full h-32 object-cover rounded border'
                          />
                        </div>
                      )}

                      <div className='flex gap-2'>
                        <Button
                          size='sm'
                          variant='secondary'
                          className='flex-1'
                        >
                          <Eye className='h-3 w-3 mr-1' />
                          Visualizar
                        </Button>
                        <Button
                          size='sm'
                          variant='secondary'
                          className='flex-1'
                        >
                          <Download className='h-3 w-3 mr-1' />
                          Baixar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'financeiro' && (
            <Card>
              <CardHeader>
                <CardTitle>Informações Financeiras</CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='bg-gray-50 p-4 rounded-lg'>
                  <div className='space-y-3'>
                    <div className='flex justify-between'>
                      <span className='text-gray-600'>Consulta:</span>
                      <span className='font-medium'>
                        R$ {consulta.custos.consulta.toFixed(2)}
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-gray-600'>Procedimentos:</span>
                      <span className='font-medium'>
                        R$ {consulta.custos.procedimentos.toFixed(2)}
                      </span>
                    </div>
                    <hr />
                    <div className='flex justify-between text-lg font-bold'>
                      <span>Total:</span>
                      <span className='text-accent'>
                        R$ {consulta.custos.total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <label className='text-sm font-medium text-gray-600'>
                      Forma de Pagamento
                    </label>
                    <p className='font-medium'>
                      {consulta.custos.formaPagamento}
                    </p>
                  </div>
                  <div>
                    <label className='text-sm font-medium text-gray-600'>
                      Parcelamento
                    </label>
                    <p className='font-medium'>{consulta.custos.parcelas}</p>
                  </div>
                </div>

                <div className='bg-green-50 p-4 rounded-lg border-l-4 border-green-400'>
                  <div className='flex items-center gap-2'>
                    <CheckCircle className='h-5 w-5 text-green-600' />
                    <span className='text-green-800 font-medium'>
                      Pagamento Aprovado
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'avaliacao' && (
            <Card>
              <CardHeader>
                <CardTitle>Sua Avaliação</CardTitle>
              </CardHeader>
              <CardContent className='space-y-6'>
                <div className='text-center'>
                  <div className='flex justify-center gap-1 mb-2'>
                    {renderStars(consulta.avaliacao)}
                  </div>
                  <p className='text-2xl font-bold text-primaryDark'>
                    {consulta.avaliacao}/5
                  </p>
                  <p className='text-gray-600'>Avaliação Geral</p>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div className='text-center p-4 bg-gray-50 rounded-lg'>
                    <div className='flex justify-center gap-1 mb-1'>
                      {renderStars(consulta.feedback.pontualidade)}
                    </div>
                    <p className='text-sm font-medium'>Pontualidade</p>
                  </div>
                  <div className='text-center p-4 bg-gray-50 rounded-lg'>
                    <div className='flex justify-center gap-1 mb-1'>
                      {renderStars(consulta.feedback.atendimento)}
                    </div>
                    <p className='text-sm font-medium'>Atendimento</p>
                  </div>
                  <div className='text-center p-4 bg-gray-50 rounded-lg'>
                    <div className='flex justify-center gap-1 mb-1'>
                      {renderStars(consulta.feedback.explicacoes)}
                    </div>
                    <p className='text-sm font-medium'>Explicações</p>
                  </div>
                  <div className='text-center p-4 bg-gray-50 rounded-lg'>
                    <div className='flex justify-center gap-1 mb-1'>
                      {renderStars(consulta.feedback.ambiente)}
                    </div>
                    <p className='text-sm font-medium'>Ambiente</p>
                  </div>
                </div>

                <div>
                  <label className='text-sm font-medium text-gray-600'>
                    Seu Comentário
                  </label>
                  <div className='mt-2 p-4 bg-gray-50 rounded-lg'>
                    <p className='text-gray-700'>
                      {consulta.feedback.comentario}
                    </p>
                  </div>
                </div>

                <div className='flex items-center justify-center gap-2 p-4 bg-accent/5 rounded-lg'>
                  <Heart className='h-5 w-5 text-accent' />
                  <span className='text-accent font-medium'>
                    {consulta.feedback.recomendaria
                      ? 'Você recomendaria este profissional'
                      : 'Você não recomendaria este profissional'}
                  </span>
                </div>

                <Button variant='secondary' className='w-full'>
                  <Edit className='h-4 w-4 mr-2' />
                  Editar Avaliação
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className='space-y-6'>
          {/* Dentista Info */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <User className='h-5 w-5 text-accent' />
                Profissional
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='flex items-center gap-3 mb-4'>
                <img
                  src={consulta.dentista.avatar}
                  alt={consulta.dentista.nome}
                  className='w-12 h-12 rounded-full object-cover'
                />
                <div>
                  <h4 className='font-medium text-primaryDark'>
                    {consulta.dentista.nome}
                  </h4>
                  <p className='text-sm text-gray-600'>
                    {consulta.dentista.cro}
                  </p>
                </div>
              </div>

              <div className='space-y-3'>
                <div>
                  <label className='text-sm font-medium text-gray-600'>
                    Especialidade
                  </label>
                  <p className='text-sm'>{consulta.dentista.especialidade}</p>
                </div>
                <div className='flex items-center gap-2'>
                  <Phone className='h-4 w-4 text-gray-400' />
                  <span className='text-sm'>{consulta.dentista.telefone}</span>
                </div>
                <div className='flex items-center gap-2'>
                  <Mail className='h-4 w-4 text-gray-400' />
                  <span className='text-sm'>{consulta.dentista.email}</span>
                </div>
              </div>

              <div className='mt-4 space-y-2'>
                <Button size='sm' className='w-full'>
                  <MessageSquare className='h-3 w-3 mr-2' />
                  Nova Consulta
                </Button>
                <Button size='sm' variant='secondary' className='w-full'>
                  <Star className='h-3 w-3 mr-2' />
                  Avaliar Novamente
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Sinais Vitais */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Thermometer className='h-5 w-5 text-accent' />
                Sinais Vitais
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-3'>
              <div className='flex justify-between'>
                <span className='text-sm text-gray-600'>Pressão Arterial:</span>
                <span className='text-sm font-medium'>
                  {consulta.sinaisVitais.pressaoArterial}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-sm text-gray-600'>
                  Frequência Cardíaca:
                </span>
                <span className='text-sm font-medium'>
                  {consulta.sinaisVitais.frequenciaCardiaca}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-sm text-gray-600'>Temperatura:</span>
                <span className='text-sm font-medium'>
                  {consulta.sinaisVitais.temperatura}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Informações Médicas */}
          <Card>
            <CardHeader>
              <CardTitle>Informações Médicas</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div>
                <label className='text-sm font-medium text-gray-600'>
                  Alergias
                </label>
                <div className='mt-1'>
                  {consulta.alergias.map((alergia, index) => (
                    <span
                      key={index}
                      className='inline-block bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full mr-1'
                    >
                      {alergia}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className='text-sm font-medium text-gray-600'>
                  Medicamentos em Uso
                </label>
                <div className='mt-1'>
                  {consulta.medicamentosUso.map((medicamento, index) => (
                    <span
                      key={index}
                      className='inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mr-1 mb-1'
                    >
                      {medicamento}
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ações Rápidas */}
          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className='space-y-2'>
              <Button
                size='sm'
                variant='secondary'
                className='w-full justify-start'
              >
                <Calendar className='h-4 w-4 mr-2' />
                Agendar Retorno
              </Button>
              <Button
                size='sm'
                variant='secondary'
                className='w-full justify-start'
              >
                <MessageSquare className='h-4 w-4 mr-2' />
                Enviar Mensagem
              </Button>
              <Button
                size='sm'
                variant='secondary'
                className='w-full justify-start'
              >
                <Download className='h-4 w-4 mr-2' />
                Baixar Relatório
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
