import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/infrastructure/database/prisma.service';
import { RedisService } from '@/infrastructure/external-services/redis.service';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: string;
  roomId?: string;
}

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
  },
  namespace: '/video',
})
export class VideoGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
    private readonly redisService: RedisService
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      // Extract token from handshake
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.replace('Bearer ', '');

      if (!token) {
        client.disconnect();
        return;
      }

      // Verify JWT token
      const payload = this.jwtService.verify(token);
      client.userId = payload.sub;
      client.userRole = payload.role;

      // Set user as online in Redis
      await this.redisService.setUserOnline(client.userId);

      console.log(`User ${client.userId} connected to video gateway`);
    } catch (error) {
      console.error('Authentication failed:', error);
      client.disconnect();
    }
  }

  async handleDisconnect(client: AuthenticatedSocket) {
    if (client.userId) {
      // Leave all rooms
      if (client.roomId) {
        await this.handleLeaveRoom(client, { roomId: client.roomId });
      }

      // Set user as offline
      await this.redisService.setUserOffline(client.userId);
      console.log(`User ${client.userId} disconnected from video gateway`);
    }
  }

  @SubscribeMessage('join-room')
  async handleJoinRoom(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { roomId: string; consultationId: string }
  ) {
    try {
      const { roomId, consultationId } = data;

      // Verify consultation exists and user has access
      const consultation = await this.prismaService.consultation.findUnique({
        where: { id: consultationId },
        include: {
          patient: true,
          professional: true,
        },
      });

      if (!consultation) {
        client.emit('error', { message: 'Consultation not found' });
        return;
      }

      // Check if user can access this consultation
      if (
        !this.canAccessConsultation(
          consultation,
          client.userId!,
          client.userRole!
        )
      ) {
        client.emit('error', { message: 'Access denied' });
        return;
      }

      // Check if consultation is in progress
      if (consultation.status !== 'em_atendimento') {
        client.emit('error', { message: 'Consultation not in progress' });
        return;
      }

      // Verify room exists and is active
      const room = await this.prismaService.videoCallRoom.findUnique({
        where: { roomId },
      });

      if (!room || !room.isActive || room.expiresAt < new Date()) {
        client.emit('error', { message: 'Room not available' });
        return;
      }

      // Leave previous room if any
      if (client.roomId) {
        await this.handleLeaveRoom(client, { roomId: client.roomId });
      }

      // Join the room
      await client.join(roomId);
      client.roomId = roomId;

      // Get existing participants
      const participants =
        await this.prismaService.videoCallParticipant.findMany({
          where: {
            roomId: room.id,
            leftAt: null,
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                role: true,
              },
            },
          },
        });

      // Add/Update participant record
      const existingParticipant = participants.find(
        p => p.userId === client.userId
      );

      if (existingParticipant) {
        await this.prismaService.videoCallParticipant.update({
          where: { id: existingParticipant.id },
          data: {
            socketId: client.id,
            leftAt: null,
          },
        });
      } else {
        // Check room capacity
        if (participants.length >= 2) {
          client.emit('error', { message: 'Room is full' });
          return;
        }

        await this.prismaService.videoCallParticipant.create({
          data: {
            id: this.generateUUID(),
            roomId: room.id,
            userId: client.userId!,
            socketId: client.id,
          },
        });
      }

      // Notify room about new participant
      client.to(roomId).emit('user-joined', {
        userId: client.userId,
        userRole: client.userRole,
        socketId: client.id,
      });

      // Send current participants to the new user
      const updatedParticipants = await this.getRoomParticipants(roomId);
      client.emit('room-joined', {
        roomId,
        participants: updatedParticipants,
        consultation: {
          id: consultation.id,
          specialty: consultation.specialty,
          description: consultation.description,
          patient: consultation.patient,
          professional: consultation.professional,
        },
      });

      // Broadcast updated participant list to all room members
      this.server.to(roomId).emit('participants-updated', updatedParticipants);
    } catch (error) {
      console.error('Error joining room:', error);
      client.emit('error', { message: 'Failed to join room' });
    }
  }

  @SubscribeMessage('leave-room')
  async handleLeaveRoom(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { roomId: string }
  ) {
    try {
      const { roomId } = data;

      if (client.roomId === roomId) {
        await client.leave(roomId);

        // Update participant record
        const participant =
          await this.prismaService.videoCallParticipant.findFirst({
            where: {
              roomId: (
                await this.prismaService.videoCallRoom.findUnique({
                  where: { roomId },
                })
              )?.id,
              userId: client.userId,
              leftAt: null,
            },
          });

        if (participant) {
          await this.prismaService.videoCallParticipant.update({
            where: { id: participant.id },
            data: { leftAt: new Date() },
          });
        }

        // Notify room about user leaving
        client.to(roomId).emit('user-left', {
          userId: client.userId,
          socketId: client.id,
        });

        // Broadcast updated participant list
        const updatedParticipants = await this.getRoomParticipants(roomId);
        this.server
          .to(roomId)
          .emit('participants-updated', updatedParticipants);

        client.roomId = undefined;
      }
    } catch (error) {
      console.error('Error leaving room:', error);
    }
  }

  @SubscribeMessage('webrtc-offer')
  async handleWebRTCOffer(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody()
    data: {
      roomId: string;
      offer: RTCSessionDescriptionInit;
      targetUserId: string;
    }
  ) {
    const { roomId, offer, targetUserId } = data;

    if (client.roomId !== roomId) {
      return;
    }

    // Forward offer to target user
    this.server.to(roomId).emit('webrtc-offer', {
      from: client.userId,
      offer,
    });
  }

  @SubscribeMessage('webrtc-answer')
  async handleWebRTCAnswer(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody()
    data: {
      roomId: string;
      answer: RTCSessionDescriptionInit;
      targetUserId: string;
    }
  ) {
    const { roomId, answer, targetUserId } = data;

    if (client.roomId !== roomId) {
      return;
    }

    // Forward answer to target user
    this.server.to(roomId).emit('webrtc-answer', {
      from: client.userId,
      answer,
    });
  }

  @SubscribeMessage('webrtc-ice-candidate')
  async handleWebRTCIceCandidate(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody()
    data: {
      roomId: string;
      candidate: RTCIceCandidateInit;
      targetUserId: string;
    }
  ) {
    const { roomId, candidate, targetUserId } = data;

    if (client.roomId !== roomId) {
      return;
    }

    // Forward ICE candidate to target user
    this.server.to(roomId).emit('webrtc-ice-candidate', {
      from: client.userId,
      candidate,
    });
  }

  @SubscribeMessage('toggle-camera')
  async handleToggleCamera(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { roomId: string; enabled: boolean }
  ) {
    const { roomId, enabled } = data;

    if (client.roomId !== roomId) {
      return;
    }

    // Broadcast camera toggle to room
    this.server.to(roomId).emit('camera-toggled', {
      userId: client.userId,
      enabled,
    });
  }

  @SubscribeMessage('toggle-microphone')
  async handleToggleMicrophone(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { roomId: string; enabled: boolean }
  ) {
    const { roomId, enabled } = data;

    if (client.roomId !== roomId) {
      return;
    }

    // Broadcast microphone toggle to room
    this.server.to(roomId).emit('microphone-toggled', {
      userId: client.userId,
      enabled,
    });
  }

  @SubscribeMessage('send-message')
  async handleSendMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody()
    data: { roomId: string; message: string; type: 'text' | 'system' }
  ) {
    const { roomId, message, type } = data;

    if (client.roomId !== roomId) {
      return;
    }

    // Broadcast message to room
    this.server.to(roomId).emit('message-received', {
      from: client.userId,
      message,
      type,
      timestamp: new Date().toISOString(),
    });
  }

  @SubscribeMessage('heartbeat')
  async handleHeartbeat(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { roomId: string }
  ) {
    const { roomId } = data;

    if (client.roomId === roomId) {
      // Update last activity in Redis
      await this.redisService.set(
        `user:activity:${client.userId}`,
        Date.now().toString(),
        300
      );
    }
  }

  private async getRoomParticipants(roomId: string) {
    const room = await this.prismaService.videoCallRoom.findUnique({
      where: { roomId },
    });

    if (!room) return [];

    const participants = await this.prismaService.videoCallParticipant.findMany(
      {
        where: {
          roomId: room.id,
          leftAt: null,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              role: true,
            },
          },
        },
      }
    );

    return participants.map(p => ({
      userId: p.userId,
      userRole: p.user.role,
      socketId: p.socketId,
      name: p.user.name,
      joinedAt: p.joinedAt,
    }));
  }

  private canAccessConsultation(
    consultation: any,
    userId: string,
    userRole: string
  ): boolean {
    // Patient can access their own consultations
    if (userRole === 'paciente' && consultation.patientId === userId) {
      return true;
    }

    // Professional can access consultations they're assigned to
    if (consultation.professionalId === userId) {
      return true;
    }

    // Admin can access all consultations
    if (userRole === 'admin') {
      return true;
    }

    return false;
  }

  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
      /[xy]/g,
      function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }
    );
  }
}
