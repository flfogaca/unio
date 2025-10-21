import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';

export interface CreateChatMessageDto {
  consultationId: string;
  senderId: string;
  senderName: string;
  senderType: 'paciente' | 'profissional' | 'sistema';
  message: string;
}

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

  async createMessage(data: CreateChatMessageDto) {
    return this.prisma.chatMessage.create({
      data: {
        consultationId: data.consultationId,
        senderId: data.senderId,
        senderName: data.senderName,
        senderType: data.senderType,
        message: data.message,
      },
    });
  }

  async getMessages(consultationId: string, limit: number = 100) {
    return this.prisma.chatMessage.findMany({
      where: {
        consultationId,
      },
      orderBy: {
        createdAt: 'asc',
      },
      take: limit,
    });
  }

  async getMessagesSince(consultationId: string, since: Date) {
    return this.prisma.chatMessage.findMany({
      where: {
        consultationId,
        createdAt: {
          gt: since,
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }
}
