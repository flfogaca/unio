import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useState } from 'react';
import {
  Users,
  Search,
  Filter,
  Plus,
  Edit,
  Eye,
  MoreVertical,
  Phone,
  Calendar,
  Star,
  Activity,
  Download,
  X,
  User,
  Stethoscope,
  Crown,
  MapPin,
  Save,
  ArrowLeft,
} from 'lucide-react';

interface GerenciarUsuariosProps {
  onBack?: () => void;
}

export function GerenciarUsuarios({ onBack }: GerenciarUsuariosProps) {
  const [activeTab, setActiveTab] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('todos');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'create' | 'edit' | 'view'>(
    'create'
  );
  interface Usuario {
    id: string;
    nome: string;
    email: string;
    telefone: string;
    tipo: 'paciente' | 'dentista' | 'psicologo' | 'medico' | 'admin';
    status: string;
    especialidades?: string[];
    cro?: string;
    cpf?: string;
    endereco?: string;
    avatar?: string;
    dataCadastro?: Date;
    consultasRealizadas?: number;
    avaliacaoMedia?: number;
    ultimoAcesso?: Date;
    ultimaConsulta?: Date;
    plano?: string;
    permissoes?: string[];
  }

  const [selectedUser, setSelectedUser] = useState<Usuario | null>(null);

  const usuarios: Usuario[] = [
    {
      id: '1',
      nome: 'Dr. João Silva',
      email: 'joao.silva@unio.com',
      telefone: '(11) 99999-9999',
      tipo: 'dentista',
      status: 'ativo',
      especialidades: ['Clínica Geral', 'Endodontia'],
      cro: 'CRO-SP 12345',
      consultasRealizadas: 247,
      avaliacaoMedia: 4.8,
      ultimoAcesso: new Date('2024-01-20T14:30:00'),
      dataCadastro: new Date('2023-06-15'),
      endereco: 'São Paulo, SP',
      avatar:
        'https://images.pexels.com/photos/5215024/pexels-photo-5215024.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    },
    {
      id: '2',
      nome: 'Dra. Maria Santos',
      email: 'maria.santos@unio.com',
      telefone: '(11) 88888-8888',
      tipo: 'dentista',
      status: 'ativo',
      especialidades: ['Ortodontia', 'Periodontia'],
      cro: 'CRO-SP 67890',
      consultasRealizadas: 189,
      avaliacaoMedia: 4.9,
      ultimoAcesso: new Date('2024-01-20T16:45:00'),
      dataCadastro: new Date('2023-08-20'),
      endereco: 'São Paulo, SP',
      avatar:
        'https://images.pexels.com/photos/5452293/pexels-photo-5452293.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    },
    {
      id: '3',
      nome: 'Ana Costa',
      email: 'ana.costa@email.com',
      telefone: '(11) 77777-7777',
      tipo: 'paciente',
      status: 'ativo',
      consultasRealizadas: 12,
      ultimaConsulta: new Date('2024-01-18'),
      dataCadastro: new Date('2023-12-10'),
      endereco: 'São Paulo, SP',
      plano: 'Particular',
    },
    {
      id: '4',
      nome: 'Carlos Oliveira',
      email: 'carlos.oliveira@email.com',
      telefone: '(11) 66666-6666',
      tipo: 'paciente',
      status: 'inativo',
      consultasRealizadas: 5,
      ultimaConsulta: new Date('2023-11-15'),
      dataCadastro: new Date('2023-09-05'),
      endereco: 'Rio de Janeiro, RJ',
      plano: 'Convênio',
    },
    {
      id: '5',
      nome: 'Admin Sistema',
      email: 'admin@unio.com',
      telefone: '(11) 55555-5555',
      tipo: 'admin',
      status: 'ativo',
      ultimoAcesso: new Date('2024-01-20T18:00:00'),
      dataCadastro: new Date('2023-01-01'),
      permissoes: [
        'Gerenciar Usuários',
        'Configurar Sistema',
        'Relatórios',
        'Financeiro',
      ],
    },
  ];

  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    cpf: '',
    telefone: '',
    tipo: 'paciente' as
      | 'paciente'
      | 'dentista'
      | 'psicologo'
      | 'medico'
      | 'admin',
    especialidades: [] as string[],
    cro: '',
    endereco: '',
    status: 'ativo',
    password: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const tabs = [
    { id: 'todos', label: 'Todos', count: usuarios.length },
    {
      id: 'dentistas',
      label: 'Dentistas',
      count: usuarios.filter(u => u.tipo === 'dentista').length,
    },
    {
      id: 'pacientes',
      label: 'Pacientes',
      count: usuarios.filter(u => u.tipo === 'paciente').length,
    },
    {
      id: 'admins',
      label: 'Administradores',
      count: usuarios.filter(u => u.tipo === 'admin').length,
    },
  ];

  const filteredUsers = usuarios.filter(user => {
    const matchTab =
      activeTab === 'todos' ||
      user.tipo === activeTab.slice(0, -1) ||
      (activeTab === 'admins' && user.tipo === 'admin');
    const matchSearch =
      searchTerm === '' ||
      user.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchFilter =
      selectedFilter === 'todos' || user.status === selectedFilter;

    return matchTab && matchSearch && matchFilter;
  });

  const stats = [
    {
      title: 'Total de Usuários',
      value: usuarios.length,
      change: '+12 este mês',
      changeType: 'positive',
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      title: 'Dentistas Ativos',
      value: usuarios.filter(u => u.tipo === 'dentista' && u.status === 'ativo')
        .length,
      change: '+2 esta semana',
      changeType: 'positive',
      icon: Stethoscope,
      color: 'bg-accent',
    },
    {
      title: 'Pacientes Ativos',
      value: usuarios.filter(u => u.tipo === 'paciente' && u.status === 'ativo')
        .length,
      change: '+8 esta semana',
      changeType: 'positive',
      icon: User,
      color: 'bg-green-500',
    },
    {
      title: 'Taxa de Atividade',
      value: '94%',
      change: '+2% este mês',
      changeType: 'positive',
      icon: Activity,
      color: 'bg-purple-500',
    },
  ];

  const handleCreateUser = () => {
    setModalType('create');
    setSelectedUser(null);
    setFormData({
      nome: '',
      email: '',
      cpf: '',
      telefone: '',
      tipo: 'paciente',
      especialidades: [],
      cro: '',
      endereco: '',
      status: 'ativo',
      password: '',
    });
    setError(null);
    setSuccess(null);
    setShowModal(true);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (modalType === 'create') {
        const userData: {
          name: string;
          email: string;
          phone: string;
          role: string;
          password: string;
          cpf?: string;
          cro?: string;
        } = {
          name: formData.nome,
          email: formData.email,
          phone: formData.telefone,
          role: formData.tipo,
          password: formData.password || 'Unio@123',
        };

        if (formData.tipo === 'paciente') {
          userData.cpf = formData.cpf.replace(/\D/g, '');
        } else {
          userData.cro = formData.cro;
        }

        const response = await fetch('/api/v1/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Erro ao criar usuário');
        }

        setSuccess('Usuário criado com sucesso!');
        setTimeout(() => {
          setShowModal(false);
          window.location.reload();
        }, 1500);
      } else {
        if (!selectedUser) {
          setError('Usuário não selecionado');
          setLoading(false);
          return;
        }
        const response = await fetch(`/api/v1/users/${selectedUser.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: formData.nome,
            email: formData.email,
            phone: formData.telefone,
            role: formData.tipo,
          }),
        });

        if (!response.ok) {
          throw new Error('Erro ao atualizar usuário');
        }

        setSuccess('Usuário atualizado com sucesso!');
        setTimeout(() => {
          setShowModal(false);
          window.location.reload();
        }, 1500);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Erro ao processar solicitação'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user: Usuario) => {
    setModalType('edit');
    setSelectedUser(user);
    setFormData({
      nome: user.nome,
      email: user.email,
      cpf: user.cpf || '',
      telefone: user.telefone,
      tipo: user.tipo as
        | 'paciente'
        | 'dentista'
        | 'psicologo'
        | 'medico'
        | 'admin',
      especialidades: user.especialidades || [],
      cro: user.cro || '',
      endereco: user.endereco || '',
      status: user.status,
      password: '',
    });
    setError(null);
    setSuccess(null);
    setShowModal(true);
  };

  const handleViewUser = (user: Usuario) => {
    setModalType('view');
    setSelectedUser(user);
    setShowModal(true);
  };

  const getUserIcon = (tipo: string) => {
    switch (tipo) {
      case 'dentista':
        return Stethoscope;
      case 'admin':
        return Crown;
      default:
        return User;
    }
  };

  const getUserTypeColor = (tipo: string) => {
    switch (tipo) {
      case 'dentista':
        return 'bg-accent/10 text-accent';
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const renderUserModal = () => {
    if (!showModal) return null;

    return (
      <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
        <div className='bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden'>
          <div className='flex items-center justify-between p-6 border-b border-gray-200'>
            <h2 className='text-xl font-bold text-primaryDark'>
              {modalType === 'create'
                ? 'Novo Usuário'
                : modalType === 'edit'
                  ? 'Editar Usuário'
                  : 'Detalhes do Usuário'}
            </h2>
            <Button variant='secondary' onClick={() => setShowModal(false)}>
              <X className='h-4 w-4' />
            </Button>
          </div>

          <div className='p-6 overflow-y-auto max-h-[calc(90vh-140px)]'>
            {modalType === 'view' && selectedUser ? (
              <div className='space-y-6'>
                {/* Header do usuário */}
                <div className='flex items-center gap-4 p-4 bg-gray-50 rounded-lg'>
                  {selectedUser.avatar ? (
                    <img
                      src={selectedUser.avatar}
                      alt={selectedUser.nome}
                      className='w-16 h-16 rounded-full object-cover'
                    />
                  ) : (
                    <div className='w-16 h-16 bg-accent rounded-full flex items-center justify-center'>
                      <span className='text-white text-xl font-bold'>
                        {selectedUser.nome.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div className='flex-1'>
                    <h3 className='text-lg font-semibold text-primaryDark'>
                      {selectedUser.nome}
                    </h3>
                    <p className='text-gray-600'>{selectedUser.email}</p>
                    <div className='flex items-center gap-2 mt-1'>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getUserTypeColor(selectedUser.tipo)}`}
                      >
                        {selectedUser.tipo.charAt(0).toUpperCase() +
                          selectedUser.tipo.slice(1)}
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          selectedUser.status === 'ativo'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {selectedUser.status.charAt(0).toUpperCase() +
                          selectedUser.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Informações detalhadas */}
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <div>
                    <h4 className='font-medium text-primaryDark mb-3'>
                      Informações Pessoais
                    </h4>
                    <div className='space-y-2 text-sm'>
                      <div className='flex items-center gap-2'>
                        <Phone className='h-4 w-4 text-gray-400' />
                        <span>{selectedUser.telefone}</span>
                      </div>
                      <div className='flex items-center gap-2'>
                        <MapPin className='h-4 w-4 text-gray-400' />
                        <span>{selectedUser.endereco}</span>
                      </div>
                      {selectedUser.dataCadastro && (
                        <div className='flex items-center gap-2'>
                          <Calendar className='h-4 w-4 text-gray-400' />
                          <span>
                            Cadastrado em{' '}
                            {selectedUser.dataCadastro.toLocaleDateString(
                              'pt-BR'
                            )}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className='font-medium text-primaryDark mb-3'>
                      Estatísticas
                    </h4>
                    <div className='space-y-2 text-sm'>
                      {selectedUser.tipo === 'dentista' && (
                        <>
                          <div className='flex justify-between'>
                            <span className='text-gray-600'>CRO:</span>
                            <span className='font-medium'>
                              {selectedUser.cro}
                            </span>
                          </div>
                          {selectedUser.consultasRealizadas !== undefined && (
                            <div className='flex justify-between'>
                              <span className='text-gray-600'>Consultas:</span>
                              <span className='font-medium'>
                                {selectedUser.consultasRealizadas}
                              </span>
                            </div>
                          )}
                          {selectedUser.avaliacaoMedia !== undefined && (
                            <div className='flex justify-between'>
                              <span className='text-gray-600'>Avaliação:</span>
                              <div className='flex items-center gap-1'>
                                <Star className='h-3 w-3 text-yellow-400 fill-current' />
                                <span className='font-medium'>
                                  {selectedUser.avaliacaoMedia}
                                </span>
                              </div>
                            </div>
                          )}
                          {selectedUser.ultimoAcesso && (
                            <div className='flex justify-between'>
                              <span className='text-gray-600'>
                                Último acesso:
                              </span>
                              <span className='font-medium'>
                                {selectedUser.ultimoAcesso.toLocaleDateString(
                                  'pt-BR'
                                )}
                              </span>
                            </div>
                          )}
                        </>
                      )}

                      {selectedUser.tipo === 'paciente' && (
                        <>
                          {selectedUser.consultasRealizadas !== undefined && (
                            <div className='flex justify-between'>
                              <span className='text-gray-600'>Consultas:</span>
                              <span className='font-medium'>
                                {selectedUser.consultasRealizadas}
                              </span>
                            </div>
                          )}
                          {selectedUser.ultimaConsulta && (
                            <div className='flex justify-between'>
                              <span className='text-gray-600'>
                                Última consulta:
                              </span>
                              <span className='font-medium'>
                                {selectedUser.ultimaConsulta.toLocaleDateString(
                                  'pt-BR'
                                )}
                              </span>
                            </div>
                          )}
                          {selectedUser.plano && (
                            <div className='flex justify-between'>
                              <span className='text-gray-600'>Plano:</span>
                              <span className='font-medium'>
                                {selectedUser.plano}
                              </span>
                            </div>
                          )}
                        </>
                      )}

                      {selectedUser.tipo === 'admin' && (
                        <>
                          {selectedUser.ultimoAcesso && (
                            <div className='flex justify-between'>
                              <span className='text-gray-600'>
                                Último acesso:
                              </span>
                              <span className='font-medium'>
                                {selectedUser.ultimoAcesso.toLocaleDateString(
                                  'pt-BR'
                                )}
                              </span>
                            </div>
                          )}
                          {selectedUser.permissoes &&
                            selectedUser.permissoes.length > 0 && (
                              <div>
                                <span className='text-gray-600'>
                                  Permissões:
                                </span>
                                <div className='mt-1 flex flex-wrap gap-1'>
                                  {selectedUser.permissoes.map(
                                    (perm: string, index: number) => (
                                      <span
                                        key={index}
                                        className='bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded'
                                      >
                                        {perm}
                                      </span>
                                    )
                                  )}
                                </div>
                              </div>
                            )}
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {selectedUser.especialidades &&
                  selectedUser.especialidades.length > 0 && (
                    <div>
                      <h4 className='font-medium text-primaryDark mb-3'>
                        Especialidades
                      </h4>
                      <div className='flex flex-wrap gap-2'>
                        {selectedUser.especialidades.map(
                          (esp: string, index: number) => (
                            <span
                              key={index}
                              className='bg-accent/10 text-accent px-3 py-1 rounded-full text-sm'
                            >
                              {esp}
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  )}
              </div>
            ) : (
              <form className='space-y-4'>
                {error && (
                  <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg'>
                    {error}
                  </div>
                )}
                {success && (
                  <div className='bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg'>
                    {success}
                  </div>
                )}

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Nome Completo *
                    </label>
                    <input
                      type='text'
                      value={formData.nome}
                      onChange={e =>
                        setFormData(prev => ({ ...prev, nome: e.target.value }))
                      }
                      className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent'
                      placeholder='Digite o nome completo'
                      required
                    />
                  </div>
                  {formData.tipo === 'paciente' ? (
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        CPF *
                      </label>
                      <input
                        type='text'
                        value={formData.cpf}
                        onChange={e => {
                          let value = e.target.value.replace(/\D/g, '');
                          if (value.length > 11) value = value.slice(0, 11);
                          if (value.length > 0) {
                            value = value.replace(/^(\d{3})(\d)/, '$1.$2');
                            value = value.replace(
                              /^(\d{3})\.(\d{3})(\d)/,
                              '$1.$2.$3'
                            );
                            value = value.replace(/\.(\d{3})(\d)/, '.$1-$2');
                          }
                          setFormData(prev => ({ ...prev, cpf: value }));
                        }}
                        className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent'
                        placeholder='000.000.000-00'
                        maxLength={14}
                        required
                      />
                    </div>
                  ) : (
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        {formData.tipo === 'dentista'
                          ? 'CRO *'
                          : formData.tipo === 'psicologo'
                            ? 'CRP *'
                            : formData.tipo === 'medico'
                              ? 'CRM *'
                              : 'Registro *'}
                      </label>
                      <input
                        type='text'
                        value={formData.cro}
                        onChange={e =>
                          setFormData(prev => ({
                            ...prev,
                            cro: e.target.value,
                          }))
                        }
                        className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent'
                        placeholder={
                          formData.tipo === 'dentista'
                            ? 'CRO-SP 12345'
                            : formData.tipo === 'psicologo'
                              ? 'CRP 06/123456'
                              : formData.tipo === 'medico'
                                ? 'CRM 123456-SP'
                                : 'Registro Profissional'
                        }
                        required
                      />
                    </div>
                  )}
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      E-mail *
                    </label>
                    <input
                      type='email'
                      value={formData.email}
                      onChange={e =>
                        setFormData(prev => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent'
                      placeholder='email@exemplo.com'
                      required
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Telefone
                    </label>
                    <input
                      type='tel'
                      value={formData.telefone}
                      onChange={e =>
                        setFormData(prev => ({
                          ...prev,
                          telefone: e.target.value,
                        }))
                      }
                      className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent'
                      placeholder='(11) 99999-9999'
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Tipo de Usuário *
                    </label>
                    <select
                      value={formData.tipo}
                      onChange={e =>
                        setFormData(prev => ({
                          ...prev,
                          tipo: e.target.value as
                            | 'paciente'
                            | 'dentista'
                            | 'psicologo'
                            | 'medico'
                            | 'admin',
                        }))
                      }
                      className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent'
                      required
                    >
                      <option value='paciente'>Paciente</option>
                      <option value='dentista'>Dentista</option>
                      <option value='psicologo'>Psicólogo</option>
                      <option value='medico'>Clínico Geral</option>
                      <option value='admin'>Administrador</option>
                    </select>
                  </div>
                  {modalType === 'create' && (
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Senha{' '}
                        {modalType === 'create'
                          ? '*'
                          : '(deixe vazio para não alterar)'}
                      </label>
                      <input
                        type='password'
                        value={formData.password}
                        onChange={e =>
                          setFormData(prev => ({
                            ...prev,
                            password: e.target.value,
                          }))
                        }
                        className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent'
                        placeholder={
                          modalType === 'create'
                            ? 'Mínimo 6 caracteres'
                            : 'Deixe vazio para não alterar'
                        }
                        minLength={6}
                        required={modalType === 'create'}
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Endereço
                  </label>
                  <input
                    type='text'
                    value={formData.endereco}
                    onChange={e =>
                      setFormData(prev => ({
                        ...prev,
                        endereco: e.target.value,
                      }))
                    }
                    className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent'
                    placeholder='Cidade, Estado'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={e =>
                      setFormData(prev => ({ ...prev, status: e.target.value }))
                    }
                    className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent'
                  >
                    <option value='ativo'>Ativo</option>
                    <option value='inativo'>Inativo</option>
                  </select>
                </div>
              </form>
            )}
          </div>

          {modalType !== 'view' && (
            <div className='flex justify-end gap-3 p-6 border-t border-gray-200'>
              <Button
                variant='secondary'
                onClick={() => setShowModal(false)}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button onClick={handleSubmit} disabled={loading}>
                <Save className='h-4 w-4 mr-2' />
                {loading
                  ? 'Salvando...'
                  : modalType === 'create'
                    ? 'Criar Usuário'
                    : 'Salvar Alterações'}
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          {onBack && (
            <Button variant='secondary' onClick={onBack}>
              <ArrowLeft className='h-4 w-4 mr-2' />
              Voltar
            </Button>
          )}
          <div>
            <h1 className='text-3xl font-bold text-primaryDark'>
              Gerenciar Usuários
            </h1>
            <p className='text-gray-600 mt-1'>
              Gerencie pacientes, dentistas e administradores do sistema
            </p>
          </div>
        </div>
        <div className='flex gap-3'>
          <Button variant='secondary'>
            <Download className='h-4 w-4 mr-2' />
            Exportar
          </Button>
          <Button onClick={handleCreateUser}>
            <Plus className='h-4 w-4 mr-2' />
            Novo Usuário
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        {stats.map(stat => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardContent className='p-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm font-medium text-gray-600'>
                      {stat.title}
                    </p>
                    <p className='text-2xl font-bold text-primaryDark'>
                      {stat.value}
                    </p>
                    <div className='flex items-center mt-2'>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          stat.changeType === 'positive'
                            ? 'bg-green-100 text-green-800'
                            : stat.changeType === 'negative'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {stat.change}
                      </span>
                    </div>
                  </div>
                  <div
                    className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}
                  >
                    <Icon className='h-6 w-6 text-white' />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className='p-6'>
          <div className='flex flex-col lg:flex-row gap-4'>
            <div className='flex-1'>
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4' />
                <input
                  type='text'
                  placeholder='Buscar por nome, email ou CRO...'
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className='w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent'
                />
              </div>
            </div>

            <div className='flex gap-2'>
              <select
                value={selectedFilter}
                onChange={e => setSelectedFilter(e.target.value)}
                className='px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent'
              >
                <option value='todos'>Todos os status</option>
                <option value='ativo'>Ativos</option>
                <option value='inativo'>Inativos</option>
              </select>

              <Button variant='secondary'>
                <Filter className='h-4 w-4 mr-2' />
                Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className='border-b border-gray-200'>
        <nav className='flex space-x-8'>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-accent text-accent'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
              <span
                className={`px-2 py-1 rounded-full text-xs ${
                  activeTab === tab.id
                    ? 'bg-accent text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Users Table */}
      <Card>
        <CardContent className='p-0'>
          <div className='overflow-x-auto'>
            <table className='w-full'>
              <thead className='bg-gray-50 border-b border-gray-200'>
                <tr>
                  <th className='text-left p-4 font-medium text-gray-600'>
                    Usuário
                  </th>
                  <th className='text-left p-4 font-medium text-gray-600'>
                    Tipo
                  </th>
                  <th className='text-left p-4 font-medium text-gray-600'>
                    Status
                  </th>
                  <th className='text-left p-4 font-medium text-gray-600'>
                    Estatísticas
                  </th>
                  <th className='text-left p-4 font-medium text-gray-600'>
                    Último Acesso
                  </th>
                  <th className='text-left p-4 font-medium text-gray-600'>
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => {
                  const Icon = getUserIcon(user.tipo);
                  return (
                    <tr
                      key={user.id}
                      className='border-b border-gray-100 hover:bg-gray-50'
                    >
                      <td className='p-4'>
                        <div className='flex items-center gap-3'>
                          {user.avatar ? (
                            <img
                              src={user.avatar}
                              alt={user.nome}
                              className='w-10 h-10 rounded-full object-cover'
                            />
                          ) : (
                            <div className='w-10 h-10 bg-accent rounded-full flex items-center justify-center'>
                              <span className='text-white font-medium'>
                                {user.nome.charAt(0)}
                              </span>
                            </div>
                          )}
                          <div>
                            <p className='font-medium text-primaryDark'>
                              {user.nome}
                            </p>
                            <p className='text-sm text-gray-600'>
                              {user.email}
                            </p>
                            {user.cro && (
                              <p className='text-xs text-gray-500'>
                                {user.cro}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className='p-4'>
                        <div className='flex items-center gap-2'>
                          <Icon className='h-4 w-4 text-gray-400' />
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getUserTypeColor(user.tipo)}`}
                          >
                            {user.tipo.charAt(0).toUpperCase() +
                              user.tipo.slice(1)}
                          </span>
                        </div>
                      </td>
                      <td className='p-4'>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.status === 'ativo'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {user.status.charAt(0).toUpperCase() +
                            user.status.slice(1)}
                        </span>
                      </td>
                      <td className='p-4'>
                        <div className='text-sm'>
                          {user.tipo === 'dentista' && (
                            <>
                              <p className='font-medium'>
                                {user.consultasRealizadas} consultas
                              </p>
                              <div className='flex items-center gap-1'>
                                <Star className='h-3 w-3 text-yellow-400 fill-current' />
                                <span className='text-gray-600'>
                                  {user.avaliacaoMedia}
                                </span>
                              </div>
                            </>
                          )}
                          {user.tipo === 'paciente' && (
                            <p className='font-medium'>
                              {user.consultasRealizadas} consultas
                            </p>
                          )}
                          {user.tipo === 'admin' && (
                            <p className='text-gray-600'>Administrador</p>
                          )}
                        </div>
                      </td>
                      <td className='p-4'>
                        <div className='text-sm text-gray-600'>
                          {user.ultimoAcesso ? (
                            <>
                              <p>
                                {user.ultimoAcesso.toLocaleDateString('pt-BR')}
                              </p>
                              <p className='text-xs'>
                                {user.ultimoAcesso.toLocaleTimeString('pt-BR', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </p>
                            </>
                          ) : (
                            <p>Nunca acessou</p>
                          )}
                        </div>
                      </td>
                      <td className='p-4'>
                        <div className='flex items-center gap-2'>
                          <Button
                            size='sm'
                            variant='secondary'
                            onClick={() => handleViewUser(user)}
                          >
                            <Eye className='h-3 w-3' />
                          </Button>
                          <Button
                            size='sm'
                            variant='secondary'
                            onClick={() => handleEditUser(user)}
                          >
                            <Edit className='h-3 w-3' />
                          </Button>
                          <Button size='sm' variant='secondary'>
                            <MoreVertical className='h-3 w-3' />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Modal */}
      {renderUserModal()}
    </div>
  );
}
