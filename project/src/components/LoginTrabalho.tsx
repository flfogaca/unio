import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import apiClient from '@/lib/api';
import { useAuthStore } from '@/stores/auth';

export function LoginTrabalho() {
  const { checkAuth } = useAuthStore();
  const [credentials, setCredentials] = useState({
    login: '',
    senha: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch(
        'https://homolog.uniogroup.app/api/Usuario/login',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            login: credentials.login,
            senha: credentials.senha,
            tokenApp: 'M3vVn10',
          }),
        }
      );

      const data = await response.json();

      if (response.ok && data.token) {
        apiClient.setToken(data.token);
        await checkAuth();
        window.location.href = '/';
      } else {
        setError(
          data.message || 'Erro ao fazer login. Verifique suas credenciais.'
        );
      }
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Erro ao fazer login. Tente novamente.'
      );
    } finally {
      setIsLoading(false);
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
            UNIO - Login Profissional
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div>
              <label
                htmlFor='login'
                className='block text-sm font-medium text-gray-700'
              >
                CPF/Login
              </label>
              <input
                type='text'
                id='login'
                name='login'
                value={credentials.login || ''}
                onChange={handleChange}
                placeholder='987.654.321-00'
                className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white'
                required
              />
            </div>

            <div>
              <label
                htmlFor='senha'
                className='block text-sm font-medium text-gray-700'
              >
                Senha
              </label>
              <input
                type='password'
                id='senha'
                name='senha'
                value={credentials.senha || ''}
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
        </CardContent>
      </Card>
    </div>
  );
}
