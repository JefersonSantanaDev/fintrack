"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FamilyController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const throttler_1 = require("@nestjs/throttler");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const auth_response_dto_1 = require("../auth/dto/auth-response.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const swagger_error_examples_1 = require("../docs/swagger-error-examples");
const family_dto_1 = require("./dto/family.dto");
const family_service_1 = require("./family.service");
const oneMinuteMs = 60_000;
let FamilyController = class FamilyController {
    familyService;
    constructor(familyService) {
        this.familyService = familyService;
    }
    workspace(user) {
        return this.familyService.getWorkspace(user.userId);
    }
    inviteMembers(user, dto) {
        return this.familyService.inviteMembers(user.userId, dto);
    }
    resendInvitation(user, invitationId) {
        return this.familyService.resendInvitation(user.userId, invitationId);
    }
    cancelInvitation(user, invitationId) {
        return this.familyService.cancelInvitation(user.userId, invitationId);
    }
    updateMemberRole(user, memberUserId, dto) {
        return this.familyService.updateMemberRole(user.userId, memberUserId, dto);
    }
    removeMember(user, memberUserId) {
        return this.familyService.removeMember(user.userId, memberUserId);
    }
};
exports.FamilyController = FamilyController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Carregar workspace da familia',
        description: 'Retorna membros ativos, convites pendentes e permissoes efetivas da familia da sessao.',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Workspace da familia carregado com sucesso.',
        type: family_dto_1.FamilyWorkspaceDto,
    }),
    (0, swagger_1.ApiUnauthorizedResponse)({
        description: 'Access token invalido ou ausente.',
        content: (0, swagger_error_examples_1.apiErrorContent)({
            accessTokenInvalido: swagger_error_examples_1.swaggerErrorExamples.accessTokenInvalido,
        }),
    }),
    (0, swagger_1.ApiTooManyRequestsResponse)({
        description: 'Muitas tentativas nessa rota. Aguarde e tente novamente.',
        content: (0, swagger_error_examples_1.apiErrorContent)({ rateLimitRota: swagger_error_examples_1.swaggerErrorExamples.rateLimitRota }),
    }),
    (0, throttler_1.Throttle)({ default: { limit: 60, ttl: oneMinuteMs, blockDuration: oneMinuteMs } }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FamilyController.prototype, "workspace", null);
__decorate([
    (0, common_1.Post)('invitations'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Convidar novos membros',
        description: 'Cria/atualiza convites pendentes para novos membros da familia e envia email.',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Convites processados com sucesso.',
        type: family_dto_1.FamilyInviteMembersResponseDto,
    }),
    (0, swagger_1.ApiBadRequestResponse)({
        description: 'Payload invalido.',
        content: (0, swagger_error_examples_1.apiValidationErrorContent)({
            payloadInvalidoFamilyInvites: swagger_error_examples_1.swaggerErrorExamples.payloadInvalidoFamilyInvites,
        }),
    }),
    (0, swagger_1.ApiForbiddenResponse)({
        description: 'Perfil sem permissao para convidar membros.',
        content: (0, swagger_error_examples_1.apiErrorContent)({
            semPermissaoFamilia: swagger_error_examples_1.swaggerErrorExamples.semPermissaoFamilia,
        }),
    }),
    (0, swagger_1.ApiUnauthorizedResponse)({
        description: 'Access token invalido ou ausente.',
        content: (0, swagger_error_examples_1.apiErrorContent)({
            accessTokenInvalido: swagger_error_examples_1.swaggerErrorExamples.accessTokenInvalido,
        }),
    }),
    (0, swagger_1.ApiTooManyRequestsResponse)({
        description: 'Muitas tentativas nessa rota. Aguarde e tente novamente.',
        content: (0, swagger_error_examples_1.apiErrorContent)({ rateLimitRota: swagger_error_examples_1.swaggerErrorExamples.rateLimitRota }),
    }),
    (0, throttler_1.Throttle)({ default: { limit: 20, ttl: oneMinuteMs, blockDuration: oneMinuteMs } }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, family_dto_1.FamilyInviteMembersDto]),
    __metadata("design:returntype", Promise)
], FamilyController.prototype, "inviteMembers", null);
__decorate([
    (0, common_1.Post)('invitations/:invitationId/resend'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Reenviar convite pendente',
        description: 'Reenvia email de um convite pendente existente para a familia da sessao.',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Convite reenviado com sucesso.',
        type: family_dto_1.ActionResponseDto,
    }),
    (0, swagger_1.ApiNotFoundResponse)({
        description: 'Convite pendente nao encontrado.',
        content: (0, swagger_error_examples_1.apiErrorContent)({
            conviteNaoEncontrado: swagger_error_examples_1.swaggerErrorExamples.conviteNaoEncontrado,
        }),
    }),
    (0, swagger_1.ApiForbiddenResponse)({
        description: 'Perfil sem permissao para reenviar convites.',
        content: (0, swagger_error_examples_1.apiErrorContent)({
            semPermissaoFamilia: swagger_error_examples_1.swaggerErrorExamples.semPermissaoFamilia,
        }),
    }),
    (0, swagger_1.ApiUnauthorizedResponse)({
        description: 'Access token invalido ou ausente.',
        content: (0, swagger_error_examples_1.apiErrorContent)({
            accessTokenInvalido: swagger_error_examples_1.swaggerErrorExamples.accessTokenInvalido,
        }),
    }),
    (0, swagger_1.ApiTooManyRequestsResponse)({
        description: 'Muitas tentativas nessa rota. Aguarde e tente novamente.',
        content: (0, swagger_error_examples_1.apiErrorContent)({ rateLimitRota: swagger_error_examples_1.swaggerErrorExamples.rateLimitRota }),
    }),
    (0, throttler_1.Throttle)({ default: { limit: 20, ttl: oneMinuteMs, blockDuration: oneMinuteMs } }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('invitationId', new common_1.ParseUUIDPipe({ version: '4' }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], FamilyController.prototype, "resendInvitation", null);
__decorate([
    (0, common_1.Post)('invitations/:invitationId/cancel'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Cancelar convite pendente',
        description: 'Cancela um convite pendente da familia da sessao.',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Convite cancelado com sucesso.',
        type: family_dto_1.ActionResponseDto,
    }),
    (0, swagger_1.ApiNotFoundResponse)({
        description: 'Convite pendente nao encontrado.',
        content: (0, swagger_error_examples_1.apiErrorContent)({
            conviteNaoEncontrado: swagger_error_examples_1.swaggerErrorExamples.conviteNaoEncontrado,
        }),
    }),
    (0, swagger_1.ApiForbiddenResponse)({
        description: 'Perfil sem permissao para cancelar convites.',
        content: (0, swagger_error_examples_1.apiErrorContent)({
            semPermissaoFamilia: swagger_error_examples_1.swaggerErrorExamples.semPermissaoFamilia,
        }),
    }),
    (0, swagger_1.ApiUnauthorizedResponse)({
        description: 'Access token invalido ou ausente.',
        content: (0, swagger_error_examples_1.apiErrorContent)({
            accessTokenInvalido: swagger_error_examples_1.swaggerErrorExamples.accessTokenInvalido,
        }),
    }),
    (0, swagger_1.ApiTooManyRequestsResponse)({
        description: 'Muitas tentativas nessa rota. Aguarde e tente novamente.',
        content: (0, swagger_error_examples_1.apiErrorContent)({ rateLimitRota: swagger_error_examples_1.swaggerErrorExamples.rateLimitRota }),
    }),
    (0, throttler_1.Throttle)({ default: { limit: 20, ttl: oneMinuteMs, blockDuration: oneMinuteMs } }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('invitationId', new common_1.ParseUUIDPipe({ version: '4' }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], FamilyController.prototype, "cancelInvitation", null);
__decorate([
    (0, common_1.Patch)('members/:memberUserId/role'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Alterar papel de membro',
        description: 'Atualiza o papel de um membro da familia (owner pode ajustar admin/viewer).',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Papel atualizado com sucesso.',
        type: family_dto_1.UpdateFamilyMemberRoleResponseDto,
    }),
    (0, swagger_1.ApiBadRequestResponse)({
        description: 'Payload invalido ou operacao nao permitida.',
        content: (0, swagger_error_examples_1.apiValidationErrorContent)({
            payloadInvalidoFamilyRole: swagger_error_examples_1.swaggerErrorExamples.payloadInvalidoFamilyRole,
        }),
    }),
    (0, swagger_1.ApiNotFoundResponse)({
        description: 'Membro nao encontrado na familia.',
        content: (0, swagger_error_examples_1.apiErrorContent)({
            membroNaoEncontrado: swagger_error_examples_1.swaggerErrorExamples.membroNaoEncontrado,
        }),
    }),
    (0, swagger_1.ApiForbiddenResponse)({
        description: 'Perfil sem permissao para alterar papel.',
        content: (0, swagger_error_examples_1.apiErrorContent)({
            semPermissaoFamilia: swagger_error_examples_1.swaggerErrorExamples.semPermissaoFamilia,
        }),
    }),
    (0, swagger_1.ApiUnauthorizedResponse)({
        description: 'Access token invalido ou ausente.',
        content: (0, swagger_error_examples_1.apiErrorContent)({
            accessTokenInvalido: swagger_error_examples_1.swaggerErrorExamples.accessTokenInvalido,
        }),
    }),
    (0, swagger_1.ApiTooManyRequestsResponse)({
        description: 'Muitas tentativas nessa rota. Aguarde e tente novamente.',
        content: (0, swagger_error_examples_1.apiErrorContent)({ rateLimitRota: swagger_error_examples_1.swaggerErrorExamples.rateLimitRota }),
    }),
    (0, throttler_1.Throttle)({ default: { limit: 25, ttl: oneMinuteMs, blockDuration: oneMinuteMs } }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('memberUserId', new common_1.ParseUUIDPipe({ version: '4' }))),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, family_dto_1.UpdateFamilyMemberRoleDto]),
    __metadata("design:returntype", Promise)
], FamilyController.prototype, "updateMemberRole", null);
__decorate([
    (0, common_1.Delete)('members/:memberUserId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Remover membro da familia',
        description: 'Remove um membro (nao-owner) da familia ativa.',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Membro removido com sucesso.',
        type: family_dto_1.ActionResponseDto,
    }),
    (0, swagger_1.ApiNotFoundResponse)({
        description: 'Membro nao encontrado na familia.',
        content: (0, swagger_error_examples_1.apiErrorContent)({
            membroNaoEncontrado: swagger_error_examples_1.swaggerErrorExamples.membroNaoEncontrado,
        }),
    }),
    (0, swagger_1.ApiForbiddenResponse)({
        description: 'Perfil sem permissao para remover membro.',
        content: (0, swagger_error_examples_1.apiErrorContent)({
            semPermissaoFamilia: swagger_error_examples_1.swaggerErrorExamples.semPermissaoFamilia,
        }),
    }),
    (0, swagger_1.ApiUnauthorizedResponse)({
        description: 'Access token invalido ou ausente.',
        content: (0, swagger_error_examples_1.apiErrorContent)({
            accessTokenInvalido: swagger_error_examples_1.swaggerErrorExamples.accessTokenInvalido,
        }),
    }),
    (0, swagger_1.ApiTooManyRequestsResponse)({
        description: 'Muitas tentativas nessa rota. Aguarde e tente novamente.',
        content: (0, swagger_error_examples_1.apiErrorContent)({ rateLimitRota: swagger_error_examples_1.swaggerErrorExamples.rateLimitRota }),
    }),
    (0, throttler_1.Throttle)({ default: { limit: 25, ttl: oneMinuteMs, blockDuration: oneMinuteMs } }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('memberUserId', new common_1.ParseUUIDPipe({ version: '4' }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], FamilyController.prototype, "removeMember", null);
exports.FamilyController = FamilyController = __decorate([
    (0, swagger_1.ApiTags)('Family'),
    (0, swagger_1.ApiExtraModels)(auth_response_dto_1.ApiErrorResponseDto, auth_response_dto_1.ApiValidationErrorResponseDto, family_dto_1.FamilyWorkspaceDto, family_dto_1.FamilyInviteMembersResponseDto, family_dto_1.UpdateFamilyMemberRoleResponseDto, family_dto_1.ActionResponseDto),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('family'),
    __metadata("design:paramtypes", [family_service_1.FamilyService])
], FamilyController);
//# sourceMappingURL=family.controller.js.map