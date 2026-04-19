import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { AuthRefreshCookieService } from './auth-refresh-cookie.service';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import {
  ApiErrorResponseDto,
  ApiValidationErrorResponseDto,
  AuthResponseDto,
  LogoutResponseDto,
  MeResponseDto,
} from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import type { AuthenticatedUser } from './types/auth-user.type';
import {
  apiErrorContent,
  apiValidationErrorContent,
  swaggerErrorExamples,
} from '../docs/swagger-error-examples';

const oneMinuteMs = 60_000;
const fiveMinutesMs = 5 * 60_000;

@ApiTags('Auth - Session')
@ApiExtraModels(
  ApiErrorResponseDto,
  ApiValidationErrorResponseDto,
  AuthResponseDto,
  LogoutResponseDto,
  MeResponseDto,
)
@Controller('auth')
export class AuthSessionController {
  constructor(
    private readonly authService: AuthService,
    private readonly refreshCookieService: AuthRefreshCookieService,
  ) {}

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
    this.refreshCookieService.setRefreshCookie(reply, response.refreshToken);

    return {
      user: response.user,
      family: response.family,
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
    const refreshToken = this.refreshCookieService.readRefreshTokenFromCookie(request);
    const response = await this.authService.refresh(refreshToken);
    this.refreshCookieService.setRefreshCookie(reply, response.refreshToken);

    return {
      user: response.user,
      family: response.family,
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
    const refreshToken = this.refreshCookieService.readRefreshTokenFromCookieIfPresent(request);
    const response = await this.authService.logout(refreshToken ?? undefined);
    this.refreshCookieService.clearRefreshCookie(reply);
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
