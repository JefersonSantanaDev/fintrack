import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { FastifyReply, FastifyRequest } from 'fastify';
import type { CookieSerializeOptions } from '@fastify/cookie';

@Injectable()
export class AuthRefreshCookieService {
  private readonly refreshCookieName: string;
  private readonly refreshCookieOptions: CookieSerializeOptions;

  constructor(private readonly configService: ConfigService) {
    this.refreshCookieName = this.configService.get<string>(
      'AUTH_REFRESH_COOKIE_NAME',
      'fintrack_refresh_token',
    );

    const refreshCookieMaxAgeMs = this.parsePositiveNumber(
      this.configService.get<string>('AUTH_REFRESH_COOKIE_MAX_AGE_MS'),
      7 * 24 * 60 * 60 * 1000,
    );

    const refreshCookieSecure = this.parseBoolean(
      this.configService.get<string>('AUTH_REFRESH_COOKIE_SECURE'),
      false,
    );

    const refreshCookiePath = this.configService.get<string>(
      'AUTH_REFRESH_COOKIE_PATH',
      '/api/auth',
    );

    this.refreshCookieOptions = {
      httpOnly: true,
      secure: refreshCookieSecure,
      sameSite: this.parseSameSite(
        this.configService.get<string>('AUTH_REFRESH_COOKIE_SAME_SITE'),
      ),
      path: refreshCookiePath,
      maxAge: Math.ceil(refreshCookieMaxAgeMs / 1000),
    };
  }

  setRefreshCookie(reply: FastifyReply, refreshToken: string) {
    reply.setCookie(this.refreshCookieName, refreshToken, this.refreshCookieOptions);
  }

  clearRefreshCookie(reply: FastifyReply) {
    reply.clearCookie(this.refreshCookieName, this.refreshCookieOptions);
  }

  readRefreshTokenFromCookie(request: FastifyRequest) {
    const cookies = (request as FastifyRequest & { cookies?: Record<string, string> }).cookies;
    const refreshToken = cookies?.[this.refreshCookieName];

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token ausente ou invalido.');
    }

    return refreshToken;
  }

  readRefreshTokenFromCookieIfPresent(request: FastifyRequest) {
    const cookies = (request as FastifyRequest & { cookies?: Record<string, string> }).cookies;
    return cookies?.[this.refreshCookieName] ?? null;
  }

  private parsePositiveNumber(input: string | undefined, fallback: number) {
    const parsed = Number(input);

    if (!Number.isFinite(parsed) || parsed <= 0) {
      return fallback;
    }

    return parsed;
  }

  private parseBoolean(input: string | undefined, fallback: boolean) {
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

  private parseSameSite(value: string | undefined): CookieSerializeOptions['sameSite'] {
    if (!value) {
      return 'lax';
    }

    const normalized = value.trim().toLowerCase();

    if (normalized === 'strict' || normalized === 'none' || normalized === 'lax') {
      return normalized;
    }

    return 'lax';
  }
}
