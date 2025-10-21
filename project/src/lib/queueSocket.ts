import { io, Socket } from 'socket.io-client';

const SOCKET_URL =
  import.meta.env.VITE_API_URL?.replace('/api/v1', '') ||
  'http://localhost:3000';

class QueueSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connect(token: string) {
    if (this.socket?.connected) {
      console.log('✅ Queue Socket já conectado');
      return this.socket;
    }

    console.log('🔌 Conectando ao Queue WebSocket:', SOCKET_URL);

    this.socket = io(`${SOCKET_URL}/queue`, {
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
      console.log('✅ Queue WebSocket conectado:', this.socket?.id);
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', reason => {
      console.log('🔌 Queue WebSocket desconectado:', reason);
    });

    this.socket.on('connect_error', error => {
      console.error('❌ Erro de conexão Queue WebSocket:', error.message);
      this.reconnectAttempts++;

      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('❌ Máximo de tentativas de reconexão atingido');
        this.disconnect();
      }
    });

    this.socket.on('error', error => {
      console.error('❌ Erro Queue WebSocket:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      console.log('🔌 Desconectando Queue WebSocket');
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinUserRoom(userId: string) {
    if (!this.socket?.connected) {
      console.error('❌ Queue Socket não conectado');
      return;
    }

    console.log('🚪 Entrando na sala do usuário:', userId);

    this.socket.emit('join-user-room', {
      userId,
    });
  }

  leaveUserRoom(userId: string) {
    if (!this.socket?.connected) {
      return;
    }

    console.log('🚪 Saindo da sala do usuário:', userId);

    this.socket.emit('leave-user-room', {
      userId,
    });
  }

  emit(event: string, data: any) {
    if (!this.socket?.connected) {
      console.error('❌ Queue Socket não conectado');
      throw new Error('Queue WebSocket não conectado');
    }

    console.log(`📤 Emitindo evento ${event}:`, data);
    this.socket.emit(event, data);
  }

  on(event: string, callback: (...args: any[]) => void) {
    if (!this.socket) return;

    this.socket.on(event, callback);
  }

  off(event: string, callback?: (...args: any[]) => void) {
    if (!this.socket) return;

    if (callback) {
      this.socket.off(event, callback);
    } else {
      this.socket.off(event);
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  getSocket(): Socket | null {
    return this.socket;
  }
}

// Singleton instance
export const queueSocketService = new QueueSocketService();
export default queueSocketService;
