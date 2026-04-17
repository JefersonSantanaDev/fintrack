import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class LogoutDto {
  @ApiProperty({
    description: 'Refresh token da sessao que sera invalidada.',
    minLength: 16,
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.refresh-token-payload.signature',
  })
  @IsString()
  @MinLength(16)
  refreshToken!: string;
}
