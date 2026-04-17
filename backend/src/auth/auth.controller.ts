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
  ApiErrorResponseDto,
  ApiValidationErrorResponseDto,
  AuthResponseDto,
  LogoutResponseDto,
  MeResponseDto,
} from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';
import { SignUpDto } from './dto/signup.dto';
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
@ApiExtraModels(ApiErrorResponseDto, ApiValidationErrorResponseDto)
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

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Criar conta',
    description: 'Cria um novo usuario e retorna access token. O refresh token vai em cookie httpOnly.',
  })
  @ApiCreatedResponse({
    description: 'Conta criada e sessao iniciada com sucesso.',
    type: AuthResponseDto,
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
    description: 'Muitas tentativas nessa rota. Aguarde e tente novamente.',
    content: apiErrorContent({ rateLimitRota: swaggerErrorExamples.rateLimitRota }),
  })
  @Throttle({ default: { limit: 3, ttl: oneMinuteMs, blockDuration: fiveMinutesMs } })
  async signUp(
    @Body() dto: SignUpDto,
    @Res({ passthrough: true }) reply: FastifyReply,
  ): Promise<AuthResponseDto> {
    const response = await this.authService.signUp(dto);
    this.setRefreshCookie(reply, response.refreshToken);
    return {
      user: response.user,
      accessToken: response.accessToken,
    };
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
}
