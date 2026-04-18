import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { ForgotPasswordConfirmDto } from './dto/forgot-password-confirm.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordRequestDto } from './dto/forgot-password-request.dto';
import { SignUpResendDto } from './dto/signup-resend.dto';
import { SignUpDto } from './dto/signup.dto';
import { SignUpVerifyDto } from './dto/signup-verify.dto';
import { LoginAttemptsService } from './login-attempts.service';
import { SignUpMailService } from './signup-mail.service';
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
export declare class AuthService {
    private readonly prisma;
    private readonly jwtService;
    private readonly configService;
    private readonly loginAttemptsService;
    private readonly signUpMailService;
    private readonly accessSecret;
    private readonly refreshSecret;
    private readonly accessExpiresIn;
    private readonly refreshExpiresIn;
    private readonly bcryptSaltRounds;
    private readonly signUpCodeTtlMs;
    private readonly signUpCodeResendCooldownMs;
    private readonly signUpCodeMaxAttempts;
    private readonly signUpCodeLockDurationMs;
    private readonly signUpCodeLength;
    private readonly passwordResetTokenTtlMs;
    constructor(prisma: PrismaService, jwtService: JwtService, configService: ConfigService, loginAttemptsService: LoginAttemptsService, signUpMailService: SignUpMailService);
    startSignUp(dto: SignUpDto): Promise<SignUpChallengeResponse>;
    resendSignUpCode(dto: SignUpResendDto): Promise<SignUpChallengeResponse>;
    verifySignUp(dto: SignUpVerifyDto): Promise<AuthResponse>;
    requestPasswordRecovery(dto: ForgotPasswordRequestDto): Promise<ActionResponse>;
    confirmPasswordRecovery(dto: ForgotPasswordConfirmDto): Promise<ActionResponse>;
    login(dto: LoginDto): Promise<AuthResponse>;
    refresh(refreshToken: string): Promise<AuthResponse>;
    logout(refreshToken?: string): Promise<{
        success: boolean;
    }>;
    getProfile(userId: string): Promise<{
        user: PublicUser;
    }>;
    private parsePositiveNumber;
    private parseCodeLength;
    private normalizeEmail;
    private hashOpaqueToken;
    private toPublicUser;
    private generateNumericCode;
    private toSignUpChallengeResponse;
    private ensureSignUpVerificationNotLocked;
    private ensureSignUpResendAvailable;
    private registerInvalidSignUpCodeAttempt;
    private buildAuthResponse;
    private issueTokenPair;
    private verifyRefreshToken;
    private findRefreshToken;
}
