import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiExtraModels,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import {
  ApiErrorResponseDto,
  ApiValidationErrorResponseDto,
} from '../auth/dto/auth-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../auth/types/auth-user.type';
import {
  apiErrorContent,
  apiValidationErrorContent,
  swaggerErrorExamples,
} from '../docs/swagger-error-examples';
import {
  ActionResponseDto,
  FamilyInviteMembersDto,
  FamilyInviteMembersResponseDto,
  FamilyWorkspaceDto,
  UpdateFamilyMemberRoleDto,
  UpdateFamilyMemberRoleResponseDto,
} from './dto/family.dto';
import { FamilyService } from './family.service';

const oneMinuteMs = 60_000;

@ApiTags('Family')
@ApiExtraModels(
  ApiErrorResponseDto,
  ApiValidationErrorResponseDto,
  FamilyWorkspaceDto,
  FamilyInviteMembersResponseDto,
  UpdateFamilyMemberRoleResponseDto,
  ActionResponseDto,
)
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('family')
export class FamilyController {
  constructor(private readonly familyService: FamilyService) {}

  @Get()
  @ApiOperation({
    summary: 'Carregar workspace da familia',
    description:
      'Retorna membros ativos, convites pendentes e permissoes efetivas da familia da sessao.',
  })
  @ApiOkResponse({
    description: 'Workspace da familia carregado com sucesso.',
    type: FamilyWorkspaceDto,
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
  workspace(@CurrentUser() user: AuthenticatedUser): Promise<FamilyWorkspaceDto> {
    return this.familyService.getWorkspace(user.userId);
  }

  @Post('invitations')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Convidar novos membros',
    description:
      'Cria/atualiza convites pendentes para novos membros da familia e envia email.',
  })
  @ApiOkResponse({
    description: 'Convites processados com sucesso.',
    type: FamilyInviteMembersResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Payload invalido.',
    content: apiValidationErrorContent({
      payloadInvalidoFamilyInvites: swaggerErrorExamples.payloadInvalidoFamilyInvites,
    }),
  })
  @ApiForbiddenResponse({
    description: 'Perfil sem permissao para convidar membros.',
    content: apiErrorContent({
      semPermissaoFamilia: swaggerErrorExamples.semPermissaoFamilia,
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
  @Throttle({ default: { limit: 20, ttl: oneMinuteMs, blockDuration: oneMinuteMs } })
  inviteMembers(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: FamilyInviteMembersDto,
  ): Promise<FamilyInviteMembersResponseDto> {
    return this.familyService.inviteMembers(user.userId, dto);
  }

  @Post('invitations/:invitationId/resend')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Reenviar convite pendente',
    description: 'Reenvia email de um convite pendente existente para a familia da sessao.',
  })
  @ApiOkResponse({
    description: 'Convite reenviado com sucesso.',
    type: ActionResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Convite pendente nao encontrado.',
    content: apiErrorContent({
      conviteNaoEncontrado: swaggerErrorExamples.conviteNaoEncontrado,
    }),
  })
  @ApiForbiddenResponse({
    description: 'Perfil sem permissao para reenviar convites.',
    content: apiErrorContent({
      semPermissaoFamilia: swaggerErrorExamples.semPermissaoFamilia,
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
  @Throttle({ default: { limit: 20, ttl: oneMinuteMs, blockDuration: oneMinuteMs } })
  resendInvitation(
    @CurrentUser() user: AuthenticatedUser,
    @Param('invitationId', new ParseUUIDPipe({ version: '4' })) invitationId: string,
  ): Promise<ActionResponseDto> {
    return this.familyService.resendInvitation(user.userId, invitationId);
  }

  @Post('invitations/:invitationId/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Cancelar convite pendente',
    description: 'Cancela um convite pendente da familia da sessao.',
  })
  @ApiOkResponse({
    description: 'Convite cancelado com sucesso.',
    type: ActionResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Convite pendente nao encontrado.',
    content: apiErrorContent({
      conviteNaoEncontrado: swaggerErrorExamples.conviteNaoEncontrado,
    }),
  })
  @ApiForbiddenResponse({
    description: 'Perfil sem permissao para cancelar convites.',
    content: apiErrorContent({
      semPermissaoFamilia: swaggerErrorExamples.semPermissaoFamilia,
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
  @Throttle({ default: { limit: 20, ttl: oneMinuteMs, blockDuration: oneMinuteMs } })
  cancelInvitation(
    @CurrentUser() user: AuthenticatedUser,
    @Param('invitationId', new ParseUUIDPipe({ version: '4' })) invitationId: string,
  ): Promise<ActionResponseDto> {
    return this.familyService.cancelInvitation(user.userId, invitationId);
  }

  @Patch('members/:memberUserId/role')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Alterar papel de membro',
    description: 'Atualiza o papel de um membro da familia (owner pode ajustar admin/viewer).',
  })
  @ApiOkResponse({
    description: 'Papel atualizado com sucesso.',
    type: UpdateFamilyMemberRoleResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Payload invalido ou operacao nao permitida.',
    content: apiValidationErrorContent({
      payloadInvalidoFamilyRole: swaggerErrorExamples.payloadInvalidoFamilyRole,
    }),
  })
  @ApiNotFoundResponse({
    description: 'Membro nao encontrado na familia.',
    content: apiErrorContent({
      membroNaoEncontrado: swaggerErrorExamples.membroNaoEncontrado,
    }),
  })
  @ApiForbiddenResponse({
    description: 'Perfil sem permissao para alterar papel.',
    content: apiErrorContent({
      semPermissaoFamilia: swaggerErrorExamples.semPermissaoFamilia,
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
  @Throttle({ default: { limit: 25, ttl: oneMinuteMs, blockDuration: oneMinuteMs } })
  updateMemberRole(
    @CurrentUser() user: AuthenticatedUser,
    @Param('memberUserId', new ParseUUIDPipe({ version: '4' })) memberUserId: string,
    @Body() dto: UpdateFamilyMemberRoleDto,
  ): Promise<UpdateFamilyMemberRoleResponseDto> {
    return this.familyService.updateMemberRole(user.userId, memberUserId, dto);
  }

  @Delete('members/:memberUserId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Remover membro da familia',
    description: 'Remove um membro (nao-owner) da familia ativa.',
  })
  @ApiOkResponse({
    description: 'Membro removido com sucesso.',
    type: ActionResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Membro nao encontrado na familia.',
    content: apiErrorContent({
      membroNaoEncontrado: swaggerErrorExamples.membroNaoEncontrado,
    }),
  })
  @ApiForbiddenResponse({
    description: 'Perfil sem permissao para remover membro.',
    content: apiErrorContent({
      semPermissaoFamilia: swaggerErrorExamples.semPermissaoFamilia,
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
  @Throttle({ default: { limit: 25, ttl: oneMinuteMs, blockDuration: oneMinuteMs } })
  removeMember(
    @CurrentUser() user: AuthenticatedUser,
    @Param('memberUserId', new ParseUUIDPipe({ version: '4' })) memberUserId: string,
  ): Promise<ActionResponseDto> {
    return this.familyService.removeMember(user.userId, memberUserId);
  }
}
