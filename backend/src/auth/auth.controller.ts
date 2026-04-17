import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
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
import { LogoutDto } from './dto/logout.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { SignUpDto } from './dto/signup.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthService } from './auth.service';
import type { AuthenticatedUser } from './types/auth-user.type';
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
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Criar conta',
    description: 'Cria um novo usuario e retorna tokens de acesso.',
  })
  @ApiBody({ type: SignUpDto })
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
  signUp(@Body() dto: SignUpDto): Promise<AuthResponseDto> {
    return this.authService.signUp(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Entrar',
    description: 'Autentica um usuario e retorna novo par de tokens.',
  })
  @ApiBody({ type: LoginDto })
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
  login(@Body() dto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(dto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Renovar sessao',
    description: 'Rotaciona o refresh token e devolve novos tokens.',
  })
  @ApiBody({ type: RefreshTokenDto })
  @ApiOkResponse({
    description: 'Tokens renovados com sucesso.',
    type: AuthResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Refresh token invalido ou expirado.',
    content: apiErrorContent({ refreshInvalido: swaggerErrorExamples.refreshInvalido }),
  })
  @ApiBadRequestResponse({
    description: 'Payload invalido.',
    content: apiValidationErrorContent({
      payloadInvalidoRefresh: swaggerErrorExamples.payloadInvalidoRefresh,
    }),
  })
  @ApiTooManyRequestsResponse({
    description: 'Muitas tentativas nessa rota. Aguarde e tente novamente.',
    content: apiErrorContent({ rateLimitRota: swaggerErrorExamples.rateLimitRota }),
  })
  @Throttle({ default: { limit: 10, ttl: oneMinuteMs, blockDuration: oneMinuteMs } })
  refresh(@Body() dto: RefreshTokenDto): Promise<AuthResponseDto> {
    return this.authService.refresh(dto);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Sair',
    description: 'Revoga a sessao vinculada ao refresh token.',
  })
  @ApiBody({ type: LogoutDto })
  @ApiOkResponse({
    description: 'Logout processado com sucesso (idempotente).',
    type: LogoutResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Payload invalido.',
    content: apiValidationErrorContent({
      payloadInvalidoLogout: swaggerErrorExamples.payloadInvalidoLogout,
    }),
  })
  @ApiTooManyRequestsResponse({
    description: 'Muitas tentativas nessa rota. Aguarde e tente novamente.',
    content: apiErrorContent({ rateLimitRota: swaggerErrorExamples.rateLimitRota }),
  })
  @Throttle({ default: { limit: 20, ttl: oneMinuteMs, blockDuration: oneMinuteMs } })
  logout(@Body() dto: LogoutDto): Promise<LogoutResponseDto> {
    return this.authService.logout(dto);
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
