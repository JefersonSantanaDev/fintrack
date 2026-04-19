import { Body, Controller, HttpCode, HttpStatus, Post, Res } from '@nestjs/common';
import {
  ApiBadRequestResponse,
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
import type { FastifyReply } from 'fastify';
import { AuthRefreshCookieService } from './auth-refresh-cookie.service';
import { AuthService } from './auth.service';
import {
  ApiErrorResponseDto,
  ApiValidationErrorResponseDto,
  AuthResponseDto,
  SignUpChallengeResponseDto,
} from './dto/auth-response.dto';
import { SignUpDto } from './dto/signup.dto';
import { SignUpResendDto } from './dto/signup-resend.dto';
import { SignUpVerifyDto } from './dto/signup-verify.dto';
import {
  apiErrorContent,
  apiValidationErrorContent,
  swaggerErrorExamples,
} from '../docs/swagger-error-examples';

const oneMinuteMs = 60_000;
const fiveMinutesMs = 5 * 60_000;

@ApiTags('Auth - Cadastro')
@ApiExtraModels(
  ApiErrorResponseDto,
  ApiValidationErrorResponseDto,
  SignUpChallengeResponseDto,
)
@Controller('auth')
export class AuthSignupController {
  constructor(
    private readonly authService: AuthService,
    private readonly refreshCookieService: AuthRefreshCookieService,
  ) {}

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
  async signUpStart(@Body() dto: SignUpDto): Promise<SignUpChallengeResponseDto> {
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
    description: 'Muitas tentativas de verificacao. Aguarde para tentar novamente.',
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
    this.refreshCookieService.setRefreshCookie(reply, response.refreshToken);

    return {
      user: response.user,
      family: response.family,
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
}
