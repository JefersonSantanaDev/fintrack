import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: 'Email da conta.',
    format: 'email',
    example: 'jeferson@fintrack.app',
  })
  @IsEmail({}, { message: 'Email deve ser um email valido.' })
  email!: string;

  @ApiProperty({
    description: 'Senha da conta.',
    minLength: 6,
    maxLength: 72,
    example: '123456',
  })
  @IsString({ message: 'Senha deve ser um texto valido.' })
  @MinLength(6, { message: 'Senha deve ter no minimo 6 caracteres.' })
  @MaxLength(72, { message: 'Senha deve ter no maximo 72 caracteres.' })
  password!: string;
}
