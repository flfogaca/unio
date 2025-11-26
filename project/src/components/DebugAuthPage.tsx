import { useState } from 'react';
import { useAuthStore } from '../stores/auth';

interface LoginResponse {
  token?: string;
  success?: boolean;
  message?: string;
  data?: any;
}

export function DebugAuthPage() {
  const [loading, setLoading] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [requestUrl, setRequestUrl] = useState<string>('');
  const [requestBody, setRequestBody] = useState<string>('');
  const [response, setResponse] = useState<LoginResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { checkAuth } = useAuthStore();

  const API_URL = 'https://homolog.uniogroup.app/api/Usuario/login';
  const LOGIN_DATA = {
    login: '987.654.321-00',
    senha: 'teste',
    tokenApp: 'M3vVn10',
  };

  const handleGenerateToken = async () => {
    setLoading(true);
    setError(null);
    setToken(null);
    setResponse(null);
    setRequestUrl(API_URL);
    setRequestBody(JSON.stringify(LOGIN_DATA, null, 2));

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(LOGIN_DATA),
      });

      const data: LoginResponse = await res.json();
      setResponse(data);

      if (data.token) {
        setToken(data.token);
        localStorage.setItem('token', data.token);
      } else if (data.data?.token) {
        setToken(data.data.token);
        localStorage.setItem('token', data.data.token);
      } else {
        setError('Token não encontrado na resposta');
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!token) return;

    setLoginLoading(true);
    setError(null);

    try {
      await checkAuth();
      setTimeout(() => {
        window.location.hash = '/';
        window.location.reload();
      }, 500);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Erro ao fazer login';
      setError(errorMessage);
      setLoginLoading(false);
    }
  };

  const copyToken = () => {
    if (token) {
      navigator.clipboard.writeText(token);
      alert('Token copiado para a área de transferência!');
    }
  };

  return (
    <div className='min-h-screen bg-grayBg p-6'>
      <div className='max-w-4xl mx-auto'>
        <div className='bg-white rounded-lg shadow-md p-6 mb-6'>
          <h1 className='text-2xl font-bold text-gray-800 mb-6'>
            Debug de Autenticação
          </h1>

          <div className='mb-6'>
            <button
              onClick={handleGenerateToken}
              disabled={loading}
              className='bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors'
            >
              {loading ? 'Fazendo requisição...' : 'Gerar Token'}
            </button>
          </div>

          {requestUrl && (
            <div className='mb-6'>
              <h2 className='text-lg font-semibold text-gray-700 mb-2'>
                URL da Requisição:
              </h2>
              <div className='bg-gray-100 p-4 rounded-lg border border-gray-300'>
                <code className='text-sm text-gray-800 break-all'>
                  {requestUrl}
                </code>
              </div>
            </div>
          )}

          {requestBody && (
            <div className='mb-6'>
              <h2 className='text-lg font-semibold text-gray-700 mb-2'>
                Dados Enviados:
              </h2>
              <div className='bg-gray-100 p-4 rounded-lg border border-gray-300'>
                <pre className='text-sm text-gray-800 overflow-x-auto'>
                  {requestBody}
                </pre>
              </div>
            </div>
          )}

          {error && (
            <div className='mb-6'>
              <h2 className='text-lg font-semibold text-red-600 mb-2'>Erro:</h2>
              <div className='bg-red-50 p-4 rounded-lg border border-red-300'>
                <p className='text-sm text-red-800'>{error}</p>
              </div>
            </div>
          )}

          {response && (
            <div className='mb-6'>
              <h2 className='text-lg font-semibold text-gray-700 mb-2'>
                Resposta Completa:
              </h2>
              <div className='bg-gray-100 p-4 rounded-lg border border-gray-300'>
                <pre className='text-sm text-gray-800 overflow-x-auto'>
                  {JSON.stringify(response, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {token && (
            <div className='mb-6'>
              <div className='flex items-center justify-between mb-2'>
                <h2 className='text-lg font-semibold text-gray-700'>
                  Token Gerado:
                </h2>
                <button
                  onClick={copyToken}
                  className='bg-gray-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-700 transition-colors'
                >
                  Copiar Token
                </button>
              </div>
              <div className='bg-green-50 p-4 rounded-lg border border-green-300'>
                <code className='text-sm text-gray-800 break-all block'>
                  {token}
                </code>
              </div>
              <p className='text-sm text-green-600 mt-2'>
                ✓ Token salvo no localStorage
              </p>
            </div>
          )}

          {token && (
            <div className='mt-8 pt-6 border-t border-gray-300'>
              <button
                onClick={handleLogin}
                disabled={loginLoading}
                className='bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors w-full'
              >
                {loginLoading ? 'Fazendo login...' : 'Fazer Login e Acessar'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
