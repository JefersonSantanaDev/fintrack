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
}

export class SignUpChallengeResponseDto {
  @ApiProperty({
    description: 'Indica processamento bem sucedido da etapa.',
    example: true,
  })
  success!: boolean;

  @ApiProperty({
    description: 'Mensagem de retorno para o frontend.',
    example: 'Enviamos um codigo de verificacao para seu email.',
  })
  message!: string;

  @ApiProperty({
    description: 'Email alvo da verificacao.',
    format: 'email',
    example: 'jeferson@fintrack.app',
  })
  email!: string;

  @ApiProperty({
    description: 'Tempo de expiracao do codigo atual em segundos.',
    example: 600,
  })
  expiresInSeconds!: number;

  @ApiProperty({
    description: 'Tempo restante (segundos) para permitir novo reenvio.',
    example: 60,
  })
  resendAvailableInSeconds!: number;
}

export class ActionResponseDto {
  @ApiProperty({
    description: 'Indica processamento bem sucedido da operacao.',
    example: true,
  })
  success!: boolean;

  @ApiProperty({
    description: 'Mensagem de retorno para o frontend.',
    example: 'Se o email estiver cadastrado, enviaremos as instrucoes de recuperacao.',
  })
  message!: string;
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
    example: 'Mensagem de erro.',
  })
  message!: string;

  @ApiProperty({
    description: 'Tipo de erro HTTP.',
    example: 'Nao autorizado',
  })
  error!: string;

  @ApiProperty({
    description: 'Data e hora ISO do erro.',
    format: 'date-time',
    example: '2026-04-17T03:40:12.000Z',
  })
  timestamp!: string;

  @ApiProperty({
    description: 'Rota que originou o erro.',
    example: '/api/auth/login',
  })
  path!: string;
}

export class ApiValidationErrorResponseDto {
  @ApiProperty({
    description: 'Codigo HTTP retornado no erro.',
    example: 400,
  })
  statusCode!: number;

  @ApiProperty({
    description: 'Lista de erros de validacao do payload.',
    type: [String],
    example: ['Email deve ser um email valido.', 'Senha deve ter no minimo 6 caracteres.'],
  })
  message!: string[];

  @ApiProperty({
    description: 'Tipo de erro HTTP.',
    example: 'Requisicao invalida',
  })
  error!: string;

  @ApiProperty({
    description: 'Data e hora ISO do erro.',
    format: 'date-time',
    example: '2026-04-17T03:40:12.000Z',
  })
  timestamp!: string;

  @ApiProperty({
    description: 'Rota que originou o erro.',
    example: '/api/auth/signup/start',
  })
  path!: string;
}
