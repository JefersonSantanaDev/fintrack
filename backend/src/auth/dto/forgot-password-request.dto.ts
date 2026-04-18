import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class ForgotPasswordRequestDto {
  @ApiProperty({
    description: 'Email da conta para recuperacao de senha.',
    format: 'email',
    example: 'jeferson@fintrack.app',
  })
  @IsEmail({}, { message: 'Email deve ser um email valido.' })
  email!: string;
}
