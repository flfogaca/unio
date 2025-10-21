import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useState } from 'react';
import {
  MessageCircle,
  Phone,
  Mail,
  Clock,
  HelpCircle,
  FileText,
  Video,
  Calendar,
  AlertTriangle,
  Search,
  ChevronRight,
  Download,
  Users,
  Shield,
  Headphones,
  MessageSquare,
  PlayCircle,
  ArrowLeft,
  Send,
  Paperclip,
  Smile,
} from 'lucide-react';

interface SuporteProps {
  onBack?: () => void;
}

export function Suporte({ onBack }: SuporteProps) {
  const [activeSection, setActiveSection] = useState('inicio');
  const [searchTerm, setSearchTerm] = useState('');
  const [chatMessage, setChatMessage] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // FAQ Categories
  const faqCategories = [
    {
      id: 'consultas',
      title: 'Consultas e Agendamentos',
      icon: Calendar,
      color: 'bg-blue-500',
      questions: [
        {
          question: 'Como agendar uma consulta?',
          answer:
            'Para agendar uma consulta, acesse o menu "Solicitar Atendimento" e preencha o formulário com suas informações. Nossa equipe entrará em contato em até 30 minutos.',
        },
        {
          question: 'Posso cancelar ou remarcar uma consulta?',
          answer:
            'Sim! Você pode cancelar ou remarcar até 2 horas antes do horário agendado através do seu dashboard ou entrando em contato conosco.',
        },
        {
          question: 'Como funciona a fila de atendimento?',
          answer:
            'Nossa fila é organizada por prioridade médica e ordem de chegada. Casos urgentes têm prioridade e você pode acompanhar sua posição em tempo real.',
        },
        {
          question: 'Quanto tempo demora uma teleconsulta?',
          answer:
            'Em média, as consultas duram entre 15 a 30 minutos, dependendo da complexidade do caso e dos procedimentos necessários.',
        },
      ],
    },
    {
      id: 'tecnico',
      title: 'Problemas Técnicos',
      icon: Video,
      color: 'bg-purple-500',
      questions: [
        {
          question: 'Problemas com áudio ou vídeo durante a consulta',
          answer:
            'Verifique sua conexão com a internet, permissões do navegador para câmera/microfone e tente atualizar a página. Se persistir, use nosso chat de suporte.',
        },
        {
          question: 'O site não carrega ou está lento',
          answer:
            'Limpe o cache do navegador, verifique sua conexão com a internet ou tente acessar em modo anônimo. Recomendamos Chrome ou Firefox atualizados.',
        },
        {
          question: 'Como baixar documentos e receitas?',
          answer:
            'Acesse seu histórico de consultas, clique na consulta desejada e use o botão "Baixar" nos documentos disponíveis.',
        },
        {
          question: 'Não consigo fazer login na minha conta',
          answer:
            'Verifique se está usando o email correto. Se esqueceu a senha, use "Esqueci minha senha" ou entre em contato conosco.',
        },
      ],
    },
    {
      id: 'pagamento',
      title: 'Pagamentos e Planos',
      icon: FileText,
      color: 'bg-green-500',
      questions: [
        {
          question: 'Quais formas de pagamento são aceitas?',
          answer:
            'Aceitamos cartão de crédito, débito, PIX e boleto bancário. Também oferecemos parcelamento em até 12x sem juros.',
        },
        {
          question: 'Como funciona o reembolso?',
          answer:
            'Reembolsos são processados em até 7 dias úteis. Entre em contato conosco com o número da consulta para solicitar.',
        },
        {
          question: 'Vocês atendem convênios médicos?',
          answer:
            'Atualmente não atendemos convênios, mas fornecemos todos os documentos necessários para reembolso junto ao seu plano de saúde.',
        },
        {
          question: 'Existe desconto para consultas de retorno?',
          answer:
            'Sim! Consultas de retorno com o mesmo profissional em até 30 dias têm 50% de desconto.',
        },
      ],
    },
    {
      id: 'emergencia',
      title: 'Emergências Odontológicas',
      icon: AlertTriangle,
      color: 'bg-red-500',
      questions: [
        {
          question: 'O que fazer em caso de dor de dente intensa?',
          answer:
            'Para dor intensa: tome analgésico conforme orientação médica, aplique compressa fria e solicite atendimento urgente em nossa plataforma.',
        },
        {
          question: 'Quebrei um dente, o que fazer?',
          answer:
            'Guarde os fragmentos em leite ou soro fisiológico, evite mastigar do lado afetado e procure atendimento imediatamente.',
        },
        {
          question: 'Sangramento na gengiva não para',
          answer:
            'Faça pressão suave com gaze limpa, evite bochechos vigorosos e procure atendimento se não melhorar em 30 minutos.',
        },
        {
          question: 'Inchaço no rosto após procedimento',
          answer:
            'Aplique gelo por 15 minutos a cada hora nas primeiras 24h. Se piorar ou houver febre, procure atendimento imediato.',
        },
      ],
    },
  ];

  // Contact options
  const contactOptions = [
    {
      id: 'chat',
      title: 'Chat Online',
      description: 'Resposta imediata com nossa equipe',
      icon: MessageCircle,
      color: 'bg-accent',
      available: true,
      time: 'Agora',
      action: () => setActiveSection('chat'),
    },
    {
      id: 'whatsapp',
      title: 'WhatsApp',
      description: 'Atendimento via WhatsApp Business',
      icon: MessageSquare,
      color: 'bg-green-500',
      available: true,
      time: '24/7',
      action: () => window.open('https://wa.me/5511999999999', '_blank'),
    },
    {
      id: 'telefone',
      title: 'Telefone',
      description: 'Ligue para nossa central',
      icon: Phone,
      color: 'bg-blue-500',
      available: true,
      time: '8h às 22h',
      action: () => window.open('tel:+551140004000', '_self'),
    },
    {
      id: 'email',
      title: 'E-mail',
      description: 'Envie sua dúvida por e-mail',
      icon: Mail,
      color: 'bg-purple-500',
      available: true,
      time: 'Resposta em 2h',
      action: () => setActiveSection('email'),
    },
    {
      id: 'video',
      title: 'Videochamada',
      description: 'Suporte técnico por vídeo',
      icon: Video,
      color: 'bg-orange-500',
      available: false,
      time: 'Indisponível',
      action: () => {},
    },
    {
      id: 'agendamento',
      title: 'Agendar Callback',
      description: 'Nós ligamos para você',
      icon: Calendar,
      color: 'bg-indigo-500',
      available: true,
      time: 'Escolha o horário',
      action: () => setActiveSection('callback'),
    },
  ];

  // Quick actions
  const quickActions = [
    {
      title: 'Solicitar Atendimento Urgente',
      description: 'Para emergências odontológicas',
      icon: AlertTriangle,
      color: 'bg-red-500',
      action: () => (window.location.hash = '/paciente/solicitar'),
    },
    {
      title: 'Acessar Histórico',
      description: 'Ver consultas anteriores',
      icon: FileText,
      color: 'bg-blue-500',
      action: () => (window.location.hash = '/paciente/historico'),
    },
    {
      title: 'Baixar Documentos',
      description: 'Receitas e exames',
      icon: Download,
      color: 'bg-green-500',
      action: () => (window.location.hash = '/paciente/historico'),
    },
    {
      title: 'Tutorial da Plataforma',
      description: 'Como usar o sistema',
      icon: PlayCircle,
      color: 'bg-purple-500',
      action: () => setActiveSection('tutorial'),
    },
  ];

  // Resources
  const resources = [
    {
      title: 'Guia de Primeiros Socorros Odontológicos',
      description: 'PDF com orientações para emergências',
      type: 'PDF',
      size: '2.1 MB',
      downloads: 1250,
    },
    {
      title: 'Como Preparar-se para uma Teleconsulta',
      description: 'Vídeo tutorial completo',
      type: 'Vídeo',
      size: '15 min',
      downloads: 890,
    },
    {
      title: 'Cuidados Pós-Operatórios',
      description: 'Orientações detalhadas',
      type: 'PDF',
      size: '1.8 MB',
      downloads: 2100,
    },
    {
      title: 'Higiene Bucal: Guia Completo',
      description: 'Técnicas e recomendações',
      type: 'PDF',
      size: '3.2 MB',
      downloads: 3400,
    },
  ];

  const filteredFAQ = faqCategories
    .map(category => ({
      ...category,
      questions: category.questions.filter(
        q =>
          searchTerm === '' ||
          q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
          q.answer.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    }))
    .filter(category => category.questions.length > 0);

  const renderInicio = () => (
    <div className='space-y-8'>
      {/* Hero Section */}
      <div className='text-center py-8 bg-gradient-to-r from-primaryDark to-primary rounded-lg text-white'>
        <Headphones className='h-16 w-16 mx-auto mb-4 opacity-90' />
        <h1 className='text-3xl font-bold mb-2'>Central de Suporte Unio</h1>
        <p className='text-lg opacity-90'>
          Estamos aqui para ajudar você 24 horas por dia, 7 dias por semana
        </p>
      </div>

      {/* Quick Stats */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        <Card>
          <CardContent className='p-6 text-center'>
            <div className='w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-3'>
              <Clock className='h-6 w-6 text-accent' />
            </div>
            <h3 className='font-semibold text-primaryDark mb-1'>Tempo Médio</h3>
            <p className='text-2xl font-bold text-accent'>2 min</p>
            <p className='text-sm text-gray-600'>Resposta no chat</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-6 text-center'>
            <div className='w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-3'>
              <Users className='h-6 w-6 text-green-500' />
            </div>
            <h3 className='font-semibold text-primaryDark mb-1'>Satisfação</h3>
            <p className='text-2xl font-bold text-green-500'>98%</p>
            <p className='text-sm text-gray-600'>Clientes satisfeitos</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-6 text-center'>
            <div className='w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-3'>
              <Shield className='h-6 w-6 text-blue-500' />
            </div>
            <h3 className='font-semibold text-primaryDark mb-1'>
              Disponibilidade
            </h3>
            <p className='text-2xl font-bold text-blue-500'>24/7</p>
            <p className='text-sm text-gray-600'>Sempre online</p>
          </CardContent>
        </Card>
      </div>

      {/* Contact Options */}
      <div>
        <h2 className='text-2xl font-bold text-primaryDark mb-6'>
          Como podemos ajudar?
        </h2>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {contactOptions.map(option => {
            const Icon = option.icon;
            return (
              <Card
                key={option.id}
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  !option.available ? 'opacity-50' : 'hover:scale-105'
                }`}
                onClick={option.available ? option.action : undefined}
              >
                <CardContent className='p-6'>
                  <div className='flex items-center gap-4'>
                    <div
                      className={`w-12 h-12 ${option.color} rounded-lg flex items-center justify-center`}
                    >
                      <Icon className='h-6 w-6 text-white' />
                    </div>
                    <div className='flex-1'>
                      <h3 className='font-semibold text-primaryDark'>
                        {option.title}
                      </h3>
                      <p className='text-sm text-gray-600 mb-1'>
                        {option.description}
                      </p>
                      <div className='flex items-center gap-2'>
                        <Clock className='h-3 w-3 text-gray-400' />
                        <span
                          className={`text-xs ${option.available ? 'text-accent' : 'text-gray-400'}`}
                        >
                          {option.time}
                        </span>
                      </div>
                    </div>
                    {option.available && (
                      <ChevronRight className='h-5 w-5 text-gray-400' />
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className='text-2xl font-bold text-primaryDark mb-6'>
          Ações Rápidas
        </h2>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Card
                key={index}
                className='cursor-pointer hover:shadow-lg transition-all hover:scale-105'
                onClick={action.action}
              >
                <CardContent className='p-6'>
                  <div className='flex items-center gap-4'>
                    <div
                      className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center`}
                    >
                      <Icon className='h-5 w-5 text-white' />
                    </div>
                    <div className='flex-1'>
                      <h3 className='font-medium text-primaryDark'>
                        {action.title}
                      </h3>
                      <p className='text-sm text-gray-600'>
                        {action.description}
                      </p>
                    </div>
                    <ChevronRight className='h-5 w-5 text-gray-400' />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* FAQ Preview */}
      <div>
        <div className='flex items-center justify-between mb-6'>
          <h2 className='text-2xl font-bold text-primaryDark'>
            Perguntas Frequentes
          </h2>
          <Button variant='secondary' onClick={() => setActiveSection('faq')}>
            Ver Todas
            <ChevronRight className='h-4 w-4 ml-2' />
          </Button>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          {faqCategories.slice(0, 4).map(category => {
            const Icon = category.icon;
            return (
              <Card
                key={category.id}
                className='cursor-pointer hover:shadow-lg transition-all'
                onClick={() => {
                  setSelectedCategory(category.id);
                  setActiveSection('faq');
                }}
              >
                <CardContent className='p-6'>
                  <div className='flex items-center gap-3 mb-3'>
                    <div
                      className={`w-8 h-8 ${category.color} rounded-lg flex items-center justify-center`}
                    >
                      <Icon className='h-4 w-4 text-white' />
                    </div>
                    <h3 className='font-medium text-primaryDark'>
                      {category.title}
                    </h3>
                  </div>
                  <p className='text-sm text-gray-600 mb-2'>
                    {category.questions.length} perguntas disponíveis
                  </p>
                  <div className='text-xs text-gray-500'>
                    {category.questions[0]?.question}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Resources */}
      <div>
        <h2 className='text-2xl font-bold text-primaryDark mb-6'>
          Recursos Úteis
        </h2>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          {resources.map((resource, index) => (
            <Card
              key={index}
              className='cursor-pointer hover:shadow-lg transition-all'
            >
              <CardContent className='p-6'>
                <div className='flex items-center justify-between'>
                  <div className='flex-1'>
                    <h3 className='font-medium text-primaryDark mb-1'>
                      {resource.title}
                    </h3>
                    <p className='text-sm text-gray-600 mb-2'>
                      {resource.description}
                    </p>
                    <div className='flex items-center gap-4 text-xs text-gray-500'>
                      <span>
                        {resource.type} • {resource.size}
                      </span>
                      <span>{resource.downloads} downloads</span>
                    </div>
                  </div>
                  <Button size='sm' variant='secondary'>
                    <Download className='h-3 w-3 mr-1' />
                    Baixar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );

  const renderFAQ = () => (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h2 className='text-2xl font-bold text-primaryDark'>
          Perguntas Frequentes
        </h2>
        <Button variant='secondary' onClick={() => setActiveSection('inicio')}>
          <ArrowLeft className='h-4 w-4 mr-2' />
          Voltar
        </Button>
      </div>

      {/* Search */}
      <div className='relative'>
        <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4' />
        <input
          type='text'
          placeholder='Buscar nas perguntas frequentes...'
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className='w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent'
        />
      </div>

      {/* Categories */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        {faqCategories.map(category => {
          const Icon = category.icon;
          return (
            <button
              key={category.id}
              onClick={() =>
                setSelectedCategory(
                  selectedCategory === category.id ? '' : category.id
                )
              }
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                selectedCategory === category.id
                  ? 'border-accent bg-accent/5'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className='flex items-center gap-3'>
                <div
                  className={`w-8 h-8 ${category.color} rounded-lg flex items-center justify-center`}
                >
                  <Icon className='h-4 w-4 text-white' />
                </div>
                <div>
                  <h3 className='font-medium text-primaryDark text-sm'>
                    {category.title}
                  </h3>
                  <p className='text-xs text-gray-500'>
                    {category.questions.length} perguntas
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* FAQ Items */}
      <div className='space-y-4'>
        {filteredFAQ.map(
          category =>
            (!selectedCategory || selectedCategory === category.id) && (
              <div key={category.id}>
                <h3 className='text-lg font-semibold text-primaryDark mb-4 flex items-center gap-2'>
                  <category.icon className='h-5 w-5 text-accent' />
                  {category.title}
                </h3>
                <div className='space-y-3'>
                  {category.questions.map((faq, index) => (
                    <Card key={index}>
                      <CardContent className='p-6'>
                        <h4 className='font-medium text-primaryDark mb-2'>
                          {faq.question}
                        </h4>
                        <p className='text-gray-700 text-sm leading-relaxed'>
                          {faq.answer}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )
        )}
      </div>

      {filteredFAQ.length === 0 && (
        <Card>
          <CardContent className='p-12 text-center'>
            <HelpCircle className='h-16 w-16 text-gray-300 mx-auto mb-4' />
            <h3 className='text-lg font-medium text-gray-500 mb-2'>
              Nenhuma pergunta encontrada
            </h3>
            <p className='text-gray-400 mb-6'>
              Tente usar termos diferentes ou entre em contato conosco
            </p>
            <Button onClick={() => setActiveSection('chat')}>
              <MessageCircle className='h-4 w-4 mr-2' />
              Falar com Suporte
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderChat = () => (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h2 className='text-2xl font-bold text-primaryDark'>
          Chat com Suporte
        </h2>
        <Button variant='secondary' onClick={() => setActiveSection('inicio')}>
          <ArrowLeft className='h-4 w-4 mr-2' />
          Voltar
        </Button>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Chat Area */}
        <div className='lg:col-span-2'>
          <Card className='h-96'>
            <CardHeader className='bg-accent text-white rounded-t-lg'>
              <div className='flex items-center gap-3'>
                <div className='w-10 h-10 bg-white/20 rounded-full flex items-center justify-center'>
                  <Headphones className='h-5 w-5' />
                </div>
                <div>
                  <h3 className='font-medium'>Suporte Unio</h3>
                  <p className='text-sm opacity-90'>Online agora</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className='p-0 flex flex-col h-80'>
              {/* Messages */}
              <div className='flex-1 p-4 space-y-4 overflow-y-auto'>
                <div className='flex gap-3'>
                  <div className='w-8 h-8 bg-accent rounded-full flex items-center justify-center'>
                    <Headphones className='h-4 w-4 text-white' />
                  </div>
                  <div className='bg-gray-100 rounded-lg p-3 max-w-xs'>
                    <p className='text-sm'>
                      Olá! Sou a Ana do suporte Unio. Como posso ajudá-lo hoje?
                    </p>
                    <span className='text-xs text-gray-500'>Agora</span>
                  </div>
                </div>
              </div>

              {/* Input */}
              <div className='p-4 border-t border-gray-200'>
                <div className='flex gap-2'>
                  <input
                    type='text'
                    value={chatMessage}
                    onChange={e => setChatMessage(e.target.value)}
                    placeholder='Digite sua mensagem...'
                    className='flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent'
                  />
                  <Button size='sm'>
                    <Paperclip className='h-4 w-4' />
                  </Button>
                  <Button size='sm'>
                    <Smile className='h-4 w-4' />
                  </Button>
                  <Button>
                    <Send className='h-4 w-4' />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chat Info */}
        <div className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>Informações do Chat</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='flex items-center gap-2'>
                <div className='w-2 h-2 bg-green-500 rounded-full'></div>
                <span className='text-sm'>Ana - Suporte Técnico</span>
              </div>
              <div className='text-sm text-gray-600'>
                <p>• Tempo médio de resposta: 30 segundos</p>
                <p>• Horário: 24/7</p>
                <p>• Idiomas: Português, Inglês</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>Dicas para o Chat</CardTitle>
            </CardHeader>
            <CardContent className='space-y-2 text-sm text-gray-600'>
              <p>• Seja específico sobre seu problema</p>
              <p>• Anexe prints se necessário</p>
              <p>• Tenha seu número de consulta em mãos</p>
              <p>• Mantenha a conversa focada</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'faq':
        return renderFAQ();
      case 'chat':
        return renderChat();
      case 'inicio':
      default:
        return renderInicio();
    }
  };

  return (
    <div className='space-y-6'>
      {onBack && (
        <Button variant='secondary' onClick={onBack}>
          <ArrowLeft className='h-4 w-4 mr-2' />
          Voltar ao Dashboard
        </Button>
      )}

      {renderContent()}
    </div>
  );
}
