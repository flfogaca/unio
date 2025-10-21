import { Bell, Menu, User } from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '@/stores/auth';
import { cn } from '@/lib/utils';

interface HeaderProps {
  onMenuToggle?: () => void;
  currentPath?: string;
  onNavigate?: (path: string) => void;
}

export function Header({
  onMenuToggle,
  currentPath = '/',
  onNavigate,
}: HeaderProps) {
  const { user, logout } = useAuthStore();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Removido menu de navegação - cada usuário vê apenas suas funcionalidades

  const handleNavigation = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      window.location.hash = path;
    }
    setShowProfileMenu(false); // Close dropdown after navigation
  };

  const handleLogout = async () => {
    try {
      await logout();
      setShowProfileMenu(false);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const handleProfileClick = () => {
    const profilePath = `/perfil`;
    handleNavigation(profilePath);
  };

  const handleSettingsClick = () => {
    const settingsPath = `/configuracoes`;
    handleNavigation(settingsPath);
  };

  return (
    <header className='bg-primaryDark text-white shadow-lg sticky top-0 z-50'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between items-center h-16'>
          {/* Logo e Menu Mobile */}
          <div className='flex items-center'>
            <button
              onClick={onMenuToggle}
              className='lg:hidden p-2 rounded-md hover:bg-primary/50 transition-colors'
              aria-label='Abrir menu'
            >
              <Menu className='h-6 w-6' />
            </button>
            <div className='flex items-center ml-2 lg:ml-0'>
              <div className='w-8 h-8 bg-accent rounded-lg flex items-center justify-center mr-3'>
                <span className='text-primaryDark font-bold text-sm'>U</span>
              </div>
              <h1 className='text-xl font-bold'>Unio</h1>
            </div>
          </div>

          {/* Menu Desktop - Removido para simplificar navegação */}

          {/* Profile e Notificações */}
          <div className='flex items-center space-x-4'>
            <button
              className='p-2 rounded-md hover:bg-primary/50 transition-colors relative'
              aria-label='Notificações'
            >
              <Bell className='h-5 w-5' />
              <span className='absolute top-1 right-1 w-2 h-2 bg-accent rounded-full'></span>
            </button>

            <div className='relative'>
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className='flex items-center space-x-2 p-2 rounded-md hover:bg-primary/50 transition-colors'
              >
                <div className='w-8 h-8 bg-accent rounded-full flex items-center justify-center'>
                  <User className='h-4 w-4 text-primaryDark' />
                </div>
                <span className='hidden sm:block text-sm font-medium'>
                  {user?.name}
                </span>
              </button>

              {showProfileMenu && (
                <>
                  {/* Overlay to close dropdown when clicking outside */}
                  <div
                    className='fixed inset-0 z-40'
                    onClick={() => setShowProfileMenu(false)}
                  />
                  <div className='absolute right-0 top-12 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200'>
                    <div className='px-4 py-2 text-sm text-gray-700 border-b border-gray-100'>
                      <div className='font-medium'>{user?.name}</div>
                      <div className='text-gray-500 text-xs'>{user?.email}</div>
                    </div>
                    <button
                      onClick={handleProfileClick}
                      className='block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors'
                    >
                      Meu Perfil
                    </button>
                    <button
                      onClick={handleSettingsClick}
                      className='block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors'
                    >
                      Configurações
                    </button>
                    <hr className='my-1 border-gray-100' />
                    <button
                      onClick={handleLogout}
                      className='block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors'
                    >
                      Sair
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
