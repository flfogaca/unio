import React, { useState, useEffect } from 'react';
import { useWaitTime } from '../hooks/useWaitTime';
import { useSpecialtyAccess } from '../hooks/useSpecialtyAccess';
import { useAuthStore } from '../stores/auth';
import { Specialty } from '@/shared/types';
import { 
  Clock, 
  Users, 
  Activity, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle,
  RefreshCw,
  Info
} from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { StatusBadge } from './ui/StatusBadge';

interface WaitTimeDisplayProps {
  specialty?: Specialty;
  showDetails?: boolean;
  showHistorical?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export const WaitTimeDisplay: React.FC<WaitTimeDisplayProps> = ({
  specialty,
  showDetails = true,
  showHistorical = false,
  autoRefresh = true,
  refreshInterval = 30000,
}) => {
  const { user } = useAuthStore();
  const { getAccessibleSpecialties } = useSpecialtyAccess(user);
  const {
    waitTimes,
    loading,
    getSpecialtiesWaitTimes,
    getHistoricalData,
    formatWaitTime,
    getConfidenceColor,
    getConfidenceLabel,
    getWaitTimeStatus,
    startAutoRefresh,
  } = useWaitTime();

  const [historicalData, setHistoricalData] = useState<any>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Load wait times on mount
  useEffect(() => {
    loadWaitTimes();
  }, [specialty]);

  // Auto-refresh
  useEffect(() => {
    if (autoRefresh && !specialty) {
      const accessibleSpecialties = getAccessibleSpecialties();
      if (accessibleSpecialties.length > 0) {
        const stopAutoRefresh = startAutoRefresh(accessibleSpecialties, refreshInterval);
        return stopAutoRefresh;
      }
    }
  }, [autoRefresh, specialty, getAccessibleSpecialties, startAutoRefresh, refreshInterval]);

  const loadWaitTimes = async () => {
    try {
      if (specialty) {
        // Load single specialty
        await getSpecialtiesWaitTimes([specialty]);
      } else {
        // Load all accessible specialties
        const accessibleSpecialties = getAccessibleSpecialties();
        if (accessibleSpecialties.length > 0) {
          await getSpecialtiesWaitTimes(accessibleSpecialties);
        }
      }
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error loading wait times:', error);
    }
  };

  const loadHistoricalData = async (specialty: Specialty) => {
    try {
      const data = await getHistoricalData(specialty, 7);
      setHistoricalData({ specialty, data });
    } catch (error) {
      console.error('Error loading historical data:', error);
    }
  };

  const getSpecialtyIcon = (specialty: Specialty) => {
    const icons = {
      [Specialty.psicologo]: '🧠',
      [Specialty.dentista]: '🦷',
      [Specialty.medico_clinico]: '🩺',
    };
    return icons[specialty] || '🏥';
  };

  const getSpecialtyName = (specialty: Specialty) => {
    const names = {
      [Specialty.psicologo]: 'Psicólogo',
      [Specialty.dentista]: 'Dentista',
      [Specialty.medico_clinico]: 'Médico Clínico',
    };
    return names[specialty] || specialty;
  };

  if (loading && waitTimes.length === 0) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-300 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-300 rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  if (waitTimes.length === 0) {
    return (
      <Card className="p-6 text-center">
        <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <p className="text-gray-500">Nenhum tempo de espera disponível</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Clock className="w-6 h-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Tempos de Espera
          </h3>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            Atualizado: {lastUpdated.toLocaleTimeString('pt-BR')}
          </span>
          <Button
            onClick={loadWaitTimes}
            variant="ghost"
            size="sm"
            loading={loading}
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Wait Time Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {waitTimes.map((waitTime) => {
          const status = getWaitTimeStatus(waitTime.queueLength, waitTime.onlineProfessionals);
          
          return (
            <Card key={waitTime.specialty} className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">
                    {getSpecialtyIcon(waitTime.specialty)}
                  </span>
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {getSpecialtyName(waitTime.specialty)}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {waitTime.queueLength} na fila
                    </p>
                  </div>
                </div>
                
                <StatusBadge className={status.color}>
                  {status.label}
                </StatusBadge>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Tempo Estimado:</span>
                  <span className="font-semibold text-lg">
                    {formatWaitTime(waitTime.estimatedWaitTime)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Profissionais:</span>
                  <span className="text-sm font-medium">
                    {waitTime.onlineProfessionals} online
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Precisão:</span>
                  <StatusBadge className={getConfidenceColor(waitTime.confidence)}>
                    {getConfidenceLabel(waitTime.confidence)}
                  </StatusBadge>
                </div>
              </div>

              {showDetails && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Duração média: {waitTime.averageConsultationDuration}min</span>
                    <span>
                      {new Date(waitTime.lastCalculated).toLocaleTimeString('pt-BR')}
                    </span>
                  </div>
                </div>
              )}

              {showHistorical && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <Button
                    onClick={() => loadHistoricalData(waitTime.specialty)}
                    variant="ghost"
                    size="sm"
                    className="w-full"
                  >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Ver Histórico
                  </Button>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Historical Data */}
      {historicalData && (
        <Card className="p-6">
          <h4 className="font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Dados Históricos - {getSpecialtyName(historicalData.specialty)}
          </h4>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {formatWaitTime(historicalData.data.averageWaitTime)}
              </div>
              <div className="text-sm text-gray-500">Espera Média</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {historicalData.data.averageDuration}min
              </div>
              <div className="text-sm text-gray-500">Duração Média</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {historicalData.data.consultationCount}
              </div>
              <div className="text-sm text-gray-500">Consultas (7 dias)</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {historicalData.data.peakHours.length}
              </div>
              <div className="text-sm text-gray-500">Horários Pico</div>
            </div>
          </div>
          
          {historicalData.data.peakHours.length > 0 && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Info className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Horários de Pico:</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {historicalData.data.peakHours.map((hour: number) => (
                  <span
                    key={hour}
                    className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                  >
                    {hour}h
                  </span>
                ))}
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Info Box */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Como funciona o cálculo de tempo de espera?</p>
            <p>
              O tempo é calculado com base no número de pessoas na fila, profissionais online, 
              duração média das consultas e dados históricos. A precisão varia conforme a quantidade 
              de dados disponíveis.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
