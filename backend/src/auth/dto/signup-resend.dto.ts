import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class SignUpResendDto {
  @ApiProperty({
    description: 'Email usado no inicio do cadastro.',
    format: 'email',
    example: 'jeferson@fintrack.app',
  })
  @IsEmail({}, { message: 'Email deve ser um email valido.' })
  email!: string;
}
