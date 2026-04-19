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

export class FamilySnapshotDto {
  @ApiProperty({
    description: 'Identificador unico da familia ativa da sessao.',
    example: '7f047e08-3abf-4dc0-a814-c87d46f4f66f',
  })
  id!: string;

  @ApiProperty({
    description: 'Nome de exibicao da familia.',
    example: 'Familia Santana',
  })
  name!: string;

  @ApiProperty({
    description: 'Quantidade total de membros nessa familia.',
    example: 1,
  })
  memberCount!: number;

  @ApiProperty({
    description: 'Papel do usuario autenticado na familia.',
    example: 'owner',
    enum: ['owner', 'admin', 'viewer'],
  })
  role!: 'owner' | 'admin' | 'viewer';
}

export class FamilyOnboardingStatusDto {
  @ApiProperty({
    description: 'Resumo da familia associada ao usuario logado.',
    type: FamilySnapshotDto,
    nullable: true,
  })
  family!: FamilySnapshotDto | null;

  @ApiProperty({
    description: 'Indica se o card de onboarding de convite familiar deve aparecer no dashboard.',
    example: true,
  })
  shouldShowOnboarding!: boolean;
}

export class FamilyOnboardingInvitationDto {
  @ApiProperty({
    description: 'Identificador unico do convite.',
    example: '1f2f0931-942c-49a7-9f5b-5f946610f16f',
  })
  id!: string;

  @ApiProperty({
    description: 'Nome da pessoa convidada.',
    example: 'Maria Santana',
  })
  name!: string;

  @ApiProperty({
    description: 'Email da pessoa convidada.',
    format: 'email',
    example: 'maria@exemplo.com',
  })
  email!: string;

  @ApiProperty({
    description: 'Status do convite.',
    enum: ['pending'],
    example: 'pending',
  })
  status!: 'pending';
}

export class FamilyOnboardingInviteMembersResponseDto {
  @ApiProperty({
    description: 'Indica processamento bem sucedido da operacao.',
    example: true,
  })
  success!: boolean;

  @ApiProperty({
    description: 'Mensagem de retorno para o frontend.',
    example: 'Convites preparados com sucesso.',
  })
  message!: string;

  @ApiProperty({
    description: 'Quantidade de convites criados/atualizados.',
    example: 2,
  })
  sentCount!: number;

  @ApiProperty({
    description: 'Quantidade de itens ignorados por duplicidade, auto-convite ou membro ja existente.',
    example: 1,
  })
  ignoredCount!: number;

  @ApiProperty({
    description: 'Lista final de convites preparados no onboarding.',
    type: [FamilyOnboardingInvitationDto],
  })
  invitations!: FamilyOnboardingInvitationDto[];
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
