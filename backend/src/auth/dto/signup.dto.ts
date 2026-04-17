import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class SignUpDto {
  @ApiProperty({
    description: 'Nome de exibicao do usuario.',
    minLength: 2,
    maxLength: 80,
    example: 'Jeferson Santana',
  })
  @IsString({ message: 'Nome deve ser um texto valido.' })
  @MinLength(2, { message: 'Nome deve ter no minimo 2 caracteres.' })
  @MaxLength(80, { message: 'Nome deve ter no maximo 80 caracteres.' })
  name!: string;

  @ApiProperty({
    description: 'Email unico usado para autenticacao.',
    format: 'email',
    example: 'jeferson@fintrack.app',
  })
  @IsEmail({}, { message: 'Email deve ser um email valido.' })
  email!: string;

  @ApiProperty({
    description: 'Senha em texto plano (sera hasheada no servidor).',
    minLength: 6,
    maxLength: 72,
    example: '123456',
  })
  @IsString({ message: 'Senha deve ser um texto valido.' })
  @MinLength(6, { message: 'Senha deve ter no minimo 6 caracteres.' })
  @MaxLength(72, { message: 'Senha deve ter no maximo 72 caracteres.' })
  password!: string;
}
