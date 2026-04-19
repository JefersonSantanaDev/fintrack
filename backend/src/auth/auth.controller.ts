import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Req,
  Res,
  Post,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { CurrentUser } from './decorators/current-user.decorator';
import {
  ActionResponseDto,
  ApiErrorResponseDto,
  ApiValidationErrorResponseDto,
  AuthResponseDto,
  FamilyOnboardingInviteMembersResponseDto,
  FamilyOnboardingStatusDto,
  LogoutResponseDto,
  MeResponseDto,
  SignUpChallengeResponseDto,
} from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordConfirmDto } from './dto/forgot-password-confirm.dto';
import { ForgotPasswordRequestDto } from './dto/forgot-password-request.dto';
import { SignUpResendDto } from './dto/signup-resend.dto';
import { SignUpDto } from './dto/signup.dto';
import { SignUpVerifyDto } from './dto/signup-verify.dto';
import { FamilyOnboardingInviteMembersDto } from './dto/family-onboarding-invite.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthService } from './auth.service';
import type { AuthenticatedUser } from './types/auth-user.type';
import type { FastifyReply, FastifyRequest } from 'fastify';
import type { CookieSerializeOptions } from '@fastify/cookie';
import {
  apiErrorContent,
  apiValidationErrorContent,
  swaggerErrorExamples,
} from '../docs/swagger-error-examples';

const oneMinuteMs = 60_000;
const fiveMinutesMs = 5 * 60_000;

@ApiTags('Auth')
@ApiExtraModels(
  ApiErrorResponseDto,
  ApiValidationErrorResponseDto,
  SignUpChallengeResponseDto,
  ActionResponseDto,
  FamilyOnboardingStatusDto,
  FamilyOnboardingInviteMembersResponseDto,
)
@Controller('auth')
export class AuthController {
  private readonly refreshCookieName: string;
  private readonly refreshCookieOptions: CookieSerializeOptions;

  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {
    this.refreshCookieName = this.configService.get<string>(
      'AUTH_REFRESH_COOKIE_NAME',
      'fintrack_refresh_token',
    );

    const refreshCookieMaxAgeMs = this.parsePositiveNumber(
      this.configService.get<string>('AUTH_REFRESH_COOKIE_MAX_AGE_MS'),
      7 * 24 * 60 * 60 * 1000,
    );

    const refreshCookieSecure = this.parseBoolean(
      this.configService.get<string>('AUTH_REFRESH_COOKIE_SECURE'),
      false,
    );

    const refreshCookiePath = this.configService.get<string>(
      'AUTH_REFRESH_COOKIE_PATH',
      '/api/auth',
    );

    this.refreshCookieOptions = {
      httpOnly: true,
      secure: refreshCookieSecure,
      sameSite: this.parseSameSite(
        this.configService.get<string>('AUTH_REFRESH_COOKIE_SAME_SITE'),
      ),
      path: refreshCookiePath,
      maxAge: Math.ceil(refreshCookieMaxAgeMs / 1000),
    };
  }

  private parsePositiveNumber(input: string | undefined, fallback: number) {
    const parsed = Number(input);

    if (!Number.isFinite(parsed) || parsed <= 0) {
      return fallback;
    }

    return parsed;
  }

  private parseBoolean(input: string | undefined, fallback: boolean) {
    if (typeof input !== 'string') {
      return fallback;
    }

    const normalized = input.trim().toLowerCase();

    if (normalized === 'true') {
      return true;
    }

    if (normalized === 'false') {
      return false;
    }

    return fallback;
  }

  private parseSameSite(value: string | undefined): CookieSerializeOptions['sameSite'] {
    if (!value) {
      return 'lax';
    }

    const normalized = value.trim().toLowerCase();

    if (normalized === 'strict' || normalized === 'none' || normalized === 'lax') {
      return normalized;
    }

    return 'lax';
  }

  private setRefreshCookie(reply: FastifyReply, refreshToken: string) {
    reply.setCookie(
      this.refreshCookieName,
      refreshToken,
      this.refreshCookieOptions,
    );
  }

  private clearRefreshCookie(reply: FastifyReply) {
    reply.clearCookie(this.refreshCookieName, this.refreshCookieOptions);
  }

  private readRefreshTokenFromCookie(request: FastifyRequest) {
    const cookies = (request as FastifyRequest & { cookies?: Record<string, string> }).cookies;
    const refreshToken = cookies?.[this.refreshCookieName];

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token ausente ou invalido.');
    }

    return refreshToken;
  }

  private readRefreshTokenFromCookieIfPresent(request: FastifyRequest) {
    const cookies = (request as FastifyRequest & { cookies?: Record<string, string> }).cookies;
    return cookies?.[this.refreshCookieName] ?? null;
  }

  @Post('signup/start')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Iniciar cadastro',
    description:
      'Inicia o cadastro com envio de codigo de verificacao para o email informado.',
  })
  @ApiCreatedResponse({
    description: 'Codigo de verificacao enviado com sucesso.',
    type: SignUpChallengeResponseDto,
  })
  @ApiConflictResponse({
    description: 'Email ja cadastrado.',
    content: apiErrorContent({ emailEmUso: swaggerErrorExamples.emailEmUso }),
  })
  @ApiBadRequestResponse({
    description: 'Payload invalido.',
    content: apiValidationErrorContent({
      payloadInvalidoSignUp: swaggerErrorExamples.payloadInvalidoSignUp,
    }),
  })
  @ApiTooManyRequestsResponse({
    description: 'Aguarde para solicitar outro codigo.',
    content: apiErrorContent({ rateLimitSignUp: swaggerErrorExamples.rateLimitSignUp }),
  })
  @Throttle({ default: { limit: 3, ttl: oneMinuteMs, blockDuration: fiveMinutesMs } })
  async signUpStart(
    @Body() dto: SignUpDto,
  ): Promise<SignUpChallengeResponseDto> {
    return this.authService.startSignUp(dto);
  }

  @Post('signup/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verificar cadastro',
    description:
      'Valida codigo de verificacao de cadastro, cria conta e inicia sessao.',
  })
  @ApiOkResponse({
    description: 'Codigo validado e sessao iniciada com sucesso.',
    type: AuthResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Codigo invalido ou expirado.',
    content: apiErrorContent({
      codigoInvalido: swaggerErrorExamples.codigoInvalido,
      codigoExpirado: swaggerErrorExamples.codigoExpirado,
    }),
  })
  @ApiConflictResponse({
    description: 'Email ja cadastrado.',
    content: apiErrorContent({ emailEmUso: swaggerErrorExamples.emailEmUso }),
  })
  @ApiBadRequestResponse({
    description: 'Payload invalido.',
    content: apiValidationErrorContent({
      payloadInvalidoSignUpVerify: swaggerErrorExamples.payloadInvalidoSignUpVerify,
    }),
  })
  @ApiTooManyRequestsResponse({
    description:
      'Muitas tentativas de verificacao. Aguarde para tentar novamente.',
    content: apiErrorContent({
      rateLimitSignUpVerify: swaggerErrorExamples.rateLimitSignUpVerify,
    }),
  })
  @Throttle({ default: { limit: 8, ttl: oneMinuteMs, blockDuration: fiveMinutesMs } })
  async signUpVerify(
    @Body() dto: SignUpVerifyDto,
    @Res({ passthrough: true }) reply: FastifyReply,
  ): Promise<AuthResponseDto> {
    const response = await this.authService.verifySignUp(dto);
    this.setRefreshCookie(reply, response.refreshToken);
    return {
      user: response.user,
      accessToken: response.accessToken,
    };
  }

  @Post('signup/resend')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Reenviar codigo de cadastro',
    description: 'Reenvia um novo codigo para o email de cadastro pendente.',
  })
  @ApiOkResponse({
    description: 'Novo codigo enviado com sucesso.',
    type: SignUpChallengeResponseDto,
  })
  @ApiConflictResponse({
    description: 'Email ja cadastrado.',
    content: apiErrorContent({ emailEmUso: swaggerErrorExamples.emailEmUso }),
  })
  @ApiBadRequestResponse({
    description: 'Cadastro pendente nao encontrado ou payload invalido.',
    content: apiErrorContent({
      cadastroPendenteNaoEncontrado: swaggerErrorExamples.cadastroPendenteNaoEncontrado,
      payloadInvalidoSignUpResend: swaggerErrorExamples.payloadInvalidoSignUpResend,
    }),
  })
  @ApiTooManyRequestsResponse({
    description: 'Ainda nao e possivel solicitar novo codigo.',
    content: apiErrorContent({ rateLimitSignUp: swaggerErrorExamples.rateLimitSignUp }),
  })
  @Throttle({ default: { limit: 3, ttl: oneMinuteMs, blockDuration: fiveMinutesMs } })
  async signUpResend(@Body() dto: SignUpResendDto): Promise<SignUpChallengeResponseDto> {
    return this.authService.resendSignUpCode(dto);
  }

  @Post('forgot-password/request')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Solicitar recuperacao de senha',
    description:
      'Recebe email para recuperacao. Sempre retorna sucesso para evitar enumeracao de contas.',
  })
  @ApiOkResponse({
    description:
      'Solicitacao processada com sucesso (mensagem generica).',
    type: ActionResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Payload invalido.',
    content: apiValidationErrorContent({
      payloadInvalidoForgotPasswordRequest:
        swaggerErrorExamples.payloadInvalidoForgotPasswordRequest,
    }),
  })
  @ApiTooManyRequestsResponse({
    description: 'Muitas tentativas nessa rota. Aguarde e tente novamente.',
    content: apiErrorContent({
      rateLimitForgotPassword: swaggerErrorExamples.rateLimitForgotPassword,
    }),
  })
  @Throttle({ default: { limit: 3, ttl: oneMinuteMs, blockDuration: fiveMinutesMs } })
  async requestPasswordRecovery(
    @Body() dto: ForgotPasswordRequestDto,
  ): Promise<ActionResponseDto> {
    return this.authService.requestPasswordRecovery(dto);
  }

  @Post('forgot-password/confirm')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Confirmar recuperacao de senha',
    description:
      'Valida token recebido por email, redefine a senha e revoga sessoes ativas.',
  })
  @ApiOkResponse({
    description: 'Senha redefinida com sucesso.',
    type: ActionResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Payload invalido.',
    content: apiValidationErrorContent({
      payloadInvalidoForgotPasswordConfirm:
        swaggerErrorExamples.payloadInvalidoForgotPasswordConfirm,
    }),
  })
  @ApiUnauthorizedResponse({
    description: 'Token invalido ou expirado.',
    content: apiErrorContent({
      linkRecuperacaoInvalido: swaggerErrorExamples.linkRecuperacaoInvalido,
    }),
  })
  @ApiTooManyRequestsResponse({
    description: 'Muitas tentativas nessa rota. Aguarde e tente novamente.',
    content: apiErrorContent({
      rateLimitForgotPasswordConfirm:
        swaggerErrorExamples.rateLimitForgotPasswordConfirm,
    }),
  })
  @Throttle({ default: { limit: 8, ttl: oneMinuteMs, blockDuration: fiveMinutesMs } })
  async confirmPasswordRecovery(
    @Body() dto: ForgotPasswordConfirmDto,
  ): Promise<ActionResponseDto> {
    return this.authService.confirmPasswordRecovery(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Entrar',
    description: 'Autentica um usuario e retorna access token. O refresh token vai em cookie httpOnly.',
  })
  @ApiOkResponse({
    description: 'Login efetuado com sucesso.',
    type: AuthResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Credenciais invalidas.',
    content: apiErrorContent({
      credenciaisInvalidas: swaggerErrorExamples.credenciaisInvalidas,
    }),
  })
  @ApiBadRequestResponse({
    description: 'Payload invalido.',
    content: apiValidationErrorContent({
      payloadInvalidoLogin: swaggerErrorExamples.payloadInvalidoLogin,
    }),
  })
  @ApiTooManyRequestsResponse({
    description:
      'Muitas tentativas de login (rate limit ou bloqueio temporario por tentativas invalidas).',
    content: apiErrorContent({ rateLimitAuth: swaggerErrorExamples.rateLimitAuth }),
  })
  @Throttle({ default: { limit: 5, ttl: oneMinuteMs, blockDuration: fiveMinutesMs } })
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) reply: FastifyReply,
  ): Promise<AuthResponseDto> {
    const response = await this.authService.login(dto);
    this.setRefreshCookie(reply, response.refreshToken);
    return {
      user: response.user,
      accessToken: response.accessToken,
    };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Renovar sessao',
    description: 'Rotaciona o refresh token (cookie httpOnly) e devolve novo access token.',
  })
  @ApiOkResponse({
    description: 'Sessao renovada com sucesso.',
    type: AuthResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Refresh token invalido ou expirado.',
    content: apiErrorContent({ refreshInvalido: swaggerErrorExamples.refreshInvalido }),
  })
  @ApiTooManyRequestsResponse({
    description: 'Muitas tentativas nessa rota. Aguarde e tente novamente.',
    content: apiErrorContent({ rateLimitRota: swaggerErrorExamples.rateLimitRota }),
  })
  @Throttle({ default: { limit: 10, ttl: oneMinuteMs, blockDuration: oneMinuteMs } })
  async refresh(
    @Req() request: FastifyRequest,
    @Res({ passthrough: true }) reply: FastifyReply,
  ): Promise<AuthResponseDto> {
    const refreshToken = this.readRefreshTokenFromCookie(request);
    const response = await this.authService.refresh(refreshToken);
    this.setRefreshCookie(reply, response.refreshToken);
    return {
      user: response.user,
      accessToken: response.accessToken,
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Sair',
    description: 'Revoga a sessao vinculada ao refresh token salvo no cookie httpOnly.',
  })
  @ApiOkResponse({
    description: 'Logout processado com sucesso (idempotente).',
    type: LogoutResponseDto,
  })
  @ApiTooManyRequestsResponse({
    description: 'Muitas tentativas nessa rota. Aguarde e tente novamente.',
    content: apiErrorContent({ rateLimitRota: swaggerErrorExamples.rateLimitRota }),
  })
  @Throttle({ default: { limit: 20, ttl: oneMinuteMs, blockDuration: oneMinuteMs } })
  async logout(
    @Req() request: FastifyRequest,
    @Res({ passthrough: true }) reply: FastifyReply,
  ): Promise<LogoutResponseDto> {
    const refreshToken = this.readRefreshTokenFromCookieIfPresent(request);
    const response = await this.authService.logout(refreshToken ?? undefined);
    this.clearRefreshCookie(reply);
    return response;
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Perfil da sessao',
    description: 'Retorna dados do usuario autenticado no access token.',
  })
  @ApiOkResponse({
    description: 'Sessao valida e perfil retornado.',
    type: MeResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Access token invalido ou ausente.',
    content: apiErrorContent({
      accessTokenInvalido: swaggerErrorExamples.accessTokenInvalido,
    }),
  })
  @ApiTooManyRequestsResponse({
    description: 'Muitas tentativas nessa rota. Aguarde e tente novamente.',
    content: apiErrorContent({ rateLimitRota: swaggerErrorExamples.rateLimitRota }),
  })
  @Throttle({ default: { limit: 60, ttl: oneMinuteMs, blockDuration: oneMinuteMs } })
  me(@CurrentUser() user: AuthenticatedUser): Promise<MeResponseDto> {
    return this.authService.getProfile(user.userId);
  }

  @Get('onboarding/family')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Status de onboarding familiar',
    description:
      'Retorna estado atual do onboarding de convite de membros da familia no dashboard.',
  })
  @ApiOkResponse({
    description: 'Status do onboarding familiar carregado com sucesso.',
    type: FamilyOnboardingStatusDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Access token invalido ou ausente.',
    content: apiErrorContent({
      accessTokenInvalido: swaggerErrorExamples.accessTokenInvalido,
    }),
  })
  @ApiTooManyRequestsResponse({
    description: 'Muitas tentativas nessa rota. Aguarde e tente novamente.',
    content: apiErrorContent({ rateLimitRota: swaggerErrorExamples.rateLimitRota }),
  })
  @Throttle({ default: { limit: 60, ttl: oneMinuteMs, blockDuration: oneMinuteMs } })
  familyOnboardingStatus(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<FamilyOnboardingStatusDto> {
    return this.authService.getFamilyOnboardingStatus(user.userId);
  }

  @Post('onboarding/family/dismiss')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Ocultar onboarding familiar',
    description:
      'Marca o onboarding de convite familiar como ocultado para o usuario atual.',
  })
  @ApiOkResponse({
    description: 'Onboarding ocultado com sucesso.',
    type: ActionResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Access token invalido ou ausente.',
    content: apiErrorContent({
      accessTokenInvalido: swaggerErrorExamples.accessTokenInvalido,
    }),
  })
  @ApiTooManyRequestsResponse({
    description: 'Muitas tentativas nessa rota. Aguarde e tente novamente.',
    content: apiErrorContent({ rateLimitRota: swaggerErrorExamples.rateLimitRota }),
  })
  @Throttle({ default: { limit: 30, ttl: oneMinuteMs, blockDuration: oneMinuteMs } })
  dismissFamilyOnboarding(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ActionResponseDto> {
    return this.authService.dismissFamilyOnboarding(user.userId);
  }

  @Post('onboarding/family/invitations')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Convidar membros no onboarding familiar',
    description:
      'Recebe lista de membros (nome + email), prepara convites e envia emails no fluxo inicial do onboarding.',
  })
  @ApiOkResponse({
    description: 'Convites processados com sucesso.',
    type: FamilyOnboardingInviteMembersResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Payload invalido.',
    content: apiValidationErrorContent({
      payloadInvalidoOnboardingInvites:
        swaggerErrorExamples.payloadInvalidoOnboardingInvites,
    }),
  })
  @ApiUnauthorizedResponse({
    description: 'Access token invalido ou ausente.',
    content: apiErrorContent({
      accessTokenInvalido: swaggerErrorExamples.accessTokenInvalido,
    }),
  })
  @ApiTooManyRequestsResponse({
    description: 'Muitas tentativas nessa rota. Aguarde e tente novamente.',
    content: apiErrorContent({ rateLimitRota: swaggerErrorExamples.rateLimitRota }),
  })
  @Throttle({ default: { limit: 12, ttl: oneMinuteMs, blockDuration: oneMinuteMs } })
  inviteFamilyMembersFromOnboarding(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: FamilyOnboardingInviteMembersDto,
  ): Promise<FamilyOnboardingInviteMembersResponseDto> {
    return this.authService.inviteFamilyMembersFromOnboarding(user.userId, dto);
  }
}
