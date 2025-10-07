import { create } from 'zustand'

export interface ChatMessage {
  id: string
  consultationId: string
  senderId: string
  senderName: string
  senderType: 'paciente' | 'profissional' | 'sistema'
  message: string
  timestamp: Date
}

interface ChatState {
  messages: { [consultationId: string]: ChatMessage[] }
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void
  getMessages: (consultationId: string) => ChatMessage[]
  clearMessages: (consultationId: string) => void
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: {},

  addMessage: (messageData) => {
    const message: ChatMessage = {
      ...messageData,
      id: Date.now().toString(),
      timestamp: new Date()
    }

    set(state => ({
      messages: {
        ...state.messages,
        [message.consultationId]: [
          ...(state.messages[message.consultationId] || []),
          message
        ]
      }
    }))
  },

  getMessages: (consultationId: string) => {
    return get().messages[consultationId] || []
  },

  clearMessages: (consultationId: string) => {
    set(state => ({
      messages: {
        ...state.messages,
        [consultationId]: []
      }
    }))
  }
}))

// Função para inicializar mensagens do sistema
export const initializeConsultationChat = (consultationId: string) => {
  const { addMessage } = useChatStore.getState()
  
  // Verificar se já tem mensagens para esta consulta
  const existingMessages = useChatStore.getState().getMessages(consultationId)
  
  if (existingMessages.length === 0) {
    // Adicionar mensagem inicial do sistema
    addMessage({
      consultationId,
      senderId: 'sistema',
      senderName: 'Sistema',
      senderType: 'sistema',
      message: 'Consulta iniciada. Conectando os participantes...'
    })
  }
}
