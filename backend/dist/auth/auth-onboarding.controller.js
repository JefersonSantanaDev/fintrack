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
exports.AuthOnboardingController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const throttler_1 = require("@nestjs/throttler");
const auth_service_1 = require("./auth.service");
const current_user_decorator_1 = require("./decorators/current-user.decorator");
const auth_response_dto_1 = require("./dto/auth-response.dto");
const family_onboarding_invite_dto_1 = require("./dto/family-onboarding-invite.dto");
const jwt_auth_guard_1 = require("./guards/jwt-auth.guard");
const swagger_error_examples_1 = require("../docs/swagger-error-examples");
const oneMinuteMs = 60_000;
let AuthOnboardingController = class AuthOnboardingController {
    authService;
    constructor(authService) {
        this.authService = authService;
    }
    familyOnboardingStatus(user) {
        return this.authService.getFamilyOnboardingStatus(user.userId);
    }
    dismissFamilyOnboarding(user) {
        return this.authService.dismissFamilyOnboarding(user.userId);
    }
    inviteFamilyMembersFromOnboarding(user, dto) {
        return this.authService.inviteFamilyMembersFromOnboarding(user.userId, dto);
    }
};
exports.AuthOnboardingController = AuthOnboardingController;
__decorate([
    (0, common_1.Get)('onboarding/family'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, swagger_1.ApiOperation)({
        summary: 'Status de onboarding familiar',
        description: 'Retorna estado atual do onboarding de convite de membros da familia no dashboard.',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Status do onboarding familiar carregado com sucesso.',
        type: auth_response_dto_1.FamilyOnboardingStatusDto,
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
], AuthOnboardingController.prototype, "familyOnboardingStatus", null);
__decorate([
    (0, common_1.Post)('onboarding/family/dismiss'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Ocultar onboarding familiar',
        description: 'Marca o onboarding de convite familiar como ocultado para o usuario atual.',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Onboarding ocultado com sucesso.',
        type: auth_response_dto_1.ActionResponseDto,
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
    (0, throttler_1.Throttle)({ default: { limit: 30, ttl: oneMinuteMs, blockDuration: oneMinuteMs } }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthOnboardingController.prototype, "dismissFamilyOnboarding", null);
__decorate([
    (0, common_1.Post)('onboarding/family/invitations'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Convidar membros no onboarding familiar',
        description: 'Recebe lista de membros (nome + email), prepara convites e envia emails no fluxo inicial do onboarding.',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Convites processados com sucesso.',
        type: auth_response_dto_1.FamilyOnboardingInviteMembersResponseDto,
    }),
    (0, swagger_1.ApiBadRequestResponse)({
        description: 'Payload invalido.',
        content: (0, swagger_error_examples_1.apiValidationErrorContent)({
            payloadInvalidoOnboardingInvites: swagger_error_examples_1.swaggerErrorExamples.payloadInvalidoOnboardingInvites,
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
    (0, throttler_1.Throttle)({ default: { limit: 12, ttl: oneMinuteMs, blockDuration: oneMinuteMs } }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, family_onboarding_invite_dto_1.FamilyOnboardingInviteMembersDto]),
    __metadata("design:returntype", Promise)
], AuthOnboardingController.prototype, "inviteFamilyMembersFromOnboarding", null);
exports.AuthOnboardingController = AuthOnboardingController = __decorate([
    (0, swagger_1.ApiTags)('Auth - Onboarding Familiar'),
    (0, swagger_1.ApiExtraModels)(auth_response_dto_1.ApiErrorResponseDto, auth_response_dto_1.ApiValidationErrorResponseDto, auth_response_dto_1.ActionResponseDto, auth_response_dto_1.FamilyOnboardingStatusDto, auth_response_dto_1.FamilyOnboardingInviteMembersResponseDto),
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthOnboardingController);
//# sourceMappingURL=auth-onboarding.controller.js.map