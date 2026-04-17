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
let LoginAttemptsService = class LoginAttemptsService {
    configService;
    attempts = new Map();
    maxFailedAttempts;
    attemptWindowMs;
    lockDurationMs;
    constructor(configService) {
        this.configService = configService;
        this.maxFailedAttempts = this.parsePositiveNumber(this.configService.get('AUTH_LOGIN_MAX_FAILED_ATTEMPTS'), 5);
        this.attemptWindowMs = this.parsePositiveNumber(this.configService.get('AUTH_LOGIN_ATTEMPT_WINDOW_MS'), 10 * 60_000);
        this.lockDurationMs = this.parsePositiveNumber(this.configService.get('AUTH_LOGIN_LOCK_DURATION_MS'), 15 * 60_000);
    }
    ensureCanAttempt(email) {
        const key = this.normalizeEmail(email);
        const state = this.attempts.get(key);
        if (!state) {
            return;
        }
        const now = Date.now();
        if (state.lockedUntil && state.lockedUntil > now) {
            const retryInSeconds = Math.ceil((state.lockedUntil - now) / 1000);
            throw new common_1.HttpException(`Muitas tentativas de login. Tente novamente em ${retryInSeconds}s.`, common_1.HttpStatus.TOO_MANY_REQUESTS);
        }
        if (state.lockedUntil && state.lockedUntil <= now) {
            this.attempts.delete(key);
            return;
        }
        if (now - state.windowStartedAt > this.attemptWindowMs) {
            this.attempts.delete(key);
        }
    }
    registerFailedAttempt(email) {
        const key = this.normalizeEmail(email);
        const current = this.attempts.get(key);
        const now = Date.now();
        if (!current || now - current.windowStartedAt > this.attemptWindowMs) {
            this.attempts.set(key, {
                failedCount: 1,
                windowStartedAt: now,
                lockedUntil: null,
            });
            return;
        }
        const failedCount = current.failedCount + 1;
        const shouldLock = failedCount >= this.maxFailedAttempts;
        this.attempts.set(key, {
            failedCount,
            windowStartedAt: current.windowStartedAt,
            lockedUntil: shouldLock ? now + this.lockDurationMs : null,
        });
    }
    clearAttempts(email) {
        this.attempts.delete(this.normalizeEmail(email));
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
};
exports.LoginAttemptsService = LoginAttemptsService;
exports.LoginAttemptsService = LoginAttemptsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], LoginAttemptsService);
//# sourceMappingURL=login-attempts.service.js.map