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
  // Forçar re-render quando mensagens mudam
  forceUpdate: () => void
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: {},

  addMessage: (messageData) => {
    console.log('💬 Adicionando mensagem ao chat:', messageData)
    const message: ChatMessage = {
      ...messageData,
      id: Date.now().toString(),
      timestamp: new Date()
    }

    set(state => {
      const newMessages = {
        ...state.messages,
        [message.consultationId]: [
          ...(state.messages[message.consultationId] || []),
          message
        ]
      }
      console.log('💬 Mensagens atualizadas:', newMessages)
      return { messages: newMessages }
    })
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
  },

  forceUpdate: () => {
    set(state => ({ ...state }))
  }
}))

// Função para inicializar mensagens do sistema
export const initializeConsultationChat = (consultationId: string) => {
  console.log('🚀 Inicializando chat para consulta:', consultationId)
  const { addMessage, getMessages } = useChatStore.getState()
  
  // Verificar se já tem mensagens para esta consulta
  const existingMessages = getMessages(consultationId)
  console.log('📋 Mensagens existentes:', existingMessages.length)
  
  if (existingMessages.length === 0) {
    console.log('➕ Adicionando mensagem inicial do sistema')
    // Adicionar mensagem inicial do sistema
    addMessage({
      consultationId,
      senderId: 'sistema',
      senderName: 'Sistema',
      senderType: 'sistema',
      message: 'Consulta iniciada. Conectando os participantes...'
    })
  } else {
    console.log('✅ Chat já inicializado para esta consulta')
  }
}
