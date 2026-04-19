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
exports.AuthSessionController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const throttler_1 = require("@nestjs/throttler");
const auth_refresh_cookie_service_1 = require("./auth-refresh-cookie.service");
const auth_service_1 = require("./auth.service");
const current_user_decorator_1 = require("./decorators/current-user.decorator");
const auth_response_dto_1 = require("./dto/auth-response.dto");
const login_dto_1 = require("./dto/login.dto");
const jwt_auth_guard_1 = require("./guards/jwt-auth.guard");
const swagger_error_examples_1 = require("../docs/swagger-error-examples");
const oneMinuteMs = 60_000;
const fiveMinutesMs = 5 * 60_000;
let AuthSessionController = class AuthSessionController {
    authService;
    refreshCookieService;
    constructor(authService, refreshCookieService) {
        this.authService = authService;
        this.refreshCookieService = refreshCookieService;
    }
    async login(dto, reply) {
        const response = await this.authService.login(dto);
        this.refreshCookieService.setRefreshCookie(reply, response.refreshToken);
        return {
            user: response.user,
            family: response.family,
            accessToken: response.accessToken,
        };
    }
    async refresh(request, reply) {
        const refreshToken = this.refreshCookieService.readRefreshTokenFromCookie(request);
        const response = await this.authService.refresh(refreshToken);
        this.refreshCookieService.setRefreshCookie(reply, response.refreshToken);
        return {
            user: response.user,
            family: response.family,
            accessToken: response.accessToken,
        };
    }
    async logout(request, reply) {
        const refreshToken = this.refreshCookieService.readRefreshTokenFromCookieIfPresent(request);
        const response = await this.authService.logout(refreshToken ?? undefined);
        this.refreshCookieService.clearRefreshCookie(reply);
        return response;
    }
    me(user) {
        return this.authService.getProfile(user.userId);
    }
};
exports.AuthSessionController = AuthSessionController;
__decorate([
    (0, common_1.Post)('login'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Entrar',
        description: 'Autentica um usuario e retorna access token. O refresh token vai em cookie httpOnly.',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Login efetuado com sucesso.',
        type: auth_response_dto_1.AuthResponseDto,
    }),
    (0, swagger_1.ApiUnauthorizedResponse)({
        description: 'Credenciais invalidas.',
        content: (0, swagger_error_examples_1.apiErrorContent)({
            credenciaisInvalidas: swagger_error_examples_1.swaggerErrorExamples.credenciaisInvalidas,
        }),
    }),
    (0, swagger_1.ApiBadRequestResponse)({
        description: 'Payload invalido.',
        content: (0, swagger_error_examples_1.apiValidationErrorContent)({
            payloadInvalidoLogin: swagger_error_examples_1.swaggerErrorExamples.payloadInvalidoLogin,
        }),
    }),
    (0, swagger_1.ApiTooManyRequestsResponse)({
        description: 'Muitas tentativas de login (rate limit ou bloqueio temporario por tentativas invalidas).',
        content: (0, swagger_error_examples_1.apiErrorContent)({ rateLimitAuth: swagger_error_examples_1.swaggerErrorExamples.rateLimitAuth }),
    }),
    (0, throttler_1.Throttle)({ default: { limit: 5, ttl: oneMinuteMs, blockDuration: fiveMinutesMs } }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_dto_1.LoginDto, Object]),
    __metadata("design:returntype", Promise)
], AuthSessionController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('refresh'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Renovar sessao',
        description: 'Rotaciona o refresh token (cookie httpOnly) e devolve novo access token.',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Sessao renovada com sucesso.',
        type: auth_response_dto_1.AuthResponseDto,
    }),
    (0, swagger_1.ApiUnauthorizedResponse)({
        description: 'Refresh token invalido ou expirado.',
        content: (0, swagger_error_examples_1.apiErrorContent)({ refreshInvalido: swagger_error_examples_1.swaggerErrorExamples.refreshInvalido }),
    }),
    (0, swagger_1.ApiTooManyRequestsResponse)({
        description: 'Muitas tentativas nessa rota. Aguarde e tente novamente.',
        content: (0, swagger_error_examples_1.apiErrorContent)({ rateLimitRota: swagger_error_examples_1.swaggerErrorExamples.rateLimitRota }),
    }),
    (0, throttler_1.Throttle)({ default: { limit: 10, ttl: oneMinuteMs, blockDuration: oneMinuteMs } }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthSessionController.prototype, "refresh", null);
__decorate([
    (0, common_1.Post)('logout'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Sair',
        description: 'Revoga a sessao vinculada ao refresh token salvo no cookie httpOnly.',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Logout processado com sucesso (idempotente).',
        type: auth_response_dto_1.LogoutResponseDto,
    }),
    (0, swagger_1.ApiTooManyRequestsResponse)({
        description: 'Muitas tentativas nessa rota. Aguarde e tente novamente.',
        content: (0, swagger_error_examples_1.apiErrorContent)({ rateLimitRota: swagger_error_examples_1.swaggerErrorExamples.rateLimitRota }),
    }),
    (0, throttler_1.Throttle)({ default: { limit: 20, ttl: oneMinuteMs, blockDuration: oneMinuteMs } }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthSessionController.prototype, "logout", null);
__decorate([
    (0, common_1.Get)('me'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('access-token'),
    (0, swagger_1.ApiOperation)({
        summary: 'Perfil da sessao',
        description: 'Retorna dados do usuario autenticado no access token.',
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Sessao valida e perfil retornado.',
        type: auth_response_dto_1.MeResponseDto,
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
], AuthSessionController.prototype, "me", null);
exports.AuthSessionController = AuthSessionController = __decorate([
    (0, swagger_1.ApiTags)('Auth - Session'),
    (0, swagger_1.ApiExtraModels)(auth_response_dto_1.ApiErrorResponseDto, auth_response_dto_1.ApiValidationErrorResponseDto, auth_response_dto_1.AuthResponseDto, auth_response_dto_1.LogoutResponseDto, auth_response_dto_1.MeResponseDto),
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        auth_refresh_cookie_service_1.AuthRefreshCookieService])
], AuthSessionController);
//# sourceMappingURL=auth-session.controller.js.map