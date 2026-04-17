import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

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
    example: '123456',
  })
  @IsString({ message: 'Senha deve ser um texto valido.' })
  @MinLength(6, { message: 'Senha deve ter no minimo 6 caracteres.' })
  password!: string;
}
