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
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const swagger_1 = require("@nestjs/swagger");
const throttler_1 = require("@nestjs/throttler");
const current_user_decorator_1 = require("./decorators/current-user.decorator");
const auth_response_dto_1 = require("./dto/auth-response.dto");
const login_dto_1 = require("./dto/login.dto");
const forgot_password_confirm_dto_1 = require("./dto/forgot-password-confirm.dto");
const forgot_password_request_dto_1 = require("./dto/forgot-password-request.dto");
const signup_resend_dto_1 = require("./dto/signup-resend.dto");
const signup_dto_1 = require("./dto/signup.dto");
const signup_verify_dto_1 = require("./dto/signup-verify.dto");
const family_onboarding_invite_dto_1 = require("./dto/family-onboarding-invite.dto");
const jwt_auth_guard_1 = require("./guards/jwt-auth.guard");
const auth_service_1 = require("./auth.service");
const swagger_error_examples_1 = require("../docs/swagger-error-examples");
const oneMinuteMs = 60_000;
const fiveMinutesMs = 5 * 60_000;
let AuthController = class AuthController {
    authService;
    configService;
    refreshCookieName;
    refreshCookieOptions;
    constructor(authService, configService) {
        this.authService = authService;
        this.configService = configService;
        this.refreshCookieName = this.configService.get('AUTH_REFRESH_COOKIE_NAME', 'fintrack_refresh_token');
        const refreshCookieMaxAgeMs = this.parsePositiveNumber(this.configService.get('AUTH_REFRESH_COOKIE_MAX_AGE_MS'), 7 * 24 * 60 * 60 * 1000);
        const refreshCookieSecure = this.parseBoolean(this.configService.get('AUTH_REFRESH_COOKIE_SECURE'), false);
        const refreshCookiePath = this.configService.get('AUTH_REFRESH_COOKIE_PATH', '/api/auth');
        this.refreshCookieOptions = {
            httpOnly: true,
            secure: refreshCookieSecure,
            sameSite: this.parseSameSite(this.configService.get('AUTH_REFRESH_COOKIE_SAME_SITE')),
            path: refreshCookiePath,
            maxAge: Math.ceil(refreshCookieMaxAgeMs / 1000),
        };
    }
    parsePositiveNumber(input, fallback) {
        const parsed = Number(input);
        if (!Number.isFinite(parsed) || parsed <= 0) {
            return fallback;
        }
        return parsed;
    }
    parseBoolean(input, fallback) {
        if (typeof input !== 'string') {
            return fallback;
        }
        const normalized = input.trim().toLowerCase();
        if (normalized === 'true') {
            return true;
        }
        if (normalized === 'false') {
            return false;
        }
        return fallback;
    }
    parseSameSite(value) {
        if (!value) {
            return 'lax';
        }
        const normalized = value.trim().toLowerCase();
        if (normalized === 'strict' || normalized === 'none' || normalized === 'lax') {
            return normalized;
        }
        return 'lax';
    }
    setRefreshCookie(reply, refreshToken) {
        reply.setCookie(this.refreshCookieName, refreshToken, this.refreshCookieOptions);
    }
    clearRefreshCookie(reply) {
        reply.clearCookie(this.refreshCookieName, this.refreshCookieOptions);
    }
    readRefreshTokenFromCookie(request) {
        const cookies = request.cookies;
        const refreshToken = cookies?.[this.refreshCookieName];
        if (!refreshToken) {
            throw new common_1.UnauthorizedException('Refresh token ausente ou invalido.');
        }
        return refreshToken;
    }
    readRefreshTokenFromCookieIfPresent(request) {
        const cookies = request.cookies;
        return cookies?.[this.refreshCookieName] ?? null;
    }
    async signUpStart(dto) {
        return this.authService.startSignUp(dto);
    }
    async signUpVerify(dto, reply) {
        const response = await this.authService.verifySignUp(dto);
        this.setRefreshCookie(reply, response.refreshToken);
        return {
            user: response.user,
            accessToken: response.accessToken,
        };
    }
    async signUpResend(dto) {
        return this.authService.resendSignUpCode(dto);
    }
    async requestPasswordRecovery(dto) {
        return this.authService.requestPasswordRecovery(dto);
    }
    async confirmPasswordRecovery(dto) {
        return this.authService.confirmPasswordRecovery(dto);
    }
    async login(dto, reply) {
        const response = await this.authService.login(dto);
        this.setRefreshCookie(reply, response.refreshToken);
        return {
            user: response.user,
            accessToken: response.accessToken,
        };
    }
    async refresh(request, reply) {
        const refreshToken = this.readRefreshTokenFromCookie(request);
        const response = await this.authService.refresh(refreshToken);
        this.setRefreshCookie(reply, response.refreshToken);
        return {
            user: response.user,
            accessToken: response.accessToken,
        };
    }
    async logout(request, reply) {
        const refreshToken = this.readRefreshTokenFromCookieIfPresent(request);
        const response = await this.authService.logout(refreshToken ?? undefined);
        this.clearRefreshCookie(reply);
        return response;
    }
    me(user) {
        return this.authService.getProfile(user.userId);
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
exports.AuthController = AuthController;
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
], AuthController.prototype, "signUpStart", null);
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
], AuthController.prototype, "signUpVerify", null);
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
], AuthController.prototype, "signUpResend", null);
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
], AuthController.prototype, "requestPasswordRecovery", null);
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
], AuthController.prototype, "confirmPasswordRecovery", null);
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
], AuthController.prototype, "login", null);
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
], AuthController.prototype, "refresh", null);
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
], AuthController.prototype, "logout", null);
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
], AuthController.prototype, "me", null);
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
], AuthController.prototype, "familyOnboardingStatus", null);
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
], AuthController.prototype, "dismissFamilyOnboarding", null);
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
], AuthController.prototype, "inviteFamilyMembersFromOnboarding", null);
exports.AuthController = AuthController = __decorate([
    (0, swagger_1.ApiTags)('Auth'),
    (0, swagger_1.ApiExtraModels)(auth_response_dto_1.ApiErrorResponseDto, auth_response_dto_1.ApiValidationErrorResponseDto, auth_response_dto_1.SignUpChallengeResponseDto, auth_response_dto_1.ActionResponseDto, auth_response_dto_1.FamilyOnboardingStatusDto, auth_response_dto_1.FamilyOnboardingInviteMembersResponseDto),
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        config_1.ConfigService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map