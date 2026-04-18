import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Length, Matches } from 'class-validator';

export class SignUpVerifyDto {
  @ApiProperty({
    description: 'Email usado no inicio do cadastro.',
    format: 'email',
    example: 'jeferson@fintrack.app',
  })
  @IsEmail({}, { message: 'Email deve ser um email valido.' })
  email!: string;

  @ApiProperty({
    description: 'Codigo numerico de verificacao enviado por email.',
    example: '482931',
    minLength: 6,
    maxLength: 6,
  })
  @IsString({ message: 'Codigo deve ser um texto valido.' })
  @Length(6, 6, { message: 'Codigo deve ter 6 digitos.' })
  @Matches(/^\d{6}$/, { message: 'Codigo deve conter apenas numeros.' })
  code!: string;
}
