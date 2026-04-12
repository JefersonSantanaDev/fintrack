import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import type { StringValue } from 'ms';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { LogoutDto } from './dto/logout.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { SignUpDto } from './dto/signup.dto';
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

@Injectable()
export class AuthService {
  private readonly accessSecret: string;
  private readonly refreshSecret: string;
  private readonly accessExpiresIn: StringValue | number;
  private readonly refreshExpiresIn: StringValue | number;
  private readonly bcryptSaltRounds: number;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
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
  }

  async signUp(dto: SignUpDto): Promise<AuthResponse> {
    const email = this.normalizeEmail(dto.email);
    const existingUser = await this.prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      throw new ConflictException('Este email ja esta em uso.');
    }

    const passwordHash = await bcrypt.hash(dto.password, this.bcryptSaltRounds);

    const user = await this.prisma.user.create({
      data: {
        name: dto.name.trim(),
        email,
        passwordHash,
      },
    });

    return this.buildAuthResponse(user);
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const email = this.normalizeEmail(dto.email);
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new UnauthorizedException('Email ou senha invalidos.');
    }

    const passwordMatch = await bcrypt.compare(dto.password, user.passwordHash);

    if (!passwordMatch) {
      throw new UnauthorizedException('Email ou senha invalidos.');
    }

    return this.buildAuthResponse(user);
  }

  async refresh(dto: RefreshTokenDto): Promise<AuthResponse> {
    const payload = await this.verifyRefreshToken(dto.refreshToken);
    const storedToken = await this.findRefreshToken(payload);

    if (!storedToken) {
      throw new UnauthorizedException('Refresh token invalido ou expirado.');
    }

    const hashMatch = await bcrypt.compare(dto.refreshToken, storedToken.tokenHash);

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

  async logout(dto: LogoutDto) {
    try {
      const payload = await this.verifyRefreshToken(dto.refreshToken);

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

  private normalizeEmail(email: string) {
    return email.trim().toLowerCase();
  }

  private toPublicUser(user: User): PublicUser {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
    };
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
