import { create } from 'zustand'
import { socketService } from '@/lib/socket'

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
  initialized: { [consultationId: string]: boolean }
  connected: boolean
  addMessage: (consultationId: string, message: ChatMessage) => void
  sendMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void
  setMessages: (consultationId: string, messages: ChatMessage[]) => void
  getMessages: (consultationId: string) => ChatMessage[]
  clearMessages: (consultationId: string) => void
  markAsInitialized: (consultationId: string) => void
  isInitialized: (consultationId: string) => boolean
  setConnected: (connected: boolean) => void
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: {},
  initialized: {},
  connected: false,

  addMessage: (consultationId: string, message: ChatMessage) => {
    console.log('💬 Adicionando mensagem ao store:', message.id)
    
    set(state => {
      const currentMessages = state.messages[consultationId] || []
      
      // Verificar se a mensagem já existe
      const exists = currentMessages.some(m => m.id === message.id)
      if (exists) {
        console.log('⏭️ Mensagem já existe, ignorando')
        return state
      }
      
      return {
        messages: {
          ...state.messages,
          [consultationId]: [...currentMessages, message]
        }
      }
    })
  },

  sendMessage: (messageData) => {
    const { consultationId, senderId, senderName, senderType, message } = messageData
    
    console.log('📤 Enviando mensagem via WebSocket:', {
      consultationId,
      senderName,
      senderType
    })
    
    try {
      socketService.sendMessage(
        consultationId,
        senderId,
        senderName,
        senderType,
        message
      )
      console.log('✅ Mensagem enviada')
    } catch (error) {
      console.error('❌ Erro ao enviar mensagem:', error)
      throw error
    }
  },

  setMessages: (consultationId: string, messages: ChatMessage[]) => {
    console.log('📋 Setando mensagens:', consultationId, messages.length, 'mensagens')
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
    console.log('🧹 Limpando chat da consulta:', consultationId)
    set(state => {
      const newMessages = { ...state.messages }
      const newInitialized = { ...state.initialized }
      
      // Remover dados da consulta
      delete newMessages[consultationId]
      delete newInitialized[consultationId]
      
      return {
        messages: newMessages,
        initialized: newInitialized
      }
    })
    console.log('✅ Chat limpo completamente')
  },

  markAsInitialized: (consultationId: string) => {
    set(state => ({
      initialized: {
        ...state.initialized,
        [consultationId]: true
      }
    }))
  },

  isInitialized: (consultationId: string) => {
    return get().initialized[consultationId] || false
  },

  setConnected: (connected: boolean) => {
    set({ connected })
  }
}))

export const initializeConsultationChat = async (
  consultationId: string,
  userId: string,
  userName: string,
  token: string
) => {
  const { isInitialized, markAsInitialized, setMessages, addMessage, setConnected } = useChatStore.getState()
  
  // Verificar se já foi inicializado
  if (isInitialized(consultationId)) {
    console.log('✅ Chat já inicializado para esta consulta:', consultationId)
    return
  }
  
  console.log('🚀 Inicializando chat WebSocket para consulta:', consultationId)
  
  try {
    // Conectar ao WebSocket
    if (!socketService.isConnected()) {
      socketService.connect(token)
      await new Promise(resolve => setTimeout(resolve, 500)) // Aguardar conexão
    }
    
    setConnected(true)
    
    // Configurar listeners
    socketService.onMessageHistory((messages) => {
      console.log('📥 Histórico recebido:', messages.length, 'mensagens')
      const formattedMessages = messages.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.createdAt || msg.timestamp)
      }))
      setMessages(consultationId, formattedMessages)
    })
    
    socketService.onNewMessage((message) => {
      console.log('📨 Nova mensagem recebida:', message.senderName)
      const formattedMessage = {
        ...message,
        timestamp: new Date(message.createdAt || message.timestamp)
      }
      addMessage(consultationId, formattedMessage)
    })
    
    socketService.onUserJoined((user) => {
      console.log('👋 Usuário entrou:', user.userName)
      // Adicionar mensagem do sistema (opcional)
      addMessage(consultationId, {
        id: `system-${Date.now()}`,
        consultationId,
        senderId: 'sistema',
        senderName: 'Sistema',
        senderType: 'sistema',
        message: `${user.userName} entrou na consulta`,
        timestamp: new Date()
      })
    })
    
    socketService.onUserLeft((user) => {
      console.log('👋 Usuário saiu:', user.userName)
      // Adicionar mensagem do sistema (opcional)
      addMessage(consultationId, {
        id: `system-${Date.now()}`,
        consultationId,
        senderId: 'sistema',
        senderName: 'Sistema',
        senderType: 'sistema',
        message: `${user.userName} saiu da consulta`,
        timestamp: new Date()
      })
    })
    
    // Entrar na sala
    socketService.joinRoom(consultationId, userId, userName)
    
    // Marcar como inicializado
    markAsInitialized(consultationId)
    console.log('✅ Chat WebSocket inicializado com sucesso')
    
  } catch (error) {
    console.error('❌ Erro ao inicializar chat WebSocket:', error)
    setConnected(false)
    throw error
  }
}

export const disconnectChat = (consultationId: string) => {
  console.log('🔌 Desconectando chat:', consultationId)
  
  socketService.leaveRoom(consultationId)
  socketService.offMessageHistory()
  socketService.offNewMessage()
  socketService.offUserJoined()
  socketService.offUserLeft()
  
  const { clearMessages, setConnected } = useChatStore.getState()
  clearMessages(consultationId)
  setConnected(false)
  
  console.log('✅ Chat desconectado')
}
