import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/infrastructure/database/prisma.service';
import { RedisService } from '@/infrastructure/external-services/redis.service';
import { UserRole } from '@/shared/types';
import { generateUUID } from '@/shared/utils';

@Injectable()
export class VideoService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly redisService: RedisService,
  ) {}

  async createRoom(consultationId: string, user: any) {
    // Verify consultation exists and user has access
    const consultation = await this.prismaService.consultation.findUnique({
      where: { id: consultationId },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            cpf: true,
          },
        },
        professional: {
          select: {
            id: true,
            name: true,
            specialties: true,
          },
        },
      },
    });

    if (!consultation) {
      throw new NotFoundException('Consultação não encontrada');
    }

    // Check if user can access this consultation
    if (!this.canAccessConsultation(consultation, user)) {
      throw new ForbiddenException('Acesso negado à consulta');
    }

    // Check if consultation is in progress
    if (consultation.status !== 'em_atendimento') {
      throw new BadRequestException('Consultação não está em andamento');
    }

    // Check if room already exists
    const existingRoom = await this.prismaService.videoCallRoom.findUnique({
      where: { consultationId },
    });

    if (existingRoom) {
      return existingRoom;
    }

    // Create new room
    const roomId = generateUUID();
    const room = await this.prismaService.videoCallRoom.create({
      data: {
        id: generateUUID(),
        consultationId,
        roomId,
        expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours
      },
    });

    // Update consultation with room ID
    await this.prismaService.consultation.update({
      where: { id: consultationId },
      data: { roomId },
    });

    // Store room in Redis for quick access
    await this.redisService.createVideoRoom(roomId, consultationId, 7200);

    // Create audit log
    await this.prismaService.createAuditLog({
      userId: user.id,
      action: 'create_video_room',
      entityType: 'VideoCallRoom',
      entityId: room.id,
      newData: {
        consultationId,
        roomId,
        expiresAt: room.expiresAt,
      },
    });

    return {
      ...room,
      consultation,
    };
  }

  async getRoom(roomId: string, user: any) {
    const room = await this.prismaService.videoCallRoom.findUnique({
      where: { roomId },
      include: {
        consultation: {
          include: {
            patient: {
              select: {
                id: true,
                name: true,
                cpf: true,
              },
            },
            professional: {
              select: {
                id: true,
                name: true,
                specialties: true,
              },
            },
          },
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                role: true,
              },
            },
          },
        },
      },
    });

    if (!room) {
      throw new NotFoundException('Sala não encontrada');
    }

    // Check if user can access this room
    if (!this.canAccessConsultation(room.consultation, user)) {
      throw new ForbiddenException('Acesso negado à sala');
    }

    // Check if room is expired
    if (room.expiresAt < new Date()) {
      throw new BadRequestException('Sala expirada');
    }

    return room;
  }

  async joinRoom(roomId: string, socketId: string, user: any) {
    const room = await this.prismaService.videoCallRoom.findUnique({
      where: { roomId },
      include: {
        consultation: true,
        participants: true,
      },
    });

    if (!room) {
      throw new NotFoundException('Sala não encontrada');
    }

    // Check if user can access this room
    if (!this.canAccessConsultation(room.consultation, user)) {
      throw new ForbiddenException('Acesso negado à sala');
    }

    // Check if room is expired
    if (room.expiresAt < new Date()) {
      throw new BadRequestException('Sala expirada');
    }

    // Check if user is already in the room
    const existingParticipant = room.participants.find(p => p.userId === user.id);
    
    if (existingParticipant) {
      // Update socket ID
      await this.prismaService.videoCallParticipant.update({
        where: { id: existingParticipant.id },
        data: {
          socketId,
          leftAt: null,
        },
      });
    } else {
      // Check room capacity
      if (room.participants.length >= 2) {
        throw new BadRequestException('Sala cheia');
      }

      // Add new participant
      await this.prismaService.videoCallParticipant.create({
        data: {
          id: generateUUID(),
          roomId: room.id,
          userId: user.id,
          socketId,
        },
      });
    }

    // Create audit log
    await this.prismaService.createAuditLog({
      userId: user.id,
      action: 'join_video_room',
      entityType: 'VideoCallRoom',
      entityId: room.id,
      newData: {
        roomId,
        socketId,
      },
    });

    return { message: 'Entrou na sala com sucesso' };
  }

  async leaveRoom(roomId: string, user: any) {
    const room = await this.prismaService.videoCallRoom.findUnique({
      where: { roomId },
    });

    if (!room) {
      throw new NotFoundException('Sala não encontrada');
    }

    const participant = await this.prismaService.videoCallParticipant.findFirst({
      where: {
        roomId: room.id,
        userId: user.id,
      },
    });

    if (participant) {
      await this.prismaService.videoCallParticipant.update({
        where: { id: participant.id },
        data: { leftAt: new Date() },
      });
    }

    // Create audit log
    await this.prismaService.createAuditLog({
      userId: user.id,
      action: 'leave_video_room',
      entityType: 'VideoCallRoom',
      entityId: room.id,
      newData: {
        roomId,
        leftAt: new Date(),
      },
    });

    return { message: 'Saiu da sala com sucesso' };
  }

  async getActiveRooms(user: any) {
    let where: any = {
      isActive: true,
      expiresAt: {
        gt: new Date(),
      },
    };

    // Filter by user's consultations
    if (user.role === UserRole.paciente) {
      where.consultation = {
        patientId: user.id,
      };
    } else if ([UserRole.dentista, UserRole.psicologo, UserRole.medico].includes(user.role)) {
      where.consultation = {
        professionalId: user.id,
      };
    }

    const rooms = await this.prismaService.videoCallRoom.findMany({
      where,
      include: {
        consultation: {
          include: {
            patient: {
              select: {
                id: true,
                name: true,
                cpf: true,
              },
            },
            professional: {
              select: {
                id: true,
                name: true,
                specialties: true,
              },
            },
          },
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                role: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return rooms;
  }

  private canAccessConsultation(consultation: any, user: any): boolean {
    // Patient can access their own consultations
    if (user.role === UserRole.paciente && consultation.patientId === user.id) {
      return true;
    }

    // Professional can access consultations they're assigned to
    if (consultation.professionalId === user.id) {
      return true;
    }

    // Admin can access all consultations
    if (user.role === UserRole.admin) {
      return true;
    }

    return false;
  }
}
