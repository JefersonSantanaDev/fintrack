import { ConfigService } from '@nestjs/config';
import { AuthResponseDto, LogoutResponseDto, MeResponseDto } from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';
import { SignUpDto } from './dto/signup.dto';
import { AuthService } from './auth.service';
import type { AuthenticatedUser } from './types/auth-user.type';
import type { FastifyReply, FastifyRequest } from 'fastify';
export declare class AuthController {
    private readonly authService;
    private readonly configService;
    private readonly refreshCookieName;
    private readonly refreshCookieOptions;
    constructor(authService: AuthService, configService: ConfigService);
    private parsePositiveNumber;
    private parseBoolean;
    private parseSameSite;
    private setRefreshCookie;
    private clearRefreshCookie;
    private readRefreshTokenFromCookie;
    private readRefreshTokenFromCookieIfPresent;
    signUp(dto: SignUpDto, reply: FastifyReply): Promise<AuthResponseDto>;
    login(dto: LoginDto, reply: FastifyReply): Promise<AuthResponseDto>;
    refresh(request: FastifyRequest, reply: FastifyReply): Promise<AuthResponseDto>;
    logout(request: FastifyRequest, reply: FastifyReply): Promise<LogoutResponseDto>;
    me(user: AuthenticatedUser): Promise<MeResponseDto>;
}
