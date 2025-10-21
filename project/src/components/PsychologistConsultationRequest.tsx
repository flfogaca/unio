import React, { useState } from 'react';
import {
  Brain,
  AlertTriangle,
  Clock,
  Calendar,
  Plus,
  X,
  Send,
  Shield,
} from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { StatusBadge } from './ui/StatusBadge';

interface PsychologistConsultationRequestProps {
  onRequestSubmitted?: (request: any) => void;
}

const urgencyLevels = [
  {
    value: 'low',
    label: 'Baixa',
    color: 'bg-green-100 text-green-800',
    description: 'Consulta de rotina',
  },
  {
    value: 'medium',
    label: 'Média',
    color: 'bg-yellow-100 text-yellow-800',
    description: 'Necessita atendimento em breve',
  },
  {
    value: 'high',
    label: 'Alta',
    color: 'bg-orange-100 text-orange-800',
    description: 'Situação preocupante',
  },
  {
    value: 'crisis',
    label: 'Crise',
    color: 'bg-red-100 text-red-800',
    description: 'Atendimento imediato necessário',
  },
];

const commonSymptoms = [
  'Ansiedade',
  'Depressão',
  'Estresse',
  'Insônia',
  'Pânico',
  'Irritabilidade',
  'Tristeza',
  'Medo',
  'Angústia',
  'Dificuldade de concentração',
  'Mudanças de humor',
  'Perda de interesse',
  'Fadiga',
  'Preocupação excessiva',
];

const commonMedications = [
  'Fluoxetina',
  'Sertralina',
  'Escitalopram',
  'Citalopram',
  'Paroxetina',
  'Venlafaxina',
  'Duloxetina',
  'Bupropiona',
  'Mirtazapina',
  'Clonazepam',
  'Alprazolam',
  'Lorazepam',
  'Diazepam',
  'Outros',
];

export const PsychologistConsultationRequest: React.FC<
  PsychologistConsultationRequestProps
> = ({ onRequestSubmitted }) => {
  const [consultationType, setConsultationType] = useState<
    'urgent' | 'scheduled'
  >('urgent');
  const [urgencyLevel, setUrgencyLevel] = useState<
    'low' | 'medium' | 'high' | 'crisis'
  >('medium');
  const [reason, setReason] = useState('');
  const [preferredTime, setPreferredTime] = useState('');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [customSymptoms, setCustomSymptoms] = useState('');
  const [previousTherapy, setPreviousTherapy] = useState(false);
  const [currentMedication, setCurrentMedication] = useState<string[]>([]);
  const [customMedication, setCustomMedication] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSymptomToggle = (symptom: string) => {
    setSelectedSymptoms(prev =>
      prev.includes(symptom)
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };

  const handleMedicationToggle = (medication: string) => {
    setCurrentMedication(prev =>
      prev.includes(medication)
        ? prev.filter(m => m !== medication)
        : [...prev, medication]
    );
  };

  const addCustomSymptom = () => {
    if (customSymptoms.trim()) {
      setSelectedSymptoms(prev => [...prev, customSymptoms.trim()]);
      setCustomSymptoms('');
    }
  };

  const addCustomMedication = () => {
    if (customMedication.trim()) {
      setCurrentMedication(prev => [...prev, customMedication.trim()]);
      setCustomMedication('');
    }
  };

  const removeSymptom = (symptom: string) => {
    setSelectedSymptoms(prev => prev.filter(s => s !== symptom));
  };

  const removeMedication = (medication: string) => {
    setCurrentMedication(prev => prev.filter(m => m !== medication));
  };

  const handleSubmit = async () => {
    if (!reason.trim()) {
      alert('Por favor, descreva o motivo da consulta.');
      return;
    }

    setLoading(true);

    try {
      const request = {
        consultationType,
        reason: reason.trim(),
        urgencyLevel,
        preferredTime:
          consultationType === 'scheduled' ? preferredTime : undefined,
        symptoms: [...selectedSymptoms],
        previousTherapy,
        currentMedication,
      };

      // TODO: Replace with actual API call
      console.log('Submitting psychologist consultation request:', request);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (onRequestSubmitted) {
        onRequestSubmitted(request);
      }

      // Reset form
      setReason('');
      setSelectedSymptoms([]);
      setCurrentMedication([]);
    } catch (error) {
      console.error('Error submitting consultation request:', error);
      alert('Erro ao enviar solicitação. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const isCrisisLevel = urgencyLevel === 'crisis';

  return (
    <div className='max-w-4xl mx-auto space-y-6'>
      {/* Header */}
      <Card className='p-6'>
        <div className='flex items-center gap-3 mb-4'>
          <div className='p-2 bg-purple-100 rounded-lg'>
            <Brain className='w-6 h-6 text-purple-600' />
          </div>
          <div>
            <h2 className='text-xl font-bold text-gray-900'>
              Solicitar Consulta com Psicólogo
            </h2>
            <p className='text-sm text-gray-500'>
              Descreva sua situação para que possamos conectá-lo com o
              profissional mais adequado
            </p>
          </div>
        </div>

        {/* Crisis Warning */}
        {isCrisisLevel && (
          <div className='mb-4 p-4 bg-red-50 border border-red-200 rounded-lg'>
            <div className='flex items-start gap-3'>
              <AlertTriangle className='w-5 h-5 text-red-600 mt-0.5' />
              <div>
                <h3 className='font-medium text-red-800 mb-1'>
                  Situação de Crise Detectada
                </h3>
                <p className='text-sm text-red-700 mb-2'>
                  Você será conectado imediatamente com um psicólogo disponível.
                </p>
                <div className='text-sm text-red-600'>
                  <strong>Se você está pensando em se machucar:</strong>
                  <br />• Ligue para o CVV: 188 (24 horas)
                  <br />• SAMU: 192 (emergências)
                  <br />• Disque 100 (violência doméstica)
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Main Form */}
        <div className='lg:col-span-2 space-y-6'>
          {/* Consultation Type */}
          <Card className='p-6'>
            <h3 className='text-lg font-semibold mb-4'>Tipo de Consulta</h3>
            <div className='grid grid-cols-2 gap-4'>
              <button
                onClick={() => setConsultationType('urgent')}
                className={`p-4 border-2 rounded-lg text-left transition-colors ${
                  consultationType === 'urgent'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className='flex items-center gap-3'>
                  <Clock className='w-5 h-5 text-blue-600' />
                  <div>
                    <div className='font-medium'>Consulta Urgente</div>
                    <div className='text-sm text-gray-500'>
                      Atendimento imediato
                    </div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setConsultationType('scheduled')}
                className={`p-4 border-2 rounded-lg text-left transition-colors ${
                  consultationType === 'scheduled'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className='flex items-center gap-3'>
                  <Calendar className='w-5 h-5 text-blue-600' />
                  <div>
                    <div className='font-medium'>Consulta Agendada</div>
                    <div className='text-sm text-gray-500'>Agendar horário</div>
                  </div>
                </div>
              </button>
            </div>
          </Card>

          {/* Urgency Level */}
          <Card className='p-6'>
            <h3 className='text-lg font-semibold mb-4'>Nível de Urgência</h3>
            <div className='grid grid-cols-2 gap-3'>
              {urgencyLevels.map(level => (
                <button
                  key={level.value}
                  onClick={() => setUrgencyLevel(level.value as any)}
                  className={`p-3 border-2 rounded-lg text-left transition-colors ${
                    urgencyLevel === level.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className='flex items-center gap-2 mb-1'>
                    <StatusBadge className={level.color}>
                      {level.label}
                    </StatusBadge>
                  </div>
                  <div className='text-sm text-gray-600'>
                    {level.description}
                  </div>
                </button>
              ))}
            </div>
          </Card>

          {/* Reason */}
          <Card className='p-6'>
            <h3 className='text-lg font-semibold mb-4'>Motivo da Consulta</h3>
            <textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder='Descreva brevemente o motivo da sua consulta. Seja específico sobre seus sentimentos, pensamentos ou situações que o levaram a buscar ajuda psicológica...'
              className='w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              rows={4}
              required
            />
          </Card>

          {/* Symptoms */}
          <Card className='p-6'>
            <h3 className='text-lg font-semibold mb-4'>Sintomas (opcional)</h3>
            <p className='text-sm text-gray-600 mb-4'>
              Selecione os sintomas que você está experimentando:
            </p>

            <div className='grid grid-cols-2 md:grid-cols-3 gap-2 mb-4'>
              {commonSymptoms.map(symptom => (
                <button
                  key={symptom}
                  onClick={() => handleSymptomToggle(symptom)}
                  className={`p-2 text-sm rounded-lg border transition-colors ${
                    selectedSymptoms.includes(symptom)
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {symptom}
                </button>
              ))}
            </div>

            {/* Custom Symptoms */}
            <div className='flex gap-2'>
              <input
                type='text'
                value={customSymptoms}
                onChange={e => setCustomSymptoms(e.target.value)}
                placeholder='Adicionar sintoma personalizado...'
                className='flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                onKeyPress={e => e.key === 'Enter' && addCustomSymptom()}
              />
              <Button onClick={addCustomSymptom} size='sm'>
                <Plus className='w-4 h-4' />
              </Button>
            </div>

            {/* Selected Symptoms */}
            {selectedSymptoms.length > 0 && (
              <div className='mt-4'>
                <h4 className='text-sm font-medium text-gray-700 mb-2'>
                  Sintomas Selecionados:
                </h4>
                <div className='flex flex-wrap gap-2'>
                  {selectedSymptoms.map(symptom => (
                    <span
                      key={symptom}
                      className='inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full'
                    >
                      {symptom}
                      <button
                        onClick={() => removeSymptom(symptom)}
                        className='hover:text-blue-600'
                      >
                        <X className='w-3 h-3' />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Medication */}
          <Card className='p-6'>
            <h3 className='text-lg font-semibold mb-4'>
              Medicamentos Atuais (opcional)
            </h3>
            <p className='text-sm text-gray-600 mb-4'>
              Está tomando algum medicamento relacionado à saúde mental?
            </p>

            <div className='grid grid-cols-2 md:grid-cols-3 gap-2 mb-4'>
              {commonMedications.map(medication => (
                <button
                  key={medication}
                  onClick={() => handleMedicationToggle(medication)}
                  className={`p-2 text-sm rounded-lg border transition-colors ${
                    currentMedication.includes(medication)
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {medication}
                </button>
              ))}
            </div>

            {/* Custom Medication */}
            <div className='flex gap-2'>
              <input
                type='text'
                value={customMedication}
                onChange={e => setCustomMedication(e.target.value)}
                placeholder='Adicionar medicamento personalizado...'
                className='flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                onKeyPress={e => e.key === 'Enter' && addCustomMedication()}
              />
              <Button onClick={addCustomMedication} size='sm'>
                <Plus className='w-4 h-4' />
              </Button>
            </div>

            {/* Selected Medications */}
            {currentMedication.length > 0 && (
              <div className='mt-4'>
                <h4 className='text-sm font-medium text-gray-700 mb-2'>
                  Medicamentos Selecionados:
                </h4>
                <div className='flex flex-wrap gap-2'>
                  {currentMedication.map(medication => (
                    <span
                      key={medication}
                      className='inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full'
                    >
                      {medication}
                      <button
                        onClick={() => removeMedication(medication)}
                        className='hover:text-green-600'
                      >
                        <X className='w-3 h-3' />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Previous Therapy */}
          <Card className='p-6'>
            <h3 className='text-lg font-semibold mb-4'>
              Histórico Terapêutico
            </h3>
            <div className='flex items-center gap-3'>
              <input
                type='checkbox'
                id='previousTherapy'
                checked={previousTherapy}
                onChange={e => setPreviousTherapy(e.target.checked)}
                className='w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500'
              />
              <label
                htmlFor='previousTherapy'
                className='text-sm text-gray-700'
              >
                Já fiz terapia psicológica anteriormente
              </label>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className='space-y-6'>
          {/* Emergency Contacts */}
          <Card className='p-6'>
            <h3 className='text-lg font-semibold mb-4 flex items-center gap-2'>
              <Shield className='w-5 h-5 text-red-600' />
              Contatos de Emergência
            </h3>
            <div className='space-y-3'>
              <div className='p-3 bg-red-50 rounded-lg'>
                <div className='font-medium text-red-800'>
                  CVV - Centro de Valorização da Vida
                </div>
                <div className='text-lg font-bold text-red-600'>188</div>
                <div className='text-xs text-red-600'>
                  24 horas - Suporte emocional
                </div>
              </div>

              <div className='p-3 bg-blue-50 rounded-lg'>
                <div className='font-medium text-blue-800'>SAMU</div>
                <div className='text-lg font-bold text-blue-600'>192</div>
                <div className='text-xs text-blue-600'>Emergências médicas</div>
              </div>

              <div className='p-3 bg-green-50 rounded-lg'>
                <div className='font-medium text-green-800'>Disque 100</div>
                <div className='text-lg font-bold text-green-600'>100</div>
                <div className='text-xs text-green-600'>
                  Violência doméstica
                </div>
              </div>
            </div>
          </Card>

          {/* Schedule Time (if scheduled) */}
          {consultationType === 'scheduled' && (
            <Card className='p-6'>
              <h3 className='text-lg font-semibold mb-4'>Horário Preferido</h3>
              <input
                type='datetime-local'
                value={preferredTime}
                onChange={e => setPreferredTime(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
                className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              />
              <p className='text-xs text-gray-500 mt-2'>
                Horários disponíveis: Segunda a Sexta, 8h às 18h
              </p>
            </Card>
          )}

          {/* Submit Button */}
          <Card className='p-6'>
            <Button
              onClick={handleSubmit}
              loading={loading}
              className='w-full'
              size='lg'
            >
              <Send className='w-5 h-5 mr-2' />
              {isCrisisLevel
                ? 'Solicitar Atendimento de Crise'
                : 'Solicitar Consulta'}
            </Button>

            {isCrisisLevel && (
              <p className='text-xs text-red-600 mt-2 text-center'>
                Você será conectado imediatamente com um psicólogo disponível
              </p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
