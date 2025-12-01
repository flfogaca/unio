import { create } from 'zustand';
import apiClient from '@/lib/api';

export interface QueueItem {
  id: string;
  pacienteId: string;
  pacienteNome: string;
  especialidade: string;
  descricao: string;
  status: 'em-fila' | 'em-atendimento' | 'finalizado' | 'cancelado';
  prioridade: 'baixa' | 'media' | 'alta' | 'urgente';
  criadoEm: Date;
  posicao: number;
  tempoEstimado: number;
  dentistaId?: string;
  dentistaNome?: string;
  profissionalId?: string;
  profissionalNome?: string;
  imagem?: string;
  reason?: string;
  notes?: string;
  startedAt?: string;
  finishedAt?: string;
  createdAt?: string;
}

interface QueueState {
  items: QueueItem[];
  isLoading: boolean;
  error: string | null;
  addToQueue: (
    item: Omit<
      QueueItem,
      'id' | 'status' | 'criadoEm' | 'posicao' | 'tempoEstimado'
    >
  ) => Promise<void>;
  assumeConsulta: (itemId: string, dentistaId: string) => Promise<void>;
  finalizarConsulta: (itemId: string, notes?: string) => Promise<void>;
  updatePositions: () => Promise<void>;
  fetchQueue: () => Promise<void>;
  fetchAllConsultations: () => Promise<void>;
  clearError: () => void;
}

export const useQueueStore = create<QueueState>((set, get) => ({
  items: [],
  isLoading: false,
  error: null,

  addToQueue: async newItem => {
    try {
      set({ isLoading: true, error: null });

      // Converter especialidade para formato do backend
      const specialtyMap = {
        dentista: 'dentista',
        psicólogo: 'psicologo',
        'médico clínico': 'medico_clinico',
      };

      const consultationData = {
        patientId: newItem.pacienteId,
        specialty:
          specialtyMap[
            newItem.especialidade.toLowerCase() as keyof typeof specialtyMap
          ] || newItem.especialidade.toLowerCase(),
        description: newItem.descricao,
        reason: newItem.descricao,
        priority: newItem.prioridade,
        attachments: newItem.imagem ? [newItem.imagem] : [],
      };

      const response = await apiClient.createConsultation(consultationData);

      if (response.success) {
        const consultation = response.data as any as any;
        const queueItem: QueueItem = {
          id: consultation.id,
          pacienteId: consultation.patientId,
          pacienteNome: newItem.pacienteNome,
          especialidade: consultation.specialty,
          descricao: consultation.description,
          status: 'em-fila',
          prioridade: consultation.priority,
          criadoEm: new Date(consultation.createdAt),
          posicao: consultation.position || 1,
          tempoEstimado: consultation.estimatedWaitTime || 5,
          imagem: newItem.imagem,
        };

        set(state => ({
          items: [...state.items, queueItem],
          isLoading: false,
        }));
      } else {
        const errorMessage = response.message || 'Erro ao adicionar à fila';
        set({
          error: errorMessage,
          isLoading: false,
        });
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Erro ao adicionar à fila';
      set({
        error: errorMessage,
        isLoading: false,
      });
      throw error;
    }
  },

  assumeConsulta: async itemId => {
    try {
      set({ isLoading: true, error: null });

      // Usar endpoint específico de assumir consulta
      const response = await apiClient.assumeConsultation(itemId);

      if (response.success) {
        // Backend retorna a consulta atualizada
        const consultation = response.data as any;

        set(state => ({
          items: state.items.map(item =>
            item.id === itemId
              ? {
                  ...item,
                  status: 'em-atendimento',
                  dentistaId: consultation.professionalId,
                  dentistaNome: consultation.professional?.name,
                }
              : item
          ),
          isLoading: false,
        }));

        // Atualizar posições da fila
        await get().updatePositions();
      } else {
        set({
          error: response.message || 'Erro ao assumir consulta',
          isLoading: false,
        });
      }
    } catch (error: any) {
      console.error('Erro ao assumir consulta:', error);
      set({
        error: error.message || 'Erro ao assumir consulta',
        isLoading: false,
      });
      throw error;
    }
  },

  finalizarConsulta: async (itemId, notes?: string) => {
    try {
      set({ isLoading: true, error: null });

      // Usar endpoint específico de finalizar consulta
      const response = await apiClient.finishConsultation(itemId, notes);

      if (response.success) {
        set(state => ({
          items: state.items.map(item =>
            item.id === itemId ? { ...item, status: 'finalizado' } : item
          ),
          isLoading: false,
        }));

        // Atualizar posições da fila
        await get().updatePositions();
      } else {
        set({
          error: response.message || 'Erro ao finalizar consulta',
          isLoading: false,
        });
      }
    } catch (error: any) {
      console.error('Erro ao finalizar consulta:', error);
      set({
        error: error.message || 'Erro ao finalizar consulta',
        isLoading: false,
      });
      throw error;
    }
  },

  updatePositions: async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('⚠️ No token found when trying to update positions');
        return;
      }

      const response = await apiClient.getConsultations();

      if (response.success) {
        // A resposta tem estrutura paginada: { data: { data: [], total, ... } }
        const consultationsList =
          (response.data as any).data || response.data || [];

        const queueItems = consultationsList
          .filter(
            (c: any) => c.status === 'em_fila' || c.status === 'em_atendimento'
          )
          .map((c: any) => ({
            id: c.id,
            pacienteId: c.patientId,
            pacienteNome: c.patient?.name || 'Paciente',
            especialidade: c.specialty,
            descricao: c.description,
            status: c.status === 'em_fila' ? 'em-fila' : 'em-atendimento',
            prioridade: c.priority,
            criadoEm: new Date(c.createdAt),
            posicao: c.position || 1,
            tempoEstimado: c.estimatedWaitTime || 5,
            dentistaId: c.professionalId,
            dentistaNome: c.professional?.name,
          }));

        set({ items: queueItems });
      }
    } catch (error) {
      console.error('Error updating positions:', error);
    }
  },

  fetchAllConsultations: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await apiClient.getConsultations();

      if (response.success) {
        console.log('📋 Buscando TODAS consultas (incluindo finalizadas)');
        const consultationsList =
          (response.data as any).data || response.data || [];

        // Mapear status do backend para o formato do frontend
        const statusMap: Record<
          string,
          'em-fila' | 'em-atendimento' | 'finalizado' | 'cancelado'
        > = {
          em_fila: 'em-fila',
          em_atendimento: 'em-atendimento',
          finalizado: 'finalizado',
          cancelado: 'cancelado',
        };

        const allItems = consultationsList.map((c: any) => ({
          id: c.id,
          pacienteId: c.patientId,
          pacienteNome: c.patient?.name || 'Paciente',
          especialidade: c.specialty,
          descricao: c.description || c.reason,
          status: statusMap[c.status] || c.status,
          prioridade: c.priority,
          criadoEm: new Date(c.createdAt),
          posicao: c.position || 0,
          tempoEstimado: c.estimatedWaitTime || 0,
          dentistaId: c.professionalId,
          dentistaNome: c.professional?.name,
          profissionalNome: c.professional?.name,
          profissionalId: c.professionalId,
          reason: c.reason,
          notes: c.notes,
          startedAt: c.startedAt,
          finishedAt: c.finishedAt,
          createdAt: c.createdAt,
        }));

        console.log(`✅ Total de consultas carregadas: ${allItems.length}`);
        set({ items: allItems, isLoading: false });
      }
    } catch (error: any) {
      console.error('Erro ao buscar todas consultas:', error);
      set({
        error: error.message || 'Erro ao carregar histórico',
        isLoading: false,
      });
    }
  },

  fetchQueue: async () => {
    try {
      set({ isLoading: true, error: null });
      await get().updatePositions();
      set({ isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || 'Erro ao carregar fila',
        isLoading: false,
      });
    }
  },

  clearError: () => set({ error: null }),
}));
