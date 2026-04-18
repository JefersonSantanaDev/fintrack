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
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginAttemptsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../prisma/prisma.service");
let LoginAttemptsService = class LoginAttemptsService {
    configService;
    prisma;
    enabled;
    maxFailedAttempts;
    attemptWindowMs;
    lockDurationMs;
    constructor(configService, prisma) {
        this.configService = configService;
        this.prisma = prisma;
        this.enabled = this.parseBoolean(this.configService.get('AUTH_LOGIN_LOCK_ENABLED'), true);
        this.maxFailedAttempts = this.parsePositiveNumber(this.configService.get('AUTH_LOGIN_MAX_FAILED_ATTEMPTS'), 5);
        this.attemptWindowMs = this.parsePositiveNumber(this.configService.get('AUTH_LOGIN_ATTEMPT_WINDOW_MS'), 10 * 60_000);
        this.lockDurationMs = this.parsePositiveNumber(this.configService.get('AUTH_LOGIN_LOCK_DURATION_MS'), 15 * 60_000);
    }
    async ensureCanAttempt(email) {
        if (!this.enabled) {
            return;
        }
        const key = this.normalizeEmail(email);
        const state = await this.prisma.loginAttempt.findUnique({
            where: { email: key },
        });
        if (!state) {
            return;
        }
        const nowMs = Date.now();
        if (state.lockedUntil && state.lockedUntil.getTime() > nowMs) {
            const retryInSeconds = Math.ceil((state.lockedUntil.getTime() - nowMs) / 1000);
            throw new common_1.HttpException(`Muitas tentativas de login. Tente novamente em ${retryInSeconds}s.`, common_1.HttpStatus.TOO_MANY_REQUESTS);
        }
        if (state.lockedUntil && state.lockedUntil.getTime() <= nowMs) {
            await this.prisma.loginAttempt.deleteMany({
                where: { email: key },
            });
            return;
        }
        if (nowMs - state.windowStartedAt.getTime() > this.attemptWindowMs) {
            await this.prisma.loginAttempt.deleteMany({
                where: { email: key },
            });
        }
    }
    async registerFailedAttempt(email) {
        if (!this.enabled) {
            return;
        }
        const key = this.normalizeEmail(email);
        const current = await this.prisma.loginAttempt.findUnique({
            where: { email: key },
        });
        const nowMs = Date.now();
        if (!current || nowMs - current.windowStartedAt.getTime() > this.attemptWindowMs) {
            await this.prisma.loginAttempt.upsert({
                where: { email: key },
                create: {
                    email: key,
                    failedCount: 1,
                    windowStartedAt: new Date(nowMs),
                    lockedUntil: null,
                },
                update: {
                    failedCount: 1,
                    windowStartedAt: new Date(nowMs),
                    lockedUntil: null,
                },
            });
            return;
        }
        const failedCount = current.failedCount + 1;
        const shouldLock = failedCount >= this.maxFailedAttempts;
        await this.prisma.loginAttempt.update({
            where: { email: key },
            data: {
                failedCount,
                windowStartedAt: current.windowStartedAt,
                lockedUntil: shouldLock ? new Date(nowMs + this.lockDurationMs) : null,
            },
        });
    }
    async clearAttempts(email) {
        if (!this.enabled) {
            return;
        }
        await this.prisma.loginAttempt.deleteMany({
            where: { email: this.normalizeEmail(email) },
        });
    }
    normalizeEmail(email) {
        return email.trim().toLowerCase();
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
};
exports.LoginAttemptsService = LoginAttemptsService;
exports.LoginAttemptsService = LoginAttemptsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        prisma_service_1.PrismaService])
], LoginAttemptsService);
//# sourceMappingURL=login-attempts.service.js.map