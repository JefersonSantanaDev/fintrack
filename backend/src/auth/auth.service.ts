import {
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Prisma, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { createHash, randomBytes, randomInt, randomUUID } from 'crypto';
import type { StringValue } from 'ms';
import { PrismaService } from '../prisma/prisma.service';
import { ForgotPasswordConfirmDto } from './dto/forgot-password-confirm.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordRequestDto } from './dto/forgot-password-request.dto';
import { SignUpResendDto } from './dto/signup-resend.dto';
import { SignUpDto } from './dto/signup.dto';
import { SignUpVerifyDto } from './dto/signup-verify.dto';
import { LoginAttemptsService } from './login-attempts.service';
import { SignUpMailService } from './signup-mail.service';
import {
  AccessTokenPayload,
  RefreshTokenPayload,
} from './types/token-payload.type';

export interface PublicUser {
  id: string;
  name: string;
  email: string;
}

export interface AuthResponse {
  user: PublicUser;
  accessToken: string;
  refreshToken: string;
}

export interface SignUpChallengeResponse {
  success: boolean;
  message: string;
  email: string;
  expiresInSeconds: number;
  resendAvailableInSeconds: number;
}

export interface ActionResponse {
  success: boolean;
  message: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly accessSecret: string;
  private readonly refreshSecret: string;
  private readonly accessExpiresIn: StringValue | number;
  private readonly refreshExpiresIn: StringValue | number;
  private readonly bcryptSaltRounds: number;

  private readonly signUpCodeTtlMs: number;
  private readonly signUpCodeResendCooldownMs: number;
  private readonly signUpCodeMaxAttempts: number;
  private readonly signUpCodeLockDurationMs: number;
  private readonly signUpCodeLength: number;
  private readonly passwordResetTokenTtlMs: number;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly loginAttemptsService: LoginAttemptsService,
    private readonly signUpMailService: SignUpMailService,
  ) {
    this.accessSecret = this.configService.getOrThrow<string>('JWT_ACCESS_SECRET');
    this.refreshSecret = this.configService.getOrThrow<string>(
      'JWT_REFRESH_SECRET',
    );
    this.accessExpiresIn = this.configService.get<StringValue>(
      'JWT_ACCESS_EXPIRES_IN',
      '15m' as StringValue,
    );
    this.refreshExpiresIn = this.configService.get<StringValue>(
      'JWT_REFRESH_EXPIRES_IN',
      '7d' as StringValue,
    );
    this.bcryptSaltRounds = Number(
      this.configService.get<string>('BCRYPT_SALT_ROUNDS', '10'),
    );

    this.signUpCodeTtlMs = this.parsePositiveNumber(
      this.configService.get<string>('AUTH_SIGNUP_CODE_TTL_MS'),
      10 * 60_000,
    );
    this.signUpCodeResendCooldownMs = this.parsePositiveNumber(
      this.configService.get<string>('AUTH_SIGNUP_CODE_RESEND_COOLDOWN_MS'),
      60_000,
    );
    this.signUpCodeMaxAttempts = this.parsePositiveNumber(
      this.configService.get<string>('AUTH_SIGNUP_CODE_MAX_ATTEMPTS'),
      5,
    );
    this.signUpCodeLockDurationMs = this.parsePositiveNumber(
      this.configService.get<string>('AUTH_SIGNUP_CODE_LOCK_DURATION_MS'),
      15 * 60_000,
    );
    this.signUpCodeLength = this.parseCodeLength(
      this.configService.get<string>('AUTH_SIGNUP_CODE_LENGTH'),
      6,
    );
    this.passwordResetTokenTtlMs = this.parsePositiveNumber(
      this.configService.get<string>('AUTH_PASSWORD_RESET_TOKEN_TTL_MS'),
      15 * 60_000,
    );
  }

  async startSignUp(dto: SignUpDto): Promise<SignUpChallengeResponse> {
    const email = this.normalizeEmail(dto.email);
    const existingUser = await this.prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      throw new ConflictException('Este email ja esta em uso.');
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

    return this.toSignUpChallengeResponse(
      email,
      expiresAt,
      resendAvailableAt,
      'Enviamos um codigo de verificacao para seu email.',
    );
  }

  async resendSignUpCode(dto: SignUpResendDto): Promise<SignUpChallengeResponse> {
    const email = this.normalizeEmail(dto.email);
    const existingUser = await this.prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      throw new ConflictException('Este email ja esta em uso.');
    }

    const pending = await this.prisma.signupVerification.findUnique({
      where: { email },
    });

    if (!pending) {
      throw new BadRequestException('Nao existe cadastro pendente para este email.');
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

    return this.toSignUpChallengeResponse(
      email,
      expiresAt,
      resendAvailableAt,
      'Novo codigo enviado para seu email.',
    );
  }

  async verifySignUp(dto: SignUpVerifyDto): Promise<AuthResponse> {
    const email = this.normalizeEmail(dto.email);
    const pending = await this.prisma.signupVerification.findUnique({
      where: { email },
    });

    if (!pending) {
      throw new UnauthorizedException('Codigo invalido ou expirado.');
    }

    this.ensureSignUpVerificationNotLocked(pending.lockedUntil);

    if (pending.expiresAt.getTime() <= Date.now()) {
      await this.prisma.signupVerification.delete({ where: { email } });
      throw new UnauthorizedException(
        'Codigo expirado. Solicite um novo codigo para continuar.',
      );
    }

    const codeMatches = await bcrypt.compare(dto.code, pending.codeHash);

    if (!codeMatches) {
      await this.registerInvalidSignUpCodeAttempt(email, pending.attemptCount);
      throw new UnauthorizedException('Codigo de verificacao invalido.');
    }

    const existingUser = await this.prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      await this.prisma.signupVerification.delete({ where: { email } });
      throw new ConflictException('Este email ja esta em uso.');
    }

    let user: User;

    try {
      user = await this.prisma.user.create({
        data: {
          name: pending.name,
          email: pending.email,
          passwordHash: pending.passwordHash,
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError
        && error.code === 'P2002'
      ) {
        throw new ConflictException('Este email ja esta em uso.');
      }

      throw error;
    }

    await this.prisma.signupVerification.delete({ where: { email } });

    return this.buildAuthResponse(user);
  }

  async requestPasswordRecovery(
    dto: ForgotPasswordRequestDto,
  ): Promise<ActionResponse> {
    const email = this.normalizeEmail(dto.email);
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (user) {
      try {
        const now = Date.now();
        const token = randomBytes(32).toString('hex');
        const tokenHash = this.hashOpaqueToken(token);
        const expiresAt = new Date(now + this.passwordResetTokenTtlMs);

        await this.prisma.$transaction(async tx => {
          await tx.passwordResetToken.updateMany({
            where: {
              userId: user.id,
              usedAt: null,
            },
            data: {
              usedAt: new Date(now),
            },
          });

          await tx.passwordResetToken.create({
            data: {
              userId: user.id,
              tokenHash,
              expiresAt,
            },
          });
        });

        await this.signUpMailService.sendPasswordRecoveryRequest({
          email: user.email,
          name: user.name,
          token,
          expiresInMinutes: Math.ceil(this.passwordResetTokenTtlMs / 60_000),
        });
      } catch (error) {
        this.logger.error(
          `Falha interna no fluxo de recuperacao de senha para ${this.maskEmailForLog(user.email)}.`,
          error instanceof Error ? error.stack : undefined,
        );
      }
    }

    return {
      success: true,
      message:
        'Se o email estiver cadastrado, enviaremos as instrucoes de recuperacao.',
    };
  }

  async confirmPasswordRecovery(
    dto: ForgotPasswordConfirmDto,
  ): Promise<ActionResponse> {
    const tokenHash = this.hashOpaqueToken(dto.token.trim());
    const now = new Date();
    const passwordHash = await bcrypt.hash(dto.password, this.bcryptSaltRounds);

    await this.prisma.$transaction(async tx => {
      const consumeResult = await tx.passwordResetToken.updateMany({
        where: {
          tokenHash,
          usedAt: null,
          expiresAt: {
            gt: now,
          },
        },
        data: {
          usedAt: now,
        },
      });

      if (consumeResult.count !== 1) {
        throw new UnauthorizedException('Link de recuperacao invalido ou expirado.');
      }

      const consumedResetToken = await tx.passwordResetToken.findUnique({
        where: { tokenHash },
        select: {
          id: true,
          userId: true,
        },
      });

      if (!consumedResetToken) {
        throw new UnauthorizedException('Link de recuperacao invalido ou expirado.');
      }

      await tx.user.update({
        where: { id: consumedResetToken.userId },
        data: { passwordHash },
      });

      await tx.passwordResetToken.updateMany({
        where: {
          userId: consumedResetToken.userId,
          usedAt: null,
          id: { not: consumedResetToken.id },
        },
        data: { usedAt: now },
      });

      await tx.refreshToken.updateMany({
        where: {
          userId: consumedResetToken.userId,
          revokedAt: null,
        },
        data: { revokedAt: now },
      });
    });

    return {
      success: true,
      message: 'Senha atualizada com sucesso. Faca login novamente.',
    };
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const email = this.normalizeEmail(dto.email);
    await this.loginAttemptsService.ensureCanAttempt(email);

    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      await this.loginAttemptsService.registerFailedAttempt(email);
      throw new UnauthorizedException('Email ou senha invalidos.');
    }

    const passwordMatch = await bcrypt.compare(dto.password, user.passwordHash);

    if (!passwordMatch) {
      await this.loginAttemptsService.registerFailedAttempt(email);
      throw new UnauthorizedException('Email ou senha invalidos.');
    }

    await this.loginAttemptsService.clearAttempts(email);
    return this.buildAuthResponse(user);
  }

  async refresh(refreshToken: string): Promise<AuthResponse> {
    const payload = await this.verifyRefreshToken(refreshToken);
    const storedToken = await this.findRefreshToken(payload);

    if (!storedToken) {
      throw new UnauthorizedException('Refresh token invalido ou expirado.');
    }

    const hashMatch = await bcrypt.compare(refreshToken, storedToken.tokenHash);

    if (!hashMatch) {
      throw new UnauthorizedException('Refresh token invalido ou expirado.');
    }

    await this.prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revokedAt: new Date() },
    });

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user) {
      throw new UnauthorizedException('Usuario nao encontrado.');
    }

    return this.buildAuthResponse(user);
  }

  async logout(refreshToken?: string) {
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
    } catch {
      // Logout idempotente para nao quebrar o cliente em caso de token invalido.
    }

    return { success: true };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('Sessao invalida.');
    }

    return { user: this.toPublicUser(user) };
  }

  private parsePositiveNumber(input: string | undefined, fallback: number) {
    const parsed = Number(input);

    if (!Number.isFinite(parsed) || parsed <= 0) {
      return fallback;
    }

    return parsed;
  }

  private parseCodeLength(input: string | undefined, fallback: number) {
    const parsed = Math.floor(this.parsePositiveNumber(input, fallback));

    if (parsed < 4) {
      return 4;
    }

    if (parsed > 8) {
      return 8;
    }

    return parsed;
  }

  private normalizeEmail(email: string) {
    return email.trim().toLowerCase();
  }

  private maskEmailForLog(email: string) {
    const [localPart = '', domainPart = ''] = email.split('@');

    if (!domainPart) {
      return '***';
    }

    const visiblePrefix = localPart.slice(0, 2);
    return `${visiblePrefix}***@${domainPart}`;
  }

  private hashOpaqueToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }

  private toPublicUser(user: User): PublicUser {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
    };
  }

  private generateNumericCode() {
    let code = '';

    for (let index = 0; index < this.signUpCodeLength; index += 1) {
      code += randomInt(0, 10).toString();
    }

    return code;
  }

  private toSignUpChallengeResponse(
    email: string,
    expiresAt: Date,
    resendAvailableAt: Date,
    message: string,
  ): SignUpChallengeResponse {
    const now = Date.now();

    return {
      success: true,
      message,
      email,
      expiresInSeconds: Math.max(1, Math.ceil((expiresAt.getTime() - now) / 1000)),
      resendAvailableInSeconds: Math.max(
        1,
        Math.ceil((resendAvailableAt.getTime() - now) / 1000),
      ),
    };
  }

  private ensureSignUpVerificationNotLocked(lockedUntil: Date | null) {
    if (!lockedUntil) {
      return;
    }

    const now = Date.now();

    if (lockedUntil.getTime() <= now) {
      return;
    }

    const retryInSeconds = Math.max(
      1,
      Math.ceil((lockedUntil.getTime() - now) / 1000),
    );

    throw new HttpException(
      `Muitas tentativas de verificacao. Tente novamente em ${retryInSeconds}s.`,
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }

  private ensureSignUpResendAvailable(resendAvailableAt: Date) {
    const now = Date.now();

    if (resendAvailableAt.getTime() <= now) {
      return;
    }

    const retryInSeconds = Math.max(
      1,
      Math.ceil((resendAvailableAt.getTime() - now) / 1000),
    );

    throw new HttpException(
      `Aguarde ${retryInSeconds}s para solicitar um novo codigo.`,
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }

  private async registerInvalidSignUpCodeAttempt(
    email: string,
    attemptCount: number,
  ) {
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
      const retryInSeconds = Math.max(
        1,
        Math.ceil((lockedUntil.getTime() - Date.now()) / 1000),
      );

      throw new HttpException(
        `Muitas tentativas de verificacao. Tente novamente em ${retryInSeconds}s.`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }

  private async buildAuthResponse(user: User): Promise<AuthResponse> {
    const tokens = await this.issueTokenPair(user);

    return {
      user: this.toPublicUser(user),
      ...tokens,
    };
  }

  private async issueTokenPair(user: User) {
    const accessPayload: AccessTokenPayload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      type: 'access',
    };

    const accessToken = await this.jwtService.signAsync(accessPayload, {
      secret: this.accessSecret,
      expiresIn: this.accessExpiresIn,
    });

    const refreshPayload: RefreshTokenPayload = {
      sub: user.id,
      jti: randomUUID(),
      type: 'refresh',
    };

    const refreshToken = await this.jwtService.signAsync(refreshPayload, {
      secret: this.refreshSecret,
      expiresIn: this.refreshExpiresIn,
    });

    const refreshTokenHash = await bcrypt.hash(
      refreshToken,
      this.bcryptSaltRounds,
    );

    const decoded = this.jwtService.decode(refreshToken) as
      | { exp?: number }
      | null;
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

  private async verifyRefreshToken(
    refreshToken: string,
  ): Promise<RefreshTokenPayload> {
    try {
      const payload = await this.jwtService.verifyAsync<RefreshTokenPayload>(
        refreshToken,
        {
          secret: this.refreshSecret,
        },
      );

      if (payload.type !== 'refresh' || !payload.jti || !payload.sub) {
        throw new UnauthorizedException('Refresh token invalido.');
      }

      return payload;
    } catch {
      throw new UnauthorizedException('Refresh token invalido.');
    }
  }

  private async findRefreshToken(payload: RefreshTokenPayload) {
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
}
