import React from 'react';
import { Brain, Smile, Stethoscope, Clock, Users, AlertCircle } from 'lucide-react';
import { Card } from './ui/Card';
import { StatusBadge } from './ui/StatusBadge';

interface SpecialtyCardProps {
  specialty: {
    id: string;
    name: string;
    description: string;
    icon: string;
    color: string;
    features: string[];
    queueLength: number;
    inProgress: number;
    onlineProfessionals: number;
    estimatedWaitTime: number;
  };
  onSelect: (specialtyId: string) => void;
}

const iconMap = {
  brain: Brain,
  tooth: Smile,
  stethoscope: Stethoscope,
};

const getStatusInfo = (queueLength: number, onlineProfessionals: number) => {
  if (onlineProfessionals === 0) {
    return {
      status: 'offline',
      label: 'Offline',
      color: 'bg-gray-500',
      icon: AlertCircle,
    };
  }
  
  if (queueLength === 0) {
    return {
      status: 'available',
      label: 'Disponível',
      color: 'bg-green-500',
      icon: Users,
    };
  }
  
  if (queueLength <= 2) {
    return {
      status: 'short',
      label: 'Fila Pequena',
      color: 'bg-green-400',
      icon: Clock,
    };
  }
  
  if (queueLength <= 5) {
    return {
      status: 'medium',
      label: 'Fila Média',
      color: 'bg-yellow-500',
      icon: Clock,
    };
  }
  
  return {
    status: 'long',
    label: 'Fila Longa',
    color: 'bg-red-500',
    icon: Clock,
  };
};

const formatWaitTime = (minutes: number) => {
  if (minutes === 0) return 'Imediato';
  if (minutes < 60) return `${minutes}min`;
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${remainingMinutes}min`;
};

export const SpecialtyCard: React.FC<SpecialtyCardProps> = ({ specialty, onSelect }) => {
  const IconComponent = iconMap[specialty.icon as keyof typeof iconMap] || Brain;
  const statusInfo = getStatusInfo(specialty.queueLength, specialty.onlineProfessionals);
  const StatusIcon = statusInfo.icon;

  return (
    <Card 
      className="group cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl"
      onClick={() => onSelect(specialty.id)}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div 
            className="p-3 rounded-xl"
            style={{ backgroundColor: `${specialty.color}20` }}
          >
            <IconComponent 
              className="w-8 h-8"
              style={{ color: specialty.color }}
            />
          </div>
          
          <StatusBadge 
            status={statusInfo.status as any}
            className={`${statusInfo.color} text-white`}
          >
            <StatusIcon className="w-3 h-3 mr-1" />
            {statusInfo.label}
          </StatusBadge>
        </div>

        {/* Title and Description */}
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {specialty.name}
          </h3>
          <p className="text-gray-600 text-sm leading-relaxed">
            {specialty.description}
          </p>
        </div>

        {/* Wait Time */}
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Tempo de Espera:</span>
            <span className="font-semibold text-lg" style={{ color: specialty.color }}>
              {formatWaitTime(specialty.estimatedWaitTime)}
            </span>
          </div>
          
          {specialty.estimatedWaitTime > 0 && (
            <div className="mt-2 bg-gray-100 rounded-full h-2">
              <div 
                className="h-2 rounded-full transition-all duration-300"
                style={{ 
                  backgroundColor: specialty.color,
                  width: `${Math.min((specialty.queueLength / 10) * 100, 100)}%`
                }}
              />
            </div>
          )}
        </div>

        {/* Queue Info */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {specialty.queueLength}
            </div>
            <div className="text-xs text-gray-500">
              Na Fila
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {specialty.onlineProfessionals}
            </div>
            <div className="text-xs text-gray-500">
              Online
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mb-4">
          <div className="text-xs text-gray-500 mb-2">Serviços Disponíveis:</div>
          <div className="flex flex-wrap gap-1">
            {specialty.features.slice(0, 2).map((feature, index) => (
              <span 
                key={index}
                className="px-2 py-1 text-xs rounded-full"
                style={{ 
                  backgroundColor: `${specialty.color}20`,
                  color: specialty.color
                }}
              >
                {feature}
              </span>
            ))}
            {specialty.features.length > 2 && (
              <span 
                className="px-2 py-1 text-xs rounded-full"
                style={{ 
                  backgroundColor: `${specialty.color}20`,
                  color: specialty.color
                }}
              >
                +{specialty.features.length - 2}
              </span>
            )}
          </div>
        </div>

        {/* Action Button */}
        <button
          className="w-full py-3 px-4 rounded-lg font-medium text-white transition-all duration-200 group-hover:shadow-lg"
          style={{ backgroundColor: specialty.color }}
        >
          Solicitar Atendimento
        </button>
      </div>
    </Card>
  );
};
