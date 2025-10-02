import { BaseEntity, UserRole } from '@/shared/types';

export class User extends BaseEntity {
  constructor(
    public readonly id: string,
    public readonly cpf: string,
    public readonly email: string,
    public readonly name: string,
    public readonly role: UserRole,
    public readonly isActive: boolean = true,
    public readonly phone?: string,
    public readonly birthDate?: Date,
    public readonly avatar?: string,
    public readonly cro?: string, // Para dentistas
    public readonly specialties?: string[], // Para profissionais
    public readonly isOnline?: boolean,
    public readonly lastLoginAt?: Date,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date(),
  ) {
    super();
  }

  // Business rules
  public isPatient(): boolean {
    return this.role === 'paciente';
  }

  public isProfessional(): boolean {
    return ['dentista', 'psicologo', 'medico'].includes(this.role);
  }

  public isAdmin(): boolean {
    return this.role === 'admin';
  }

  public canAccessSpecialty(specialty: string): boolean {
    if (this.isAdmin()) return true;
    if (this.isPatient()) return true; // Pacientes podem acessar qualquer especialidade
    
    // Profissionais só podem acessar sua própria especialidade
    return this.specialties?.includes(specialty) || false;
  }

  public isAvailable(): boolean {
    return this.isActive && this.isOnline;
  }

  public getDisplayName(): string {
    return this.name;
  }

  public getMaskedCPF(): string {
    const cpf = this.cpf.replace(/\D/g, '');
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }
}
