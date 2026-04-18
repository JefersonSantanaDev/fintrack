import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LoginAttemptsService {
  private readonly enabled: boolean;
  private readonly maxFailedAttempts: number;
  private readonly attemptWindowMs: number;
  private readonly lockDurationMs: number;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.enabled = this.parseBoolean(
      this.configService.get<string>('AUTH_LOGIN_LOCK_ENABLED'),
      true,
    );
    this.maxFailedAttempts = this.parsePositiveNumber(
      this.configService.get<string>('AUTH_LOGIN_MAX_FAILED_ATTEMPTS'),
      5,
    );
    this.attemptWindowMs = this.parsePositiveNumber(
      this.configService.get<string>('AUTH_LOGIN_ATTEMPT_WINDOW_MS'),
      10 * 60_000,
    );
    this.lockDurationMs = this.parsePositiveNumber(
      this.configService.get<string>('AUTH_LOGIN_LOCK_DURATION_MS'),
      15 * 60_000,
    );
  }

  async ensureCanAttempt(email: string) {
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
      throw new HttpException(
        `Muitas tentativas de login. Tente novamente em ${retryInSeconds}s.`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
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

  async registerFailedAttempt(email: string) {
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

  async clearAttempts(email: string) {
    if (!this.enabled) {
      return;
    }

    await this.prisma.loginAttempt.deleteMany({
      where: { email: this.normalizeEmail(email) },
    });
  }

  private normalizeEmail(email: string) {
    return email.trim().toLowerCase();
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
}
