import { useState, useEffect, useCallback, useRef } from 'react';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { AuthError } from './components/AuthError';
import { LoginTrabalho } from './components/LoginTrabalho';
import { SpecialtiesDashboard } from './components/SpecialtiesDashboard';
import { SolicitarAtendimento } from './components/SolicitarAtendimento';
import { PacienteDashboard } from './components/paciente/Dashboard';
import { SolicitarAtendimento as PacienteSolicitarAtendimento } from './components/paciente/SolicitarAtendimento';
import { HistoricoConsultas } from './components/paciente/HistoricoConsultas';
import { PacienteConsultaRoom } from './components/paciente/PacienteConsultaRoom';
import { FilaAtendimento } from './components/dentista/FilaAtendimento';
import { ConsultasAtivas } from './components/dentista/ConsultasAtivas';
import { PerfilDentista } from './components/dentista/PerfilDentista';
import { ConsultaRoom } from './components/dentista/ConsultaRoom';
import { AdminDashboard } from './components/admin/Dashboard';
import { GerenciarUsuarios } from './components/admin/GerenciarUsuarios';
import { ConfigurarFila } from './components/admin/ConfigurarFila';
import { Financeiro } from './components/admin/Financeiro';
import { Relatorios } from './components/admin/Relatorios';
import { Perfil } from './components/Perfil';
import { Configuracoes } from './components/Configuracoes';
// import { DebugAuthPage } from './components/DebugAuthPage';
import { useAuthStore } from './stores/auth';
import './lib/debugAuth';
import './index.css';

function App() {
  const [currentPath, setCurrentPath] = useState('/');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isAuthenticated, isLoading, checkAuth, user } = useAuthStore();
  const hasNavigatedRef = useRef(false);

  // Check authentication on app load
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Recuperar dados do usuário se estiver autenticado mas sem dados
  useEffect(() => {
    if (isAuthenticated && !user) {
      checkAuth();
    }
  }, [isAuthenticated, user, checkAuth]);

  const navigate = useCallback((path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    setSidebarOpen(false);
  }, []);

  useEffect(() => {
    const handleLocationChange = () => {
      const hash = window.location.hash.substring(1);
      setCurrentPath(hash || window.location.pathname || '/');
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    handleLocationChange();

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  useEffect(() => {
    if (
      isAuthenticated &&
      user &&
      currentPath === '/' &&
      !hasNavigatedRef.current
    ) {
      const defaultRoute = {
        paciente: '/paciente',
        dentista: '/dentista',
        psicologo: '/dentista',
        medico: '/dentista',
        admin: '/admin',
      };
      const route =
        defaultRoute[user.role as keyof typeof defaultRoute] || '/paciente';
      hasNavigatedRef.current = true;
      window.history.pushState({}, '', route);
      setTimeout(() => {
        setCurrentPath(route);
        setSidebarOpen(false);
      }, 0);
    }
  }, [isAuthenticated, user, currentPath, navigate]);

  const handleSelectSpecialty = (specialtyId: string) => {
    // Navigate to specialty-specific page
    setCurrentPath(`/solicitar-atendimento/${specialtyId}`);
  };

  if (currentPath === '/login/trabalho') {
    return <LoginTrabalho />;
  }

  // if (currentPath === '/debug-auth') {
  //   return <DebugAuthPage />;
  // }

  if (isLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-grayBg'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto'></div>
          <p className='mt-4 text-gray-600'>Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthError />;
  }

  const renderContent = () => {
    const userRole = getUserRole();
    if (!hasAccessToRoute(currentPath, userRole)) {
      // Redirecionar automaticamente para o dashboard do usuário
      const defaultRoute = {
        paciente: '/paciente',
        dentista: '/dentista',
        psicologo: '/dentista',
        medico: '/dentista',
        admin: '/admin',
      };
      const route =
        defaultRoute[userRole as keyof typeof defaultRoute] || '/paciente';
      navigate(route);
      return (
        <div className='flex items-center justify-center h-64'>
          Redirecionando para seu dashboard...
        </div>
      );
    }

    const consultaMatch = currentPath.match(/^\/dentista\/consulta\/(.+)$/);
    if (consultaMatch) {
      return <ConsultaRoom consultaId={consultaMatch[1]} />;
    }

    const pacienteConsultaMatch = currentPath.match(
      /^\/paciente\/consulta\/(.+)$/
    );
    if (pacienteConsultaMatch) {
      return <PacienteConsultaRoom consultaId={pacienteConsultaMatch[1]} />;
    }

    // Extract specialty from solicitar-atendimento path
    const specialtyMatch = currentPath.match(/^\/solicitar-atendimento\/(.+)$/);
    if (specialtyMatch) {
      return (
        <SolicitarAtendimento
          specialtyId={specialtyMatch[1]}
          onBack={() => setCurrentPath('/')}
        />
      );
    }

    switch (currentPath) {
      // Main dashboard with specialties
      case '/':
        return (
          <SpecialtiesDashboard onSelectSpecialty={handleSelectSpecialty} />
        );

      // Paciente routes
      case '/paciente':
        return <PacienteDashboard />;
      case '/paciente/solicitar':
        return <PacienteSolicitarAtendimento />;
      case '/paciente/historico':
        return <HistoricoConsultas />;

      // Dentista routes
      case '/dentista':
        return <FilaAtendimento />;
      case '/dentista/consultas':
        return <ConsultasAtivas />;
      case '/dentista/perfil':
        return <PerfilDentista />;

      // Admin routes
      case '/admin':
        return <AdminDashboard />;
      case '/admin/usuarios':
        return <GerenciarUsuarios onBack={() => navigate('/admin')} />;
      case '/admin/regras':
        return <ConfigurarFila onBack={() => navigate('/admin')} />;
      case '/admin/financeiro':
        return <Financeiro onBack={() => navigate('/admin')} />;
      case '/admin/relatorios':
        return <Relatorios onBack={() => navigate('/admin')} />;

      // Profile and Settings routes
      case '/perfil':
        return <Perfil />;
      case '/configuracoes':
        return <Configuracoes />;

      default: {
        const defaultRoute = {
          paciente: '/paciente',
          dentista: '/dentista',
          psicologo: '/dentista',
          medico: '/dentista',
          admin: '/admin',
        };
        const route =
          defaultRoute[getUserRole() as keyof typeof defaultRoute] ||
          '/paciente';
        navigate(route);
        return <div>Redirecionando...</div>;
      }
    }
  };

  const getUserRole = () => {
    return user?.role || 'paciente';
  };

  // Verificar se o usuário tem acesso à rota atual
  const hasAccessToRoute = (path: string, userRole: string) => {
    if (path.startsWith('/paciente')) return userRole === 'paciente';
    if (path.startsWith('/dentista'))
      return ['dentista', 'psicologo', 'medico'].includes(userRole);
    if (path.startsWith('/admin')) return userRole === 'admin';
    if (path.startsWith('/perfil') || path.startsWith('/configuracoes'))
      return true; // Todos podem acessar perfil e configurações
    return false;
  };

  return (
    <div className='min-h-screen bg-grayBg flex flex-col'>
      <Header
        onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        currentPath={currentPath}
        onNavigate={navigate}
      />

      <div className='flex flex-1'>
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          userRole={getUserRole()}
          currentPath={currentPath}
          onNavigate={navigate}
        />

        <main className='flex-1 p-6 overflow-auto'>{renderContent()}</main>
      </div>
    </div>
  );
}

export default App;
