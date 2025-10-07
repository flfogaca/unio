import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { ChatService } from '../../application/services/chat.service';
import { JwtService } from '@nestjs/jwt';

interface JoinRoomPayload {
  consultationId: string;
  userId: string;
  userName: string;
}

interface SendMessagePayload {
  consultationId: string;
  senderId: string;
  senderName: string;
  senderType: 'paciente' | 'profissional' | 'sistema';
  message: string;
}

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedUsers = new Map<string, { userId: string; userName: string; consultationId: string }>();

  constructor(
    private readonly chatService: ChatService,
    private readonly jwtService: JwtService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token || client.handshake.headers.authorization?.replace('Bearer ', '');
      
      if (token) {
        const payload = this.jwtService.verify(token);
        console.log('✅ WebSocket conectado:', client.id, 'User:', payload.sub);
        client.data.user = payload;
      } else {
        console.log('⚠️ WebSocket conectado sem autenticação:', client.id);
      }
    } catch (error) {
      console.error('❌ Erro na autenticação WebSocket:', error.message);
    }
  }

  handleDisconnect(client: Socket) {
    const userData = this.connectedUsers.get(client.id);
    if (userData) {
      console.log('👋 Usuário desconectado:', userData.userName, 'da consulta:', userData.consultationId);
      client.leave(userData.consultationId);
      this.connectedUsers.delete(client.id);
      
      // Notificar outros usuários na sala
      this.server.to(userData.consultationId).emit('userLeft', {
        userId: userData.userId,
        userName: userData.userName,
      });
    }
    console.log('🔌 WebSocket desconectado:', client.id);
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: JoinRoomPayload,
  ) {
    const { consultationId, userId, userName } = payload;
    
    console.log('🚪 Usuário entrando na sala:', userName, 'Consulta:', consultationId);
    
    // Entrar na sala
    client.join(consultationId);
    
    // Armazenar dados do usuário
    this.connectedUsers.set(client.id, { userId, userName, consultationId });
    
    // Carregar histórico de mensagens
    const messages = await this.chatService.getMessages(consultationId);
    
    // Enviar histórico apenas para o cliente que entrou
    client.emit('messageHistory', messages);
    
    // Notificar outros usuários na sala
    client.to(consultationId).emit('userJoined', {
      userId,
      userName,
    });
    
    console.log('✅ Usuário entrou na sala:', userName);
    
    return { success: true, message: 'Entrou na sala com sucesso' };
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: SendMessagePayload,
  ) {
    const { consultationId, senderId, senderName, senderType, message } = payload;
    
    console.log('💬 Nova mensagem recebida:', senderName, 'na consulta:', consultationId);
    
    try {
      // Salvar mensagem no banco de dados
      const savedMessage = await this.chatService.createMessage({
        consultationId,
        senderId,
        senderName,
        senderType,
        message,
      });
      
      console.log('✅ Mensagem salva no DB:', savedMessage.id);
      
      // Broadcast para todos na sala (incluindo o remetente)
      this.server.to(consultationId).emit('newMessage', {
        id: savedMessage.id,
        consultationId: savedMessage.consultationId,
        senderId: savedMessage.senderId,
        senderName: savedMessage.senderName,
        senderType: savedMessage.senderType,
        message: savedMessage.message,
        createdAt: savedMessage.createdAt,
        timestamp: savedMessage.createdAt,
      });
      
      console.log('📡 Mensagem enviada para sala:', consultationId);
      
      return { success: true, messageId: savedMessage.id };
    } catch (error) {
      console.error('❌ Erro ao enviar mensagem:', error);
      client.emit('error', { message: 'Erro ao enviar mensagem' });
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { consultationId: string },
  ) {
    const { consultationId } = payload;
    const userData = this.connectedUsers.get(client.id);
    
    if (userData) {
      console.log('🚪 Usuário saindo da sala:', userData.userName);
      client.leave(consultationId);
      this.connectedUsers.delete(client.id);
      
      // Notificar outros usuários
      client.to(consultationId).emit('userLeft', {
        userId: userData.userId,
        userName: userData.userName,
      });
    }
    
    return { success: true };
  }

  // Método para enviar notificação de consulta iniciada
  notifyConsultationStarted(consultationId: string, professionalName: string) {
    this.server.to(consultationId).emit('consultationStarted', {
      consultationId,
      professionalName,
      message: 'A consulta foi iniciada!',
    });
  }

  // Método para enviar notificação de consulta finalizada
  notifyConsultationFinished(consultationId: string) {
    this.server.to(consultationId).emit('consultationFinished', {
      consultationId,
      message: 'A consulta foi finalizada.',
    });
  }

  // WebRTC Signaling
  @SubscribeMessage('webrtc-offer')
  handleWebRTCOffer(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { consultationId: string; offer: any; userId: string },
  ) {
    console.log('📤 WebRTC Offer recebida de:', payload.userId);
    
    // Broadcast offer para outros usuários na sala
    client.to(payload.consultationId).emit('webrtc-offer', {
      offer: payload.offer,
      userId: payload.userId,
    });
    
    console.log('📡 Offer enviada para sala:', payload.consultationId);
    return { success: true };
  }

  @SubscribeMessage('webrtc-answer')
  handleWebRTCAnswer(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { consultationId: string; answer: any; userId: string },
  ) {
    console.log('📤 WebRTC Answer recebida de:', payload.userId);
    
    // Broadcast answer para outros usuários na sala
    client.to(payload.consultationId).emit('webrtc-answer', {
      answer: payload.answer,
      userId: payload.userId,
    });
    
    console.log('📡 Answer enviada para sala:', payload.consultationId);
    return { success: true };
  }

  @SubscribeMessage('webrtc-ice-candidate')
  handleWebRTCIceCandidate(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { consultationId: string; candidate: any; userId: string },
  ) {
    console.log('🧊 ICE Candidate recebido de:', payload.userId);
    
    // Broadcast ICE candidate para outros usuários na sala
    client.to(payload.consultationId).emit('webrtc-ice-candidate', {
      candidate: payload.candidate,
      userId: payload.userId,
    });
    
    return { success: true };
  }
}

