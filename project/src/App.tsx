import { useState, useEffect } from 'react'
import { Header } from './components/layout/Header'
import { Sidebar } from './components/layout/Sidebar'
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
import './index.css'

function App() {
  const [currentPath, setCurrentPath] = useState('/')
  const [sidebarOpen, setSidebarOpen] = useState(false)

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
    if (currentPath.startsWith('/admin')) return 'admin'
    if (currentPath.startsWith('/dentista')) return 'dentista'
    return 'paciente'
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