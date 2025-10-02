import React from 'react';
import { useSpecialtyAccess } from '../hooks/useSpecialtyAccess';
import { useAuthStore } from '../stores/auth';
import { Specialty } from '@/shared/types';
import { AlertCircle, Lock } from 'lucide-react';
import { Card } from './ui/Card';

interface SpecialtyGuardProps {
  specialty: Specialty;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showAccessDenied?: boolean;
}

export const SpecialtyGuard: React.FC<SpecialtyGuardProps> = ({
  specialty,
  children,
  fallback,
  showAccessDenied = true,
}) => {
  const { user } = useAuthStore();
  const { canAccessSpecialty, getSpecialtyDisplayName } = useSpecialtyAccess(user);

  if (!canAccessSpecialty(specialty)) {
    if (fallback) {
      return <>{fallback}</>;
    }

    if (!showAccessDenied) {
      return null;
    }

    return (
      <Card className="p-6 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="p-3 bg-red-100 rounded-full">
            <Lock className="w-8 h-8 text-red-600" />
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Acesso Restrito
            </h3>
            <p className="text-gray-600 mb-4">
              Você não tem permissão para acessar a área de{' '}
              <strong>{getSpecialtyDisplayName(specialty)}</strong>.
            </p>
            <p className="text-sm text-gray-500">
              Cada profissional só pode acessar sua própria especialidade.
            </p>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-500 bg-yellow-50 p-3 rounded-lg">
            <AlertCircle className="w-4 h-4 text-yellow-600" />
            <span>
              Se você acredita que isso é um erro, entre em contato com o administrador.
            </span>
          </div>
        </div>
      </Card>
    );
  }

  return <>{children}</>;
};
