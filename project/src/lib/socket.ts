import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:3000';

class SocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connect(token: string) {
    if (this.socket?.connected) {
      console.log('✅ Socket já conectado');
      return this.socket;
    }

    console.log('🔌 Conectando ao WebSocket:', SOCKET_URL);

    this.socket = io(`${SOCKET_URL}/chat`, {
      auth: {
        token,
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: this.maxReconnectAttempts,
    });

    this.socket.on('connect', () => {
      console.log('✅ WebSocket conectado:', this.socket?.id);
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('🔌 WebSocket desconectado:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Erro de conexão WebSocket:', error.message);
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('❌ Máximo de tentativas de reconexão atingido');
        this.disconnect();
      }
    });

    this.socket.on('error', (error) => {
      console.error('❌ Erro WebSocket:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      console.log('🔌 Desconectando WebSocket');
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinRoom(consultationId: string, userId: string, userName: string) {
    if (!this.socket?.connected) {
      console.error('❌ Socket não conectado');
      return;
    }

    console.log('🚪 Entrando na sala:', consultationId);
    
    this.socket.emit('joinRoom', {
      consultationId,
      userId,
      userName,
    });
  }

  leaveRoom(consultationId: string) {
    if (!this.socket?.connected) {
      return;
    }

    console.log('🚪 Saindo da sala:', consultationId);
    
    this.socket.emit('leaveRoom', {
      consultationId,
    });
  }

  sendMessage(
    consultationId: string,
    senderId: string,
    senderName: string,
    senderType: 'paciente' | 'profissional' | 'sistema',
    message: string
  ) {
    if (!this.socket?.connected) {
      console.error('❌ Socket não conectado');
      throw new Error('WebSocket não conectado');
    }

    console.log('💬 Enviando mensagem via WebSocket');
    
    this.socket.emit('sendMessage', {
      consultationId,
      senderId,
      senderName,
      senderType,
      message,
    });
  }

  onMessageHistory(callback: (messages: any[]) => void) {
    if (!this.socket) return;
    
    this.socket.on('messageHistory', callback);
  }

  onNewMessage(callback: (message: any) => void) {
    if (!this.socket) return;
    
    this.socket.on('newMessage', callback);
  }

  onUserJoined(callback: (user: { userId: string; userName: string }) => void) {
    if (!this.socket) return;
    
    this.socket.on('userJoined', callback);
  }

  onUserLeft(callback: (user: { userId: string; userName: string }) => void) {
    if (!this.socket) return;
    
    this.socket.on('userLeft', callback);
  }

  onConsultationStarted(callback: (data: any) => void) {
    if (!this.socket) return;
    
    this.socket.on('consultationStarted', callback);
  }

  onConsultationFinished(callback: (data: any) => void) {
    if (!this.socket) return;
    
    this.socket.on('consultationFinished', callback);
  }

  offMessageHistory() {
    if (!this.socket) return;
    this.socket.off('messageHistory');
  }

  offNewMessage() {
    if (!this.socket) return;
    this.socket.off('newMessage');
  }

  offUserJoined() {
    if (!this.socket) return;
    this.socket.off('userJoined');
  }

  offUserLeft() {
    if (!this.socket) return;
    this.socket.off('userLeft');
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  getSocket(): Socket | null {
    return this.socket;
  }
}

// Singleton instance
export const socketService = new SocketService();
export default socketService;

