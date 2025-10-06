import { IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsString()
  cpf: string;

  @IsString()
  @MinLength(6)
  password: string;
}