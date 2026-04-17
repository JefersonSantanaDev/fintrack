import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface LoginAttemptState {
  failedCount: number;
  windowStartedAt: number;
  lockedUntil: number | null;
}

@Injectable()
export class LoginAttemptsService {
  private readonly attempts = new Map<string, LoginAttemptState>();
  private readonly maxFailedAttempts: number;
  private readonly attemptWindowMs: number;
  private readonly lockDurationMs: number;

  constructor(private readonly configService: ConfigService) {
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

  ensureCanAttempt(email: string) {
    const key = this.normalizeEmail(email);
    const state = this.attempts.get(key);

    if (!state) {
      return;
    }

    const now = Date.now();

    if (state.lockedUntil && state.lockedUntil > now) {
      const retryInSeconds = Math.ceil((state.lockedUntil - now) / 1000);
      throw new HttpException(
        `Muitas tentativas de login. Tente novamente em ${retryInSeconds}s.`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    if (state.lockedUntil && state.lockedUntil <= now) {
      this.attempts.delete(key);
      return;
    }

    if (now - state.windowStartedAt > this.attemptWindowMs) {
      this.attempts.delete(key);
    }
  }

  registerFailedAttempt(email: string) {
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

  clearAttempts(email: string) {
    this.attempts.delete(this.normalizeEmail(email));
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
}
