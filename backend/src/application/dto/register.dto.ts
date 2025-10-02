import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Length, IsEmail, IsOptional, IsEnum, IsDateString, IsArray } from 'class-validator';
import { UserRole, Specialty } from '@prisma/client';

export class RegisterDto {
  @ApiProperty({
    description: 'CPF do usuário (apenas números)',
    example: '12345678901',
    minLength: 11,
    maxLength: 11,
  })
  @IsString()
  @IsNotEmpty()
  @Length(11, 11, { message: 'CPF deve ter exatamente 11 dígitos' })
  cpf: string;

  @ApiProperty({
    description: 'Email do usuário',
    example: 'usuario@exemplo.com',
  })
  @IsEmail({}, { message: 'Email deve ter um formato válido' })
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Senha do usuário',
    example: 'minhasenha123',
    minLength: 6,
  })
  @IsString()
  @IsNotEmpty()
  @Length(6, 100, { message: 'Senha deve ter pelo menos 6 caracteres' })
  password: string;

  @ApiProperty({
    description: 'Nome completo do usuário',
    example: 'João Silva',
    minLength: 2,
  })
  @IsString()
  @IsNotEmpty()
  @Length(2, 100, { message: 'Nome deve ter entre 2 e 100 caracteres' })
  name: string;

  @ApiProperty({
    description: 'Papel do usuário no sistema',
    enum: UserRole,
    example: UserRole.paciente,
  })
  @IsEnum(UserRole, { message: 'Papel deve ser um dos valores válidos' })
  @IsNotEmpty()
  role: UserRole;

  @ApiProperty({
    description: 'Telefone do usuário (opcional)',
    example: '(11) 99999-9999',
    required: false,
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({
    description: 'Data de nascimento (opcional)',
    example: '1990-05-15',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  birthDate?: string;

  // Professional fields
  @ApiProperty({
    description: 'CRO do dentista (apenas para dentistas)',
    example: 'CRO-SP 12345',
    required: false,
  })
  @IsOptional()
  @IsString()
  cro?: string;

  @ApiProperty({
    description: 'Especialidades do profissional (apenas para profissionais)',
    enum: Specialty,
    isArray: true,
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsEnum(Specialty, { each: true })
  specialties?: Specialty[];
}
