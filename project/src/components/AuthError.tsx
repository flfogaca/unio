import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export function AuthError() {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50'>
      <Card className='w-full max-w-md'>
        <CardHeader>
          <CardTitle className='text-center text-2xl font-bold text-red-600'>
            Falha na Autenticação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            <div className='text-center'>
              <div className='mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4'>
                <svg
                  className='w-8 h-8 text-red-600'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
                  />
                </svg>
              </div>
              <p className='text-gray-700 mb-2'>
                Não foi possível validar sua autenticação.
              </p>
              <p className='text-sm text-gray-500'>
                Por favor, tente novamente ou verifique se você está logado na
                aplicação principal.
              </p>
            </div>

            <Button
              onClick={handleRetry}
              className='w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md'
            >
              Tentar Novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
