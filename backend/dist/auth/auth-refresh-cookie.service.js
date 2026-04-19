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
exports.AuthRefreshCookieService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let AuthRefreshCookieService = class AuthRefreshCookieService {
    configService;
    refreshCookieName;
    refreshCookieOptions;
    constructor(configService) {
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
};
exports.AuthRefreshCookieService = AuthRefreshCookieService;
exports.AuthRefreshCookieService = AuthRefreshCookieService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], AuthRefreshCookieService);
//# sourceMappingURL=auth-refresh-cookie.service.js.map