import React, { useState, useEffect } from 'react'
import { ArrowLeft, Clock, Calendar, AlertCircle, Send, Brain, Tooth, Stethoscope, Upload } from 'lucide-react'
import { Card } from './ui/Card'
import { Button } from './ui/Button'

interface SolicitarAtendimentoProps {
  specialtyId?: string;
  onBack?: () => void;
}

const specialtyInfo = {
  'psicologo': {
    name: 'Psicólogo',
    icon: Brain,
    color: '#8B5CF6',
    description: 'Atendimento psicológico',
    features: ['Consulta urgente', 'Consulta agendada', 'Acompanhamento'],
  },
  'dentista': {
    name: 'Dentista',
    icon: Tooth,
    color: '#06B6D4',
    description: 'Atendimento odontológico',
    features: ['Emergência dentária', 'Consulta odontológica', 'Prevenção'],
  },
  'medico-clinico': {
    name: 'Médico Clínico',
    icon: Stethoscope,
    color: '#10B981',
    description: 'Atendimento médico geral',
    features: ['Consulta médica', 'Diagnóstico', 'Prescrição'],
  },
};

const prioridades = [
  { 
    value: 'baixa', 
    label: 'Baixa', 
    description: 'Consulta de rotina',
    color: 'bg-green-100 text-green-800 border-green-200'
  },
  { 
    value: 'media', 
    label: 'Média', 
    description: 'Desconforto moderado',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200'
  },
  { 
    value: 'alta', 
    label: 'Alta', 
    description: 'Dor intensa',
    color: 'bg-orange-100 text-orange-800 border-orange-200'
  },
  { 
    value: 'urgente', 
    label: 'Urgente', 
    description: 'Emergência médica',
    color: 'bg-red-100 text-red-800 border-red-200'
  },
];

export const SolicitarAtendimento: React.FC<SolicitarAtendimentoProps> = ({ 
  specialtyId = 'psicologo', 
  onBack 
}) => {
  const [formData, setFormData] = useState({
    specialty: specialtyId,
    description: '',
    priority: 'media',
    scheduledAt: '',
    attachments: [] as File[],
  });

  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const specialty = specialtyInfo[specialtyId as keyof typeof specialtyInfo];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...files]
    }));
  };

  const removeAttachment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // TODO: Implement API call
      console.log('Submitting consultation request:', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      alert('Solicitação enviada com sucesso! Você será notificado quando um profissional estiver disponível.');
      
      // Reset form
      setFormData({
        specialty: specialtyId,
        description: '',
        priority: 'media',
        scheduledAt: '',
        attachments: [],
      });
      setStep(1);
      
    } catch (error) {
      console.error('Erro ao enviar solicitação:', error);
      alert('Erro ao enviar solicitação. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    if (step === 1) return formData.description.trim().length > 10;
    if (step === 2) return formData.priority;
    return true;
  };

  const getEstimatedWaitTime = () => {
    const baseTime = {
      'baixa': 60,
      'media': 30,
      'alta': 15,
      'urgente': 5,
    };
    return baseTime[formData.priority as keyof typeof baseTime] || 30;
  };

  const IconComponent = specialty?.icon || Brain;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          {onBack && (
            <Button
              variant="ghost"
              onClick={onBack}
              className="mb-4 flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </Button>
          )}
          
          <div className="flex items-center gap-4 mb-4">
            <div 
              className="p-3 rounded-xl"
              style={{ backgroundColor: `${specialty?.color}20` }}
            >
              <IconComponent 
                className="w-8 h-8"
                style={{ color: specialty?.color }}
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Solicitar Atendimento - {specialty?.name}
              </h1>
              <p className="text-gray-600">{specialty?.description}</p>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step >= stepNumber 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {stepNumber}
                </div>
                {stepNumber < 3 && (
                  <div 
                    className={`w-16 h-1 mx-2 ${
                      step > stepNumber ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-500">
            <span>Descrição</span>
            <span>Prioridade</span>
            <span>Confirmar</span>
          </div>
        </div>

        {/* Step Content */}
        <Card className="p-6 mb-6">
          {step === 1 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Descreva seu problema</h3>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Descreva seus sintomas, dores ou o motivo da consulta..."
                className="w-full h-32 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="mt-2 text-sm text-gray-500">
                {formData.description.length}/500 caracteres
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Selecione a prioridade</h3>
              <div className="space-y-3">
                {prioridades.map((prioridade) => (
                  <label
                    key={prioridade.value}
                    className={`block p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      formData.priority === prioridade.value
                        ? `${prioridade.color} border-current`
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="priority"
                      value={prioridade.value}
                      checked={formData.priority === prioridade.value}
                      onChange={(e) => handleInputChange('priority', e.target.value)}
                      className="sr-only"
                    />
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{prioridade.label}</div>
                        <div className="text-sm opacity-75">{prioridade.description}</div>
                      </div>
                      <div className="text-sm">
                        ~{getEstimatedWaitTime()}min
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Confirmar solicitação</h3>
              
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="font-medium mb-2">Resumo da solicitação:</div>
                  <div className="space-y-2 text-sm">
                    <div><strong>Especialidade:</strong> {specialty?.name}</div>
                    <div><strong>Prioridade:</strong> {prioridades.find(p => p.value === formData.priority)?.label}</div>
                    <div><strong>Tempo estimado de espera:</strong> {getEstimatedWaitTime()} minutos</div>
                    <div><strong>Descrição:</strong> {formData.description}</div>
                  </div>
                </div>

                {/* File Attachments */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Anexar arquivos (opcional)
                  </label>
                  <input
                    type="file"
                    multiple
                    accept="image/*,.pdf,.doc,.docx"
                    onChange={handleFileUpload}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  
                  {formData.attachments.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {formData.attachments.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-100 rounded">
                          <span className="text-sm">{file.name}</span>
                          <button
                            onClick={() => removeAttachment(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1}
          >
            Anterior
          </Button>
          
          {step < 3 ? (
            <Button
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
            >
              Próximo
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              loading={loading}
              className="flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              Enviar Solicitação
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
