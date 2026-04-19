import type { FastifyReply, FastifyRequest } from 'fastify';
import { AuthRefreshCookieService } from './auth-refresh-cookie.service';
import { AuthService } from './auth.service';
import { AuthResponseDto, LogoutResponseDto, MeResponseDto } from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';
import type { AuthenticatedUser } from './types/auth-user.type';
export declare class AuthSessionController {
    private readonly authService;
    private readonly refreshCookieService;
    constructor(authService: AuthService, refreshCookieService: AuthRefreshCookieService);
    login(dto: LoginDto, reply: FastifyReply): Promise<AuthResponseDto>;
    refresh(request: FastifyRequest, reply: FastifyReply): Promise<AuthResponseDto>;
    logout(request: FastifyRequest, reply: FastifyReply): Promise<LogoutResponseDto>;
    me(user: AuthenticatedUser): Promise<MeResponseDto>;
}
