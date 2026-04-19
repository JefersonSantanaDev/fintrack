import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import {
  ActionResponseDto,
  ApiErrorResponseDto,
  ApiValidationErrorResponseDto,
} from './dto/auth-response.dto';
import { ForgotPasswordConfirmDto } from './dto/forgot-password-confirm.dto';
import { ForgotPasswordRequestDto } from './dto/forgot-password-request.dto';
import {
  apiErrorContent,
  apiValidationErrorContent,
  swaggerErrorExamples,
} from '../docs/swagger-error-examples';

const oneMinuteMs = 60_000;
const fiveMinutesMs = 5 * 60_000;

@ApiTags('Auth - Password Recovery')
@ApiExtraModels(ApiErrorResponseDto, ApiValidationErrorResponseDto, ActionResponseDto)
@Controller('auth')
export class AuthPasswordController {
  constructor(private readonly authService: AuthService) {}

  @Post('forgot-password/request')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Solicitar recuperacao de senha',
    description:
      'Recebe email para recuperacao. Sempre retorna sucesso para evitar enumeracao de contas.',
  })
  @ApiOkResponse({
    description: 'Solicitacao processada com sucesso (mensagem generica).',
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
}
