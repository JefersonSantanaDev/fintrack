"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcrypt"));
const crypto_1 = require("crypto");
const prisma_service_1 = require("../prisma/prisma.service");
const login_attempts_service_1 = require("./login-attempts.service");
const signup_mail_service_1 = require("./signup-mail.service");
let AuthService = class AuthService {
    prisma;
    jwtService;
    configService;
    loginAttemptsService;
    signUpMailService;
    accessSecret;
    refreshSecret;
    accessExpiresIn;
    refreshExpiresIn;
    bcryptSaltRounds;
    signUpCodeTtlMs;
    signUpCodeResendCooldownMs;
    signUpCodeMaxAttempts;
    signUpCodeLockDurationMs;
    signUpCodeLength;
    constructor(prisma, jwtService, configService, loginAttemptsService, signUpMailService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.configService = configService;
        this.loginAttemptsService = loginAttemptsService;
        this.signUpMailService = signUpMailService;
        this.accessSecret = this.configService.getOrThrow('JWT_ACCESS_SECRET');
        this.refreshSecret = this.configService.getOrThrow('JWT_REFRESH_SECRET');
        this.accessExpiresIn = this.configService.get('JWT_ACCESS_EXPIRES_IN', '15m');
        this.refreshExpiresIn = this.configService.get('JWT_REFRESH_EXPIRES_IN', '7d');
        this.bcryptSaltRounds = Number(this.configService.get('BCRYPT_SALT_ROUNDS', '10'));
        this.signUpCodeTtlMs = this.parsePositiveNumber(this.configService.get('AUTH_SIGNUP_CODE_TTL_MS'), 10 * 60_000);
        this.signUpCodeResendCooldownMs = this.parsePositiveNumber(this.configService.get('AUTH_SIGNUP_CODE_RESEND_COOLDOWN_MS'), 60_000);
        this.signUpCodeMaxAttempts = this.parsePositiveNumber(this.configService.get('AUTH_SIGNUP_CODE_MAX_ATTEMPTS'), 5);
        this.signUpCodeLockDurationMs = this.parsePositiveNumber(this.configService.get('AUTH_SIGNUP_CODE_LOCK_DURATION_MS'), 15 * 60_000);
        this.signUpCodeLength = this.parseCodeLength(this.configService.get('AUTH_SIGNUP_CODE_LENGTH'), 6);
    }
    async startSignUp(dto) {
        const email = this.normalizeEmail(dto.email);
        const existingUser = await this.prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            throw new common_1.ConflictException('Este email ja esta em uso.');
        }
        const now = Date.now();
        const pending = await this.prisma.signupVerification.findUnique({
            where: { email },
        });
        if (pending) {
            this.ensureSignUpVerificationNotLocked(pending.lockedUntil);
            this.ensureSignUpResendAvailable(pending.resendAvailableAt);
        }
        const code = this.generateNumericCode();
        const codeHash = await bcrypt.hash(code, this.bcryptSaltRounds);
        const passwordHash = await bcrypt.hash(dto.password, this.bcryptSaltRounds);
        const expiresAt = new Date(now + this.signUpCodeTtlMs);
        const resendAvailableAt = new Date(now + this.signUpCodeResendCooldownMs);
        await this.prisma.signupVerification.upsert({
            where: { email },
            create: {
                email,
                name: dto.name.trim(),
                passwordHash,
                codeHash,
                expiresAt,
                resendAvailableAt,
            },
            update: {
                name: dto.name.trim(),
                passwordHash,
                codeHash,
                expiresAt,
                resendAvailableAt,
                attemptCount: 0,
                lockedUntil: null,
            },
        });
        await this.signUpMailService.sendSignUpCode({
            email,
            name: dto.name.trim(),
            code,
            expiresInMinutes: Math.ceil(this.signUpCodeTtlMs / 60_000),
        });
        return this.toSignUpChallengeResponse(email, expiresAt, resendAvailableAt, 'Enviamos um codigo de verificacao para seu email.');
    }
    async resendSignUpCode(dto) {
        const email = this.normalizeEmail(dto.email);
        const existingUser = await this.prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            throw new common_1.ConflictException('Este email ja esta em uso.');
        }
        const pending = await this.prisma.signupVerification.findUnique({
            where: { email },
        });
        if (!pending) {
            throw new common_1.BadRequestException('Nao existe cadastro pendente para este email.');
        }
        this.ensureSignUpVerificationNotLocked(pending.lockedUntil);
        this.ensureSignUpResendAvailable(pending.resendAvailableAt);
        const now = Date.now();
        const code = this.generateNumericCode();
        const codeHash = await bcrypt.hash(code, this.bcryptSaltRounds);
        const expiresAt = new Date(now + this.signUpCodeTtlMs);
        const resendAvailableAt = new Date(now + this.signUpCodeResendCooldownMs);
        await this.prisma.signupVerification.update({
            where: { email },
            data: {
                codeHash,
                expiresAt,
                resendAvailableAt,
                attemptCount: 0,
                lockedUntil: null,
            },
        });
        await this.signUpMailService.sendSignUpCode({
            email,
            name: pending.name,
            code,
            expiresInMinutes: Math.ceil(this.signUpCodeTtlMs / 60_000),
        });
        return this.toSignUpChallengeResponse(email, expiresAt, resendAvailableAt, 'Novo codigo enviado para seu email.');
    }
    async verifySignUp(dto) {
        const email = this.normalizeEmail(dto.email);
        const pending = await this.prisma.signupVerification.findUnique({
            where: { email },
        });
        if (!pending) {
            throw new common_1.UnauthorizedException('Codigo invalido ou expirado.');
        }
        this.ensureSignUpVerificationNotLocked(pending.lockedUntil);
        if (pending.expiresAt.getTime() <= Date.now()) {
            await this.prisma.signupVerification.delete({ where: { email } });
            throw new common_1.UnauthorizedException('Codigo expirado. Solicite um novo codigo para continuar.');
        }
        const codeMatches = await bcrypt.compare(dto.code, pending.codeHash);
        if (!codeMatches) {
            await this.registerInvalidSignUpCodeAttempt(email, pending.attemptCount);
            throw new common_1.UnauthorizedException('Codigo de verificacao invalido.');
        }
        const existingUser = await this.prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            await this.prisma.signupVerification.delete({ where: { email } });
            throw new common_1.ConflictException('Este email ja esta em uso.');
        }
        let user;
        try {
            user = await this.prisma.user.create({
                data: {
                    name: pending.name,
                    email: pending.email,
                    passwordHash: pending.passwordHash,
                },
            });
        }
        catch (error) {
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError
                && error.code === 'P2002') {
                throw new common_1.ConflictException('Este email ja esta em uso.');
            }
            throw error;
        }
        await this.prisma.signupVerification.delete({ where: { email } });
        return this.buildAuthResponse(user);
    }
    async login(dto) {
        const email = this.normalizeEmail(dto.email);
        this.loginAttemptsService.ensureCanAttempt(email);
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user) {
            this.loginAttemptsService.registerFailedAttempt(email);
            throw new common_1.UnauthorizedException('Email ou senha invalidos.');
        }
        const passwordMatch = await bcrypt.compare(dto.password, user.passwordHash);
        if (!passwordMatch) {
            this.loginAttemptsService.registerFailedAttempt(email);
            throw new common_1.UnauthorizedException('Email ou senha invalidos.');
        }
        this.loginAttemptsService.clearAttempts(email);
        return this.buildAuthResponse(user);
    }
    async refresh(refreshToken) {
        const payload = await this.verifyRefreshToken(refreshToken);
        const storedToken = await this.findRefreshToken(payload);
        if (!storedToken) {
            throw new common_1.UnauthorizedException('Refresh token invalido ou expirado.');
        }
        const hashMatch = await bcrypt.compare(refreshToken, storedToken.tokenHash);
        if (!hashMatch) {
            throw new common_1.UnauthorizedException('Refresh token invalido ou expirado.');
        }
        await this.prisma.refreshToken.update({
            where: { id: storedToken.id },
            data: { revokedAt: new Date() },
        });
        const user = await this.prisma.user.findUnique({
            where: { id: payload.sub },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Usuario nao encontrado.');
        }
        return this.buildAuthResponse(user);
    }
    async logout(refreshToken) {
        if (!refreshToken) {
            return { success: true };
        }
        try {
            const payload = await this.verifyRefreshToken(refreshToken);
            await this.prisma.refreshToken.updateMany({
                where: {
                    jti: payload.jti,
                    userId: payload.sub,
                    revokedAt: null,
                },
                data: { revokedAt: new Date() },
            });
        }
        catch {
        }
        return { success: true };
    }
    async getProfile(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Sessao invalida.');
        }
        return { user: this.toPublicUser(user) };
    }
    parsePositiveNumber(input, fallback) {
        const parsed = Number(input);
        if (!Number.isFinite(parsed) || parsed <= 0) {
            return fallback;
        }
        return parsed;
    }
    parseCodeLength(input, fallback) {
        const parsed = Math.floor(this.parsePositiveNumber(input, fallback));
        if (parsed < 4) {
            return 4;
        }
        if (parsed > 8) {
            return 8;
        }
        return parsed;
    }
    normalizeEmail(email) {
        return email.trim().toLowerCase();
    }
    toPublicUser(user) {
        return {
            id: user.id,
            name: user.name,
            email: user.email,
        };
    }
    generateNumericCode() {
        let code = '';
        for (let index = 0; index < this.signUpCodeLength; index += 1) {
            code += (0, crypto_1.randomInt)(0, 10).toString();
        }
        return code;
    }
    toSignUpChallengeResponse(email, expiresAt, resendAvailableAt, message) {
        const now = Date.now();
        return {
            success: true,
            message,
            email,
            expiresInSeconds: Math.max(1, Math.ceil((expiresAt.getTime() - now) / 1000)),
            resendAvailableInSeconds: Math.max(1, Math.ceil((resendAvailableAt.getTime() - now) / 1000)),
        };
    }
    ensureSignUpVerificationNotLocked(lockedUntil) {
        if (!lockedUntil) {
            return;
        }
        const now = Date.now();
        if (lockedUntil.getTime() <= now) {
            return;
        }
        const retryInSeconds = Math.max(1, Math.ceil((lockedUntil.getTime() - now) / 1000));
        throw new common_1.HttpException(`Muitas tentativas de verificacao. Tente novamente em ${retryInSeconds}s.`, common_1.HttpStatus.TOO_MANY_REQUESTS);
    }
    ensureSignUpResendAvailable(resendAvailableAt) {
        const now = Date.now();
        if (resendAvailableAt.getTime() <= now) {
            return;
        }
        const retryInSeconds = Math.max(1, Math.ceil((resendAvailableAt.getTime() - now) / 1000));
        throw new common_1.HttpException(`Aguarde ${retryInSeconds}s para solicitar um novo codigo.`, common_1.HttpStatus.TOO_MANY_REQUESTS);
    }
    async registerInvalidSignUpCodeAttempt(email, attemptCount) {
        const nextAttemptCount = attemptCount + 1;
        const lockNow = nextAttemptCount >= this.signUpCodeMaxAttempts;
        const lockedUntil = lockNow
            ? new Date(Date.now() + this.signUpCodeLockDurationMs)
            : null;
        await this.prisma.signupVerification.update({
            where: { email },
            data: {
                attemptCount: nextAttemptCount,
                lockedUntil,
            },
        });
        if (lockNow && lockedUntil) {
            const retryInSeconds = Math.max(1, Math.ceil((lockedUntil.getTime() - Date.now()) / 1000));
            throw new common_1.HttpException(`Muitas tentativas de verificacao. Tente novamente em ${retryInSeconds}s.`, common_1.HttpStatus.TOO_MANY_REQUESTS);
        }
    }
    async buildAuthResponse(user) {
        const tokens = await this.issueTokenPair(user);
        return {
            user: this.toPublicUser(user),
            ...tokens,
        };
    }
    async issueTokenPair(user) {
        const accessPayload = {
            sub: user.id,
            email: user.email,
            name: user.name,
            type: 'access',
        };
        const accessToken = await this.jwtService.signAsync(accessPayload, {
            secret: this.accessSecret,
            expiresIn: this.accessExpiresIn,
        });
        const refreshPayload = {
            sub: user.id,
            jti: (0, crypto_1.randomUUID)(),
            type: 'refresh',
        };
        const refreshToken = await this.jwtService.signAsync(refreshPayload, {
            secret: this.refreshSecret,
            expiresIn: this.refreshExpiresIn,
        });
        const refreshTokenHash = await bcrypt.hash(refreshToken, this.bcryptSaltRounds);
        const decoded = this.jwtService.decode(refreshToken);
        const expiresAt = decoded?.exp
            ? new Date(decoded.exp * 1000)
            : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        await this.prisma.refreshToken.create({
            data: {
                userId: user.id,
                jti: refreshPayload.jti,
                tokenHash: refreshTokenHash,
                expiresAt,
            },
        });
        return {
            accessToken,
            refreshToken,
        };
    }
    async verifyRefreshToken(refreshToken) {
        try {
            const payload = await this.jwtService.verifyAsync(refreshToken, {
                secret: this.refreshSecret,
            });
            if (payload.type !== 'refresh' || !payload.jti || !payload.sub) {
                throw new common_1.UnauthorizedException('Refresh token invalido.');
            }
            return payload;
        }
        catch {
            throw new common_1.UnauthorizedException('Refresh token invalido.');
        }
    }
    async findRefreshToken(payload) {
        const token = await this.prisma.refreshToken.findUnique({
            where: { jti: payload.jti },
        });
        if (!token) {
            return null;
        }
        if (token.userId !== payload.sub || token.revokedAt) {
            return null;
        }
        if (token.expiresAt.getTime() <= Date.now()) {
            return null;
        }
        return token;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        config_1.ConfigService,
        login_attempts_service_1.LoginAttemptsService,
        signup_mail_service_1.SignUpMailService])
], AuthService);
//# sourceMappingURL=auth.service.js.map