import { create } from 'zustand'
import { apiClient } from '@/lib/api'

export interface ChatMessage {
  id: string
  consultationId: string
  senderId: string
  senderName: string
  senderType: 'paciente' | 'profissional' | 'sistema'
  message: string
  timestamp: Date
  createdAt?: string
}

interface ChatState {
  messages: { [consultationId: string]: ChatMessage[] }
  lastFetch: { [consultationId: string]: Date }
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => Promise<void>
  loadMessages: (consultationId: string) => Promise<void>
  pollMessages: (consultationId: string) => Promise<void>
  setMessages: (consultationId: string, messages: ChatMessage[]) => void
  getMessages: (consultationId: string) => ChatMessage[]
  clearMessages: (consultationId: string) => void
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: {},
  lastFetch: {},

  addMessage: async (messageData) => {
    console.log('💬 Enviando mensagem ao backend:', messageData)
    
    try {
      // Enviar mensagem para o backend
      const response = await apiClient.sendChatMessage(messageData)
      console.log('✅ Mensagem salva no backend:', response.data)
      
      // Adicionar ao store local
      const message: ChatMessage = {
        ...messageData,
        id: response.data.id,
        timestamp: new Date(response.data.createdAt),
        createdAt: response.data.createdAt
      }

      set(state => {
        const newMessages = {
          ...state.messages,
          [message.consultationId]: [
            ...(state.messages[message.consultationId] || []),
            message
          ]
        }
        console.log('💬 Mensagens atualizadas no store:', newMessages[message.consultationId].length)
        return { messages: newMessages }
      })
    } catch (error) {
      console.error('❌ Erro ao enviar mensagem:', error)
      throw error
    }
  },

  loadMessages: async (consultationId: string) => {
    console.log('📥 Carregando mensagens do backend:', consultationId)
    
    try {
      const response = await apiClient.getChatMessages(consultationId)
      const messages: ChatMessage[] = response.data.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.createdAt)
      }))
      
      console.log('📋 Mensagens carregadas:', messages.length)
      
      set(state => ({
        messages: {
          ...state.messages,
          [consultationId]: messages
        },
        lastFetch: {
          ...state.lastFetch,
          [consultationId]: new Date()
        }
      }))
    } catch (error) {
      console.error('❌ Erro ao carregar mensagens:', error)
    }
  },

  pollMessages: async (consultationId: string) => {
    const state = get()
    const lastFetch = state.lastFetch[consultationId]
    
    if (!lastFetch) {
      // Se nunca buscou, buscar todas
      await state.loadMessages(consultationId)
      return
    }
    
    console.log('🔄 Buscando mensagens novas desde:', lastFetch)
    
    try {
      const response = await apiClient.getChatMessagesSince(consultationId, lastFetch)
      const newMessages: ChatMessage[] = response.data.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.createdAt)
      }))
      
      if (newMessages.length > 0) {
        console.log('📨 Novas mensagens recebidas:', newMessages.length)
        
        set(state => ({
          messages: {
            ...state.messages,
            [consultationId]: [
              ...(state.messages[consultationId] || []),
              ...newMessages
            ]
          },
          lastFetch: {
            ...state.lastFetch,
            [consultationId]: new Date()
          }
        }))
      }
    } catch (error) {
      console.error('❌ Erro ao buscar novas mensagens:', error)
    }
  },

  setMessages: (consultationId: string, messages: ChatMessage[]) => {
    set(state => ({
      messages: {
        ...state.messages,
        [consultationId]: messages
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

export const initializeConsultationChat = async (consultationId: string) => {
  console.log('🚀 Inicializando chat para consulta:', consultationId)
  const { loadMessages, addMessage, getMessages } = useChatStore.getState()
  
  // Carregar mensagens do backend
  await loadMessages(consultationId)
  
  // Se não houver mensagens, adicionar mensagem inicial do sistema
  const existingMessages = getMessages(consultationId)
  if (existingMessages.length === 0) {
    console.log('➕ Adicionando mensagem inicial do sistema')
    await addMessage({
      consultationId,
      senderId: 'sistema',
      senderName: 'Sistema',
      senderType: 'sistema',
      message: 'Consulta iniciada. Conectando os participantes...'
    })
  }
}
