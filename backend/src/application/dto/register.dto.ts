import { IsEmail, IsString, MinLength, IsOptional, IsDateString } from 'class-validator';

export class RegisterDto {
  @IsString()
  @MinLength(11)
  cpf: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @MinLength(2)
  name: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsDateString()
  birthDate?: string;
}