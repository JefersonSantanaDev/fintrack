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
exports.AuthSignupController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const throttler_1 = require("@nestjs/throttler");
const auth_refresh_cookie_service_1 = require("./auth-refresh-cookie.service");
const auth_service_1 = require("./auth.service");
const auth_response_dto_1 = require("./dto/auth-response.dto");
const signup_dto_1 = require("./dto/signup.dto");
const signup_resend_dto_1 = require("./dto/signup-resend.dto");
const signup_verify_dto_1 = require("./dto/signup-verify.dto");
const swagger_error_examples_1 = require("../docs/swagger-error-examples");
const oneMinuteMs = 60_000;
const fiveMinutesMs = 5 * 60_000;
let AuthSignupController = class AuthSignupController {
    authService;
    refreshCookieService;
    constructor(authService, refreshCookieService) {
        this.authService = authService;
        this.refreshCookieService = refreshCookieService;
    }
    async signUpStart(dto) {
        return this.authService.startSignUp(dto);
    }
    async signUpVerify(dto, reply) {
        const response = await this.authService.verifySignUp(dto);
        this.refreshCookieService.setRefreshCookie(reply, response.refreshToken);
        return {
            user: response.user,
            family: response.family,
            accessToken: response.accessToken,
        };
    }
    async signUpResend(dto) {
        return this.authService.resendSignUpCode(dto);
    }
};
exports.AuthSignupController = AuthSignupController;
__decorate([
    (0, common_1.Post)('signup/start'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({
        summary: 'Iniciar cadastro',
        description: 'Inicia o cadastro com envio de codigo de verificacao para o email informado.',
    }),
    (0, swagger_1.ApiCreatedResponse)({
        description: 'Codigo de verificacao enviado com sucesso.',
        type: auth_response_dto_1.SignUpChallengeResponseDto,
    }),
    (0, swagger_1.ApiConflictResponse)({
        description: 'Email ja cadastrado.',
        content: (0, swagger_error_examples_1.apiErrorContent)({ emailEmUso: swagger_error_examples_1.swaggerErrorExamples.emailEmUso }),
    }),
    (0, swagger_1.ApiBadRequestResponse)({
        description: 'Payload invalido.',
        content: (0, swagger_error_examples_1.apiValidationErrorContent)({
            payloadInvalidoSignUp: swagger_error_examples_1.swaggerErrorExamples.payloadInvalidoSignUp,
        }),
    }),
    (0, swagger_1.ApiTooManyRequestsResponse)({
        description: 'Aguarde para solicitar outro codigo.',
        content: (0, swagger_error_examples_1.apiErrorContent)({ rateLimitSignUp: swagger_error_examples_1.swaggerErrorExamples.rateLimitSignUp }),
    }),
    (0, throttler_1.Throttle)({ default: { limit: 3, ttl: oneMinuteMs, blockDuration: fiveMinutesMs } }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [signup_dto_1.SignUpDto]),
    __metadata("design:returntype", Promise)
], AuthSignupController.prototype, "signUpStart", null);
__decorate([
    (0, common_1.Post)('signup/verify'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Verificar cadastro',
        description: 'Valida codigo de verificacao de cadastro, cria conta e inicia sessao.',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Codigo validado e sessao iniciada com sucesso.',
        type: auth_response_dto_1.AuthResponseDto,
    }),
    (0, swagger_1.ApiUnauthorizedResponse)({
        description: 'Codigo invalido ou expirado.',
        content: (0, swagger_error_examples_1.apiErrorContent)({
            codigoInvalido: swagger_error_examples_1.swaggerErrorExamples.codigoInvalido,
            codigoExpirado: swagger_error_examples_1.swaggerErrorExamples.codigoExpirado,
        }),
    }),
    (0, swagger_1.ApiConflictResponse)({
        description: 'Email ja cadastrado.',
        content: (0, swagger_error_examples_1.apiErrorContent)({ emailEmUso: swagger_error_examples_1.swaggerErrorExamples.emailEmUso }),
    }),
    (0, swagger_1.ApiBadRequestResponse)({
        description: 'Payload invalido.',
        content: (0, swagger_error_examples_1.apiValidationErrorContent)({
            payloadInvalidoSignUpVerify: swagger_error_examples_1.swaggerErrorExamples.payloadInvalidoSignUpVerify,
        }),
    }),
    (0, swagger_1.ApiTooManyRequestsResponse)({
        description: 'Muitas tentativas de verificacao. Aguarde para tentar novamente.',
        content: (0, swagger_error_examples_1.apiErrorContent)({
            rateLimitSignUpVerify: swagger_error_examples_1.swaggerErrorExamples.rateLimitSignUpVerify,
        }),
    }),
    (0, throttler_1.Throttle)({ default: { limit: 8, ttl: oneMinuteMs, blockDuration: fiveMinutesMs } }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [signup_verify_dto_1.SignUpVerifyDto, Object]),
    __metadata("design:returntype", Promise)
], AuthSignupController.prototype, "signUpVerify", null);
__decorate([
    (0, common_1.Post)('signup/resend'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Reenviar codigo de cadastro',
        description: 'Reenvia um novo codigo para o email de cadastro pendente.',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Novo codigo enviado com sucesso.',
        type: auth_response_dto_1.SignUpChallengeResponseDto,
    }),
    (0, swagger_1.ApiConflictResponse)({
        description: 'Email ja cadastrado.',
        content: (0, swagger_error_examples_1.apiErrorContent)({ emailEmUso: swagger_error_examples_1.swaggerErrorExamples.emailEmUso }),
    }),
    (0, swagger_1.ApiBadRequestResponse)({
        description: 'Cadastro pendente nao encontrado ou payload invalido.',
        content: (0, swagger_error_examples_1.apiErrorContent)({
            cadastroPendenteNaoEncontrado: swagger_error_examples_1.swaggerErrorExamples.cadastroPendenteNaoEncontrado,
            payloadInvalidoSignUpResend: swagger_error_examples_1.swaggerErrorExamples.payloadInvalidoSignUpResend,
        }),
    }),
    (0, swagger_1.ApiTooManyRequestsResponse)({
        description: 'Ainda nao e possivel solicitar novo codigo.',
        content: (0, swagger_error_examples_1.apiErrorContent)({ rateLimitSignUp: swagger_error_examples_1.swaggerErrorExamples.rateLimitSignUp }),
    }),
    (0, throttler_1.Throttle)({ default: { limit: 3, ttl: oneMinuteMs, blockDuration: fiveMinutesMs } }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [signup_resend_dto_1.SignUpResendDto]),
    __metadata("design:returntype", Promise)
], AuthSignupController.prototype, "signUpResend", null);
exports.AuthSignupController = AuthSignupController = __decorate([
    (0, swagger_1.ApiTags)('Auth - Sign Up'),
    (0, swagger_1.ApiExtraModels)(auth_response_dto_1.ApiErrorResponseDto, auth_response_dto_1.ApiValidationErrorResponseDto, auth_response_dto_1.SignUpChallengeResponseDto),
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        auth_refresh_cookie_service_1.AuthRefreshCookieService])
], AuthSignupController);
//# sourceMappingURL=auth-signup.controller.js.map