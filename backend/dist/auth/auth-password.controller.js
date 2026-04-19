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
exports.AuthPasswordController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const throttler_1 = require("@nestjs/throttler");
const auth_service_1 = require("./auth.service");
const auth_response_dto_1 = require("./dto/auth-response.dto");
const forgot_password_confirm_dto_1 = require("./dto/forgot-password-confirm.dto");
const forgot_password_request_dto_1 = require("./dto/forgot-password-request.dto");
const swagger_error_examples_1 = require("../docs/swagger-error-examples");
const oneMinuteMs = 60_000;
const fiveMinutesMs = 5 * 60_000;
let AuthPasswordController = class AuthPasswordController {
    authService;
    constructor(authService) {
        this.authService = authService;
    }
    async requestPasswordRecovery(dto) {
        return this.authService.requestPasswordRecovery(dto);
    }
    async confirmPasswordRecovery(dto) {
        return this.authService.confirmPasswordRecovery(dto);
    }
};
exports.AuthPasswordController = AuthPasswordController;
__decorate([
    (0, common_1.Post)('forgot-password/request'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Solicitar recuperacao de senha',
        description: 'Recebe email para recuperacao. Sempre retorna sucesso para evitar enumeracao de contas.',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Solicitacao processada com sucesso (mensagem generica).',
        type: auth_response_dto_1.ActionResponseDto,
    }),
    (0, swagger_1.ApiBadRequestResponse)({
        description: 'Payload invalido.',
        content: (0, swagger_error_examples_1.apiValidationErrorContent)({
            payloadInvalidoForgotPasswordRequest: swagger_error_examples_1.swaggerErrorExamples.payloadInvalidoForgotPasswordRequest,
        }),
    }),
    (0, swagger_1.ApiTooManyRequestsResponse)({
        description: 'Muitas tentativas nessa rota. Aguarde e tente novamente.',
        content: (0, swagger_error_examples_1.apiErrorContent)({
            rateLimitForgotPassword: swagger_error_examples_1.swaggerErrorExamples.rateLimitForgotPassword,
        }),
    }),
    (0, throttler_1.Throttle)({ default: { limit: 3, ttl: oneMinuteMs, blockDuration: fiveMinutesMs } }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [forgot_password_request_dto_1.ForgotPasswordRequestDto]),
    __metadata("design:returntype", Promise)
], AuthPasswordController.prototype, "requestPasswordRecovery", null);
__decorate([
    (0, common_1.Post)('forgot-password/confirm'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Confirmar recuperacao de senha',
        description: 'Valida token recebido por email, redefine a senha e revoga sessoes ativas.',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Senha redefinida com sucesso.',
        type: auth_response_dto_1.ActionResponseDto,
    }),
    (0, swagger_1.ApiBadRequestResponse)({
        description: 'Payload invalido.',
        content: (0, swagger_error_examples_1.apiValidationErrorContent)({
            payloadInvalidoForgotPasswordConfirm: swagger_error_examples_1.swaggerErrorExamples.payloadInvalidoForgotPasswordConfirm,
        }),
    }),
    (0, swagger_1.ApiUnauthorizedResponse)({
        description: 'Token invalido ou expirado.',
        content: (0, swagger_error_examples_1.apiErrorContent)({
            linkRecuperacaoInvalido: swagger_error_examples_1.swaggerErrorExamples.linkRecuperacaoInvalido,
        }),
    }),
    (0, swagger_1.ApiTooManyRequestsResponse)({
        description: 'Muitas tentativas nessa rota. Aguarde e tente novamente.',
        content: (0, swagger_error_examples_1.apiErrorContent)({
            rateLimitForgotPasswordConfirm: swagger_error_examples_1.swaggerErrorExamples.rateLimitForgotPasswordConfirm,
        }),
    }),
    (0, throttler_1.Throttle)({ default: { limit: 8, ttl: oneMinuteMs, blockDuration: fiveMinutesMs } }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [forgot_password_confirm_dto_1.ForgotPasswordConfirmDto]),
    __metadata("design:returntype", Promise)
], AuthPasswordController.prototype, "confirmPasswordRecovery", null);
exports.AuthPasswordController = AuthPasswordController = __decorate([
    (0, swagger_1.ApiTags)('Auth - Password Recovery'),
    (0, swagger_1.ApiExtraModels)(auth_response_dto_1.ApiErrorResponseDto, auth_response_dto_1.ApiValidationErrorResponseDto, auth_response_dto_1.ActionResponseDto),
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthPasswordController);
//# sourceMappingURL=auth-password.controller.js.map