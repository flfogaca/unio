import { BaseEntity, ConsultationStatus, ConsultationPriority, UserRole } from '@/shared/types';

export class Consultation extends BaseEntity {
  constructor(
    public readonly id: string,
    public readonly patientId: string,
    public readonly specialty: string,
    public readonly description: string,
    public readonly status: ConsultationStatus = 'em-fila',
    public readonly priority: ConsultationPriority = 'media',
    public readonly position: number = 1,
    public readonly estimatedWaitTime: number = 0,
    public readonly professionalId?: string,
    public readonly scheduledAt?: Date,
    public readonly startedAt?: Date,
    public readonly finishedAt?: Date,
    public readonly notes?: string,
    public readonly attachments?: string[],
    public readonly roomId?: string,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date(),
  ) {
    super();
  }

  // Business rules
  public isInQueue(): boolean {
    return this.status === 'em-fila';
  }

  public isInProgress(): boolean {
    return this.status === 'em-atendimento';
  }

  public isFinished(): boolean {
    return this.status === 'finalizado';
  }

  public isCancelled(): boolean {
    return this.status === 'cancelado';
  }

  public isUrgent(): boolean {
    return this.priority === 'urgente';
  }

  public isHighPriority(): boolean {
    return this.priority === 'alta' || this.priority === 'urgente';
  }

  public canBeAssumedBy(professionalRole: UserRole): boolean {
    if (this.isFinished() || this.isCancelled()) return false;
    if (this.isInProgress() && this.professionalId) return false;

    // Verificar se o profissional pode atender esta especialidade
    const specialtyMapping = {
      'psicologo': 'psicologo',
      'dentista': 'dentista',
      'medico': 'medico-clinico',
    };

    return specialtyMapping[professionalRole] === this.specialty;
  }

  public assume(professionalId: string): Consultation {
    if (!this.canBeAssumedBy('psicologo' as UserRole)) { // This should be dynamic
      throw new Error('Esta consulta não pode ser assumida');
    }

    return new Consultation(
      this.id,
      this.patientId,
      this.specialty,
      this.description,
      'em-atendimento',
      this.priority,
      this.position,
      this.estimatedWaitTime,
      professionalId,
      this.scheduledAt,
      new Date(), // startedAt
      this.finishedAt,
      this.notes,
      this.attachments,
      this.roomId,
      this.createdAt,
      new Date(), // updatedAt
    );
  }

  public finish(notes?: string): Consultation {
    if (!this.isInProgress()) {
      throw new Error('Apenas consultas em andamento podem ser finalizadas');
    }

    return new Consultation(
      this.id,
      this.patientId,
      this.specialty,
      this.description,
      'finalizado',
      this.priority,
      this.position,
      this.estimatedWaitTime,
      this.professionalId,
      this.scheduledAt,
      this.startedAt,
      new Date(), // finishedAt
      notes || this.notes,
      this.attachments,
      this.roomId,
      this.createdAt,
      new Date(), // updatedAt
    );
  }

  public cancel(reason?: string): Consultation {
    if (this.isFinished()) {
      throw new Error('Consultas finalizadas não podem ser canceladas');
    }

    return new Consultation(
      this.id,
      this.patientId,
      this.specialty,
      this.description,
      'cancelado',
      this.priority,
      this.position,
      this.estimatedWaitTime,
      this.professionalId,
      this.scheduledAt,
      this.startedAt,
      this.finishedAt,
      reason || this.notes,
      this.attachments,
      this.roomId,
      this.createdAt,
      new Date(), // updatedAt
    );
  }

  public updatePosition(newPosition: number, newWaitTime: number): Consultation {
    if (!this.isInQueue()) {
      throw new Error('Apenas consultas na fila podem ter posição atualizada');
    }

    return new Consultation(
      this.id,
      this.patientId,
      this.specialty,
      this.description,
      this.status,
      this.priority,
      newPosition,
      newWaitTime,
      this.professionalId,
      this.scheduledAt,
      this.startedAt,
      this.finishedAt,
      this.notes,
      this.attachments,
      this.roomId,
      this.createdAt,
      new Date(), // updatedAt
    );
  }

  public getDuration(): number | null {
    if (!this.startedAt || !this.finishedAt) return null;
    return this.finishedAt.getTime() - this.startedAt.getTime();
  }

  public getWaitTime(): number | null {
    if (!this.createdAt || !this.startedAt) return null;
    return this.startedAt.getTime() - this.createdAt.getTime();
  }
}
