import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: 'Email da conta.',
    format: 'email',
    example: 'jeferson@fintrack.app',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    description: 'Senha da conta.',
    minLength: 6,
    example: '123456',
  })
  @IsString()
  @MinLength(6)
  password!: string;
}
