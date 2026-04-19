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
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import {
  ActionResponseDto,
  ApiErrorResponseDto,
  ApiValidationErrorResponseDto,
  FamilyOnboardingInviteMembersResponseDto,
  FamilyOnboardingStatusDto,
} from './dto/auth-response.dto';
import { FamilyOnboardingInviteMembersDto } from './dto/family-onboarding-invite.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import type { AuthenticatedUser } from './types/auth-user.type';
import {
  apiErrorContent,
  apiValidationErrorContent,
  swaggerErrorExamples,
} from '../docs/swagger-error-examples';

const oneMinuteMs = 60_000;

@ApiTags('Auth - Family Onboarding')
@ApiExtraModels(
  ApiErrorResponseDto,
  ApiValidationErrorResponseDto,
  ActionResponseDto,
  FamilyOnboardingStatusDto,
  FamilyOnboardingInviteMembersResponseDto,
)
@Controller('auth')
export class AuthOnboardingController {
  constructor(private readonly authService: AuthService) {}

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
