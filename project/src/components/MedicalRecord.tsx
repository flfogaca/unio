import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Plus, 
  Edit, 
  Save, 
  X, 
  Download,
  Upload,
  Stethoscope,
  Heart,
  Activity
} from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { StatusBadge } from './ui/StatusBadge';

interface MedicalRecordProps {
  consultationId: string;
  isEditable: boolean;
  onSave?: (record: any) => void;
}

interface VitalSigns {
  bloodPressure?: string;
  heartRate?: number;
  temperature?: number;
  weight?: number;
  height?: number;
  oxygenSaturation?: number;
}

interface MedicalRecordData {
  id: string;
  consultationId: string;
  patientId: string;
  professionalId: string;
  specialty: string;
  diagnosis: string;
  treatment: string;
  prescription: string[];
  notes: string;
  vitalSigns: VitalSigns;
  attachments: string[];
  isPrivate: boolean;
  sharedWith: string[];
  createdAt: string;
  updatedAt: string;
  consultation?: {
    specialty: string;
    description: string;
    createdAt: string;
  };
  patient?: {
    name: string;
    cpf: string;
  };
  professional?: {
    name: string;
    specialties: string[];
  };
}

export const MedicalRecord: React.FC<MedicalRecordProps> = ({ 
  consultationId, 
  isEditable, 
  onSave 
}) => {
  const [record, setRecord] = useState<MedicalRecordData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    diagnosis: '',
    treatment: '',
    prescription: [] as string[],
    notes: '',
    vitalSigns: {
      bloodPressure: '',
      heartRate: '',
      temperature: '',
      weight: '',
      height: '',
      oxygenSaturation: '',
    } as any,
    attachments: [] as File[],
  });

  // Load medical record
  useEffect(() => {
    loadMedicalRecord();
  }, [consultationId]);

  const loadMedicalRecord = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/v1/medical-records/${consultationId}`);
      // const data = await response.json();
      
      // Mock data for development
      const mockRecord: MedicalRecordData = {
        id: 'record-1',
        consultationId,
        patientId: 'patient-1',
        professionalId: 'professional-1',
        specialty: 'psicologo',
        diagnosis: 'Ansiedade generalizada',
        treatment: 'Terapia cognitivo-comportamental',
        prescription: ['Fluoxetina 20mg - 1x ao dia'],
        notes: 'Paciente apresentou melhora significativa nos sintomas de ansiedade após 3 sessões.',
        vitalSigns: {
          bloodPressure: '120/80',
          heartRate: 72,
          temperature: 36.5,
          weight: 70,
          height: 170,
          oxygenSaturation: 98,
        },
        attachments: [],
        isPrivate: true,
        sharedWith: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        consultation: {
          specialty: 'psicologo',
          description: 'Consulta de acompanhamento psicológico',
          createdAt: new Date().toISOString(),
        },
        patient: {
          name: 'João Silva',
          cpf: '123.456.789-00',
        },
        professional: {
          name: 'Dra. Maria Santos',
          specialties: ['psicologo'],
        },
      };
      
      setRecord(mockRecord);
      
      // Populate form data if editing
      if (isEditable) {
        setFormData({
          diagnosis: mockRecord.diagnosis,
          treatment: mockRecord.treatment,
          prescription: mockRecord.prescription,
          notes: mockRecord.notes,
          vitalSigns: mockRecord.vitalSigns,
          attachments: [],
        });
      }
    } catch (error) {
      console.error('Error loading medical record:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      const recordData = {
        ...formData,
        prescription: formData.prescription.filter(p => p.trim() !== ''),
      };

      // TODO: Replace with actual API call
      console.log('Saving medical record:', recordData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (onSave) {
        onSave(recordData);
      }
      
      setIsEditing(false);
      // Reload record
      await loadMedicalRecord();
      
    } catch (error) {
      console.error('Error saving medical record:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (record) {
      setFormData({
        diagnosis: record.diagnosis,
        treatment: record.treatment,
        prescription: record.prescription,
        notes: record.notes,
        vitalSigns: record.vitalSigns,
        attachments: [],
      });
    }
  };

  const addPrescriptionItem = () => {
    setFormData(prev => ({
      ...prev,
      prescription: [...prev.prescription, ''],
    }));
  };

  const updatePrescriptionItem = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      prescription: prev.prescription.map((item, i) => i === index ? value : item),
    }));
  };

  const removePrescriptionItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      prescription: prev.prescription.filter((_, i) => i !== index),
    }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...files],
    }));
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-300 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-300 rounded"></div>
            <div className="h-4 bg-gray-300 rounded w-5/6"></div>
            <div className="h-4 bg-gray-300 rounded w-4/6"></div>
          </div>
        </div>
      </Card>
    );
  }

  if (!record) {
    return (
      <Card className="p-6 text-center">
        <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <p className="text-gray-500">Prontuário não encontrado</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Prontuário Eletrônico</h2>
              <p className="text-sm text-gray-500">
                {record.consultation?.specialty} - {record.patient?.name}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <StatusBadge className={record.isPrivate ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}>
              {record.isPrivate ? 'Privado' : 'Compartilhado'}
            </StatusBadge>
            
            {isEditable && !isEditing && (
              <Button
                onClick={() => setIsEditing(true)}
                size="sm"
              >
                <Edit className="w-4 h-4 mr-2" />
                Editar
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Paciente:</span>
            <div className="font-medium">{record.patient?.name}</div>
          </div>
          <div>
            <span className="text-gray-500">Profissional:</span>
            <div className="font-medium">{record.professional?.name}</div>
          </div>
          <div>
            <span className="text-gray-500">Data:</span>
            <div className="font-medium">
              {new Date(record.createdAt).toLocaleDateString('pt-BR')}
            </div>
          </div>
        </div>
      </Card>

      {/* Diagnosis */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Stethoscope className="w-5 h-5" />
          Diagnóstico
        </h3>
        
        {isEditing ? (
          <textarea
            value={formData.diagnosis}
            onChange={(e) => setFormData(prev => ({ ...prev, diagnosis: e.target.value }))}
            placeholder="Digite o diagnóstico..."
            className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
          />
        ) : (
          <p className="text-gray-700">{record.diagnosis}</p>
        )}
      </Card>

      {/* Treatment */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Tratamento
        </h3>
        
        {isEditing ? (
          <textarea
            value={formData.treatment}
            onChange={(e) => setFormData(prev => ({ ...prev, treatment: e.target.value }))}
            placeholder="Digite o tratamento recomendado..."
            className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
          />
        ) : (
          <p className="text-gray-700">{record.treatment}</p>
        )}
      </Card>

      {/* Prescription */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Prescrição Médica
        </h3>
        
        {isEditing ? (
          <div className="space-y-3">
            {formData.prescription.map((item, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={item}
                  onChange={(e) => updatePrescriptionItem(index, e.target.value)}
                  placeholder="Digite a prescrição..."
                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Button
                  onClick={() => removePrescriptionItem(index)}
                  variant="outline"
                  size="sm"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
            <Button
              onClick={addPrescriptionItem}
              variant="outline"
              size="sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Prescrição
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {record.prescription.length > 0 ? (
              record.prescription.map((item, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  {item}
                </div>
              ))
            ) : (
              <p className="text-gray-500 italic">Nenhuma prescrição</p>
            )}
          </div>
        )}
      </Card>

      {/* Vital Signs */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Heart className="w-5 h-5" />
          Sinais Vitais
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pressão Arterial
            </label>
            {isEditing ? (
              <input
                type="text"
                value={formData.vitalSigns.bloodPressure}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  vitalSigns: { ...prev.vitalSigns, bloodPressure: e.target.value }
                }))}
                placeholder="120/80"
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            ) : (
              <p className="text-gray-700">{record.vitalSigns.bloodPressure || 'N/A'}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Frequência Cardíaca
            </label>
            {isEditing ? (
              <input
                type="number"
                value={formData.vitalSigns.heartRate}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  vitalSigns: { ...prev.vitalSigns, heartRate: e.target.value }
                }))}
                placeholder="72"
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            ) : (
              <p className="text-gray-700">{record.vitalSigns.heartRate || 'N/A'} bpm</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Temperatura
            </label>
            {isEditing ? (
              <input
                type="number"
                step="0.1"
                value={formData.vitalSigns.temperature}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  vitalSigns: { ...prev.vitalSigns, temperature: e.target.value }
                }))}
                placeholder="36.5"
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            ) : (
              <p className="text-gray-700">{record.vitalSigns.temperature || 'N/A'}°C</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Peso
            </label>
            {isEditing ? (
              <input
                type="number"
                value={formData.vitalSigns.weight}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  vitalSigns: { ...prev.vitalSigns, weight: e.target.value }
                }))}
                placeholder="70"
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            ) : (
              <p className="text-gray-700">{record.vitalSigns.weight || 'N/A'} kg</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Altura
            </label>
            {isEditing ? (
              <input
                type="number"
                value={formData.vitalSigns.height}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  vitalSigns: { ...prev.vitalSigns, height: e.target.value }
                }))}
                placeholder="170"
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            ) : (
              <p className="text-gray-700">{record.vitalSigns.height || 'N/A'} cm</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Saturação O2
            </label>
            {isEditing ? (
              <input
                type="number"
                value={formData.vitalSigns.oxygenSaturation}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  vitalSigns: { ...prev.vitalSigns, oxygenSaturation: e.target.value }
                }))}
                placeholder="98"
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            ) : (
              <p className="text-gray-700">{record.vitalSigns.oxygenSaturation || 'N/A'}%</p>
            )}
          </div>
        </div>
      </Card>

      {/* Notes */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Observações
        </h3>
        
        {isEditing ? (
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            placeholder="Digite observações adicionais..."
            className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={4}
          />
        ) : (
          <p className="text-gray-700 whitespace-pre-wrap">{record.notes}</p>
        )}
      </Card>

      {/* Attachments */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Anexos
        </h3>
        
        {isEditing ? (
          <div>
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
                      onClick={() => setFormData(prev => ({
                        ...prev,
                        attachments: prev.attachments.filter((_, i) => i !== index)
                      }))}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            {record.attachments.length > 0 ? (
              <div className="space-y-2">
                {record.attachments.map((attachment, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm">{attachment}</span>
                    <Button size="sm" variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Baixar
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">Nenhum anexo</p>
            )}
          </div>
        )}
      </Card>

      {/* Actions */}
      {isEditing && (
        <div className="flex justify-end gap-3">
          <Button
            onClick={handleCancel}
            variant="outline"
          >
            <X className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            loading={saving}
          >
            <Save className="w-4 h-4 mr-2" />
            Salvar
          </Button>
        </div>
      )}
    </div>
  );
};
