import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({
    description: 'Refresh token atual para rotacao da sessao.',
    minLength: 16,
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.refresh-token-payload.signature',
  })
  @IsString()
  @MinLength(16)
  refreshToken!: string;
}
