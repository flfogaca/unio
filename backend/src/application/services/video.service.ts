import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/infrastructure/database/prisma.service';
import { UserRole } from '@/shared/types';

@Injectable()
export class VideoService {
  private readonly logger = new Logger(VideoService.name);

  constructor(private readonly prismaService: PrismaService) {}

  async createRoom(consultationId: string) {
    const roomId = this.generateRoomId();

    const room = await this.prismaService.videoCallRoom.create({
      data: {
        roomId,
        consultationId,
        expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours
      },
    });

    this.logger.log(
      `Created video room ${roomId} for consultation ${consultationId}`
    );
    return room;
  }

  async getRoom(roomId: string) {
    const room = await this.prismaService.videoCallRoom.findUnique({
      where: { roomId },
      include: {
        participants: true,
      },
    });

    if (!room) {
      throw new NotFoundException('Sala de vídeo não encontrada');
    }

    return room;
  }

  async addParticipant(roomId: string, userId: string, socketId: string) {
    const room = await this.prismaService.videoCallRoom.findUnique({
      where: { roomId },
      include: {
        participants: true,
      },
    });

    if (!room) {
      throw new NotFoundException('Sala de vídeo não encontrada');
    }

    // Check if participant already exists
    const existingParticipant = room.participants.find(
      p => p.userId === userId
    );
    if (existingParticipant) {
      return this.prismaService.videoCallParticipant.update({
        where: { id: existingParticipant.id },
        data: { socketId },
      });
    }

    // Check room capacity (max 2 participants)
    if (room.participants.length >= 2) {
      throw new Error('Sala de vídeo está lotada');
    }

    return this.prismaService.videoCallParticipant.create({
      data: {
        roomId: room.id,
        userId,
        socketId,
        joinedAt: new Date(),
      },
    });
  }

  async removeParticipant(roomId: string, userId: string) {
    const room = await this.prismaService.videoCallRoom.findUnique({
      where: { roomId },
    });

    if (!room) {
      throw new NotFoundException('Sala de vídeo não encontrada');
    }

    return this.prismaService.videoCallParticipant.deleteMany({
      where: {
        roomId: room.id,
        userId,
      },
    });
  }

  async getRoomParticipants(roomId: string) {
    const room = await this.prismaService.videoCallRoom.findUnique({
      where: { roomId },
      include: {
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
      throw new NotFoundException('Sala de vídeo não encontrada');
    }

    return room.participants;
  }

  async canAccessRoom(roomId: string, user: any): Promise<boolean> {
    const room = await this.prismaService.videoCallRoom.findUnique({
      where: { roomId },
    });

    if (!room) {
      return false;
    }

    // Get consultation to check access
    const consultation = await this.prismaService.consultation.findUnique({
      where: { id: room.consultationId },
    });

    if (!consultation) {
      return false;
    }

    return this.canAccessConsultation(consultation, user);
  }

  private canAccessConsultation(consultation: any, user: any): boolean {
    // Admin can access all consultations
    if (user.role === UserRole.admin) {
      return true;
    }

    // Patient can access their own consultations
    if (user.role === UserRole.paciente && consultation.patientId === user.id) {
      return true;
    }

    // Professionals can access consultations they're assigned to
    if (
      [UserRole.dentista, UserRole.psicologo, UserRole.medico].includes(
        user.role
      )
    ) {
      return consultation.professionalId === user.id;
    }

    return false;
  }

  async cleanupExpiredRooms() {
    const expiredRooms = await this.prismaService.videoCallRoom.findMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    for (const room of expiredRooms) {
      await this.prismaService.videoCallRoom.delete({
        where: { id: room.id },
      });
      this.logger.log(`Cleaned up expired video room ${room.roomId}`);
    }

    return expiredRooms.length;
  }

  async joinRoom(roomId: string, socketId: string, user: any) {
    return this.joinRoom(roomId, user.id, socketId);
  }

  async leaveRoom(roomId: string, user: any) {
    // Find participant by user ID and update leftAt
    const participant = await this.prismaService.videoCallParticipant.findFirst(
      {
        where: {
          roomId,
          userId: user.id,
        },
      }
    );

    if (participant) {
      await this.prismaService.videoCallParticipant.update({
        where: { id: participant.id },
        data: { leftAt: new Date() },
      });
    }

    return { message: 'Left room successfully' };
  }

  async getActiveRooms(user: any) {
    const rooms = await this.prismaService.videoCallRoom.findMany({
      where: {
        isActive: true,
        participants: {
          some: {
            userId: user.id,
            leftAt: null,
          },
        },
      },
      include: {
        participants: true,
      },
    });

    return rooms;
  }

  private generateRoomId(): string {
    return `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
