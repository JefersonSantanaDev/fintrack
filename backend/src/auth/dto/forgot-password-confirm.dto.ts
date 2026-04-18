import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches, MinLength } from 'class-validator';

export class ForgotPasswordConfirmDto {
  @ApiProperty({
    description: 'Token de recuperacao de senha recebido por email.',
    example: '6f34e9f9b81f24dc53e0918f92f4fe9ef19a4354c19ef12b5f8f6b6ce0f5c7ea',
    minLength: 40,
  })
  @IsString({ message: 'Token deve ser um texto valido.' })
  @MinLength(40, { message: 'Token invalido.' })
  @Matches(/^[a-fA-F0-9]+$/, { message: 'Token invalido.' })
  token!: string;

  @ApiProperty({
    description: 'Nova senha da conta.',
    minLength: 6,
    example: 'novaSenha@123',
  })
  @IsString({ message: 'Senha deve ser um texto valido.' })
  @MinLength(6, { message: 'Senha deve ter no minimo 6 caracteres.' })
  password!: string;
}
