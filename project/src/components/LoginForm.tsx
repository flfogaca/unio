import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/stores/auth';

export function LoginForm() {
  const { login, isLoading, error, clearError, user, isAuthenticated } =
    useAuthStore();
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  });

  useEffect(() => {
    if (isAuthenticated && user) {
      const defaultRoute = {
        paciente: '/paciente',
        dentista: '/dentista',
        psicologo: '/dentista',
        medico: '/dentista',
        admin: '/admin',
      };
      const route =
        defaultRoute[user.role as keyof typeof defaultRoute] || '/paciente';
      window.location.hash = route;
      window.location.reload();
    }
  }, [isAuthenticated, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    try {
      await login(credentials);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50'>
      <Card className='w-full max-w-md'>
        <CardHeader>
          <CardTitle className='text-center text-2xl font-bold text-blue-600'>
            UNIO - Login
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div>
              <label
                htmlFor='email'
                className='block text-sm font-medium text-gray-700'
              >
                Email
              </label>
              <input
                type='email'
                id='email'
                name='email'
                value={credentials.email || ''}
                onChange={handleChange}
                placeholder='seu@email.com'
                className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white'
                required
              />
            </div>

            <div>
              <label
                htmlFor='password'
                className='block text-sm font-medium text-gray-700'
              >
                Senha
              </label>
              <input
                type='password'
                id='password'
                name='password'
                value={credentials.password || ''}
                onChange={handleChange}
                placeholder='Digite sua senha'
                className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white'
                required
              />
            </div>

            {error && (
              <div className='text-red-600 text-sm bg-red-50 p-3 rounded-md'>
                {error}
              </div>
            )}

            <Button
              type='submit'
              disabled={isLoading}
              className='w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md disabled:opacity-50'
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>

          <div className='mt-6 text-center'>
            <p className='text-sm text-gray-600'>Usuários de teste:</p>
            <div className='mt-2 text-xs text-gray-500 space-y-1'>
              <p>
                <strong>Admin:</strong> admin@unio.com | Senha: 123456
              </p>
              <p>
                <strong>Paciente:</strong> paciente1@unio.com | Senha: 123456
              </p>
              <p>
                <strong>Dentista:</strong> dentista1@unio.com | Senha: 123456
              </p>
              <p>
                <strong>Psicólogo:</strong> psicologo1@unio.com | Senha: 123456
              </p>
              <p>
                <strong>Médico:</strong> medico1@unio.com | Senha: 123456
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
