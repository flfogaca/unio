import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '@/infrastructure/database/prisma.service';
import { UserRole } from '@/shared/types';
import { normalizePaginationParams } from '@/shared/utils';

interface FindAllUsersParams {
  page?: number;
  limit?: number;
  role?: UserRole;
  search?: string;
}

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll(params: FindAllUsersParams) {
    const { page, limit, skip, sortBy, sortOrder } = normalizePaginationParams(params);
    
    const where: any = {};
    
    if (params.role) {
      where.role = params.role;
    }
    
    if (params.search) {
      where.OR = [
        { name: { contains: params.search, mode: 'insensitive' } },
        { email: { contains: params.search, mode: 'insensitive' } },
        { cpf: { contains: params.search } },
      ];
    }

    const [users, total] = await Promise.all([
      this.prismaService.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        select: {
          id: true,
          cpf: true,
          email: true,
          name: true,
          role: true,
          phone: true,
          birthDate: true,
          avatar: true,
          cro: true,
          specialties: true,
          isActive: true,
          isOnline: true,
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.prismaService.user.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: users,
      meta: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  async findById(id: string) {
    const user = await this.prismaService.user.findUnique({
      where: { id },
      select: {
        id: true,
        cpf: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        birthDate: true,
        avatar: true,
        cro: true,
        specialties: true,
        isActive: true,
        isOnline: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
        consultationsAsPatient: {
          where: { status: { in: ['em_fila', 'em_atendimento'] } },
          orderBy: { createdAt: 'asc' },
          select: {
            id: true,
            specialty: true,
            description: true,
            status: true,
            priority: true,
            position: true,
            estimatedWaitTime: true,
            createdAt: true,
          },
        },
        consultationsAsProfessional: {
          where: { status: { in: ['em_atendimento'] } },
          orderBy: { createdAt: 'asc' },
          select: {
            id: true,
            specialty: true,
            description: true,
            status: true,
            priority: true,
            patient: {
              select: {
                id: true,
                name: true,
                cpf: true,
                phone: true,
              },
            },
            createdAt: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return user;
  }

  async update(id: string, updateData: any) {
    const existingUser = await this.prismaService.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new NotFoundException('Usuário não encontrado');
    }

    // Remove sensitive fields that shouldn't be updated
    const { password, id: userId, createdAt, ...allowedUpdates } = updateData;

    const updatedUser = await this.prismaService.user.update({
      where: { id },
      data: {
        ...allowedUpdates,
        birthDate: updateData.birthDate ? new Date(updateData.birthDate) : undefined,
      },
      select: {
        id: true,
        cpf: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        birthDate: true,
        avatar: true,
        cro: true,
        specialties: true,
        isActive: true,
        isOnline: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Create audit log
    await this.prismaService.createAuditLog({
      userId: id,
      action: 'update',
      entityType: 'User',
      entityId: id,
      oldData: existingUser,
      newData: updatedUser,
    });

    return updatedUser;
  }

  async remove(id: string) {
    const existingUser = await this.prismaService.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new NotFoundException('Usuário não encontrado');
    }

    // Check if user has active consultations
    const activeConsultations = await this.prismaService.consultation.count({
      where: {
        OR: [
          { patientId: id, status: { in: ['em_fila', 'em_atendimento'] } },
          { professionalId: id, status: { in: ['em_atendimento'] } },
        ],
      },
    });

    if (activeConsultations > 0) {
      throw new ForbiddenException('Não é possível excluir usuário com consultas ativas');
    }

    await this.prismaService.user.delete({
      where: { id },
    });

    // Create audit log
    await this.prismaService.createAuditLog({
      action: 'delete',
      entityType: 'User',
      entityId: id,
      oldData: existingUser,
    });

    return { message: 'Usuário excluído com sucesso' };
  }

  async toggleActive(id: string, isActive: boolean) {
    const existingUser = await this.prismaService.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const updatedUser = await this.prismaService.user.update({
      where: { id },
      data: { isActive },
      select: {
        id: true,
        cpf: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        updatedAt: true,
      },
    });

    // Create audit log
    await this.prismaService.createAuditLog({
      action: 'toggle_active',
      entityType: 'User',
      entityId: id,
      oldData: { isActive: existingUser.isActive },
      newData: { isActive },
    });

    return updatedUser;
  }

  async getOnlineUsers() {
    const onlineUsers = await this.prismaService.user.findMany({
      where: {
        isOnline: true,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        role: true,
        specialties: true,
        lastLoginAt: true,
      },
      orderBy: { lastLoginAt: 'desc' },
    });

    return onlineUsers;
  }

  async getUserStatistics() {
    const [
      totalUsers,
      activeUsers,
      onlineUsers,
      usersByRole,
    ] = await Promise.all([
      this.prismaService.user.count(),
      this.prismaService.user.count({ where: { isActive: true } }),
      this.prismaService.user.count({ where: { isOnline: true, isActive: true } }),
      this.prismaService.user.groupBy({
        by: ['role'],
        _count: { role: true },
      }),
    ]);

    return {
      totalUsers,
      activeUsers,
      onlineUsers,
      usersByRole: usersByRole.map(item => ({
        role: item.role,
        count: item._count.role,
      })),
    };
  }
}
