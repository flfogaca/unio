import { create } from 'zustand'

export interface QueueItem {
  id: string
  pacienteId: string
  pacienteNome: string
  especialidade: string
  descricao: string
  imagem?: string
  status: 'em-fila' | 'em-atendimento' | 'finalizado'
  prioridade: 'baixa' | 'media' | 'alta'
  criadoEm: Date
  dentistaId?: string
  posicao: number
  tempoEstimado: number
}

interface QueueState {
  items: QueueItem[]
  addToQueue: (item: Omit<QueueItem, 'id' | 'status' | 'criadoEm' | 'posicao' | 'tempoEstimado'>) => void
  assumeConsulta: (itemId: string, dentistaId: string) => void
  finalizarConsulta: (itemId: string) => void
  updatePositions: () => void
}

const mockItems: QueueItem[] = [
  {
    id: '1',
    pacienteId: 'p1',
    pacienteNome: 'Maria Santos',
    especialidade: 'Clínica Geral',
    descricao: 'Dor no dente molar direito',
    status: 'em-fila',
    prioridade: 'alta',
    criadoEm: new Date(Date.now() - 15 * 60 * 1000),
    posicao: 1,
    tempoEstimado: 5
  },
  {
    id: '2',
    pacienteId: 'p2',
    pacienteNome: 'Carlos Oliveira',
    especialidade: 'Ortodontia',
    descricao: 'Avaliação para aparelho',
    status: 'em-fila',
    prioridade: 'media',
    criadoEm: new Date(Date.now() - 30 * 60 * 1000),
    posicao: 2,
    tempoEstimado: 15
  }
]

export const useQueueStore = create<QueueState>((set, get) => ({
  items: mockItems,
  addToQueue: (newItem) => {
    const items = get().items
    const queueItems = items.filter(item => item.status === 'em-fila')
    const newQueueItem: QueueItem = {
      ...newItem,
      id: Date.now().toString(),
      status: 'em-fila',
      criadoEm: new Date(),
      posicao: queueItems.length + 1,
      tempoEstimado: queueItems.length * 10 + 5
    }
    set({ items: [...items, newQueueItem] })
  },
  assumeConsulta: (itemId, dentistaId) => {
    set(state => ({
      items: state.items.map(item =>
        item.id === itemId 
          ? { ...item, status: 'em-atendimento', dentistaId }
          : item
      )
    }))
    get().updatePositions()
  },
  finalizarConsulta: (itemId) => {
    set(state => ({
      items: state.items.map(item =>
        item.id === itemId
          ? { ...item, status: 'finalizado' }
          : item
      )
    }))
    get().updatePositions()
  },
  updatePositions: () => {
    set(state => {
      const queueItems = state.items
        .filter(item => item.status === 'em-fila')
        .sort((a, b) => {
          if (a.prioridade === 'alta' && b.prioridade !== 'alta') return -1
          if (b.prioridade === 'alta' && a.prioridade !== 'alta') return 1
          return a.criadoEm.getTime() - b.criadoEm.getTime()
        })
        .map((item, index) => ({
          ...item,
          posicao: index + 1,
          tempoEstimado: index * 10 + 5
        }))

      return {
        items: [
          ...queueItems,
          ...state.items.filter(item => item.status !== 'em-fila')
        ]
      }
    })
  }
}))