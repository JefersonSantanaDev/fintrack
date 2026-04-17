import { ApiProperty } from '@nestjs/swagger';

export class PublicUserDto {
  @ApiProperty({
    description: 'Identificador unico do usuario.',
    example: 'clyf5q4ny0000mj08f3f1a2b3',
  })
  id!: string;

  @ApiProperty({
    description: 'Nome de exibicao do usuario.',
    example: 'Jeferson Santana',
  })
  name!: string;

  @ApiProperty({
    description: 'Email da conta.',
    format: 'email',
    example: 'jeferson@fintrack.app',
  })
  email!: string;
}

export class AuthResponseDto {
  @ApiProperty({
    description: 'Dados publicos do usuario autenticado.',
    type: PublicUserDto,
  })
  user!: PublicUserDto;

  @ApiProperty({
    description: 'JWT de acesso para endpoints protegidos.',
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.access-token-payload.signature',
  })
  accessToken!: string;

  @ApiProperty({
    description: 'JWT de refresh para renovar sessao.',
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.refresh-token-payload.signature',
  })
  refreshToken!: string;
}

export class MeResponseDto {
  @ApiProperty({
    description: 'Dados publicos da sessao atual.',
    type: PublicUserDto,
  })
  user!: PublicUserDto;
}

export class LogoutResponseDto {
  @ApiProperty({
    description: 'Indica que o logout foi processado com sucesso.',
    example: true,
  })
  success!: boolean;
}

export class ApiErrorResponseDto {
  @ApiProperty({
    description: 'Codigo HTTP retornado no erro.',
    example: 401,
  })
  statusCode!: number;

  @ApiProperty({
    description: 'Mensagem de erro da API.',
    example: 'Email ou senha invalidos.',
  })
  message!: string;

  @ApiProperty({
    description: 'Tipo de erro HTTP.',
    example: 'Unauthorized',
  })
  error!: string;
}
