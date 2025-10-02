import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Search, 
  Filter, 
  Calendar, 
  User, 
  Stethoscope,
  Eye,
  Download,
  Share2,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { StatusBadge } from './ui/StatusBadge';

interface MedicalRecord {
  id: string;
  consultationId: string;
  specialty: string;
  diagnosis: string;
  treatment: string;
  prescription: string[];
  notes: string;
  vitalSigns: {
    bloodPressure?: string;
    heartRate?: number;
    temperature?: number;
    weight?: number;
    height?: number;
  };
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
  professional?: {
    name: string;
    specialties: string[];
  };
}

interface PatientMedicalHistoryProps {
  patientId?: string;
}

const specialtyNames = {
  'psicologo': 'Psicólogo',
  'dentista': 'Dentista',
  'medico_clinico': 'Médico Clínico',
};

export const PatientMedicalHistory: React.FC<PatientMedicalHistoryProps> = ({ 
  patientId 
}) => {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all');
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [expandedRecords, setExpandedRecords] = useState<Set<string>>(new Set());

  // Load medical records
  useEffect(() => {
    loadMedicalRecords();
  }, [patientId]);

  const loadMedicalRecords = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/v1/medical-records?patientId=${patientId}`);
      // const data = await response.json();
      
      // Mock data for development
      const mockRecords: MedicalRecord[] = [
        {
          id: 'record-1',
          consultationId: 'consultation-1',
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
          },
          attachments: [],
          isPrivate: true,
          sharedWith: [],
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          consultation: {
            specialty: 'psicologo',
            description: 'Consulta de acompanhamento psicológico',
            createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          },
          professional: {
            name: 'Dra. Maria Santos',
            specialties: ['psicologo'],
          },
        },
        {
          id: 'record-2',
          consultationId: 'consultation-2',
          specialty: 'dentista',
          diagnosis: 'Cárie dental',
          treatment: 'Restauração com resina composta',
          prescription: ['Ibuprofeno 600mg - 3x ao dia por 3 dias'],
          notes: 'Paciente apresentou cárie no dente 16. Realizada restauração com resina composta.',
          vitalSigns: {
            bloodPressure: '118/78',
            heartRate: 75,
          },
          attachments: ['radiografia-dente-16.pdf'],
          isPrivate: false,
          sharedWith: ['professional-2'],
          createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          consultation: {
            specialty: 'dentista',
            description: 'Consulta odontológica - dor no dente',
            createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          },
          professional: {
            name: 'Dr. João Silva',
            specialties: ['dentista'],
          },
        },
        {
          id: 'record-3',
          consultationId: 'consultation-3',
          specialty: 'medico_clinico',
          diagnosis: 'Hipertensão arterial',
          treatment: 'Controle da pressão arterial com medicação',
          prescription: ['Losartana 50mg - 1x ao dia'],
          notes: 'Paciente diagnosticado com hipertensão arterial. Iniciado tratamento com Losartana.',
          vitalSigns: {
            bloodPressure: '150/95',
            heartRate: 85,
            temperature: 36.8,
            weight: 75,
            height: 170,
          },
          attachments: [],
          isPrivate: true,
          sharedWith: [],
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          consultation: {
            specialty: 'medico_clinico',
            description: 'Consulta médica de rotina',
            createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          },
          professional: {
            name: 'Dr. Carlos Oliveira',
            specialties: ['medico_clinico'],
          },
        },
      ];
      
      setRecords(mockRecords);
    } catch (error) {
      console.error('Error loading medical records:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRecords = records.filter(record => {
    const matchesSearch = 
      record.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.treatment.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.notes.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.professional?.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSpecialty = selectedSpecialty === 'all' || record.specialty === selectedSpecialty;
    
    return matchesSearch && matchesSpecialty;
  });

  const toggleRecordExpansion = (recordId: string) => {
    const newExpanded = new Set(expandedRecords);
    if (newExpanded.has(recordId)) {
      newExpanded.delete(recordId);
    } else {
      newExpanded.add(recordId);
    }
    setExpandedRecords(newExpanded);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-300 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-300 rounded"></div>
            ))}
          </div>
        </div>
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
              <h2 className="text-xl font-bold text-gray-900">Histórico Médico</h2>
              <p className="text-sm text-gray-500">
                {records.length} registros encontrados
              </p>
            </div>
          </div>
          
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar por diagnóstico, tratamento, profissional..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <select
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todas as especialidades</option>
              <option value="psicologo">Psicólogo</option>
              <option value="dentista">Dentista</option>
              <option value="medico_clinico">Médico Clínico</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Records List */}
      <div className="space-y-4">
        {filteredRecords.length === 0 ? (
          <Card className="p-8 text-center">
            <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">Nenhum registro médico encontrado</p>
          </Card>
        ) : (
          filteredRecords.map((record) => {
            const isExpanded = expandedRecords.has(record.id);
            
            return (
              <Card key={record.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <Stethoscope className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {specialtyNames[record.specialty as keyof typeof specialtyNames]}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {record.professional?.name} • {formatDate(record.createdAt)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <p className="text-gray-700 font-medium">{record.diagnosis}</p>
                      <p className="text-sm text-gray-600 mt-1">{record.treatment}</p>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(record.createdAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {record.professional?.name}
                      </span>
                      {record.prescription.length > 0 && (
                        <span>{record.prescription.length} prescrições</span>
                      )}
                      {record.attachments.length > 0 && (
                        <span>{record.attachments.length} anexos</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <StatusBadge 
                      className={record.isPrivate ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}
                    >
                      {record.isPrivate ? 'Privado' : 'Compartilhado'}
                    </StatusBadge>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleRecordExpansion(record.id)}
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Diagnosis and Treatment */}
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Diagnóstico</h4>
                        <p className="text-sm text-gray-700 mb-4">{record.diagnosis}</p>
                        
                        <h4 className="font-medium text-gray-900 mb-2">Tratamento</h4>
                        <p className="text-sm text-gray-700">{record.treatment}</p>
                      </div>
                      
                      {/* Prescription and Notes */}
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Prescrições</h4>
                        {record.prescription.length > 0 ? (
                          <div className="space-y-1 mb-4">
                            {record.prescription.map((prescription, index) => (
                              <div key={index} className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                                {prescription}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500 mb-4">Nenhuma prescrição</p>
                        )}
                        
                        <h4 className="font-medium text-gray-900 mb-2">Observações</h4>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{record.notes}</p>
                      </div>
                    </div>
                    
                    {/* Vital Signs */}
                    {Object.keys(record.vitalSigns).length > 0 && (
                      <div className="mt-4">
                        <h4 className="font-medium text-gray-900 mb-2">Sinais Vitais</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          {record.vitalSigns.bloodPressure && (
                            <div>
                              <span className="text-gray-500">Pressão:</span>
                              <div className="font-medium">{record.vitalSigns.bloodPressure}</div>
                            </div>
                          )}
                          {record.vitalSigns.heartRate && (
                            <div>
                              <span className="text-gray-500">FC:</span>
                              <div className="font-medium">{record.vitalSigns.heartRate} bpm</div>
                            </div>
                          )}
                          {record.vitalSigns.temperature && (
                            <div>
                              <span className="text-gray-500">Temp:</span>
                              <div className="font-medium">{record.vitalSigns.temperature}°C</div>
                            </div>
                          )}
                          {record.vitalSigns.weight && (
                            <div>
                              <span className="text-gray-500">Peso:</span>
                              <div className="font-medium">{record.vitalSigns.weight} kg</div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Attachments */}
                    {record.attachments.length > 0 && (
                      <div className="mt-4">
                        <h4 className="font-medium text-gray-900 mb-2">Anexos</h4>
                        <div className="flex gap-2">
                          {record.attachments.map((attachment, index) => (
                            <Button
                              key={index}
                              variant="outline"
                              size="sm"
                            >
                              <Download className="w-4 h-4 mr-2" />
                              {attachment}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Actions */}
                    <div className="flex justify-end gap-2 mt-4">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-2" />
                        Ver Completo
                      </Button>
                      <Button variant="outline" size="sm">
                        <Share2 className="w-4 h-4 mr-2" />
                        Compartilhar
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};
