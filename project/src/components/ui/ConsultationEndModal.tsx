import { CheckCircle, Clock, User } from 'lucide-react';
import { Button } from './Button';
import { Modal } from './Modal';

interface ConsultationEndModalProps {
  isOpen: boolean;
  onClose: () => void;
  finishedBy: string;
  finishedByRole: 'paciente' | 'profissional';
  duration: string;
  autoRedirect?: boolean;
  redirectDelay?: number;
}

export function ConsultationEndModal({
  isOpen,
  onClose,
  finishedBy,
  finishedByRole,
  duration,
  autoRedirect = false,
}: ConsultationEndModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title='Consulta Finalizada'
      size='md'
      showCloseButton={false}
      footer={
        autoRedirect ? (
          <div className='flex justify-center'>
            <div className='text-center'>
              <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2'></div>
              <p className='text-sm text-gray-600'>
                Redirecionando automaticamente...
              </p>
            </div>
          </div>
        ) : (
          <div className='flex gap-3'>
            <Button onClick={onClose} variant='secondary' className='flex-1'>
              Fechar
            </Button>
            <Button onClick={onClose} className='flex-1'>
              Voltar ao Dashboard
            </Button>
          </div>
        )
      }
    >
      <div className='text-center space-y-6'>
        {/* Icon */}
        <div className='flex justify-center'>
          <div className='w-16 h-16 bg-green-100 rounded-full flex items-center justify-center'>
            <CheckCircle className='h-10 w-10 text-green-600' />
          </div>
        </div>

        {/* Message */}
        <div>
          <h3 className='text-xl font-semibold text-primaryDark mb-2'>
            Consulta Finalizada com Sucesso
          </h3>
          <p className='text-gray-600'>
            A consulta foi encerrada e todas as informações foram salvas.
            {autoRedirect && (
              <span className='block mt-2 text-sm text-blue-600'>
                Você será redirecionado automaticamente em alguns segundos...
              </span>
            )}
          </p>
        </div>

        {/* Details */}
        <div className='bg-gray-50 rounded-lg p-6 space-y-4'>
          <div className='flex items-center justify-center gap-3'>
            <User className='h-5 w-5 text-accent' />
            <div className='text-left'>
              <p className='text-sm text-gray-600'>Finalizado por</p>
              <p className='font-semibold text-primaryDark'>
                {finishedBy} (
                {finishedByRole === 'paciente' ? 'Paciente' : 'Profissional'})
              </p>
            </div>
          </div>

          <div className='flex items-center justify-center gap-3'>
            <Clock className='h-5 w-5 text-accent' />
            <div className='text-left'>
              <p className='text-sm text-gray-600'>Duração da consulta</p>
              <p className='font-semibold text-primaryDark'>{duration}</p>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
          <p className='text-sm text-blue-800'>
            💡 Você pode acessar o histórico completo desta consulta no seu
            painel.
          </p>
        </div>
      </div>
    </Modal>
  );
}
