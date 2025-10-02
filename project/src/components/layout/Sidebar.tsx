import { cn } from '@/lib/utils'
import { 
  Users, 
  Settings, 
  BarChart3, 
  CreditCard,
  FileText,
  Clock,
  Stethoscope,
  Calendar,
  MessageSquare,
  X
} from 'lucide-react'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  userRole: 'paciente' | 'dentista' | 'admin'
  currentPath?: string
  onNavigate?: (path: string) => void
}

const menuItems = {
  paciente: [
    { icon: BarChart3, label: 'Dashboard', path: '/paciente' },
    { icon: MessageSquare, label: 'Solicitar Atendimento', path: '/paciente/solicitar' },
    { icon: FileText, label: 'Histórico', path: '/paciente/historico' }
  ],
  dentista: [
    { icon: Clock, label: 'Fila de Atendimento', path: '/dentista' },
    { icon: Stethoscope, label: 'Consultas Ativas', path: '/dentista/consultas' },
    { icon: Calendar, label: 'Meu Perfil', path: '/dentista/perfil' }
  ],
  admin: [
    { icon: BarChart3, label: 'Dashboard', path: '/admin' },
    { icon: Users, label: 'Usuários', path: '/admin/usuarios' },
    { icon: Settings, label: 'Regras da Fila', path: '/admin/regras' },
    { icon: CreditCard, label: 'Financeiro', path: '/admin/financeiro' },
    { icon: FileText, label: 'Relatórios', path: '/admin/relatorios' }
  ]
}

export function Sidebar({ isOpen, onClose, userRole, currentPath = '/', onNavigate }: SidebarProps) {
  const items = menuItems[userRole] || []

  const handleNavigation = (path: string) => {
    if (onNavigate) {
      onNavigate(path)
    } else {
      window.location.hash = path
    }
    onClose() // Close sidebar after navigation
  }

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        'fixed left-0 top-0 h-full w-64 bg-gradient-to-b from-primaryDark to-primary text-white transform transition-transform duration-300 ease-in-out z-50 flex flex-col',
        isOpen ? 'translate-x-0' : '-translate-x-full',
        'lg:relative lg:translate-x-0 lg:block'
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center mr-3">
              <span className="text-primaryDark font-bold text-sm">U</span>
            </div>
            <h2 className="text-lg font-semibold">Unio</h2>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded-md hover:bg-white/10"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation - Flex grow to take available space */}
        <nav className="p-4 flex-1 overflow-y-auto">
          <div className="space-y-2">
            {items.map((item) => {
              const Icon = item.icon
              const isActive = currentPath === item.path
              
              return (
                <button
                  key={item.path}
                  onClick={() => handleNavigation(item.path)}
                  className={cn(
                    'w-full flex items-center space-x-3 px-3 py-3 rounded-md text-sm font-medium transition-colors text-left hover:bg-white/10',
                    isActive
                      ? 'bg-accent text-primaryDark'
                      : 'text-white'
                  )}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span className="truncate">{item.label}</span>
                </button>
              )
            })}
          </div>
        </nav>

        {/* Footer - Fixed at bottom */}
        <div className="p-4 border-t border-white/10 flex-shrink-0">
          <div className="text-xs text-white/60 text-center">
            Unio Online v1.0
          </div>
        </div>
      </aside>
    </>
  )
}