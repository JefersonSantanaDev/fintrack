import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class SignUpDto {
  @ApiProperty({
    description: 'Nome de exibicao do usuario.',
    minLength: 2,
    maxLength: 80,
    example: 'Jeferson Santana',
  })
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  name!: string;

  @ApiProperty({
    description: 'Email unico usado para autenticacao.',
    format: 'email',
    example: 'jeferson@fintrack.app',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    description: 'Senha em texto plano (sera hasheada no servidor).',
    minLength: 6,
    maxLength: 72,
    example: '123456',
  })
  @IsString()
  @MinLength(6)
  @MaxLength(72)
  password!: string;
}
