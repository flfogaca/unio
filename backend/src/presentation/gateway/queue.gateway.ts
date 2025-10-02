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
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '@/infrastructure/database/prisma.service';
import { RedisService } from '@/infrastructure/external-services/redis.service';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: string;
  specialty?: string;
}

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
  },
  namespace: '/queue',
})
export class QueueGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly prismaService: PrismaService,
    private readonly redisService: RedisService,
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      // Extract token from handshake
      const token = client.handshake.auth?.token || client.handshake.headers?.authorization?.replace('Bearer ', '');
      
      if (!token) {
        client.disconnect();
        return;
      }

      // Verify JWT token
      const payload = this.jwtService.verify(token);
      client.userId = payload.sub;
      client.userRole = payload.role;

      // Set user as online
      await this.redisService.setUserOnline(client.userId);

      console.log(`User ${client.userId} connected to queue gateway`);
    } catch (error) {
      console.error('Authentication failed:', error);
      client.disconnect();
    }
  }

  async handleDisconnect(client: AuthenticatedSocket) {
    if (client.userId) {
      // Leave specialty room if joined
      if (client.specialty) {
        await this.handleLeaveSpecialtyQueue(client, { specialty: client.specialty });
      }

      // Set user as offline
      await this.redisService.setUserOffline(client.userId);
      console.log(`User ${client.userId} disconnected from queue gateway`);
    }
  }

  @SubscribeMessage('join-specialty-queue')
  async handleJoinSpecialtyQueue(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { specialty: string },
  ) {
    try {
      const { specialty } = data;

      // Leave previous specialty room if any
      if (client.specialty) {
        await this.handleLeaveSpecialtyQueue(client, { specialty: client.specialty });
      }

      // Join specialty room
      await client.join(`specialty:${specialty}`);
      client.specialty = specialty;

      // Get current queue status
      const queueStatus = await this.getQueueStatus(specialty);
      
      client.emit('queue-status', queueStatus);

      // Notify others about user joining queue
      client.to(`specialty:${specialty}`).emit('user-joined-queue', {
        userId: client.userId,
        userRole: client.userRole,
        specialty,
      });

    } catch (error) {
      console.error('Error joining specialty queue:', error);
      client.emit('error', { message: 'Failed to join queue' });
    }
  }

  @SubscribeMessage('leave-specialty-queue')
  async handleLeaveSpecialtyQueue(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { specialty: string },
  ) {
    try {
      const { specialty } = data;

      if (client.specialty === specialty) {
        await client.leave(`specialty:${specialty}`);
        
        // Notify others about user leaving queue
        client.to(`specialty:${specialty}`).emit('user-left-queue', {
          userId: client.userId,
          userRole: client.userRole,
          specialty,
        });

        client.specialty = undefined;
      }
    } catch (error) {
      console.error('Error leaving specialty queue:', error);
    }
  }

  @SubscribeMessage('assume-consultation')
  async handleAssumeConsultation(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { consultationId: string },
  ) {
    try {
      const { consultationId } = data;

      // Verify user is a professional
      if (!['dentista', 'psicologo', 'medico'].includes(client.userRole!)) {
        client.emit('error', { message: 'Only professionals can assume consultations' });
        return;
      }

      // Get consultation details
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

      // Check if consultation can be assumed
      if (consultation.status !== 'em_fila') {
        client.emit('error', { message: 'Consultation not available' });
        return;
      }

      // Check specialty match
      const specialtyMapping = {
        'psicologo': 'psicologo',
        'dentista': 'dentista',
        'medico': 'medico_clinico',
      };

      if (consultation.specialty !== specialtyMapping[client.userRole!]) {
        client.emit('error', { message: 'Specialty mismatch' });
        return;
      }

      // Update consultation
      const updatedConsultation = await this.prismaService.consultation.update({
        where: { id: consultationId },
        data: {
          professionalId: client.userId,
          status: 'em_atendimento',
          startedAt: new Date(),
        },
        include: {
          patient: true,
        },
      });

      // Update queue positions
      await this.prismaService.updateQueuePositions(consultation.specialty);

      // Get updated queue status
      const queueStatus = await this.getQueueStatus(consultation.specialty);

      // Broadcast to specialty room
      this.server.to(`specialty:${consultation.specialty}`).emit('consultation-assumed', {
        consultationId,
        professionalId: client.userId,
        consultation: updatedConsultation,
        queueStatus,
      });

      // Notify patient specifically
      this.server.to(`user:${consultation.patientId}`).emit('consultation-started', {
        consultationId,
        professionalId: client.userId,
        consultation: updatedConsultation,
      });

      client.emit('consultation-assumed-success', updatedConsultation);

    } catch (error) {
      console.error('Error assuming consultation:', error);
      client.emit('error', { message: 'Failed to assume consultation' });
    }
  }

  @SubscribeMessage('finish-consultation')
  async handleFinishConsultation(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { consultationId: string; notes?: string },
  ) {
    try {
      const { consultationId, notes } = data;

      // Get consultation details
      const consultation = await this.prismaService.consultation.findUnique({
        where: { id: consultationId },
      });

      if (!consultation || consultation.professionalId !== client.userId) {
        client.emit('error', { message: 'Consultation not found or access denied' });
        return;
      }

      if (consultation.status !== 'em_atendimento') {
        client.emit('error', { message: 'Consultation not in progress' });
        return;
      }

      // Update consultation
      const updatedConsultation = await this.prismaService.consultation.update({
        where: { id: consultationId },
        data: {
          status: 'finalizado',
          finishedAt: new Date(),
          notes,
        },
        include: {
          patient: true,
          professional: true,
        },
      });

      // Update queue statistics
      await this.updateQueueStatistics(consultation.specialty);

      // Get updated queue status
      const queueStatus = await this.getQueueStatus(consultation.specialty);

      // Broadcast to specialty room
      this.server.to(`specialty:${consultation.specialty}`).emit('consultation-finished', {
        consultationId,
        queueStatus,
      });

      // Notify patient
      this.server.to(`user:${consultation.patientId}`).emit('consultation-finished', {
        consultationId,
        consultation: updatedConsultation,
      });

      client.emit('consultation-finished-success', updatedConsultation);

    } catch (error) {
      console.error('Error finishing consultation:', error);
      client.emit('error', { message: 'Failed to finish consultation' });
    }
  }

  @SubscribeMessage('request-queue-update')
  async handleRequestQueueUpdate(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { specialty: string },
  ) {
    try {
      const { specialty } = data;
      const queueStatus = await this.getQueueStatus(specialty);
      client.emit('queue-status', queueStatus);
    } catch (error) {
      console.error('Error getting queue update:', error);
      client.emit('error', { message: 'Failed to get queue update' });
    }
  }

  @SubscribeMessage('join-user-room')
  async handleJoinUserRoom(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { userId: string },
  ) {
    try {
      const { userId } = data;

      // Verify user can access this room (own room or admin)
      if (client.userId !== userId && client.userRole !== 'admin') {
        client.emit('error', { message: 'Access denied' });
        return;
      }

      await client.join(`user:${userId}`);
      client.emit('joined-user-room', { userId });
    } catch (error) {
      console.error('Error joining user room:', error);
      client.emit('error', { message: 'Failed to join user room' });
    }
  }

  @SubscribeMessage('leave-user-room')
  async handleLeaveUserRoom(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { userId: string },
  ) {
    try {
      const { userId } = data;
      await client.leave(`user:${userId}`);
    } catch (error) {
      console.error('Error leaving user room:', error);
    }
  }

  // Method to broadcast queue updates (called by other services)
  async broadcastQueueUpdate(specialty: string) {
    const queueStatus = await this.getQueueStatus(specialty);
    this.server.to(`specialty:${specialty}`).emit('queue-updated', queueStatus);
  }

  // Method to notify specific user
  async notifyUser(userId: string, event: string, data: any) {
    this.server.to(`user:${userId}`).emit(event, data);
  }

  private async getQueueStatus(specialty: string) {
    const consultations = await this.prismaService.findActiveConsultationsBySpecialty(specialty);
    
    const queueLength = consultations.filter(c => c.status === 'em_fila').length;
    const inProgress = consultations.filter(c => c.status === 'em_atendimento').length;
    
    const onlineProfessionals = await this.prismaService.user.count({
      where: {
        role: this.getRoleForSpecialty(specialty),
        isOnline: true,
        isActive: true,
      },
    });

    return {
      specialty,
      queueLength,
      inProgress,
      onlineProfessionals,
      consultations,
      lastUpdated: new Date().toISOString(),
    };
  }

  private async updateQueueStatistics(specialty: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const queueLength = await this.prismaService.consultation.count({
      where: {
        specialty: specialty as any,
        status: 'em_fila',
      },
    });

    const inProgress = await this.prismaService.consultation.count({
      where: {
        specialty: specialty as any,
        status: 'em_atendimento',
      },
    });

    const completed = await this.prismaService.consultation.count({
      where: {
        specialty: specialty as any,
        status: 'finalizado',
        finishedAt: {
          gte: today,
        },
      },
    });

    await this.prismaService.queueStatistics.upsert({
      where: {
        specialty_date: {
          specialty: specialty as any,
          date: today,
        },
      },
      update: {
        totalInQueue: queueLength,
        totalInProgress: inProgress,
        totalFinished: completed,
      },
      create: {
        id: this.generateUUID(),
        specialty: specialty as any,
        date: today,
        totalInQueue: queueLength,
        totalInProgress: inProgress,
        totalFinished: completed,
        averageWaitTime: 0,
        averageDuration: 0,
      },
    });
  }

  private getRoleForSpecialty(specialty: string): string {
    const mapping = {
      'psicologo': 'psicologo',
      'dentista': 'dentista',
      'medico_clinico': 'medico',
    };
    return mapping[specialty] || specialty;
  }

  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}
