import type { FastifyReply } from 'fastify';
import { AuthRefreshCookieService } from './auth-refresh-cookie.service';
import { AuthService } from './auth.service';
import { AuthResponseDto, SignUpChallengeResponseDto } from './dto/auth-response.dto';
import { SignUpDto } from './dto/signup.dto';
import { SignUpResendDto } from './dto/signup-resend.dto';
import { SignUpVerifyDto } from './dto/signup-verify.dto';
export declare class AuthSignupController {
    private readonly authService;
    private readonly refreshCookieService;
    constructor(authService: AuthService, refreshCookieService: AuthRefreshCookieService);
    signUpStart(dto: SignUpDto): Promise<SignUpChallengeResponseDto>;
    signUpVerify(dto: SignUpVerifyDto, reply: FastifyReply): Promise<AuthResponseDto>;
    signUpResend(dto: SignUpResendDto): Promise<SignUpChallengeResponseDto>;
}
