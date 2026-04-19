import { ConfigService } from '@nestjs/config';
import type { FastifyReply, FastifyRequest } from 'fastify';
export declare class AuthRefreshCookieService {
    private readonly configService;
    private readonly refreshCookieName;
    private readonly refreshCookieOptions;
    constructor(configService: ConfigService);
    setRefreshCookie(reply: FastifyReply, refreshToken: string): void;
    clearRefreshCookie(reply: FastifyReply): void;
    readRefreshTokenFromCookie(request: FastifyRequest): string;
    readRefreshTokenFromCookieIfPresent(request: FastifyRequest): string;
    private parsePositiveNumber;
    private parseBoolean;
    private parseSameSite;
}
