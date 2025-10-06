import { useState, useEffect } from 'react'
import { Header } from './components/layout/Header'
import { Sidebar } from './components/layout/Sidebar'
import { LoginForm } from './components/LoginForm'
import { SpecialtiesDashboard } from './components/SpecialtiesDashboard'
import { SolicitarAtendimento } from './components/SolicitarAtendimento'
import { PacienteDashboard } from './components/paciente/Dashboard'
import { SolicitarAtendimento as PacienteSolicitarAtendimento } from './components/paciente/SolicitarAtendimento'
import { HistoricoConsultas } from './components/paciente/HistoricoConsultas'
import { FilaAtendimento } from './components/dentista/FilaAtendimento'
import { ConsultasAtivas } from './components/dentista/ConsultasAtivas'
import { PerfilDentista } from './components/dentista/PerfilDentista'
import { ConsultaRoom } from './components/dentista/ConsultaRoom'
import { AdminDashboard } from './components/admin/Dashboard'
import { GerenciarUsuarios } from './components/admin/GerenciarUsuarios'
import { ConfigurarFila } from './components/admin/ConfigurarFila'
import { Financeiro } from './components/admin/Financeiro'
import { Relatorios } from './components/admin/Relatorios'
import { useAuthStore } from './stores/auth'
import './index.css'

function App() {
  const [currentPath, setCurrentPath] = useState('/')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { isAuthenticated, isLoading, checkAuth, user } = useAuthStore()

  // Check authentication on app load
  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  // Simple router based on hash
  useEffect(() => {
    const handleHashChange = () => {
      setCurrentPath(window.location.hash.slice(1) || '/')
    }

    window.addEventListener('hashchange', handleHashChange)
    handleHashChange() // Set initial path

    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  const navigate = (path: string) => {
    window.location.hash = path
    setSidebarOpen(false)
  }

  const handleSelectSpecialty = (specialtyId: string) => {
    // Navigate to specialty-specific page
    setCurrentPath(`/solicitar-atendimento/${specialtyId}`)
  }

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-grayBg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  // Show login form if not authenticated
  if (!isAuthenticated) {
    return <LoginForm />
  }

  const renderContent = () => {
    // Extract consultation ID from path if present
    const consultaMatch = currentPath.match(/^\/dentista\/consulta\/(.+)$/)
    if (consultaMatch) {
      return <ConsultaRoom consultaId={consultaMatch[1]} />
    }

    // Extract specialty from solicitar-atendimento path
    const specialtyMatch = currentPath.match(/^\/solicitar-atendimento\/(.+)$/)
    if (specialtyMatch) {
      return (
        <SolicitarAtendimento 
          specialtyId={specialtyMatch[1]} 
          onBack={() => setCurrentPath('/')}
        />
      )
    }

    switch (currentPath) {
      // Main dashboard with specialties
      case '/':
        return <SpecialtiesDashboard onSelectSpecialty={handleSelectSpecialty} />
      
      // Paciente routes
      case '/paciente':
        return <PacienteDashboard />
      case '/paciente/solicitar':
        return <PacienteSolicitarAtendimento />
      case '/paciente/historico':
        return <HistoricoConsultas />

      // Dentista routes
      case '/dentista':
        return <FilaAtendimento />
      case '/dentista/consultas':
        return <ConsultasAtivas />
      case '/dentista/perfil':
        return <PerfilDentista />

      // Admin routes
      case '/admin':
        return <AdminDashboard />
      case '/admin/usuarios':
        return <GerenciarUsuarios onBack={() => navigate('/admin')} />
      case '/admin/regras':
        return <ConfigurarFila onBack={() => navigate('/admin')} />
      case '/admin/financeiro':
        return <Financeiro onBack={() => navigate('/admin')} />
      case '/admin/relatorios':
        return <Relatorios onBack={() => navigate('/admin')} />

      default:
        return <PacienteDashboard />
    }
  }

  const getUserRole = () => {
    return user?.role || 'paciente'
  }

  return (
    <div className="min-h-screen bg-grayBg">
      <Header 
        onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        currentPath={currentPath}
        onNavigate={navigate}
      />
      
      <div className="flex">
        <Sidebar 
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          userRole={getUserRole()}
          currentPath={currentPath}
          onNavigate={navigate}
        />
        
        <main className="flex-1 p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  )
}

export default App